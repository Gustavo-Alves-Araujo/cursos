import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// POST - Upload de material de apoio
export async function POST(request: NextRequest) {
  try {
    console.log('📤 support-material-upload: Iniciando...');

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
      console.error('❌ support-material-upload: Sem authorization header');
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('❌ support-material-upload: Erro na autenticação', authError);
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    console.log('✅ support-material-upload: Usuário autenticado:', user.id);

    // Processar FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const lessonId = formData.get('lessonId') as string;

    if (!file) {
      console.error('❌ support-material-upload: Arquivo não fornecido');
      return NextResponse.json({ error: 'Arquivo não fornecido' }, { status: 400 });
    }

    if (!lessonId) {
      console.error('❌ support-material-upload: lessonId não fornecido');
      return NextResponse.json({ error: 'ID da aula não fornecido' }, { status: 400 });
    }

    console.log('📄 support-material-upload: Arquivo recebido:', file.name, file.type, file.size);
    console.log('📝 support-material-upload: lessonId:', lessonId);

    // Validar tipo de arquivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/zip',
      'application/x-rar-compressed',
      'image/png',
      'image/jpeg',
      'image/gif'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ support-material-upload: Tipo de arquivo não permitido:', file.type);
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido' },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      console.error('❌ support-material-upload: Arquivo muito grande:', file.size);
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 50MB.' },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${lessonId}/${timestamp}_${cleanName}`;

    console.log('📁 support-material-upload: Fazendo upload para:', fileName);

    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload do material usando service_role (já criado no início)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('support-materials')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ support-material-upload: Erro no upload:', uploadError);
      return NextResponse.json(
        { error: 'Erro ao fazer upload do arquivo', details: uploadError.message },
        { status: 500 }
      );
    }

    console.log('✅ support-material-upload: Upload concluído:', uploadData);

    // Obter URL pública do arquivo
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('support-materials')
      .getPublicUrl(fileName);

    console.log('🔗 support-material-upload: URL pública:', publicUrl);

    return NextResponse.json({
      url: publicUrl,
      filePath: fileName,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
  } catch (error) {
    console.error('Erro no upload de material de apoio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

