'use client';

import { useState, useRef, useEffect } from 'react';
import NextImage from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Download, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface StudentCard {
  id: string;
  course_id: string;
  profile_photo_url: string | null;
  courses: {
    title: string;
  };
}

interface CardGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: StudentCard;
  onCardGenerated: () => void;
}

interface CardGenerationData {
  templateUrl: string;
  profilePhotoUrl: string;
  name: string;
  cpf: string;
  positions: {
    photo: { x: number; y: number; width: number; height: number };
    name: { x: number; y: number; fontSize: number; color: string };
    cpf: { x: number; y: number; fontSize: number; color: string };
  };
}

export function CardGeneratorModal({ isOpen, onClose, card, onCardGenerated }: CardGeneratorModalProps) {
  const [step, setStep] = useState<'upload' | 'generating' | 'preview'>('upload');
  const [photoUrl, setPhotoUrl] = useState<string | null>(card.profile_photo_url);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedCardUrl, setGeneratedCardUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (card.profile_photo_url) {
      setPhotoUrl(card.profile_photo_url);
      setStep('upload'); // Pode ir direto para gerar se já tem foto
    }
  }, [card]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      alert('Tipo de arquivo inválido. Use PNG ou JPG.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 2MB.');
      return;
    }

    try {
      setIsUploading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Sessão expirada. Faça login novamente.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/student-photo-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erro no upload');
      }

      const { url } = await response.json();
      setPhotoUrl(url);
      
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload da foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateCard = async () => {
    if (!photoUrl) {
      alert('Por favor, faça upload da sua foto primeiro');
      return;
    }

    try {
      setStep('generating');

      console.log('🎨 Iniciando geração da carteirinha...');
      console.log('📸 Photo URL:', photoUrl);
      console.log('📚 Course ID:', card.course_id);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Sessão expirada. Faça login novamente.');
        return;
      }

      // Buscar dados para gerar a carteirinha
      console.log('🔌 Chamando API /api/generate-card...');
      const response = await fetch('/api/generate-card', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId: card.course_id,
          profilePhotoUrl: photoUrl
        })
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Erro na API:', error);
        throw new Error(error.error || 'Erro ao gerar carteirinha');
      }

      const responseData = await response.json();
      console.log('📦 Dados recebidos:', responseData);

      const { data } = responseData;

      if (!data) {
        throw new Error('Dados não recebidos da API');
      }

      console.log('🖼️ Template URL:', data.templateUrl);
      console.log('📸 Profile Photo URL:', data.profilePhotoUrl);
      console.log('👤 Nome:', data.name);
      console.log('🆔 CPF:', data.cpf);
      console.log('📐 Posições:', data.positions);

      // Gerar carteirinha no canvas
      await generateCardOnCanvas(data);
      
      // Aguardar um pouco para garantir que o canvas foi desenhado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('✅ Mudando para preview');
      setStep('preview');

    } catch (error) {
      console.error('❌ Erro ao gerar carteirinha:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar carteirinha';
      alert(errorMessage);
      setStep('upload');
    }
  };

  const generateCardOnCanvas = async (data: CardGenerationData) => {
    console.log('🎨 Iniciando desenho no canvas...');
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('❌ Canvas não encontrado!');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ Contexto 2D não disponível!');
      return;
    }

    try {
      // Carregar template
      console.log('📥 Carregando template:', data.templateUrl);
      const templateImg = await loadImage(data.templateUrl);
      console.log('✅ Template carregado:', templateImg.width, 'x', templateImg.height);
      
      canvas.width = templateImg.width;
      canvas.height = templateImg.height;

      // Desenhar template
      ctx.drawImage(templateImg, 0, 0);
      console.log('✅ Template desenhado');

      // Desenhar foto do aluno
      console.log('📥 Carregando foto do aluno:', data.profilePhotoUrl);
      const photoImg = await loadImage(data.profilePhotoUrl);
      console.log('✅ Foto carregada:', photoImg.width, 'x', photoImg.height);
      
      ctx.drawImage(
        photoImg,
        data.positions.photo.x,
        data.positions.photo.y,
        data.positions.photo.width,
        data.positions.photo.height
      );
      console.log('✅ Foto desenhada na posição:', data.positions.photo);

      // Desenhar nome
      ctx.font = `${data.positions.name.fontSize}px Arial`;
      ctx.fillStyle = data.positions.name.color;
      ctx.fillText(data.name, data.positions.name.x, data.positions.name.y);
      console.log('✅ Nome desenhado:', data.name, 'na posição:', data.positions.name);

      // Desenhar CPF
      ctx.font = `${data.positions.cpf.fontSize}px Arial`;
      ctx.fillStyle = data.positions.cpf.color;
      ctx.fillText(data.cpf, data.positions.cpf.x, data.positions.cpf.y);
      console.log('✅ CPF desenhado:', data.cpf, 'na posição:', data.positions.cpf);

      console.log('🎨 Canvas desenhado completamente!');
      
      // Aguardar um frame para garantir que o canvas foi renderizado
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Converter para blob e salvar em background (não aguardar)
      console.log('💾 Convertendo canvas para blob em background...');
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('❌ Erro ao converter canvas para blob');
          return;
        }

        console.log('✅ Blob criado:', blob.size, 'bytes');

        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          console.log('✅ Base64 gerado, salvando no Supabase...');
          await saveGeneratedCard(base64data);
        };
        reader.readAsDataURL(blob);
      }, 'image/png');
      
    } catch (error) {
      console.error('❌ Erro no generateCardOnCanvas:', error);
      throw error;
    }
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const saveGeneratedCard = async (base64data: string) => {
    try {
      console.log('💾 Salvando carteirinha no Supabase...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/generate-card', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId: card.course_id,
          generatedCardBlob: base64data
        })
      });

      if (response.ok) {
        const { url } = await response.json();
        console.log('✅ Carteirinha salva:', url);
        setGeneratedCardUrl(url);
      } else {
        console.error('❌ Erro ao salvar:', await response.text());
      }
    } catch (error) {
      console.error('❌ Erro ao salvar carteirinha:', error);
    }
  };

  const handleDownload = async () => {
    if (!generatedCardUrl) {
      console.log('⚠️ URL da carteirinha não disponível, usando canvas...');
      // Fallback: baixar do canvas se não tiver URL
      if (canvasRef.current) {
        const link = document.createElement('a');
        link.download = `carteirinha-${card.courses.title.replace(/\s+/g, '-')}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
      }
      return;
    }

    try {
      console.log('⬇️ Baixando carteirinha de:', generatedCardUrl);
      
      // Buscar a imagem do Supabase
      const response = await fetch(generatedCardUrl);
      const blob = await response.blob();
      
      // Criar URL local do blob
      const url = window.URL.createObjectURL(blob);
      
      // Criar link de download
      const link = document.createElement('a');
      link.href = url;
      link.download = `carteirinha-${card.courses.title.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Download concluído');
    } catch (error) {
      console.error('❌ Erro ao baixar:', error);
      alert('Erro ao baixar a carteirinha. Tente novamente.');
    }
  };

  const handleFinish = () => {
    onCardGenerated();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white/10 backdrop-blur-sm border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-blue-200 text-xl">
            Emitir Carteirinha - {card.courses.title}
          </DialogTitle>
          <DialogDescription className="text-blue-300">
            {step === 'upload' && 'Faça upload da sua foto de perfil'}
            {step === 'generating' && 'Gerando sua carteirinha...'}
            {step === 'preview' && 'Sua carteirinha está pronta!'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Step 1: Upload de Foto */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-8 border-2 border-dashed border-white/20 text-center">
                {photoUrl ? (
                  <div className="space-y-4">
                    <div className="relative w-32 h-32 mx-auto">
                      <NextImage 
                        src={photoUrl} 
                        alt="Foto de perfil" 
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <p className="text-green-300">✓ Foto carregada</p>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="bg-white/10 hover:bg-white/20"
                    >
                      Trocar Foto
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-16 h-16 text-blue-300 mx-auto" />
                    <div>
                      <p className="text-blue-200 font-semibold mb-2">
                        Envie sua foto de perfil
                      </p>
                      <p className="text-blue-300 text-sm">
                        PNG ou JPG (máximo 2MB)
                      </p>
                    </div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Selecionar Foto
                        </>
                      )}
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-200 text-sm">
                  💡 <strong>Dica:</strong> Use uma foto nítida, com fundo neutro, similar a uma foto 3x4
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 bg-white/10 hover:bg-white/20"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleGenerateCard}
                  disabled={!photoUrl || isUploading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Gerar Carteirinha
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Gerando */}
          {step === 'generating' && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-blue-300 mx-auto mb-4 animate-spin" />
              <p className="text-blue-200 font-semibold">Gerando sua carteirinha...</p>
              <p className="text-blue-300 text-sm mt-2">Isso pode levar alguns segundos</p>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
             
              <div className="flex gap-3">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex-1 bg-white/10 hover:bg-white/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </Button>
                <Button
                  onClick={handleFinish}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Concluir
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Canvas único - visível apenas no preview */}
        <canvas 
          ref={canvasRef} 
          className={step === 'preview' ? 'max-w-full h-auto border border-white/20 rounded mx-auto' : 'hidden'}
          style={{ display: step === 'preview' ? 'block' : 'none' }}
        />
      </DialogContent>
    </Dialog>
  );
}
