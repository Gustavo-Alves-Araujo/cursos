-- Script para desabilitar temporariamente RLS em certificados (APENAS PARA TESTE)
-- ⚠️ ATENÇÃO: Este script remove a segurança. Use apenas para debug!

-- 1. Desabilitar RLS temporariamente
ALTER TABLE certificate_templates DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se foi desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'certificate_templates';

-- 3. Testar se agora consegue ler templates
SELECT COUNT(*) as template_count 
FROM certificate_templates;

-- 4. Testar template específico
SELECT 
  ct.id,
  ct.course_id,
  ct.background_image_url,
  c.title as course_title
FROM certificate_templates ct
LEFT JOIN courses c ON c.id = ct.course_id
WHERE ct.course_id = '399b1247-3464-44fd-89d3-8f46787c423c';

-- ⚠️ IMPORTANTE: Após o teste, reabilite o RLS com o script fix-certificate-rls-policies.sql
