-- Adicionar coluna para configuração da segunda página
ALTER TABLE certificate_templates 
ADD COLUMN IF NOT EXISTS second_page_config JSONB DEFAULT NULL;

-- Comentário para documentar a coluna
COMMENT ON COLUMN certificate_templates.second_page_config IS 'Configuração da segunda página do certificado incluindo conteúdo programático e opções de exibição';
