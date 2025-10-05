-- =====================================================
-- SOLUÇÃO TEMPORÁRIA: Desabilitar RLS na tabela users
-- =====================================================
-- Execute este script para resolver o problema de recursão
-- e permitir o login funcionar

-- 1. Desabilitar RLS temporariamente na tabela users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas da tabela users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- =====================================================
-- TESTE O LOGIN AGORA
-- =====================================================
-- Com o RLS desabilitado, o login deve funcionar
-- Depois que confirmar que está funcionando, execute o próximo arquivo
-- para reativar o RLS com políticas mais simples
