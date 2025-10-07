'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CertificateService } from '@/lib/certificateService';
import { CertificateTemplate } from '@/types/certificate';
import { supabase } from '@/lib/supabase';

interface CertificateTemplateFormProps {
  courseId: string;
  existingTemplate?: CertificateTemplate;
  onSuccess?: (template: CertificateTemplate) => void;
}

export function CertificateTemplateForm({ 
  courseId, 
  existingTemplate, 
  onSuccess 
}: CertificateTemplateFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    existingTemplate?.backgroundImageUrl || null
  );
  const [textConfig, setTextConfig] = useState(
    existingTemplate?.textConfig || {
      studentName: {
        x: 400,
        y: 300,
        fontSize: 32,
        fontFamily: 'Arial',
        color: '#000000',
        textAlign: 'center' as const
      },
      completionDate: {
        x: 400,
        y: 400,
        fontSize: 20,
        fontFamily: 'Arial',
        color: '#666666',
        textAlign: 'center' as const
      }
    }
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBackgroundImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadBackgroundImage = async (file: File): Promise<string> => {
    const fileName = `certificate-templates/${courseId}_${Date.now()}.${file.name.split('.').pop()}`;
    
    const { error } = await supabase.storage
      .from('certificate-templates')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      throw new Error(`Erro no upload: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('certificate-templates')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let backgroundImageUrl = existingTemplate?.backgroundImageUrl;

      // Upload da nova imagem se fornecida
      if (backgroundImage) {
        backgroundImageUrl = await uploadBackgroundImage(backgroundImage);
      }

      if (!backgroundImageUrl) {
        throw new Error('Imagem de fundo é obrigatória');
      }

      let template: CertificateTemplate;

      if (existingTemplate) {
        // Atualizar template existente
        template = await CertificateService.updateTemplate(
          existingTemplate.id,
          {
            backgroundImageUrl,
            textConfig
          }
        );
      } else {
        // Criar novo template
        template = await CertificateService.createTemplate(
          courseId,
          backgroundImageUrl,
          textConfig
        );
      }

      onSuccess?.(template);
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      alert('Erro ao salvar template: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTextConfig = (field: 'studentName' | 'completionDate', property: string, value: string | number) => {
    setTextConfig(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [property]: value
      }
    }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-blue-200 text-xl">
            {existingTemplate ? 'Editar Template de Certificado' : 'Criar Template de Certificado'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
          {/* Upload da imagem de fundo */}
          <div className="space-y-4">
            <Label htmlFor="background-image" className="text-lg font-semibold">Imagem de Fundo</Label>
            <Input
              ref={fileInputRef}
              id="background-image"
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {previewUrl && (
              <div className="mt-4">
                <Image
                  src={previewUrl}
                  alt="Preview do template"
                  width={800}
                  height={600}
                  className="max-w-full h-auto max-h-96 border rounded shadow-lg"
                />
              </div>
            )}
          </div>

          {/* Configurações de Texto */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuração do texto - Nome do estudante */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-blue-200">📝 Nome do Estudante</h3>
            
            {/* Alinhamento Visual */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Alinhamento Horizontal</Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant={textConfig.studentName.textAlign === 'left' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateTextConfig('studentName', 'textAlign', 'left')}
                  className="flex-1 min-w-[100px]"
                >
                  ← Esquerda
                </Button>
                <Button
                  type="button"
                  variant={textConfig.studentName.textAlign === 'center' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateTextConfig('studentName', 'textAlign', 'center')}
                  className="flex-1 min-w-[100px]"
                >
                  ↔ Centro
                </Button>
                <Button
                  type="button"
                  variant={textConfig.studentName.textAlign === 'right' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateTextConfig('studentName', 'textAlign', 'right')}
                  className="flex-1 min-w-[100px]"
                >
                  → Direita
                </Button>
              </div>
            </div>

            {/* Posicionamento Rápido */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Posicionamento Rápido</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateTextConfig('studentName', 'x', 100);
                    updateTextConfig('studentName', 'y', 200);
                  }}
                  className="text-xs"
                >
                  ↖ Canto Superior Esquerdo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateTextConfig('studentName', 'x', 400);
                    updateTextConfig('studentName', 'y', 200);
                  }}
                  className="text-xs"
                >
                  ↑ Centro Superior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateTextConfig('studentName', 'x', 700);
                    updateTextConfig('studentName', 'y', 200);
                  }}
                  className="text-xs"
                >
                  ↗ Canto Superior Direito
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateTextConfig('studentName', 'x', 100);
                    updateTextConfig('studentName', 'y', 300);
                  }}
                  className="text-xs"
                >
                  ← Centro Esquerdo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateTextConfig('studentName', 'x', 400);
                    updateTextConfig('studentName', 'y', 300);
                  }}
                  className="text-xs"
                >
                  🎯 Centro
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateTextConfig('studentName', 'x', 700);
                    updateTextConfig('studentName', 'y', 300);
                  }}
                  className="text-xs"
                >
                  → Centro Direito
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateTextConfig('studentName', 'x', 100);
                    updateTextConfig('studentName', 'y', 400);
                  }}
                  className="text-xs"
                >
                  ↙ Canto Inferior Esquerdo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateTextConfig('studentName', 'x', 400);
                    updateTextConfig('studentName', 'y', 400);
                  }}
                  className="text-xs"
                >
                  ↓ Centro Inferior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateTextConfig('studentName', 'x', 700);
                    updateTextConfig('studentName', 'y', 400);
                  }}
                  className="text-xs"
                >
                  ↘ Canto Inferior Direito
                </Button>
              </div>
            </div>

            {/* Posicionamento Manual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name-x">Posição X (Horizontal)</Label>
                <Input
                  id="name-x"
                  type="number"
                  value={textConfig.studentName.x}
                  onChange={(e) => updateTextConfig('studentName', 'x', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name-y">Posição Y (Vertical)</Label>
                <Input
                  id="name-y"
                  type="number"
                  value={textConfig.studentName.y}
                  onChange={(e) => updateTextConfig('studentName', 'y', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Aparência */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name-font-size">Tamanho da Fonte</Label>
                <Input
                  id="name-font-size"
                  type="number"
                  value={textConfig.studentName.fontSize}
                  onChange={(e) => updateTextConfig('studentName', 'fontSize', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name-color">Cor do Texto</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="name-color"
                    type="color"
                    value={textConfig.studentName.color}
                    onChange={(e) => updateTextConfig('studentName', 'color', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <span className="text-sm text-gray-600">{textConfig.studentName.color}</span>
                </div>
              </div>
            </div>
            </div>

            {/* Configuração do texto - Data */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-blue-200">📅 Data de Conclusão</h3>
            
            {/* Alinhamento Visual */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Alinhamento Horizontal</Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant={textConfig.completionDate.textAlign === 'left' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateTextConfig('completionDate', 'textAlign', 'left')}
                  className="flex-1 min-w-[100px]"
                >
                  ← Esquerda
                </Button>
                <Button
                  type="button"
                  variant={textConfig.completionDate.textAlign === 'center' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateTextConfig('completionDate', 'textAlign', 'center')}
                  className="flex-1 min-w-[100px]"
                >
                  ↔ Centro
                </Button>
                <Button
                  type="button"
                  variant={textConfig.completionDate.textAlign === 'right' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateTextConfig('completionDate', 'textAlign', 'right')}
                  className="flex-1 min-w-[100px]"
                >
                  → Direita
                </Button>
              </div>
            </div>

            {/* Posicionamento Rápido */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Posicionamento Rápido</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateTextConfig('completionDate', 'x', 100);
                    updateTextConfig('completionDate', 'y', 450);
                  }}
                  className="text-xs"
                >
                  ↖ Canto Superior Esquerdo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateTextConfig('completionDate', 'x', 400);
                    updateTextConfig('completionDate', 'y', 450);
                  }}
                  className="text-xs"
                >
                  ↑ Centro Superior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateTextConfig('completionDate', 'x', 700);
                    updateTextConfig('completionDate', 'y', 450);
                  }}
                  className="text-xs"
                >
                  ↗ Canto Superior Direito
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateTextConfig('completionDate', 'x', 100);
                    updateTextConfig('completionDate', 'y', 500);
                  }}
                  className="text-xs"
                >
                  ← Centro Esquerdo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateTextConfig('completionDate', 'x', 400);
                    updateTextConfig('completionDate', 'y', 500);
                  }}
                  className="text-xs"
                >
                  🎯 Centro
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateTextConfig('completionDate', 'x', 700);
                    updateTextConfig('completionDate', 'y', 500);
                  }}
                  className="text-xs"
                >
                  → Centro Direito
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateTextConfig('completionDate', 'x', 100);
                    updateTextConfig('completionDate', 'y', 550);
                  }}
                  className="text-xs"
                >
                  ↙ Canto Inferior Esquerdo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateTextConfig('completionDate', 'x', 400);
                    updateTextConfig('completionDate', 'y', 550);
                  }}
                  className="text-xs"
                >
                  ↓ Centro Inferior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateTextConfig('completionDate', 'x', 700);
                    updateTextConfig('completionDate', 'y', 550);
                  }}
                  className="text-xs"
                >
                  ↘ Canto Inferior Direito
                </Button>
              </div>
            </div>

            {/* Posicionamento Manual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-x">Posição X (Horizontal)</Label>
                <Input
                  id="date-x"
                  type="number"
                  value={textConfig.completionDate.x}
                  onChange={(e) => updateTextConfig('completionDate', 'x', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-y">Posição Y (Vertical)</Label>
                <Input
                  id="date-y"
                  type="number"
                  value={textConfig.completionDate.y}
                  onChange={(e) => updateTextConfig('completionDate', 'y', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Aparência */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-font-size">Tamanho da Fonte</Label>
                <Input
                  id="date-font-size"
                  type="number"
                  value={textConfig.completionDate.fontSize}
                  onChange={(e) => updateTextConfig('completionDate', 'fontSize', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-color">Cor do Texto</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="date-color"
                    type="color"
                    value={textConfig.completionDate.color}
                    onChange={(e) => updateTextConfig('completionDate', 'color', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <span className="text-sm text-gray-600">{textConfig.completionDate.color}</span>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <div className="flex gap-2 flex-1">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => window.history.back()}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isLoading ? '⏳ Salvando...' : existingTemplate ? '✏️ Atualizar Template' : '✨ Criar Template'}
              </Button>
            </div>
          </div>
        </form>
        </CardContent>
      </Card>
    </div>
  );
}
