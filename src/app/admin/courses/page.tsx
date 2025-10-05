'use client';

import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/LogoutButton";
import { useCourses } from "@/hooks/useCourses";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, BookOpen, Plus, Trash2, Settings, Users, Award, Star, Eye } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminCoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { courses, isLoading, deleteCourse, updateCourse } = useCourses();

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Tem certeza que deseja deletar este curso?')) {
      try {
        await deleteCourse(courseId);
      } catch (error) {
        console.error('Erro ao deletar curso:', error);
        alert('Erro ao deletar curso');
      }
    }
  };

  const handleToggleCourseStatus = async (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      try {
        await updateCourse(courseId, { isPublished: !course.isPublished });
      } catch (error) {
        console.error('Erro ao atualizar curso:', error);
        alert('Erro ao atualizar curso');
      }
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-2">Carregando cursos...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
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
              asChild
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Link href="/admin/courses/new">
                <Plus className="w-4 h-4 mr-2" />
                Novo Curso
              </Link>
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
                    {courses.filter(c => c.isPublished).length}
                  </div>
                  <div className="text-blue-200 text-sm">Cursos Publicados</div>
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
                        <CardDescription className="text-blue-300 text-sm">{course.shortDescription}</CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={course.isPublished 
                        ? "bg-green-500/20 text-green-200 border-green-500/50" 
                        : "bg-gray-500/20 text-gray-200 border-gray-500/50"
                      }
                    >
                      {course.isPublished ? "Publicado" : "Rascunho"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Módulos:</span>
                      <span className="text-white font-medium">{course.modules.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Aulas:</span>
                      <span className="text-white font-medium">{course.totalLessons}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Duração:</span>
                      <span className="text-white font-medium">{course.estimatedDuration}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        asChild
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <Link href={`/admin/courses/${course.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Link>
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
      </main>
    </div>
    </ProtectedRoute>
  );
}
