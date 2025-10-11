import { Sidebar } from "@/components/Sidebar";
import { CourseCard } from "@/components/CourseCard";
import { mockCourses } from "@/mocks/data";
import { Course } from "@/types/course";
import { BookOpen } from "lucide-react";

export default function CoursesPage() {
  // Converter dados mock para o tipo correto
  const adaptedCourses: Course[] = mockCourses.map(c => ({
    id: c.id,
    title: c.title,
    description: c.longDesc,
    shortDescription: c.shortDesc,
    thumbnail: c.thumbnail,
    price: 0, // Mock courses são gratuitos
    instructorId: 'default-instructor',
    instructorName: 'Instrutor Padrão',
    isPublished: c.owned,
    modules: [],
    totalLessons: 0,
    estimatedDuration: '2h',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Sidebar />
      <main className="p-4 sm:p-6 lg:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Cursos Disponíveis</h1>
            <p className="text-blue-200 text-sm sm:text-base">Explore nossa coleção de cursos e expanda seus conhecimentos</p>
          </div>
          
          {adaptedCourses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-300" />
              </div>
              <h2 className="text-xl font-semibold text-blue-200 mb-2">Nenhum curso disponível</h2>
              <p className="text-blue-300">Novos cursos serão adicionados em breve!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
              {adaptedCourses.map((c) => (
                <CourseCard key={c.id} course={c} isOwned={true} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


