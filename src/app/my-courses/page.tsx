'use client';

import { Sidebar } from "@/components/Sidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { CourseCard } from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { mockCourses } from "@/mocks/data";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, Award, Clock } from "lucide-react";

export default function MyCoursesPage() {
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

  return (
    <div className="relative">
      <Sidebar />
      <main className="space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20 text-blue-200">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-blue-200 flex items-center gap-3">
                <BookOpen className="w-8 h-8" />
                Meus Cursos
              </h1>
              <p className="text-blue-300 mt-1">
                {myCourses.length} cursos em sua biblioteca
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{myCourses.length}</div>
                <div className="text-blue-200 text-sm">Total de Cursos</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">8</div>
                <div className="text-blue-200 text-sm">Concluídos</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">24h</div>
                <div className="text-blue-200 text-sm">Tempo Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Cursos */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-blue-200">Todos os Meus Cursos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((course) => (
              <div key={course.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg mb-4 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-blue-300" />
                </div>
                <h3 className="font-semibold text-white mb-2">{course.title}</h3>
                <p className="text-blue-200 text-sm mb-4">{course.shortDesc}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-blue-300 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Iniciado em Jan 2024</span>
                  </div>
                  <div className="text-green-400 text-sm font-medium">75%</div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                  <div className="w-3/4 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Continuar Curso
                </Button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}


