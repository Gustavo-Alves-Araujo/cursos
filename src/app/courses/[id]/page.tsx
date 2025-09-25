'use client';

import { Sidebar } from "@/components/Sidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockCourses, mockLessons } from "@/mocks/data";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, FileText, BookOpen, Clock, CheckCircle, Download, Eye } from "lucide-react";
import { LessonViewer } from "@/components/LessonViewer";

export default function CoursePage({ params }: { params: { id: string } }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  
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
    
    // Buscar curso e aulas
    const foundCourse = mockCourses.find(c => c.id === params.id);
    const courseLessons = mockLessons.filter(l => l.courseId === params.id);
    
    setCourse(foundCourse);
    setLessons(courseLessons.sort((a, b) => a.order - b.order));
  }, [user, isLoading, router, params.id]);

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

  const handleLessonSelect = (lesson: any) => {
    setSelectedLesson(lesson);
  };

  const handleLessonComplete = (lessonId: string) => {
    setLessons(prev => prev.map(lesson => 
      lesson.id === lessonId ? { ...lesson, completed: true } : lesson
    ));
    setSelectedLesson(null);
  };

  const handleBackToCourse = () => {
    setSelectedLesson(null);
  };

  const getLessonIcon = (type: string) => {
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

  // Se uma aula está selecionada, mostrar o visualizador de aula
  if (selectedLesson) {
    return (
      <div className="relative">
        <Sidebar />
        <main className="space-y-8 p-6">
          {/* Header da Aula */}
          <div className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
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
                  <BookOpen className="w-8 h-8" />
                  {selectedLesson.title}
                </h1>
                <p className="text-blue-300 mt-1">{selectedLesson.description}</p>
              </div>
            </div>
            <LogoutButton />
          </div>

          {/* Visualizador de Aula */}
          <LessonViewer
            lesson={selectedLesson}
            onComplete={() => handleLessonComplete(selectedLesson.id)}
            onBack={handleBackToCourse}
          />
        </main>
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
              <p className="text-blue-300 mt-1">{course.shortDesc}</p>
            </div>
          </div>
          <LogoutButton />
        </div>

        {/* Progresso do Curso */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-blue-200">Progresso do Curso</h2>
            <Badge variant="outline" className="bg-white/10 border-white/20 text-blue-200">
              {completedLessons}/{totalLessons} aulas concluídas
            </Badge>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 mb-2">
            <div 
              className="h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-blue-300">
            <span>{Math.round(progressPercentage)}% concluído</span>
            <span>{totalLessons} aulas no total</span>
          </div>
        </div>

        {/* Lista de Aulas */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-blue-200">Aulas do Curso</h2>
          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <Card key={lesson.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-full">
                        <span className="text-white font-semibold">{index + 1}</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                          {getLessonIcon(lesson.type)}
                          {lesson.title}
                        </CardTitle>
                        <CardDescription className="text-blue-200">
                          {lesson.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {lesson.duration && (
                        <div className="flex items-center gap-1 text-blue-300 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{lesson.duration}</span>
                        </div>
                      )}
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
                      {lesson.completed && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
        </section>
      </main>
    </div>
  );
}