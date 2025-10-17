-- =====================================================
-- FIX: Configurar Usuário Admin para Carteirinhas
-- =====================================================
-- Execute este script se estiver tendo erro 403 no upload
-- =====================================================

-- 1. VERIFICAR USUÁRIOS EXISTENTES
SELECT id, email, role, name, created_at 
FROM users 
ORDER BY created_at DESC;

-- 2. VERIFICAR SE A COLUNA 'role' EXISTE
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- 3. ADICIONAR COLUNA 'role' SE NÃO EXISTIR
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';

-- 4. TORNAR USUÁRIO ESPECÍFICO ADMIN (substitua o email)
-- ⚠️ IMPORTANTE: Troque 'seu-email@exemplo.com' pelo email do admin real
UPDATE users 
SET role = 'admin' 
WHERE email = 'seu-email@exemplo.com';

-- 5. VERIFICAR SE FOI ATUALIZADO
SELECT id, email, role, name 
FROM users 
WHERE email = 'seu-email@exemplo.com';

-- =====================================================
-- ALTERNATIVA: Tornar o primeiro usuário admin
-- =====================================================
-- Se você não sabe qual email, torne o primeiro usuário admin:

-- Ver todos os usuários:
SELECT id, email, role, name FROM users ORDER BY created_at;

-- Tornar o primeiro usuário admin:
-- UPDATE users SET role = 'admin' WHERE id = (SELECT id FROM users ORDER BY created_at LIMIT 1);

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
-- Listar todos os admins:
SELECT id, email, role, name 
FROM users 
WHERE role = 'admin';

-- Se aparecer pelo menos 1 usuário, está OK! ✅
