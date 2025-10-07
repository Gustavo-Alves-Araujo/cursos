'use client';

import { Sidebar } from "@/components/Sidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Award, Clock, Play, CheckCircle, Trophy, TrendingUp } from "lucide-react";
import { useMyCourses } from "@/hooks/useCourses";

export default function MyCoursesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { myCourses, isLoading: coursesLoading } = useMyCourses();
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
    totalTime: 0
  });
  
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

  // Calcular estatísticas dos cursos
  useEffect(() => {
    if (myCourses.length > 0) {
      const totalLessons = myCourses.reduce((acc, course) => {
        return acc + course.modules.reduce((moduleAcc, module) => {
          return moduleAcc + module.lessons.length;
        }, 0);
      }, 0);

      const completedLessons = myCourses.reduce((acc, course) => {
        return acc + course.modules.reduce((moduleAcc, module) => {
          return moduleAcc + module.lessons.filter(lesson => lesson.completed).length;
        }, 0);
      }, 0);

      const completedCourses = myCourses.filter(course => {
        const totalCourseLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
        const completedCourseLessons = course.modules.reduce((acc, module) => 
          acc + module.lessons.filter(lesson => lesson.completed).length, 0);
        return totalCourseLessons > 0 && completedCourseLessons === totalCourseLessons;
      }).length;

      setStats({
        totalCourses: myCourses.length,
        completedCourses,
        totalLessons,
        completedLessons,
        totalTime: myCourses.length * 2.5 // Estimativa de horas por curso
      });
    }
  }, [myCourses]);

  if (isLoading || coursesLoading) {
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

  return (
    <div className="relative">
      <Sidebar />
      <main className="space-y-8 p-6 lg:ml-64">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalCourses}</div>
                <div className="text-blue-200 text-sm">Total de Cursos</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.completedCourses}</div>
                <div className="text-blue-200 text-sm">Concluídos</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.completedLessons}/{stats.totalLessons}</div>
                <div className="text-blue-200 text-sm">Aulas Concluídas</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalTime}h</div>
                <div className="text-blue-200 text-sm">Tempo Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Cursos */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-blue-200">Meus Cursos</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 border-white/20 text-blue-200">
                <TrendingUp className="w-4 h-4 mr-2" />
                Em Progresso
              </Button>
              <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 border-white/20 text-blue-200">
                <Trophy className="w-4 h-4 mr-2" />
                Concluídos
              </Button>
            </div>
          </div>
          
          {myCourses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-12 h-12 text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum curso encontrado</h3>
              <p className="text-blue-200 mb-6">Você ainda não está matriculado em nenhum curso.</p>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Link href="/courses">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explorar Cursos
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {myCourses.map((course) => {
                const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
                const completedLessons = course.modules.reduce((acc, module) => 
                  acc + module.lessons.filter(lesson => lesson.completed).length, 0);
                const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
                const isCompleted = progressPercentage === 100;
                
                return (
                  <Card key={course.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
                    <CardHeader className="pb-3">
                      <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg mb-4 flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-indigo-500/30 transition-all duration-300">
                        <BookOpen className="w-12 h-12 text-blue-300" />
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-white mb-1 line-clamp-2">{course.title}</CardTitle>
                          <CardDescription className="text-blue-200 text-sm line-clamp-2">
                            {course.shortDescription}
                          </CardDescription>
                        </div>
                        {isCompleted && (
                          <div className="ml-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                              <Trophy className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Progresso */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-200">Progresso</span>
                          <span className="text-white font-medium">{Math.round(progressPercentage)}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isCompleted 
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                                : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-blue-300">
                          <span>{completedLessons}/{totalLessons} aulas</span>
                          <span>{course.estimatedDuration}</span>
                        </div>
                      </div>
                      
                      {/* Status e Badges */}
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`${
                            isCompleted 
                              ? 'bg-blue-500/20 border-blue-500/50 text-blue-200' 
                              : 'bg-blue-500/20 border-blue-500/50 text-blue-200'
                          }`}
                        >
                          {isCompleted ? 'Concluído' : 'Em Progresso'}
                        </Badge>
                        {course.modules.length > 0 && (
                          <Badge variant="outline" className="bg-white/10 border-white/20 text-blue-200">
                            {course.modules.length} módulos
                          </Badge>
                        )}
                      </div>
                      
                      {/* Botões de Ação */}
                      <div className="flex gap-2">
                        <Button 
                          asChild 
                          className={`flex-1 ${
                            isCompleted 
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' 
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                          }`}
                        >
                          <Link href={`/courses/${course.id}`}>
                            <Play className="w-4 h-4 mr-2" />
                            {isCompleted ? 'Revisar Curso' : 'Continuar Curso'}
                          </Link>
                        </Button>
                        
                        {isCompleted && (
                          <Button 
                            asChild 
                            variant="outline" 
                            size="sm"
                            className="bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"
                          >
                            <Link href="/certificados">
                              <Award className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}


