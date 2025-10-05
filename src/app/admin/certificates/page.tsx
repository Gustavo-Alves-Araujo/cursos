'use client';

import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogoutButton } from "@/components/LogoutButton";
import { CertificateTemplateForm } from "@/components/admin/CertificateTemplateForm";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Award, Plus, Edit, Trash2, Download, Users, CheckCircle, XCircle, Clock, Settings, FileText } from "lucide-react";
import { CertificateService } from "@/lib/certificateService";
import { CertificateTemplate } from "@/types/certificate";

// Mock data para certificados
const mockCertificates = [
  {
    id: "cert-1",
    title: "Certificado de Conclusão: Desenvolvimento Web Fullstack",
    courseName: "Desenvolvimento Web Fullstack",
    studentName: "Ana Souza",
    studentEmail: "ana@example.com",
    issueDate: "2024-03-15",
    expiryDate: "2025-03-15",
    code: "WEBFS-2024-001",
    status: "Emitido",
    type: "Conclusão",
    template: "Padrão"
  },
  {
    id: "cert-2",
    title: "Certificado de Participação: Workshop de React",
    courseName: "Workshop de React",
    studentName: "Carlos Silva",
    studentEmail: "carlos@example.com",
    issueDate: "2024-01-10",
    expiryDate: null,
    code: "REACT-2024-002",
    status: "Emitido",
    type: "Participação",
    template: "Workshop"
  },
  {
    id: "cert-3",
    title: "Certificado de Conclusão: Marketing Digital Essencial",
    courseName: "Marketing Digital Essencial",
    studentName: "Maria Santos",
    studentEmail: "maria@example.com",
    issueDate: "2023-11-20",
    expiryDate: "2024-11-20",
    code: "MKTDE-2023-005",
    status: "Emitido",
    type: "Conclusão",
    template: "Padrão"
  },
  {
    id: "cert-4",
    title: "Certificado de Conclusão: Data Science com Python",
    courseName: "Data Science com Python",
    studentName: "João Oliveira",
    studentEmail: "joao@example.com",
    issueDate: null,
    expiryDate: null,
    code: "DSPYT-2024-003",
    status: "Pendente",
    type: "Conclusão",
    template: "Padrão"
  },
  {
    id: "cert-5",
    title: "Certificado de Participação: Workshop de TypeScript",
    courseName: "Workshop de TypeScript",
    studentName: "Pedro Costa",
    studentEmail: "pedro@example.com",
    issueDate: "2024-02-28",
    expiryDate: null,
    code: "TS-2024-004",
    status: "Emitido",
    type: "Participação",
    template: "Workshop"
  }
];

