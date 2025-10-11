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
import { ArrowLeft, Plus, Award, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
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
      
      <main className="ml-64 p-6 min-h-screen">
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
              <CardTitle className="text-blue-200 text-xl flex items-center gap-2">
                <Award className="w-6 h-6" />
                Selecionar Curso
              </CardTitle>
              <p className="text-blue-300 text-sm">Escolha o curso para o qual deseja criar um template de certificado</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {courses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-blue-200 mb-2">Nenhum curso encontrado</h3>
                    <p className="text-blue-300">Crie alguns cursos primeiro antes de configurar templates de certificado.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {courses.map((course) => (
                      <motion.div
                        key={course.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <Card
                          className="bg-white/5 hover:bg-white/10 border-white/20 cursor-pointer transition-all duration-300 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10 group"
                          onClick={() => setSelectedCourseId(course.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Plus className="w-5 h-5 text-green-400" />
                              </div>
                            </div>
                            <h3 className="font-semibold text-white mb-2 line-clamp-2 leading-tight">{course.title}</h3>
                            <p className="text-blue-300 text-sm line-clamp-3 mb-3 leading-relaxed">{course.shortDescription}</p>
                            <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                              <Plus className="w-4 h-4" />
                              <span>Criar Template</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário de Template */}
        {selectedCourseId && (
          <div className="space-y-6">
            {/* Header do Curso Selecionado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border-blue-400/30 text-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          <Award className="w-5 h-5 text-yellow-400" />
                          {courses.find(c => c.id === selectedCourseId)?.title}
                        </h2>
                        <p className="text-blue-200 text-sm">Configure o template de certificado para este curso</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCourseId("")}
                      className="bg-white/10 hover:bg-white/20 border-white/30 text-white hover:border-blue-400/50 transition-all duration-200"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Trocar Curso
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

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
