-- =====================================================
-- CORREÇÃO DE RLS PARA UPLOAD DE CERTIFICADOS
-- =====================================================
-- Execute este script no Supabase SQL Editor para corrigir o problema de RLS

-- 1. VERIFICAR POLÍTICAS ATUAIS
-- =====================================================
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
WHERE tablename IN ('certificate_templates', 'certificates')
ORDER BY tablename, policyname;

-- 2. REMOVER POLÍTICAS CONFLITANTES
-- =====================================================
-- Remover políticas que podem estar causando conflito
DROP POLICY IF EXISTS "Admins can manage certificate templates" ON certificate_templates;
DROP POLICY IF EXISTS "Authenticated users can read certificate templates" ON certificate_templates;
DROP POLICY IF EXISTS "Users can view own certificates" ON certificates;
DROP POLICY IF EXISTS "Admins can view all certificates" ON certificates;
DROP POLICY IF EXISTS "Admins can insert certificates" ON certificates;

-- 3. CRIAR POLÍTICAS CORRETAS PARA CERTIFICATE_TEMPLATES
-- =====================================================
-- Admins podem fazer tudo (criar, editar, deletar)
CREATE POLICY "Admins can manage certificate templates" ON certificate_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Qualquer usuário autenticado pode ler templates (necessário para emissão)
CREATE POLICY "Authenticated users can read certificate templates" ON certificate_templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- 4. CRIAR POLÍTICAS CORRETAS PARA CERTIFICATES
-- =====================================================
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

-- Admins podem inserir certificados (para emissão automática)
CREATE POLICY "Admins can insert certificates" ON certificates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 5. VERIFICAR E CORRIGIR POLÍTICAS DE STORAGE
-- =====================================================
-- Remover políticas conflitantes do storage
DROP POLICY IF EXISTS "Admins can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all certificates" ON storage.objects;

-- Criar políticas corretas para o bucket certificates
-- Admins podem fazer upload de certificados
CREATE POLICY "Admins can upload certificates" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Qualquer um pode visualizar certificados (para URLs públicas)
CREATE POLICY "Anyone can view certificates" ON storage.objects
  FOR SELECT USING (bucket_id = 'certificates');

-- 6. VERIFICAR SE O BUCKET 'certificates' EXISTE
-- =====================================================
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'certificates';

-- 7. TESTAR ACESSO AOS TEMPLATES
-- =====================================================
-- Testar se consegue ler templates
SELECT COUNT(*) as template_count 
FROM certificate_templates;

-- Testar template específico (substitua pelo ID do seu curso)
SELECT 
  ct.id,
  ct.course_id,
  ct.background_image_url,
  c.title as course_title
FROM certificate_templates ct
LEFT JOIN courses c ON c.id = ct.course_id
WHERE ct.course_id = '399b1247-3464-44fd-89d3-8f46787c423c';

-- 8. VERIFICAR POLÍTICAS FINAIS
-- =====================================================
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
WHERE tablename IN ('certificate_templates', 'certificates')
ORDER BY tablename, policyname;

-- Verificar políticas de storage
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
WHERE tablename = 'objects' 
  AND policyname LIKE '%certificates%'
ORDER BY policyname;
