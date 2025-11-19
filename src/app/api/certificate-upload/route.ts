import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// POST - Upload de certificado (usa service role para bypass RLS)
export async function POST(request: NextRequest) {
  try {
    console.log('📤 certificate-upload: Iniciando...');

    // Usar service_role para bypass RLS
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
      console.error('❌ certificate-upload: Sem authorization header');
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('❌ certificate-upload: Erro na autenticação', authError);
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    console.log('✅ certificate-upload: Usuário autenticado:', user.id);

    // Pegar dados do body
    const body = await request.json();
    const { fileName, imageData } = body;

    if (!fileName || !imageData) {
      console.error('❌ certificate-upload: Dados incompletos');
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    console.log('📁 certificate-upload: Fazendo upload para:', fileName);

    // Converter base64 para buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    console.log('📊 certificate-upload: Tamanho do buffer:', buffer.length, 'bytes');

    // Upload do certificado usando service_role (bypass RLS)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('certificates')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: false,
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('❌ certificate-upload: Erro no upload:', uploadError);
      return NextResponse.json(
        { error: 'Erro ao fazer upload do arquivo', details: uploadError.message },
        { status: 500 }
      );
    }

    console.log('✅ certificate-upload: Upload concluído:', uploadData);

    // Obter URL pública do arquivo
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('certificates')
      .getPublicUrl(fileName);

    console.log('🔗 certificate-upload: URL pública:', publicUrl);

    return NextResponse.json({
      url: publicUrl,
      filePath: uploadData.path
    });
  } catch (error) {
    console.error('❌ certificate-upload: Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro ao processar upload' },
      { status: 500 }
    );
  }
}

