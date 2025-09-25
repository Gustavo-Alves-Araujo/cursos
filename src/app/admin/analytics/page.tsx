'use client';

import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, TrendingUp, Users, BookOpen, Award, DollarSign, Clock, Target, Activity } from "lucide-react";

export default function AdminAnalyticsPage() {
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
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white transition-all duration-200">
              <Link href="/admin" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-blue-200 flex items-center gap-3">
                <BarChart3 className="w-8 h-8" />
                Analytics
              </h1>
              <p className="text-blue-300 mt-1">
                Métricas e insights da plataforma
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>

        {/* Métricas Principais */}
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
                  <div className="text-green-400 text-xs flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +12% este mês
                  </div>
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
                  <div className="text-green-400 text-xs flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +5 novos
                  </div>
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
                  <div className="text-blue-200 text-sm">Certificados</div>
                  <div className="text-green-400 text-xs flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +23 esta semana
                  </div>
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
                  <div className="text-green-400 text-xs flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +18% vs mês anterior
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos e Análises */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Engajamento */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-blue-200">Engajamento dos Alunos</CardTitle>
              <CardDescription className="text-blue-300">
                Métricas de atividade e participação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <span className="text-white">Tempo médio de estudo</span>
                  </div>
                  <span className="text-blue-200 font-semibold">2h 34min</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-green-400" />
                    <span className="text-white">Taxa de conclusão</span>
                  </div>
                  <span className="text-green-200 font-semibold">78%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-400" />
                    <span className="text-white">Sessões ativas hoje</span>
                  </div>
                  <span className="text-orange-200 font-semibold">342</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cursos Populares */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-blue-200">Cursos Mais Populares</CardTitle>
              <CardDescription className="text-blue-300">
                Ranking dos cursos mais acessados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-white">1</div>
                    <span className="text-white">React Avançado</span>
                  </div>
                  <span className="text-blue-200 font-semibold">1,234 alunos</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs font-bold text-white">2</div>
                    <span className="text-white">Node.js Completo</span>
                  </div>
                  <span className="text-blue-200 font-semibold">987 alunos</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white">3</div>
                    <span className="text-white">TypeScript Essencial</span>
                  </div>
                  <span className="text-blue-200 font-semibold">756 alunos</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">4</div>
                    <span className="text-white">Python para Data Science</span>
                  </div>
                  <span className="text-blue-200 font-semibold">623 alunos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Relatórios Rápidos */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-blue-200">Relatórios Rápidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-blue-200 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Novos Alunos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">47</div>
                <div className="text-blue-300 text-sm">Esta semana</div>
                <div className="text-green-400 text-xs mt-1">+15% vs semana anterior</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-blue-200 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certificados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">23</div>
                <div className="text-blue-300 text-sm">Emitidos hoje</div>
                <div className="text-green-400 text-xs mt-1">+8% vs ontem</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-blue-200 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Receita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">R$ 2.1K</div>
                <div className="text-blue-300 text-sm">Hoje</div>
                <div className="text-green-400 text-xs mt-1">+12% vs ontem</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
