"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

type FormState = {
  title: string;
  shortDesc: string;
  longDesc: string;
  thumbnail: string;
  owned: boolean;
};

export function AdminCourseForm({ onSubmit }: { onSubmit: (data: FormState) => void }) {
  const [state, setState] = useState<FormState>({ title: "", shortDesc: "", longDesc: "", thumbnail: "", owned: false });
  const [fileName, setFileName] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.title || !state.shortDesc) return;
    onSubmit(state);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input id="title" value={state.title} onChange={(e) => setState({ ...state, title: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="short">Descrição curta</Label>
          <Input id="short" value={state.shortDesc} onChange={(e) => setState({ ...state, shortDesc: e.target.value })} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="long">Descrição longa</Label>
        <Textarea id="long" rows={5} value={state.longDesc} onChange={(e) => setState({ ...state, longDesc: e.target.value })} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="thumb">URL da thumbnail</Label>
          <Input id="thumb" value={state.thumbnail} onChange={(e) => setState({ ...state, thumbnail: e.target.value })} placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <Label>Upload de arquivo (frontend somente)</Label>
          <Card className="rounded-2xl border-dashed">
            <CardContent className="p-4">
              <input
                type="file"
                aria-label="Upload do curso"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
              />
              {fileName && <p className="mt-2 text-sm text-zinc-400">Selecionado: {fileName}</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="rounded-xl">Salvar</Button>
        <Button type="reset" variant="secondary" className="rounded-xl" onClick={() => setState({ title: "", shortDesc: "", longDesc: "", thumbnail: "", owned: false })}>Limpar</Button>
      </div>
    </form>
  );
}


