import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST - Upload de foto de perfil do aluno
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
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Processar FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não fornecido' }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Use PNG ou JPG.' },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 2MB para foto de perfil)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 2MB.' },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`;

    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload para Supabase Storage usando service_role
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

    // Upload da foto
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('student-profile-photos')
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
      .from('student-profile-photos')
      .getPublicUrl(uploadData.path);

    return NextResponse.json({
      url: publicUrl,
      path: uploadData.path,
      message: 'Upload realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no upload de foto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
