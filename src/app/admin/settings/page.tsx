'use client';

import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { LogoutButton } from "@/components/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Settings, Save, RefreshCw, Shield, Globe } from "lucide-react";

export default function AdminSettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState({
    // Configurações Gerais
    siteName: "Plataforma de Cursos",
    siteDescription: "A melhor plataforma de cursos online do Brasil",
    siteUrl: "https://plataforma-cursos.com",
    adminEmail: "admin@plataforma-cursos.com",
    
    // Configurações de Segurança
    requireEmailVerification: true,
    allowUserRegistration: true,
    requireStrongPasswords: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    
    
    
    // Configurações de Curso
    allowCourseReviews: true,
    requireCourseApproval: false,
    maxCourseDuration: 120,
    allowCourseDownloads: true,
    
    // Configurações de Certificado
    certificateExpiry: 365,
    requireCertificateVerification: true,
    allowCertificateDownloads: true,
    
    // Configurações de Comunidade
    allowUserPosts: true,
    moderateUserPosts: true,
    allowUserComments: true,
    allowUserRatings: true
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

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // Aqui você salvaria as configurações no backend
    console.log('Salvando configurações:', settings);
    // Simular salvamento
    alert('Configurações salvas com sucesso!');
  };

  const handleResetSettings = () => {
    if (confirm('Tem certeza que deseja redefinir todas as configurações para os valores padrão?')) {
      // Aqui você resetaria as configurações
      console.log('Resetando configurações');
      alert('Configurações redefinidas para os valores padrão!');
    }
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
                <Settings className="w-8 h-8" />
                Configurações
              </h1>
              <p className="text-blue-300 mt-1">
                Gerencie as configurações da plataforma
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleResetSettings}
              variant="outline"
              className="bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Resetar
            </Button>
            <Button 
              onClick={handleSaveSettings}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <LogoutButton />
          </div>
        </div>

        {/* Configurações Gerais */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-blue-200 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Configurações Gerais
            </CardTitle>
            <CardDescription className="text-blue-300">
              Configurações básicas da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-blue-200 text-sm font-medium">Nome do Site</label>
                <Input 
                  value={settings.siteName}
                  onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
                />
              </div>
              <div>
                <label className="text-blue-200 text-sm font-medium">URL do Site</label>
                <Input 
                  value={settings.siteUrl}
                  onChange={(e) => handleSettingChange('siteUrl', e.target.value)}
                  className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
                />
              </div>
            </div>
            <div>
              <label className="text-blue-200 text-sm font-medium">Descrição do Site</label>
              <Textarea 
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
                rows={3}
              />
            </div>
            <div>
              <label className="text-blue-200 text-sm font-medium">Email do Administrador</label>
              <Input 
                value={settings.adminEmail}
                onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
                className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Segurança */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-blue-200 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Segurança
            </CardTitle>
            <CardDescription className="text-blue-300">
              Configurações de segurança e autenticação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-blue-200 font-medium">Verificação de Email</label>
                    <p className="text-blue-300 text-sm">Exigir verificação de email para novos usuários</p>
                  </div>
                  <Switch 
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-blue-200 font-medium">Registro de Usuários</label>
                    <p className="text-blue-300 text-sm">Permitir registro de novos usuários</p>
                  </div>
                  <Switch 
                    checked={settings.allowUserRegistration}
                    onCheckedChange={(checked) => handleSettingChange('allowUserRegistration', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-blue-200 font-medium">Senhas Fortes</label>
                    <p className="text-blue-300 text-sm">Exigir senhas complexas</p>
                  </div>
                  <Switch 
                    checked={settings.requireStrongPasswords}
                    onCheckedChange={(checked) => handleSettingChange('requireStrongPasswords', checked)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-blue-200 text-sm font-medium">Timeout da Sessão (minutos)</label>
                  <Input 
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="text-blue-200 text-sm font-medium">Tentativas de Login</label>
                  <Input 
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                    className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Notificações */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-blue-200 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
            </CardTitle>
            <CardDescription className="text-blue-300">
              Configurações de notificações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-blue-200 font-medium">Notificações por Email</label>
                    <p className="text-blue-300 text-sm">Enviar notificações por email</p>
                  </div>
                  <Switch 
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-blue-200 font-medium">Notificações Push</label>
                    <p className="text-blue-300 text-sm">Enviar notificações push</p>
                  </div>
                  <Switch 
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-blue-200 font-medium">Novos Usuários</label>
                    <p className="text-blue-300 text-sm">Notificar sobre novos usuários</p>
                  </div>
                  <Switch 
                    checked={settings.newUserNotifications}
                    onCheckedChange={(checked) => handleSettingChange('newUserNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-blue-200 font-medium">Conclusão de Cursos</label>
                    <p className="text-blue-300 text-sm">Notificar sobre conclusão de cursos</p>
                  </div>
                  <Switch 
                    checked={settings.courseCompletionNotifications}
                    onCheckedChange={(checked) => handleSettingChange('courseCompletionNotifications', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Sistema */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-blue-200 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Sistema
            </CardTitle>
            <CardDescription className="text-blue-300">
              Configurações do sistema e manutenção
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-blue-200 font-medium">Modo de Manutenção</label>
                    <p className="text-blue-300 text-sm">Ativar modo de manutenção</p>
                  </div>
                  <Switch 
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-blue-200 font-medium">Acesso de Convidados</label>
                    <p className="text-blue-300 text-sm">Permitir acesso sem login</p>
                  </div>
                  <Switch 
                    checked={settings.allowGuestAccess}
                    onCheckedChange={(checked) => handleSettingChange('allowGuestAccess', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-blue-200 font-medium">Analytics</label>
                    <p className="text-blue-300 text-sm">Coletar dados de analytics</p>
                  </div>
                  <Switch 
                    checked={settings.enableAnalytics}
                    onCheckedChange={(checked) => handleSettingChange('enableAnalytics', checked)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-blue-200 text-sm font-medium">Retenção de Dados (dias)</label>
                  <Input 
                    type="number"
                    value={settings.dataRetentionDays}
                    onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
                    className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-blue-200 font-medium">Cookies</label>
                    <p className="text-blue-300 text-sm">Permitir uso de cookies</p>
                  </div>
                  <Switch 
                    checked={settings.enableCookies}
                    onCheckedChange={(checked) => handleSettingChange('enableCookies', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Pagamento */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-blue-200 flex items-center gap-2">
              <Key className="w-5 h-5" />
              Pagamentos
            </CardTitle>
            <CardDescription className="text-blue-300">
              Configurações de pagamento e financeiro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-blue-200 font-medium">Pagamentos Habilitados</label>
                    <p className="text-blue-300 text-sm">Permitir pagamentos na plataforma</p>
                  </div>
                  <Switch 
                    checked={settings.paymentEnabled}
                    onCheckedChange={(checked) => handleSettingChange('paymentEnabled', checked)}
                  />
                </div>
                <div>
                  <label className="text-blue-200 text-sm font-medium">Moeda</label>
                  <select 
                    value={settings.currency}
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                    className="w-full bg-white/15 border border-white/40 text-black rounded-md px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  >
                    <option value="BRL">BRL (Real Brasileiro)</option>
                    <option value="USD">USD (Dólar Americano)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-blue-200 text-sm font-medium">Taxa de Imposto (%)</label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={settings.taxRate}
                    onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value))}
                    className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="text-blue-200 text-sm font-medium">Período de Reembolso (dias)</label>
                  <Input 
                    type="number"
                    value={settings.refundPeriod}
                    onChange={(e) => handleSettingChange('refundPeriod', parseInt(e.target.value))}
                    className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
