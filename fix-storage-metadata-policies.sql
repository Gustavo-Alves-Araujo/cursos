-- =====================================================
-- CORREÇÃO DE POLÍTICAS DE STORAGE PARA METADATA
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. VERIFICAR ESTRUTURA DA TABELA storage.objects
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'objects' 
  AND table_schema = 'storage'
ORDER BY ordinal_position;

-- 2. VERIFICAR POLÍTICAS ATUAIS DO STORAGE
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

-- 3. REMOVER POLÍTICAS CONFLITANTES
-- =====================================================
-- Remover todas as políticas que podem estar causando conflito
DROP POLICY IF EXISTS "Admins can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Public can view certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete certificates" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload certificates" ON storage.objects;

-- 4. CRIAR POLÍTICAS CORRETAS PARA O BUCKET 'certificates'
-- =====================================================

-- Política para upload (INSERT) - mais permissiva para evitar problemas de metadata
CREATE POLICY "Allow certificate uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'certificates' AND
    auth.role() = 'authenticated'
  );

-- Política para visualização (SELECT) - pública
CREATE POLICY "Allow certificate downloads" ON storage.objects
  FOR SELECT USING (bucket_id = 'certificates');

-- Política para atualização (UPDATE) - apenas admins
CREATE POLICY "Admins can update certificates" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Política para exclusão (DELETE) - apenas admins
CREATE POLICY "Admins can delete certificates" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 5. VERIFICAR SE O BUCKET 'certificates' EXISTE E ESTÁ CONFIGURADO
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

-- 6. SE O BUCKET NÃO EXISTIR, CRIAR MANUALMENTE
-- =====================================================
-- ⚠️ IMPORTANTE: Execute este comando apenas se o bucket não existir
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'certificates',
--   'certificates', 
--   true,
--   10485760, -- 10MB
--   ARRAY['image/png', 'image/jpeg', 'application/pdf']
-- );

-- 7. VERIFICAR POLÍTICAS CRIADAS
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
  AND policyname LIKE '%certificate%'
ORDER BY policyname;

-- 8. TESTAR INSERÇÃO DE ARQUIVO (OPCIONAL)
-- =====================================================
-- ⚠️ Descomente apenas para teste manual
/*
-- Teste de inserção simples (sem coluna size)
INSERT INTO storage.objects (
  bucket_id, 
  name, 
  content_type,
  owner
) VALUES (
  'certificates', 
  'test-metadata.txt', 
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
