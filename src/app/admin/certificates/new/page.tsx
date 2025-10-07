'use client';

import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/LogoutButton";
import { CertificateTemplateForm } from "@/components/admin/CertificateTemplateForm";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Award } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";

export default function NewCertificateTemplatePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { courses } = useCourses();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role !== 'admin') {
        router.push('/');
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

  if (!user || user.role !== 'admin') {
    return null;
  }

  const handleTemplateSuccess = (template: unknown) => {
    // Redirecionar para a página de certificados com sucesso
    router.push('/admin/certificates?tab=templates&success=true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <AdminSidebar />
      
      <main className="ml-64 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="bg-white/10 hover:bg-white/20 border-white/30 text-white"
            >
              <Link href="/admin/certificates">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Criar Template de Certificado</h1>
                <p className="text-blue-200">Configure um novo template de certificado para um curso</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seleção de Curso */}
        {!selectedCourseId && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white mb-6">
            <CardHeader>
              <CardTitle className="text-blue-200 text-xl">Selecionar Curso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-blue-300">Escolha o curso para o qual deseja criar um template de certificado:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <Card
                      key={course.id}
                      className="bg-white/5 hover:bg-white/10 border-white/20 cursor-pointer transition-all duration-200 hover:scale-105"
                      onClick={() => setSelectedCourseId(course.id)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-white mb-2">{course.title}</h3>
                        <p className="text-blue-300 text-sm line-clamp-2">{course.shortDescription}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <Plus className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm">Criar Template</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário de Template */}
        {selectedCourseId && (
          <div className="space-y-6">
            {/* Header do Curso Selecionado */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Template para: {courses.find(c => c.id === selectedCourseId)?.title}
                    </h2>
                    <p className="text-blue-300">Configure o template de certificado para este curso</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCourseId("")}
                    className="bg-white/10 hover:bg-white/20 border-white/30 text-white"
                  >
                    Trocar Curso
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Formulário */}
            <CertificateTemplateForm
              courseId={selectedCourseId}
              onSuccess={handleTemplateSuccess}
            />
          </div>
        )}
      </main>
    </div>
  );
}
