-- =====================================================
-- CORREÇÃO: Recursão infinita nas políticas RLS
-- =====================================================
-- Execute este script para corrigir o erro de recursão infinita
-- que está impedindo o login

-- 1. Remover políticas problemáticas
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can view all courses" ON courses;
DROP POLICY IF EXISTS "Only admins can manage courses" ON courses;
DROP POLICY IF EXISTS "Admins can manage all modules" ON modules;
DROP POLICY IF EXISTS "Admins can manage all lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Admins can view all progress" ON lesson_progress;

-- 2. Recriar políticas sem recursão
-- Política para admins verem todos os usuários
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Políticas para admins verem todos os cursos
CREATE POLICY "Admins can view all courses" ON courses
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can manage courses" ON courses
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Política para admins gerenciarem módulos
CREATE POLICY "Admins can manage all modules" ON modules
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Política para admins gerenciarem aulas
CREATE POLICY "Admins can manage all lessons" ON lessons
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Política para admins verem todas as matrículas
CREATE POLICY "Admins can view all enrollments" ON course_enrollments
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Política para admins verem todo o progresso
CREATE POLICY "Admins can view all progress" ON lesson_progress
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- =====================================================
-- CORREÇÃO CONCLUÍDA
-- =====================================================
-- Agora o login deve funcionar sem erro de recursão infinita
