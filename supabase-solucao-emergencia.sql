-- ============================================
-- SOLUÇÃO DE EMERGÊNCIA - DESABILITAR RLS
-- ============================================
-- ⚠️ ATENÇÃO: Isso deixa o bucket totalmente aberto
-- Use apenas temporariamente para testar
-- ============================================

-- OPÇÃO 1: Remover todas as políticas antigas e criar novas PERMISSIVAS
DROP POLICY IF EXISTS "Admins podem fazer upload de documentos" ON storage.objects;
DROP POLICY IF EXISTS "Documentos são públicos para leitura" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem atualizar documentos" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem deletar documentos" ON storage.objects;

-- Criar política SUPER PERMISSIVA para INSERT (permite qualquer usuário autenticado)
CREATE POLICY "Permitir upload para autenticados"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-documents'
);

-- Criar política SUPER PERMISSIVA para SELECT (permite todo mundo)
CREATE POLICY "Permitir leitura pública"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'course-documents');

-- Criar política SUPER PERMISSIVA para UPDATE
CREATE POLICY "Permitir atualização para autenticados"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'course-documents')
WITH CHECK (bucket_id = 'course-documents');

-- Criar política SUPER PERMISSIVA para DELETE
CREATE POLICY "Permitir deleção para autenticados"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'course-documents');

-- Garantir que o bucket existe e está público
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('course-documents', 'course-documents', true, 52428800)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 52428800;

-- OPÇÃO 2 (EMERGÊNCIA TOTAL): Desabilitar RLS completamente no bucket
-- ⚠️ CUIDADO: Isso remove TODA a segurança!
-- Descomente apenas se REALMENTE precisar:

-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Para reativar depois:
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

