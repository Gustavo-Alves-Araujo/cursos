-- ============================================
-- CRIAR POLÍTICAS SIMPLES E PERMISSIVAS
-- ============================================
-- Este script FUNCIONA sem precisar ser owner
-- Execute no Supabase SQL Editor
-- ============================================

-- PASSO 1: Remover políticas antigas (se existirem)
-- Apenas as que você criou, não as do sistema
DROP POLICY IF EXISTS "Permitir upload para autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização para autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir deleção para autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Upload sem restricoes" ON storage.objects;
DROP POLICY IF EXISTS "Leitura livre" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem fazer upload de documentos" ON storage.objects;
DROP POLICY IF EXISTS "Documentos são públicos para leitura" ON storage.objects;

-- PASSO 2: Criar política SUPER SIMPLES para INSERT
CREATE POLICY "Upload livre para autenticados"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-documents'
);

-- PASSO 3: Criar política SUPER SIMPLES para SELECT (leitura)
CREATE POLICY "Leitura livre para todos"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'course-documents'
);

-- PASSO 4: Criar política para UPDATE
CREATE POLICY "Update livre para autenticados"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'course-documents')
WITH CHECK (bucket_id = 'course-documents');

-- PASSO 5: Criar política para DELETE
CREATE POLICY "Delete livre para autenticados"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'course-documents');

-- PASSO 6: Garantir que o bucket existe
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('course-documents', 'course-documents', true, 52428800)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 52428800;

-- VERIFICAÇÃO: Ver políticas criadas
SELECT 
  policyname,
  cmd as comando,
  roles as papeis
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%livre%';

