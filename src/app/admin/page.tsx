'use client';

import Link from "next/link";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BookOpen, Users, BarChart3, Award, ShoppingCart, FileText, Settings, TrendingUp, UserCheck, BookOpenCheck, Clock, DollarSign } from "lucide-react";

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

  return (
    <div className="relative">
      <AdminSidebar />
      <main className="space-y-8 p-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">1,234</div>
                  <div className="text-blue-200 text-sm">Total de Alunos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">89</div>
                  <div className="text-blue-200 text-sm">Cursos Ativos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">456</div>
                  <div className="text-blue-200 text-sm">Certificados Emitidos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">R$ 45.2K</div>
                  <div className="text-blue-200 text-sm">Receita Mensal</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-blue-200">Atividades Recentes</h2>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-blue-200">Últimas Ações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Novo curso &quot;React Avançado&quot; criado</p>
                    <p className="text-blue-300 text-xs">Há 2 horas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">15 novos alunos cadastrados</p>
                    <p className="text-blue-300 text-xs">Há 4 horas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Award className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">8 certificados emitidos</p>
                    <p className="text-blue-300 text-xs">Há 6 horas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


