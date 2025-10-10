'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useMyCourses } from '@/hooks/useCourses';
import { useBannerSettings } from '@/hooks/useBannerSettings';
import { BookOpen, TrendingUp, Award, Calendar } from 'lucide-react';

export function StudentBanner() {
  const { user } = useAuth();
  const { myCourses } = useMyCourses();
  const { settings } = useBannerSettings();

  if (!user) return null;

  // Calcular estatísticas dinâmicas
  const completedCourses = myCourses.filter(course => 
    course.modules.every(module => 
      module.lessons.every(lesson => lesson.completed)
    )
  ).length;
  
  const totalLessons = myCourses.reduce((acc, course) => 
    acc + course.modules.reduce((moduleAcc, module) => 
      moduleAcc + module.lessons.length, 0
    ), 0
  );
  
  const completedLessons = myCourses.reduce((acc, course) => 
    acc + course.modules.reduce((moduleAcc, module) => 
      moduleAcc + module.lessons.filter(lesson => lesson.completed).length, 0
    ), 0
  );
  
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10 relative overflow-hidden">
      {/* Efeito de fundo sutil */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Bem-vindo, {user.name}!
                </h1>
                {settings?.welcome_message && (
                  <p className="text-blue-200 text-base sm:text-lg mt-1">
                    {settings.welcome_message}
                  </p>
                )}
                {!settings?.welcome_message && (
                  <p className="text-blue-200 text-base sm:text-lg">
                    Continue sua jornada de aprendizado
                  </p>
                )}
              </div>
            </div>
            
           
          </div>
          
        
        </div>
      </div>
    </div>
  );
}
