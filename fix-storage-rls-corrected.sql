-- =====================================================
-- CORRIGIR POLÍTICAS RLS DO STORAGE - VERSÃO CORRIGIDA
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. VERIFICAR BUCKET EXISTENTE
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

-- 2. VERIFICAR ESTRUTURA DA TABELA storage.objects
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'objects' 
  AND table_schema = 'storage'
ORDER BY ordinal_position;

-- 3. VERIFICAR POLÍTICAS ATUAIS
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

-- 4. REMOVER TODAS AS POLÍTICAS EXISTENTES
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
DROP POLICY IF EXISTS "Allow certificates upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow certificates download" ON storage.objects;
DROP POLICY IF EXISTS "Allow certificates update" ON storage.objects;
DROP POLICY IF EXISTS "Allow certificates delete" ON storage.objects;

-- 5. CRIAR POLÍTICAS SUPER SIMPLES PARA O BUCKET certificates
-- =====================================================

-- Política para INSERT - SEM RESTRIÇÕES para o bucket certificates
CREATE POLICY "Allow certificates upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'certificates');

-- Política para SELECT - SEM RESTRIÇÕES para o bucket certificates
CREATE POLICY "Allow certificates download" ON storage.objects
  FOR SELECT USING (bucket_id = 'certificates');

-- Política para UPDATE - SEM RESTRIÇÕES para o bucket certificates
CREATE POLICY "Allow certificates update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'certificates');

-- Política para DELETE - SEM RESTRIÇÕES para o bucket certificates
CREATE POLICY "Allow certificates delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'certificates');

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

-- 7. VERIFICAR OBJETOS EXISTENTES
-- =====================================================
SELECT 
  name,
  bucket_id,
  created_at
FROM storage.objects 
WHERE bucket_id = 'certificates'
ORDER BY created_at DESC
LIMIT 5;
