-- =====================================================
// DEBUG COMPLETO DO STORAGE - DESCOBRIR O PROBLEMA
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. VERIFICAR SE RLS ESTÁ HABILITADO
-- =====================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  forcerowsecurity
FROM pg_tables 
WHERE tablename = 'objects' 
  AND schemaname = 'storage';

-- 2. VERIFICAR TODAS AS POLÍTICAS EXISTENTES
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

-- 3. VERIFICAR BUCKETS
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

-- 4. VERIFICAR ESTRUTURA DA TABELA storage.objects
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

-- 5. VERIFICAR SE EXISTEM DADOS NA TABELA
-- =====================================================
SELECT COUNT(*) as total_objects 
FROM storage.objects;

-- 6. VERIFICAR OBJETOS POR BUCKET
-- =====================================================
SELECT 
  bucket_id,
  COUNT(*) as object_count
FROM storage.objects 
GROUP BY bucket_id
ORDER BY object_count DESC;

-- 7. VERIFICAR USUÁRIOS E ROLES
-- =====================================================
SELECT 
  id,
  email,
  role,
  created_at
FROM users 
ORDER BY created_at DESC
LIMIT 10;

-- 8. TESTAR INSERÇÃO DIRETA (OPCIONAL)
-- =====================================================
-- ⚠️ Descomente apenas para teste
/*
INSERT INTO storage.objects (
  bucket_id, 
  name, 
  content_type,
  owner
) VALUES (
  'certificates', 
  'test-debug.txt', 
  'text/plain',
  auth.uid()
);
*/

-- 9. VERIFICAR SE A INSERÇÃO FUNCIONOU
-- =====================================================
SELECT 
  name,
  bucket_id,
  content_type,
  created_at
FROM storage.objects 
WHERE bucket_id = 'certificates'
ORDER BY created_at DESC
LIMIT 5;

-- 10. VERIFICAR PERMISSÕES DO USUÁRIO ATUAL
-- =====================================================
SELECT 
  current_user,
  session_user,
  current_database(),
  current_schema();

-- 11. VERIFICAR SE EXISTEM CONSTRAINTS
-- =====================================================
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'objects' 
  AND table_schema = 'storage'
ORDER BY constraint_name;

-- 12. VERIFICAR SE EXISTEM TRIGGERS
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
