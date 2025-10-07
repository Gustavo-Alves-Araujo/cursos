-- =====================================================
-- PERMITIR ALUNOS FAZEREM UPLOAD DE CERTIFICADOS
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. REMOVER POLÍTICAS RESTRITIVAS
-- =====================================================
-- Remover políticas que só permitem admins
DROP POLICY IF EXISTS "Admins can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete certificates" ON storage.objects;
DROP POLICY IF EXISTS "Allow certificate uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow certificate downloads" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete certificates" ON storage.objects;
DROP POLICY IF EXISTS "Ultra permissive certificate uploads" ON storage.objects;
DROP POLICY IF EXISTS "Ultra permissive certificate downloads" ON storage.objects;
DROP POLICY IF EXISTS "Ultra permissive certificate updates" ON storage.objects;
DROP POLICY IF EXISTS "Ultra permissive certificate deletes" ON storage.objects;

-- 2. CRIAR POLÍTICAS QUE PERMITEM ALUNOS
-- =====================================================

-- Política para INSERT - QUALQUER usuário autenticado pode fazer upload
CREATE POLICY "Students can upload certificates" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'certificates' AND
    auth.role() = 'authenticated'
  );

-- Política para SELECT - QUALQUER um pode ver certificados (público)
CREATE POLICY "Anyone can view certificates" ON storage.objects
  FOR SELECT USING (bucket_id = 'certificates');

-- Política para UPDATE - QUALQUER usuário autenticado pode atualizar
CREATE POLICY "Students can update certificates" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'certificates' AND
    auth.role() = 'authenticated'
  );

-- Política para DELETE - QUALQUER usuário autenticado pode deletar
CREATE POLICY "Students can delete certificates" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'certificates' AND
    auth.role() = 'authenticated'
  );

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
  AND policyname LIKE '%certificate%'
ORDER BY policyname;

-- 6. TESTAR INSERÇÃO COMO ALUNO (OPCIONAL)
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
  'test-student-upload.txt', 
  'text/plain',
  auth.uid()
);
*/

-- 7. VERIFICAR ARQUIVOS EXISTENTES
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
