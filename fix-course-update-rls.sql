-- Script para corrigir políticas RLS para edição de cursos
-- Execute este script no Supabase SQL Editor

-- 1. Verificar políticas atuais
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'courses'
ORDER BY policyname;

-- 2. Remover políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Only admins can manage courses" ON courses;
DROP POLICY IF EXISTS "Admins can view all courses" ON courses;
DROP POLICY IF EXISTS "Users can view own courses" ON courses;
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
DROP POLICY IF EXISTS "courses_policy" ON courses;
DROP POLICY IF EXISTS "Courses: Allow all for authenticated users" ON courses;

-- 3. Criar política simples e permissiva para usuários autenticados
CREATE POLICY "courses_allow_all_authenticated" ON courses
    FOR ALL 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

-- 4. Verificar se a política foi criada
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'courses'
ORDER BY policyname;

-- 5. Testar se a atualização funciona
-- (Execute uma consulta de teste aqui se necessário)
