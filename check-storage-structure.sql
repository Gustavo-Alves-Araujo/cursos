-- =====================================================
-- VERIFICAR ESTRUTURA REAL DA TABELA storage.objects
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. VERIFICAR ESTRUTURA COMPLETA DA TABELA storage.objects
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'objects' 
  AND table_schema = 'storage'
ORDER BY ordinal_position;

-- 2. VERIFICAR SE EXISTEM ÍNDICES
-- =====================================================
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY indexname;

-- 3. VERIFICAR CONSTRAINTS
-- =====================================================
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'objects' 
  AND table_schema = 'storage'
ORDER BY constraint_name;

-- 4. VERIFICAR SE A TABELA TEM DADOS
-- =====================================================
SELECT COUNT(*) as total_objects 
FROM storage.objects;

-- 5. VERIFICAR BUCKETS EXISTENTES
-- =====================================================
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
ORDER BY created_at;

-- 6. VERIFICAR OBJETOS POR BUCKET
-- =====================================================
SELECT 
  bucket_id,
  COUNT(*) as object_count
FROM storage.objects 
GROUP BY bucket_id
ORDER BY object_count DESC;

-- 7. VERIFICAR ESTRUTURA DE UM OBJETO EXEMPLO (se existir)
-- =====================================================
SELECT 
  name,
  bucket_id,
  content_type,
  created_at,
  updated_at
FROM storage.objects 
LIMIT 1;

-- 8. VERIFICAR POLÍTICAS ATUAIS
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;
