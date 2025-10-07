-- =====================================================
-- CRIAR BUCKET DE CERTIFICADOS SE NÃO EXISTIR
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

-- 2. SE NÃO EXISTIR, CRIAR O BUCKET
-- =====================================================
-- ⚠️ Execute apenas se o bucket não existir
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

-- 3. VERIFICAR SE FOI CRIADO
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

-- 4. CRIAR POLÍTICAS BÁSICAS PARA O BUCKET
-- =====================================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Allow certificate uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow certificate downloads" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete certificates" ON storage.objects;

-- Política para upload - qualquer usuário autenticado
CREATE POLICY "Allow certificate uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'certificates' AND
    auth.role() = 'authenticated'
  );

-- Política para download - público
CREATE POLICY "Allow certificate downloads" ON storage.objects
  FOR SELECT USING (bucket_id = 'certificates');

-- Política para update - apenas admins
CREATE POLICY "Admins can update certificates" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Política para delete - apenas admins
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
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%certificate%'
ORDER BY policyname;

-- 6. TESTAR O BUCKET (OPCIONAL)
-- =====================================================
-- ⚠️ Descomente apenas para teste
/*
-- Teste de inserção de arquivo
INSERT INTO storage.objects (
  bucket_id, 
  name, 
  size, 
  content_type,
  owner,
  created_at,
  updated_at
) VALUES (
  'certificates', 
  'test-file.txt', 
  100, 
  'text/plain',
  auth.uid(),
  NOW(),
  NOW()
);

-- Verificar se foi inserido
SELECT 
  name,
  bucket_id,
  size,
  content_type,
  created_at
FROM storage.objects 
WHERE bucket_id = 'certificates'
ORDER BY created_at DESC
LIMIT 1;
*/
