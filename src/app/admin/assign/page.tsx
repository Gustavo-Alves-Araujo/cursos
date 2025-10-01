'use client';

import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Users, BookOpen, CheckCircle, XCircle, Plus, Minus } from "lucide-react";
import { mockStudents, mockCourses } from "@/mocks/data";

export default function AdminAssignPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [students] = useState(mockStudents);
  const [courses] = useState(mockCourses);

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

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedStudentData = selectedStudent ? students.find(s => s.id === selectedStudent) : null;

  const handleAssignCourse = (courseId: string) => {
    // Lógica para atribuir curso
    console.log(`Atribuindo curso ${courseId} para aluno ${selectedStudent}`);
  };

  const handleRemoveCourse = (courseId: string) => {
    // Lógica para remover curso
    console.log(`Removendo curso ${courseId} do aluno ${selectedStudent}`);
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
                Atribuir Cursos
              </h1>
              <p className="text-blue-300 mt-1">
                Gerencie quais cursos cada aluno pode acessar
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Seleção de Aluno */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-blue-200">Selecionar Aluno</CardTitle>
              <CardDescription className="text-blue-300">
                Escolha um aluno para gerenciar seus cursos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                  <Input
                    placeholder="Buscar aluno..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedStudent === student.id
                          ? 'bg-blue-600/20 border border-blue-500/50'
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                      onClick={() => setSelectedStudent(student.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{student.name}</p>
                          <p className="text-blue-300 text-sm">{student.email}</p>
                        </div>
                        <Badge className="bg-green-500/20 text-green-200">
                          {student.ownedCourseIds.length} cursos
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gerenciamento de Cursos */}
          {selectedStudentData && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-blue-200">Cursos de {selectedStudentData.name}</CardTitle>
                <CardDescription className="text-blue-300">
                  Gerencie os cursos disponíveis para este aluno
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-200">{selectedStudentData.ownedCourseIds.length}</div>
                      <div className="text-blue-300 text-sm">Cursos Possuídos</div>
                    </div>
                    <div className="text-center p-3 bg-orange-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-200">{selectedStudentData.availableCourseIds.length}</div>
                      <div className="text-orange-300 text-sm">Cursos Disponíveis</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-blue-200 font-medium">Cursos Possuídos</h4>
                    <div className="space-y-2">
                      {selectedStudentData.ownedCourseIds.map((courseId) => {
                        const course = courses.find(c => c.id === courseId);
                        if (!course) return null;
                        return (
                          <div key={courseId} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <div>
                                <p className="text-white font-medium">{course.title}</p>
                                <p className="text-blue-300 text-sm">{course.shortDesc}</p>
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

                    <h4 className="text-blue-200 font-medium mt-6">Cursos Disponíveis</h4>
                    <div className="space-y-2">
                      {selectedStudentData.availableCourseIds.map((courseId) => {
                        const course = courses.find(c => c.id === courseId);
                        if (!course) return null;
                        return (
                          <div key={courseId} className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
                            <div className="flex items-center gap-3">
                              <XCircle className="w-4 h-4 text-orange-400" />
                              <div>
                                <p className="text-white font-medium">{course.title}</p>
                                <p className="text-blue-300 text-sm">{course.shortDesc}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleAssignCourse(courseId)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Instruções */}
        {!selectedStudent && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="text-center">
                <BookOpen className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-200 mb-2">Selecione um Aluno</h3>
                <p className="text-blue-300">
                  Escolha um aluno na lista ao lado para gerenciar seus cursos e permissões.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}