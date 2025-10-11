-- Adicionar coluna second_page_url na tabela certificates
ALTER TABLE certificates 
ADD COLUMN IF NOT EXISTS second_page_url TEXT;

-- Comentário explicativo
COMMENT ON COLUMN certificates.second_page_url IS 'URL da segunda página do certificado (opcional)';
