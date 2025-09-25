export type Course = {
  id: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  thumbnail: string;
  owned: boolean;
};

export type LessonType = 'video' | 'document' | 'text';

export type Lesson = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  type: LessonType;
  duration?: string; // para vídeos
  content: {
    videoUrl?: string; // para aulas de vídeo
    documentUrl?: string; // para documentos
    textContent?: string; // para conteúdo de texto
  };
  order: number;
  completed: boolean;
};

export type Student = {
  id: string;
  name: string;
  email: string;
  ownedCourseIds: string[];
  availableCourseIds: string[]; // Cursos que aparecem em "Cursos que você ainda não tem"
};

export const mockCourses: Course[] = [
  {
    id: "c-1",
    title: "Comece Aqui",
    shortDesc: "Sua jornada na plataforma.",
    longDesc:
      "Conteúdo introdutório sobre como navegar e aproveitar melhor os recursos.",
    thumbnail:
      "https://images.unsplash.com/photo-1517059224940-d4af9eec41e5?q=80&w=1200&auto=format&fit=crop",
    owned: true,
  },
  {
    id: "c-2",
    title: "Materiais de Apoio",
    shortDesc: "Arquivos e planilhas úteis.",
    longDesc:
      "Coleção de materiais para acelerar seu aprendizado e produtividade.",
    thumbnail:
      "https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=1200&auto=format&fit=crop",
    owned: true,
  },
  {
    id: "c-3",
    title: "Suporte Exclusivo",
    shortDesc: "Acesso ao time PRO.",
    longDesc:
      "Sessões e conteúdos premium com suporte direto dos especialistas.",
    thumbnail:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop",
    owned: true,
  },
  {
    id: "c-4",
    title: "Domínio & Hospedagem",
    shortDesc: "Fundamentos de infraestrutura.",
    longDesc:
      "Entenda como domínios, DNS e hospedagem funcionam na prática.",
    thumbnail:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop",
    owned: true,
  },
  {
    id: "c-5",
    title: "Automação de Tarefas",
    shortDesc: "Scripts e produtividade.",
    longDesc:
      "Aprenda a automatizar fluxos comuns e ganhar tempo no dia a dia.",
    thumbnail:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop",
    owned: true,
  },
  {
    id: "c-6",
    title: "Marketing Digital",
    shortDesc: "Fundamentos e práticas.",
    longDesc:
      "Do zero às primeiras campanhas com foco em performance.",
    thumbnail:
      "https://images.unsplash.com/photo-1529336953121-a9d8e4063f37?q=80&w=1200&auto=format&fit=crop",
    owned: false,
  },
  {
    id: "c-7",
    title: "Data Analytics",
    shortDesc: "Insight com dados.",
    longDesc:
      "Aprenda a coletar, transformar e visualizar dados para decisões.",
    thumbnail:
      "https://images.unsplash.com/photo-1551281044-8afccad9df74?q=80&w=1200&auto=format&fit=crop",
    owned: false,
  },
  {
    id: "c-8",
    title: "UX/UI Essencial",
    shortDesc: "Design centrado no usuário.",
    longDesc:
      "Conceitos e práticas para interfaces modernas e acessíveis.",
    thumbnail:
      "https://images.unsplash.com/photo-1552581234-26160f608093?q=80&w=1200&auto=format&fit=crop",
    owned: false,
  },
];

export const mockStudents: Student[] = [
  { 
    id: "s-1", 
    name: "Ana Souza", 
    email: "ana@example.com", 
    ownedCourseIds: ["c-1", "c-2", "c-3"],
    availableCourseIds: ["c-4", "c-5", "c-6", "c-7", "c-8"]
  },
  { 
    id: "s-2", 
    name: "Bruno Lima", 
    email: "bruno@example.com", 
    ownedCourseIds: ["c-1", "c-4", "c-5"],
    availableCourseIds: ["c-2", "c-3", "c-6", "c-7", "c-8"]
  },
  { 
    id: "s-3", 
    name: "Carla Nunes", 
    email: "carla@example.com", 
    ownedCourseIds: ["c-2"],
    availableCourseIds: ["c-1", "c-3", "c-4", "c-5", "c-6", "c-7", "c-8"]
  },
  { 
    id: "s-4", 
    name: "Diego Santos", 
    email: "diego@example.com", 
    ownedCourseIds: ["c-1", "c-2", "c-3", "c-4", "c-5"],
    availableCourseIds: ["c-6", "c-7", "c-8"]
  },
  { 
    id: "s-5", 
    name: "Elena Costa", 
    email: "elena@example.com", 
    ownedCourseIds: ["c-3", "c-6"],
    availableCourseIds: ["c-1", "c-2", "c-4", "c-5", "c-7", "c-8"]
  },
  { 
    id: "s-6", 
    name: "Felipe Oliveira", 
    email: "felipe@example.com", 
    ownedCourseIds: [],
    availableCourseIds: ["c-1", "c-2", "c-3", "c-4", "c-5", "c-6", "c-7", "c-8"]
  },
  { 
    id: "s-7", 
    name: "Gabriela Silva", 
    email: "gabriela@example.com", 
    ownedCourseIds: ["c-1", "c-7", "c-8"],
    availableCourseIds: ["c-2", "c-3", "c-4", "c-5", "c-6"]
  },
  { 
    id: "s-8", 
    name: "Henrique Alves", 
    email: "henrique@example.com", 
    ownedCourseIds: ["c-2", "c-4"],
    availableCourseIds: ["c-1", "c-3", "c-5", "c-6", "c-7", "c-8"]
  }
];

