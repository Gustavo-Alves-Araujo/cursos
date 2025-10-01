'use client';

import { Sidebar } from "@/components/Sidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Mail, Save, Eye, EyeOff, Shield, Trash2, Award, Clock, BookOpen, Star } from "lucide-react";

export default function MinhaContaPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    bio: '',
    location: '',
    website: '',
    phone: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isSaving, setIsSaving] = useState(false);
  
  
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role === 'admin') {
        router.push('/admin');
        return;
      }
    }
    
    // Preencher formulário com dados do usuário
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
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

  if (!user || user.role === 'admin') {
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSaving(false);
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="relative">
      <Sidebar />
      <main className="space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white transition-all duration-200">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-blue-200 flex items-center gap-3">
                <User className="w-8 h-8" />
                Minha Conta
              </h1>
              <p className="text-blue-300 mt-1">
                Gerencie suas informações pessoais
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>

        {/* Estatísticas do Usuário */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">12</div>
                  <div className="text-blue-200 text-sm">Cursos Concluídos</div>
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
                  <div className="text-2xl font-bold text-white">8</div>
                  <div className="text-blue-200 text-sm">Certificados</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">156h</div>
                  <div className="text-blue-200 text-sm">Tempo de Estudo</div>
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

        {/* Seções Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações Pessoais */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-xl text-blue-200 flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription className="text-blue-300">
                Atualize seus dados básicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-blue-200">Nome Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-200 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-blue-200">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-blue-200">Localização</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
                  placeholder="São Paulo, SP"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-blue-200">Biografia</Label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full bg-white/10 border border-white/30 text-white placeholder:text-blue-300 focus:border-blue-400 focus:ring-blue-400/50 rounded-md px-3 py-2 min-h-[80px] resize-none"
                  placeholder="Conte um pouco sobre você..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-xl text-blue-200 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Segurança
              </CardTitle>
              <CardDescription className="text-blue-300">
                Mantenha sua conta segura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-blue-200">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-blue-300 focus:border-blue-400 focus:ring-blue-400/50 pr-10"
                    placeholder="Digite sua senha atual"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4 text-blue-300" /> : <Eye className="w-4 h-4 text-blue-300" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-blue-200">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-blue-300 focus:border-blue-400 focus:ring-blue-400/50 pr-10"
                    placeholder="Digite sua nova senha"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4 text-blue-300" /> : <Eye className="w-4 h-4 text-blue-300" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-blue-200">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-blue-300 focus:border-blue-400 focus:ring-blue-400/50 pr-10"
                    placeholder="Confirme sua nova senha"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4 text-blue-300" /> : <Eye className="w-4 h-4 text-blue-300" />}
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Button variant="outline" className="w-full bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-200">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Conta
                </Button>
              </div>
            </CardContent>
          </Card>

          
        </div>

        

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20 text-blue-200">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8"
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
        </div>
      </main>
    </div>
  );
}
