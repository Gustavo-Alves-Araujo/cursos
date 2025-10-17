-- Verificar se as tabelas existem
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'card_settings') 
    THEN '✅ card_settings existe'
    ELSE '❌ card_settings NÃO existe - Execute create-student-cards-tables.sql'
  END as status_card_settings,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_cards') 
    THEN '✅ student_cards existe'
    ELSE '❌ student_cards NÃO existe - Execute create-student-cards-tables.sql'
  END as status_student_cards;

-- Se as tabelas existirem, contar registros
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'card_settings') THEN
    RAISE NOTICE 'Configurações salvas: %', (SELECT COUNT(*) FROM card_settings);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_cards') THEN
    RAISE NOTICE 'Carteirinhas criadas: %', (SELECT COUNT(*) FROM student_cards);
  END IF;
  
  RAISE NOTICE 'Matrículas existentes: %', (SELECT COUNT(*) FROM course_enrollments);
END $$;
