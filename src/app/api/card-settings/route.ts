import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Buscar configuração de carteirinha por curso
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET card-settings: Iniciando...');
    
    // Usa service_role para bypass RLS
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
    
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    console.log('🔍 GET card-settings: courseId =', courseId);

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar configuração (sem verificar autenticação - dados públicos para admin)
    const { data, error } = await serviceSupabase
      .from('card_settings')
      .select('*')
      .eq('course_id', courseId)
      .single();

    console.log('🔍 GET card-settings: Dados encontrados?', data ? 'Sim' : 'Não');
    console.log('🔍 GET card-settings: Dados:', data);
    console.log('🔍 GET card-settings: Erro:', error);

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Erro ao buscar card_settings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Se não existir, retornar configuração padrão
    if (!data) {
      console.log('🔍 GET card-settings: Retornando configuração padrão');
      return NextResponse.json({
        course_id: courseId,
        template_url: null,
        name_position_x: 100,
        name_position_y: 100,
        name_font_size: 24,
        name_color: '#000000',
        cpf_position_x: 100,
        cpf_position_y: 150,
        cpf_font_size: 18,
        cpf_color: '#000000',
        photo_position_x: 50,
        photo_position_y: 50,
        photo_width: 120,
        photo_height: 150,
        days_after_enrollment: 0,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro no GET /api/card-settings:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST/PUT - Criar ou atualizar configuração de carteirinha
export async function POST(request: Request) {
  try {
    console.log('POST card-settings: Iniciando...');
    
    // Extrai o token do header Authorization
    const authHeader = request.headers.get('Authorization');
    console.log('POST card-settings: Authorization header:', authHeader ? 'presente' : 'ausente');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('POST card-settings: Token ausente ou inválido');
      return NextResponse.json(
        { error: 'Token de autenticação não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Usa o service_role para todas as operações (bypass RLS)
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

    // Verifica o usuário usando o token fornecido
    const { data: { user }, error: authError } = await serviceSupabase.auth.getUser(token);
    
    console.log('POST card-settings: Usuário autenticado:', user?.id, user?.email);

    if (authError || !user) {
      console.log('POST card-settings: Erro de autenticação:', authError);
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Busca os dados do usuário para verificar role
    const { data: userData, error: userError } = await serviceSupabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    console.log('POST card-settings: Dados do usuário:', userData);

    if (userError || !userData) {
      console.log('POST card-settings: Erro ao buscar dados do usuário:', userError);
      return NextResponse.json(
        { error: 'Erro ao verificar permissões' },
        { status: 403 }
      );
    }

    // Verifica se é admin
    if (userData.role !== 'admin') {
      console.log('POST card-settings: Usuário não é admin');
      return NextResponse.json(
        { error: 'Apenas administradores podem configurar carteirinhas' },
        { status: 403 }
      );
    }

    console.log('POST card-settings: Usuário é admin, prosseguindo com upsert...');

    const body = await request.json();
    const { course_id, ...settings } = body;

    console.log('POST card-settings: Dados recebidos:', { course_id, settings });

    if (!course_id) {
      return NextResponse.json(
        { error: 'course_id é obrigatório' },
        { status: 400 }
      );
    }

    // Primeiro tenta fazer update
    const { data: existingData, error: selectError } = await serviceSupabase
      .from('card_settings')
      .select('id')
      .eq('course_id', course_id)
      .single();
    
    console.log('POST card-settings: Registro existente?', existingData ? 'Sim' : 'Não');

    let result;
    
    if (existingData) {
      // Update
      console.log('POST card-settings: Atualizando registro existente');
      const { data, error } = await serviceSupabase
        .from('card_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('course_id', course_id)
        .select()
        .single();
      
      result = { data, error };
    } else {
      // Insert
      console.log('POST card-settings: Inserindo novo registro');
      const { data, error } = await serviceSupabase
        .from('card_settings')
        .insert({
          course_id,
          ...settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      result = { data, error };
    }

    console.log('POST card-settings: Resultado:', result.data);
    console.log('POST card-settings: Erro:', result.error);

    if (result.error) {
      console.error('Erro ao salvar card_settings:', result.error);
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Erro no POST card-settings:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
