'use client';

import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogoutButton } from "@/components/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, BookOpen, Plus, Edit, Trash2, Settings, Users, Award, Star } from "lucide-react";
import { mockCourses } from "@/mocks/data";

export default function AdminCoursesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState(mockCourses);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.shortDesc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCourseData = selectedCourse ? courses.find(c => c.id === selectedCourse) : null;

  const handleDeleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
  };

  const handleToggleCourseStatus = (courseId: string) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { ...course, owned: !course.owned }
        : course
    ));
  };

  const openEditDialog = (courseId: string) => {
    setSelectedCourse(courseId);
    setIsEditDialogOpen(true);
  };

  const openCreateDialog = () => {
    setIsCreateDialogOpen(true);
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
                <BookOpen className="w-8 h-8" />
                Gestão de Cursos
              </h1>
              <p className="text-blue-300 mt-1">
                Gerencie todos os cursos da plataforma
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={openCreateDialog}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Curso
            </Button>
            <LogoutButton />
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{courses.length}</div>
                  <div className="text-blue-200 text-sm">Total de Cursos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {courses.filter(c => c.owned).length}
                  </div>
                  <div className="text-blue-200 text-sm">Cursos Ativos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">1,234</div>
                  <div className="text-blue-200 text-sm">Alunos Inscritos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">4.8</div>
                  <div className="text-blue-200 text-sm">Avaliação Média</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Busca e Filtros */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-blue-200">Buscar Cursos</CardTitle>
            <CardDescription className="text-blue-300">
              Encontre cursos por título ou descrição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
              <Input
                placeholder="Buscar por título ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Cursos */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-blue-200">Todos os Cursos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{course.title}</CardTitle>
                        <CardDescription className="text-blue-300 text-sm">{course.shortDesc}</CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={course.owned 
                        ? "bg-green-500/20 text-green-200 border-green-500/50" 
                        : "bg-gray-500/20 text-gray-200 border-gray-500/50"
                      }
                    >
                      {course.owned ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Alunos:</span>
                      <span className="text-white font-medium">234</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Avaliação:</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white font-medium">4.8</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        onClick={() => openEditDialog(course.id)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
                        onClick={() => handleToggleCourseStatus(course.id)}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-200"
                        onClick={() => handleDeleteCourse(course.id)}
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

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-blue-200 text-xl">
                Editar Curso - {selectedCourseData?.title}
              </DialogTitle>
              <DialogDescription className="text-blue-300">
                Modifique as informações do curso
              </DialogDescription>
            </DialogHeader>
            
            {selectedCourseData && (
              <div className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-blue-200 text-sm font-medium">Título</label>
                    <Input 
                      defaultValue={selectedCourseData.title}
                      className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-blue-200 text-sm font-medium">Descrição</label>
                  <textarea 
                    defaultValue={selectedCourseData.shortDesc}
                    className="w-full bg-white/15 border border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 rounded-md px-3 py-2 min-h-[100px] resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-blue-200 text-sm font-medium">Status</label>
                    <select 
                      defaultValue={selectedCourseData.owned ? "Ativo" : "Inativo"}
                      className="w-full bg-white/15 border border-white/40 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </select>
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
                Criar Novo Curso
              </DialogTitle>
              <DialogDescription className="text-blue-300">
                Adicione um novo curso à plataforma
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-blue-200 text-sm font-medium">Título</label>
                  <Input 
                    placeholder="Nome do curso"
                    className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>
                <div>
                  <label className="text-blue-200 text-sm font-medium">Duração</label>
                  <Input 
                    placeholder="Ex: 40 horas"
                    className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-blue-200 text-sm font-medium">Descrição</label>
                <textarea 
                  placeholder="Descrição breve do curso"
                  className="w-full bg-white/15 border border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 rounded-md px-3 py-2 min-h-[100px] resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-blue-200 text-sm font-medium">Nível</label>
                  <select 
                    className="w-full bg-white/15 border border-white/40 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  >
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                </div>
                <div>
                  <label className="text-blue-200 text-sm font-medium">Status</label>
                  <select 
                    className="w-full bg-white/15 border border-white/40 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
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
                Criar Curso
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
