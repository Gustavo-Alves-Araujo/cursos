-- =====================================================
-- CRIAÇÃO DOS BUCKETS PARA O MÓDULO DE CARTEIRINHAS
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. CRIAR BUCKET PARA TEMPLATES DE CARTEIRINHAS (Admin faz upload)
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-cards-templates', 'student-cards-templates', true)
ON CONFLICT (id) DO NOTHING;

-- 2. CRIAR BUCKET PARA CARTEIRINHAS GERADAS (Alunos baixam)
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-cards', 'student-cards', true)
ON CONFLICT (id) DO NOTHING;

-- 3. CRIAR BUCKET PARA FOTOS DE PERFIL DOS ALUNOS
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-profile-photos', 'student-profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- POLÍTICAS RLS PARA TEMPLATES DE CARTEIRINHAS
-- =====================================================

-- Permitir administradores fazerem upload de templates
CREATE POLICY "Admins podem fazer upload de templates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student-cards-templates' 
  AND (
    auth.jwt() ->> 'role' = 'admin' 
    OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  )
);

-- Permitir administradores atualizarem templates
CREATE POLICY "Admins podem atualizar templates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'student-cards-templates'
  AND (
    auth.jwt() ->> 'role' = 'admin'
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  )
);

-- Permitir administradores deletarem templates
CREATE POLICY "Admins podem deletar templates"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'student-cards-templates'
  AND (
    auth.jwt() ->> 'role' = 'admin'
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  )
);

-- Permitir todos visualizarem templates (público)
CREATE POLICY "Todos podem visualizar templates"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'student-cards-templates');

-- =====================================================
-- POLÍTICAS RLS PARA FOTOS DE PERFIL
-- =====================================================

-- Permitir alunos fazerem upload de suas fotos
CREATE POLICY "Alunos podem fazer upload de foto de perfil"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student-profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir alunos atualizarem suas fotos
CREATE POLICY "Alunos podem atualizar sua foto de perfil"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'student-profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir alunos deletarem suas fotos
CREATE POLICY "Alunos podem deletar sua foto de perfil"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'student-profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir todos visualizarem fotos (público)
CREATE POLICY "Todos podem visualizar fotos de perfil"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'student-profile-photos');

-- =====================================================
-- POLÍTICAS RLS PARA CARTEIRINHAS GERADAS
-- =====================================================

-- Permitir sistema gerar carteirinhas (service_role via API)
CREATE POLICY "Sistema pode gerar carteirinhas"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'student-cards');

-- Permitir sistema atualizar carteirinhas
CREATE POLICY "Sistema pode atualizar carteirinhas"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'student-cards');

-- Permitir todos visualizarem carteirinhas (público)
CREATE POLICY "Todos podem visualizar carteirinhas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'student-cards');

-- Permitir alunos deletarem suas próprias carteirinhas
CREATE POLICY "Alunos podem deletar suas carteirinhas"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'student-cards'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- VERIFICAR CRIAÇÃO DOS BUCKETS
-- =====================================================
SELECT id, name, public, created_at
FROM storage.buckets
WHERE id IN ('student-cards-templates', 'student-cards', 'student-profile-photos')
ORDER BY created_at DESC;
