-- Script para configurar o bucket de storage para documentos de cursos
-- Execute este script no Supabase SQL Editor

-- 1. Criar bucket para documentos de cursos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-documents',
  'course-documents',
  true,
  10485760, -- 10MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
);

-- 2. Criar política para permitir upload de documentos por usuários autenticados
CREATE POLICY "Allow authenticated users to upload documents" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'course-documents');

-- 3. Criar política para permitir leitura pública de documentos
CREATE POLICY "Allow public read access to documents" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'course-documents');

-- 4. Criar política para permitir que usuários autenticados vejam todos os documentos
CREATE POLICY "Allow authenticated users to view documents" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'course-documents');

-- 5. Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE id = 'course-documents';
