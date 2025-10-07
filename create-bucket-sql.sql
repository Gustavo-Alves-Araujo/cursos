-- =====================================================
-- CRIAR BUCKET E CORRIGIR PROBLEMAS VIA SQL
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. CRIAR BUCKET 'certificates'
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

-- 2. VERIFICAR SE FOI CRIADO
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

-- 3. REMOVER TODAS AS POLÍTICAS EXISTENTES
-- =====================================================
DROP POLICY IF EXISTS "Allow certificate uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow certificate downloads" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Public can view certificates" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view certificates" ON storage.objects;
DROP POLICY IF EXISTS "Students can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Students can update certificates" ON storage.objects;
DROP POLICY IF EXISTS "Students can delete certificates" ON storage.objects;
DROP POLICY IF EXISTS "Ultra permissive certificate uploads" ON storage.objects;
DROP POLICY IF EXISTS "Ultra permissive certificate downloads" ON storage.objects;
DROP POLICY IF EXISTS "Ultra permissive certificate updates" ON storage.objects;
DROP POLICY IF EXISTS "Ultra permissive certificate deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow all deletes" ON storage.objects;

-- 4. CRIAR POLÍTICAS SUPER SIMPLES
-- =====================================================

-- Política para INSERT - SEM RESTRIÇÕES
CREATE POLICY "Allow all uploads" ON storage.objects
  FOR INSERT WITH CHECK (true);

-- Política para SELECT - SEM RESTRIÇÕES
CREATE POLICY "Allow all downloads" ON storage.objects
  FOR SELECT USING (true);

-- Política para UPDATE - SEM RESTRIÇÕES
CREATE POLICY "Allow all updates" ON storage.objects
  FOR UPDATE USING (true);

-- Política para DELETE - SEM RESTRIÇÕES
CREATE POLICY "Allow all deletes" ON storage.objects
  FOR DELETE USING (true);

-- 5. VERIFICAR POLÍTICAS CRIADAS
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
ORDER BY policyname;

-- 6. TESTAR INSERÇÃO SIMPLES
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
  'test-sql.txt', 
  'text/plain',
  auth.uid()
);
*/

-- 7. VERIFICAR SE FUNCIONOU
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
