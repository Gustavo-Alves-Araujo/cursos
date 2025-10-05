-- =====================================================
-- CORREÇÃO ESPECÍFICA: Política de INSERT para lessons
-- =====================================================
-- Este script corrige especificamente o problema de criação de aulas

-- 1. Verificar estado atual das políticas
SELECT 'Estado atual das políticas:' as status;
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'lessons'
ORDER BY policyname;

-- 2. Remover política de INSERT problemática
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON lessons;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON lessons;

-- 3. Criar nova política de INSERT mais simples
CREATE POLICY "Allow authenticated users to insert lessons" ON lessons
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- 4. Verificar se a política foi criada
SELECT 'Política de INSERT criada:' as status;
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'lessons' 
  AND cmd = 'INSERT'
ORDER BY policyname;

-- 5. Verificar se RLS está habilitado
SELECT 'Verificando RLS:' as status;
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'lessons';

-- 6. Se RLS não estiver habilitado, habilitar
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- 7. Verificação final
SELECT 'Verificação final:' as status;
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'lessons';