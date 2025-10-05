-- =====================================================
-- CONFIGURAÇÃO COMPLETA DO BANCO DE DADOS
-- Site de Cursos - Supabase Setup
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- Este arquivo cria todas as tabelas, relacionamentos, triggers e políticas necessárias

-- =====================================================
-- 1. EXTENSÕES E CONFIGURAÇÕES INICIAIS
-- =====================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. TABELA DE USUÁRIOS
-- =====================================================

-- Criar tabela de usuários (perfis)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABELA DE CURSOS
-- =====================================================

CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  thumbnail TEXT,
  price DECIMAL(10,2) DEFAULT 0.00,
  instructor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  instructor_name TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  total_lessons INTEGER DEFAULT 0,
  estimated_duration TEXT DEFAULT '0h 0min',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TABELA DE MÓDULOS
-- =====================================================

CREATE TABLE IF NOT EXISTS modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  unlock_after_days INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TABELA DE AULAS
-- =====================================================

CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'document', 'text')),
  duration TEXT, -- para vídeos
  content JSONB NOT NULL DEFAULT '{}', -- armazena videoUrl, documentUrl, textContent
  order_index INTEGER NOT NULL DEFAULT 1,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. TABELA DE MATRÍCULAS
-- =====================================================

CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress JSONB DEFAULT '{"completedLessons": [], "currentModuleId": null, "completionPercentage": 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- =====================================================
-- 7. TABELA DE PROGRESSO DE AULAS
-- =====================================================

CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- =====================================================
-- 8. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Índices para courses
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_created ON courses(created_at);

-- Índices para modules
CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_order ON modules(course_id, order_index);

-- Índices para lessons
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_type ON lessons(type);

-- Índices para enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_enrolled ON course_enrollments(enrolled_at);

-- Índices para progress
CREATE INDEX IF NOT EXISTS idx_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_progress_course ON lesson_progress(course_id);

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. POLÍTICAS DE SEGURANÇA - USERS
-- =====================================================

-- Usuários podem ver apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Permitir inserção de novos usuários (para registro)
CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins podem ver todos os usuários (sem recursão)
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- =====================================================
-- 11. POLÍTICAS DE SEGURANÇA - COURSES
-- =====================================================

-- Todos podem ver cursos publicados
CREATE POLICY "Anyone can view published courses" ON courses
  FOR SELECT USING (is_published = true);

-- Usuários autenticados podem ver seus próprios cursos (como instrutor)
CREATE POLICY "Users can view own courses" ON courses
  FOR SELECT USING (instructor_id = auth.uid());

-- Admins podem ver todos os cursos
CREATE POLICY "Admins can view all courses" ON courses
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Apenas admins podem inserir/atualizar/deletar cursos
CREATE POLICY "Only admins can manage courses" ON courses
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- =====================================================
-- 12. POLÍTICAS DE SEGURANÇA - MODULES
-- =====================================================

-- Usuários podem ver módulos de cursos publicados
CREATE POLICY "Users can view modules of published courses" ON modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE id = course_id AND is_published = true
    )
  );

-- Usuários podem ver módulos de cursos em que estão matriculados
CREATE POLICY "Users can view modules of enrolled courses" ON modules
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

-- =====================================================
-- 13. POLÍTICAS DE SEGURANÇA - LESSONS
-- =====================================================

-- Usuários podem ver aulas de módulos de cursos publicados
CREATE POLICY "Users can view lessons of published courses" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM modules m
      JOIN courses c ON c.id = m.course_id
      WHERE m.id = lessons.module_id AND c.is_published = true
    )
  );

-- Usuários podem ver aulas de cursos em que estão matriculados
CREATE POLICY "Users can view lessons of enrolled courses" ON lessons
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
-- 14. POLÍTICAS DE SEGURANÇA - ENROLLMENTS
-- =====================================================

-- Usuários podem ver suas próprias matrículas
CREATE POLICY "Users can view own enrollments" ON course_enrollments
  FOR SELECT USING (user_id = auth.uid());

-- Usuários podem criar suas próprias matrículas
CREATE POLICY "Users can create own enrollments" ON course_enrollments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Usuários podem atualizar suas próprias matrículas (progresso)
CREATE POLICY "Users can update own enrollments" ON course_enrollments
  FOR UPDATE USING (user_id = auth.uid());

