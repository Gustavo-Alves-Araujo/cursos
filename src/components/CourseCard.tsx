"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BookOpen, Play, Star, Clock, Calendar, Lock } from "lucide-react";
import type { Course } from "@/types/course";
import { ExpirationTimer } from "./ExpirationTimer";

type Props = {
  course: Course;
  enrollmentDate?: string; // Data de matrícula do usuário
  isOwned?: boolean; // Se o usuário possui o curso
};

export function CourseCard({ course, enrollmentDate, isOwned = true }: Props) {
  const isClickable = isOwned && course.isPublished;

  const cardContent = (
    <Card className={`overflow-hidden rounded-2xl backdrop-blur-sm border transition-all duration-300 ${
      isClickable 
        ? 'bg-white/5 border-white/10 hover:bg-white/10 group-hover:border-white/20 group-hover:shadow-2xl group-hover:shadow-blue-500/10 cursor-pointer' 
        : 'bg-white/5 border-white/5 grayscale opacity-75 cursor-not-allowed'
    }`}>
        <CardHeader className="p-0">
          <div className="relative h-48 w-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center overflow-hidden">
            {course.thumbnail ? (
              <Image 
                src={course.thumbnail} 
                alt={course.title}
                width={400}
                height={192}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback para ícone se a imagem falhar
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`${course.thumbnail ? 'hidden' : ''} flex items-center justify-center w-full h-full`}>
              <BookOpen className="w-16 h-16 text-blue-300" />
            </div>
            {isOwned && course.isPublished && (
              <Badge className="absolute left-3 top-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
                <Star className="w-3 h-3 mr-1" />
                Meu
              </Badge>
            )}
            {!isOwned && (
              <div className="absolute left-3 top-3 bg-black/50 backdrop-blur-sm rounded-full p-2">
                <Lock className="w-4 h-4 text-white" />
              </div>
            )}
            {course.estimatedDuration && (
              <div className="absolute bottom-3 right-3">
                <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                  <Clock className="w-3 h-3 text-white" />
                  <span className="text-white text-xs font-medium">{course.estimatedDuration}</span>
                </div>
              </div>
            )}
            {course.expirationDays && course.expirationDays > 0 && (
              <div className="absolute bottom-3 left-3">
                {enrollmentDate ? (
                  <ExpirationTimer 
                    enrolledAt={enrollmentDate} 
                    expirationDays={course.expirationDays}
                  />
                ) : (
                  <div className="flex items-center gap-1 bg-orange-500/80 backdrop-blur-sm rounded-full px-2 py-1">
                    <Calendar className="w-3 h-3 text-white" />
                    <span className="text-white text-xs font-medium">{course.expirationDays} dias</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 sm:p-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-300 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-white line-clamp-1">{course.title}</h3>
            </div>
            <p className="text-blue-200 text-xs sm:text-sm line-clamp-2 leading-relaxed">{course.shortDescription}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${
                isOwned 
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-200' 
                  : 'bg-gray-500/20 border-gray-500/50 text-gray-400'
              }`}
            >
              {isOwned ? (course.isPublished ? 'Disponível' : 'Rascunho') : 'Bloqueado'}
            </Badge>
            {isClickable && (
              <div className="flex items-center gap-1 text-blue-300 text-sm">
                <Play className="w-3 h-3" />
                <span>Clique para acessar</span>
              </div>
            )}
            {!isClickable && (
              <div className="flex items-center gap-1 text-gray-400 text-sm">
                <Lock className="w-3 h-3" />
                <span>Adquira na loja</span>
              </div>
            )}
          </div>
        </CardContent>
    </Card>
  );

  return (
    <motion.div 
      whileHover={isClickable ? { y: -4, scale: 1.01 } : {}} 
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group"
    >
      {isClickable ? (
        <Link href={`/courses/${course.id}`} className="block">
          {cardContent}
        </Link>
      ) : (
        cardContent
      )}
    </motion.div>
  );
}


