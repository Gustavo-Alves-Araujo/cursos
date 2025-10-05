-- =====================================================
-- CORREÇÃO: Problema ao criar cursos
-- =====================================================
-- Execute este script para corrigir o erro ao criar cursos

-- 1. Verificar se a coluna instructor_name existe e tem valor padrão
ALTER TABLE courses ALTER COLUMN instructor_name SET DEFAULT 'Instrutor';

-- 2. Atualizar cursos existentes que podem ter instructor_name NULL
UPDATE courses SET instructor_name = 'Instrutor' WHERE instructor_name IS NULL;

-- 3. Tornar instructor_name NOT NULL se ainda não for
ALTER TABLE courses ALTER COLUMN instructor_name SET NOT NULL;

-- =====================================================
-- CORREÇÃO CONCLUÍDA
-- =====================================================
-- Agora a criação de cursos deve funcionar corretamente
