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
import { ArrowLeft, Search, Users, BookOpen, Award, Settings, Eye, Trash2, Plus, Minus, CheckCircle, XCircle, UserPlus, Upload } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/auth";
import { CreateStudentForm } from "@/components/admin/CreateStudentForm";
import { ImportStudentsDialog } from "@/components/admin/ImportStudentsDialog";

type StudentWithEnrollments = User & {
  enrollments: string[]; // course IDs
};

export default function AdminStudentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { courses, isLoading: coursesLoading } = useCourses();
  const [searchTerm, setSearchTerm] = useState("");
  const [courseSearchTerm, setCourseSearchTerm] = useState("");
  const [students, setStudents] = useState<StudentWithEnrollments[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false); // Começar como false para evitar loading desnecessário
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isCreateStudentDialogOpen, setIsCreateStudentDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Buscar alunos e suas matrículas
  const fetchStudents = useCallback(async () => {
    try {
      console.log('🔍 fetchStudents - iniciando busca de alunos');
      setStudentsLoading(true);
      
      // Primeiro, vamos ver TODOS os usuários do auth.users
      const { data: allAuthUsers, error: authError } = await supabase.auth.admin.listUsers();
      console.log('📊 Total de usuários no auth.users:', allAuthUsers?.users?.length || 0);
      
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
        .order('created_at', { ascending: false });

      console.log('📦 fetchStudents - usuários com role=student encontrados:', usersData?.length || 0);
      console.log('📦 Dados:', usersData);
      
      if (usersError) {
        console.error('❌ fetchStudents - erro ao buscar usuários:', usersError);
        throw usersError;
      }

      // Verificar se há usuários na tabela users sem role definida
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('id, email, role')
        .order('created_at', { ascending: false });
      
      console.log('📊 Total de usuários na tabela users:', allUsers?.length || 0);
      console.log('📊 Usuários sem role student:', allUsers?.filter(u => u.role !== 'student').length || 0);

      // Combinar dados - agora os enrollments já vêm com o usuário
      const studentsWithEnrollments: StudentWithEnrollments[] = (usersData || []).map(user => ({
        ...user,
        enrollments: (user.course_enrollments || []).map((e: { course_id: string }) => e.course_id)
      }));

      console.log('✅ fetchStudents - alunos combinados:', studentsWithEnrollments.length);
      setStudents(studentsWithEnrollments);
    } catch (error) {
      console.error('❌ Erro ao buscar alunos:', error);
      // Em caso de erro, definir lista vazia para não ficar carregando
      setStudents([]);
    } finally {
      console.log('🏁 fetchStudents - finalizando');
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
          course_id: courseId,
          enrolled_at: new Date().toISOString() // Data de matrícula
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

  const handleDeleteStudent = async (studentId: string, studentName: string, studentEmail: string) => {
    // Confirmação
    const confirmed = window.confirm(
      `⚠️ ATENÇÃO!\n\nDeseja realmente deletar o aluno:\n\n` +
      `Nome: ${studentName}\n` +
      `Email: ${studentEmail}\n\n` +
      `Esta ação irá:\n` +
      `- Remover o usuário da autenticação\n` +
      `- Remover todos os dados da tabela users\n` +
      `- Remover todas as matrículas\n\n` +
      `ESTA AÇÃO NÃO PODE SER DESFEITA!`
    );

    if (!confirmed) return;

    try {
      console.log('🗑️ Deletando aluno:', studentId, studentEmail);

      // Chamar API para deletar
      const response = await fetch('/api/admin/delete-student', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: studentId })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao deletar aluno');
      }

      console.log('✅ Aluno deletado com sucesso');

      // Atualizar lista local
      setStudents(prev => prev.filter(student => student.id !== studentId));

      alert('✅ Aluno deletado com sucesso!');

    } catch (error) {
      console.error('❌ Erro ao deletar aluno:', error);
      alert('Erro ao deletar aluno: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  const openConfigDialog = (studentId: string) => {
    setSelectedStudent(studentId);
    setIsConfigDialogOpen(true);
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
                <Users className="w-8 h-8" />
                Gestão de Alunos
              </h1>
              <p className="text-blue-300 mt-1">
                Gerencie alunos e suas atribuições de cursos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar Alunos
            </Button>
            <Button 
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              onClick={() => setIsCreateStudentDialogOpen(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar Aluno
            </Button>
            <LogoutButton />
          </div>
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
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-200 hover:text-red-100"
                              onClick={() => handleDeleteStudent(student.id, student.name, student.email)}
                            >
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

        {/* Dialog de Configuração - Melhorado */}
        <Dialog open={isConfigDialogOpen} onOpenChange={(open) => {
          setIsConfigDialogOpen(open);
          if (!open) {
            setCourseSearchTerm('');
            fetchStudents();
          }
        }}>
          <DialogContent className="min-w-full max-h-[90vh] bg-white/10 backdrop-blur-sm border-white/20 text-white overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-blue-200 text-2xl">
                Gerenciar Cursos - {selectedStudentData?.name}
              </DialogTitle>
              <DialogDescription className="text-blue-300">
                Atribua ou remova cursos para este aluno
              </DialogDescription>
            </DialogHeader>
            
            {selectedStudentData && (
              <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)] pr-2">
                {/* Campo de Busca */}
                <div className="sticky top-0 bg-gradient-to-b from-gray-900 to-gray-900/95 backdrop-blur-sm pb-4 z-10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                    <Input
                      placeholder="Buscar cursos..."
                      value={courseSearchTerm}
                      onChange={(e) => setCourseSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 border-white/30 text-white placeholder:text-blue-300 focus:border-blue-400 focus:ring-blue-400/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Cursos Matriculados */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Cursos Matriculados
                      </h3>
                      <span className="text-sm text-green-300 bg-green-500/20 px-3 py-1 rounded-full">
                        {selectedStudentData.enrollments.filter(courseId => {
                          const course = courses.find(c => c.id === courseId);
                          return course && course.title.toLowerCase().includes(courseSearchTerm.toLowerCase());
                        }).length}
                      </span>
                    </div>
                    
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {selectedStudentData.enrollments.length === 0 ? (
                        <div className="text-center py-8 bg-white/5 rounded-lg border border-white/10">
                          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-400">Nenhum curso matriculado</p>
                        </div>
                      ) : (
                        selectedStudentData.enrollments
                          .map(courseId => courses.find(c => c.id === courseId))
                          .filter(course => course && course.title.toLowerCase().includes(courseSearchTerm.toLowerCase()))
                          .map((course) => {
                            if (!course) return null;
                            return (
                              <div key={course.id} className="group p-4 bg-green-500/10 hover:bg-green-500/20 rounded-lg border border-green-500/30 hover:border-green-500/50 transition-all">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                      <h4 className="text-white font-semibold truncate">{course.title}</h4>
                                    </div>
                                    <p className="text-blue-200 text-sm line-clamp-2 mb-2">{course.shortDescription}</p>
                                    <div className="flex items-center gap-3 text-xs text-blue-300">
                                      <span className="flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" />
                                        {course.modules?.length || 0} módulos
                                      </span>
                                      {course.isPublished && (
                                        <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded">
                                          Publicado
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-200 hover:text-red-100 flex-shrink-0"
                                    onClick={() => handleRemoveCourse(course.id)}
                                  >
                                    <Minus className="w-4 h-4 mr-1" />
                                    Remover
                                  </Button>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>

                  {/* Cursos Disponíveis */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Cursos Disponíveis
                      </h3>
                      <span className="text-sm text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full">
                        {courses.filter(c => {
                          const notEnrolled = !selectedStudentData.enrollments.includes(c.id);
                          const matchesSearch = c.title.toLowerCase().includes(courseSearchTerm.toLowerCase());
                          return notEnrolled && matchesSearch;
                        }).length}
                      </span>
                    </div>
                    
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {courses
                        .filter(course => {
                          const notEnrolled = !selectedStudentData.enrollments.includes(course.id);
                          const matchesSearch = course.title.toLowerCase().includes(courseSearchTerm.toLowerCase());
                          return notEnrolled && matchesSearch;
                        })
                        .length === 0 ? (
                          <div className="text-center py-8 bg-white/5 rounded-lg border border-white/10">
                            <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-400">
                              {courseSearchTerm ? 'Nenhum curso encontrado' : 'Todos os cursos já foram atribuídos'}
                            </p>
                          </div>
                        ) : (
                          courses
                            .filter(course => {
                              const notEnrolled = !selectedStudentData.enrollments.includes(course.id);
                              const matchesSearch = course.title.toLowerCase().includes(courseSearchTerm.toLowerCase());
                              return notEnrolled && matchesSearch;
                            })
                            .map((course) => (
                              <div key={course.id} className="group p-4 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-blue-500/30 hover:border-blue-500/50 transition-all">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <BookOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                      <h4 className="text-white font-semibold truncate">{course.title}</h4>
                                    </div>
                                    <p className="text-blue-200 text-sm line-clamp-2 mb-2">{course.shortDescription}</p>
                                    <div className="flex items-center gap-3 text-xs text-blue-300">
                                      <span className="flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" />
                                        {course.modules?.length || 0} módulos
                                      </span>
                                      {course.isPublished ? (
                                        <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded">
                                          Publicado
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 bg-gray-500/20 text-gray-300 rounded">
                                          Rascunho
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0"
                                    onClick={() => handleAssignCourse(course.id)}
                                  >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Adicionar
                                  </Button>
                                </div>
                              </div>
                            ))
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-white/20 mt-4">
              <Button 
                variant="outline" 
                className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
                onClick={() => {
                  setIsConfigDialogOpen(false);
                  setCourseSearchTerm('');
                  fetchStudents();
                }}
              >
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Criação de Aluno */}
        <CreateStudentForm
          isOpen={isCreateStudentDialogOpen}
          onClose={() => setIsCreateStudentDialogOpen(false)}
          onSuccess={() => {
            setIsCreateStudentDialogOpen(false);
            window.location.reload(); // Recarregar a página
          }}
        />

        {/* Dialog de Importação de Alunos */}
        <ImportStudentsDialog
          isOpen={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
          onSuccess={() => {
            fetchStudents(); // Recarregar lista de alunos
          }}
        />
      </main>
    </div>
  );
}