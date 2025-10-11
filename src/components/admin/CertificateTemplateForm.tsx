'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { CertificateService } from '@/lib/certificateService';
import { CertificateTemplate } from '@/types/certificate';
import { supabase } from '@/lib/supabase';
import { Eye } from 'lucide-react';

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
  const [secondPageConfig, setSecondPageConfig] = useState(
    existingTemplate?.secondPageConfig || {
      showSecondPage: false,
      programmaticContent: '',
      includeCpf: true,
      includeCourseName: true
    }
  );
  const [selectedStudentPosition, setSelectedStudentPosition] = useState<string>('centro');
  const [selectedDatePosition, setSelectedDatePosition] = useState<string>('centro');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inicializar posições selecionadas baseadas no template existente
  React.useEffect(() => {
    if (existingTemplate) {
      const studentPos = detectPosition(
        existingTemplate.textConfig.studentName.x,
        existingTemplate.textConfig.studentName.y
      );
      const datePos = detectPosition(
        existingTemplate.textConfig.completionDate.x,
        existingTemplate.textConfig.completionDate.y
      );
      
      setSelectedStudentPosition(studentPos || 'custom');
      setSelectedDatePosition(datePos || 'custom');
    }
  }, [existingTemplate]);

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
            textConfig,
            secondPageConfig
          }
        );
      } else {
        // Criar novo template
        template = await CertificateService.createTemplate(
          courseId,
          backgroundImageUrl,
          textConfig,
          secondPageConfig
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

  // Função para detectar a posição baseada nas coordenadas
  const detectPosition = (x: number, y: number) => {
    const positions = {
      'canto-superior-esquerdo': { x: 100, y: 200 },
      'centro-superior': { x: 400, y: 200 },
      'canto-superior-direito': { x: 700, y: 200 },
      'centro-esquerdo': { x: 100, y: 300 },
      'centro': { x: 400, y: 300 },
      'centro-direito': { x: 700, y: 300 },
      'canto-inferior-esquerdo': { x: 100, y: 400 },
      'centro-inferior': { x: 400, y: 400 },
      'canto-inferior-direito': { x: 700, y: 400 }
    };

    for (const [position, coords] of Object.entries(positions)) {
      if (coords.x === x && coords.y === y) {
        return position;
      }
    }
    return null; // Posição customizada
  };

  const handleManualPositionChange = (field: 'studentName' | 'completionDate', property: 'x' | 'y', value: number) => {
    updateTextConfig(field, property, value);
    
    // Detectar nova posição após a mudança
    const newConfig = {
      ...textConfig[field],
      [property]: value
    };
    
    const detectedPosition = detectPosition(newConfig.x, newConfig.y);
    
    if (field === 'studentName') {
      setSelectedStudentPosition(detectedPosition || 'custom');
    } else {
      setSelectedDatePosition(detectedPosition || 'custom');
    }
  };

  // Função para gerar preview do certificado
  const generatePreview = () => {
    if (!previewUrl) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    canvas.width = 800;
    canvas.height = 600;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise<string>((resolve, reject) => {
      img.onload = () => {
        // Desenha a imagem de fundo
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Configura o texto do nome do estudante
        const nameConfig = textConfig.studentName;
        ctx.font = `${nameConfig.fontSize}px ${nameConfig.fontFamily}`;
        ctx.fillStyle = nameConfig.color;
        ctx.textAlign = nameConfig.textAlign;
        ctx.textBaseline = 'middle';
        
        // Desenha o nome do estudante
        ctx.fillText('Nome do Estudante', nameConfig.x, nameConfig.y);

        // Configura o texto da data
        const dateConfig = textConfig.completionDate;
        ctx.font = `${dateConfig.fontSize}px ${dateConfig.fontFamily}`;
        ctx.fillStyle = dateConfig.color;
        ctx.textAlign = dateConfig.textAlign;
        ctx.textBaseline = 'middle';
        
        // Formata a data para dd/mm/yyyy
        const formatDate = (dateString: string) => {
          const date = new Date(dateString);
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };
        
        // Desenha a data
        ctx.fillText(formatDate(new Date().toISOString()), dateConfig.x, dateConfig.y);

        resolve(canvas.toDataURL());
      };
      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = previewUrl;
    });
  };

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewSecondPage, setPreviewSecondPage] = useState<string | null>(null);

  // Função para gerar preview da segunda página
  const generateSecondPagePreview = () => {
    if (!secondPageConfig.showSecondPage) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    canvas.width = 800;
    canvas.height = 600;

    // Fundo branco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Configurações de fonte
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';

    let yPosition = 50;
    const lineHeight = 25;
    const leftMargin = 50;

    // Primeira linha: Nome, CPF e Curso em uma linha só
    ctx.font = 'bold 16px Arial';
    let firstLineText = 'Nome do aluno: Nome do Estudante';
    
    if (secondPageConfig.includeCpf) {
      firstLineText += ', CPF: 000.000.000-00';
    }
    
    if (secondPageConfig.includeCourseName) {
      firstLineText += ', Curso: Nome do Curso';
    }
    
    ctx.fillText(firstLineText, leftMargin, yPosition);
    yPosition += lineHeight + 20;

    // Conteúdo Programático
    yPosition += 10;
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Conteúdo Programático:', leftMargin, yPosition);
    yPosition += lineHeight + 10;

    // Conteúdo programático
    if (secondPageConfig.programmaticContent) {
      ctx.font = '14px Arial';
      const lines = secondPageConfig.programmaticContent.split('\n');
      
      lines.forEach(line => {
        if (line.trim()) {
          ctx.fillText(line.trim(), leftMargin, yPosition);
          yPosition += lineHeight;
        } else {
          yPosition += lineHeight / 2; // Espaço menor para linhas vazias
        }
      });
    } else {
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText('Conteúdo programático será preenchido aqui...', leftMargin, yPosition);
      yPosition += lineHeight;
    }

    // Data de emissão no canto direito
    const currentDate = new Date().toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    ctx.fillStyle = '#000000';
    ctx.font = '14px Arial';
    const emissionText = `Certificado emitido em: ${currentDate}`;
    const textWidth = ctx.measureText(emissionText).width;
    const rightMargin = canvas.width - 50;
    ctx.fillText(emissionText, rightMargin - textWidth, canvas.height - 50);

    return canvas.toDataURL();
  };

  // Atualizar preview quando as configurações mudarem
  React.useEffect(() => {
    if (previewUrl) {
      generatePreview()?.then(setPreviewImage).catch(console.error);
    }
    if (secondPageConfig.showSecondPage) {
      const secondPage = generateSecondPagePreview();
      setPreviewSecondPage(secondPage);
    } else {
      setPreviewSecondPage(null);
    }
  }, [previewUrl, textConfig, secondPageConfig, generatePreview, generateSecondPagePreview]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário */}
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
              <h3 className="text-xl font-semibold text-blue-200">Nome do Estudante</h3>

            {/* Posicionamento Rápido */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Posicionamento Rápido</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={selectedStudentPosition === 'canto-superior-esquerdo' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    updateTextConfig('studentName', 'x', 100);
                    updateTextConfig('studentName', 'y', 200);
                    setSelectedStudentPosition('canto-superior-esquerdo');
                  }}
                  className="text-xs"
                >
                  X
                </Button>
                <Button
                  type="button"
                  variant={selectedStudentPosition === 'centro-superior' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    updateTextConfig('studentName', 'x', 400);
                    updateTextConfig('studentName', 'y', 200);
                    setSelectedStudentPosition('centro-superior');
                  }}
                  className="text-xs"
                >
                  X
                </Button>
                <Button
                  type="button"
                  variant={selectedStudentPosition === 'canto-superior-direito' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    updateTextConfig('studentName', 'x', 700);
                    updateTextConfig('studentName', 'y', 200);
                    setSelectedStudentPosition('canto-superior-direito');
                  }}
                  className="text-xs"
                >
                  X
                </Button>
                <Button
                  type="button"
                  variant={selectedStudentPosition === 'centro-esquerdo' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    updateTextConfig('studentName', 'x', 100);
                    updateTextConfig('studentName', 'y', 300);
                    setSelectedStudentPosition('centro-esquerdo');
                  }}
                  className="text-xs"
                >
                  X
                </Button>
                <Button
                  type="button"
                  variant={selectedStudentPosition === 'centro' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    updateTextConfig('studentName', 'x', 415);
                    updateTextConfig('studentName', 'y', 300);
                    setSelectedStudentPosition('centro');
                  }}
                  className="text-xs"
                >
                  X
                </Button>
                <Button
                  type="button"
                  variant={selectedStudentPosition === 'centro-direito' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    updateTextConfig('studentName', 'x', 700);
                    updateTextConfig('studentName', 'y', 300);
                    setSelectedStudentPosition('centro-direito');
                  }}
                  className="text-xs"
                >
                  X
                </Button>
                <Button
                  type="button"
                  variant={selectedStudentPosition === 'canto-inferior-esquerdo' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    updateTextConfig('studentName', 'x', 100);
                    updateTextConfig('studentName', 'y', 400);
                    setSelectedStudentPosition('canto-inferior-esquerdo');
                  }}
                  className="text-xs"
                >
                  X
                </Button>
                <Button
                  type="button"
                  variant={selectedStudentPosition === 'centro-inferior' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    updateTextConfig('studentName', 'x', 400);
                    updateTextConfig('studentName', 'y', 400);
                    setSelectedStudentPosition('centro-inferior');
                  }}
                  className="text-xs"
                >
                  X
                </Button>
                <Button
                  type="button"
                  variant={selectedStudentPosition === 'canto-inferior-direito' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    updateTextConfig('studentName', 'x', 700);
                    updateTextConfig('studentName', 'y', 400);
                    setSelectedStudentPosition('canto-inferior-direito');
                  }}
                  className="text-xs"
                >
                  X
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
                  onChange={(e) => handleManualPositionChange('studentName', 'x', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name-y">Posição Y (Vertical)</Label>
                <Input
                  id="name-y"
                  type="number"
                  value={textConfig.studentName.y}
                  onChange={(e) => handleManualPositionChange('studentName', 'y', parseInt(e.target.value))}
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
              <h3 className="text-xl font-semibold text-blue-200">Data de Conclusão</h3>

            {/* Posicionamento Rápido */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Posicionamento Rápido</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={selectedDatePosition === 'canto-superior-esquerdo' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    updateTextConfig('completionDate', 'x', 60);
                    updateTextConfig('completionDate', 'y', 130);
                    setSelectedDatePosition('canto-superior-esquerdo');
                  }}
                  className="text-xs"
                >
                  X
                </Button>
                <Button
                  type="button"
                  variant={selectedDatePosition === 'centro-superior' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    updateTextConfig('completionDate', 'x', 400);
                    updateTextConfig('completionDate', 'y', 200);
                    setSelectedDatePosition('centro-superior');
                  }}
                  className="text-xs"
                >
                  X
                </Button>
                <Button
                  type="button"
                  variant={selectedDatePosition === 'canto-superior-direito' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    updateTextConfig('completionDate', 'x', 720);
                    updateTextConfig('completionDate', 'y', 30);
                    setSelectedDatePosition('canto-superior-direito');
                  }}
                  className="text-xs"
                >
                  X
                </Button>
                <Button
                  type="button"
                  variant={selectedDatePosition === 'centro-esquerdo' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    updateTextConfig('completionDate', 'x', 100);
                    updateTextConfig('completionDate', 'y', 300);
                    setSelectedDatePosition('centro-esquerdo');
                  }}
                  className="text-xs"
                >
                  X
                </Button>
                <Button
                  type="button"
                  variant={selectedDatePosition === 'centro' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    updateTextConfig('completionDate', 'x', 400);
                    updateTextConfig('completionDate', 'y', 300);
                    setSelectedDatePosition('centro');
                  }}
                  className="text-xs"
                >
                  X
                </Button>
                <Button
                  type="button"
                  variant={selectedDatePosition === 'centro-direito' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    updateTextConfig('completionDate', 'x', 700);
                    updateTextConfig('completionDate', 'y', 300);
                    setSelectedDatePosition('centro-direito');
                  }}
                  className="text-xs"
                >
                  X
                </Button>
                <Button
                  type="button"
                  variant={selectedDatePosition === 'canto-inferior-esquerdo' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    updateTextConfig('completionDate', 'x', 100);
                    updateTextConfig('completionDate', 'y', 480);
                    setSelectedDatePosition('canto-inferior-esquerdo');
                  }}
                  className="text-xs"
                >
                  X
                </Button>
                <Button
                  type="button"
                  variant={selectedDatePosition === 'centro-inferior' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    updateTextConfig('completionDate', 'x', 400);
                    updateTextConfig('completionDate', 'y', 440);
                    setSelectedDatePosition('centro-inferior');
                  }}
                  className="text-xs"
                >
                  X
                </Button>
                <Button
                  type="button"
                  variant={selectedDatePosition === 'canto-inferior-direito' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    updateTextConfig('completionDate', 'x', 700);
                    updateTextConfig('completionDate', 'y', 450);
                    setSelectedDatePosition('canto-inferior-direito');
                  }}
                  className="text-xs"
                >
                  X
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
                  onChange={(e) => handleManualPositionChange('completionDate', 'x', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-y">Posição Y (Vertical)</Label>
                <Input
                  id="date-y"
                  type="number"
                  value={textConfig.completionDate.y}
                  onChange={(e) => handleManualPositionChange('completionDate', 'y', parseInt(e.target.value))}
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

          {/* Configuração da Segunda Página */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-blue-200">Segunda Página do Certificado</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-second-page"
                  checked={secondPageConfig.showSecondPage}
                  onCheckedChange={(checked) => 
                    setSecondPageConfig(prev => ({ ...prev, showSecondPage: !!checked }))
                  }
                />
                <Label htmlFor="show-second-page" className="text-white">
                  Incluir segunda página com informações detalhadas
                </Label>
              </div>

              {secondPageConfig.showSecondPage && (
                <div className="space-y-4 pl-6 border-l-2 border-blue-400/30">
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-white">Informações a incluir:</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-cpf"
                          checked={secondPageConfig.includeCpf}
                          onCheckedChange={(checked) => 
                            setSecondPageConfig(prev => ({ ...prev, includeCpf: !!checked }))
                          }
                        />
                        <Label htmlFor="include-cpf" className="text-sm text-blue-200">
                          Incluir CPF do aluno
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-course-name"
                          checked={secondPageConfig.includeCourseName}
                          onCheckedChange={(checked) => 
                            setSecondPageConfig(prev => ({ ...prev, includeCourseName: !!checked }))
                          }
                        />
                        <Label htmlFor="include-course-name" className="text-sm text-blue-200">
                          Incluir nome do curso
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="programmatic-content" className="text-base font-medium text-white">
                      Conteúdo Programático
                    </Label>
                    <Textarea
                      id="programmatic-content"
                      placeholder="Digite o conteúdo programático do curso aqui...&#10;&#10;Exemplo:&#10;1.1. Aula 1&#10;1.2. Aula 2&#10;1.3. Aula 3&#10;1.4. Aula 4&#10;1.5. Baixe aqui sua Apostila..."
                      value={secondPageConfig.programmaticContent}
                      onChange={(e) => 
                        setSecondPageConfig(prev => ({ ...prev, programmaticContent: e.target.value }))
                      }
                      className="min-h-[200px] bg-white/5 border-white/20 text-white placeholder:text-blue-300"
                      rows={10}
                    />
                    <p className="text-sm text-blue-300">
                      Este conteúdo será exibido na segunda página do certificado. Use quebras de linha para organizar as aulas.
                    </p>
                  </div>
                </div>
              )}
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
                {isLoading ? 'Salvando...' : existingTemplate ? 'Atualizar Template' : 'Criar Template'}
              </Button>
            </div>
          </div>
        </form>
        </CardContent>
      </Card>

      {/* Preview do Certificado */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-blue-200 text-xl flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Preview do Certificado
          </CardTitle>
        </CardHeader>
        <CardContent>
          {previewImage ? (
            <div className="space-y-4">
              {/* Primeira Página */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-blue-200">Primeira Página</h4>
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <Image
                    src={previewImage}
                    alt="Preview da primeira página"
                    width={800}
                    height={600}
                    className="w-full h-auto max-w-full border rounded"
                  />
                </div>
              </div>

              {/* Segunda Página */}
              {previewSecondPage && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-200">Segunda Página</h4>
                  <div className="bg-white p-4 rounded-lg shadow-lg">
                    <Image
                      src={previewSecondPage}
                      alt="Preview da segunda página"
                      width={800}
                      height={600}
                      className="w-full h-auto max-w-full border rounded"
                    />
                  </div>
                </div>
              )}

              <div className="text-sm text-blue-300 bg-blue-500/10 p-3 rounded-lg">
                <p className="font-medium mb-1">📝 Preview em tempo real</p>
                <p>Este preview mostra como o certificado ficará com as configurações atuais. O texto &quot;Nome do Estudante&quot; será substituído pelo nome real do aluno.</p>
                {secondPageConfig.showSecondPage && (
                  <p className="mt-2 text-xs">A segunda página será gerada automaticamente com as informações do aluno e conteúdo programático configurado.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-blue-300" />
              </div>
              <h3 className="text-lg font-semibold text-blue-200 mb-2">Preview não disponível</h3>
              <p className="text-blue-300">Faça upload de uma imagem de fundo para ver o preview do certificado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
