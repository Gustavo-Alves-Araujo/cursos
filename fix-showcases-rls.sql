-- Script para corrigir as políticas RLS das tabelas de vitrines
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos remover as políticas existentes (se existirem)
DROP POLICY IF EXISTS "Admins can do everything on showcases" ON public.showcases;
DROP POLICY IF EXISTS "Students can view active showcases" ON public.showcases;
DROP POLICY IF EXISTS "Admins can do everything on showcase_courses" ON public.showcase_courses;
DROP POLICY IF EXISTS "Students can view showcase_courses from active showcases" ON public.showcase_courses;

-- Políticas mais simples e funcionais para showcases
-- Admins podem fazer tudo
CREATE POLICY "Admins can do everything on showcases" ON public.showcases
    FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Estudantes podem ver vitrines ativas
CREATE POLICY "Students can view active showcases" ON public.showcasesa
    FOR SELECT
    USING (is_active = true);

-- Políticas para showcase_courses
-- Admins podem fazer tudo
CREATE POLICY "Admins can do everything on showcase_courses" ON public.showcase_courses
    FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Estudantes podem ver cursos de vitrines ativas
CREATE POLICY "Students can view showcase_courses from active showcases" ON public.showcase_courses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.showcases
            WHERE showcases.id = showcase_courses.showcase_id
            AND showcases.is_active = true
        )
    );

-- Verificar se as políticas foram criadas corretamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('showcases', 'showcase_courses')
ORDER BY tablename, policyname;
