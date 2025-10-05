-- =====================================================
-- CORREÇÃO: Política de inserção para módulos
-- =====================================================
-- Execute este script para corrigir o problema de criação de módulos

-- 1. Remover todas as políticas existentes de modules
DROP POLICY IF EXISTS "Anyone can view published modules" ON modules;
DROP POLICY IF EXISTS "Enrolled users can view modules" ON modules;
DROP POLICY IF EXISTS "Admins can manage all modules" ON modules;

-- 2. Recriar políticas mais simples
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

-- Política específica para INSERT - permitir para usuários autenticados
CREATE POLICY "Authenticated users can insert modules" ON modules
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Política específica para UPDATE - permitir para usuários autenticados
CREATE POLICY "Authenticated users can update modules" ON modules
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Política específica para DELETE - permitir para usuários autenticados
CREATE POLICY "Authenticated users can delete modules" ON modules
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- CORREÇÃO CONCLUÍDA
-- =====================================================
-- Agora usuários autenticados podem criar módulos
