-- =====================================================
-- CORRIGIR RLS DA TABELA certificates
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. VERIFICAR ESTRUTURA DA TABELA certificates
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'certificates' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR POLÍTICAS RLS DA TABELA certificates
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
WHERE tablename = 'certificates' 
  AND schemaname = 'public'
ORDER BY policyname;

-- 3. VERIFICAR SE RLS ESTÁ HABILITADO
-- =====================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  forcerowsecurity
FROM pg_tables 
WHERE tablename = 'certificates' 
  AND schemaname = 'public';

-- 4. REMOVER TODAS AS POLÍTICAS EXISTENTES DA TABELA certificates
-- =====================================================
DROP POLICY IF EXISTS "Users can view own certificates" ON certificates;
DROP POLICY IF EXISTS "Admins can view all certificates" ON certificates;
DROP POLICY IF EXISTS "Admins can insert certificates" ON certificates;
DROP POLICY IF EXISTS "Admins can update certificates" ON certificates;
DROP POLICY IF EXISTS "Admins can delete certificates" ON certificates;
DROP POLICY IF EXISTS "Students can view own certificates" ON certificates;
DROP POLICY IF EXISTS "Students can insert certificates" ON certificates;
DROP POLICY IF EXISTS "Allow certificate insert" ON certificates;
DROP POLICY IF EXISTS "Allow certificate select" ON certificates;
DROP POLICY IF EXISTS "Allow certificate update" ON certificates;
DROP POLICY IF EXISTS "Allow certificate delete" ON certificates;

-- 5. CRIAR POLÍTICAS SUPER SIMPLES PARA A TABELA certificates
-- =====================================================

-- Política para INSERT - SEM RESTRIÇÕES
CREATE POLICY "Allow certificate insert" ON certificates
  FOR INSERT WITH CHECK (true);

-- Política para SELECT - SEM RESTRIÇÕES
CREATE POLICY "Allow certificate select" ON certificates
  FOR SELECT USING (true);

-- Política para UPDATE - SEM RESTRIÇÕES
CREATE POLICY "Allow certificate update" ON certificates
  FOR UPDATE USING (true);

-- Política para DELETE - SEM RESTRIÇÕES
CREATE POLICY "Allow certificate delete" ON certificates
  FOR DELETE USING (true);

-- 6. VERIFICAR POLÍTICAS CRIADAS
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'certificates' 
  AND schemaname = 'public'
ORDER BY policyname;

-- 7. TESTAR INSERÇÃO SIMPLES
-- =====================================================
-- ⚠️ Descomente apenas para teste
/*
INSERT INTO certificates (
  user_id,
  course_id,
  template_id,
  student_name,
  completion_date,
  certificate_url
) VALUES (
  auth.uid(),
  'test-course-id',
  'test-template-id',
  'Teste',
  '2025-10-06',
  'https://example.com/test.png'
);
*/

-- 8. VERIFICAR SE FUNCIONOU
-- =====================================================
SELECT 
  id,
  user_id,
  course_id,
  student_name,
  created_at
FROM certificates 
ORDER BY created_at DESC
LIMIT 5;
