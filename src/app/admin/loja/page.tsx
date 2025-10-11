'use client';

import { AdminSidebar } from "@/components/AdminSidebar";
import { PasswordResetGuard } from "@/components/PasswordResetGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoutButton } from "@/components/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingCart, ExternalLink, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLojaPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [storeUrl, setStoreUrl] = useState("");
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
  }, [user, isLoading, router]);

  // Carregar URL da loja salva
  useEffect(() => {
    const loadStoreSettings = async () => {
      try {
        const response = await fetch('/api/store-settings');
        if (response.ok) {
          const data = await response.json();
          setStoreUrl(data.store_url || '');
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };

    loadStoreSettings();
  }, []);

  const handleSave = async () => {
    if (!user) {
      alert('Usuário não autenticado');
      return;
    }

    // Validar e formatar a URL
    let formattedUrl = storeUrl.trim();
    
    // Se não começar com http:// ou https://, adicionar https://
    if (formattedUrl && !formattedUrl.match(/^https?:\/\//)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Validar se é uma URL externa válida
    if (formattedUrl) {
      try {
        const url = new URL(formattedUrl);
        // Verificar se não é localhost ou domínio local
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname.endsWith('.local')) {
          alert('Por favor, insira uma URL externa válida (não localhost)');
          return;
        }
      } catch {
        alert('Por favor, insira uma URL válida');
        return;
      }
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/store-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          store_url: formattedUrl,
          userId: user.id 
        }),
      });

      if (response.ok) {
        alert('Configuração salva com sucesso!');
      } else {
        const errorData = await response.json();
        alert(`Erro ao salvar: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar configuração');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative">
        <AdminSidebar />
        <main className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-2">Carregando...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <PasswordResetGuard>
      <div className="relative">
        <AdminSidebar />
        <main className="space-y-8 p-6 lg:ml-64">
          {/* Header */}
          <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white transition-all duration-200">
                <Link href="/admin" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-blue-200 flex items-center gap-3">
                  <ShoppingCart className="w-8 h-8" />
                  Configurar Loja
                </h1>
                <p className="text-blue-300 mt-1">Configure o redirecionamento da loja para os alunos</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-blue-200">
                Olá, {user.name}
              </span>
              <LogoutButton />
            </div>
          </div>

          {/* Configuração da Loja */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-blue-200 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                URL da Loja Externa
              </CardTitle>
              <CardDescription className="text-blue-300">
                Configure o link para onde os alunos serão redirecionados quando clicarem em &quot;Loja&quot; na sidebar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="storeUrl" className="text-blue-200">
                  URL da Loja
                </Label>
                <Input
                  id="storeUrl"
                  type="text"
                  placeholder="youtube.com.br ou https://sua-loja.com.br"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder:text-blue-300 focus:border-blue-400 focus:ring-blue-400/50"
                />
                <p className="text-sm text-blue-300">
                  Exemplo: youtube.com.br, sua-loja.com.br ou https://loja.seudominio.com
                </p>
              </div>

              {storeUrl && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-200 mb-2">
                    <ExternalLink className="w-4 h-4" />
                    <span className="font-medium">Preview do Link:</span>
                  </div>
                  <a 
                    href={storeUrl.startsWith('http') ? storeUrl : `https://${storeUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-200 underline break-all"
                  >
                    {storeUrl.startsWith('http') ? storeUrl : `https://${storeUrl}`}
                  </a>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={handleSave}
                  disabled={!storeUrl || isSaving}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configuração
                    </>
                  )}
                </Button>
                
                {storeUrl && (
                  <Button
                    asChild
                    variant="outline"
                    className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
                  >
                    <a href={storeUrl.startsWith('http') ? storeUrl : `https://${storeUrl}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Testar Link
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-blue-200">
                Como Funciona
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-blue-300">
              <div className="space-y-2">
                <h4 className="font-medium text-blue-200">1. Configuração</h4>
                <p className="text-sm">
                  Digite a URL da sua loja externa no campo acima e clique em &quot;Salvar Configuração&quot;.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-blue-200">2. Redirecionamento</h4>
                <p className="text-sm">
                  Quando um aluno clicar em &quot;Loja&quot; na sidebar, ele será redirecionado para a URL configurada.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-blue-200">3. Abertura em Nova Aba</h4>
                <p className="text-sm">
                  O link será aberto em uma nova aba para não interromper a navegação do aluno na plataforma.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </PasswordResetGuard>
  );
}
