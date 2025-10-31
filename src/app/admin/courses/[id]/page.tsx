"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCourses } from "@/hooks/useCourses";
import { Course, Module, Lesson } from "@/types/course";
import { ArrowLeft, Edit, Eye, EyeOff, Plus, Trash2, Play, FileText, BookOpen, CreditCard } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminCourseForm } from "@/components/admin/AdminCourseForm";
import { ModuleForm } from "@/components/admin/ModuleForm";
import { LessonForm } from "@/components/admin/LessonForm";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { courses, isLoading, deleteCourse, updateCourse, createModule, updateModule, deleteModule, createLesson, updateLesson, deleteLesson } = useCourses();
  const [course, setCourse] = useState<Course | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isEditModuleDialogOpen, setIsEditModuleDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [isEditLessonDialogOpen, setIsEditLessonDialogOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const courseId = params.id as string;

  useEffect(() => {
    if (courses.length > 0) {
      const foundCourse = courses.find(c => c.id === courseId);
      setCourse(foundCourse || null);
    }
  }, [courses, courseId]);

  const handleDelete = async () => {
    if (!course) return;
    
    if (confirm(`Tem certeza que deseja excluir o curso "${course.title}"?`)) {
      try {
        await deleteCourse(course.id);
        router.push('/admin/courses');
      } catch (error) {
        console.error('Erro ao excluir curso:', error);
        alert('Erro ao excluir curso');
      }
    }
  };

  const handleEditCourse = async (courseData: Partial<Course>) => {
    if (!course) return;
    
    try {
      await updateCourse(course.id, courseData);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar curso:', error);
      alert('Erro ao atualizar curso: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  const handleCreateModule = async (moduleData: { title: string; description: string; order: number; unlockAfterDays: number; isPublished: boolean }) => {
    if (!course) return;
    
    try {
      await createModule(course.id, moduleData);
      setIsModuleDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar módulo:', error);
      alert('Erro ao criar módulo');
    }
  };

  const handleCreateLesson = async (lessonData: { title: string; type: 'video' | 'document' | 'text'; content: Record<string, unknown>; order: number; isPublished: boolean }) => {
    console.log('handleCreateLesson chamado com:', lessonData);
    console.log('selectedModuleId:', selectedModuleId);
    
    if (!selectedModuleId) {
      console.error('selectedModuleId não definido');
      return;
    }
    
    try {
      console.log('Chamando createLesson...');
      await createLesson(selectedModuleId, lessonData);
      console.log('Aula criada com sucesso');
      closeLessonDialog();
    } catch (error) {
      console.error('Erro ao criar aula:', error);
      alert('Erro ao criar aula: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  const handleEditLesson = async (lessonData: Partial<Lesson>) => {
    if (!editingLesson) return;
    
    try {
      await updateLesson(editingLesson.id, lessonData);
      setIsEditLessonDialogOpen(false);
      setEditingLesson(null);
    } catch (error) {
      console.error('Erro ao atualizar aula:', error);
      alert('Erro ao atualizar aula: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (confirm('Tem certeza que deseja excluir esta aula?')) {
      try {
        await deleteLesson(lessonId);
      } catch (error) {
        console.error('Erro ao excluir aula:', error);
        alert('Erro ao excluir aula: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
      }
    }
  };

  const openLessonDialog = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setIsLessonDialogOpen(true);
  };

  const closeLessonDialog = () => {
    setIsLessonDialogOpen(false);
    setSelectedModuleId(null);
  };

  const openEditLessonDialog = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setIsEditLessonDialogOpen(true);
  };

  const handleEditModule = async (moduleData: Partial<Module>) => {
    if (!editingModule) return;
    
    try {
      await updateModule(editingModule.id, moduleData);
      setIsEditModuleDialogOpen(false);
      setEditingModule(null);
    } catch (error) {
      console.error('Erro ao atualizar módulo:', error);
      alert('Erro ao atualizar módulo');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (confirm('Tem certeza que deseja excluir este módulo? Todas as aulas serão removidas.')) {
      try {
        await deleteModule(moduleId);
      } catch (error) {
        console.error('Erro ao excluir módulo:', error);
        alert('Erro ao excluir módulo');
      }
    }
  };

  const openEditModuleDialog = (module: Module) => {
    setEditingModule(module);
    setIsEditModuleDialogOpen(true);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'text':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Curso não encontrado</h1>
          <p className="text-gray-600 mb-4">O curso solicitado não foi encontrado.</p>
          <Button onClick={() => router.push('/admin/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Cursos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6 lg:ml-64">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/courses')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-600">Gerenciar curso e conteúdo</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => router.push(`/admin/courses/${course.id}/card`)}
            className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 hover:from-purple-600/20 hover:to-pink-600/20 border-purple-500/50"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Carteirinha
          </Button>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Editar Curso</DialogTitle>
                <DialogDescription>
                  Atualize as informações do curso
                </DialogDescription>
              </DialogHeader>
              <AdminCourseForm
                onSubmit={handleEditCourse}
                initialData={course}
                isLoading={false}
              />
            </DialogContent>
          </Dialog>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Course Info */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações do Curso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge variant={course.isPublished ? "default" : "secondary"}>
                  {course.isPublished ? (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Publicado
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Rascunho
                    </>
                  )}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Preço</label>
              <p className="text-lg font-semibold">
                {course.price > 0 ? `R$ ${course.price.toFixed(2)}` : 'Gratuito'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Duração Estimada</label>
              <p className="text-lg font-semibold">{course.estimatedDuration}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Total de Aulas</label>
              <p className="text-lg font-semibold">{course.totalLessons}</p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Modules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Módulos e Aulas</CardTitle>
              <CardDescription>
                {course.modules.length} módulo(s) • {course.totalLessons} aula(s)
              </CardDescription>
            </div>
            <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Módulo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Adicionar Módulo</DialogTitle>
                  <DialogDescription>
                    Crie um novo módulo para o curso
                  </DialogDescription>
                </DialogHeader>
                <ModuleForm
                  onSubmit={handleCreateModule}
                  courseId={course.id}
                  isLoading={false}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {course.modules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum módulo criado ainda</p>
              <p className="text-sm">Adicione módulos para organizar o conteúdo do curso</p>
            </div>
          ) : (
            <div className="space-y-6">
              {course.modules
                .sort((a, b) => a.order - b.order)
                .map((module) => (
                <div key={module.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Módulo {module.order}: {module.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant={module.isPublished ? "default" : "secondary"}>
                          {module.isPublished ? "Publicado" : "Rascunho"}
                        </Badge>
                        {module.unlockAfterDays > 0 && (
                          <span className="text-sm text-gray-500">
                            Liberado após {module.unlockAfterDays} dias
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditModuleDialog(module)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openLessonDialog(module.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Aula
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteModule(module.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>

                  {/* Lessons */}
                  {module.lessons.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Nenhuma aula neste módulo</p>
                      <p className="text-xs text-gray-400">Clique em &quot;Aula&quot; para adicionar a primeira aula</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {module.lessons
                        .sort((a, b) => a.order - b.order)
                        .map((lesson) => (
                        <div key={lesson.id} className="border border-gray-600 rounded-lg p-4 bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="flex-shrink-0 mt-1">
                                {getLessonIcon(lesson.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-white mb-1">{lesson.title}</h4>
                                
                                {/* Preview do conteúdo baseado no tipo */}
                                {lesson.type === 'video' && lesson.content.videoUrl && (
                                  <div className="bg-gray-700 rounded p-2 text-xs text-gray-300">
                                    <span className="font-medium">Vídeo:</span> {lesson.content.videoUrl}
                                  </div>
                                )}
                                {lesson.type === 'document' && lesson.content.documentUrl && (
                                  <div className="bg-gray-700 rounded p-2 text-xs text-gray-300">
                                    <span className="font-medium">Documento:</span> {lesson.content.documentUrl}
                                  </div>
                                )}
                                {lesson.type === 'text' && lesson.content.textContent && (
                                  <div className="bg-gray-700 rounded p-2 text-xs text-gray-300 max-h-20 overflow-hidden">
                                    <span className="font-medium">Conteúdo:</span> {lesson.content.textContent.substring(0, 100)}...
                                  </div>
                                )}
                                
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Badge 
                                variant={lesson.isPublished ? "default" : "secondary"} 
                                className="text-xs"
                              >
                                {lesson.isPublished ? "Publicado" : "Rascunho"}
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => openEditLessonDialog(lesson)}
                                title="Editar aula"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                onClick={() => handleDeleteLesson(lesson.id)}
                                title="Excluir aula"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para criar aula */}
      <Dialog open={isLessonDialogOpen} onOpenChange={(open) => {
        if (!open) closeLessonDialog();
        else setIsLessonDialogOpen(open);
      }}>
        <DialogContent className="min-w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Aula</DialogTitle>
            <DialogDescription>
              Crie uma nova aula para o módulo
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
            {selectedModuleId && (
              <LessonForm
                key={`lesson-form-${selectedModuleId}`}
                onSubmit={handleCreateLesson}
                moduleId={selectedModuleId}
                isLoading={false}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar módulo */}
      <Dialog open={isEditModuleDialogOpen} onOpenChange={setIsEditModuleDialogOpen}>
        <DialogContent className="max-w-full max-h-full">
          <DialogHeader>
            <DialogTitle>Editar Módulo</DialogTitle>
            <DialogDescription>
              Atualize as informações do módulo
            </DialogDescription>
          </DialogHeader>
          {editingModule && (
            <ModuleForm
              onSubmit={handleEditModule}
              courseId={course.id}
              initialData={editingModule}
              isLoading={false}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para editar aula */}
      <Dialog open={isEditLessonDialogOpen} onOpenChange={setIsEditLessonDialogOpen}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Aula</DialogTitle>
            <DialogDescription>
              Atualize as informações da aula
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
            {editingLesson && (
              <LessonForm
                onSubmit={handleEditLesson}
                moduleId={editingLesson.moduleId}
                initialData={editingLesson}
                isLoading={false}
                isEditing={true}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
