-- Adicionar campo external_link na tabela courses
-- Este campo armazenará o link externo para direcionar usuários que não possuem o curso

ALTER TABLE courses
ADD COLUMN IF NOT EXISTS external_link TEXT;

COMMENT ON COLUMN courses.external_link IS 'Link externo para direcionar usuários que ainda não possuem o curso. Será usado na seção "Cursos que você ainda não tem"';

