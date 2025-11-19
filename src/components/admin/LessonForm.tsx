"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lesson, LessonType, SupportMaterial } from "@/types/course";
import { FileUpload } from "@/components/FileUpload";
import { supabase } from "@/lib/supabase";

type FormState = {
  title: string;
  type: LessonType;
  content: {
    videoUrl?: string;
    documentUrl?: string;
    textContent?: string;
    additionalText?: string;
  };
  supportMaterials?: SupportMaterial[];
  order: number;
  isPublished: boolean;
};

interface LessonFormProps {
  onSubmit: (data: FormState) => Promise<void>;
  initialData?: Partial<Lesson>;
  isLoading?: boolean;
  moduleId: string;
  isEditing?: boolean;
}

export function LessonForm({ onSubmit, initialData, isLoading = false, moduleId, isEditing = false }: LessonFormProps) {
  const [state, setState] = useState<FormState>({
    title: initialData?.title ?? "",
    type: initialData?.type ?? "video",
    content: {
      videoUrl: initialData?.content?.videoUrl ?? "",
      documentUrl: initialData?.content?.documentUrl ?? "",
      textContent: initialData?.content?.textContent ?? "",
      additionalText: initialData?.content?.additionalText ?? ""
    },
    supportMaterials: initialData?.supportMaterials ?? [],
    order: initialData?.order ?? 1,
    isPublished: initialData?.isPublished ?? false
  });
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('LessonForm - handleSubmit chamado');
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setIsSubmitting(true);
    
    console.log('LessonForm - state atual:', state);
    
    if (!state.title.trim()) {
      console.log('LessonForm - erro: título obrigatório');
      console.log('LessonForm - title:', state.title);
      setError("Título da aula é obrigatório");
      setIsSubmitting(false);
      return;
    }

    // Validar conteúdo baseado no tipo
    if (state.type === "video" && !state.content.videoUrl?.trim()) {
      console.log('LessonForm - erro: URL do vídeo obrigatória');
      setError("URL do vídeo é obrigatória para aulas de vídeo");
      setIsSubmitting(false);
      return;
    }
    if (state.type === "document" && !state.content.documentUrl?.trim()) {
      console.log('LessonForm - erro: URL do documento obrigatória');
      setError("URL do documento é obrigatória para aulas de documento");
      setIsSubmitting(false);
      return;
    }
    if (state.type === "text" && !state.content.textContent?.trim()) {
      console.log('LessonForm - erro: conteúdo de texto obrigatório');
      setError("Conteúdo de texto é obrigatório para aulas de texto");
      setIsSubmitting(false);
      return;
    }

    console.log('LessonForm - validação passou, chamando onSubmit...');
    try {
      await onSubmit(state);
      console.log('LessonForm - onSubmit concluído com sucesso');
      // Limpar formulário após sucesso
      setState({
        title: "",
        type: "video",
        content: {},
        order: 1,
        isPublished: false
      });
    } catch (err) {
      console.error('LessonForm - erro no onSubmit:', err);
      setError(err instanceof Error ? err.message : "Erro ao salvar aula");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContentFields = () => {
    switch (state.type) {
      case "video":
        return (
          <div className="space-y-2">
            <Label htmlFor="videoUrl" className="text-blue-200">URL do Vídeo do YouTube *</Label>
            <Input 
              id="videoUrl" 
              value={state.content.videoUrl || ""} 
              onChange={(e) => setState({ 
                ...state, 
                content: { ...state.content, videoUrl: e.target.value }
              })} 
              placeholder="https://www.youtube.com/watch?v=..."
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <p className="text-sm text-blue-300">
              Cole a URL completa do vídeo do YouTube
            </p>
          </div>
        );
      case "document":
        return (
          <div className="space-y-2">
            <Label htmlFor="documentFile" className="text-blue-200">Arquivo do Documento *</Label>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-white/30 transition-colors bg-white/5">
              <input
                id="documentFile"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      // Validar tamanho do arquivo (50MB)
                      if (file.size > 50 * 1024 * 1024) {
                        alert('Arquivo muito grande. Máximo permitido: 50MB');
                        return;
                      }
                      
                      // Validar tipo de arquivo
                      const allowedTypes = [
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'text/plain'
                      ];
                      
                      if (!allowedTypes.includes(file.type)) {
                        alert('Tipo de arquivo inválido. Use PDF, DOC, DOCX ou TXT.');
                        return;
                      }

                      console.log('📤 Iniciando upload...');
                      console.log('📄 Arquivo:', file.name, file.type, file.size);

                      // Verificar autenticação
                      const { data: { session } } = await supabase.auth.getSession();
                      if (!session) {
                        alert('Sessão expirada. Faça login novamente.');
                        return;
                      }

                      // Gerar nome único para o arquivo
                      const fileExt = file.name.split('.').pop();
                      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                      const filePath = `documents/${fileName}`;

                      // ESTRATÉGIA: Gerar URL assinada e fazer upload direto (BYPASSA RLS!)
                      console.log('🔑 Gerando URL assinada (bypass RLS)...');
                      
                      // Passo 1: Gerar URL assinada via API (usa service_role)
                      const urlResponse = await fetch('/api/generate-upload-url', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${session.access_token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          fileName: file.name,
                          contentType: file.type
                        })
                      });

                      if (!urlResponse.ok) {
                        const errorData = await urlResponse.json();
                        throw new Error(errorData.error || 'Erro ao gerar URL de upload');
                      }

                      const { uploadUrl, publicUrl, token } = await urlResponse.json();
                      console.log('✅ URL assinada gerada');

                      // Passo 2: Upload direto para Supabase usando URL assinada
                      // Isso BYPASSA RLS porque a URL é assinada com service_role!
                      console.log('📤 Fazendo upload direto para Supabase (até 50MB)...');
                      
                      const uploadResponse = await fetch(uploadUrl, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': file.type,
                          'x-upsert': 'false'
                        },
                        body: file
                      });

                      if (!uploadResponse.ok) {
                        const errorText = await uploadResponse.text();
                        console.error('❌ Erro no upload:', errorText);
                        throw new Error(`Erro no upload: ${uploadResponse.status} - ${errorText}`);
                      }

                      console.log('✅ Upload direto concluído! (RLS bypassado com signed URL)');

                      console.log('🔗 URL pública:', publicUrl);
                      
                      setState({ 
                        ...state, 
                        content: { ...state.content, documentUrl: publicUrl }
                      });
                    } catch (error) {
                      console.error('❌ Erro no upload:', error);
                      alert('Erro ao fazer upload do arquivo: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
                    }
                  }
                }}
                className="hidden"
                required
              />
              <label htmlFor="documentFile" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-blue-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-blue-200 mb-2">
                    <span className="font-medium text-blue-400 hover:text-blue-300">Clique para selecionar</span> ou arraste o arquivo aqui
                  </p>
                  <p className="text-xs text-blue-300">
                    PDF, DOC, DOCX, TXT (máx. 50MB)
                  </p>
                </div>
              </label>
            </div>
            {state.content.documentUrl && (
              <div className="mt-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-300">Arquivo carregado com sucesso!</p>
                    <p className="text-xs text-green-400">{state.content.documentUrl.split('/').pop()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor="textContent" className="text-blue-200">Conteúdo da Aula *</Label>
            <Textarea 
              id="textContent" 
              rows={6} 
              value={state.content.textContent || ""} 
              onChange={(e) => setState({ 
                ...state, 
                content: { ...state.content, textContent: e.target.value }
              })} 
              placeholder="Digite o conteúdo da aula em HTML ou texto simples..."
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-sm"
            />
            <p className="text-sm text-blue-300">
              Você pode usar HTML para formatação (títulos, listas, links, etc.)
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full pb-24">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Layout em duas colunas para melhor organização */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        
        {/* Coluna 1 - Informações Básicas */}
        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg border border-white/10 p-4 space-y-3">
            <h3 className="text-base font-semibold text-white">Informações Básicas</h3>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-blue-200 text-sm">Título da Aula *</Label>
                <Input 
                  id="title" 
                  value={state.title} 
                  onChange={(e) => setState({ ...state, title: e.target.value })} 
                  placeholder="Ex: Introdução aos Componentes"
                  required 
                  className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-blue-200 text-sm">Tipo de Aula *</Label>
                <Select 
                  value={state.type} 
                  onValueChange={(value: LessonType) => setState({ ...state, type: value })}
                >
                  <SelectTrigger className="w-full bg-white/10 border-white/20 text-white text-sm">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Vídeo (YouTube)</SelectItem>
                    <SelectItem value="document">Documento</SelectItem>
                    <SelectItem value="text">Texto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="order" className="text-blue-200 text-sm">Ordem da Aula</Label>
                <Input 
                  id="order" 
                  type="number" 
                  min="1"
                  value={state.order} 
                  onChange={(e) => setState({ ...state, order: parseInt(e.target.value) || 1 })} 
                  placeholder="1"
                  className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg border border-white/10 p-4 space-y-3">
            <h3 className="text-base font-semibold text-white">Conteúdo da Aula</h3>
            {renderContentFields()}
          </div>
          
          <div className="bg-white/5 rounded-lg border border-white/10 p-4 space-y-3">
            <h3 className="text-base font-semibold text-white">Configurações</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublished"
                checked={state.isPublished}
                onCheckedChange={(checked) => setState({ ...state, isPublished: checked })}
              />
              <Label htmlFor="isPublished" className="text-blue-200 text-sm">Publicar aula</Label>
            </div>
          </div>
        </div>

        {/* Coluna 2 - Texto Adicional e Materiais */}
        <div className="space-y-4">
          {/* Texto Adicional */}
          <div className="bg-white/5 rounded-lg border border-white/10 p-4 space-y-3">
            <h3 className="text-base font-semibold text-white">Texto Adicional</h3>
            <div className="space-y-2">
              <Label htmlFor="additionalText" className="text-blue-200 text-sm">Informações Complementares</Label>
              <Textarea 
                id="additionalText" 
                rows={6} 
                value={state.content.additionalText || ""} 
                onChange={(e) => setState({ 
                  ...state, 
                  content: { ...state.content, additionalText: e.target.value }
                })} 
                placeholder="Digite informações adicionais sobre a aula (opcional)..."
                className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-sm"
              />
              <p className="text-xs text-blue-300">
                Este texto será exibido em todas as aulas, independentemente do tipo.
              </p>
            </div>
          </div>

          {/* Materiais de Apoio - Com altura máxima controlada */}
          <div className="bg-white/5 rounded-lg border border-white/10 p-4 space-y-3">
            <h3 className="text-base font-semibold text-white">Materiais de Apoio</h3>
            <div className="space-y-2">
              <Label className="text-blue-200 text-sm">Arquivos de Apoio</Label>
              <div className="max-h-[300px] overflow-y-auto pr-2">
                <FileUpload
                  lessonId={moduleId}
                  existingMaterials={state.supportMaterials || []}
                  onMaterialsChange={(materials) => setState({ ...state, supportMaterials: materials })}
                  maxFiles={10}
                  maxSize={50}
                />
              </div>
              <p className="text-xs text-blue-300">
                Faça upload de documentos, PDFs, planilhas e outros materiais.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação - Fixados no final */}
      <div className="flex gap-3 pt-6 border-t border-white/10 mt-6">
        <Button 
          type="submit" 
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
          disabled={isLoading || isSubmitting}
        >
          {isLoading || isSubmitting ? "Salvando..." : (isEditing ? "Atualizar Aula" : "Salvar Aula")}
        </Button>
        <Button 
          type="button" 
          variant="secondary" 
          className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl shadow-lg" 
          onClick={() => setState({
            title: "",
            type: "video",
            content: {},
            supportMaterials: [],
            order: 1,
            isPublished: false
          })}
          disabled={isLoading || isSubmitting}
        >
          Limpar
        </Button>
      </div>
    </form>
  );
}
