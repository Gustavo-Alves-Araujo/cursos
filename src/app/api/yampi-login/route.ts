import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Inicializar Supabase Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verificar se o usuário existe
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Erro ao listar usuários:', listError);
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      );
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Email não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se precisa redefinir senha
    if (!user.user_metadata?.needs_password_reset) {
      return NextResponse.json(
        { error: 'Este email já tem uma senha definida' },
        { status: 400 }
      );
    }

    // Buscar a senha temporária do usuário
    // Como não podemos recuperar a senha original, vamos gerar uma nova temporária
    const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-4);
    
    // Atualizar a senha do usuário com uma nova temporária
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: tempPassword
    });

    if (updateError) {
      console.error('Erro ao atualizar senha temporária:', updateError);
      return NextResponse.json(
        { error: 'Erro ao gerar acesso temporário' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      tempPassword: tempPassword,
      message: 'Acesso temporário gerado com sucesso'
    });

  } catch (error) {
    console.error('Erro na API yampi-login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
