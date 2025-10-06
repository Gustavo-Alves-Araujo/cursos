"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Module } from "@/types/course";

type FormState = {
  title: string;
  description: string;
  order: number;
  unlockAfterDays: number;
  isPublished: boolean;
};

interface ModuleFormProps {
  onSubmit: (data: FormState) => Promise<void>;
  initialData?: Partial<Module>;
  isLoading?: boolean;
  courseId: string;
}

export function ModuleForm({ onSubmit, initialData, isLoading = false }: ModuleFormProps) {
  const [state, setState] = useState<FormState>({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    order: initialData?.order ?? 1,
    unlockAfterDays: initialData?.unlockAfterDays ?? 0,
    isPublished: initialData?.isPublished ?? false
  });
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setIsSubmitting(true);
    
    if (!state.title.trim() || !state.description.trim()) {
      setError("Preencha todos os campos obrigatórios");
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(state);
      // Limpar formulário após sucesso
      setState({
        title: "",
        description: "",
        order: 1,
        unlockAfterDays: 0,
        isPublished: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar módulo");
    } finally {
      setIsSubmitting(false);
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
        <Label htmlFor="title">Título do Módulo *</Label>
        <Input 
          id="title" 
          value={state.title} 
          onChange={(e) => setState({ ...state, title: e.target.value })} 
          placeholder="Ex: Fundamentos do React"
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição do Módulo *</Label>
        <Textarea 
          id="description" 
          rows={3} 
          value={state.description} 
          onChange={(e) => setState({ ...state, description: e.target.value })} 
          placeholder="Descreva o que será ensinado neste módulo..."
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="order">Ordem do Módulo</Label>
          <Input 
            id="order" 
            type="number" 
            min="1"
            value={state.order} 
            onChange={(e) => setState({ ...state, order: parseInt(e.target.value) || 1 })} 
            placeholder="1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unlockAfterDays">Liberar após (dias)</Label>
          <Input 
            id="unlockAfterDays" 
            type="number" 
            min="0"
            value={state.unlockAfterDays} 
            onChange={(e) => setState({ ...state, unlockAfterDays: parseInt(e.target.value) || 0 })} 
            placeholder="0"
          />
          <p className="text-sm text-gray-500">
            Quantos dias após a matrícula no curso este módulo será liberado
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isPublished"
          checked={state.isPublished}
          onCheckedChange={(checked) => setState({ ...state, isPublished: checked })}
        />
        <Label htmlFor="isPublished">Publicar módulo</Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          className="rounded-xl"
          disabled={isLoading || isSubmitting}
        >
          {isLoading || isSubmitting ? "Salvando..." : "Salvar Módulo"}
        </Button>
        <Button 
          type="button" 
          variant="secondary" 
          className="rounded-xl" 
          onClick={() => setState({
            title: "",
            description: "",
            order: 1,
            unlockAfterDays: 0,
            isPublished: false
          })}
        >
          Limpar
        </Button>
      </div>
    </form>
  );
}
