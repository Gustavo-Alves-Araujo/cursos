'use client';

import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, TrendingUp, Award, Calendar } from 'lucide-react';

export function StudentBanner() {
  const { user } = useAuth();

  if (!user) return null;

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
                <p className="text-blue-200 text-base sm:text-lg">
                  Continue sua jornada de aprendizado
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2 text-blue-200">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm">Progresso: 75%</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm">Certificados: 3</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm">Último acesso: Hoje</span>
              </div>
            </div>
          </div>
          
          <div className="text-center lg:text-right">
            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">12</div>
            <div className="text-blue-200 text-sm">Cursos Concluídos</div>
            <div className="w-full sm:w-32 h-2 bg-white/20 rounded-full mt-3 mx-auto lg:mx-0">
              <div className="w-3/4 sm:w-24 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
