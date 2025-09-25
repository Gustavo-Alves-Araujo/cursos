'use client';

import { Sidebar } from "@/components/Sidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Award, Download, Eye, Calendar, CheckCircle } from "lucide-react";

export default function CertificadosPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [certificados, setCertificados] = useState([
    {
      id: "cert-1",
      curso: "Comece Aqui",
      dataEmissao: "15/01/2024",
      status: "emitido",
      codigo: "CERT-001-2024"
    },
    {
      id: "cert-2", 
      curso: "Materiais de Apoio",
      dataEmissao: "20/01/2024",
      status: "emitido",
      codigo: "CERT-002-2024"
    },
    {
      id: "cert-3",
      curso: "Suporte Exclusivo", 
      dataEmissao: "25/01/2024",
      status: "emitido",
      codigo: "CERT-003-2024"
    },
    {
      id: "cert-4",
      curso: "Domínio & Hospedagem",
      dataEmissao: "30/01/2024", 
      status: "emitido",
      codigo: "CERT-004-2024"
    },
    {
      id: "cert-5",
      curso: "Automação de Tarefas",
      dataEmissao: "05/02/2024",
      status: "emitido", 
      codigo: "CERT-005-2024"
    }
  ]);
  
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

  const handleEmitirCertificado = () => {
    // Simular emissão de certificado
    alert('Certificado emitido com sucesso!');
  };

  return (
    <div className="relative">
      <Sidebar />
      <main className="space-y-8 p-6">
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
                {certificados.length} certificados conquistados
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{certificados.length}</div>
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

        {/* Botão Emitir Certificado */}
        <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Emitir Novo Certificado</h2>
              <p className="text-blue-200">Gere um certificado para um curso concluído</p>
            </div>
            <Button 
              onClick={handleEmitirCertificado}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Award className="w-4 h-4 mr-2" />
              Emitir Certificado
            </Button>
          </div>
        </div>

        {/* Lista de Certificados */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-blue-200">Certificados Conquistados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificados.map((certificado) => (
              <Card key={certificado.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">{certificado.curso}</CardTitle>
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <CardDescription className="text-blue-200">
                    Código: {certificado.codigo}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-300 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Emitido em {certificado.dataEmissao}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/20 rounded-full h-2">
                      <div className="w-full h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                    </div>
                    <span className="text-green-400 text-sm font-medium">100%</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-white/10 hover:bg-white/20 border-white/20 text-blue-200">
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
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
