-- Script para configurar o bucket de storage para materiais de apoio das aulas
-- Execute este script no Supabase SQL Editor

-- 1. Criar bucket para materiais de apoio
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'support-materials',
  'support-materials',
  true,
  52428800, -- 50MB
  ARRAY[
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
  ]
) ON CONFLICT (id) DO NOTHING;

-- 2. Criar política para permitir upload de materiais por usuários autenticados
CREATE POLICY "Allow authenticated users to upload support materials" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'support-materials');

-- 3. Criar política para permitir leitura pública de materiais
CREATE POLICY "Allow public read access to support materials" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'support-materials');

-- 4. Criar política para permitir que usuários autenticados vejam todos os materiais
CREATE POLICY "Allow authenticated users to view support materials" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'support-materials');

-- 5. Criar política para permitir que admins atualizem materiais
CREATE POLICY "Allow admins to update support materials" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'support-materials' AND 
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- 6. Criar política para permitir que admins deletem materiais
CREATE POLICY "Allow admins to delete support materials" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'support-materials' AND 
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- 7. Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE id = 'support-materials';
