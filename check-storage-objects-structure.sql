-- =====================================================
-- VERIFICAR ESTRUTURA REAL DA TABELA storage.objects
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. VERIFICAR ESTRUTURA DA TABELA storage.objects
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'objects' 
  AND table_schema = 'storage'
ORDER BY ordinal_position;

-- 2. VERIFICAR SE EXISTEM DADOS NA TABELA
-- =====================================================
SELECT COUNT(*) as total_objects 
FROM storage.objects;

-- 3. VERIFICAR OBJETOS POR BUCKET
-- =====================================================
SELECT 
  bucket_id,
  COUNT(*) as object_count
FROM storage.objects 
GROUP BY bucket_id
ORDER BY object_count DESC;

-- 4. VERIFICAR ESTRUTURA DE UM OBJETO EXEMPLO (se existir)
-- =====================================================
SELECT 
  name,
  bucket_id,
  created_at,
  updated_at
FROM storage.objects 
LIMIT 1;

-- 5. VERIFICAR SE EXISTEM CONSTRAINTS
-- =====================================================
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'objects' 
  AND table_schema = 'storage'
ORDER BY constraint_name;

-- 6. VERIFICAR SE EXISTEM TRIGGERS
-- =====================================================
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'objects'
  AND event_object_schema = 'storage'
ORDER BY trigger_name;

-- 7. VERIFICAR ÍNDICES
-- =====================================================
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY indexname;
