import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShowcaseWithCourses, Course } from '@/types/course';
import { useAuth } from '@/contexts/AuthContext';

// Tipo para o curso retornado pelo Supabase
type SupabaseCourse = {
  id: string;
  title: string;
  shortDescription: string;
  thumbnail?: string;
  price: number;
  instructorId: string;
  instructorName: string;
  isPublished: boolean;
  expirationDays?: number;
  created_at: string;
  updated_at: string;
};

export function useShowcases() {
  const [showcases, setShowcases] = useState<ShowcaseWithCourses[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchShowcases = useCallback(async () => {
    try {
      setIsLoading(true);

      // Buscar todas as vitrines
      const { data: showcasesData, error: showcasesError } = await supabase
        .from('showcases')
        .select('*')
        .order('created_at', { ascending: false });

      if (showcasesError) throw showcasesError;

      if (!showcasesData || showcasesData.length === 0) {
        setShowcases([]);
        return;
      }

      // Para cada vitrine, buscar os cursos associados
      const showcasesWithCourses = await Promise.all(
        showcasesData.map(async (showcase) => {
          const { data: showcaseCoursesData, error: showcaseCoursesError } = await supabase
            .from('showcase_courses')
            .select(`
              course_id,
              position,
              courses (*)
            `)
            .eq('showcase_id', showcase.id)
            .order('position', { ascending: true });

          if (showcaseCoursesError) {
            console.error('Erro ao buscar cursos da vitrine:', showcaseCoursesError);
            return {
              ...showcase,
              courses: []
            };
          }

          // Extrair os cursos e adicionar módulos
          const coursesWithModules = await Promise.all(
            (showcaseCoursesData || []).map(async (sc: { course_id: string; position: number; courses: SupabaseCourse[] }) => {
              const course = sc.courses[0]; // Supabase retorna array
              if (!course) return null;

              // Buscar módulos e lições do curso
              const { data: modulesData, error: modulesError } = await supabase
                .from('modules')
                .select(`
                  *,
                  lessons (*)
                `)
                .eq('course_id', course.id)
                .order('order', { ascending: true });

              if (modulesError) {
                console.error('Erro ao buscar módulos:', modulesError);
                return {
                  ...course,
                  modules: []
                };
              }

              return {
                ...course,
                modules: modulesData || []
              };
            })
          );

          return {
            ...showcase,
            courses: coursesWithModules.filter(c => c !== null) as Course[]
          };
        })
      );

      setShowcases(showcasesWithCourses);
    } catch (error) {
      console.error('Erro ao buscar vitrines:', error);
      setShowcases([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchShowcases();
    }
  }, [user, fetchShowcases]);

  const createShowcase = useCallback(async (name: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('showcases')
        .insert({
          name,
          description,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      await fetchShowcases();
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao criar vitrine:', error);
      return { data: null, error };
    }
  }, [fetchShowcases]);

  const updateShowcase = useCallback(async (
    id: string,
    updates: { name?: string; description?: string; is_active?: boolean }
  ) => {
    try {
      const { data, error } = await supabase
        .from('showcases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchShowcases();
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar vitrine:', error);
      return { data: null, error };
    }
  }, [fetchShowcases]);

  const deleteShowcase = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('showcases')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchShowcases();
      return { error: null };
    } catch (error) {
      console.error('Erro ao deletar vitrine:', error);
      return { error };
    }
  }, [fetchShowcases]);

  const addCourseToShowcase = useCallback(async (
    showcaseId: string,
    courseId: string,
    position?: number
  ) => {
    try {
      // Se não foi especificada uma posição, colocar no final
      if (position === undefined) {
        const { data: existingCourses } = await supabase
          .from('showcase_courses')
          .select('position')
          .eq('showcase_id', showcaseId)
          .order('position', { ascending: false })
          .limit(1);

        position = existingCourses && existingCourses.length > 0
          ? existingCourses[0].position + 1
          : 0;
      }

      const { data, error } = await supabase
        .from('showcase_courses')
        .insert({
          showcase_id: showcaseId,
          course_id: courseId,
          position
        })
        .select()
        .single();

      if (error) throw error;

      await fetchShowcases();
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao adicionar curso à vitrine:', error);
      return { data: null, error };
    }
  }, [fetchShowcases]);

  const removeCourseFromShowcase = useCallback(async (
    showcaseId: string,
    courseId: string
  ) => {
    try {
      const { error } = await supabase
        .from('showcase_courses')
        .delete()
        .eq('showcase_id', showcaseId)
        .eq('course_id', courseId);

      if (error) throw error;

      await fetchShowcases();
      return { error: null };
    } catch (error) {
      console.error('Erro ao remover curso da vitrine:', error);
      return { error };
    }
  }, [fetchShowcases]);

  const reorderShowcaseCourses = useCallback(async (
    showcaseId: string,
    courseOrders: { courseId: string; position: number }[]
  ) => {
    try {
      // Atualizar posições em lote
      const updates = courseOrders.map(({ courseId, position }) =>
        supabase
          .from('showcase_courses')
          .update({ position })
          .eq('showcase_id', showcaseId)
          .eq('course_id', courseId)
      );

      await Promise.all(updates);

      await fetchShowcases();
      return { error: null };
    } catch (error) {
      console.error('Erro ao reordenar cursos da vitrine:', error);
      return { error };
    }
  }, [fetchShowcases]);

  return {
    showcases,
    isLoading,
    refetch: fetchShowcases,
    createShowcase,
    updateShowcase,
    deleteShowcase,
    addCourseToShowcase,
    removeCourseFromShowcase,
    reorderShowcaseCourses
  };
}

export function useShowcase(id: string) {
  const [showcase, setShowcase] = useState<ShowcaseWithCourses | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchShowcase = useCallback(async () => {
    try {
      setIsLoading(true);

      // Buscar a vitrine
      const { data: showcaseData, error: showcaseError } = await supabase
        .from('showcases')
        .select('*')
        .eq('id', id)
        .single();

      if (showcaseError) throw showcaseError;

      if (!showcaseData) {
        setShowcase(null);
        return;
      }

      // Buscar os cursos associados
      const { data: showcaseCoursesData, error: showcaseCoursesError } = await supabase
        .from('showcase_courses')
        .select(`
          course_id,
          position,
          courses (*)
        `)
        .eq('showcase_id', id)
        .order('position', { ascending: true });

      if (showcaseCoursesError) throw showcaseCoursesError;

      // Extrair os cursos e adicionar módulos
      const coursesWithModules = await Promise.all(
        (showcaseCoursesData || []).map(async (sc: { course_id: string; position: number; courses: SupabaseCourse[] }) => {
          const course = sc.courses[0]; // Supabase retorna array
          if (!course) return null;

          // Buscar módulos e lições do curso
          const { data: modulesData, error: modulesError } = await supabase
            .from('modules')
            .select(`
              *,
              lessons (*)
            `)
            .eq('course_id', course.id)
            .order('order', { ascending: true });

          if (modulesError) {
            console.error('Erro ao buscar módulos:', modulesError);
            return {
              ...course,
              modules: []
            };
          }

          return {
            ...course,
            modules: modulesData || []
          };
        })
      );

      setShowcase({
        ...showcaseData,
        courses: coursesWithModules.filter(c => c !== null) as Course[]
      });
    } catch (error) {
      console.error('Erro ao buscar vitrine:', error);
      setShowcase(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchShowcase();
    }
  }, [id, fetchShowcase]);

  return {
    showcase,
    isLoading,
    refetch: fetchShowcase
  };
}

