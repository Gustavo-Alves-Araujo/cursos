'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';

interface VideoLessonProps {
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  onComplete: () => void;
}

export function VideoLesson({ title, description, videoUrl, duration, onComplete }: VideoLessonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleComplete = () => {
    setIsCompleted(true);
    onComplete();
  };

  const handleRestart = () => {
    setProgress(0);
    setIsCompleted(false);
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
                src={videoUrl}
                title={title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
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

          {/* Controles do Player */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayPause}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleMute}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestart}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-blue-200 text-sm">Duração: {duration}</span>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="space-y-2">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-blue-300">
              <span>{Math.round(progress)}% assistido</span>
              <span>{duration}</span>
            </div>
          </div>

          {/* Botão de Conclusão */}
          {!isCompleted && (
            <Button 
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Marcar como Concluída
            </Button>
          )}

          {isCompleted && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-green-200">
                <Play className="w-5 h-5" />
                <span className="font-medium">Aula Concluída!</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
