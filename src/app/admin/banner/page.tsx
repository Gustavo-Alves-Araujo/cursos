'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useBannerSettings } from '@/hooks/useBannerSettings';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Save, RotateCcw, Image, Link, Upload, X } from 'lucide-react';
import { useNotification } from '@/components/Notification';
import { supabase } from '@/lib/supabase';

export default function AdminBannerPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { settings, isLoading: settingsLoading, error, updateSettings } = useBannerSettings();
  const { showNotification, NotificationContainer } = useNotification();
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerImageLink, setBannerImageLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Atualizar o estado local quando as configurações forem carregadas
  useEffect(() => {
    if (settings) {
      setWelcomeMessage(settings.welcome_message || '');
      setBannerImageUrl(settings.banner_image_url || '');
      setBannerImageLink(settings.banner_image_link || '');
    }
  }, [settings]);

  if (isLoading || settingsLoading) {
    return (
      <div className="relative">
        <AdminSidebar />
        <main className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-2">Carregando configurações...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    router.push('/');
    return null;
  }

  if (error) {
    return (
      <div className="relative">
        <AdminSidebar />
        <main className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <MessageSquare className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">Erro ao carregar configurações</p>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateSettings(welcomeMessage, bannerImageUrl, bannerImageLink);
      showNotification({
        type: 'success',
        title: 'Sucesso!',
        message: 'Configurações do banner salvas com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      showNotification({
        type: 'error',
        title: 'Erro!',
        message: 'Erro ao salvar configurações. Tente novamente.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setWelcomeMessage(settings?.welcome_message || '');
    setBannerImageUrl(settings?.banner_image_url || '');
    setBannerImageLink(settings?.banner_image_link || '');
    showNotification({
      type: 'info',
      title: 'Resetado!',
      message: 'Configurações resetadas para o valor salvo'
    });
  };

  const hasChanges = 
    welcomeMessage !== (settings?.welcome_message || '') ||
    bannerImageUrl !== (settings?.banner_image_url || '') ||
    bannerImageLink !== (settings?.banner_image_link || '');

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `banner-images/${timestamp}_${cleanName}`;

      // Upload do arquivo
      const { data, error } = await supabase.storage
        .from('support-materials')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('support-materials')
        .getPublicUrl(fileName);

      setBannerImageUrl(urlData.publicUrl);
      
      showNotification({
        type: 'success',
        title: 'Upload realizado!',
        message: 'A imagem foi enviada com sucesso.'
      });

    } catch (error) {
      console.error('Erro no upload:', error);
      showNotification({
        type: 'error',
        title: 'Erro no upload',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setBannerImageUrl('');
    setBannerImageLink('');
  };

  return (
    <div className="relative">
      <AdminSidebar />
      <NotificationContainer />
      <main className="ml-64 p-8 min-h-screen bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Configurar Banner</h1>
                <p className="text-blue-200">Personalize a mensagem de boas-vindas exibida no banner</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Card principal de configuração */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Mensagem de Aviso
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Configure o texto que aparecerá abaixo da mensagem de boas-vindas no banner dos alunos.
                  Deixe em branco para não exibir nenhum aviso.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="welcome-message" className="text-white">
                    Texto do Aviso
                  </Label>
                  <Textarea
                    id="welcome-message"
                    placeholder="Digite aqui a mensagem de aviso que aparecerá no banner..."
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    className="min-h-[120px] bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-500"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>Máximo de 500 caracteres</span>
                    <span>{welcomeMessage.length}/500</span>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label className="text-white">Preview</Label>
                  <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          Bem-vindo, {user.name}!
                        </h3>
                        {welcomeMessage && (
                          <p className="text-blue-200 text-sm mt-1">
                            {welcomeMessage}
                          </p>
                        )}
                      </div>
                    </div>
                    {bannerImageUrl && (
                      <div className="mt-4">
                        {bannerImageLink ? (
                          <a 
                            href={bannerImageLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img 
                              src={bannerImageUrl} 
                              alt="Banner" 
                              className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            />
                          </a>
                        ) : (
                          <img 
                            src={bannerImageUrl} 
                            alt="Banner" 
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Configurações
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleReset}
                    disabled={!hasChanges}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resetar
                  </Button>
                </div>

                {hasChanges && (
                  <div className="text-amber-400 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    Você tem alterações não salvas
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card de configuração da imagem */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Imagem do Banner
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Adicione uma imagem que aparecerá abaixo do texto no banner. A imagem pode ser clicável e direcionar para um link.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload de imagem */}
                <div className="space-y-2">
                  <Label className="text-white">Imagem do Banner</Label>
                  {!bannerImageUrl ? (
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-white/40 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                        }}
                        className="hidden"
                        id="banner-image-upload"
                        disabled={isUploading}
                      />
                      <label 
                        htmlFor="banner-image-upload" 
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        {isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                            <span className="text-blue-200">Enviando...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-blue-400" />
                            <span className="text-white font-medium">Clique para fazer upload</span>
                            <span className="text-blue-200 text-sm">PNG, JPG até 5MB</span>
                          </>
                        )}
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <img 
                          src={bannerImageUrl} 
                          alt="Banner preview" 
                          className="w-full h-32 object-cover rounded-lg border border-white/20"
                        />
                        <Button
                          onClick={handleRemoveImage}
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-sm text-blue-200">
                        Imagem carregada com sucesso!
                      </div>
                    </div>
                  )}
                </div>

                {/* Link da imagem */}
                {bannerImageUrl && (
                  <div className="space-y-2">
                    <Label htmlFor="banner-image-link" className="text-white flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      Link de Destino (Opcional)
                    </Label>
                    <Input
                      id="banner-image-link"
                      type="url"
                      placeholder="https://exemplo.com"
                      value={bannerImageLink}
                      onChange={(e) => setBannerImageLink(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-500"
                    />
                    <p className="text-sm text-blue-200">
                      Se preenchido, a imagem se tornará clicável e direcionará para este link
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card de informações */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Informações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">
                    A mensagem será exibida abaixo da saudação &quot;Bem-vindo, [Nome]!&quot; no banner principal da área do aluno.
                  </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm">
                      Se deixar em branco, nenhum aviso será exibido no banner.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm">
                      As alterações são aplicadas imediatamente após salvar.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
