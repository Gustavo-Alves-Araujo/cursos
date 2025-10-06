"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Course } from "@/types/course";

type FormState = {
  title: string;
  thumbnail: string;
  price: number;
  estimatedDuration: string;
  expirationDays: number;
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
    thumbnail: initialData?.thumbnail ?? "",
    price: initialData?.price ?? 0,
    estimatedDuration: initialData?.estimatedDuration ?? "0h 0min",
    expirationDays: initialData?.expirationDays ?? 0,
    isPublished: initialData?.isPublished ?? false
  });
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setIsSubmitting(true);
    
    console.log('AdminCourseForm - handleSubmit chamado');
    console.log('AdminCourseForm - dados do formulário:', state);
    
    if (!state.title.trim()) {
      setError("Preencha todos os campos obrigatórios");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('AdminCourseForm - enviando dados para onSubmit');
      await onSubmit(state);
      console.log('AdminCourseForm - dados enviados com sucesso');
      // Limpar formulário após sucesso (apenas se não estiver editando)
      if (!initialData) {
        setState({
          title: "",
          thumbnail: "",
          price: 0,
          estimatedDuration: "0h 0min",
          expirationDays: 0,
          isPublished: false
        });
      }
    } catch (err) {
      console.error('AdminCourseForm - erro ao enviar:', err);
      setError(err instanceof Error ? err.message : "Erro ao salvar curso");
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

      <div className="space-y-2">
        <Label htmlFor="expirationDays">Tempo de Expiração (dias)</Label>
        <Input 
          id="expirationDays" 
          type="number" 
          min="0"
          value={state.expirationDays} 
          onChange={(e) => setState({ ...state, expirationDays: parseInt(e.target.value) || 0 })} 
          placeholder="0 (sem expiração)"
        />
        <p className="text-sm text-gray-500">
          Quantos dias após a matrícula o acesso ao curso expira. Deixe em 0 para acesso permanente.
        </p>
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
          disabled={isLoading || isSubmitting}
        >
          {isLoading || isSubmitting ? "Salvando..." : "Salvar Curso"}
        </Button>
        <Button 
          type="button" 
          variant="secondary" 
          className="rounded-xl" 
          onClick={() => {
            console.log('Botão Limpar clicado');
            setState({
              title: "",
              thumbnail: "",
              price: 0,
              estimatedDuration: "0h 0min",
              expirationDays: 0,
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


