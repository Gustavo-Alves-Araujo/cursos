-- =====================================================
-- REABILITAR RLS DEPOIS QUE FUNCIONAR
-- =====================================================
-- Execute este script no Supabase SQL Editor APENAS DEPOIS que o upload funcionar

-- 1. REABILITAR RLS NA TABELA storage.objects
-- =====================================================
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. CRIAR POLÍTICAS SIMPLES E FUNCIONAIS
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

-- 3. VERIFICAR SE RLS FOI REABILITADO
-- =====================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  forcerowsecurity
FROM pg_tables 
WHERE tablename = 'objects' 
  AND schemaname = 'storage';

-- 4. VERIFICAR POLÍTICAS CRIADAS
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

-- 5. TESTAR SE AINDA FUNCIONA COM RLS
-- =====================================================
-- ⚠️ Teste manual após reabilitar
/*
SELECT COUNT(*) as object_count 
FROM storage.objects 
WHERE bucket_id = 'certificates';
*/
