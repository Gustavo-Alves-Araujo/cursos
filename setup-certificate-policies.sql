-- Políticas para o sistema de certificados
-- NOTA: As políticas de storage devem ser configuradas manualmente no painel do Supabase
-- Vá em Storage > Policies e configure as seguintes políticas:

-- BUCKET: certificate-templates
-- 1. Policy: "Admins can upload certificate templates"
--    - Operation: INSERT
--    - Target roles: authenticated
--    - Policy definition: 
--      bucket_id = 'certificate-templates' AND
--      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')

-- 2. Policy: "Admins can update certificate templates"  
--    - Operation: UPDATE
--    - Target roles: authenticated
--    - Policy definition:
--      bucket_id = 'certificate-templates' AND
--      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')

-- 3. Policy: "Admins can delete certificate templates"
--    - Operation: DELETE  
--    - Target roles: authenticated
--    - Policy definition:
--      bucket_id = 'certificate-templates' AND
--      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')

-- 4. Policy: "Anyone can view certificate templates"
--    - Operation: SELECT
--    - Target roles: public
--    - Policy definition: bucket_id = 'certificate-templates'

-- BUCKET: certificates
-- 1. Policy: "Admins can upload certificates"
--    - Operation: INSERT
--    - Target roles: authenticated  
--    - Policy definition:
--      bucket_id = 'certificates' AND
--      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')

-- 2. Policy: "Users can view their own certificates"
--    - Operation: SELECT
--    - Target roles: authenticated
--    - Policy definition:
--      bucket_id = 'certificates' AND
--      EXISTS (SELECT 1 FROM certificates WHERE certificates.certificate_url LIKE '%' || name || '%' AND certificates.user_id = auth.uid())

-- 3. Policy: "Admins can view all certificates"
--    - Operation: SELECT
--    - Target roles: authenticated
--    - Policy definition:
--      bucket_id = 'certificates' AND
--      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
