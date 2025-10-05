-- =====================================================
-- DEBUG: Verificar acesso de alunos aos cursos
-- =====================================================
-- Execute este script para diagnosticar problemas de acesso

-- 1. Verificar se a tabela course_enrollments existe e tem dados
SELECT 'Verificando tabela course_enrollments...' as status;
SELECT COUNT(*) as total_enrollments FROM course_enrollments;

-- 2. Verificar matrículas por usuário
SELECT 'Matrículas por usuário:' as status;
SELECT 
  u.email,
  u.name,
  u.role,
  COUNT(ce.course_id) as cursos_matriculados
FROM users u
LEFT JOIN course_enrollments ce ON u.id = ce.user_id
GROUP BY u.id, u.email, u.name, u.role
ORDER BY u.email;

-- 3. Verificar cursos disponíveis
SELECT 'Cursos disponíveis:' as status;
SELECT 
  id,
  title,
  is_published,
  created_at
FROM courses
ORDER BY created_at DESC;

-- 4. Verificar matrículas específicas
SELECT 'Detalhes das matrículas:' as status;
SELECT 
  ce.id,
  u.email as user_email,
  c.title as course_title,
  c.is_published,
  ce.enrolled_at
FROM course_enrollments ce
JOIN users u ON ce.user_id = u.id
JOIN courses c ON ce.course_id = c.id
ORDER BY ce.enrolled_at DESC;

-- 5. Verificar tabela lesson_progress
SELECT 'Verificando tabela lesson_progress...' as status;
SELECT COUNT(*) as total_lesson_progress FROM lesson_progress;

-- 6. Verificar progresso por usuário
SELECT 'Progresso por usuário:' as status;
SELECT 
  u.email,
  u.name,
  COUNT(lp.lesson_id) as aulas_concluidas
FROM users u
LEFT JOIN lesson_progress lp ON u.id = lp.user_id
GROUP BY u.id, u.email, u.name
ORDER BY u.email;

-- 7. Verificar políticas RLS
SELECT 'Verificando políticas RLS...' as status;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('course_enrollments', 'lesson_progress');

-- 8. Verificar se RLS está habilitado
SELECT 'Verificando RLS...' as status;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('course_enrollments', 'lesson_progress');

-- =====================================================
-- CORREÇÕES POSSÍVEIS
-- =====================================================

-- Se não houver matrículas, criar uma de teste:
-- INSERT INTO course_enrollments (user_id, course_id)
-- SELECT u.id, c.id
-- FROM users u, courses c
-- WHERE u.role = 'student' AND c.is_published = true
-- LIMIT 1;

-- Se houver problemas de RLS, executar:
-- ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
-- 
-- DROP POLICY IF EXISTS "Users can view own enrollments" ON course_enrollments;
-- CREATE POLICY "Users can view own enrollments" ON course_enrollments
--   FOR SELECT USING (user_id = auth.uid());
