-- ============================================
-- CRIAR APENAS A POLÍTICA DE INSERT QUE ESTÁ FALTANDO
-- ============================================
-- Este é o problema: você não tem política de INSERT!
-- Por isso o upload não funciona
-- ============================================

-- Criar política de INSERT para UPLOAD
CREATE POLICY "Permitir upload para autenticados"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-documents'
);

-- Se não funcionar com authenticated, tente com public:
-- Descomente a linha abaixo se a de cima não funcionar:

-- CREATE POLICY "Permitir upload publico"
-- ON storage.objects
-- FOR INSERT
-- TO public
-- WITH CHECK (
--   bucket_id = 'course-documents'
-- );

-- Verificar se foi criada
SELECT 
  policyname,
  cmd as comando,
  roles as papel
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND cmd = 'INSERT';

