'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, CheckCircle } from 'lucide-react';

interface VideoLessonProps {
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  onComplete: () => void;
  isCompleted?: boolean;
}

export function VideoLesson({ title, description, videoUrl, duration, onComplete, isCompleted = false }: VideoLessonProps) {
  // Função para converter URL do YouTube para URL de embed
  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = '';
    
    // Extrair ID do vídeo de diferentes formatos de URL do YouTube
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0] || '';
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&controls=1&autoplay=0`;
    }
    
    return url; // Retorna URL original se não conseguir extrair o ID
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Player de Vídeo */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Play className="w-6 h-6 text-red-400" />
            {title}
          </CardTitle>
          <CardDescription className="text-blue-200">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Player Container */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
              <iframe
                src={getYouTubeEmbedUrl(videoUrl)}
                title={title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                frameBorder="0"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="text-center">
                  <Play className="w-16 h-16 text-white mx-auto mb-4" />
                  <p className="text-white text-lg">Player de Vídeo</p>
                  <p className="text-gray-400 text-sm">URL: {videoUrl}</p>
                </div>
              </div>
            )}
          </div>

          {/* Informações do Vídeo */}
          <div className="flex items-center justify-between text-sm text-blue-300">
            <span>Duração: {duration}</span>
            <span>YouTube</span>
          </div>

          {/* Botão de Conclusão */}
          {!isCompleted && (
            <Button 
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Marcar como Concluída
            </Button>
          )}

          {isCompleted && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-green-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Aula Concluída!</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
