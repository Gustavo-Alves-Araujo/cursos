-- Criar tabela para configurações do banner
CREATE TABLE IF NOT EXISTS banner_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  welcome_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configuração padrão
INSERT INTO banner_settings (welcome_message) 
VALUES ('') 
ON CONFLICT DO NOTHING;

-- Habilitar RLS
ALTER TABLE banner_settings ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para todos os usuários autenticados
CREATE POLICY "Allow read access to banner settings" ON banner_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir atualização apenas para admins
CREATE POLICY "Allow admin to update banner settings" ON banner_settings
  FOR UPDATE USING (auth.role() = 'authenticated' AND 
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Política para permitir inserção apenas para admins
CREATE POLICY "Allow admin to insert banner settings" ON banner_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND 
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_banner_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_banner_settings_updated_at
  BEFORE UPDATE ON banner_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_banner_settings_updated_at();