// Usuários para autenticação
export const mockUsers = [
  {
    id: "u-1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin" as const,
    password: "admin123"
  },
  {
    id: "u-2", 
    name: "Ana Souza",
    email: "ana@example.com",
    role: "aluno" as const,
    password: "ana123"
  },
  {
    id: "u-3",
    name: "Bruno Lima", 
    email: "bruno@example.com",
    role: "aluno" as const,
    password: "bruno123"
  }
];

// Aulas dos cursos
export const mockLessons: Lesson[] = [
  // Aulas do curso "Comece Aqui"
  {
    id: "l-1",
    courseId: "c-1",
    title: "Bem-vindo à Plataforma",
    description: "Introdução à plataforma e como navegar pelos recursos",
    type: "video",
    duration: "5:30",
    content: {
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    order: 1,
    completed: true
  },
  {
    id: "l-2",
    courseId: "c-1",
    title: "Configuração Inicial",
    description: "Como configurar seu perfil e preferências",
    type: "text",
    content: {
      textContent: `
        <h2>Configuração Inicial</h2>
        <p>Bem-vindo à nossa plataforma! Nesta aula, você aprenderá como configurar seu perfil e personalizar sua experiência de aprendizado.</p>
        
        <h3>Passos para Configuração:</h3>
        <ol>
          <li>Acesse o menu "Minha Conta"</li>
          <li>Preencha suas informações pessoais</li>
          <li>Configure suas preferências de notificação</li>
          <li>Escolha seus interesses de aprendizado</li>
        </ol>
        
        <h3>Dicas Importantes:</h3>
        <ul>
          <li>Mantenha seu perfil sempre atualizado</li>
          <li>Configure lembretes para não perder aulas</li>
          <li>Explore as diferentes funcionalidades da plataforma</li>
        </ul>
      `
    },
    order: 2,
    completed: true
  },
  {
    id: "l-3",
    courseId: "c-1",
    title: "Guia de Navegação",
    description: "Documento com instruções detalhadas de navegação",
    type: "document",
    content: {
      documentUrl: "/documents/guia-navegacao.pdf"
    },
    order: 3,
    completed: false
  },
  
  // Aulas do curso "Materiais de Apoio"
  {
    id: "l-4",
    courseId: "c-2",
    title: "Introdução aos Materiais",
    description: "Visão geral dos materiais disponíveis",
    type: "video",
    duration: "8:15",
    content: {
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    order: 1,
    completed: true
  },
  {
    id: "l-5",
    courseId: "c-2",
    title: "Planilhas de Apoio",
    description: "Como usar as planilhas para organizar seu aprendizado",
    type: "document",
    content: {
      documentUrl: "/documents/planilhas-apoio.xlsx"
    },
    order: 2,
    completed: false
  },
  {
    id: "l-6",
    courseId: "c-2",
    title: "Templates e Modelos",
    description: "Coleção de templates prontos para uso",
    type: "text",
    content: {
      textContent: `
        <h2>Templates e Modelos</h2>
        <p>Nesta seção, você encontrará uma coleção completa de templates e modelos prontos para uso em seus projetos.</p>
        
        <h3>Tipos de Templates Disponíveis:</h3>
        <ul>
          <li><strong>Apresentações:</strong> Slides profissionais para apresentações</li>
          <li><strong>Documentos:</strong> Modelos de relatórios e documentos</li>
          <li><strong>Planilhas:</strong> Templates para controle e análise de dados</li>
          <li><strong>Design:</strong> Elementos gráficos e mockups</li>
        </ul>
        
        <h3>Como Usar:</h3>
        <p>1. Escolha o template que melhor se adequa ao seu projeto</p>
        <p>2. Faça o download do arquivo</p>
        <p>3. Personalize conforme suas necessidades</p>
        <p>4. Salve uma cópia para uso futuro</p>
      `
    },
    order: 3,
    completed: false
  }
];


