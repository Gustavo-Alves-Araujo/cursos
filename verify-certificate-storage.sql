-- Script para verificar configuração do storage de certificados
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o bucket 'certificates' existe
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'certificates';

-- 2. Verificar políticas do bucket 'certificates'
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

-- 3. Verificar se existem arquivos no bucket (se houver)
SELECT 
  name,
  bucket_id,
  created_at
FROM storage.objects 
WHERE bucket_id = 'certificates'
ORDER BY created_at DESC
LIMIT 5;

-- 4. Testar se consegue inserir um arquivo de teste (opcional)
-- ⚠️ Descomente apenas para teste
/*
INSERT INTO storage.objects (bucket_id, name, size, content_type)
VALUES ('certificates', 'test-file.txt', 0, 'text/plain');
*/
