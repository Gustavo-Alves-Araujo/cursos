'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, CheckCircle, Bookmark, Share2 } from 'lucide-react';

interface TextLessonProps {
  title: string;
  content: string;
  additionalText?: string;
  onComplete: () => void;
  isCompleted?: boolean;
}

export function TextLesson({ title, content, additionalText, onComplete, isCompleted = false }: TextLessonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  const handleComplete = () => {
    onComplete();
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: title,
        url: window.location.href
      });
    } else {
      // Fallback para copiar link
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    setReadingProgress(Math.min(progress, 100));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-400" />
                {title}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBookmark}
                className={`${
                  isBookmarked 
                    ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200' 
                    : 'bg-white/10 hover:bg-white/20 border-white/20 text-blue-200'
                }`}
              >
                <Bookmark className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Barra de Progresso de Leitura */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-blue-300">
              <span>Progresso de Leitura</span>
              <span>{Math.round(readingProgress)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300"
                style={{ width: `${readingProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Conteúdo do Texto */}
          <div 
            className="prose prose-invert max-w-none"
            onScroll={handleScroll}
            style={{ maxHeight: '600px', overflowY: 'auto' }}
          >
            <div 
              className="text-white leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>

          {/* Texto Adicional */}
          {additionalText && (
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-3">Informações Adicionais</h4>
              <div 
                className="text-blue-200 leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: additionalText }}
              />
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3">
            {!isCompleted && (
              <Button 
                onClick={handleComplete}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar como Concluída
              </Button>
            )}

            {isCompleted && (
              <div className="flex-1 bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-blue-200">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Aula Concluída!</span>
                </div>
              </div>
            )}
          </div>

          {/* Dicas de Leitura */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-blue-200 font-semibold mb-2">Dicas para uma melhor leitura:</h4>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• Leia com calma e atenção</li>
              <li>• Use o bookmark para marcar pontos importantes</li>
              <li>• Faça anotações se necessário</li>
              <li>• Marque como concluída após a leitura completa</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
