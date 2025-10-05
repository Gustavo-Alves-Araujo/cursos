-- =====================================================
-- DEBUG: Problema de criação de aulas após reativar RLS
-- =====================================================
-- Execute este script para diagnosticar e corrigir o problema

-- 1. Verificar se RLS está habilitado na tabela lessons
SELECT 'Verificando RLS na tabela lessons...' as status;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'lessons';

-- 2. Verificar políticas existentes na tabela lessons
SELECT 'Verificando políticas existentes...' as status;
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
WHERE tablename = 'lessons'
ORDER BY policyname;

-- 3. Verificar se há dados na tabela lessons
SELECT 'Verificando dados na tabela lessons...' as status;
SELECT COUNT(*) as total_lessons FROM lessons;

-- 4. Verificar estrutura da tabela lessons
SELECT 'Verificando estrutura da tabela lessons...' as status;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'lessons'
ORDER BY ordinal_position;

-- 5. Testar inserção manual (se possível)
-- SELECT 'Testando inserção manual...' as status;
-- INSERT INTO lessons (module_id, title, description, type, order_index, is_published)
-- VALUES ('test-module-id', 'Teste RLS', 'Aula de teste', 'text', 1, false)
-- RETURNING *;

-- =====================================================
-- CORREÇÃO: Recriar políticas RLS para lessons
-- =====================================================

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON lessons;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON lessons;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON lessons;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON lessons;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON lessons;
DROP POLICY IF EXISTS "Enable read access for all users" ON lessons;
DROP POLICY IF EXISTS "Enable update for users based on email" ON lessons;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON lessons;

-- Criar políticas mais permissivas para admins
-- Política para INSERT: Permitir que usuários autenticados criem aulas
CREATE POLICY "Enable insert for authenticated users" ON lessons
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- Política para SELECT: Permitir que usuários autenticados vejam aulas
CREATE POLICY "Enable read access for authenticated users" ON lessons
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Política para UPDATE: Permitir que usuários autenticados atualizem aulas
CREATE POLICY "Enable update for authenticated users" ON lessons
    FOR UPDATE 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

-- Política para DELETE: Permitir que usuários autenticados deletem aulas
CREATE POLICY "Enable delete for authenticated users" ON lessons
    FOR DELETE 
    TO authenticated 
    USING (true);

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se as políticas foram criadas corretamente
SELECT 'Verificando políticas após correção...' as status;
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
WHERE tablename = 'lessons'
ORDER BY policyname;

-- Verificar se RLS ainda está habilitado
SELECT 'Verificando RLS após correção...' as status;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'lessons';

-- =====================================================
-- TESTE DE INSERÇÃO (OPCIONAL)
-- =====================================================
-- Descomente as linhas abaixo para testar a inserção
-- (substitua 'test-module-id' por um ID de módulo real)

-- SELECT 'Testando inserção após correção...' as status;
-- INSERT INTO lessons (module_id, title, description, type, order_index, is_published)
-- VALUES ('test-module-id', 'Teste RLS Corrigido', 'Aula de teste após correção', 'text', 1, false)
-- RETURNING *;