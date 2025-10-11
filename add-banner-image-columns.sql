-- Adicionar colunas para imagem do banner
-- Execute este script no Supabase SQL Editor

-- Adicionar colunas para imagem do banner
ALTER TABLE banner_settings 
ADD COLUMN IF NOT EXISTS banner_image_url TEXT,
ADD COLUMN IF NOT EXISTS banner_image_link TEXT;

-- Comentários para documentar as colunas
COMMENT ON COLUMN banner_settings.banner_image_url IS 'URL da imagem do banner';
COMMENT ON COLUMN banner_settings.banner_image_link IS 'Link de destino quando a imagem é clicada';

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'banner_settings' 
ORDER BY ordinal_position;
