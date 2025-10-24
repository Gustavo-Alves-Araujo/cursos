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

-- Policies para showcases
-- Admins podem fazer tudo
CREATE POLICY "Admins can do everything on showcases" ON public.showcases
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Estudantes podem ver vitrines ativas
CREATE POLICY "Students can view active showcases" ON public.showcases
    FOR SELECT
    USING (is_active = true);

-- Policies para showcase_courses
-- Admins podem fazer tudo
CREATE POLICY "Admins can do everything on showcase_courses" ON public.showcase_courses
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
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

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_showcases_updated_at BEFORE UPDATE ON public.showcases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.showcases IS 'Vitrines de cursos que podem ser associadas a cursos específicos';
COMMENT ON TABLE public.showcase_courses IS 'Relacionamento entre vitrines e cursos';

