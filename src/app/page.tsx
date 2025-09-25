'use client';

import { Sidebar } from "@/components/Sidebar";
import { StudentBanner } from "@/components/StudentBanner";
import { Carousel } from "@/components/Carousel";
import { CourseCard } from "@/components/CourseCard";
import { LogoutButton } from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { mockCourses, mockStudents } from "@/mocks/data";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Plus } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role === 'admin') {
        router.push('/admin');
        return;
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role === 'admin') {
    return null;
  }

  const myCourses = mockCourses.filter((c) => c.owned);
  const myCoursesCarousel = myCourses.slice(0, 8); // Máximo 8 cursos no carrossel
  
  // Buscar dados do aluno para obter cursos disponíveis configurados pelo admin
  const studentData = mockStudents.find(s => s.email === user.email);
  const availableCourseIds = studentData?.availableCourseIds || [];
  const availableCourses = mockCourses.filter((c) => availableCourseIds.includes(c.id));

  return (
    <div className="relative">
      <Sidebar />
      <main className="space-y-6 sm:space-y-8 p-4 sm:p-6">
        {/* Banner de destaque */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex-1">
            <StudentBanner />
          </div>
          <div className="flex items-center justify-end lg:ml-6">
            <LogoutButton />
          </div>
        </div>

        {/* Seção Meus Cursos */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-200 flex items-center gap-2">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              Meus Cursos
            </h2>
            {myCourses.length > 8 && (
                <Button asChild variant="outline" className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white w-full sm:w-auto transition-all duration-200">
                <Link href="/my-courses" className="flex items-center gap-2">
                  Ver todos os cursos
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
          <Carousel ariaLabel="Meus cursos">
            {myCoursesCarousel.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </Carousel>
        </section>

        {/* Seção Cursos Disponíveis */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-blue-200 flex items-center gap-2">
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            Cursos Disponíveis
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {availableCourses.map((c) => (
              <div key={c.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg mb-4 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-blue-300" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">{c.title}</h3>
                <p className="text-blue-200 text-xs sm:text-sm mb-4 line-clamp-2">{c.shortDesc}</p>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm">
                  Inscrever-se
                </Button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
