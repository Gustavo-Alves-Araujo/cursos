'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateUser } from '@/hooks/useCreateUser';
import { UserPlus, Mail, User, Shield, Eye, EyeOff, Copy, Check } from 'lucide-react';
// import { toast } from 'sonner';

interface CreateStudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateStudentForm({ isOpen, onClose, onSuccess }: CreateStudentFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    role: 'student' as 'student' | 'admin'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [createdUser, setCreatedUser] = useState<{
    id: string;
    email: string;
    name: string;
    role: string;
    temporaryPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const { createUser, isLoading } = useCreateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Nome e email são obrigatórios');
      return;
    }

    const result = await createUser(formData);
    
    if (result.success && result.user) {
      setCreatedUser(result.user);
      // toast.success('Usuário criado com sucesso!');
    } else {
      alert(result.error || 'Erro ao criar usuário');
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', cpf: '', role: 'student' });
    setCreatedUser(null);
    setShowPassword(false);
    setCopied(false);
    onClose();
  };

  const handleSuccess = () => {
    handleClose();
    onSuccess();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      // toast.success('Copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Erro ao copiar');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-white/10 backdrop-blur-sm border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-blue-200 text-xl flex items-center gap-2">
            <UserPlus className="w-6 h-6" />
            {createdUser ? 'Usuário Criado com Sucesso!' : 'Adicionar Novo Aluno'}
          </DialogTitle>
          <DialogDescription className="text-blue-300">
            {createdUser 
              ? 'O usuário foi criado com sucesso. Anote as informações de acesso.'
              : 'Preencha os dados para criar um novo usuário no sistema.'
            }
          </DialogDescription>
        </DialogHeader>

        {!createdUser ? (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-blue-200">
                  Nome Completo *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nome do aluno"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-10 bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-200">
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10 bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-blue-200">
                CPF (Opcional)
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                <Input
                  id="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                  className="pl-10 bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-blue-200">
                Tipo de Usuário
              </Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300 z-10" />
                <Select
                  value={formData.role}
                  onValueChange={(value: 'student' | 'admin') => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger className="pl-10 bg-white/15 border-white/40 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="student" className="text-white hover:bg-gray-700">
                      Aluno
                    </SelectItem>
                    <SelectItem value="admin" className="text-white hover:bg-gray-700">
                      Administrador
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                disabled={isLoading}
              >
                {isLoading ? 'Criando...' : 'Criar Usuário'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 mt-6">
            <Card className="bg-green-500/10 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-200 flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Usuário Criado com Sucesso!
                </CardTitle>
                <CardDescription className="text-green-300">
                  Anote as informações abaixo para compartilhar com o usuário
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-green-200 text-sm font-medium">Nome</Label>
                    <p className="text-white font-medium">{createdUser.name}</p>
                  </div>
                  <div>
                    <Label className="text-green-200 text-sm font-medium">Email</Label>
                    <p className="text-white font-medium">{createdUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-green-200 text-sm font-medium">Tipo</Label>
                    <p className="text-white font-medium capitalize">{createdUser.role}</p>
                  </div>
                  <div>
                    <Label className="text-green-200 text-sm font-medium">Senha Temporária</Label>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-mono bg-white/10 px-2 py-1 rounded">
                        {showPassword ? createdUser.temporaryPassword : '••••••••••••'}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
                        onClick={() => copyToClipboard(createdUser.temporaryPassword)}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-200 text-sm">
                    <strong>Importante:</strong> O usuário precisará alterar a senha no primeiro login. 
                    Compartilhe essas informações de forma segura.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
                onClick={handleClose}
              >
                Fechar
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={handleSuccess}
              >
                Criar Outro Usuário
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
