-- Script para adicionar a coluna 'support_materials' na tabela 'lessons'
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar a coluna 'support_materials' se ela não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lessons' 
        AND column_name = 'support_materials'
    ) THEN
        ALTER TABLE lessons 
        ADD COLUMN support_materials JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 2. Atualizar registros existentes que possam ter NULL para um array vazio
UPDATE lessons 
SET support_materials = '[]'::jsonb 
WHERE support_materials IS NULL;

-- 3. Verificar a estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'lessons' 
    AND column_name = 'support_materials';

-- 4. Verificar alguns registros de exemplo
SELECT 
    id,
    title,
    type,
    support_materials
FROM 
    lessons 
LIMIT 5;
