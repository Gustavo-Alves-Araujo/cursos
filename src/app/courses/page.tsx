import { Sidebar } from "@/components/Sidebar";
import { CourseCard } from "@/components/CourseCard";
import { mockCourses } from "@/mocks/data";
import { Course } from "@/types/course";

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
    <div className="relative">
      <Sidebar />
      <main className="p-6">
        <h1 className="mb-6 text-2xl font-semibold">Cursos</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {adaptedCourses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </main>
    </div>
  );
}


