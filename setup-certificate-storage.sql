-- Configuração do storage para certificados
-- NOTA: Os buckets devem ser criados manualmente no painel do Supabase
-- Vá em Storage > Create Bucket e crie os seguintes buckets:

-- 1. Bucket: certificate-templates
--    - Public: Yes
--    - File size limit: 5MB
--    - Allowed MIME types: image/jpeg, image/png

-- 2. Bucket: certificates  
--    - Public: Yes
--    - File size limit: 10MB
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

-- Comentários
COMMENT ON TABLE storage.buckets IS 'Buckets para armazenamento de templates e certificados';
