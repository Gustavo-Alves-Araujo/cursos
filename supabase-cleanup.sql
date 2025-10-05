-- =====================================================
-- SCRIPT DE LIMPEZA COMPLETA DO SUPABASE
-- ⚠️  ATENÇÃO: Este script vai DELETAR TODOS os dados!
-- Execute apenas se quiser começar do zero
-- =====================================================

-- 1. REMOVER TODAS AS POLÍTICAS
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON courses;
DROP POLICY IF EXISTS "Only admins can manage courses" ON courses;
DROP POLICY IF EXISTS "Published modules are viewable by everyone" ON modules;
DROP POLICY IF EXISTS "Only admins can manage modules" ON modules;
DROP POLICY IF EXISTS "Published lessons are viewable by everyone" ON lessons;
DROP POLICY IF EXISTS "Only admins can manage lessons" ON lessons;
DROP POLICY IF EXISTS "Users can view own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can create own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can manage own progress" ON course_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON course_progress;

-- 2. REMOVER TODOS OS TRIGGERS
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
DROP TRIGGER IF EXISTS update_modules_updated_at ON modules;
DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_progress_percentage ON course_progress;

-- 3. REMOVER TODAS AS FUNÇÕES
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_course_progress();

-- 4. REMOVER TODAS AS TABELAS (em ordem de dependência)
DROP TABLE IF EXISTS course_progress CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- LIMPEZA CONCLUÍDA
-- Agora você pode executar o supabase-clean-setup.sql
-- =====================================================
