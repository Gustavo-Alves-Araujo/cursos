# Plataforma de Cursos (Frontend-only)

Projeto Next.js (App Router) com Tailwind e shadcn/ui. UI escura, responsiva, com componentes prontos e pontos de integração para backend (Yampii) posteriormente.

## Rotas
- `/` Dashboard com banner e carrosséis
- `/courses` Catálogo em grid
- `/courses/[id]` Detalhe do curso e lista de aulas (mock)
- `/my-courses` Meus cursos
- `/admin` Dashboard admin
- `/admin/courses/new` Formulário de novo curso (upload só UI)
- `/admin/assign` Atribuição de cursos (alunos x cursos)

## Componentes principais
- `Sidebar`, `TopBanner`, `Carousel`, `CourseCard`
- Primitives shadcn: `Button`, `Badge`, `Card`, `Dialog`, `Form`, `Input`, `Label`, `Textarea`, `Checkbox`, `Select`, `Skeleton`
- Admin: `AdminCourseForm`, `AssignCoursesTable`

## Mock e Hooks
- Dados em `src/mocks/data.ts`
- Hooks em `src/hooks/useMockData.ts`
  - `useCourses`, `useMyCourses`
  - `addCourse`, `assignCourse` (mock). Substituir por requests reais depois.

Para integrar com APIs reais, crie serviços e troque os hooks por chamadas:
```ts
// ex.: src/services/courses.ts
export async function fetchCourses() { /* fetch */ }
export async function createCourse(data: any) { /* POST */ }
export async function assignCourse(studentId: string, courseId: string) { /* POST */ }
```
Depois adapte `useMockData` ou crie `useApiData` usando SWR/React Query.

## Setup
```bash
npm i
npm run dev
```
Acesse `http://localhost:3000`.

## UX/Design
- Tema dark, cantos `rounded-2xl`, sombras suaves.
- Carrosséis acessíveis (teclado/ARIA), responsivos e com setas.
- Micro-interações com framer-motion.

## Estrutura
- `src/app` rotas App Router
- `src/components` componentes compartilhados
- `src/hooks` hooks de dados
- `src/mocks` dados de exemplo

## Observações
- Projeto é somente frontend. Nenhuma chamada externa é feita.
- Imagens usam URLs públicas de exemplo.
