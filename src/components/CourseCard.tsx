"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BookOpen, Calendar } from "lucide-react";
import type { Course } from "@/types/course";
import { ExpirationTimer } from "./ExpirationTimer";

type Props = {
  course: Course;
  enrollmentDate?: string; // Data de matrícula do usuário
  isOwned?: boolean; // Se o usuário possui o curso
};

export function CourseCard({ course, enrollmentDate, isOwned = true }: Props) {
  const isClickable = isOwned && course.isPublished;
  const hasExternalLink = !isOwned && course.externalLink && course.externalLink.trim() !== '';

  // Função para validar se a URL é válida
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const cardContent = (
    <Card className={`overflow-hidden rounded-xl backdrop-blur-sm border transition-all duration-300 w-full max-w-48 h-96 ${
      isClickable || hasExternalLink
        ? 'bg-white/5 border-white/10 hover:bg-white/10 group-hover:border-white/20 group-hover:shadow-2xl group-hover:shadow-blue-500/10 cursor-pointer' 
        : 'bg-white/5 border-white/5 grayscale opacity-75 cursor-not-allowed'
    }`}>
        <CardHeader className="p-0">
          <div className="relative h-64 w-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center overflow-hidden">
            {course.thumbnail && isValidUrl(course.thumbnail) ? (
              <Image 
                src={course.thumbnail} 
                alt={course.title}
                width={192}
                height={256}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback para ícone se a imagem falhar
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`${course.thumbnail && isValidUrl(course.thumbnail) ? 'hidden' : ''} flex items-center justify-center w-full h-full`}>
              <BookOpen className="w-16 h-16 text-blue-300" />
            </div>
            {course.expirationDays && course.expirationDays > 0 && (
              <div className="absolute bottom-2 left-2">
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
        <CardContent className="pb-6 h-32 flex items-center justify-center">
          <h3 className="text-sm font-semibold text-white text-center line-clamp-3 leading-relaxed">{course.title}</h3>
        </CardContent>
    </Card>
  );

  return (
    <motion.div 
      whileHover={isClickable || hasExternalLink ? { y: -4, scale: 1.01 } : {}} 
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group"
    >
      {isClickable ? (
        <Link href={`/courses/${course.id}`} className="block">
          {cardContent}
        </Link>
      ) : hasExternalLink ? (
        <a href={course.externalLink} target="_blank" rel="noopener noreferrer" className="block">
          {cardContent}
        </a>
      ) : (
        cardContent
      )}
    </motion.div>
  );
}


