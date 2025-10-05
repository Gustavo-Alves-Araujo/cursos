-- =====================================================
-- CORREÇÃO: Políticas RLS para módulos e aulas
-- =====================================================
-- Execute este script para garantir que admins possam criar/editar módulos e aulas

-- 1. Remover políticas existentes de módulos
DROP POLICY IF EXISTS "Users can view modules of published courses" ON modules;
DROP POLICY IF EXISTS "Users can view modules of enrolled courses" ON modules;
DROP POLICY IF EXISTS "Admins can manage all modules" ON modules;

-- 2. Recriar políticas de módulos
-- Todos podem ver módulos de cursos publicados
CREATE POLICY "Anyone can view published modules" ON modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE id = modules.course_id AND is_published = true
    )
  );

-- Usuários matriculados podem ver módulos de seus cursos
CREATE POLICY "Enrolled users can view modules" ON modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM course_enrollments 
      WHERE course_id = modules.course_id AND user_id = auth.uid()
    )
  );

-- Admins podem gerenciar todos os módulos
CREATE POLICY "Admins can manage all modules" ON modules
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- 3. Remover políticas existentes de aulas
DROP POLICY IF EXISTS "Users can view lessons of published courses" ON lessons;
DROP POLICY IF EXISTS "Users can view lessons of enrolled courses" ON lessons;
DROP POLICY IF EXISTS "Admins can manage all lessons" ON lessons;

-- 4. Recriar políticas de aulas
-- Todos podem ver aulas de cursos publicados
CREATE POLICY "Anyone can view published lessons" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM modules m
      JOIN courses c ON c.id = m.course_id
      WHERE m.id = lessons.module_id AND c.is_published = true
    )
  );

-- Usuários matriculados podem ver aulas de seus cursos
CREATE POLICY "Enrolled users can view lessons" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM modules m
      JOIN course_enrollments ce ON ce.course_id = m.course_id
      WHERE m.id = lessons.module_id AND ce.user_id = auth.uid()
    )
  );

-- Admins podem gerenciar todas as aulas
CREATE POLICY "Admins can manage all lessons" ON lessons
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- =====================================================
-- CORREÇÃO CONCLUÍDA
-- =====================================================
-- Agora admins podem criar e editar módulos e aulas
