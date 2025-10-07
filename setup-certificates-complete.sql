-- =====================================================
-- CONFIGURAÇÃO COMPLETA DO SISTEMA DE CERTIFICADOS
-- =====================================================
-- Execute este script no Supabase SQL Editor para configurar todo o sistema de certificados

-- =====================================================
-- 1. CONFIGURAÇÃO DAS TABELAS
-- =====================================================

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

-- =====================================================
-- 2. CONFIGURAÇÃO DE RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS nas tabelas
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

-- Qualquer usuário autenticado pode ler templates (para emissão de certificados)
CREATE POLICY "Authenticated users can read certificate templates" ON certificate_templates
  FOR SELECT USING (auth.role() = 'authenticated');

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

-- =====================================================
-- 3. CONFIGURAÇÃO DE STORAGE BUCKETS
-- =====================================================

-- IMPORTANTE: Os buckets devem ser criados manualmente no painel do Supabase
-- Vá em Storage > Create Bucket e crie os seguintes buckets:

-- 1. Bucket: certificate-templates
--    - Name: certificate-templates
--    - Public: Yes
--    - File size limit: 5242880 (5MB)
--    - Allowed MIME types: image/jpeg, image/png

-- 2. Bucket: certificates  
--    - Name: certificates
--    - Public: Yes
--    - File size limit: 10485760 (10MB)
--    - Allowed MIME types: image/png, image/jpeg, application/pdf

-- Políticas para certificate-templates bucket
CREATE POLICY "Admins can upload certificate templates" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'certificate-templates' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update certificate templates" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'certificate-templates' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete certificate templates" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'certificate-templates' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Anyone can view certificate templates" ON storage.objects
  FOR SELECT USING (bucket_id = 'certificate-templates');

-- Políticas para certificates bucket
CREATE POLICY "Admins can upload certificates" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own certificates" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM certificates 
      WHERE certificates.certificate_url LIKE '%' || name || '%'
      AND certificates.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all certificates" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- 4. FUNÇÕES AUXILIARES
-- =====================================================

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

-- =====================================================
-- 5. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE certificate_templates IS 'Templates de certificados para cada curso';
COMMENT ON TABLE certificates IS 'Certificados gerados para usuários';
COMMENT ON COLUMN certificate_templates.text_config IS 'Configuração JSON das posições e estilos do texto';
COMMENT ON COLUMN certificates.certificate_url IS 'URL do certificado gerado (armazenado no Supabase Storage)';

-- =====================================================
-- 6. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('certificate_templates', 'certificates')
ORDER BY table_name;

-- Verificar se os buckets foram criados (execute após criar manualmente)
-- SELECT 
--   id,
--   name,
--   public,
--   file_size_limit,
--   allowed_mime_types,
--   created_at
-- FROM storage.buckets 
-- WHERE id IN ('certificate-templates', 'certificates')
-- ORDER BY created_at;

-- =====================================================
-- INSTRUÇÕES PÓS-EXECUÇÃO
-- =====================================================

-- 1. Crie os buckets manualmente no painel do Supabase:
--    - certificate-templates (público, 5MB, image/jpeg, image/png)
--    - certificates (público, 10MB, image/png, image/jpeg, application/pdf)

-- 2. Teste o sistema:
--    - Acesse /admin/certificates como admin
--    - Crie um template para um curso
--    - Complete um curso como estudante
--    - Emita um certificado

-- 3. Verifique as permissões:
--    - Admins podem gerenciar templates e ver todos os certificados
--    - Usuários podem ver apenas seus próprios certificados
--    - Templates são públicos para visualização
