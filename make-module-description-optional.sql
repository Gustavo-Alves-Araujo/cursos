-- Alterar coluna description na tabela modules para ser opcional
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, atualizar registros existentes que têm descrição vazia para NULL
UPDATE modules 
SET description = NULL 
WHERE description = '' OR description IS NULL;

-- 2. Alterar a coluna para permitir NULL
ALTER TABLE modules 
ALTER COLUMN description DROP NOT NULL;

-- 3. Adicionar um valor padrão vazio (opcional)
ALTER TABLE modules 
ALTER COLUMN description SET DEFAULT '';

-- 4. Verificar a estrutura da tabela
SELECT column_name, is_nullable, column_default, data_type 
FROM information_schema.columns 
WHERE table_name = 'modules' 
AND column_name = 'description';
