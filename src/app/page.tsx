'use client';

import { Sidebar } from "@/components/Sidebar";
import { StudentBanner } from "@/components/StudentBanner";
import { Carousel } from "@/components/Carousel";
import { CourseCard } from "@/components/CourseCard";
import { LogoutButton } from "@/components/LogoutButton";
import { PasswordResetGuard } from "@/components/PasswordResetGuard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Plus } from "lucide-react";
import { useMyCourses, useCourses } from "@/hooks/useCourses";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { myCourses, isLoading: coursesLoading } = useMyCourses();
  const { courses: allCourses, isLoading: allCoursesLoading } = useCourses();
  const [storeUrl, setStoreUrl] = useState<string | null>(null);
  
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

  // Carregar URL da loja configurada
  useEffect(() => {
    const loadStoreUrl = async () => {
      try {
        const response = await fetch('/api/store-settings');
        if (response.ok) {
          const data = await response.json();
          setStoreUrl(data.store_url);
        }
      } catch (error) {
        console.error('Erro ao carregar URL da loja:', error);
      }
    };

    loadStoreUrl();
  }, []);

  if (isLoading || coursesLoading || allCoursesLoading) {
    return (
      <div className="relative">
        <Sidebar />
        <main className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-2">Carregando...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user || user.role === 'admin') {
    return null;
  }

  const myCoursesPreview = myCourses.slice(0, 6); // Mostrar até 6
  const myCourseIds = myCourses.map(c => c.id);
  const availableCourses = allCourses.filter(c => !myCourseIds.includes(c.id) && c.isPublished);
  const availableCoursesPreview = availableCourses.slice(0, 6);

  const handleStoreClick = () => {
    if (storeUrl) {
      window.open(storeUrl, '_blank');
    } else {
      router.push('/loja');
    }
  };

  return (
    <PasswordResetGuard>
      <div className="relative">
        <Sidebar />
        <main className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:ml-64 min-h-screen">
        {/* Banner de destaque */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1">
            <StudentBanner />
          </div>
          <div className="flex items-center justify-end sm:ml-6">
            <LogoutButton />
          </div>
        </div>

        {/* Seção Meus Cursos (até 6) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-200 flex items-center gap-2">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              Meus Cursos
            </h2>
            {myCourses.length > 6 && (
                <Button asChild variant="outline" className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white w-full sm:w-auto transition-all duration-200 text-sm sm:text-base">
                <Link href="/my-courses" className="flex items-center justify-center gap-2">
                  <span className="hidden sm:inline">Ver todos os cursos</span>
                  <span className="sm:hidden">Ver todos</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
          <Carousel ariaLabel="Meus cursos">
            {myCoursesPreview.map((c) => (
              <CourseCard key={c.id} course={c} isOwned={true} />
            ))}
          </Carousel>
        </section>

        {/* Seção Cursos Disponíveis */}
        {availableCourses.length > 0 ? (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-blue-200 flex items-center gap-2">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                Cursos que você ainda não tem
              </h2>
              <Button 
                variant="outline" 
                className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white w-full sm:w-auto transition-all duration-200 text-sm sm:text-base"
                onClick={handleStoreClick}
              >
                <span className="hidden sm:inline">Ir para a Loja</span>
                <span className="sm:hidden">Loja</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <Carousel ariaLabel="Cursos disponíveis">
              {availableCoursesPreview.map((c) => (
                <CourseCard key={c.id} course={c} isOwned={false} />
              ))}
            </Carousel>
          </section>
        ) : (
          <section className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
              <BookOpen className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-green-200 mb-2">Parabéns! 🎉</h2>
              <p className="text-green-300">Você já tem acesso a todos os cursos disponíveis!</p>
              <p className="text-green-400 text-sm mt-2">Continue estudando e aproveitando seu aprendizado.</p>
            </div>
          </section>
        )}

        {/* Mensagem quando não há cursos */}
        {myCourses.length === 0 && availableCourses.length === 0 && (
          <section className="text-center py-12">
            <BookOpen className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-blue-200 mb-2">Nenhum curso disponível</h2>
            <p className="text-blue-300">Entre em contato com o administrador para ter acesso aos cursos.</p>
          </section>
        )}
      </main>
    </div>
    </PasswordResetGuard>
  );
}
