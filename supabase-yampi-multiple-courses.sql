-- Adicionar suporte a múltiplos cursos para integrações Yampi
-- SOLUÇÃO SIMPLES: Apenas adiciona uma coluna array de UUIDs

-- Adicionar coluna para múltiplos cursos (array de UUIDs)
ALTER TABLE yampi_integrations 
ADD COLUMN IF NOT EXISTS course_ids UUID[] DEFAULT '{}';

-- Criar índice para melhor performance em buscas
CREATE INDEX IF NOT EXISTS idx_yampi_integrations_course_ids 
ON yampi_integrations USING GIN (course_ids);

-- Comentário
COMMENT ON COLUMN yampi_integrations.course_ids IS 'Array de IDs de cursos vinculados (suporta múltiplos cursos)';

-- NOTA: A coluna course_id é MANTIDA para compatibilidade
-- O sistema funciona assim:
-- 1. Se course_ids tiver valores → usa múltiplos cursos
-- 2. Se course_ids estiver vazio mas course_id tiver valor → usa o curso único
-- 3. Isso garante 100% de compatibilidade com integrações existentes

