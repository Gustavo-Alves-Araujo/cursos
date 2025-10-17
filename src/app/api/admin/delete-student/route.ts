import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ API DELETE /api/admin/delete-student - Iniciando');
    
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🔍 Deletando usuário:', userId);

    // Usar service_role para ter permissões administrativas
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 1. Deletar da autenticação (auth.users)
    console.log('🔐 Deletando da autenticação...');
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('❌ Erro ao deletar da autenticação:', authError);
      return NextResponse.json(
        { error: `Erro ao deletar da autenticação: ${authError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Usuário deletado da autenticação');

    // 2. Deletar matrículas (course_enrollments)
    // Isso será feito automaticamente se houver ON DELETE CASCADE na FK
    console.log('📚 Deletando matrículas...');
    const { error: enrollmentsError } = await supabaseAdmin
      .from('course_enrollments')
      .delete()
      .eq('user_id', userId);

    if (enrollmentsError) {
      console.error('⚠️ Aviso ao deletar matrículas:', enrollmentsError);
      // Não falhar por causa disso
    } else {
      console.log('✅ Matrículas deletadas');
    }

    // 3. Deletar carteirinhas (student_cards)
    console.log('🎴 Deletando carteirinhas...');
    const { error: cardsError } = await supabaseAdmin
      .from('student_cards')
      .delete()
      .eq('user_id', userId);

    if (cardsError) {
      console.error('⚠️ Aviso ao deletar carteirinhas:', cardsError);
      // Não falhar por causa disso
    } else {
      console.log('✅ Carteirinhas deletadas');
    }

    // 4. Deletar da tabela users
    console.log('👤 Deletando da tabela users...');
    const { error: usersError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (usersError) {
      console.error('⚠️ Aviso ao deletar da tabela users:', usersError);
      // Não falhar por causa disso, pois o usuário já foi deletado da auth
    } else {
      console.log('✅ Usuário deletado da tabela users');
    }

    console.log('🎉 Usuário deletado completamente!');

    return NextResponse.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });

  } catch (error) {
    console.error('💥 Erro no DELETE /api/admin/delete-student:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
