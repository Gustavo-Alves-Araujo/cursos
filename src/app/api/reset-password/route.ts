import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Rate limiting simples (em produção, use Redis ou similar)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS = 3; // Máximo 3 tentativas por IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  // Reset contador se passou do tempo limite
  if (now - userLimit.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  // Verificar se excedeu o limite
  if (userLimit.count >= MAX_ATTEMPTS) {
    return false;
  }

  // Incrementar contador
  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting por IP
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
        { status: 429 }
      );
    }

    const { email, newPassword, token } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email e nova senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Token é obrigatório para reset de senha
    if (!token) {
      return NextResponse.json(
        { error: 'Token de reset é obrigatório' },
        { status: 400 }
      );
    }

    // Inicializar Supabase Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Buscar usuário pelo email
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error('Erro ao buscar usuários:', userError);
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      );
    }

    const user = users.users.find(u => u.email === email);

    if (!user) {
      // Log tentativa de reset para email inexistente
      console.warn(`Tentativa de reset de senha para email inexistente: ${email} - IP: ${ip}`);
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Validar token de reset
    const userResetToken = user.user_metadata?.reset_token;
    const tokenExpires = user.user_metadata?.reset_token_expires;

    if (!userResetToken || userResetToken !== token) {
      console.warn(`Token inválido para reset: ${email} - IP: ${ip} - Token fornecido: ${token}`);
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }

    // Verificar se o token não expirou
    if (tokenExpires && new Date(tokenExpires) < new Date()) {
      console.warn(`Token expirado para reset: ${email} - IP: ${ip}`);
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 400 }
      );
    }

    // Log da tentativa de reset
    console.log(`Tentativa de reset de senha para: ${email} - IP: ${ip} - User ID: ${user.id}`);

    // Atualizar senha usando Admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        password: newPassword,
        user_metadata: {
          ...user.user_metadata,
          needs_password_reset: false,
          reset_token: null,
          reset_token_expires: null
        }
      }
    );

    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar senha' },
        { status: 500 }
      );
    }

    console.log(`Senha atualizada com sucesso para: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Senha atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro no endpoint de reset de senha:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
