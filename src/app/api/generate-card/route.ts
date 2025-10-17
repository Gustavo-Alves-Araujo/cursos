import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST - Gerar carteirinha do aluno
export async function POST(request: NextRequest) {
  try {
    console.log('🎨 API /api/generate-card - POST iniciado');
    
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

    // Pegar dados do body
    const body = await request.json();
    const { courseId, profilePhotoUrl } = body;

    console.log('📦 Dados recebidos:', { courseId, profilePhotoUrl: profilePhotoUrl ? 'presente' : 'ausente' });

    if (!courseId) {
      return NextResponse.json({ error: 'courseId não fornecido' }, { status: 400 });
    }

    if (!profilePhotoUrl) {
      return NextResponse.json({ error: 'Foto de perfil não fornecida' }, { status: 400 });
    }

    // Buscar dados do usuário
    console.log('🔎 Buscando dados do usuário na tabela users...');
    const { data: userData, error: userError } = await serviceSupabase
      .from('users')
      .select('name, cpf')
      .eq('id', user.id)
      .single();

    console.log('👤 Dados do usuário:', userData);
    console.log('❌ Erro ao buscar usuário:', userError);

    if (!userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (!userData.cpf) {
      return NextResponse.json(
        { error: 'CPF não cadastrado. Por favor, atualize seu perfil.' },
        { status: 400 }
      );
    }

    // Buscar configurações da carteirinha
    const { data: cardSettings } = await serviceSupabase
      .from('card_settings')
      .select('*')
      .eq('course_id', courseId)
      .single();

    if (!cardSettings || !cardSettings.template_url) {
      return NextResponse.json(
        { error: 'Template de carteirinha não configurado para este curso' },
        { status: 400 }
      );
    }

    // Buscar ou criar registro da carteirinha
    const { data: studentCard } = await serviceSupabase
      .from('student_cards')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (!studentCard) {
      return NextResponse.json(
        { error: 'Você não está matriculado neste curso' },
        { status: 403 }
      );
    }

    // Verificar se está disponível
    const availableDate = new Date(studentCard.available_date);
    const now = new Date();

    if (now < availableDate) {
      const daysRemaining = Math.ceil((availableDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return NextResponse.json(
        { 
          error: 'Carteirinha ainda não disponível',
          available_date: availableDate.toISOString(),
          days_remaining: daysRemaining
        },
        { status: 403 }
      );
    }

    // Atualizar registro com a foto do perfil
    await serviceSupabase
      .from('student_cards')
      .update({ profile_photo_url: profilePhotoUrl })
      .eq('id', studentCard.id);

    // Aqui você faria a geração da imagem usando canvas ou uma lib externa
    // Por enquanto, vou retornar os dados para gerar no frontend
    // Em produção, você pode usar `canvas` ou `sharp` no backend
    
    return NextResponse.json({
      message: 'Dados prontos para gerar carteirinha',
      data: {
        templateUrl: cardSettings.template_url,
        profilePhotoUrl,
        name: userData.name,
        cpf: userData.cpf,
        positions: {
          name: {
            x: cardSettings.name_position_x,
            y: cardSettings.name_position_y,
            fontSize: cardSettings.name_font_size,
            color: cardSettings.name_color
          },
          cpf: {
            x: cardSettings.cpf_position_x,
            y: cardSettings.cpf_position_y,
            fontSize: cardSettings.cpf_font_size,
            color: cardSettings.cpf_color
          },
          photo: {
            x: cardSettings.photo_position_x,
            y: cardSettings.photo_position_y,
            width: cardSettings.photo_width,
            height: cardSettings.photo_height
          }
        }
      }
    });

  } catch (error) {
    console.error('Erro ao gerar carteirinha:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Salvar carteirinha gerada
export async function PUT(request: NextRequest) {
  try {
    console.log('💾 API /api/generate-card - PUT iniciado');
    
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

    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await serviceSupabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Pegar dados do body
    const body = await request.json();
    const { courseId, generatedCardBlob } = body;

    if (!courseId || !generatedCardBlob) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Converter base64 para buffer
    const base64Data = generatedCardBlob.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const fileName = `${user.id}/card-${courseId}-${Date.now()}.png`;

    const { data: uploadData, error: uploadError } = await serviceSupabase.storage
      .from('student-cards')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Obter URL pública
    const { data: { publicUrl } } = serviceSupabase.storage
      .from('student-cards')
      .getPublicUrl(uploadData.path);

    // Atualizar registro
    await serviceSupabase
      .from('student_cards')
      .update({
        generated_card_url: publicUrl,
        is_generated: true
      })
      .eq('user_id', user.id)
      .eq('course_id', courseId);

    console.log('✅ Carteirinha salva:', publicUrl);

    return NextResponse.json({
      message: 'Carteirinha salva com sucesso',
      url: publicUrl
    });

  } catch (error) {
    console.error('Erro ao salvar carteirinha:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
