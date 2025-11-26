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
import { ArrowRight, BookOpen, Plus } from "lucide-react";
import { useMyCourses, useCourses } from "@/hooks/useCourses";
import { supabase } from "@/lib/supabase";
import type { Course } from "@/types/course";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { myCourses, isLoading: coursesLoading } = useMyCourses();
  const { courses: allCourses, isLoading: allCoursesLoading } = useCourses();
  const [storeUrl, setStoreUrl] = useState<string | null>(null);
  const [showcaseCoursesIds, setShowcaseCoursesIds] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
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

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Buscar cursos de vitrines relacionadas aos cursos do aluno
  useEffect(() => {
    const fetchShowcaseCourses = async () => {
      if (!user || myCourses.length === 0) {
        setShowcaseCoursesIds([]);
        return;
      }

      try {
        const myCourseIds = myCourses.map(c => c.id);

        // 1. Buscar todas as vitrines que contêm os cursos do aluno
        const { data: myShowcases, error: showcasesError } = await supabase
          .from('showcase_courses')
          .select('showcase_id')
          .in('course_id', myCourseIds);

        if (showcasesError) {
          console.error('Erro ao buscar vitrines:', showcasesError);
          return;
        }

        if (!myShowcases || myShowcases.length === 0) {
          setShowcaseCoursesIds([]);
          return;
        }

        // Extrair IDs únicos das vitrines
        const showcaseIds = [...new Set(myShowcases.map(s => s.showcase_id))];

        // 2. Verificar quais vitrines estão ativas
        const { data: activeShowcases, error: activeError } = await supabase
          .from('showcases')
          .select('id')
          .in('id', showcaseIds)
          .eq('is_active', true);

        if (activeError) {
          console.error('Erro ao buscar vitrines ativas:', activeError);
          return;
        }

        if (!activeShowcases || activeShowcases.length === 0) {
          setShowcaseCoursesIds([]);
          return;
        }

        // IDs das vitrines ativas
        const activeShowcaseIds = activeShowcases.map(s => s.id);

        // 3. Buscar todos os cursos dessas vitrines ativas
        const { data: showcaseCourses, error: coursesError } = await supabase
          .from('showcase_courses')
          .select('course_id')
          .in('showcase_id', activeShowcaseIds);

        if (coursesError) {
          console.error('Erro ao buscar cursos das vitrines:', coursesError);
          return;
        }

        if (!showcaseCourses || showcaseCourses.length === 0) {
          setShowcaseCoursesIds([]);
          return;
        }

        // Extrair IDs únicos dos cursos
        const courseIds = [...new Set(showcaseCourses.map((sc: { course_id: string }) => sc.course_id))];

        setShowcaseCoursesIds(courseIds);
      } catch (error) {
        console.error('Erro ao buscar cursos das vitrines:', error);
        setShowcaseCoursesIds([]);
      }
    };

    fetchShowcaseCourses();
  }, [user, myCourses]);

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

  const myCourseIds = myCourses.map(c => c.id);
  
  // Filtrar cursos disponíveis:
  // - Cursos que o aluno NÃO possui
  // - Cursos que estão publicados
  // - Cursos que fazem parte de vitrines relacionadas aos cursos do aluno
  //   (se o aluno não tiver cursos, não mostra nenhum curso disponível)
  const availableCourses = allCourses.filter(c => {
    // Não mostrar cursos que o aluno já possui
    if (myCourseIds.includes(c.id)) return false;
    
    // Apenas cursos publicados
    if (!c.isPublished) return false;
    
    // Se o aluno não tiver cursos, não mostrar nenhum curso disponível
    if (myCourses.length === 0) return false;
    
    // Apenas cursos que fazem parte de vitrines relacionadas aos cursos do aluno
    return showcaseCoursesIds.includes(c.id);
  });

  const handleStoreClick = () => {
    if (storeUrl) {
      window.open(storeUrl, '_blank');
    } else {
      router.push('/loja');
    }
  };

  // Função para dividir cursos em grupos de 5 (desktop)
  const chunkCourses = (courses: Course[], chunkSize: number) => {
    const chunks = [];
    for (let i = 0; i < courses.length; i += chunkSize) {
      chunks.push(courses.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const myCoursesChunks = chunkCourses(myCourses, 5);
  const availableCoursesChunks = chunkCourses(availableCourses, 5);

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

        {/* Seção Meus Cursos */}
        {myCourses.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-semibold text-blue-200 flex items-center gap-2">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                Meus Cursos
              </h2>
            </div>
            
            {/* Mobile: Carousel com setas */}
            {isMobile && (
              <Carousel ariaLabel="Meus cursos">
                {myCourses.map((c) => (
                  <CourseCard key={c.id} course={c} isOwned={true} />
                ))}
              </Carousel>
            )}
            
            {/* Desktop: Grid com grupos de 5 */}
            {!isMobile && myCoursesChunks.map((chunk, chunkIndex) => (
              <div key={chunkIndex} className="space-y-4">
                {chunkIndex > 0 && (
                  <h3 className="text-lg font-semibold text-blue-300 mt-6">
                    Mais cursos
                  </h3>
                )}
                <div className="grid grid-cols-5 gap-4">
                  {chunk.map((c) => (
                    <CourseCard key={c.id} course={c} isOwned={true} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

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
            
            {/* Mobile: Carousel com setas */}
            {isMobile && (
              <Carousel ariaLabel="Cursos disponíveis">
                {availableCourses.map((c) => (
                  <CourseCard key={c.id} course={c} isOwned={false} />
                ))}
              </Carousel>
            )}
            
            {/* Desktop: Grid com grupos de 5 */}
            {!isMobile && availableCoursesChunks.map((chunk, chunkIndex) => (
              <div key={chunkIndex} className="space-y-4">
                {chunkIndex > 0 && (
                  <h3 className="text-lg font-semibold text-blue-300 mt-6">
                    Mais cursos
                  </h3>
                )}
                <div className="grid grid-cols-5 gap-4">
                  {chunk.map((c) => (
                    <CourseCard key={c.id} course={c} isOwned={false} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ) : myCourses.length > 0 ? (
          <section className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
              <BookOpen className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-green-200 mb-2">Parabéns! 🎉</h2>
              <p className="text-green-300">Você já tem acesso a todos os cursos disponíveis!</p>
              <p className="text-green-400 text-sm mt-2">Continue estudando e aproveitando seu aprendizado.</p>
            </div>
          </section>
        ) : null}

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
