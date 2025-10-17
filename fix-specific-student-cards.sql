-- Verificar se o aluno específico tem carteirinhas
-- Execute este script para debugar o problema

-- 1. Ver ID e email do usuário logado (substitua dbc699ba-c6d3-4423-8c3e-2060200ff667)
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE id = 'dbc699ba-c6d3-4423-8c3e-2060200ff667';

-- 2. Ver carteirinhas deste usuário específico
SELECT 
  sc.*,
  c.title as course_title
FROM student_cards sc
LEFT JOIN courses c ON c.id = sc.course_id
WHERE sc.user_id = 'dbc699ba-c6d3-4423-8c3e-2060200ff667';

-- 3. Ver matrículas deste usuário específico
SELECT 
  ce.*,
  c.title as course_title
FROM course_enrollments ce
LEFT JOIN courses c ON c.id = ce.course_id
WHERE ce.user_id = 'dbc699ba-c6d3-4423-8c3e-2060200ff667';

-- 4. Criar carteirinhas para este usuário específico (se não existir)
INSERT INTO student_cards (
  user_id,
  course_id,
  enrollment_date,
  available_date,
  is_generated
)
SELECT 
  ce.user_id,
  ce.course_id,
  ce.created_at,
  ce.created_at + INTERVAL '0 days',
  FALSE
FROM course_enrollments ce
WHERE ce.user_id = 'dbc699ba-c6d3-4423-8c3e-2060200ff667'
AND NOT EXISTS (
  SELECT 1 FROM student_cards sc
  WHERE sc.user_id = ce.user_id
  AND sc.course_id = ce.course_id
)
ON CONFLICT (user_id, course_id) DO NOTHING
RETURNING *;

-- 5. Verificar novamente após inserção
SELECT 
  sc.*,
  c.title as course_title,
  CASE 
    WHEN sc.available_date <= NOW() THEN 'Disponível'
    ELSE 'Aguardando ' || EXTRACT(DAY FROM (sc.available_date - NOW())) || ' dias'
  END as status
FROM student_cards sc
JOIN courses c ON c.id = sc.course_id
WHERE sc.user_id = 'dbc699ba-c6d3-4423-8c3e-2060200ff667';
