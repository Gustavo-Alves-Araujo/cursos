'use client';

import { Sidebar } from "@/components/Sidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, FileText, BookOpen, CheckCircle, Download, Eye, Menu, X, Trophy } from "lucide-react";
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
  const [hasLoadedCourse, setHasLoadedCourse] = useState(false);
  
  // Função para salvar a aula selecionada no sessionStorage
  const saveSelectedLesson = (lesson: Lesson) => {
    if (typeof window !== 'undefined') {
      console.log('CoursePage - salvando aula selecionada:', lesson.title, 'ID:', lesson.id);
      sessionStorage.setItem(`selectedLesson_${id}`, lesson.id);
    }
  };
  
  // Função para carregar a aula selecionada do sessionStorage
  const loadSelectedLesson = (lessons: Lesson[]): Lesson | null => {
    if (typeof window !== 'undefined') {
      const savedLessonId = sessionStorage.getItem(`selectedLesson_${id}`);
      console.log('CoursePage - tentando carregar aula salva:', savedLessonId);
      if (savedLessonId) {
        const savedLesson = lessons.find(lesson => lesson.id === savedLessonId);
        if (savedLesson) {
          console.log('CoursePage - carregando aula salva:', savedLesson.title);
          return savedLesson;
        } else {
          console.log('CoursePage - aula salva não encontrada na lista de aulas');
        }
      } else {
        console.log('CoursePage - nenhuma aula salva encontrada no sessionStorage');
      }
    }
    return null;
  };
  
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
      
      console.log('CoursePage - carregando curso:', id, 'hasLoadedCourse:', hasLoadedCourse);
      
      // Se já carregou o curso e tem aulas, só verificar se precisa restaurar a seleção
      if (hasLoadedCourse && lessons.length > 0) {
        console.log('CoursePage - curso já carregado, verificando seleção de aula');
        const savedLesson = loadSelectedLesson(lessons);
        if (savedLesson && (!selectedLesson || selectedLesson.id !== savedLesson.id)) {
          console.log('CoursePage - restaurando aula salva:', savedLesson.title);
          setSelectedLesson(savedLesson);
        }
        return;
      }
      
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
          
          // Tentar carregar aula salva primeiro
          const savedLesson = loadSelectedLesson(sortedLessons);
          if (savedLesson) {
            setSelectedLesson(savedLesson);
          } else {
            // Se não há aula salva, encontrar a primeira aula não concluída
            const firstIncompleteLesson = sortedLessons.find(lesson => !lesson.completed);
            if (firstIncompleteLesson) {
              setSelectedLesson(firstIncompleteLesson);
            } else if (sortedLessons.length > 0) {
              // Se todas as aulas estão concluídas, selecionar a última
              setSelectedLesson(sortedLessons[sortedLessons.length - 1]);
            }
          }
          setHasLoadedCourse(true);
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
        
        // Tentar carregar aula salva primeiro
        const savedLesson = loadSelectedLesson(sortedLessons);
        if (savedLesson) {
          setSelectedLesson(savedLesson);
        } else {
          // Se não há aula salva, encontrar a primeira aula não concluída
          const firstIncompleteLesson = sortedLessons.find(lesson => !lesson.completed);
          if (firstIncompleteLesson) {
            setSelectedLesson(firstIncompleteLesson);
          } else if (sortedLessons.length > 0) {
            // Se todas as aulas estão concluídas, selecionar a última
            setSelectedLesson(sortedLessons[sortedLessons.length - 1]);
          }
        }
        setHasLoadedCourse(true);
      } else {
        console.log('CoursePage - curso não encontrado ou sem acesso');
        setCourse(null);
      }
    };
    
    loadCourse();
  }, [user, isLoading, router, id, myCourses, hasLoadedCourse, lessons, selectedLesson]); // Incluído todas as dependências necessárias

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
    // Se for uma aula de vídeo, fazer reload da página para garantir que o vídeo carregue corretamente
    if (lesson.type === 'video') {
      console.log('CoursePage - aula de vídeo selecionada, fazendo reload da página');
      saveSelectedLesson(lesson);
      // Fazer reload após um pequeno delay para garantir que o sessionStorage seja salvo
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } else {
      // Para outros tipos de aula, apenas selecionar normalmente
      setSelectedLesson(lesson);
      saveSelectedLesson(lesson);
    }
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
          saveSelectedLesson(nextIncompleteLesson);
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
        return <BookOpen className="w-5 h-5 text-blue-400" />;
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

  // Se uma aula está selecionada, mostrar o visualizador de aula
  if (selectedLesson) {
    const currentIndex = lessons.findIndex(lesson => lesson.id === selectedLesson.id);
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < lessons.length - 1;

    return (
      <div className="relative">
        <Sidebar />
        <div className="flex h-screen lg:ml-64">
          {/* Barra Lateral com Lista de Aulas - Apenas Desktop */}
          <div className="hidden lg:block w-72 bg-white/5 backdrop-blur-sm border-r border-white/10 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
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
                    <div key={module.id} className="space-y-3">
                      {/* Cabeçalho do Módulo */}
                      <div className="px-3 py-2 bg-white/10 rounded-lg">
                        <h3 className="text-sm font-semibold text-blue-200">
                          {module.title}
                        </h3>
                      </div>
                      
                      {/* Aulas do Módulo */}
                      <div className="ml-4 space-y-2">
                        {module.lessons
                          .sort((a, b) => a.order - b.order)
                          .map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                selectedLesson.id === lesson.id
                                  ? 'bg-blue-500/20 border border-blue-500/50'
                                  : 'bg-white/5 hover:bg-white/10 border border-transparent'
                              }`}
                              onClick={() => setSelectedLesson(lesson)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-white/10 rounded-full">
                                  <span className="text-white text-sm font-semibold">{lessonIndex + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-white line-clamp-2">{lesson.title}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getLessonIcon(lesson.type)}
                                    <span className="text-xs text-blue-300">{getLessonTypeText(lesson.type)}</span>
                                    {lesson.completed && (
                                      <CheckCircle className="w-4 h-4 text-blue-400" />
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
          <main className="flex-1 flex flex-col min-w-0">
            {/* Header da Aula */}
            <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col gap-4">
                  {/* Navegação */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button 
                      onClick={handleBackToCourse}
                      variant="outline" 
                      size="sm"
                      className="bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar ao Curso
                    </Button>
                    <Button 
                      asChild
                      variant="outline" 
                      size="sm"
                      className="bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"
                    >
                      <Link href="/">
                        <BookOpen className="w-4 h-4" />
                        Página Inicial
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="lg:hidden bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"
                    >
                      <Menu className="w-4 h-4" />
                      Continue seu curso
                    </Button>
                  </div>
                  
                  {/* Título da Aula */}
                  <div>
                    <h1 className="text-xl lg:text-3xl font-bold text-blue-200 flex items-center gap-3">
                      {getLessonIcon(selectedLesson.type)}
                      {selectedLesson.title}
                      {selectedLesson.completed && (
                        <Badge className="bg-green-500/20 text-green-200 border-green-500/50 text-sm">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Concluída
                        </Badge>
                      )}
                    </h1>
                  </div>
                </div>
              
              </div>
            </div>


            {/* Visualizador de Aula */}
            <div className="flex-1 overflow-y-auto">
              <LessonViewer
                lesson={selectedLesson}
                lessons={lessons}
                onComplete={() => handleLessonComplete(selectedLesson.id)}
                onBack={handleBackToCourse}
                onPrevious={() => {
                  if (hasPrevious) {
                    setSelectedLesson(lessons[currentIndex - 1]);
                  }
                }}
                onNext={() => {
                  if (hasNext) {
                    setSelectedLesson(lessons[currentIndex + 1]);
                  }
                }}
              />
            </div>
          </main>
        </div>

        {/* Modal Mobile para Lista de Aulas */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="absolute left-0 top-0 h-full w-72 bg-white/5 backdrop-blur-sm border-r border-white/10 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
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
                      <div key={module.id} className="space-y-3">
                        {/* Cabeçalho do Módulo */}
                        <div className="px-3 py-2 bg-white/10 rounded-lg">
                          <h3 className="text-sm font-semibold text-blue-200">
                            {module.title}
                          </h3>
                        </div>
                        
                        {/* Aulas do Módulo */}
                        <div className="ml-4 space-y-2">
                          {module.lessons
                            .sort((a, b) => a.order - b.order)
                            .map((lesson, lessonIndex) => (
                              <div
                                key={lesson.id}
                                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                  selectedLesson.id === lesson.id
                                    ? 'bg-blue-500/20 border border-blue-500/50'
                                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                }`}
                                onClick={() => {
                                  setSelectedLesson(lesson);
                                  setSidebarOpen(false);
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-8 h-8 bg-white/10 rounded-full">
                                    <span className="text-white text-sm font-semibold">{lessonIndex + 1}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-white line-clamp-2">{lesson.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      {getLessonIcon(lesson.type)}
                                      <span className="text-xs text-blue-300">{getLessonTypeText(lesson.type)}</span>
                                      {lesson.completed && (
                                        <CheckCircle className="w-4 h-4 text-blue-400" />
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
          </div>
        )}
      </div>
    );
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
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
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
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            
            {/* Estatísticas Detalhadas */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-white/10">
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
            </div>
          </div>
        </div>

        {/* Ações do Curso */}
        {lessons.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            {progressPercentage === 100 ? (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Parabéns!</h2>
                    <p className="text-blue-200">Você concluiu este curso com sucesso!</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-6 py-3"
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
              <CheckCircle className="w-4 h-4 text-blue-400" />
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
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{module.title}</h3>
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
                            lesson.completed ? 'border-blue-500/30 bg-blue-500/5' : ''
                          }`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                  lesson.completed 
                                    ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
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
                                      <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/50 text-xs">
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
                                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-200' 
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
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' 
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