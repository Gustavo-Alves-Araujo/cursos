-- ============================================
-- FORÇAR DESATIVAÇÃO TOTAL DO RLS
-- ============================================
-- Este script FORÇA a desativação completa
-- Execute TUDO de uma vez
-- ============================================

-- PASSO 1: Remover TODAS as políticas existentes (qualquer nome)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- PASSO 2: DESATIVAR RLS COMPLETAMENTE
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- PASSO 3: Garantir que o bucket existe e está configurado corretamente
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('course-documents', 'course-documents', true, 52428800)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 52428800;

-- PASSO 4: Verificar resultado
SELECT 
  'RLS Status:' as info,
  relname as tabela,
  relrowsecurity as rls_ativo
FROM pg_class 
WHERE relname = 'objects' 
AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage');

SELECT 
  'Bucket:' as info,
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets 
WHERE id = 'course-documents';

SELECT 
  'Políticas Restantes:' as info,
  COUNT(*) as total
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

