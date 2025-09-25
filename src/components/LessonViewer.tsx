'use client';

import { VideoLesson } from './VideoLesson';
import { DocumentLesson } from './DocumentLesson';
import { TextLesson } from './TextLesson';
import { Lesson } from '@/mocks/data';

interface LessonViewerProps {
  lesson: Lesson;
  onComplete: () => void;
  onBack: () => void;
}

export function LessonViewer({ lesson, onComplete, onBack }: LessonViewerProps) {
  const handleComplete = () => {
    onComplete();
  };

  const renderLessonContent = () => {
    switch (lesson.type) {
      case 'video':
        return (
          <VideoLesson
            title={lesson.title}
            description={lesson.description}
            videoUrl={lesson.content.videoUrl || ''}
            duration={lesson.duration || '0:00'}
            onComplete={handleComplete}
          />
        );
      
      case 'document':
        return (
          <DocumentLesson
            title={lesson.title}
            description={lesson.description}
            documentUrl={lesson.content.documentUrl || ''}
            onComplete={handleComplete}
          />
        );
      
      case 'text':
        return (
          <TextLesson
            title={lesson.title}
            description={lesson.description}
            content={lesson.content.textContent || ''}
            onComplete={handleComplete}
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
