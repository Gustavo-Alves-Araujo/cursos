-- Reabilitar RLS com políticas corretas
-- Execute este script no Supabase SQL Editor

-- 1. Reabilitar RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON courses;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON modules;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON lessons;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON course_enrollments;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON lesson_progress;

-- 3. Criar políticas simples e funcionais
CREATE POLICY "courses_policy" ON courses
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "modules_policy" ON modules
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "lessons_policy" ON lessons
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "course_enrollments_policy" ON course_enrollments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "lesson_progress_policy" ON lesson_progress
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Verificar se tudo está funcionando
SELECT schemaname, tablename, rowsecurity, policyname
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.tablename IN ('courses', 'modules', 'lessons', 'course_enrollments', 'lesson_progress')
ORDER BY t.tablename;
