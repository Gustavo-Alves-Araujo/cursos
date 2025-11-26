export type LessonType = 'video' | 'document' | 'text';

export type SupportMaterial = {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
};

export type Lesson = {
  id: string;
  moduleId: string;
  title: string;
  type: LessonType;
  content: {
    videoUrl?: string; // URL do YouTube para aulas de vídeo
    documentUrl?: string; // URL do arquivo para documentos
    textContent?: string; // conteúdo HTML para aulas de texto
    additionalText?: string; // texto adicional para todos os tipos de aula
  };
  supportMaterials?: SupportMaterial[]; // Materiais de apoio da aula
  order: number;
  isPublished: boolean;
  completed?: boolean; // indica se a aula foi concluída pelo usuário
  created_at: string;
  updated_at: string;
};

export type Module = {
  id: string;
  courseId: string;
  title: string;
  description?: string; // Descrição agora é opcional
  order: number;
  unlockAfterDays: number; // dias após atribuição do curso para liberar este módulo
  isPublished: boolean;
  isUnlocked?: boolean; // se o módulo está desbloqueado para o aluno (baseado em unlockAfterDays)
  lessons: Lesson[];
  created_at: string;
  updated_at: string;
};

export type Course = {
  id: string;
  title: string;
  shortDescription: string;
  thumbnail?: string;
  price: number;
  instructorId: string;
  instructorName: string;
  isPublished: boolean;
  modules: Module[];
  totalLessons: number;
  estimatedDuration: string; // ex: "2h 30min"
  expirationDays?: number; // dias para expiração do acesso
  externalLink?: string; // link externo para direcionar usuários que não possuem o curso
  created_at: string;
  updated_at: string;
};

export type CourseEnrollment = {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  expiresAt?: string; // data de expiração do acesso
  progress: {
    completedLessons: string[];
    currentModuleId?: string;
    completionPercentage: number;
  };
};

export type CourseProgress = {
  courseId: string;
  userId: string;
  completedLessons: string[];
  currentModuleId?: string;
  completionPercentage: number;
  lastAccessedAt: string;
};

export type Showcase = {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ShowcaseCourse = {
  id: string;
  showcase_id: string;
  course_id: string;
  position: number;
  created_at: string;
};

export type ShowcaseWithCourses = Showcase & {
  courses: Course[];
};
