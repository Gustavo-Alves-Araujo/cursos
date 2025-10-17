-- Verificar configurações salvas
SELECT 
  cs.id,
  cs.course_id,
  c.title as course_title,
  cs.template_url,
  cs.name_position_x,
  cs.name_position_y,
  cs.cpf_position_x,
  cs.cpf_position_y,
  cs.photo_position_x,
  cs.photo_position_y,
  cs.days_after_enrollment,
  cs.created_at,
  cs.updated_at
FROM card_settings cs
LEFT JOIN courses c ON c.id = cs.course_id
ORDER BY cs.updated_at DESC;

-- Verificar RLS
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'card_settings';

-- Se retornar vazio, execute:
-- INSERT INTO card_settings (course_id, template_url) 
-- VALUES ('cc257d52-21ea-4363-b446-5dfd3f6db6a7', 'https://example.com/template.png')
-- RETURNING *;
