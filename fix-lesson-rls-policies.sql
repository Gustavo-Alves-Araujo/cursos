-- Corrigir políticas RLS para tabela lessons
-- Este script deve ser executado no Supabase SQL Editor

-- Primeiro, vamos verificar as políticas existentes
SELECT * FROM pg_policies WHERE tablename = 'lessons';

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON lessons;
DROP POLICY IF EXISTS "Enable read access for all users" ON lessons;
DROP POLICY IF EXISTS "Enable update for users based on email" ON lessons;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON lessons;

-- Criar políticas corretas para lessons
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

-- Verificar se as políticas foram criadas
SELECT * FROM pg_policies WHERE tablename = 'lessons';
