-- Script para tornar o campo short_description opcional na tabela courses
-- Este script remove a restrição NOT NULL do campo short_description

-- Verificar se a coluna existe e se tem restrição NOT NULL
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'courses' 
AND column_name = 'short_description';

-- Alterar a coluna para permitir valores NULL
ALTER TABLE courses 
ALTER COLUMN short_description DROP NOT NULL;

-- Adicionar um valor padrão vazio para registros existentes que possam ter NULL
UPDATE courses 
SET short_description = '' 
WHERE short_description IS NULL;

-- Verificar se a alteração foi aplicada corretamente
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'courses' 
AND column_name = 'short_description';
