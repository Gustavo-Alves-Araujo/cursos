-- =====================================================
-- POLÍTICAS ULTRA PERMISSIVAS PARA RESOLVER RLS
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES
-- =====================================================
-- Remover TODAS as políticas que podem estar causando problema
DROP POLICY IF EXISTS "Allow certificate uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow certificate downloads" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Public can view certificates" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view certificates" ON storage.objects;
DROP POLICY IF EXISTS "Allow all certificate uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all certificate downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all certificate updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow all certificate deletes" ON storage.objects;

-- 2. CRIAR POLÍTICAS ULTRA PERMISSIVAS
-- =====================================================

-- Política para INSERT - SEM RESTRIÇÕES para o bucket certificates
CREATE POLICY "Ultra permissive certificate uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'certificates');

-- Política para SELECT - SEM RESTRIÇÕES para o bucket certificates
CREATE POLICY "Ultra permissive certificate downloads" ON storage.objects
  FOR SELECT USING (bucket_id = 'certificates');

-- Política para UPDATE - SEM RESTRIÇÕES para o bucket certificates
CREATE POLICY "Ultra permissive certificate updates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'certificates');

-- Política para DELETE - SEM RESTRIÇÕES para o bucket certificates
CREATE POLICY "Ultra permissive certificate deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'certificates');

-- 3. VERIFICAR SE O BUCKET 'certificates' EXISTE
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

-- 4. SE O BUCKET NÃO EXISTIR, CRIAR
-- =====================================================
INSERT INTO storage.buckets (
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  created_at,
  updated_at
) VALUES (
  'certificates',
  'certificates', 
  true,
  10485760, -- 10MB
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'application/pdf'],
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 5. VERIFICAR SE FOI CRIADO
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

-- 6. VERIFICAR POLÍTICAS CRIADAS
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%certificate%'
ORDER BY policyname;

-- 7. TESTAR INSERÇÃO SIMPLES (OPCIONAL)
-- =====================================================
-- ⚠️ Descomente apenas para teste
/*
INSERT INTO storage.objects (
  bucket_id, 
  name, 
  content_type,
  owner
) VALUES (
  'certificates', 
  'test-ultra-permissive.txt', 
  'text/plain',
  auth.uid()
);
*/

-- 8. VERIFICAR ARQUIVOS EXISTENTES
-- =====================================================
SELECT 
  name,
  bucket_id,
  content_type,
  created_at
FROM storage.objects 
WHERE bucket_id = 'certificates'
ORDER BY created_at DESC
LIMIT 5;
