'use client';

import { Sidebar } from "@/components/Sidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { mockStudents, mockCourses } from "@/mocks/data";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, BookOpen, Save, Eye } from "lucide-react";

export default function StudentCoursesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<{ id: string; name: string; email: string; ownedCourseIds: string[]; availableCourseIds: string[] } | null>(null);
  const allCourses = mockCourses;
  const [ownedCourses, setOwnedCourses] = useState<string[]>([]);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
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
    
    // Buscar aluno
    const foundStudent = mockStudents.find(s => s.id === id);
    if (foundStudent) {
      setStudent(foundStudent);
      setOwnedCourses(foundStudent.ownedCourseIds);
      setAvailableCourses(foundStudent.availableCourseIds);
    }
  }, [user, isLoading, id]); // Remove router from dependencies

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

  if (!student) {
    return (
      <div className="relative">
        <Sidebar />
        <main className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Aluno não encontrado</h1>
            <Button asChild>
              <Link href="/admin/students">Voltar para alunos</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const filteredCourses = allCourses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.shortDesc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleOwnedCourse = (courseId: string) => {
    setOwnedCourses(prev => {
      if (prev.includes(courseId)) {
        // Remover curso
        return prev.filter(id => id !== courseId);
      } else {
        // Adicionar curso
        return [...prev, courseId];
      }
    });
  };

  const handleToggleAvailableCourse = (courseId: string) => {
    setAvailableCourses(prev => {
      if (prev.includes(courseId)) {
        // Remover curso
        return prev.filter(id => id !== courseId);
      } else {
        // Adicionar curso
        return [...prev, courseId];
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSaving(false);
    alert('Configurações salvas com sucesso!');
  };

  const getCourseNames = (courseIds: string[]) => {
    return courseIds.map(id => {
      const course = mockCourses.find(c => c.id === id);
      return course ? course.title : 'Curso não encontrado';
    });
  };

  return (
    <div className="relative">
      <Sidebar />
      <main className="space-y-8 p-6 lg:ml-64">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20 text-blue-200">
              <Link href="/admin/students" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-blue-200 flex items-center gap-3">
                <BookOpen className="w-8 h-8" />
                Cursos de {student.name}
              </h1>
              <p className="text-blue-300 mt-1">{student.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Salvando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </div>
              )}
            </Button>
            <LogoutButton />
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{ownedCourses.length}</div>
                <div className="text-blue-200 text-sm">Cursos Possuídos</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{availableCourses.length}</div>
                <div className="text-blue-200 text-sm">Cursos Disponíveis</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{allCourses.length}</div>
                <div className="text-blue-200 text-sm">Total de Cursos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Busca */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-xl text-blue-200">Buscar Cursos</CardTitle>
            <CardDescription className="text-blue-300">
              Digite o nome ou descrição do curso para filtrar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
              <Input
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/30 text-white placeholder:text-blue-300 focus:border-blue-400 focus:ring-blue-400/50"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cursos Possuídos */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-green-200 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Cursos Possuídos
              </CardTitle>
              <CardDescription className="text-blue-300">
                Cursos que o aluno já possui acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={ownedCourses.includes(course.id)}
                      onCheckedChange={() => handleToggleOwnedCourse(course.id)}
                      className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                    <div>
                      <div className="text-white font-medium">{course.title}</div>
                      <div className="text-blue-200 text-sm">{course.shortDesc}</div>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      ownedCourses.includes(course.id)
                        ? 'bg-green-500/20 border-green-500/50 text-green-200'
                        : 'bg-white/10 border-white/20 text-blue-200'
                    }
                  >
                    {ownedCourses.includes(course.id) ? 'Possuído' : 'Não Possuído'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Cursos Disponíveis */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-blue-200 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Cursos Disponíveis
              </CardTitle>
              <CardDescription className="text-blue-300">
                Cursos que aparecem em &quot;Cursos que você ainda não tem&quot;
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={availableCourses.includes(course.id)}
                      onCheckedChange={() => handleToggleAvailableCourse(course.id)}
                      className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <div>
                      <div className="text-white font-medium">{course.title}</div>
                      <div className="text-blue-200 text-sm">{course.shortDesc}</div>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      availableCourses.includes(course.id)
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-200'
                        : 'bg-white/10 border-white/20 text-blue-200'
                    }
                  >
                    {availableCourses.includes(course.id) ? 'Disponível' : 'Não Disponível'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Resumo das Alterações */}
        <Card className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-xl text-blue-200">Resumo das Alterações</CardTitle>
            <CardDescription className="text-blue-300">
              Visualize as alterações antes de salvar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-green-200 font-semibold mb-2">Cursos Possuídos ({ownedCourses.length})</h4>
                <div className="space-y-1">
                  {getCourseNames(ownedCourses).map((courseName, index) => (
                    <div key={index} className="text-blue-200 text-sm">• {courseName}</div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-blue-200 font-semibold mb-2">Cursos Disponíveis ({availableCourses.length})</h4>
                <div className="space-y-1">
                  {getCourseNames(availableCourses).map((courseName, index) => (
                    <div key={index} className="text-blue-200 text-sm">• {courseName}</div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
