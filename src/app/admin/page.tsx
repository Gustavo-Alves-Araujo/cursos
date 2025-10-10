'use client';

import Link from "next/link";
import { AdminSidebar } from "@/components/AdminSidebar";
import { PasswordResetGuard } from "@/components/PasswordResetGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BookOpen, Users, BarChart3, Award, FileText, UserCheck, BookOpenCheck, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
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
  }, [user, isLoading]); // Remove router from dependencies

  if (isLoading) {
    return (
      <div className="relative">
        <AdminSidebar />
        <main className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-2">Carregando...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <PasswordResetGuard>
      <div className="relative">
        <AdminSidebar />
        <main className="space-y-8 p-6 lg:ml-64">
        {/* Header */}
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div>
            <h1 className="text-3xl font-bold text-blue-200">Dashboard Admin</h1>
            <p className="text-blue-300 mt-1">Bem-vindo ao painel administrativo</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-200">
              Olá, {user.name}
            </span>
            <LogoutButton />
          </div>
        </div>

        {/* Estatísticas */}

        {/* Ações Rápidas */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-blue-200">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-blue-200 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Gestão de Cursos
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Criar, editar e gerenciar cursos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Link href="/admin/courses/new" className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Novo Curso
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white">
                    <Link href="/admin/courses" className="flex items-center gap-2">
                      <BookOpenCheck className="w-4 h-4" />
                      Ver Todos
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-blue-200 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Gestão de Alunos
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Gerenciar alunos e atribuir cursos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button asChild className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    <Link href="/admin/students" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Ver Alunos
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white">
                    <Link href="/admin/assign" className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Atribuir Cursos
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-blue-200 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Analytics
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Relatórios e métricas da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Link href="/admin/analytics" className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Ver Analytics
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white">
                    <Link href="/admin/reports" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Relatórios
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Atividades Recentes */}

      </main>
    </div>
    </PasswordResetGuard>
  );
}


