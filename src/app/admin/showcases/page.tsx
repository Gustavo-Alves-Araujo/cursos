'use client';

import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useShowcases } from "@/hooks/useShowcases";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Package } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminShowcasesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { showcases, isLoading, deleteShowcase, updateShowcase } = useShowcases();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showcaseToDelete, setShowcaseToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleDelete = async () => {
    if (!showcaseToDelete) return;

    setIsDeleting(true);
    const { error } = await deleteShowcase(showcaseToDelete);

    if (error) {
      alert('Erro ao deletar vitrine');
      console.error(error);
    }

    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setShowcaseToDelete(null);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await updateShowcase(id, { is_active: !currentStatus });

    if (error) {
      alert('Erro ao atualizar status da vitrine');
      console.error(error);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <AdminSidebar />
      <main className="p-4 sm:p-6 lg:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Gestão de Vitrines</h1>
                <p className="text-blue-200">
                  Organize coleções de cursos para recomendações personalizadas
                </p>
              </div>
              <Button
                onClick={() => router.push('/admin/showcases/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Vitrine
              </Button>
            </div>
          </div>

          {/* Lista de Vitrines */}
          {showcases.length === 0 ? (
            <Card className="p-12 text-center bg-white/10 backdrop-blur border-white/20">
              <Package className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Nenhuma vitrine criada
              </h2>
              <p className="text-blue-200 mb-6">
                Crie sua primeira vitrine para começar a organizar cursos
              </p>
              <Button
                onClick={() => router.push('/admin/showcases/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Vitrine
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {showcases.map((showcase) => (
                <Card
                  key={showcase.id}
                  className="p-6 bg-white/10 backdrop-blur border-white/20 hover:bg-white/15 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {showcase.name}
                        </h3>
                        {showcase.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-medium">
                            <Eye className="w-3 h-3" />
                            Ativa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-500/20 text-gray-300 text-xs font-medium">
                            <EyeOff className="w-3 h-3" />
                            Inativa
                          </span>
                        )}
                      </div>
                      {showcase.description && (
                        <p className="text-blue-200 mb-3">{showcase.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-blue-300">
                        <span>
                          {showcase.courses.length} curso{showcase.courses.length !== 1 ? 's' : ''}
                        </span>
                        <span>•</span>
                        <span>
                          Criada em {new Date(showcase.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(showcase.id, showcase.is_active)}
                        className="text-blue-300 hover:text-white hover:bg-white/10"
                      >
                        {showcase.is_active ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-1" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            Ativar
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/showcases/${showcase.id}`)}
                        className="text-blue-300 hover:text-white hover:bg-white/10"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowcaseToDelete(showcase.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-red-300 hover:text-red-100 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Deletar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Dialog de Confirmação de Deleção */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Confirmar Deleção</DialogTitle>
            <DialogDescription className="text-gray-300">
              Tem certeza que deseja deletar esta vitrine? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

