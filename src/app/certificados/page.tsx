'use client';

import { Sidebar } from "@/components/Sidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CertificateViewer } from "@/components/CertificateViewer";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Award, Calendar, CheckCircle, Trophy, Plus, BookOpen } from "lucide-react";
import { useMyCourses } from "@/hooks/useCourses";
import { CertificateService } from "@/lib/certificateService";
import { Certificate } from "@/types/certificate";

export default function CertificadosPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { myCourses } = useMyCourses();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoadingCertificates, setIsLoadingCertificates] = useState(true);
  
  // Cursos concluídos que podem gerar certificados
  const cursosConcluidos = myCourses.filter(course => {
    const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
    const completedLessons = course.modules.reduce((acc, module) => 
      acc + module.lessons.filter(lesson => lesson.completed).length, 0);
    return totalLessons > 0 && completedLessons === totalLessons;
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

  const loadUserCertificates = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoadingCertificates(true);
      const userCertificates = await CertificateService.getUserCertificates(user.id);
      setCertificates(userCertificates);
    } catch (error) {
      console.error('Erro ao carregar certificados:', error);
    } finally {
      setIsLoadingCertificates(false);
    }
  }, [user]);

  // Carregar certificados do usuário
  useEffect(() => {
    if (user && user.role !== 'admin') {
      loadUserCertificates();
    }
  }, [user, loadUserCertificates]);

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

  const handleEmitirCertificado = async (courseId: string) => {
    if (!user) return;
    
    try {
      console.log('🎯 Tentando emitir certificado para curso:', courseId);
      
      const course = myCourses.find(c => c.id === courseId);
      if (!course) {
        console.log('❌ Curso não encontrado na lista do usuário');
        return;
      }

      console.log('📚 Curso encontrado:', course.title);

      // Verificar se já existe certificado para este curso
      const hasCertificate = await CertificateService.hasCertificate(user.id, courseId);
      if (hasCertificate) {
        alert('Você já possui um certificado para este curso!');
        return;
      }

      console.log('✅ Não possui certificado ainda, prosseguindo...');

      // Gerar certificado
      const certificate = await CertificateService.generateCertificate(
        user.id,
        courseId,
        user.name,
        new Date().toISOString().split('T')[0]
      );

      // Atualizar lista de certificados
      setCertificates(prev => [certificate, ...prev]);
      
      // Mostrar notificação de sucesso
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
      notification.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
          <div>
            <div class="font-semibold">Certificado Emitido! 🎉</div>
            <div class="text-sm">Seu certificado foi gerado com sucesso!</div>
          </div>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.remove('translate-x-full');
      }, 100);
      
      setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 4000);
    } catch (error) {
      console.error('Erro ao emitir certificado:', error);
      alert('Erro ao emitir certificado: ' + (error as Error).message);
    }
  };

  return (
    <div className="relative">
      <Sidebar />
      <main className="space-y-8 p-6 lg:ml-64">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white transition-all duration-200">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-blue-200 flex items-center gap-3">
                <Award className="w-8 h-8" />
                Meus Certificados
              </h1>
              <p className="text-blue-300 mt-1">
                {certificates.length} certificados conquistados
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{certificates.length}</div>
                <div className="text-blue-200 text-sm">Total de Certificados</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">5</div>
                <div className="text-blue-200 text-sm">Cursos Concluídos</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">2024</div>
                <div className="text-blue-200 text-sm">Ano de Conquistas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cursos Concluídos - Emitir Certificados */}
        {cursosConcluidos.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Cursos Concluídos</h2>
                <p className="text-blue-200">Você pode emitir certificados para estes cursos</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cursosConcluidos.map((course) => (
                <div key={course.id} className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{course.title}</h3>
                      <p className="text-blue-200 text-sm">{course.shortDescription}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-green-500/20 text-green-200 border-green-500/50 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Concluído
                        </Badge>
                        <span className="text-blue-300 text-xs">{course.estimatedDuration}</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleEmitirCertificado(course.id)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 ml-4"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Emitir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Se não há cursos concluídos */}
        {cursosConcluidos.length === 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-blue-300" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Nenhum curso concluído</h2>
            <p className="text-blue-200 mb-6">Complete um curso para poder emitir seu primeiro certificado!</p>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Link href="/my-courses">
                <BookOpen className="w-4 h-4 mr-2" />
                Ver Meus Cursos
              </Link>
            </Button>
          </div>
        )}

        {/* Lista de Certificados */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-blue-200">Certificados Conquistados</h2>
            <div className="flex items-center gap-2 text-sm text-blue-300">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>{certificates.length} certificados</span>
            </div>
          </div>
          
          {isLoadingCertificates ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-blue-200">Carregando certificados...</p>
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-12 h-12 text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum certificado ainda</h3>
              <p className="text-blue-200 mb-6">Complete um curso para emitir seu primeiro certificado!</p>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Link href="/my-courses">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Ver Meus Cursos
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {certificates.map((certificate) => (
                <CertificateViewer 
                  key={certificate.id} 
                  certificate={certificate}
                  courseTitle={myCourses.find(c => c.id === certificate.courseId)?.title}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
