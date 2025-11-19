-- ============================================
-- POLÍTICAS RLS PARA O BUCKET course-documents
-- ============================================
-- Execute estes comandos no Supabase SQL Editor
-- Caminho: Dashboard > SQL Editor > New Query

-- 1. Permitir upload de documentos para usuários autenticados (admin)
CREATE POLICY "Admins podem fazer upload de documentos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-documents' 
  AND auth.uid() IS NOT NULL
);

-- 2. Permitir leitura pública de documentos
CREATE POLICY "Documentos são públicos para leitura"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'course-documents');

-- 3. Permitir atualização de documentos para admins
CREATE POLICY "Admins podem atualizar documentos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-documents'
  AND auth.uid() IS NOT NULL
)
WITH CHECK (
  bucket_id = 'course-documents'
  AND auth.uid() IS NOT NULL
);

-- 4. Permitir deleção de documentos para admins
CREATE POLICY "Admins podem deletar documentos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-documents'
  AND auth.uid() IS NOT NULL
);

-- ============================================
-- VERIFICAR SE O BUCKET EXISTE
-- ============================================
-- Execute este SELECT para verificar:
SELECT * FROM storage.buckets WHERE id = 'course-documents';

-- ============================================
-- CRIAR O BUCKET SE NÃO EXISTIR
-- ============================================
-- Se o bucket não existir, crie com:
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-documents', 'course-documents', true);

-- ============================================
-- VERIFICAR POLÍTICAS CRIADAS
-- ============================================
-- Execute para ver todas as políticas do bucket:
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