export default function AdminCertificatesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [certificates, setCertificates] = useState(mockCertificates);
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState<'certificates' | 'templates'>('certificates');
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);

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

  // Carregar templates quando a aba de templates for ativada
  useEffect(() => {
    if (activeTab === 'templates' && user?.role === 'admin') {
      loadTemplates();
    }
  }, [activeTab, user]);

  const loadTemplates = async () => {
    try {
      // Aqui você implementaria a busca de templates do banco
      // Por enquanto, usando dados mock
      setTemplates([]);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const handleTemplateSuccess = (template: CertificateTemplate) => {
    setTemplates(prev => [...prev, template]);
    setIsTemplateDialogOpen(false);
    setSelectedTemplate(null);
  };

  const openTemplateDialog = (template?: CertificateTemplate) => {
    setSelectedTemplate(template || null);
    setIsTemplateDialogOpen(true);
  };

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

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || cert.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const selectedCertificateData = selectedCertificate ? certificates.find(c => c.id === selectedCertificate) : null;

  const handleDeleteCertificate = (certId: string) => {
    setCertificates(prev => prev.filter(cert => cert.id !== certId));
  };

  const handleIssueCertificate = (certId: string) => {
    setCertificates(prev => prev.map(cert => 
      cert.id === certId 
        ? { ...cert, status: "Emitido", issueDate: new Date().toISOString().split('T')[0] }
        : cert
    ));
  };

  const handleRevokeCertificate = (certId: string) => {
    setCertificates(prev => prev.map(cert => 
      cert.id === certId 
        ? { ...cert, status: "Revogado" }
        : cert
    ));
  };

  const openEditDialog = (certId: string) => {
    setSelectedCertificate(certId);
    setIsEditDialogOpen(true);
  };

  const openCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'emitido':
        return 'bg-green-500/20 text-green-200 border-green-500/50';
      case 'pendente':
        return 'bg-orange-500/20 text-orange-200 border-orange-500/50';
      case 'revogado':
        return 'bg-red-500/20 text-red-200 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-200 border-gray-500/50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'conclusão':
        return 'bg-blue-500/20 text-blue-200';
      case 'participação':
        return 'bg-purple-500/20 text-purple-200';
      default:
        return 'bg-gray-500/20 text-gray-200';
    }
  };

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
                <Award className="w-8 h-8" />
                Gestão de Certificados
              </h1>
              <p className="text-blue-300 mt-1">
                Gerencie todos os certificados da plataforma
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {activeTab === 'certificates' && (
              <Button 
                onClick={openCreateDialog}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Certificado
              </Button>
            )}
            {activeTab === 'templates' && (
              <Button 
                onClick={() => openTemplateDialog()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Template
              </Button>
            )}
            <LogoutButton />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
          <button
            onClick={() => setActiveTab('certificates')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === 'certificates'
                ? 'bg-white/20 text-white'
                : 'text-blue-200 hover:bg-white/10'
            }`}
          >
            <Award className="w-4 h-4" />
            Certificados
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === 'templates'
                ? 'bg-white/20 text-white'
                : 'text-blue-200 hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            Templates
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{certificates.length}</div>
                  <div className="text-blue-200 text-sm">Total de Certificados</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {certificates.filter(c => c.status === "Emitido").length}
                  </div>
                  <div className="text-blue-200 text-sm">Emitidos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {certificates.filter(c => c.status === "Pendente").length}
                  </div>
                  <div className="text-blue-200 text-sm">Pendentes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">156</div>
                  <div className="text-blue-200 text-sm">Este Mês</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Busca e Filtros */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-blue-200">Buscar Certificados</CardTitle>
            <CardDescription className="text-blue-300">
              Encontre certificados por título, aluno ou código
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                <Input
                  placeholder="Buscar por título, aluno ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/15 border border-white/40 text-black rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
              >
                <option value="all">Todos os Status</option>
                <option value="emitido">Emitidos</option>
                <option value="pendente">Pendentes</option>
                <option value="revogado">Revogados</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo baseado na aba ativa */}
        {activeTab === 'certificates' ? (
          <>
            {/* Lista de Certificados */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-blue-200">Todos os Certificados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCertificates.map((cert) => (
              <Card key={cert.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{cert.title}</CardTitle>
                        <CardDescription className="text-blue-300 text-sm">{cert.courseName}</CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(cert.status)}
                    >
                      {cert.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Aluno:</span>
                      <span className="text-white font-medium">{cert.studentName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Email:</span>
                      <span className="text-blue-300 text-sm">{cert.studentEmail}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Código:</span>
                      <span className="text-white font-medium">{cert.code}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Tipo:</span>
                      <Badge className={getTypeColor(cert.type)}>
                        {cert.type}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Data:</span>
                      <span className="text-white font-medium">
                        {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('pt-BR') : 'Pendente'}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        onClick={() => openEditDialog(cert.id)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      {cert.status === "Pendente" && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleIssueCertificate(cert.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      {cert.status === "Emitido" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
                          onClick={() => handleRevokeCertificate(cert.id)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-200"
                        onClick={() => handleDeleteCertificate(cert.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Lista de Templates */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-blue-200">Templates de Certificados</h2>
              {templates.length === 0 ? (
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-8 text-center">
                    <FileText className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-blue-200 mb-2">Nenhum template encontrado</h3>
                    <p className="text-blue-300 mb-4">
                      Crie seu primeiro template de certificado para começar a emitir certificados personalizados.
                    </p>
                    <Button 
                      onClick={() => openTemplateDialog()}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Template
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <Card key={template.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-white text-lg">Template de Certificado</CardTitle>
                              <CardDescription className="text-blue-300 text-sm">Curso ID: {template.courseId}</CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-blue-200 text-sm">Criado em:</span>
                            <span className="text-white font-medium">
                              {new Date(template.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                              onClick={() => openTemplateDialog(template)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-blue-200 text-xl">
                Editar Certificado - {selectedCertificateData?.title}
              </DialogTitle>
              <DialogDescription className="text-blue-300">
                Modifique as informações do certificado
              </DialogDescription>
            </DialogHeader>
            
            {selectedCertificateData && (
              <div className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-blue-200 text-sm font-medium">Título</label>
                    <Input 
                      defaultValue={selectedCertificateData.title}
                      className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                    />
                  </div>
                  <div>
                    <label className="text-blue-200 text-sm font-medium">Código</label>
                    <Input 
                      defaultValue={selectedCertificateData.code}
                      className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-blue-200 text-sm font-medium">Aluno</label>
                    <Input 
                      defaultValue={selectedCertificateData.studentName}
                      className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                    />
                  </div>
                  <div>
                    <label className="text-blue-200 text-sm font-medium">Email</label>
                    <Input 
                      defaultValue={selectedCertificateData.studentEmail}
                      className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-blue-200 text-sm font-medium">Tipo</label>
                    <select 
                      defaultValue={selectedCertificateData.type}
                      className="w-full bg-white/15 border border-white/40 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                    >
                      <option value="Conclusão">Conclusão</option>
                      <option value="Participação">Participação</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-blue-200 text-sm font-medium">Status</label>
                    <select 
                      defaultValue={selectedCertificateData.status}
                      className="w-full bg-white/15 border border-white/40 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Emitido">Emitido</option>
                      <option value="Revogado">Revogado</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-blue-200 text-sm font-medium">Data de Emissão</label>
                    <Input 
                      type="date"
                      defaultValue={selectedCertificateData.issueDate || ''}
                      className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                    />
                  </div>
                  <div>
                    <label className="text-blue-200 text-sm font-medium">Data de Expiração</label>
                    <Input 
                      type="date"
                      defaultValue={selectedCertificateData.expiryDate || ''}
                      className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Criação */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-blue-200 text-xl">
                Criar Novo Certificado
              </DialogTitle>
              <DialogDescription className="text-blue-300">
                Adicione um novo certificado à plataforma
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-blue-200 text-sm font-medium">Título</label>
                  <Input 
                    placeholder="Nome do certificado"
                    className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>
                <div>
                  <label className="text-blue-200 text-sm font-medium">Código</label>
                  <Input 
                    placeholder="Código único"
                    className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-blue-200 text-sm font-medium">Aluno</label>
                  <Input 
                    placeholder="Nome do aluno"
                    className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>
                <div>
                  <label className="text-blue-200 text-sm font-medium">Email</label>
                  <Input 
                    placeholder="Email do aluno"
                    className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-blue-200 text-sm font-medium">Tipo</label>
                  <select 
                    className="w-full bg-white/15 border border-white/40 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  >
                    <option value="Conclusão">Conclusão</option>
                    <option value="Participação">Participação</option>
                  </select>
                </div>
                <div>
                  <label className="text-blue-200 text-sm font-medium">Status</label>
                  <select 
                    className="w-full bg-white/15 border border-white/40 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Emitido">Emitido</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-blue-200 text-sm font-medium">Data de Emissão</label>
                  <Input 
                    type="date"
                    className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>
                <div>
                  <label className="text-blue-200 text-sm font-medium">Data de Expiração</label>
                  <Input 
                    type="date"
                    className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Criar Certificado
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Template */}
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogContent className="max-w-4xl bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-blue-200 text-xl">
                {selectedTemplate ? 'Editar Template' : 'Criar Template de Certificado'}
              </DialogTitle>
              <DialogDescription className="text-blue-300">
                {selectedTemplate 
                  ? 'Modifique as configurações do template de certificado'
                  : 'Configure um novo template de certificado para um curso'
                }
              </DialogDescription>
            </DialogHeader>
            
            <CertificateTemplateForm
              courseId="mock-course-id" // Em produção, você passaria o ID do curso selecionado
              existingTemplate={selectedTemplate || undefined}
              onSuccess={handleTemplateSuccess}
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
