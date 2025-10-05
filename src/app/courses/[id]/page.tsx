'use client';

import { Sidebar } from "@/components/Sidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, FileText, BookOpen, Clock, CheckCircle, Download, Eye, Menu, X, Trophy } from "lucide-react";
import { LessonViewer } from "@/components/LessonViewer";
import { useMyCourses } from "@/hooks/useCourses";
import { Course, Lesson } from "@/types/course";

export default function CoursePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { myCourses, isLoading: coursesLoading, checkCourseAccess, markLessonAsCompleted } = useMyCourses();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  useEffect(() => {
    const loadCourse = async () => {
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
      
      if (!user || user.role === 'admin') return;
      
      console.log('CoursePage - carregando curso:', id);
      
      // Primeiro, tentar encontrar na lista de "meus cursos"
      if (myCourses.length > 0) {
        const foundCourse = myCourses.find(c => c.id === id);
        if (foundCourse) {
          console.log('CoursePage - curso encontrado em myCourses:', foundCourse);
          setCourse(foundCourse);
          // Extrair todas as aulas de todos os módulos
          const allLessons: Lesson[] = [];
          foundCourse.modules.forEach(module => {
            allLessons.push(...module.lessons);
          });
          const sortedLessons = allLessons.sort((a, b) => a.order - b.order);
          setLessons(sortedLessons);
          
          // Encontrar a primeira aula não concluída e selecioná-la automaticamente
          const firstIncompleteLesson = sortedLessons.find(lesson => !lesson.completed);
          if (firstIncompleteLesson) {
            setSelectedLesson(firstIncompleteLesson);
          } else if (sortedLessons.length > 0) {
            // Se todas as aulas estão concluídas, selecionar a última
            setSelectedLesson(sortedLessons[sortedLessons.length - 1]);
          }
          return;
        }
      }
      
      // Se não encontrou em "meus cursos", verificar acesso direto
      console.log('CoursePage - curso não encontrado em myCourses, verificando acesso direto...');
      const courseData = await checkCourseAccess(id);
      if (courseData) {
        console.log('CoursePage - curso encontrado via checkCourseAccess:', courseData);
        setCourse(courseData);
        // Extrair todas as aulas de todos os módulos
        const allLessons: Lesson[] = [];
        courseData.modules.forEach(module => {
          allLessons.push(...module.lessons);
        });
        const sortedLessons = allLessons.sort((a, b) => a.order - b.order);
        setLessons(sortedLessons);
        
        // Encontrar a primeira aula não concluída e selecioná-la automaticamente
        const firstIncompleteLesson = sortedLessons.find(lesson => !lesson.completed);
        if (firstIncompleteLesson) {
          setSelectedLesson(firstIncompleteLesson);
        } else if (sortedLessons.length > 0) {
          // Se todas as aulas estão concluídas, selecionar a última
          setSelectedLesson(sortedLessons[sortedLessons.length - 1]);
        }
      } else {
        console.log('CoursePage - curso não encontrado ou sem acesso');
        setCourse(null);
      }
    };
    
    loadCourse();
  }, [user, isLoading, router, id, myCourses, checkCourseAccess]);

  if (isLoading || coursesLoading) {
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

  if (!course) {
    return (
      <div className="relative">
        <Sidebar />
        <main className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Curso não encontrado</h1>
            <Button asChild>
              <Link href="/">Voltar para o início</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const completedLessons = lessons.filter(l => l.completed).length;
  const totalLessons = lessons.length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleLessonComplete = async (lessonId: string) => {
    console.log('CoursePage: handleLessonComplete chamado para lessonId:', lessonId);
    if (!course) return;
    
    try {
      console.log('CoursePage: chamando markLessonAsCompleted');
      // Marcar como concluída no banco
      await markLessonAsCompleted(course.id, lessonId);
      
      // Atualizar estado local
      const updatedLessons = lessons.map(lesson => 
        lesson.id === lessonId ? { ...lesson, completed: true } : lesson
      );
      setLessons(updatedLessons);
      
      // Verificar se todas as aulas foram concluídas
      const allLessonsCompleted = updatedLessons.every(lesson => lesson.completed);
      
      if (allLessonsCompleted) {
        // Se todas as aulas estão concluídas, voltar para a página do curso
        setTimeout(() => {
          setSelectedLesson(null);
        }, 2000); // Aguardar 2 segundos para mostrar a notificação
      } else {
        // Encontrar a próxima aula não concluída
        const currentIndex = updatedLessons.findIndex(lesson => lesson.id === lessonId);
        const nextIncompleteLesson = updatedLessons.slice(currentIndex + 1).find(lesson => !lesson.completed);
        
        if (nextIncompleteLesson) {
          setSelectedLesson(nextIncompleteLesson);
        }
      }
    } catch (error) {
      console.error('Erro ao marcar aula como concluída:', error);
      alert('Erro ao salvar progresso da aula');
    }
  };

  const handleBackToCourse = () => {
    setSelectedLesson(null);
  };

  const getLessonIcon = (type: Lesson["type"]) => {
    switch (type) {
      case 'video':
        return <Play className="w-5 h-5 text-red-400" />;
      case 'document':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'text':
        return <BookOpen className="w-5 h-5 text-green-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-400" />;
    }
  };

  const getLessonTypeText = (type: string) => {
    switch (type) {
      case 'video':
        return 'Vídeo';
      case 'document':
        return 'Documento';
      case 'text':
        return 'Texto';
      default:
        return 'Aula';
    }
  };

  // Se uma aula está selecionada, mostrar o visualizador de aula com barra lateral
  if (selectedLesson) {
    return (
      <div className="relative">
        <Sidebar />
        <div className="flex h-screen">
          {/* Barra Lateral com Histórico das Aulas */}
          <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white/5 backdrop-blur-sm border-r border-white/10 overflow-hidden`}>
            <div className="p-4 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-200">Aulas do Curso</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="text-blue-200 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {course.modules
                  .sort((a, b) => a.order - b.order)
                  .map((module, moduleIndex) => (
                    <div key={module.id} className="space-y-2">
                      {/* Cabeçalho do Módulo */}
                      <div className="flex items-center gap-2 px-2 py-1 bg-white/10 rounded-lg">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-500/20 rounded-full">
                          <span className="text-blue-200 text-xs font-semibold">{moduleIndex + 1}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-blue-200 truncate">
                          {module.title}
                        </h3>
                      </div>
                      
                      {/* Aulas do Módulo */}
                      <div className="ml-4 space-y-1">
                        {module.lessons
                          .sort((a, b) => a.order - b.order)
                          .map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className={`p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                selectedLesson.id === lesson.id
                                  ? 'bg-blue-500/20 border border-blue-500/50'
                                  : 'bg-white/5 hover:bg-white/10 border border-transparent'
                              }`}
                              onClick={() => setSelectedLesson(lesson)}
                            >
                              <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-6 h-6 bg-white/10 rounded-full">
                                  <span className="text-white text-xs font-semibold">{lessonIndex + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-medium text-white truncate">{lesson.title}</h4>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    {getLessonIcon(lesson.type)}
                                    <span className="text-xs text-blue-300">{getLessonTypeText(lesson.type)}</span>
                                    {lesson.completed && (
                                      <CheckCircle className="w-3 h-3 text-green-400" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <main className="flex-1 space-y-8 p-6 overflow-y-auto">
            {/* Header da Aula */}
            <div className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-4">
                {!sidebarOpen && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSidebarOpen(true)}
                    className="bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"
                  >
                    <Menu className="w-4 h-4" />
                  </Button>
                )}
                <Button 
                  onClick={handleBackToCourse}
                  variant="outline" 
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao Curso
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-blue-200 flex items-center gap-3">
                    {getLessonIcon(selectedLesson.type)}
                    {selectedLesson.title}
                    {selectedLesson.completed && (
                      <Badge className="bg-green-500/20 text-green-200 border-green-500/50 text-sm">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Concluída
                      </Badge>
                    )}
                  </h1>
                  <p className="text-blue-300 mt-1">{selectedLesson.description}</p>
                </div>
              </div>
              <LogoutButton />
            </div>

            {/* Visualizador de Aula */}
            <LessonViewer
              lesson={selectedLesson}
              lessons={lessons}
              onComplete={() => handleLessonComplete(selectedLesson.id)}
              onBack={handleBackToCourse}
              onPrevious={() => {
                const currentIndex = lessons.findIndex(lesson => lesson.id === selectedLesson.id);
                if (currentIndex > 0) {
                  setSelectedLesson(lessons[currentIndex - 1]);
                }
              }}
              onNext={() => {
                const currentIndex = lessons.findIndex(lesson => lesson.id === selectedLesson.id);
                if (currentIndex < lessons.length - 1) {
                  setSelectedLesson(lessons[currentIndex + 1]);
                }
              }}
            />
          </main>
        </div>
      </div>
    );
  }

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
                {course.title}
              </h1>
              <p className="text-blue-300 mt-1">{course.shortDescription}</p>
            </div>
          </div>
          <LogoutButton />
        </div>

        {/* Progresso do Curso */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-blue-200">Progresso do Curso</h2>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-white/10 border-white/20 text-blue-200">
                {completedLessons}/{totalLessons} aulas concluídas
              </Badge>
              {progressPercentage === 100 && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <Trophy className="w-3 h-3 mr-1" />
                  Concluído!
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Barra de Progresso Principal */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-200">Progresso Geral</span>
                <span className="text-white font-medium">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-500 ${
                    progressPercentage === 100 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            
            {/* Estatísticas Detalhadas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{completedLessons}</div>
                <div className="text-xs text-blue-200">Concluídas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{totalLessons - completedLessons}</div>
                <div className="text-xs text-blue-200">Restantes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{course.modules.length}</div>
                <div className="text-xs text-blue-200">Módulos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{course.estimatedDuration}</div>
                <div className="text-xs text-blue-200">Duração</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ações do Curso */}
        {lessons.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            {progressPercentage === 100 ? (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Parabéns!</h2>
                    <p className="text-blue-200">Você concluiu este curso com sucesso!</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-6 py-3"
                    onClick={() => {
                      // Navegar para página de certificados
                      router.push('/certificados');
                    }}
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    Emitir Certificado
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 border-white/20 text-blue-200 px-6 py-3"
                    onClick={() => {
                      setSelectedLesson(lessons[0]);
                    }}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Revisar Curso
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <h2 className="text-xl font-semibold text-blue-200 mb-4">
                  {completedLessons > 0 ? 'Continue seu aprendizado!' : 'Pronto para começar?'}
                </h2>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-3 text-lg"
                    onClick={() => {
                      const firstIncompleteLesson = lessons.find(lesson => !lesson.completed);
                      if (firstIncompleteLesson) {
                        setSelectedLesson(firstIncompleteLesson);
                      } else {
                        setSelectedLesson(lessons[0]);
                      }
                    }}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {lessons.some(l => !l.completed) ? 'Continuar Curso' : 'Revisar Curso'}
                  </Button>
                  
                  {completedLessons > 0 && (
                    <Button 
                      variant="outline"
                      className="bg-white/10 hover:bg-white/20 border-white/20 text-blue-200 px-6 py-3"
                      onClick={() => {
                        // Mostrar estatísticas detalhadas
                        alert(`Você já concluiu ${completedLessons} de ${totalLessons} aulas (${Math.round(progressPercentage)}%)`);
                      }}
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Ver Progresso
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lista de Aulas */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-blue-200">Aulas do Curso</h2>
            <div className="flex items-center gap-2 text-sm text-blue-300">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>{completedLessons} de {totalLessons} concluídas</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {course.modules
              .sort((a, b) => a.order - b.order)
              .map((module, moduleIndex) => (
                <div key={module.id} className="space-y-3">
                  {/* Cabeçalho do Módulo */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{moduleIndex + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                        <p className="text-blue-200 text-sm">{module.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-blue-300">
                          {module.lessons.filter(l => l.completed).length}/{module.lessons.length} aulas
                        </div>
                        <div className="w-20 bg-white/20 rounded-full h-1.5 mt-1">
                          <div 
                            className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                            style={{ 
                              width: `${module.lessons.length > 0 ? (module.lessons.filter(l => l.completed).length / module.lessons.length) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Aulas do Módulo */}
                  <div className="ml-4 space-y-2">
                    {module.lessons
                      .sort((a, b) => a.order - b.order)
                      .map((lesson, lessonIndex) => (
                        <Card 
                          key={lesson.id} 
                          className={`bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 ${
                            lesson.completed ? 'border-green-500/30 bg-green-500/5' : ''
                          }`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                  lesson.completed 
                                    ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                                    : 'bg-white/10'
                                }`}>
                                  {lesson.completed ? (
                                    <CheckCircle className="w-5 h-5 text-white" />
                                  ) : (
                                    <span className="text-white font-semibold">{lessonIndex + 1}</span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <CardTitle className="text-lg text-white flex items-center gap-2">
                                    {getLessonIcon(lesson.type)}
                                    {lesson.title}
                                    {lesson.completed && (
                                      <Badge className="bg-green-500/20 text-green-200 border-green-500/50 text-xs">
                                        Concluída
                                      </Badge>
                                    )}
                                  </CardTitle>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge 
                                  variant="outline" 
                                  className={`${
                                    lesson.completed 
                                      ? 'bg-green-500/20 border-green-500/50 text-green-200' 
                                      : 'bg-white/10 border-white/20 text-blue-200'
                                  }`}
                                >
                                  {getLessonTypeText(lesson.type)}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex gap-2">
                              <Button 
                                className={`flex-1 ${
                                  lesson.completed 
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                }`}
                                onClick={() => handleLessonSelect(lesson)}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                {lesson.completed ? 'Revisar Aula' : 'Iniciar Aula'}
                              </Button>
                              
                              {lesson.type === 'document' && (
                                <Button 
                                  variant="outline" 
                                  className="bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"
                                  onClick={() => {
                                    // Simular download do documento
                                    alert(`Baixando documento: ${lesson.title}`);
                                  }}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Baixar
                                </Button>
                              )}
                              
                              <Button 
                                variant="outline" 
                                className="bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"
                                onClick={() => handleLessonSelect(lesson)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Visualizar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}