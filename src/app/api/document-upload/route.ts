import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// POST - Upload de documento para aula
export async function POST(request: NextRequest) {
  try {
    console.log('📤 document-upload: Iniciando...');

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
      console.error('❌ document-upload: Sem authorization header');
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('❌ document-upload: Erro na autenticação', authError);
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    console.log('✅ document-upload: Usuário autenticado:', user.id);

    // Processar FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('❌ document-upload: Arquivo não fornecido');
      return NextResponse.json({ error: 'Arquivo não fornecido' }, { status: 400 });
    }

    console.log('📄 document-upload: Arquivo recebido:', file.name, file.type, file.size);

    // Validar tipo de arquivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ document-upload: Tipo de arquivo inválido:', file.type);
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Use PDF, DOC, DOCX ou TXT.' },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error('❌ document-upload: Arquivo muito grande:', file.size);
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 10MB.' },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    console.log('📁 document-upload: Fazendo upload para:', filePath);

    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload do documento usando service_role (já criado no início)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('course-documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('❌ document-upload: Erro no upload:', uploadError);
      return NextResponse.json(
        { error: 'Erro ao fazer upload do arquivo', details: uploadError.message },
        { status: 500 }
      );
    }

    console.log('✅ document-upload: Upload concluído:', uploadData);

    // Obter URL pública do arquivo
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('course-documents')
      .getPublicUrl(filePath);

    console.log('🔗 document-upload: URL pública:', publicUrl);

    return NextResponse.json({
      url: publicUrl,
      filePath
    });
  } catch (error) {
    console.error('❌ document-upload: Erro capturado:', error);
    console.error('❌ document-upload: Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

