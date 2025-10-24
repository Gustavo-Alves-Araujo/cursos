'use client';

import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, X, BookOpen, GripVertical } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useShowcase, useShowcases } from "@/hooks/useShowcases";
import { useCourses } from "@/hooks/useCourses";
import { Course } from "@/types/course";

export default function EditShowcasePage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { showcase, isLoading: showcaseLoading, refetch } = useShowcase(params.id);
  const { updateShowcase, addCourseToShowcase, removeCourseFromShowcase } = useShowcases();
  const { courses: allCourses, isLoading: coursesLoading } = useCourses();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (showcase) {
      setName(showcase.name);
      setDescription(showcase.description || '');
      setSelectedCourseIds(showcase.courses.map(c => c.id));
    }
  }, [showcase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Por favor, insira um nome para a vitrine');
      return;
    }

    setIsSaving(true);

    // Atualizar dados básicos da vitrine
    const { error: updateError } = await updateShowcase(params.id, {
      name,
      description: description || undefined
    });

    if (updateError) {
      alert('Erro ao atualizar vitrine');
      console.error(updateError);
      setIsSaving(false);
      return;
    }

    // Identificar cursos a adicionar e remover
    const currentCourseIds = showcase?.courses.map(c => c.id) || [];
    const coursesToAdd = selectedCourseIds.filter(id => !currentCourseIds.includes(id));
    const coursesToRemove = currentCourseIds.filter(id => !selectedCourseIds.includes(id));

    // Adicionar novos cursos
    for (const courseId of coursesToAdd) {
      await addCourseToShowcase(params.id, courseId);
    }

    // Remover cursos
    for (const courseId of coursesToRemove) {
      await removeCourseFromShowcase(params.id, courseId);
    }

    setIsSaving(false);
    await refetch();
    router.push('/admin/showcases');
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      }
      return [...prev, courseId];
    });
  };

  if (authLoading || showcaseLoading || coursesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (!showcase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <AdminSidebar />
        <main className="p-4 sm:p-6 lg:ml-64 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <Card className="p-12 text-center bg-white/10 backdrop-blur border-white/20">
              <h2 className="text-xl font-semibold text-white mb-2">
                Vitrine não encontrada
              </h2>
              <p className="text-blue-200 mb-6">
                A vitrine que você está procurando não existe ou foi deletada.
              </p>
              <Button
                onClick={() => router.push('/admin/showcases')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Voltar para Vitrines
              </Button>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Filtrar cursos publicados
  const publishedCourses = allCourses.filter(c => c.isPublished);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <AdminSidebar />
      <main className="p-4 sm:p-6 lg:ml-64 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/showcases')}
              className="text-blue-300 hover:text-white hover:bg-white/10 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-white mb-2">Editar Vitrine</h1>
            <p className="text-blue-200">
              Atualize as informações e cursos desta vitrine
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados Básicos */}
            <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Informações Básicas</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Nome da Vitrine *
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Cursos de Marketing Digital"
                    required
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    Descrição (opcional)
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o objetivo desta vitrine..."
                    rows={4}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
            </Card>

            {/* Seleção de Cursos */}
            <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Cursos da Vitrine</h2>
              <p className="text-blue-200 mb-4">
                Selecione os cursos que farão parte desta vitrine:
              </p>

              {publishedCourses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                  <p className="text-blue-200">Nenhum curso publicado disponível</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {publishedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <Checkbox
                        id={`course-${course.id}`}
                        checked={selectedCourseIds.includes(course.id)}
                        onCheckedChange={() => toggleCourse(course.id)}
                        className="mt-1"
                      />
                      <label
                        htmlFor={`course-${course.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium text-white mb-1">{course.title}</div>
                        <div className="text-sm text-blue-200">{course.shortDescription}</div>
                        <div className="text-xs text-blue-300 mt-1">
                          {course.modules.length} módulo{course.modules.length !== 1 ? 's' : ''}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-200 text-sm">
                  <strong>{selectedCourseIds.length}</strong> curso{selectedCourseIds.length !== 1 ? 's' : ''} selecionado{selectedCourseIds.length !== 1 ? 's' : ''}
                </p>
              </div>
            </Card>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/showcases')}
                disabled={isSaving}
                className="border-white/20 text-blue-300 hover:bg-white/10"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? (
                  'Salvando...'
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

