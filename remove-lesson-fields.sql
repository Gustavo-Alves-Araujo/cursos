-- Script para remover campos description e duration da tabela lessons
-- e campo description da tabela courses

-- 1. Primeiro, vamos tornar as colunas opcionais (nullable)
-- para não quebrar dados existentes

-- Atualizar tabela lessons
ALTER TABLE lessons 
ALTER COLUMN description DROP NOT NULL;

ALTER TABLE lessons 
ALTER COLUMN duration DROP NOT NULL;

-- Atualizar tabela courses  
ALTER TABLE courses 
ALTER COLUMN description DROP NOT NULL;

-- 2. Opcional: Se você quiser remover as colunas completamente
-- (descomente as linhas abaixo se desejar remover as colunas)

-- ALTER TABLE lessons DROP COLUMN description;
-- ALTER TABLE lessons DROP COLUMN duration;
-- ALTER TABLE courses DROP COLUMN description;

-- 3. Verificar se as alterações foram aplicadas
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'lessons' 
AND column_name IN ('description', 'duration');

SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'courses' 
AND column_name = 'description';
