-- =====================================================
-- REATIVAR RLS COM POLÍTICAS SIMPLES
-- =====================================================
-- Execute este script APENAS após confirmar que o login está funcionando
-- com o RLS desabilitado

-- 1. Reabilitar RLS na tabela users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas mais simples (sem recursão)
-- Usuários podem ver apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Permitir inserção de novos usuários (para registro)
CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Política simples para admins (sem subconsulta recursiva)
-- NOTA: Esta política permite que qualquer usuário autenticado veja todos os usuários
-- Se quiser restringir apenas para admins, você precisará fazer isso no código da aplicação
CREATE POLICY "Authenticated users can view all users" ON users
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- RLS REATIVADO COM POLÍTICAS SIMPLES
-- =====================================================
-- Agora o RLS está ativo mas sem recursão
-- O controle de acesso por role deve ser feito no código da aplicação
