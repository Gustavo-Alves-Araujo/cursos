-- Script para corrigir políticas RLS de certificados
-- Execute este script no Supabase SQL Editor

-- 1. Remover políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Admins can manage certificate templates" ON certificate_templates;
DROP POLICY IF EXISTS "Authenticated users can read certificate templates" ON certificate_templates;

-- 2. Criar políticas corretas para certificate_templates
-- Admins podem fazer tudo (criar, editar, deletar)
CREATE POLICY "Admins can manage certificate templates" ON certificate_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Qualquer usuário autenticado pode ler templates (necessário para emissão de certificados)
CREATE POLICY "Authenticated users can read certificate templates" ON certificate_templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- 3. Verificar se as políticas foram criadas corretamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'certificate_templates'
ORDER BY policyname;

-- 4. Testar se um usuário autenticado pode ler templates
-- (Execute este teste como usuário não-admin)
SELECT COUNT(*) as template_count 
FROM certificate_templates;

-- 5. Verificar se o template específico é acessível
SELECT 
  ct.id,
  ct.course_id,
  ct.background_image_url,
  c.title as course_title
FROM certificate_templates ct
LEFT JOIN courses c ON c.id = ct.course_id
WHERE ct.course_id = '399b1247-3464-44fd-89d3-8f46787c423c';
