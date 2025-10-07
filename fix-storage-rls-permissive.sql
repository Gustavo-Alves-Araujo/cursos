-- =====================================================
-- CRIAR POLÍTICAS MAIS PERMISSIVAS PARA RESOLVER RLS
-- =====================================================
-- Execute este script no Supabase SQL Editor

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
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;

-- 2. REMOVER TODAS AS POLÍTICAS CONFLITANTES
-- =====================================================
-- Remover todas as políticas que podem estar causando problema
DROP POLICY IF EXISTS "Allow certificate uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow certificate downloads" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Public can view certificates" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view certificates" ON storage.objects;
DROP POLICY IF EXISTS "Public can view certificates" ON storage.objects;

-- 3. CRIAR POLÍTICAS SUPER PERMISSIVAS
-- =====================================================

-- Política para INSERT - qualquer usuário autenticado
CREATE POLICY "Allow all certificate uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'certificates' AND
    auth.role() = 'authenticated'
  );

-- Política para SELECT - pública (qualquer um pode ver)
CREATE POLICY "Allow all certificate downloads" ON storage.objects
  FOR SELECT USING (bucket_id = 'certificates');

-- Política para UPDATE - qualquer usuário autenticado
CREATE POLICY "Allow all certificate updates" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'certificates' AND
    auth.role() = 'authenticated'
  );

-- Política para DELETE - qualquer usuário autenticado
CREATE POLICY "Allow all certificate deletes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'certificates' AND
    auth.role() = 'authenticated'
  );

-- 4. VERIFICAR SE O BUCKET 'certificates' EXISTE
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

-- 5. SE O BUCKET NÃO EXISTIR, CRIAR
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

-- 6. VERIFICAR SE FOI CRIADO
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

-- 7. VERIFICAR POLÍTICAS CRIADAS
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

-- 8. TESTAR INSERÇÃO SIMPLES (OPCIONAL)
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
  'test-permissive.txt', 
  'text/plain',
  auth.uid()
);
*/

-- 9. VERIFICAR ARQUIVOS EXISTENTES
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
