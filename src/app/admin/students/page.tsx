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
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Users, BookOpen, Award, Settings, Eye, Trash2, Plus, Minus, CheckCircle, XCircle } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/auth";

type StudentWithEnrollments = User & {
  enrollments: string[]; // course IDs
};

export default function AdminStudentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { courses, isLoading: coursesLoading } = useCourses();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<StudentWithEnrollments[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false); // Começar como false para evitar loading desnecessário
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  // Buscar alunos e suas matrículas
  const fetchStudents = useCallback(async () => {
    try {
      console.log('fetchStudents - iniciando busca de alunos');
      setStudentsLoading(true);
      
      // Buscar usuários e suas matrículas em uma única consulta otimizada
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          *,
          course_enrollments (
            course_id
          )
        `)
        .eq('role', 'student')
        .order('created_at', { ascending: false })
        .limit(100); // Limitar resultados para melhor performance

      console.log('fetchStudents - usuários encontrados:', usersData);
      if (usersError) {
        console.error('fetchStudents - erro ao buscar usuários:', usersError);
        throw usersError;
      }

      // Combinar dados - agora os enrollments já vêm com o usuário
      const studentsWithEnrollments: StudentWithEnrollments[] = (usersData || []).map(user => ({
        ...user,
        enrollments: (user.course_enrollments || []).map((e: { course_id: string }) => e.course_id)
      }));

      console.log('fetchStudents - alunos combinados:', studentsWithEnrollments);
      setStudents(studentsWithEnrollments);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      // Em caso de erro, definir lista vazia para não ficar carregando
      setStudents([]);
    } finally {
      console.log('fetchStudents - finalizando, setIsLoading(false)');
      setStudentsLoading(false);
    }
  }, []); // Empty dependency array

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

  useEffect(() => {
    if (user && user.role === 'admin') {
      console.log('AdminStudentsPage - iniciando busca de alunos');
      fetchStudents();
    }
  }, [user, fetchStudents]);

  if (isLoading || studentsLoading || coursesLoading) {
    return (
      <div className="relative">
        <AdminSidebar />
        <main className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-2">Carregando alunos...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedStudentData = selectedStudent ? students.find(s => s.id === selectedStudent) : null;

  const handleAssignCourse = async (courseId: string) => {
    if (!selectedStudent) return;
    
    try {
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: selectedStudent,
          course_id: courseId
        });

      if (error) throw error;

      // Atualizar estado local
      setStudents(prev => prev.map(student => 
        student.id === selectedStudent 
          ? { ...student, enrollments: [...student.enrollments, courseId] }
          : student
      ));
    } catch (error) {
      console.error('Erro ao atribuir curso:', error);
      alert('Erro ao atribuir curso');
    }
  };

  const handleRemoveCourse = async (courseId: string) => {
    if (!selectedStudent) return;
    
    try {
      const { error } = await supabase
        .from('course_enrollments')
        .delete()
        .eq('user_id', selectedStudent)
        .eq('course_id', courseId);

      if (error) throw error;

      // Atualizar estado local
      setStudents(prev => prev.map(student => 
        student.id === selectedStudent 
          ? { ...student, enrollments: student.enrollments.filter(id => id !== courseId) }
          : student
      ));
    } catch (error) {
      console.error('Erro ao remover curso:', error);
      alert('Erro ao remover curso');
    }
  };

  const openConfigDialog = (studentId: string) => {
    setSelectedStudent(studentId);
    setIsConfigDialogOpen(true);
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
                <Users className="w-8 h-8" />
                Gestão de Alunos
              </h1>
              <p className="text-blue-300 mt-1">
                Gerencie alunos e suas atribuições de cursos
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>

        {/* Estatísticas */}


        {/* Busca e Filtros */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-blue-200">Buscar Alunos</CardTitle>
            <CardDescription className="text-blue-300">
              Encontre alunos por nome ou email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Alunos */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-blue-200">Lista de Alunos</h2>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-blue-200 font-medium">Aluno</th>
                      <th className="text-left p-4 text-blue-200 font-medium">Email</th>
                      <th className="text-left p-4 text-blue-200 font-medium">Cursos Possuídos</th>
                      <th className="text-left p-4 text-blue-200 font-medium">Cursos Disponíveis</th>
                      <th className="text-left p-4 text-blue-200 font-medium">Status</th>
                      <th className="text-left p-4 text-blue-200 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{student.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-blue-300 text-sm">{student.email}</p>
                        </td>
                        <td className="p-4">
                          <Badge className="bg-blue-600/20 text-blue-200">
                            {student.enrollments.length} cursos
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className="bg-orange-600/20 text-orange-200">
                            {courses.length - student.enrollments.length} disponíveis
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="bg-green-500/20 text-green-200 border-green-500/50">
                            Ativo
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                              onClick={() => openConfigDialog(student.id)}
                            >
                              <Settings className="w-4 h-4 mr-1" />
                              Configurar
                            </Button>
                            <Button size="sm" variant="outline" className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-200">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialog de Configuração */}
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent className="max-w-4xl bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-blue-200 text-xl">
                Configurar Cursos - {selectedStudentData?.name}
              </DialogTitle>
              <DialogDescription className="text-blue-300">
                Gerencie quais cursos este aluno possui e quais aparecem como disponíveis
              </DialogDescription>
            </DialogHeader>
            
            {selectedStudentData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Cursos Possuídos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-200 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Cursos Matriculados ({selectedStudentData.enrollments.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedStudentData.enrollments.map((courseId) => {
                      const course = courses.find(c => c.id === courseId);
                      if (!course) return null;
                      return (
                        <div key={courseId} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <div>
                              <p className="text-white font-medium">{course.title}</p>
                              <p className="text-blue-300 text-sm">{course.shortDescription}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-200"
                            onClick={() => handleRemoveCourse(courseId)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cursos Disponíveis */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-200 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-orange-400" />
                    Cursos Disponíveis ({courses.filter(c => !selectedStudentData.enrollments.includes(c.id)).length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {courses
                      .filter(course => !selectedStudentData.enrollments.includes(course.id))
                      .map((course) => (
                        <div key={course.id} className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
                          <div className="flex items-center gap-3">
                            <XCircle className="w-4 h-4 text-orange-400" />
                            <div>
                              <p className="text-white font-medium">{course.title}</p>
                              <p className="text-blue-300 text-sm">{course.shortDescription}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleAssignCourse(course.id)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}


            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
                onClick={() => {
                  setIsConfigDialogOpen(false);
                  fetchStudents(); // Recarregar dados
                }}
              >
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}