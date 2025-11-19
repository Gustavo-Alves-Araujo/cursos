-- ============================================
-- SCRIPT DE DIAGNÓSTICO - Execute e me mande os resultados
-- ============================================

-- 1. Verificar se o bucket existe
SELECT 
  'BUCKET:' as tipo,
  id, 
  name, 
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'course-documents';

-- 2. Verificar políticas existentes
SELECT 
  'POLÍTICAS:' as tipo,
  policyname,
  cmd as operacao,
  roles as papeis,
  qual as condicao_using,
  with_check as condicao_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%documento%';

-- 3. Verificar RLS está ativo na tabela objects
SELECT 
  'RLS STATUS:' as tipo,
  schemaname,
  tablename,
  rowsecurity as rls_ativo
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

