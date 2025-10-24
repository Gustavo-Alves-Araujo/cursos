-- Script para verificar e criar as tabelas de vitrines se necessário
-- Execute este script no Supabase SQL Editor

-- Verificar se as tabelas existem
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('showcases', 'showcase_courses');

-- Se as tabelas não existirem, criar agora
-- Tabela de Vitrines
CREATE TABLE IF NOT EXISTS public.showcases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de relacionamento entre Vitrines e Cursos
CREATE TABLE IF NOT EXISTS public.showcase_courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    showcase_id UUID NOT NULL REFERENCES public.showcases(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(showcase_id, course_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_showcase_courses_showcase_id ON public.showcase_courses(showcase_id);
CREATE INDEX IF NOT EXISTS idx_showcase_courses_course_id ON public.showcase_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_showcases_is_active ON public.showcases(is_active);

-- Habilitar RLS
ALTER TABLE public.showcases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_courses ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Allow all on showcases" ON public.showcases;
DROP POLICY IF EXISTS "Allow all on showcase_courses" ON public.showcase_courses;
DROP POLICY IF EXISTS "Admins can do everything on showcases" ON public.showcases;
DROP POLICY IF EXISTS "Students can view active showcases" ON public.showcases;
DROP POLICY IF EXISTS "Admins can do everything on showcase_courses" ON public.showcase_courses;
DROP POLICY IF EXISTS "Students can view showcase_courses from active showcases" ON public.showcase_courses;

-- Políticas MUITO SIMPLES - permitir tudo temporariamente
CREATE POLICY "Allow all on showcases" ON public.showcases
    FOR ALL
    USING (true);

CREATE POLICY "Allow all on showcase_courses" ON public.showcase_courses
    FOR ALL
    USING (true);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_showcases_updated_at ON public.showcases;
CREATE TRIGGER update_showcases_updated_at BEFORE UPDATE ON public.showcases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verificar se tudo foi criado corretamente
SELECT 
    'showcases' as table_name,
    COUNT(*) as row_count
FROM public.showcases
UNION ALL
SELECT 
    'showcase_courses' as table_name,
    COUNT(*) as row_count
FROM public.showcase_courses;

-- Verificar políticas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('showcases', 'showcase_courses')
ORDER BY tablename, policyname;
