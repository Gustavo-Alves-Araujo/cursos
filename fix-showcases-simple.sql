-- Script SIMPLES para corrigir as políticas RLS das tabelas de vitrines
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos remover as políticas existentes (se existirem)
DROP POLICY IF EXISTS "Admins can do everything on showcases" ON public.showcases;
DROP POLICY IF EXISTS "Students can view active showcases" ON public.showcases;
DROP POLICY IF EXISTS "Admins can do everything on showcase_courses" ON public.showcase_courses;
DROP POLICY IF EXISTS "Students can view showcase_courses from active showcases" ON public.showcase_courses;

-- Políticas MUITO SIMPLES - temporariamente permissivas para testar
-- TODO: Ajustar depois que funcionar

-- Para showcases - permitir tudo temporariamente
CREATE POLICY "Allow all on showcases" ON public.showcases
    FOR ALL
    USING (true);

-- Para showcase_courses - permitir tudo temporariamente  
CREATE POLICY "Allow all on showcase_courses" ON public.showcase_courses
    FOR ALL
    USING (true);

-- Verificar se as políticas foram criadas
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
