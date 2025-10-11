-- =====================================================
-- ADICIONAR COLUNA CPF NA TABELA USERS
-- Site de Cursos - Adição de CPF
-- =====================================================
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna CPF na tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Adicionar comentário na coluna para documentação
COMMENT ON COLUMN users.cpf IS 'CPF do usuário (formato: 000.000.000-00 ou apenas números)';

-- Criar índice para busca por CPF (opcional, mas recomendado)
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);

-- Atualizar a função handle_new_user para incluir CPF nos metadados
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, cpf)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    'student',
    NEW.raw_user_meta_data->>'cpf'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se a coluna foi adicionada corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
