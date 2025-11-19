-- ============================================
-- SCRIPT COMPLETO PARA CORRIGIR RLS DO STORAGE
-- ============================================
-- Execute TUDO de uma vez no Supabase SQL Editor
-- Caminho: Dashboard > SQL Editor > New Query
-- Cole tudo e clique em RUN

-- PASSO 1: Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Admins podem fazer upload de documentos" ON storage.objects;
DROP POLICY IF EXISTS "Documentos são públicos para leitura" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem atualizar documentos" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem deletar documentos" ON storage.objects;

-- PASSO 2: Verificar se o bucket existe, se não, criar
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-documents', 
  'course-documents', 
  true,
  52428800, -- 50MB em bytes
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']::text[]
)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']::text[];

-- PASSO 3: Criar políticas RLS corretas

-- 3.1: Permitir INSERT para usuários autenticados
CREATE POLICY "Admins podem fazer upload de documentos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-documents'
);

-- 3.2: Permitir SELECT público
CREATE POLICY "Documentos são públicos para leitura"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'course-documents');

-- 3.3: Permitir UPDATE para usuários autenticados
CREATE POLICY "Admins podem atualizar documentos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'course-documents')
WITH CHECK (bucket_id = 'course-documents');

-- 3.4: Permitir DELETE para usuários autenticados
CREATE POLICY "Admins podem deletar documentos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'course-documents');

-- PASSO 4: Verificação (opcional - veja os resultados no final)
SELECT 'Bucket configurado:' as status, * FROM storage.buckets WHERE id = 'course-documents';
SELECT 'Políticas criadas:' as status, schemaname, tablename, policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

