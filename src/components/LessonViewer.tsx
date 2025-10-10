'use client';

import { VideoLesson } from './VideoLesson';
import { DocumentLesson } from './DocumentLesson';
import { TextLesson } from './TextLesson';
import { Lesson } from '@/types/course';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface LessonViewerProps {
  lesson: Lesson;
  lessons?: Lesson[];
  onComplete: () => void;
  onBack: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function LessonViewer({ lesson, lessons, onComplete, onPrevious, onNext }: LessonViewerProps) {
  console.log('LessonViewer - lesson recebida:', {
    id: lesson.id,
    title: lesson.title,
    type: lesson.type,
    videoUrl: lesson.content.videoUrl
  });

  const handleComplete = () => {
    console.log('LessonViewer: handleComplete chamado');
    console.log('LessonViewer: onComplete function:', onComplete);
    onComplete();
  };


  const renderLessonContent = () => {
    switch (lesson.type) {
      case 'video':
        return (
          <VideoLesson
            title={lesson.title}
            videoUrl={lesson.content.videoUrl || ''}
            additionalText={lesson.content.additionalText}
            onComplete={handleComplete}
            isCompleted={lesson.completed}
          />
        );
      
      case 'document':
        return (
          <DocumentLesson
            title={lesson.title}
            documentUrl={lesson.content.documentUrl || ''}
            additionalText={lesson.content.additionalText}
            onComplete={handleComplete}
            isCompleted={lesson.completed}
          />
        );
      
      case 'text':
        return (
          <TextLesson
            title={lesson.title}
            content={lesson.content.textContent || ''}
            additionalText={lesson.content.additionalText}
            onComplete={handleComplete}
            isCompleted={lesson.completed}
          />
        );
      
      default:
        return (
          <div className="text-center py-8">
            <p className="text-white">Tipo de aula não suportado</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderLessonContent()}
      
      {/* Navegação entre Aulas - Abaixo do botão "Marcar como Concluída" */}
      {lessons && onPrevious && onNext && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onPrevious}
              variant="outline"
              className="flex-1 bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Aula Anterior
            </Button>
            <Button
              onClick={onNext}
              variant="outline"
              className="flex-1 bg-white/10 hover:bg-white/20 border-white/20 text-blue-200"
            >
              Próxima Aula
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
