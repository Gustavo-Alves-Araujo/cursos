import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface UserUpdateData {
  role?: string;
  cpf?: string;
}

// Função para gerar senha temporária fixa
function generateTemporaryPassword(): string {
  return '123123';
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, cpf, role = 'student' } = await request.json();

    // Validação básica
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Inicializar Supabase Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verificar se o usuário já existe
    const { data: existingUsers, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error('Erro ao verificar usuários existentes:', userError);
      return NextResponse.json(
        { error: 'Erro ao verificar usuários existentes' },
        { status: 500 }
      );
    }

    const existingUser = existingUsers.users.find(user => user.email === email);

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário com este email já existe' },
        { status: 400 }
      );
    }

    // Gerar senha temporária fixa
    const temporaryPassword = generateTemporaryPassword();
    
    // Criar novo usuário
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      user_metadata: {
        name,
        cpf: cpf || null,
        needs_password_reset: true
      },
      email_confirm: true // Confirmar email automaticamente
    });

    console.log('Usuário criado:', newUser?.user?.id, 'Metadata:', newUser?.user?.user_metadata);

    if (createError) {
      console.error('Erro ao criar usuário:', createError);
      return NextResponse.json(
        { error: 'Erro ao criar usuário: ' + createError.message },
        { status: 500 }
      );
    }

    if (!newUser.user) {
      return NextResponse.json(
        { error: 'Usuário não foi criado' },
        { status: 500 }
      );
    }

    // Atualizar role e CPF na tabela users se necessário
    const updateData: UserUpdateData = {};
    if (role !== 'student') {
      updateData.role = role;
    }
    if (cpf) {
      updateData.cpf = cpf;
    }

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', newUser.user.id);

      if (updateError) {
        console.error('Erro ao atualizar dados do usuário:', updateError);
        // Não falhar aqui, pois o usuário já foi criado
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        name,
        role,
        temporaryPassword: temporaryPassword
      }
    });

  } catch (error) {
    console.error('Erro no endpoint de criação de usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
