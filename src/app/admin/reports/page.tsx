'use client';

import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Download, Calendar, TrendingUp, Users, BookOpen, Award, Activity } from "lucide-react";

// Mock data para relatórios
const mockReports = [
  {
    id: "rep-1",
    title: "Relatório de Vendas Mensal",
    description: "Análise completa das vendas do mês atual",
    type: "Vendas",
    period: "Mensal",
    lastGenerated: "2024-03-15",
    status: "Disponível",
    downloads: 23
  },
  {
    id: "rep-2",
    title: "Relatório de Alunos Ativos",
    description: "Lista de todos os alunos ativos na plataforma",
    type: "Alunos",
    period: "Semanal",
    lastGenerated: "2024-03-14",
    status: "Disponível",
    downloads: 15
  },
  {
    id: "rep-3",
    title: "Relatório de Cursos Mais Populares",
    description: "Ranking dos cursos com maior engajamento",
    type: "Cursos",
    period: "Mensal",
    lastGenerated: "2024-03-10",
    status: "Disponível",
    downloads: 31
  },
  {
    id: "rep-4",
    title: "Relatório de Certificados Emitidos",
    description: "Estatísticas de certificados emitidos no período",
    type: "Certificados",
    period: "Trimestral",
    lastGenerated: "2024-03-01",
    status: "Disponível",
    downloads: 8
  },
  {
    id: "rep-5",
    title: "Relatório de Receita Anual",
    description: "Análise financeira completa do ano",
    type: "Financeiro",
    period: "Anual",
    lastGenerated: "2024-01-15",
    status: "Disponível",
    downloads: 12
  }
];

export default function AdminReportsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

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

  const filteredReports = mockReports.filter(report => {
    const matchesPeriod = selectedPeriod === "all" || report.period.toLowerCase() === selectedPeriod.toLowerCase();
    const matchesType = selectedType === "all" || report.type.toLowerCase() === selectedType.toLowerCase();
    return matchesPeriod && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'vendas':
        return 'bg-green-500/20 text-green-200';
      case 'alunos':
        return 'bg-blue-500/20 text-blue-200';
      case 'cursos':
        return 'bg-purple-500/20 text-purple-200';
      case 'certificados':
        return 'bg-orange-500/20 text-orange-200';
      case 'financeiro':
        return 'bg-yellow-500/20 text-yellow-200';
      default:
        return 'bg-gray-500/20 text-gray-200';
    }
  };

  const getPeriodColor = (period: string) => {
    switch (period.toLowerCase()) {
      case 'semanal':
        return 'bg-blue-500/20 text-blue-200 border-blue-500/50';
      case 'mensal':
        return 'bg-green-500/20 text-green-200 border-green-500/50';
      case 'trimestral':
        return 'bg-orange-500/20 text-orange-200 border-orange-500/50';
      case 'anual':
        return 'bg-purple-500/20 text-purple-200 border-purple-500/50';
      default:
        return 'bg-gray-500/20 text-gray-200 border-gray-500/50';
    }
  };

  const totalReports = mockReports.length;
  const availableReports = mockReports.filter(r => r.status === "Disponível").length;
  const totalDownloads = mockReports.reduce((acc, report) => acc + report.downloads, 0);

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
                <FileText className="w-8 h-8" />
                Relatórios
              </h1>
              <p className="text-blue-300 mt-1">
                Visualize e gere relatórios da plataforma
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalReports}</div>
                  <div className="text-blue-200 text-sm">Total de Relatórios</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalDownloads}</div>
                  <div className="text-blue-200 text-sm">Downloads Totais</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{availableReports}</div>
                  <div className="text-blue-200 text-sm">Disponíveis</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-blue-200">Filtrar Relatórios</CardTitle>
            <CardDescription className="text-blue-300">
              Selecione o tipo e período dos relatórios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-white/15 border border-white/40 text-black rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
              >
                <option value="all">Todos os Tipos</option>
                <option value="vendas">Vendas</option>
                <option value="alunos">Alunos</option>
                <option value="cursos">Cursos</option>
                <option value="certificados">Certificados</option>
                <option value="financeiro">Financeiro</option>
              </select>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-white/15 border border-white/40 text-black rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
              >
                <option value="all">Todos os Períodos</option>
                <option value="semanal">Semanal</option>
                <option value="mensal">Mensal</option>
                <option value="trimestral">Trimestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Relatórios */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-blue-200">Relatórios Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <Card key={report.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{report.title}</CardTitle>
                        <CardDescription className="text-blue-300 text-sm">{report.description}</CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="bg-green-500/20 text-green-200 border-green-500/50"
                    >
                      {report.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Tipo:</span>
                      <Badge className={getTypeColor(report.type)}>
                        {report.type}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Período:</span>
                      <Badge 
                        variant="outline" 
                        className={getPeriodColor(report.period)}
                      >
                        {report.period}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Última Geração:</span>
                      <span className="text-white font-medium">
                        {new Date(report.lastGenerated).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Downloads:</span>
                      <span className="text-white font-medium">{report.downloads}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Baixar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
                      >
                        <Calendar className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Relatórios Rápidos */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-blue-200">Relatórios Rápidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Vendas Hoje</h3>
                <p className="text-blue-200 text-sm mb-4">R$ 2.450,00</p>
                <Button size="sm" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Novos Alunos</h3>
                <p className="text-blue-200 text-sm mb-4">+12 esta semana</p>
                <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Cursos Populares</h3>
                <p className="text-blue-200 text-sm mb-4">Top 5 cursos</p>
                <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Certificados</h3>
                <p className="text-blue-200 text-sm mb-4">45 emitidos hoje</p>
                <Button size="sm" className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700">
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
