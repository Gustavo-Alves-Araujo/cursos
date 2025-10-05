'use client';

import React, { useState, useRef } from 'react';
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
    
    const { data, error } = await supabase.storage
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

  const updateTextConfig = (field: 'studentName' | 'completionDate', property: string, value: any) => {
    setTextConfig(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [property]: value
      }
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {existingTemplate ? 'Editar Template de Certificado' : 'Criar Template de Certificado'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload da imagem de fundo */}
          <div className="space-y-2">
            <Label htmlFor="background-image">Imagem de Fundo</Label>
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
                <img
                  src={previewUrl}
                  alt="Preview do template"
                  className="max-w-full h-auto max-h-96 border rounded"
                />
              </div>
            )}
          </div>

          {/* Configuração do texto - Nome do estudante */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configuração do Nome do Estudante</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name-x">Posição X</Label>
                <Input
                  id="name-x"
                  type="number"
                  value={textConfig.studentName.x}
                  onChange={(e) => updateTextConfig('studentName', 'x', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="name-y">Posição Y</Label>
                <Input
                  id="name-y"
                  type="number"
                  value={textConfig.studentName.y}
                  onChange={(e) => updateTextConfig('studentName', 'y', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="name-font-size">Tamanho da Fonte</Label>
                <Input
                  id="name-font-size"
                  type="number"
                  value={textConfig.studentName.fontSize}
                  onChange={(e) => updateTextConfig('studentName', 'fontSize', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="name-color">Cor</Label>
                <Input
                  id="name-color"
                  type="color"
                  value={textConfig.studentName.color}
                  onChange={(e) => updateTextConfig('studentName', 'color', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="name-align">Alinhamento</Label>
                <select
                  id="name-align"
                  value={textConfig.studentName.textAlign}
                  onChange={(e) => updateTextConfig('studentName', 'textAlign', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="left">Esquerda</option>
                  <option value="center">Centro</option>
                  <option value="right">Direita</option>
                </select>
              </div>
            </div>
          </div>

          {/* Configuração do texto - Data */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configuração da Data</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date-x">Posição X</Label>
                <Input
                  id="date-x"
                  type="number"
                  value={textConfig.completionDate.x}
                  onChange={(e) => updateTextConfig('completionDate', 'x', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="date-y">Posição Y</Label>
                <Input
                  id="date-y"
                  type="number"
                  value={textConfig.completionDate.y}
                  onChange={(e) => updateTextConfig('completionDate', 'y', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="date-font-size">Tamanho da Fonte</Label>
                <Input
                  id="date-font-size"
                  type="number"
                  value={textConfig.completionDate.fontSize}
                  onChange={(e) => updateTextConfig('completionDate', 'fontSize', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="date-color">Cor</Label>
                <Input
                  id="date-color"
                  type="color"
                  value={textConfig.completionDate.color}
                  onChange={(e) => updateTextConfig('completionDate', 'color', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="date-align">Alinhamento</Label>
                <select
                  id="date-align"
                  value={textConfig.completionDate.textAlign}
                  onChange={(e) => updateTextConfig('completionDate', 'textAlign', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="left">Esquerda</option>
                  <option value="center">Centro</option>
                  <option value="right">Direita</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Escolher Imagem
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : existingTemplate ? 'Atualizar' : 'Criar'} Template
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
