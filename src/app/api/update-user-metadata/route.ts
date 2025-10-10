import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { userId, metadata } = await request.json();

    if (!userId || !metadata) {
      return NextResponse.json(
        { error: 'userId e metadata são obrigatórios' },
        { status: 400 }
      );
    }

    // Inicializar Supabase Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Atualizar metadata do usuário
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: metadata
    });

    if (error) {
      console.error('Erro ao atualizar metadata:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar metadados do usuário' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro na API update-user-metadata:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}