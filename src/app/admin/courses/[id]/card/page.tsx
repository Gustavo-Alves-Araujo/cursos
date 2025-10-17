'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, Save, Eye, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface CardSettings {
  template_url: string | null;
  name_position_x: number;
  name_position_y: number;
  name_font_size: number;
  name_color: string;
  cpf_position_x: number;
  cpf_position_y: number;
  cpf_font_size: number;
  cpf_color: string;
  photo_position_x: number;
  photo_position_y: number;
  photo_width: number;
  photo_height: number;
  days_after_enrollment: number;
}

export default function AdminCourseCardPage() {
  const { id: courseId } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [courseName, setCourseName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [settings, setSettings] = useState<CardSettings>({
    template_url: null,
    name_position_x: 100,
    name_position_y: 100,
    name_font_size: 24,
    name_color: '#000000',
    cpf_position_x: 100,
    cpf_position_y: 150,
    cpf_font_size: 18,
    cpf_color: '#000000',
    photo_position_x: 50,
    photo_position_y: 50,
    photo_width: 120,
    photo_height: 150,
    days_after_enrollment: 0,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/');
        return;
      }
      loadData();
    }
  }, [user, authLoading, courseId]);

  const loadData = async () => {
    try {
      // Buscar nome do curso
      const { data: course } = await supabase
        .from('courses')
        .select('title')
        .eq('id', courseId)
        .single();
      
      if (course) {
        setCourseName(course.title);
      }

      // Buscar configurações
      const response = await fetch(`/api/card-settings?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('courseId', courseId as string);

      const response = await fetch('/api/card-template-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erro no upload');
      }

      const { url } = await response.json();
      setSettings(prev => ({ ...prev, template_url: url }));
      
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload do template');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Sessão expirada. Faça login novamente.');
        return;
      }

      console.log('Salvando configurações:', settings);

      const response = await fetch('/api/card-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          course_id: courseId,
          ...settings
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar');
      }

      const savedData = await response.json();
      console.log('Configurações salvas:', savedData);

      // Recarregar as configurações do servidor
      await loadData();
      
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar configurações: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setIsSaving(false);
    }
  };

  // Desenhar preview no canvas
  useEffect(() => {
    if (!settings.template_url || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Desenhar retângulo da foto
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        settings.photo_position_x,
        settings.photo_position_y,
        settings.photo_width,
        settings.photo_height
      );

      // Desenhar texto do nome (exemplo)
      ctx.font = `${settings.name_font_size}px Arial`;
      ctx.fillStyle = settings.name_color;
      ctx.fillText('NOME DO ALUNO', settings.name_position_x, settings.name_position_y);

      // Desenhar texto do CPF (exemplo)
      ctx.font = `${settings.cpf_font_size}px Arial`;
      ctx.fillStyle = settings.cpf_color;
      ctx.fillText('000.000.000-00', settings.cpf_position_x, settings.cpf_position_y);
    };
    img.src = settings.template_url;
  }, [settings]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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

  return (
    <div className="relative">
      <AdminSidebar />
      <main className="lg:ml-64 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="bg-white/10 hover:bg-white/20">
              <Link href={`/admin/courses/${courseId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-blue-200">Configurar Carteirinha</h1>
              <p className="text-blue-300 mt-1">{courseName}</p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-green-600 to-emerald-600"
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configurações */}
          <div className="space-y-6">
            {/* Upload Template */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-blue-200">Template da Carteirinha</CardTitle>
                <CardDescription className="text-blue-300">
                  Faça upload de uma imagem PNG ou JPG (máximo 5MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button asChild variant="outline" disabled={isUploading}>
                      <label className="cursor-pointer">
                        {isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Selecionar Imagem
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handleTemplateUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    </Button>
                    {settings.template_url && (
                      <span className="text-sm text-green-300">✓ Template carregado</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posição do Nome */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-blue-200">Posição do Nome</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Posição X (pixels)</Label>
                  <Input
                    type="number"
                    value={settings.name_position_x}
                    onChange={(e) => setSettings(prev => ({ ...prev, name_position_x: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Posição Y (pixels)</Label>
                  <Input
                    type="number"
                    value={settings.name_position_y}
                    onChange={(e) => setSettings(prev => ({ ...prev, name_position_y: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Tamanho da Fonte</Label>
                  <Input
                    type="number"
                    value={settings.name_font_size}
                    onChange={(e) => setSettings(prev => ({ ...prev, name_font_size: parseInt(e.target.value) || 12 }))}
                  />
                </div>
                <div>
                  <Label>Cor</Label>
                  <Input
                    type="color"
                    value={settings.name_color}
                    onChange={(e) => setSettings(prev => ({ ...prev, name_color: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Posição do CPF */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-blue-200">Posição do CPF</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Posição X (pixels)</Label>
                  <Input
                    type="number"
                    value={settings.cpf_position_x}
                    onChange={(e) => setSettings(prev => ({ ...prev, cpf_position_x: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Posição Y (pixels)</Label>
                  <Input
                    type="number"
                    value={settings.cpf_position_y}
                    onChange={(e) => setSettings(prev => ({ ...prev, cpf_position_y: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Tamanho da Fonte</Label>
                  <Input
                    type="number"
                    value={settings.cpf_font_size}
                    onChange={(e) => setSettings(prev => ({ ...prev, cpf_font_size: parseInt(e.target.value) || 12 }))}
                  />
                </div>
                <div>
                  <Label>Cor</Label>
                  <Input
                    type="color"
                    value={settings.cpf_color}
                    onChange={(e) => setSettings(prev => ({ ...prev, cpf_color: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Posição da Foto */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-blue-200">Posição da Foto</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Posição X (pixels)</Label>
                  <Input
                    type="number"
                    value={settings.photo_position_x}
                    onChange={(e) => setSettings(prev => ({ ...prev, photo_position_x: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Posição Y (pixels)</Label>
                  <Input
                    type="number"
                    value={settings.photo_position_y}
                    onChange={(e) => setSettings(prev => ({ ...prev, photo_position_y: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Largura (pixels)</Label>
                  <Input
                    type="number"
                    value={settings.photo_width}
                    onChange={(e) => setSettings(prev => ({ ...prev, photo_width: parseInt(e.target.value) || 50 }))}
                  />
                </div>
                <div>
                  <Label>Altura (pixels)</Label>
                  <Input
                    type="number"
                    value={settings.photo_height}
                    onChange={(e) => setSettings(prev => ({ ...prev, photo_height: parseInt(e.target.value) || 50 }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Disponibilidade */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-blue-200">Disponibilidade</CardTitle>
                <CardDescription className="text-blue-300">
                  Após quantos dias da matrícula a carteirinha ficará disponível?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label>Dias após matrícula</Label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.days_after_enrollment}
                    onChange={(e) => setSettings(prev => ({ ...prev, days_after_enrollment: parseInt(e.target.value) || 0 }))}
                  />
                  <p className="text-sm text-blue-300 mt-2">
                    {settings.days_after_enrollment === 0
                      ? 'Disponível imediatamente após matrícula'
                      : `Disponível ${settings.days_after_enrollment} dia(s) após matrícula`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="sticky top-6">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-blue-200 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview da Carteirinha
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Visualização em tempo real (retângulo verde = posição da foto)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {settings.template_url ? (
                  <div className="bg-white/5 rounded-lg p-4 overflow-auto">
                    <canvas ref={canvasRef} className="max-w-full h-auto" />
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-lg p-12 text-center">
                    <ImageIcon className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                    <p className="text-blue-300">Faça upload do template para ver o preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
