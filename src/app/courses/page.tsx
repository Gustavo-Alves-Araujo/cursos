import { Sidebar } from "@/components/Sidebar";
import { CourseCard } from "@/components/CourseCard";
import { mockCourses } from "@/mocks/data";

export default function CoursesPage() {
  return (
    <div className="relative">
      <Sidebar />
      <main className="p-6">
        <h1 className="mb-6 text-2xl font-semibold">Cursos</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockCourses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </main>
    </div>
  );
}


