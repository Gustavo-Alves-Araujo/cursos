import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// POST - Upload de template de certificado
export async function POST(request: NextRequest) {
  try {
    console.log('📤 certificate-template-upload: Iniciando...');

    // Usar service_role para verificar autenticação e fazer upload
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
      console.error('❌ certificate-template-upload: Sem authorization header');
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('❌ certificate-template-upload: Erro na autenticação', authError);
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    console.log('✅ certificate-template-upload: Usuário autenticado:', user.id);

    // Processar FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const courseId = formData.get('courseId') as string;

    if (!file) {
      console.error('❌ certificate-template-upload: Arquivo não fornecido');
      return NextResponse.json({ error: 'Arquivo não fornecido' }, { status: 400 });
    }

    if (!courseId) {
      console.error('❌ certificate-template-upload: courseId não fornecido');
      return NextResponse.json({ error: 'ID do curso não fornecido' }, { status: 400 });
    }

    console.log('📄 certificate-template-upload: Arquivo recebido:', file.name, file.type, file.size);
    console.log('📝 certificate-template-upload: courseId:', courseId);

    // Validar tipo de arquivo
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ certificate-template-upload: Tipo de arquivo inválido:', file.type);
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Use JPG ou PNG.' },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error('❌ certificate-template-upload: Arquivo muito grande:', file.size);
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 10MB.' },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `certificate-templates/${courseId}_${Date.now()}.${fileExt}`;

    console.log('📁 certificate-template-upload: Fazendo upload para:', fileName);

    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload do template usando service_role (já criado no início)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('certificate-templates')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('❌ certificate-template-upload: Erro no upload:', uploadError);
      return NextResponse.json(
        { error: 'Erro ao fazer upload do arquivo', details: uploadError.message },
        { status: 500 }
      );
    }

    console.log('✅ certificate-template-upload: Upload concluído:', uploadData);

    // Obter URL pública do arquivo
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('certificate-templates')
      .getPublicUrl(fileName);

    console.log('🔗 certificate-template-upload: URL pública:', publicUrl);

    return NextResponse.json({
      url: publicUrl,
      filePath: fileName
    });
  } catch (error) {
    console.error('Erro no upload de template de certificado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

