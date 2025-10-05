-- =====================================================
-- SOLUÇÃO TEMPORÁRIA: Desabilitar RLS na tabela lessons
-- =====================================================
-- Execute este script para testar se o problema é o RLS

-- 1. Desabilitar RLS temporariamente na tabela lessons
ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas da tabela lessons
DROP POLICY IF EXISTS "Anyone can view published lessons" ON lessons;
DROP POLICY IF EXISTS "Enrolled users can view lessons" ON lessons;
DROP POLICY IF EXISTS "Authenticated users can insert lessons" ON lessons;
DROP POLICY IF EXISTS "Authenticated users can update lessons" ON lessons;
DROP POLICY IF EXISTS "Authenticated users can delete lessons" ON lessons;

-- =====================================================
-- TESTE AGORA
-- =====================================================
-- Com o RLS desabilitado, tente criar uma aula novamente
-- Se funcionar, o problema é nas políticas RLS
