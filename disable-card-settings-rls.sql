-- Desabilita RLS na tabela card_settings
-- Execute este script no SQL Editor do Supabase

ALTER TABLE card_settings DISABLE ROW LEVEL SECURITY;

-- Remove as políticas existentes (opcional, mas recomendado para limpeza)
DROP POLICY IF EXISTS "Admins podem ver configurações" ON card_settings;
DROP POLICY IF EXISTS "Admins podem inserir configurações" ON card_settings;
DROP POLICY IF EXISTS "Admins podem atualizar configurações" ON card_settings;
DROP POLICY IF EXISTS "Admins podem deletar configurações" ON card_settings;

-- Verifica o status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'card_settings';
