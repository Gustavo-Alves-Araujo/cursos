-- =====================================================
-- CORREÇÃO: Acesso de admin às matrículas
-- =====================================================
-- Execute este script para garantir que admins possam gerenciar matrículas

-- 1. Remover políticas existentes de course_enrollments
DROP POLICY IF EXISTS "Users can view own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can create own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can update own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON course_enrollments;

-- 2. Recriar políticas mais simples
-- Usuários podem ver suas próprias matrículas
CREATE POLICY "Users can view own enrollments" ON course_enrollments
  FOR SELECT USING (user_id = auth.uid());

-- Usuários podem criar suas próprias matrículas
CREATE POLICY "Users can create own enrollments" ON course_enrollments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Usuários podem atualizar suas próprias matrículas
CREATE POLICY "Users can update own enrollments" ON course_enrollments
  FOR UPDATE USING (user_id = auth.uid());

-- Política para admins gerenciarem todas as matrículas
CREATE POLICY "Admins can manage all enrollments" ON course_enrollments
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- =====================================================
-- CORREÇÃO CONCLUÍDA
-- =====================================================
-- Agora admins podem ver e gerenciar todas as matrículas
