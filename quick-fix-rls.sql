-- =====================================================
-- CORREÇÃO RÁPIDA: RLS para criação de aulas
-- =====================================================
-- Execute este script no Supabase SQL Editor para corrigir o problema

-- 1. Remover todas as políticas problemáticas da tabela lessons
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON lessons;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON lessons;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON lessons;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON lessons;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON lessons;
DROP POLICY IF EXISTS "Enable read access for all users" ON lessons;
DROP POLICY IF EXISTS "Enable update for users based on email" ON lessons;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON lessons;
DROP POLICY IF EXISTS "Allow authenticated users to insert lessons" ON lessons;
DROP POLICY IF EXISTS "Lessons: Allow all for authenticated users" ON lessons;

-- 2. Garantir que RLS está habilitado
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- 3. Criar uma única política permissiva para todas as operações
CREATE POLICY "Lessons: Full access for authenticated users" ON lessons
    FOR ALL 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

-- 4. Verificar se funcionou
SELECT 'Políticas criadas:' as status;
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'lessons';

SELECT 'RLS habilitado:' as status;
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'lessons';