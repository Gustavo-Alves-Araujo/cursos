"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminCourseForm } from "@/components/admin/AdminCourseForm";
import { useCourses } from "@/hooks/useCourses";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function NewCoursePage() {
  const router = useRouter();
  const { createCourse } = useCourses();
  const [isLoading, setIsLoading] = useState(false);

  console.log('NewCoursePage - componente renderizado');

  // Force reload when component mounts to ensure form works (only once)
  useEffect(() => {
    if (!sessionStorage.getItem('course-form-reloaded')) {
      sessionStorage.setItem('course-form-reloaded', 'true');
      window.location.reload();
    }
  }, []);

  const handleSubmit = async (data: { title: string; thumbnail: string; price: number; estimatedDuration: string; expirationDays: number; externalLink: string; isPublished: boolean }) => {
    console.log('NewCoursePage - handleSubmit chamado com dados:', data);
    setIsLoading(true);
    try {
      // Adicionar campos obrigatórios que não são coletados pelo formulário
      const courseData = {
        ...data,
        shortDescription: '', // Campo removido do formulário, mas ainda necessário no banco
        instructorId: 'default-instructor', // TODO: usar ID do usuário logado
        instructorName: 'Instrutor Padrão' // TODO: usar nome do usuário logado
      };
      console.log('NewCoursePage - dados completos para criação:', courseData);
      const result = await createCourse(courseData);
      console.log('NewCoursePage - curso criado com sucesso:', result);
      router.push('/admin/courses');
    } catch (error) {
      console.error('NewCoursePage - erro ao criar curso:', error);
      alert(`Erro ao criar curso: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      throw error; // Re-throw para o formulário tratar
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="relative">
        <AdminSidebar />
        <main className="space-y-6 p-6 lg:ml-64">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Novo Curso</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Voltar
            </button>
          </div>
          
          <div className="max-w-4xl">
            
            <AdminCourseForm 
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}


