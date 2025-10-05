"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lesson, LessonType } from "@/types/course";
import { supabase } from "@/lib/supabase";

type FormState = {
  title: string;
  type: LessonType;
  content: {
    videoUrl?: string;
    documentUrl?: string;
    textContent?: string;
  };
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

export function LessonForm({ onSubmit, initialData, isLoading = false, isEditing = false }: LessonFormProps) {
  const [state, setState] = useState<FormState>({
    title: initialData?.title ?? "",
    type: initialData?.type ?? "video",
    content: {
      videoUrl: initialData?.content?.videoUrl ?? "",
      documentUrl: initialData?.content?.documentUrl ?? "",
      textContent: initialData?.content?.textContent ?? ""
    },
    order: initialData?.order ?? 1,
    isPublished: initialData?.isPublished ?? false
  });
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('LessonForm - handleSubmit chamado');
    e.preventDefault();
    setError("");
    
    console.log('LessonForm - state atual:', state);
    
    if (!state.title) {
      console.log('LessonForm - erro: título obrigatório');
      console.log('LessonForm - title:', state.title);
      setError("Título da aula é obrigatório");
      return;
    }

    // Validar conteúdo baseado no tipo
    if (state.type === "video" && !state.content.videoUrl) {
      console.log('LessonForm - erro: URL do vídeo obrigatória');
      setError("URL do vídeo é obrigatória para aulas de vídeo");
      return;
    }
    if (state.type === "document" && !state.content.documentUrl) {
      console.log('LessonForm - erro: URL do documento obrigatória');
      setError("URL do documento é obrigatória para aulas de documento");
      return;
    }
    if (state.type === "text" && !state.content.textContent) {
      console.log('LessonForm - erro: conteúdo de texto obrigatório');
      setError("Conteúdo de texto é obrigatório para aulas de texto");
      return;
    }

    console.log('LessonForm - validação passou, chamando onSubmit...');
    try {
      await onSubmit(state);
      console.log('LessonForm - onSubmit concluído com sucesso');
    } catch (err) {
      console.error('LessonForm - erro no onSubmit:', err);
      setError(err instanceof Error ? err.message : "Erro ao salvar aula");
    }
  };

  const renderContentFields = () => {
    switch (state.type) {
      case "video":
        return (
          <div className="space-y-2">
            <Label htmlFor="videoUrl">URL do Vídeo do YouTube *</Label>
            <Input 
              id="videoUrl" 
              value={state.content.videoUrl || ""} 
              onChange={(e) => setState({ 
                ...state, 
                content: { ...state.content, videoUrl: e.target.value }
              })} 
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
            <p className="text-sm text-gray-500">
              Cole a URL completa do vídeo do YouTube
            </p>
          </div>
        );
      case "document":
        return (
          <div className="space-y-2">
            <Label htmlFor="documentFile">Arquivo do Documento *</Label>
            <Input 
              id="documentFile" 
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    // Upload real para Supabase Storage
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                    const filePath = `documents/${fileName}`;
                    
                    const { data, error } = await supabase.storage
                      .from('course-documents')
                      .upload(filePath, file);
                    
                    if (error) {
                      console.error('Erro no upload:', error);
                      alert('Erro ao fazer upload do arquivo');
                      return;
                    }
                    
                    // Obter URL pública do arquivo
                    const { data: { publicUrl } } = supabase.storage
                      .from('course-documents')
                      .getPublicUrl(filePath);
                    
                    setState({ 
                      ...state, 
                      content: { ...state.content, documentUrl: publicUrl }
                    });
                  } catch (error) {
                    console.error('Erro no upload:', error);
                    alert('Erro ao fazer upload do arquivo');
                  }
                }
              }}
              required
            />
            <p className="text-sm text-gray-500">
              Selecione um arquivo PDF, DOC, DOCX ou TXT (máx. 10MB)
            </p>
            {state.content.documentUrl && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                ✓ Arquivo carregado: {state.content.documentUrl.split('/').pop()}
              </div>
            )}
          </div>
        );
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor="textContent">Conteúdo da Aula *</Label>
            <Textarea 
              id="textContent" 
              rows={10} 
              value={state.content.textContent || ""} 
              onChange={(e) => setState({ 
                ...state, 
                content: { ...state.content, textContent: e.target.value }
              })} 
              placeholder="Digite o conteúdo da aula em HTML ou texto simples..."
              required
            />
            <p className="text-sm text-gray-500">
              Você pode usar HTML para formatação (títulos, listas, links, etc.)
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Título da Aula *</Label>
        <Input 
          id="title" 
          value={state.title} 
          onChange={(e) => setState({ ...state, title: e.target.value })} 
          placeholder="Ex: Introdução aos Componentes"
          required 
        />
      </div>


      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Aula *</Label>
          <Select 
            value={state.type} 
            onValueChange={(value: LessonType) => setState({ ...state, type: value })}
          >
            <SelectTrigger>
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
          <Label htmlFor="order">Ordem da Aula</Label>
          <Input 
            id="order" 
            type="number" 
            min="1"
            value={state.order} 
            onChange={(e) => setState({ ...state, order: parseInt(e.target.value) || 1 })} 
            placeholder="1"
          />
        </div>
      </div>


      {renderContentFields()}

      <div className="flex items-center space-x-2">
        <Switch
          id="isPublished"
          checked={state.isPublished}
          onCheckedChange={(checked) => setState({ ...state, isPublished: checked })}
        />
        <Label htmlFor="isPublished">Publicar aula</Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          className="rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? "Salvando..." : (isEditing ? "Atualizar Aula" : "Salvar Aula")}
        </Button>
        <Button 
          type="button" 
          variant="secondary" 
          className="rounded-xl" 
          onClick={() => setState({
            title: "",
            type: "video",
            content: {},
            order: 1,
            isPublished: false
          })}
        >
          Limpar
        </Button>
      </div>
    </form>
  );
}
