'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Zap,
  Search
} from 'lucide-react';

interface YampiIntegration {
  id: string;
  name: string;
  product_id: string;
  secret_key: string;
  course_id: string;
  created_at: string;
  courses?: {
    id: string;
    title: string;
  };
}

interface Course {
  id: string;
  title: string;
}

export default function YampiIntegrationsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [integrations, setIntegrations] = useState<YampiIntegration[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    product_id: '',
    secret_key: '',
    course_id: ''
  });

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

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Usar a instância global do Supabase
      
      // Carregar integrações
      const { data: integrationsData, error: integrationsError } = await supabase
        .from('yampi_integrations')
        .select(`
          *,
          courses (
            id,
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (integrationsError) throw integrationsError;

      // Carregar cursos
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title')
        .order('title');

      if (coursesError) throw coursesError;

      setIntegrations(integrationsData || []);
      setCourses(coursesData || []);
    } catch (error: unknown) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Usar a instância global do Supabase

      if (isEditing && editingId) {
        // Editar integração existente
        const { error } = await supabase
          .from('yampi_integrations')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        setSuccess('Integração atualizada com sucesso!');
      } else {
        // Criar nova integração
        const { error } = await supabase
          .from('yampi_integrations')
          .insert([formData]);

        if (error) throw error;
        setSuccess('Integração criada com sucesso!');
      }

      // Limpar formulário e recarregar dados
      setFormData({ name: '', product_id: '', secret_key: '', course_id: '' });
      setIsDialogOpen(false);
      setIsEditing(false);
      setEditingId(null);
      loadData();
    } catch (error: unknown) {
      console.error('Erro ao salvar integração:', error);
      setError('Erro ao salvar integração: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  const handleEdit = (integration: YampiIntegration) => {
    setFormData({
      name: integration.name,
      product_id: integration.product_id,
      secret_key: integration.secret_key,
      course_id: integration.course_id
    });
    setIsEditing(true);
    setEditingId(integration.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta integração?')) return;

    try {
      // Usar a instância global do Supabase
      const { error } = await supabase
        .from('yampi_integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSuccess('Integração excluída com sucesso!');
      loadData();
    } catch (error: unknown) {
      console.error('Erro ao excluir integração:', error);
      setError('Erro ao excluir integração: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  const resetForm = () => {
    setFormData({ name: '', product_id: '', secret_key: '', course_id: '' });
    setIsEditing(false);
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  // Filtrar integrações com base no termo de busca
  const filteredIntegrations = integrations.filter((integration) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = integration.name.toLowerCase().includes(searchLower);
    const productIdMatch = integration.product_id.toLowerCase().includes(searchLower);
    const courseMatch = integration.courses?.title.toLowerCase().includes(searchLower);
    
    return nameMatch || productIdMatch || courseMatch;
  });

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
    <div className="relative">
      <AdminSidebar />
      <main className="space-y-8 p-6 lg:ml-64">
        {/* Header */}
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div>
            <h1 className="text-3xl font-bold text-blue-200 flex items-center gap-3">
              <Zap className="w-8 h-8" />
              Integrações Yampi
            </h1>
            <p className="text-blue-300 mt-1">Gerencie as integrações com a Yampi</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Integração
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? 'Editar Integração' : 'Nova Integração'}
                </DialogTitle>
                <DialogDescription>
                  Configure os dados da integração com a Yampi
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Entrega</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Curso Psicologia"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_id">ID do Produto (Yampi)</Label>
                  <Input
                    id="product_id"
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    placeholder="ID do produto na Yampi"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secret_key">Chave Secreta</Label>
                  <Input
                    id="secret_key"
                    value={formData.secret_key}
                    onChange={(e) => setFormData({ ...formData, secret_key: e.target.value })}
                    placeholder="Chave secreta do webhook"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course_id">Curso Vinculado</Label>
                  <Select
                    value={formData.course_id}
                    onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {isEditing ? 'Atualizar' : 'Criar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Campo de Busca */}
        {!isLoadingData && integrations.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
              <Input
                type="text"
                placeholder="Buscar por nome ou ID do produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-blue-100 placeholder:text-blue-300/50 focus:bg-white/15"
              />
            </div>
            {searchTerm && (
              <p className="text-sm text-blue-300 mt-2">
                {filteredIntegrations.length} {filteredIntegrations.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </p>
            )}
          </div>
        )}

        {/* Lista de Integrações */}
        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            <span className="ml-2 text-blue-300">Carregando integrações...</span>
          </div>
        ) : integrations.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Zap className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-blue-200 mb-2">
                Nenhuma integração encontrada
              </h3>
              <p className="text-blue-300 text-center mb-4">
                Crie sua primeira integração com a Yampi para começar
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Integração
              </Button>
            </CardContent>
          </Card>
        ) : filteredIntegrations.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-blue-200 mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-blue-300 text-center mb-4">
                Tente buscar por outro termo
              </p>
              <Button 
                onClick={() => setSearchTerm('')}
                variant="outline"
                className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
              >
                Limpar busca
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-blue-200 flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        {integration.name}
                      </CardTitle>
                      <CardDescription className="text-blue-300">
                        Produto ID: {integration.product_id}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(integration)}
                        className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(integration.id)}
                        className="bg-red-600/20 hover:bg-red-600/30 border-red-500/30 text-red-200 hover:text-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-600/20 text-blue-200">
                        Curso: {integration.courses?.title || 'Não vinculado'}
                      </Badge>
                    </div>
                    <div className="text-sm text-blue-300">
                      <p><strong>Chave Secreta:</strong> {integration.secret_key.substring(0, 8)}...</p>
                      <p><strong>Criado em:</strong> {new Date(integration.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/yampi`);
                          setSuccess('URL do webhook copiada para a área de transferência!');
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Copiar URL do Webhook
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
