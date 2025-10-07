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
import { ArrowLeft, Search, Award, Plus, Edit, Trash2, Users, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { CertificateTemplate, Certificate } from "@/types/certificate";
import { CertificateService } from "@/lib/certificateService";
import { useCourses } from "@/hooks/useCourses";
import { supabase } from "@/lib/supabase";


export default function AdminCertificatesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { courses } = useCourses();
  const [searchTerm, setSearchTerm] = useState("");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState<'certificates' | 'templates'>('certificates');
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [isLoadingCertificates, setIsLoadingCertificates] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  // Carregar certificados quando o usuário for admin
  useEffect(() => {
    if (user?.role === 'admin') {
      loadCertificates();
    }
  }, [user]);

  // Carregar templates quando a aba de templates for ativada
  useEffect(() => {
    if (activeTab === 'templates' && user?.role === 'admin') {
      loadTemplates();
    }
  }, [activeTab, user]);

  const loadCertificates = async () => {
    try {
      setIsLoadingCertificates(true);
      // Buscar certificados do banco de dados
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          courses:course_id (
            id,
            title
          ),
          users:user_id (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar certificados:', error);
        throw error;
      }

      // Transformar dados para o formato esperado
      const transformedCertificates: Certificate[] = data?.map(certificate => ({
        id: certificate.id,
        userId: certificate.user_id,
        courseId: certificate.course_id,
        templateId: certificate.template_id,
        studentName: certificate.student_name,
        completionDate: certificate.completion_date,
        certificateUrl: certificate.certificate_url,
        createdAt: certificate.created_at
      })) || [];

      setCertificates(transformedCertificates);
    } catch (error) {
      console.error('Erro ao carregar certificados:', error);
    } finally {
      setIsLoadingCertificates(false);
    }
  };

  const loadTemplates = async () => {
    try {
      setIsLoadingTemplates(true);
      // Buscar templates do banco de dados
      const { data, error } = await supabase
        .from('certificate_templates')
        .select(`
          *,
          courses:course_id (
            id,
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar templates:', error);
        throw error;
      }

      console.log('🔍 Templates encontrados no banco:', data);

      // Transformar dados para o formato esperado
      const transformedTemplates: CertificateTemplate[] = data?.map(template => ({
        id: template.id,
        courseId: template.course_id,
        backgroundImageUrl: template.background_image_url,
        textConfig: template.text_config,
        createdAt: template.created_at,
        updatedAt: template.updated_at
      })) || [];

      console.log('📋 Templates transformados:', transformedTemplates);
      setTemplates(transformedTemplates);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleTemplateSuccess = async (template: CertificateTemplate) => {
    // Recarregar templates do banco de dados
    await loadTemplates();
    setIsTemplateDialogOpen(false);
    setSelectedTemplate(null);
    setSelectedCourseId("");
  };

  const openTemplateDialog = (template?: CertificateTemplate) => {
    setSelectedTemplate(template || null);
    setSelectedCourseId(template?.courseId || "");
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
    const matchesSearch = cert.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const selectedCertificateData = selectedCertificate ? certificates.find(c => c.id === selectedCertificate) : null;

  const handleDeleteCertificate = async (certId: string) => {
    try {
      // Aqui você implementaria a exclusão do certificado no banco
      setCertificates(prev => prev.filter(cert => cert.id !== certId));
    } catch (error) {
      console.error('Erro ao excluir certificado:', error);
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplateToDelete(templateId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      await CertificateService.deleteTemplate(templateToDelete);
      // Recarregar templates do banco
      await loadTemplates();
      setIsDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      alert('Erro ao excluir template: ' + (error as Error).message);
    }
  };

  const openEditDialog = (certId: string) => {
    setSelectedCertificate(certId);
    // Aqui você pode implementar a visualização do certificado
  };

  return (
    <div className="relative">
      <AdminSidebar />
      <main className="space-y-8 p-6 lg:ml-64">
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
            {activeTab === 'templates' && (
              <Button 
                asChild
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Link href="/admin/certificates/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Template
                </Link>
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
                    {certificates.length}
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
                  <div className="text-2xl font-bold text-white">0</div>
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
                <option value="all">Todos</option>
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
              {isLoadingCertificates ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-blue-200">Carregando certificados...</p>
                </div>
              ) : filteredCertificates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-12 h-12 text-blue-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Nenhum certificado encontrado</h3>
                  <p className="text-blue-200">Os certificados aparecerão aqui quando forem emitidos.</p>
                </div>
              ) : (
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
                              <CardTitle className="text-white text-lg">Certificado</CardTitle>
                              <CardDescription className="text-blue-300 text-sm">
                                {courses.find(c => c.id === cert.courseId)?.title || `Curso ID: ${cert.courseId}`}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-blue-200 text-sm">Aluno:</span>
                            <span className="text-white font-medium">{cert.studentName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-blue-200 text-sm">Data:</span>
                            <span className="text-white font-medium">
                              {new Date(cert.completionDate).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                              onClick={() => openEditDialog(cert.id)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
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
              )}
            </div>
          </>
        ) : (
          <>
            {/* Lista de Templates */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-blue-200">Templates de Certificados</h2>
              {isLoadingTemplates ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-blue-200">Carregando templates...</p>
                </div>
              ) : templates.length === 0 ? (
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
                              <CardDescription className="text-blue-300 text-sm">
                                {courses.find(c => c.id === template.courseId)?.title || `Curso ID: ${template.courseId}`}
                              </CardDescription>
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
                              onClick={() => handleDeleteTemplate(template.id)}
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


        {/* Dialog de Edição de Template */}
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogContent className="max-w-4xl bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-blue-200 text-xl">
                Editar Template de Certificado
              </DialogTitle>
              <DialogDescription className="text-blue-300">
                Modifique as configurações do template de certificado
              </DialogDescription>
            </DialogHeader>
            
            {selectedTemplate && (
              <CertificateTemplateForm
                courseId={selectedTemplate.courseId}
                existingTemplate={selectedTemplate}
                onSuccess={handleTemplateSuccess}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-red-200 text-xl">
                Confirmar Exclusão
              </DialogTitle>
              <DialogDescription className="text-blue-300">
                Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={confirmDeleteTemplate}
              >
                Excluir Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
