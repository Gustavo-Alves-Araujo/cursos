-- =====================================================
-- DEBUG E POPULAR CARTEIRINHAS
-- =====================================================
-- Execute este script para verificar e popular dados
-- =====================================================

-- 1. VERIFICAR SE AS TABELAS EXISTEM
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('card_settings', 'student_cards')
ORDER BY table_name;

-- 2. VERIFICAR CONFIGURAÇÕES SALVAS
SELECT 
  cs.*,
  c.title as course_title
FROM card_settings cs
LEFT JOIN courses c ON c.id = cs.course_id
ORDER BY cs.updated_at DESC;

-- 3. VERIFICAR MATRÍCULAS EXISTENTES
SELECT 
  ce.id,
  ce.user_id,
  ce.course_id,
  ce.created_at as enrollment_date,
  c.title as course_title,
  u.email as student_email
FROM course_enrollments ce
JOIN courses c ON c.id = ce.course_id
JOIN auth.users u ON u.id = ce.user_id
ORDER BY ce.created_at DESC
LIMIT 10;

-- 4. VERIFICAR CARTEIRINHAS EXISTENTES
SELECT 
  sc.*,
  c.title as course_title,
  u.email as student_email,
  CASE 
    WHEN sc.available_date <= NOW() THEN 'Disponível'
    ELSE 'Não disponível ainda'
  END as status,
  CASE 
    WHEN sc.available_date > NOW() THEN 
      EXTRACT(DAY FROM (sc.available_date - NOW())) || ' dias restantes'
    ELSE '0 dias'
  END as days_remaining
FROM student_cards sc
JOIN courses c ON c.id = sc.course_id
JOIN auth.users u ON u.id = sc.user_id
ORDER BY sc.created_at DESC;

-- 5. CRIAR CARTEIRINHAS PARA MATRÍCULAS EXISTENTES (SE NÃO EXISTIREM)
-- Este script cria carteirinhas para todas as matrículas que ainda não têm
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
  ce.created_at + INTERVAL '0 days', -- Disponível imediatamente por padrão
  FALSE
FROM course_enrollments ce
WHERE NOT EXISTS (
  SELECT 1 FROM student_cards sc
  WHERE sc.user_id = ce.user_id
  AND sc.course_id = ce.course_id
)
ON CONFLICT (user_id, course_id) DO NOTHING;

-- 6. VERIFICAR RESULTADO FINAL
SELECT 
  'Total de cursos' as tipo,
  COUNT(*) as quantidade
FROM courses
UNION ALL
SELECT 
  'Configurações de carteirinha' as tipo,
  COUNT(*) as quantidade
FROM card_settings
UNION ALL
SELECT 
  'Matrículas' as tipo,
  COUNT(*) as quantidade
FROM course_enrollments
UNION ALL
SELECT 
  'Carteirinhas criadas' as tipo,
  COUNT(*) as quantidade
FROM student_cards
UNION ALL
SELECT 
  'Carteirinhas disponíveis' as tipo,
  COUNT(*) as quantidade
FROM student_cards
WHERE available_date <= NOW()
UNION ALL
SELECT 
  'Carteirinhas geradas' as tipo,
  COUNT(*) as quantidade
FROM student_cards
WHERE is_generated = TRUE;
