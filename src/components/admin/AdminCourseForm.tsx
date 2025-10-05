"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Course } from "@/types/course";

type FormState = {
  title: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  price: number;
  estimatedDuration: string;
  isPublished: boolean;
};

interface AdminCourseFormProps {
  onSubmit: (data: FormState) => Promise<void>;
  initialData?: Partial<Course>;
  isLoading?: boolean;
}

export function AdminCourseForm({ onSubmit, initialData, isLoading = false }: AdminCourseFormProps) {
  const [state, setState] = useState<FormState>({
    title: initialData?.title ?? "",
    shortDescription: initialData?.shortDescription ?? "",
    description: initialData?.description ?? "",
    thumbnail: initialData?.thumbnail ?? "",
    price: initialData?.price ?? 0,
    estimatedDuration: initialData?.estimatedDuration ?? "0h 0min",
    isPublished: initialData?.isPublished ?? false
  });
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    console.log('AdminCourseForm - dados do formulário:', state);
    
    if (!state.title || !state.shortDescription || !state.description) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      console.log('AdminCourseForm - enviando dados para onSubmit');
      await onSubmit(state);
      console.log('AdminCourseForm - dados enviados com sucesso');
    } catch (err) {
      console.error('AdminCourseForm - erro ao enviar:', err);
      setError(err instanceof Error ? err.message : "Erro ao salvar curso");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="font-semibold text-green-800">Status do Formulário:</h4>
        <p className="text-sm text-green-600">
          Título: {state.title || 'Vazio'} | 
          Descrição: {state.shortDescription || 'Vazio'} | 
          Preço: R$ {state.price} | 
          Publicado: {state.isPublished ? 'Sim' : 'Não'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Título do Curso *</Label>
          <Input 
            id="title" 
            value={state.title} 
            onChange={(e) => {
              console.log('Título alterado para:', e.target.value);
              setState({ ...state, title: e.target.value });
            }} 
            placeholder="Ex: React do Zero ao Profissional"
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input 
            id="price" 
            type="number" 
            step="0.01"
            min="0"
            value={state.price} 
            onChange={(e) => {
              console.log('Preço alterado para:', e.target.value);
              setState({ ...state, price: parseFloat(e.target.value) || 0 });
            }} 
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDescription">Descrição Curta *</Label>
        <Input 
          id="shortDescription" 
          value={state.shortDescription} 
          onChange={(e) => {
            console.log('Descrição curta alterada para:', e.target.value);
            setState({ ...state, shortDescription: e.target.value });
          }} 
          placeholder="Uma breve descrição do curso"
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição Completa *</Label>
        <Textarea 
          id="description" 
          rows={5} 
          value={state.description} 
          onChange={(e) => {
            console.log('Descrição completa alterada para:', e.target.value);
            setState({ ...state, description: e.target.value });
          }} 
          placeholder="Descreva detalhadamente o que os alunos aprenderão neste curso..."
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="thumbnail">URL da Thumbnail</Label>
          <Input 
            id="thumbnail" 
            value={state.thumbnail} 
            onChange={(e) => {
              console.log('Thumbnail alterada para:', e.target.value);
              setState({ ...state, thumbnail: e.target.value });
            }} 
            placeholder="https://exemplo.com/imagem.jpg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duração Estimada</Label>
          <Input 
            id="duration" 
            value={state.estimatedDuration} 
            onChange={(e) => setState({ ...state, estimatedDuration: e.target.value })} 
            placeholder="Ex: 2h 30min"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isPublished"
          checked={state.isPublished}
          onCheckedChange={(checked) => setState({ ...state, isPublished: checked })}
        />
        <Label htmlFor="isPublished">Publicar curso</Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          className="rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? "Salvando..." : "Salvar Curso"}
        </Button>
        <Button 
          type="button" 
          variant="secondary" 
          className="rounded-xl" 
          onClick={() => {
            console.log('Botão Limpar clicado');
            setState({
              title: "",
              shortDescription: "",
              description: "",
              thumbnail: "",
              price: 0,
              estimatedDuration: "0h 0min",
              isPublished: false
            });
          }}
        >
          Limpar
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="rounded-xl" 
          onClick={() => {
            console.log('Teste de envio manual:', state);
            alert(`Dados atuais: ${JSON.stringify(state, null, 2)}`);
          }}
        >
          Teste Manual
        </Button>
      </div>
    </form>
  );
}


