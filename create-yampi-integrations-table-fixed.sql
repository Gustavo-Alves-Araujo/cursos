-- =====================================================
-- CRIAR TABELA YAMPI_INTEGRATIONS - VERSÃO CORRIGIDA
-- Site de Cursos - Integração Yampi
-- =====================================================
-- Execute este script no SQL Editor do Supabase

-- Criar tabela yampi_integrations
CREATE TABLE IF NOT EXISTS yampi_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    product_id TEXT NOT NULL,
    secret_key TEXT NOT NULL,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE yampi_integrations ENABLE ROW LEVEL SECURITY;

-- Política para admins poderem gerenciar integrações
CREATE POLICY "Admins can manage yampi integrations" ON yampi_integrations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Política para leitura pública (necessário para webhook)
CREATE POLICY "Public read access for webhooks" ON yampi_integrations
    FOR SELECT USING (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_yampi_integrations_product_id ON yampi_integrations(product_id);
CREATE INDEX IF NOT EXISTS idx_yampi_integrations_secret_key ON yampi_integrations(secret_key);
CREATE INDEX IF NOT EXISTS idx_yampi_integrations_course_id ON yampi_integrations(course_id);

-- Comentário de sucesso
SELECT 'Tabela yampi_integrations criada com sucesso!' as status;
