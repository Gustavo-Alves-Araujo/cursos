-- Verificar e corrigir roles dos usuários
-- Execute este script no SQL Editor do Supabase

-- 1. Ver todos os usuários na tabela users
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM users
ORDER BY created_at DESC;

-- 2. Ver usuários sem role ou com role NULL
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM users
WHERE role IS NULL OR role = ''
ORDER BY created_at DESC;

-- 3. Ver quantos usuários de cada role
SELECT 
  COALESCE(role, 'NULL') as role,
  COUNT(*) as quantidade
FROM users
GROUP BY role
ORDER BY quantidade DESC;

-- 4. Comparar auth.users com a tabela users
SELECT 
  au.id,
  au.email,
  u.id as users_table_id,
  u.role,
  CASE 
    WHEN u.id IS NULL THEN 'Não existe na tabela users'
    WHEN u.role IS NULL THEN 'Role NULL'
    WHEN u.role = '' THEN 'Role vazia'
    ELSE 'OK'
  END as status
FROM auth.users au
LEFT JOIN users u ON u.id = au.id
ORDER BY au.created_at DESC;

-- 5. CORRIGIR: Atualizar todos os usuários sem role para 'student'
-- (Execute apenas se necessário)
UPDATE users
SET role = 'student'
WHERE role IS NULL 
   OR role = ''
   OR role NOT IN ('admin', 'student')
RETURNING id, email, name, role;

-- 6. Verificar resultado final
SELECT 
  role,
  COUNT(*) as quantidade
FROM users
GROUP BY role
ORDER BY quantidade DESC;
