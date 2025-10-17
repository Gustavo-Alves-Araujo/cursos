-- =====================================================
-- CRIAÇÃO DAS TABELAS PARA O MÓDULO DE CARTEIRINHAS
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. TABELA DE CONFIGURAÇÕES DE CARTEIRINHA POR CURSO
CREATE TABLE IF NOT EXISTS card_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Template da carteirinha
  template_url TEXT,
  
  -- Posições do nome (X, Y em pixels)
  name_position_x INTEGER DEFAULT 100,
  name_position_y INTEGER DEFAULT 100,
  name_font_size INTEGER DEFAULT 24,
  name_color TEXT DEFAULT '#000000',
  
  -- Posições do CPF (X, Y em pixels)
  cpf_position_x INTEGER DEFAULT 100,
  cpf_position_y INTEGER DEFAULT 150,
  cpf_font_size INTEGER DEFAULT 18,
  cpf_color TEXT DEFAULT '#000000',
  
  -- Posições da foto (X, Y, largura, altura em pixels)
  photo_position_x INTEGER DEFAULT 50,
  photo_position_y INTEGER DEFAULT 50,
  photo_width INTEGER DEFAULT 120,
  photo_height INTEGER DEFAULT 150,
  
  -- Configuração de disponibilidade
  days_after_enrollment INTEGER DEFAULT 0, -- 0 = disponível imediatamente
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garantir apenas uma configuração por curso
  UNIQUE(course_id)
);

-- 2. TABELA DE CARTEIRINHAS DOS ALUNOS
CREATE TABLE IF NOT EXISTS student_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Data de matrícula no curso
  enrollment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Data em que a carteirinha fica disponível
  available_date TIMESTAMPTZ NOT NULL,
  
  -- URLs das imagens
  profile_photo_url TEXT, -- Foto que o aluno fez upload
  generated_card_url TEXT, -- Carteirinha gerada (PNG)
  
  -- Status
  is_generated BOOLEAN DEFAULT FALSE,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garantir apenas uma carteirinha por aluno por curso
  UNIQUE(user_id, course_id)
);

-- 3. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_card_settings_course_id ON card_settings(course_id);
CREATE INDEX IF NOT EXISTS idx_student_cards_user_id ON student_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_student_cards_course_id ON student_cards(course_id);
CREATE INDEX IF NOT EXISTS idx_student_cards_available_date ON student_cards(available_date);

-- 4. TRIGGER PARA ATUALIZAR updated_at AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_card_settings_updated_at
  BEFORE UPDATE ON card_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_cards_updated_at
  BEFORE UPDATE ON student_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE card_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_cards ENABLE ROW LEVEL SECURITY;

-- ===== POLÍTICAS PARA card_settings =====

-- Admins podem fazer tudo
CREATE POLICY "Admins podem gerenciar card_settings"
ON card_settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Alunos podem visualizar configurações dos seus cursos
CREATE POLICY "Alunos podem ver card_settings dos seus cursos"
ON card_settings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM course_enrollments
    WHERE course_enrollments.course_id = card_settings.course_id
    AND course_enrollments.user_id = auth.uid()
  )
);

-- ===== POLÍTICAS PARA student_cards =====

-- Admins podem ver todas as carteirinhas
CREATE POLICY "Admins podem ver todas as carteirinhas"
ON student_cards
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Alunos podem ver apenas suas carteirinhas
CREATE POLICY "Alunos podem ver suas carteirinhas"
ON student_cards
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Alunos podem criar suas carteirinhas (primeira vez)
CREATE POLICY "Alunos podem criar suas carteirinhas"
ON student_cards
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Alunos podem atualizar suas carteirinhas
CREATE POLICY "Alunos podem atualizar suas carteirinhas"
ON student_cards
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins podem atualizar qualquer carteirinha
CREATE POLICY "Admins podem atualizar carteirinhas"
ON student_cards
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- =====================================================
-- FUNCTION AUXILIAR: Criar carteirinha automaticamente ao matricular
-- =====================================================
-- Esta função é chamada quando um aluno é matriculado em um curso
CREATE OR REPLACE FUNCTION create_student_card_on_enrollment()
RETURNS TRIGGER AS $$
DECLARE
  days_to_wait INTEGER;
BEGIN
  -- Buscar quantos dias após matrícula a carteirinha fica disponível
  SELECT COALESCE(days_after_enrollment, 0)
  INTO days_to_wait
  FROM card_settings
  WHERE course_id = NEW.course_id;
  
  -- Se não houver configuração, usar 0 dias
  IF days_to_wait IS NULL THEN
    days_to_wait := 0;
  END IF;
  
  -- Criar registro da carteirinha
  INSERT INTO student_cards (
    user_id,
    course_id,
    enrollment_date,
    available_date,
    is_generated
  ) VALUES (
    NEW.user_id,
    NEW.course_id,
    NOW(),
    NOW() + (days_to_wait || ' days')::INTERVAL,
    FALSE
  )
  ON CONFLICT (user_id, course_id) DO NOTHING; -- Evitar duplicatas
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar carteirinha ao matricular
CREATE TRIGGER create_card_on_enrollment
  AFTER INSERT ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION create_student_card_on_enrollment();

-- =====================================================
-- VERIFICAR CRIAÇÃO DAS TABELAS
-- =====================================================
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('card_settings', 'student_cards')
ORDER BY table_name;

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('card_settings', 'student_cards')
ORDER BY tablename, policyname;
