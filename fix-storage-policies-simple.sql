-- =====================================================
-- CORREÇÃO SIMPLES DE POLÍTICAS DE STORAGE
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. VERIFICAR ESTRUTURA DA TABELA storage.objects
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'objects' 
  AND table_schema = 'storage'
ORDER BY ordinal_position;

-- 2. VERIFICAR BUCKET 'certificates'
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

-- 3. REMOVER POLÍTICAS CONFLITANTES
-- =====================================================
DROP POLICY IF EXISTS "Allow certificate uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow certificate downloads" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Public can view certificates" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload certificates" ON storage.objects;

-- 4. CRIAR POLÍTICAS SIMPLES E FUNCIONAIS
-- =====================================================

-- Política para upload - qualquer usuário autenticado
CREATE POLICY "Allow certificate uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'certificates' AND
    auth.role() = 'authenticated'
  );

-- Política para visualização - pública
CREATE POLICY "Allow certificate downloads" ON storage.objects
  FOR SELECT USING (bucket_id = 'certificates');

-- Política para atualização - apenas admins
CREATE POLICY "Admins can update certificates" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Política para exclusão - apenas admins
CREATE POLICY "Admins can delete certificates" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

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

-- 6. VERIFICAR ARQUIVOS EXISTENTES (SEM COLUNA SIZE)
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

-- 7. TESTE SIMPLES (OPCIONAL)
-- =====================================================
-- ⚠️ Descomente apenas para teste
/*
-- Teste de inserção simples
INSERT INTO storage.objects (
  bucket_id, 
  name, 
  content_type,
  owner
) VALUES (
  'certificates', 
  'test-simple.txt', 
  'text/plain',
  auth.uid()
);
*/
