-- =====================================================
-- CORREÇÃO DE POLÍTICAS DE STORAGE PARA CERTIFICADOS
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. VERIFICAR SE O BUCKET 'certificates' EXISTE
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

-- 2. REMOVER TODAS AS POLÍTICAS CONFLITANTES DO STORAGE
-- =====================================================
-- Remover políticas antigas que podem estar causando conflito
DROP POLICY IF EXISTS "Admins can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all certificates" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view certificates" ON storage.objects;
DROP POLICY IF EXISTS "Public can view certificates" ON storage.objects;

-- 3. CRIAR POLÍTICAS CORRETAS PARA O BUCKET 'certificates'
-- =====================================================

-- Política para upload de certificados (apenas admins)
CREATE POLICY "Admins can upload certificates" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Política para visualização de certificados (público)
CREATE POLICY "Public can view certificates" ON storage.objects
  FOR SELECT USING (bucket_id = 'certificates');

-- Política para atualização de certificados (apenas admins)
CREATE POLICY "Admins can update certificates" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Política para exclusão de certificados (apenas admins)
CREATE POLICY "Admins can delete certificates" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 4. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
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
WHERE tablename = 'objects' 
  AND policyname LIKE '%certificates%'
ORDER BY policyname;

-- 5. TESTAR SE CONSEGUE FAZER UPLOAD (OPCIONAL)
-- =====================================================
-- ⚠️ Descomente apenas para teste manual
/*
-- Teste de inserção de arquivo (substitua pelos valores corretos)
INSERT INTO storage.objects (
  bucket_id, 
  name, 
  size, 
  content_type,
  owner
) VALUES (
  'certificates', 
  'test-file.txt', 
  0, 
  'text/plain',
  auth.uid()
);
*/

-- 6. VERIFICAR CONFIGURAÇÃO DO BUCKET
-- =====================================================
-- Verificar se o bucket está público
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'certificates';

-- 7. VERIFICAR ARQUIVOS EXISTENTES NO BUCKET
-- =====================================================
SELECT 
  name,
  bucket_id,
  size,
  content_type,
  created_at
FROM storage.objects 
WHERE bucket_id = 'certificates'
ORDER BY created_at DESC
LIMIT 10;
