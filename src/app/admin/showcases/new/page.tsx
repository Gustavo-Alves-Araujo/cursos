'use client';

import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useShowcases } from "@/hooks/useShowcases";

export default function NewShowcasePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { createShowcase } = useShowcases();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Por favor, insira um nome para a vitrine');
      return;
    }

    setIsSaving(true);
    const { data, error } = await createShowcase(name, description || undefined);

    if (error) {
      alert('Erro ao criar vitrine');
      console.error(error);
      setIsSaving(false);
      return;
    }

    if (data) {
      router.push(`/admin/showcases/${data.id}`);
    }
  };

  if (authLoading) {
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/showcases')}
              className="text-blue-300 hover:text-white hover:bg-white/10 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-white mb-2">Nova Vitrine</h1>
            <p className="text-blue-200">
              Crie uma nova vitrine para organizar seus cursos
            </p>
          </div>

          {/* Formulário */}
          <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Nome da Vitrine *
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Cursos de Marketing Digital"
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Descrição (opcional)
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o objetivo desta vitrine..."
                  rows={4}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/showcases')}
                  disabled={isSaving}
                  className="border-white/20 text-blue-300 hover:bg-white/10"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? (
                    'Salvando...'
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Criar Vitrine
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-200 text-sm">
              <strong>💡 Dica:</strong> Após criar a vitrine, você poderá adicionar cursos a ela na página de edição.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

