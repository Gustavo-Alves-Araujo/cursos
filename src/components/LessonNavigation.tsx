'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Lesson } from '@/types/course';

interface LessonNavigationProps {
  lessons: Lesson[];
  currentLesson: Lesson;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
}

export function LessonNavigation({ 
  lessons, 
  currentLesson, 
  onPrevious, 
  onNext, 
  onComplete 
}: LessonNavigationProps) {
  const currentIndex = lessons.findIndex(lesson => lesson.id === currentLesson.id);
  const previousLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  
  const completedLessons = lessons.filter(lesson => lesson.completed).length;
  const progressPercentage = (completedLessons / lessons.length) * 100;

  const handleComplete = () => {
    onComplete();
    
    // Verificar se todas as aulas foram concluídas
    const allLessonsCompleted = lessons.every(lesson => lesson.completed);
    
    if (allLessonsCompleted) {
      // Se todas as aulas estão concluídas, mostrar notificação e voltar para o curso
      setTimeout(() => {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        notification.innerHTML = `
          <div class="flex items-center gap-2">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
            <div>
              <div class="font-semibold">Parabéns! 🎉</div>
              <div class="text-sm">Você concluiu todas as aulas deste curso!</div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.classList.remove('translate-x-full');
        }, 100);
        
        // Após 3 segundos, fechar a notificação
        setTimeout(() => {
          notification.classList.add('translate-x-full');
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }, 3000);
      }, 500);
    } else {
      // Se ainda há aulas não concluídas, mostrar notificação normal
      const nextIncompleteLesson = lessons.slice(currentIndex + 1).find(lesson => !lesson.completed);
      if (nextIncompleteLesson) {
        setTimeout(() => {
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
          notification.innerHTML = `
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <span>Aula concluída! Próxima: ${nextIncompleteLesson.title}</span>
            </div>
          `;
          document.body.appendChild(notification);
          
          setTimeout(() => {
            notification.classList.remove('translate-x-full');
          }, 100);
          
          setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => document.body.removeChild(notification), 300);
          }, 3000);
        }, 500);
      }
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      {/* Header com Progresso */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">{currentIndex + 1}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Aula {currentIndex + 1} de {lessons.length}</h3>
            <p className="text-blue-200 text-sm">{Math.round(progressPercentage)}% do curso concluído</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{Math.round(progressPercentage)}%</div>
          <div className="text-xs text-blue-300">Progresso</div>
        </div>
      </div>
      
      {/* Barra de Progresso */}
      <div className="mb-6">
        <div className="w-full bg-white/20 rounded-full h-3">
          <div 
            className="h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-blue-300 mt-2">
          <span>{completedLessons} aulas concluídas</span>
          <span>{lessons.length - completedLessons} restantes</span>
        </div>
      </div>
      
      {/* Navegação e Ações */}
      <div className="flex flex-col gap-4">
        {/* Navegação entre aulas */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!previousLesson}
            className="flex-1 bg-white/10 hover:bg-white/20 border-white/20 text-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          
          <Button
            variant="outline"
            onClick={onNext}
            disabled={!nextLesson}
            className="flex-1 bg-white/10 hover:bg-white/20 border-white/20 text-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        
        {/* Botão de Conclusão */}
        <Button
          onClick={currentLesson.completed ? undefined : handleComplete}
          disabled={currentLesson.completed}
          className={`w-full px-6 py-3 transition-all duration-200 ${
            currentLesson.completed 
              ? 'bg-gray-600/30 text-gray-400 cursor-not-allowed border-gray-600/50' 
              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
          }`}
        >
          <CheckCircle className={`w-4 h-4 mr-2 ${currentLesson.completed ? 'text-gray-400' : ''}`} />
          {currentLesson.completed ? '✓ Concluída' : 'Marcar como Concluída'}
        </Button>
      </div>
      
      {/* Indicador de Próxima Aula */}
      {nextLesson && (
        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 text-sm text-blue-200">
            <span>Próxima aula:</span>
            <span className="font-medium text-white">{nextLesson.title}</span>
          </div>
        </div>
      )}
    </div>
  );
}
