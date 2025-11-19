import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// POST - Gerar URL assinada para upload direto
export async function POST(request: NextRequest) {
  try {
    console.log('🔑 generate-upload-url: Iniciando...');

    // Usar service_role para gerar signed URL (bypassa RLS)
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

    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.error('❌ generate-upload-url: Sem authorization header');
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('❌ generate-upload-url: Erro na autenticação', authError);
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    console.log('✅ generate-upload-url: Usuário autenticado:', user.id);

    // Obter parâmetros
    const body = await request.json();
    const { fileName, contentType } = body;

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'fileName e contentType são obrigatórios' },
        { status: 400 }
      );
    }

    // Gerar nome único
    const fileExt = fileName.split('.').pop();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `documents/${uniqueFileName}`;

    console.log('📝 generate-upload-url: Gerando URL para:', filePath);

    // Criar signed URL para upload (válida por 10 minutos)
    // Com service_role, isso BYPASSA RLS!
    const { data, error } = await supabaseAdmin.storage
      .from('course-documents')
      .createSignedUploadUrl(filePath);

    if (error) {
      console.error('❌ generate-upload-url: Erro ao gerar URL:', error);
      return NextResponse.json(
        { error: 'Erro ao gerar URL de upload', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ generate-upload-url: URL gerada com sucesso');

    // Obter URL pública para o arquivo
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('course-documents')
      .getPublicUrl(filePath);

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      publicUrl,
      filePath,
      token: data.token
    });

  } catch (error) {
    console.error('❌ generate-upload-url: Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

