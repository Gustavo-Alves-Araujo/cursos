'use client';

import { VideoLesson } from './VideoLesson';
import { DocumentLesson } from './DocumentLesson';
import { TextLesson } from './TextLesson';
import { Lesson } from '@/types/course';

interface LessonViewerProps {
  lesson: Lesson;
  lessons?: Lesson[];
  onComplete: () => void;
  onBack: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function LessonViewer({ lesson, onComplete }: LessonViewerProps) {
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
            onComplete={handleComplete}
            isCompleted={lesson.completed}
          />
        );
      
      case 'document':
        return (
          <DocumentLesson
            title={lesson.title}
            documentUrl={lesson.content.documentUrl || ''}
            onComplete={handleComplete}
            isCompleted={lesson.completed}
          />
        );
      
      case 'text':
        return (
          <TextLesson
            title={lesson.title}
            content={lesson.content.textContent || ''}
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
    </div>
  );
}
