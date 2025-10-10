'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, CheckCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import Plyr from 'plyr';

interface VideoLessonProps {
  title: string;
  videoUrl: string;
  additionalText?: string;
  onComplete: () => void;
  isCompleted?: boolean;
}

export function VideoLesson({ title, videoUrl, additionalText, onComplete, isCompleted = false }: VideoLessonProps) {
  console.log('VideoLesson - props recebidas:', {
    title,
    videoUrl,
    isCompleted
  });

  const playerRef = useRef<HTMLDivElement>(null);
  const plyrRef = useRef<Plyr | null>(null);

  const handleComplete = () => {
    onComplete();
  };

  // Função para extrair o ID do vídeo do YouTube
  const getYouTubeVideoId = (url: string) => {
    let videoId = '';
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0] || '';
    }
    
    return videoId;
  };

  useEffect(() => {
    if (playerRef.current && videoUrl) {
      const videoId = getYouTubeVideoId(videoUrl);
      
      if (videoId) {
        // Limpar player anterior se existir
        if (plyrRef.current) {
          console.log('VideoLesson - destruindo player anterior');
          plyrRef.current.destroy();
          plyrRef.current = null;
        }

        // Limpar o conteúdo do container antes de criar novo player
        if (playerRef.current) {
          console.log('VideoLesson - limpando container HTML');
          playerRef.current.innerHTML = '';
        }

        // Aguardar um pouco para garantir que o DOM foi limpo
        setTimeout(() => {
          if (playerRef.current) {
            console.log('VideoLesson - criando novo player para:', videoId);
            
            // Criar um novo elemento div com o ID do vídeo
            const newPlayerElement = document.createElement('div');
            newPlayerElement.setAttribute('data-plyr-provider', 'youtube');
            newPlayerElement.setAttribute('data-plyr-embed-id', videoId);
            newPlayerElement.className = 'w-full h-full';
            
            // Substituir o conteúdo do container
            playerRef.current.appendChild(newPlayerElement);
            
            // Configurar o player com Plyr
            const player = new Plyr(newPlayerElement, {
              youtube: {
                noCookie: true,
                rel: 0,
                showinfo: 0,
                modestbranding: 1
              },
              controls: [
                'play-large',
                'play',
                'progress',
                'current-time',
                'mute',
                'volume',
                'fullscreen'
              ],
              ratio: '16:9'
            });

            plyrRef.current = player;
          }
        }, 100);
      }
    }

    // Cleanup
    return () => {
      console.log('VideoLesson - cleanup do useEffect');
      if (plyrRef.current) {
        plyrRef.current.destroy();
        plyrRef.current = null;
      }
      // Limpar o container também - capturar a referência atual
      const currentPlayerRef = playerRef.current;
      if (currentPlayerRef) {
        currentPlayerRef.innerHTML = '';
      }
    };
  }, [videoUrl]);

  return (
    <div className="space-y-6">
      {/* Player de Vídeo */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Play className="w-6 h-6 text-red-400" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Player Container */}
          <div className="player-container aspect-video">
            {videoUrl && getYouTubeVideoId(videoUrl) ? (
              <div 
                ref={playerRef}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="text-center">
                  <Play className="w-16 h-16 text-white mx-auto mb-4" />
                  <p className="text-white text-lg">URL do vídeo não encontrada</p>
                  <p className="text-gray-400 text-sm">Verifique se a URL foi configurada corretamente</p>
                </div>
              </div>
            )}
          </div>

          {/* Informações do Vídeo */}

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

          {/* Botão de Conclusão */}
          {!isCompleted && (
            <Button 
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Marcar como Concluída
            </Button>
          )}

          {isCompleted && (
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-blue-200">
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
