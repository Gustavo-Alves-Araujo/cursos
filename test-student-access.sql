-- =====================================================
-- TESTE: Verificar acesso do aluno aos cursos
-- =====================================================
-- Execute este script para testar se o aluno consegue ver os cursos

-- 1. Verificar usuários existentes
SELECT id, email, name, role FROM users;

-- 2. Verificar cursos existentes
SELECT id, title, is_published, instructor_name FROM courses;

-- 3. Verificar matrículas existentes
SELECT 
  ce.id,
  u.email as student_email,
  c.title as course_title,
  ce.enrolled_at
FROM course_enrollments ce
JOIN users u ON u.id = ce.user_id
JOIN courses c ON c.id = ce.course_id;

-- 4. Para testar: criar uma matrícula para um aluno
-- Substitua os IDs pelos reais do seu sistema:
/*
INSERT INTO course_enrollments (user_id, course_id)
VALUES (
  'ID_DO_ALUNO_AQUI',
  'ID_DO_CURSO_AQUI'
);
*/

-- 5. Verificar se o aluno consegue ver o curso após matrícula
-- Execute como o usuário aluno logado:
/*
SELECT 
  c.*,
  m.*,
  l.*
FROM courses c
JOIN course_enrollments ce ON ce.course_id = c.id
JOIN modules m ON m.course_id = c.id
JOIN lessons l ON l.module_id = m.id
WHERE ce.user_id = auth.uid()
AND c.is_published = true
AND m.is_published = true
AND l.is_published = true;
*/
