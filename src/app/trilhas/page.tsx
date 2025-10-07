'use client';

import { Sidebar } from "@/components/Sidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Target, Clock, Award, CheckCircle, Play } from "lucide-react";

export default function TrilhasPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const trilhas = [
    {
      id: "trilha-1",
      nome: "Desenvolvimento Frontend",
      descricao: "Aprenda as tecnologias essenciais para desenvolvimento web moderno",
      cursos: 8,
      duracao: "40 horas",
      progresso: 75,
      status: "em-andamento",
      cor: "from-blue-500 to-indigo-500"
    },
    {
      id: "trilha-2", 
      nome: "Marketing Digital",
      descricao: "Domine as estratégias de marketing online e redes sociais",
      cursos: 6,
      duracao: "30 horas",
      progresso: 45,
      status: "em-andamento",
      cor: "from-green-500 to-emerald-500"
    },
    {
      id: "trilha-3",
      nome: "Data Science",
      descricao: "Análise de dados e machine learning do zero",
      cursos: 10,
      duracao: "60 horas", 
      progresso: 0,
      status: "nao-iniciada",
      cor: "from-purple-500 to-pink-500"
    },
    {
      id: "trilha-4",
      nome: "UX/UI Design",
      descricao: "Design centrado no usuário e interfaces modernas",
      cursos: 5,
      duracao: "25 horas",
      progresso: 100,
      status: "concluida",
      cor: "from-orange-500 to-yellow-500"
    }
  ];
  
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'em-andamento':
        return <Play className="w-5 h-5 text-blue-400" />;
      default:
        return <Target className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'Concluída';
      case 'em-andamento':
        return 'Em Andamento';
      default:
        return 'Não Iniciada';
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
                <Target className="w-8 h-8" />
                Trilhas de Aprendizado
              </h1>
              <p className="text-blue-300 mt-1">
                Caminhos estruturados para seu desenvolvimento
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{trilhas.length}</div>
                <div className="text-blue-200 text-sm">Trilhas Disponíveis</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">1</div>
                <div className="text-blue-200 text-sm">Concluídas</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">2</div>
                <div className="text-blue-200 text-sm">Em Andamento</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">155h</div>
                <div className="text-blue-200 text-sm">Tempo Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Trilhas */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-blue-200">Minhas Trilhas</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trilhas.map((trilha) => (
              <Card key={trilha.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${trilha.cor} rounded-full flex items-center justify-center`}>
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white">{trilha.nome}</CardTitle>
                        <CardDescription className="text-blue-200">
                          {trilha.cursos} cursos • {trilha.duracao}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(trilha.status)}
                      <span className="text-sm text-blue-200">{getStatusText(trilha.status)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-blue-200 text-sm">{trilha.descricao}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-200">Progresso</span>
                      <span className="text-white font-medium">{trilha.progresso}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className={`h-2 bg-gradient-to-r ${trilha.cor} rounded-full transition-all duration-300`}
                        style={{ width: `${trilha.progresso}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"
                      variant="outline"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Ver Cursos
                    </Button>
                    {trilha.status === 'nao-iniciada' && (
                      <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar
                      </Button>
                    )}
                    {trilha.status === 'em-andamento' && (
                      <Button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                        <Play className="w-4 h-4 mr-2" />
                        Continuar
                      </Button>
                    )}
                    {trilha.status === 'concluida' && (
                      <Button className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                        <Award className="w-4 h-4 mr-2" />
                        Certificado
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
