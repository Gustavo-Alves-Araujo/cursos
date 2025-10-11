-- Criar tabela para configurações da loja
CREATE TABLE IF NOT EXISTS store_settings (
  id SERIAL PRIMARY KEY,
  store_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configuração padrão (vazia)
INSERT INTO store_settings (store_url) VALUES (NULL) ON CONFLICT DO NOTHING;

-- Habilitar RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Política para permitir que admins leiam e atualizem
CREATE POLICY "Admins can manage store settings" ON store_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Política para permitir que todos leiam (para alunos acessarem a URL)
CREATE POLICY "Everyone can read store settings" ON store_settings
  FOR SELECT USING (true);
