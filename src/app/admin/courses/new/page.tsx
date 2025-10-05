"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { AdminCourseForm } from "@/components/admin/AdminCourseForm";
import { useCourses } from "@/hooks/useCourses";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function NewCoursePage() {
  const router = useRouter();
  const { createCourse } = useCourses();
  const [isLoading, setIsLoading] = useState(false);

  console.log('NewCoursePage - componente renderizado');

  const handleSubmit = async (data: any) => {
    console.log('Dados do formulário:', data);
    setIsLoading(true);
    try {
      const result = await createCourse(data);
      console.log('Curso criado com sucesso:', result);
      router.push('/admin/courses');
    } catch (error) {
      console.error('Erro ao criar curso:', error);
      alert(`Erro ao criar curso: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      throw error; // Re-throw para o formulário tratar
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="relative">
        <Sidebar />
        <main className="space-y-6 p-6">
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
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800">Debug Info:</h3>
              <p className="text-sm text-blue-600">Formulário carregado. Verifique o console para logs detalhados.</p>
              <button 
                onClick={() => {
                  console.log('Teste de clique - formulário funcionando');
                  alert('Formulário está funcionando!');
                }}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Teste de Funcionamento
              </button>
            </div>
            
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


