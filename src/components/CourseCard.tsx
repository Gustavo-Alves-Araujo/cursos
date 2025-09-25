"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BookOpen, Play, Star, Clock } from "lucide-react";
import type { Course } from "@/mocks/data";

type Props = {
  course: Course;
};

export function CourseCard({ course }: Props) {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }} 
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group"
    >
      <Card className="overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group-hover:border-white/20 group-hover:shadow-2xl group-hover:shadow-blue-500/10">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-blue-300" />
            {course.owned && (
              <Badge className="absolute left-3 top-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                <Star className="w-3 h-3 mr-1" />
                Meu
              </Badge>
            )}
            <div className="absolute bottom-3 right-3">
              <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                <Clock className="w-3 h-3 text-white" />
                <span className="text-white text-xs font-medium">45min</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 sm:p-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-300 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-white line-clamp-1">{course.title}</h3>
            </div>
            <p className="text-blue-200 text-xs sm:text-sm line-clamp-2 leading-relaxed">{course.shortDesc}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-blue-300 text-xs">4.8</span>
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                course.owned 
                  ? 'bg-green-500/20 border-green-500/50 text-green-200' 
                  : 'bg-blue-500/20 border-blue-500/50 text-blue-200'
              }`}
            >
              {course.owned ? 'Possuído' : 'Disponível'}
            </Badge>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              asChild 
              className={`flex-1 text-sm ${
                course.owned 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              }`}
            >
              <Link href={`/courses/${course.id}`} className="flex items-center gap-2">
                <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{course.owned ? 'Continuar' : 'Ver Curso'}</span>
                <span className="sm:hidden">{course.owned ? 'Continuar' : 'Ver'}</span>
              </Link>
            </Button>
            {!course.owned && (
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/10 hover:bg-white/20 border-white/20 text-blue-200 px-2 sm:px-3"
              >
                <Star className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


