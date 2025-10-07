-- =====================================================
-- DIAGNÓSTICO COMPLETO DO PROBLEMA DE CERTIFICADOS
-- =====================================================
-- Execute este script no Supabase SQL Editor para diagnosticar o problema

-- 1. VERIFICAR SE AS TABELAS EXISTEM
-- =====================================================
SELECT 
  table_name,
  table_type,
  is_insertable_into
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('certificate_templates', 'certificates', 'users', 'courses')
ORDER BY table_name;

-- 2. VERIFICAR RLS NAS TABELAS
-- =====================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  forcerowsecurity
FROM pg_tables 
WHERE tablename IN ('certificate_templates', 'certificates')
ORDER BY tablename;

-- 3. VERIFICAR POLÍTICAS RLS ATUAIS
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
WHERE tablename IN ('certificate_templates', 'certificates')
ORDER BY tablename, policyname;

-- 4. VERIFICAR BUCKETS DE STORAGE
-- =====================================================
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id IN ('certificates', 'certificate-templates')
ORDER BY id;

-- 5. VERIFICAR POLÍTICAS DE STORAGE
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
  AND (policyname LIKE '%certificates%' OR policyname LIKE '%certificate%')
ORDER BY policyname;

-- 6. VERIFICAR DADOS NAS TABELAS
-- =====================================================
-- Verificar se existem templates
SELECT COUNT(*) as template_count FROM certificate_templates;

-- Verificar se existem certificados
SELECT COUNT(*) as certificate_count FROM certificates;

-- Verificar usuários e seus roles
SELECT 
  id,
  email,
  role,
  created_at
FROM users 
WHERE role = 'admin'
ORDER BY created_at;

-- 7. TESTAR ACESSO AOS TEMPLATES (como usuário autenticado)
-- =====================================================
-- Este teste deve ser executado com um usuário logado
SELECT 
  ct.id,
  ct.course_id,
  ct.background_image_url,
  c.title as course_title
FROM certificate_templates ct
LEFT JOIN courses c ON c.id = ct.course_id
ORDER BY ct.created_at DESC
LIMIT 5;

-- 8. VERIFICAR ESTRUTURA DAS TABELAS
-- =====================================================
-- Verificar colunas da tabela certificate_templates
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'certificate_templates'
ORDER BY ordinal_position;

-- Verificar colunas da tabela certificates
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'certificates'
ORDER BY ordinal_position;

-- 9. VERIFICAR ÍNDICES
-- =====================================================
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('certificate_templates', 'certificates')
ORDER BY tablename, indexname;

-- 10. VERIFICAR TRIGGERS
-- =====================================================
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('certificate_templates', 'certificates')
ORDER BY event_object_table, trigger_name;
