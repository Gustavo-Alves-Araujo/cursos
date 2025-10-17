import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Buscar carteirinhas do aluno autenticado
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API /api/student-cards - GET iniciado');
    
    // Usa o service_role para bypass RLS
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verificar autenticação do usuário
    const authHeader = request.headers.get('authorization');
    console.log('📝 Authorization header:', authHeader ? 'presente' : 'ausente');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await serviceSupabase.auth.getUser(token);

    console.log('👤 Usuário autenticado:', user?.id, user?.email);

    if (authError || !user) {
      console.log('❌ Erro de autenticação:', authError);
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar carteirinhas do aluno
    console.log('🔎 Buscando carteirinhas para user_id:', user.id);
    
    const { data: cards, error } = await serviceSupabase
      .from('student_cards')
      .select(`
        id,
        user_id,
        course_id,
        enrollment_date,
        available_date,
        profile_photo_url,
        generated_card_url,
        is_generated,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .order('available_date', { ascending: true });

    console.log('📦 Query executada. Erro:', error);
    console.log('📊 Carteirinhas encontradas:', cards?.length || 0);

    if (error) {
      console.error('❌ Erro ao buscar carteirinhas:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!cards || cards.length === 0) {
      console.log('ℹ️ Nenhuma carteirinha encontrada');
      return NextResponse.json([]);
    }

    // Buscar configurações de carteirinha para os cursos
    const courseIds = cards.map(card => card.course_id);
    const { data: cardSettings, error: settingsError } = await serviceSupabase
      .from('card_settings')
      .select('course_id, template_url')
      .in('course_id', courseIds);

    console.log('⚙️ Configurações encontradas:', cardSettings?.length || 0);

    if (settingsError) {
      console.error('❌ Erro ao buscar configurações:', settingsError);
    }

    // Filtrar apenas cursos que têm configuração de carteirinha
    const coursesWithSettings = new Set(cardSettings?.map(s => s.course_id) || []);
    const filteredCards = cards.filter(card => coursesWithSettings.has(card.course_id));

    console.log('🔍 Carteirinhas filtradas (com configuração):', filteredCards.length);

    if (filteredCards.length === 0) {
      console.log('ℹ️ Nenhum curso com configuração de carteirinha');
      return NextResponse.json([]);
    }

    // Buscar informações dos cursos separadamente
    const filteredCourseIds = filteredCards.map(card => card.course_id);
    const { data: courses, error: coursesError } = await serviceSupabase
      .from('courses')
      .select('id, title, thumbnail')
      .in('id', filteredCourseIds);

    console.log('📚 Cursos encontrados:', courses?.length || 0);

    if (coursesError) {
      console.error('❌ Erro ao buscar cursos:', coursesError);
    }

    // Mapear cursos por ID
    const coursesMap = new Map(courses?.map(c => [c.id, c]) || []);

    // Adicionar informação de disponibilidade e curso
    const now = new Date();
    const cardsWithStatus = filteredCards.map(card => {
      const availableDate = new Date(card.available_date);
      const isAvailable = now >= availableDate;
      const daysRemaining = isAvailable 
        ? 0 
        : Math.ceil((availableDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      const course = coursesMap.get(card.course_id);

      return {
        ...card,
        is_available: isAvailable,
        days_remaining: daysRemaining,
        courses: course || {
          id: card.course_id,
          title: 'Curso não encontrado',
          thumbnail: null
        }
      };
    });

    console.log('✅ Retornando', cardsWithStatus.length, 'carteirinhas com status');
    if (cardsWithStatus.length > 0) {
      console.log('🎯 Primeira carteirinha:', cardsWithStatus[0]);
    }
    
    return NextResponse.json(cardsWithStatus);

  } catch (error) {
    console.error('💥 Erro no GET /api/student-cards:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
