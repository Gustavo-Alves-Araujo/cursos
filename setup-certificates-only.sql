-- Configuração APENAS das tabelas de certificados
-- Execute este script primeiro, depois configure storage manualmente

-- Tabela para templates de certificados
CREATE TABLE IF NOT EXISTS certificate_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  background_image_url TEXT NOT NULL,
  text_config JSONB NOT NULL DEFAULT '{
    "studentName": {
      "x": 400,
      "y": 300,
      "fontSize": 32,
      "fontFamily": "Arial",
      "color": "#000000",
      "textAlign": "center"
    },
    "completionDate": {
      "x": 400,
      "y": 400,
      "fontSize": 20,
      "fontFamily": "Arial",
      "color": "#666666",
      "textAlign": "center"
    }
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para certificados gerados
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES certificate_templates(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  completion_date DATE NOT NULL,
  certificate_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_certificate_templates_course_id ON certificate_templates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_template_id ON certificates(template_id);

-- RLS (Row Level Security) policies
ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Políticas para certificate_templates
-- Admins podem fazer tudo
CREATE POLICY "Admins can manage certificate templates" ON certificate_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Políticas para certificates
-- Usuários podem ver seus próprios certificados
CREATE POLICY "Users can view own certificates" ON certificates
  FOR SELECT USING (user_id = auth.uid());

-- Admins podem ver todos os certificados
CREATE POLICY "Admins can view all certificates" ON certificates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admins podem inserir certificados
CREATE POLICY "Admins can insert certificates" ON certificates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para certificate_templates
CREATE TRIGGER update_certificate_templates_updated_at
  BEFORE UPDATE ON certificate_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE certificate_templates IS 'Templates de certificados para cada curso';
COMMENT ON TABLE certificates IS 'Certificados gerados para usuários';
COMMENT ON COLUMN certificate_templates.text_config IS 'Configuração JSON das posições e estilos do texto';
COMMENT ON COLUMN certificates.certificate_url IS 'URL do certificado gerado (armazenado no Supabase Storage)';
