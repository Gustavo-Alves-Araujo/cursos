-- Desabilitar RLS nas tabelas de carteirinhas
-- Execute este script no SQL Editor do Supabase

-- Desabilitar RLS em student_cards
ALTER TABLE student_cards DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS em card_settings
ALTER TABLE card_settings DISABLE ROW LEVEL SECURITY;

-- Verificar status
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('card_settings', 'student_cards')
ORDER BY tablename;
n