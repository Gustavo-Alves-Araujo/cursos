-- Adicionar campo de expiração em dias na tabela courses
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS expiration_days INTEGER DEFAULT NULL;

-- Adicionar campo de expiração em dias na tabela course_enrollments para rastrear quando o acesso expira
ALTER TABLE course_enrollments 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Criar função para calcular data de expiração baseada na matrícula
CREATE OR REPLACE FUNCTION calculate_course_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o curso tem expiração definida, calcular a data de expiração
  IF NEW.course_id IS NOT NULL THEN
    -- Buscar os dias de expiração do curso
    SELECT expiration_days INTO NEW.expires_at
    FROM courses 
    WHERE id = NEW.course_id;
    
    -- Se o curso tem expiração definida, calcular a data
    IF NEW.expires_at IS NOT NULL THEN
      NEW.expires_at := NEW.enrolled_at + (NEW.expires_at || ' days')::INTERVAL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para calcular automaticamente a expiração
DROP TRIGGER IF EXISTS calculate_expiration_trigger ON course_enrollments;
CREATE TRIGGER calculate_expiration_trigger
  BEFORE INSERT ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION calculate_course_expiration();

-- Atualizar matrículas existentes que não têm data de expiração
UPDATE course_enrollments 
SET expires_at = enrolled_at + (c.expiration_days || ' days')::INTERVAL
FROM courses c
WHERE course_enrollments.course_id = c.id 
  AND c.expiration_days IS NOT NULL 
  AND course_enrollments.expires_at IS NULL;
