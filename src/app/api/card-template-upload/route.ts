import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST - Upload de template de carteirinha
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Erro de autenticação:', authError);
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    console.log('Usuário autenticado:', user.id, user.email);
    console.log('User metadata:', user.user_metadata);

    // Usar service_role para consultar a tabela users (bypass RLS)
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

    // Verificar se é admin
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    console.log('Dados do usuário:', userData, userError);

    if (userError || !userData) {
      console.error('Erro ao buscar usuário:', userError);
      return NextResponse.json(
        { error: 'Erro ao verificar permissões do usuário' },
        { status: 500 }
      );
    }

    if (userData.role !== 'admin') {
      console.log('Usuário não é admin:', userData.role);
      return NextResponse.json(
        { error: 'Apenas administradores podem fazer upload de templates' },
        { status: 403 }
      );
    }

    console.log('Usuário é admin, prosseguindo com upload');

    // Processar FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const courseId = formData.get('courseId') as string;

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não fornecido' }, { status: 400 });
    }

    if (!courseId) {
      return NextResponse.json({ error: 'courseId não fornecido' }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Use PNG ou JPG.' },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB.' },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${courseId}/template-${Date.now()}.${fileExt}`;

    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Remover template antigo se existir
    const { data: oldSettings } = await supabaseAdmin
      .from('card_settings')
      .select('template_url')
      .eq('course_id', courseId)
      .single();

    if (oldSettings?.template_url) {
      const oldPath = oldSettings.template_url.split('/student-cards-templates/')[1];
      if (oldPath) {
        await supabaseAdmin.storage
          .from('student-cards-templates')
          .remove([oldPath]);
      }
    }

    // Upload do novo template
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('student-cards-templates')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('student-cards-templates')
      .getPublicUrl(uploadData.path);

    return NextResponse.json({
      url: publicUrl,
      path: uploadData.path,
      message: 'Upload realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no upload de template:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