-- Admins podem ver todas as matrículas
CREATE POLICY "Admins can view all enrollments" ON course_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 15. POLÍTICAS DE SEGURANÇA - LESSON PROGRESS
-- =====================================================

-- Usuários podem ver seu próprio progresso
CREATE POLICY "Users can view own progress" ON lesson_progress
  FOR SELECT USING (user_id = auth.uid());

-- Usuários podem criar seu próprio progresso
CREATE POLICY "Users can create own progress" ON lesson_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins podem ver todo o progresso
CREATE POLICY "Admins can view all progress" ON lesson_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 16. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para criar perfil de usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar contador de aulas do curso
CREATE OR REPLACE FUNCTION update_course_lesson_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contador quando uma aula é adicionada/removida
  UPDATE courses 
  SET total_lessons = (
    SELECT COUNT(*) 
    FROM lessons l
    JOIN modules m ON m.id = l.module_id
    WHERE m.course_id = courses.id AND l.is_published = true
  )
  WHERE id = (
    SELECT m.course_id 
    FROM modules m 
    WHERE m.id = COALESCE(NEW.module_id, OLD.module_id)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 17. TRIGGERS
-- =====================================================

-- Trigger para atualizar updated_at em users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at em courses
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at em modules
CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at em lessons
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at em enrollments
CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar contador de aulas
CREATE TRIGGER update_lesson_count_on_insert
  AFTER INSERT ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_course_lesson_count();

CREATE TRIGGER update_lesson_count_on_update
  AFTER UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_course_lesson_count();

CREATE TRIGGER update_lesson_count_on_delete
  AFTER DELETE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_course_lesson_count();

-- =====================================================
-- 18. DADOS INICIAIS (OPCIONAL)
-- =====================================================

-- Inserir usuário admin padrão (você pode remover esta seção se preferir)
-- IMPORTANTE: Execute apenas após criar um usuário admin via interface do Supabase
-- e substitua o UUID abaixo pelo ID real do usuário admin

-- Exemplo de como atualizar um usuário para admin (execute manualmente):
-- UPDATE users SET role = 'admin' WHERE email = 'seu-email-admin@exemplo.com';

-- =====================================================
-- 19. VIEWS ÚTEIS
-- =====================================================

-- View para cursos com informações do instrutor
CREATE OR REPLACE VIEW courses_with_instructor AS
SELECT 
  c.id,
  c.title,
  c.description,
  c.short_description,
  c.thumbnail,
  c.price,
  c.instructor_id,
  c.instructor_name,
  c.is_published,
  c.total_lessons,
  c.estimated_duration,
  c.created_at,
  c.updated_at,
  u.name as instructor_full_name,
  u.email as instructor_email
FROM courses c
JOIN users u ON u.id = c.instructor_id;

-- View para progresso detalhado do usuário
CREATE OR REPLACE VIEW user_course_progress AS
SELECT 
  ce.user_id,
  ce.course_id,
  c.title as course_title,
  ce.enrolled_at,
  ce.progress,
  COUNT(lp.lesson_id) as completed_lessons,
  c.total_lessons,
  ROUND(
    (COUNT(lp.lesson_id)::decimal / NULLIF(c.total_lessons, 0)) * 100, 
    2
  ) as completion_percentage
FROM course_enrollments ce
JOIN courses c ON c.id = ce.course_id
LEFT JOIN lesson_progress lp ON lp.user_id = ce.user_id 
  AND lp.course_id = ce.course_id
GROUP BY ce.user_id, ce.course_id, c.title, ce.enrolled_at, ce.progress, c.total_lessons;

-- =====================================================
-- CONFIGURAÇÃO CONCLUÍDA
-- =====================================================

-- Para testar a configuração, você pode executar:
-- SELECT * FROM users;
-- SELECT * FROM courses;
-- SELECT * FROM modules;
-- SELECT * FROM lessons;
-- SELECT * FROM course_enrollments;

-- Para criar um usuário admin, execute:
-- UPDATE users SET role = 'admin' WHERE email = 'seu-email@exemplo.com';

-- =====================================================
-- PRÓXIMOS PASSOS
-- =====================================================
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Crie um usuário admin via interface de autenticação
-- 3. Atualize o role do usuário para 'admin' usando o comando acima
-- 4. Teste a aplicação com os dados criados
