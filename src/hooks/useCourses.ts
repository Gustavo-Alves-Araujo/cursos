'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Course, Module, Lesson } from '@/types/course';
import { useAuth } from '@/contexts/AuthContext';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  console.log('useCourses - hook inicializado, user:', user);

  const fetchCourses = useCallback(async () => {
    try {
      console.log('fetchCourses - iniciando busca de cursos');
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          modules (
            *,
            lessons (*)
          )
        `)
        .order('created_at', { ascending: false });

      console.log('fetchCourses - resposta do Supabase:', { data, error });

      if (error) {
        console.error('fetchCourses - erro do Supabase:', error);
        throw error;
      }

      // Transformar dados do banco para o formato esperado
      const transformedCourses: Course[] = data?.map(course => {
        console.log('fetchCourses - curso do banco:', {
          id: course.id,
          title: course.title,
          thumbnail: course.thumbnail,
          thumbnailType: typeof course.thumbnail
        });
        
        return {
          id: course.id,
          title: course.title,
          shortDescription: course.short_description,
          thumbnail: course.thumbnail,
          price: course.price,
          instructorId: course.instructor_id || '',
          instructorName: 'Instrutor', // TODO: buscar nome do instrutor
          isPublished: course.is_published,
          totalLessons: course.total_lessons,
          estimatedDuration: course.estimated_duration,
          expirationDays: course.expiration_days || 0,
        modules: course.modules?.map((module: Record<string, unknown>) => ({
          id: module.id,
          courseId: module.course_id,
          title: module.title,
          description: module.description,
          order: module.order_index,
          unlockAfterDays: module.unlock_after_days,
          isPublished: module.is_published,
          lessons: Array.isArray(module.lessons) ? module.lessons.map((lesson: Record<string, unknown>) => {
            // Garantir que content seja um objeto
            let content = lesson.content;
            if (typeof content === 'string') {
              try {
                content = JSON.parse(content);
              } catch {
                content = {};
              }
            }
            
            return {
              id: lesson.id,
              moduleId: lesson.module_id,
              title: lesson.title,
              type: lesson.type,
              content: content || {},
              order: lesson.order_index,
              isPublished: lesson.is_published,
              created_at: lesson.created_at,
              updated_at: lesson.updated_at
            };
          }) : [],
          created_at: module.created_at,
          updated_at: module.updated_at
        })) || [],
        created_at: course.created_at,
        updated_at: course.updated_at
        };
      }) || [];

      console.log('fetchCourses - cursos transformados:', transformedCourses);
      setCourses(transformedCourses);
      console.log('fetchCourses - cursos definidos no estado');
    } catch (err) {
      console.error('fetchCourses - erro capturado:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar cursos');
    } finally {
      console.log('fetchCourses - finalizando, setIsLoading(false)');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('useCourses - useEffect chamado');
    fetchCourses();
  }, [fetchCourses]); // Include fetchCourses in dependencies

  const createCourse = useCallback(async (courseData: Omit<Course, 'id' | 'created_at' | 'updated_at' | 'modules' | 'totalLessons'>) => {
    try {
      console.log('createCourse - iniciando criação do curso');
      console.log('createCourse - dados recebidos:', courseData);
      console.log('createCourse - usuário:', user);
      
      if (!user) {
        console.error('createCourse - usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }

      const insertData: Record<string, unknown> = {
        title: courseData.title,
        short_description: courseData.shortDescription || '',
        thumbnail: courseData.thumbnail || null,
        price: courseData.price || 0,
        instructor_id: user.id,
        instructor_name: user.name || 'Instrutor',
        is_published: courseData.isPublished || false,
        estimated_duration: courseData.estimatedDuration || '0h 0min'
      };

      // Only add expiration_days if it's provided and not 0
      if (courseData.expirationDays && courseData.expirationDays > 0) {
        insertData.expiration_days = courseData.expirationDays;
      }

      console.log('createCourse - dados para inserção:', insertData);
      console.log('createCourse - thumbnail específico:', {
        original: courseData.thumbnail,
        processed: courseData.thumbnail || null,
        type: typeof courseData.thumbnail
      });

      const { data, error } = await supabase
        .from('courses')
        .insert(insertData)
        .select()
        .single();

      console.log('createCourse - resposta do Supabase:', { data, error });

      if (error) {
        console.error('createCourse - erro do Supabase:', error);
        throw error;
      }

      console.log('createCourse - curso criado com sucesso, recarregando lista...');
      await fetchCourses(); // Recarregar lista
      console.log('createCourse - lista recarregada');
      
      return data;
    } catch (err) {
      console.error('createCourse - erro capturado:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar curso';
      console.error('createCourse - mensagem de erro:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [user, fetchCourses]);

  const updateCourse = useCallback(async (courseId: string, updates: Partial<Course>) => {
    try {
      // Validar se o courseId existe
      if (!courseId) {
        throw new Error('ID do curso é obrigatório');
      }
      
      // Verificar se o usuário tem permissão de admin
      if (!user || user.role !== 'admin') {
        throw new Error('Apenas administradores podem editar cursos');
      }
      
      // Filtrar apenas campos que não são undefined
      const updateData: Record<string, unknown> = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.shortDescription !== undefined) updateData.short_description = updates.shortDescription;
      if (updates.thumbnail !== undefined) updateData.thumbnail = updates.thumbnail;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.isPublished !== undefined) updateData.is_published = updates.isPublished;
      if (updates.estimatedDuration !== undefined) updateData.estimated_duration = updates.estimatedDuration;
      if (updates.expirationDays !== undefined) updateData.expiration_days = updates.expirationDays;
      
      // Verificar se há dados para atualizar
      if (Object.keys(updateData).length === 0) {
        return;
      }
      
      const { data, error } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', courseId)
        .select()
        .single();

      if (error) {
        console.error('updateCourse - Supabase error:', error);
        throw error;
      }

      await fetchCourses(); // Recarregar lista
      return data;
    } catch (err) {
      console.error('updateCourse - catch error:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar curso');
    }
  }, [user, fetchCourses]);

  const deleteCourse = useCallback(async (courseId: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      await fetchCourses(); // Recarregar lista
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao deletar curso');
    }
  }, [fetchCourses]);

  const createModule = useCallback(async (courseId: string, moduleData: Omit<Module, 'id' | 'courseId' | 'created_at' | 'updated_at' | 'lessons'>) => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .insert({
          course_id: courseId,
          title: moduleData.title,
          description: moduleData.description,
          order_index: moduleData.order,
          unlock_after_days: moduleData.unlockAfterDays,
          is_published: moduleData.isPublished
        })
        .select()
        .single();

      if (error) throw error;

      await fetchCourses(); // Recarregar lista
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar módulo');
    }
  }, [fetchCourses]);

  const createLesson = useCallback(async (moduleId: string, lessonData: Omit<Lesson, 'id' | 'moduleId' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('createLesson - moduleId:', moduleId);
      console.log('createLesson - lessonData:', lessonData);
      
      const insertData = {
        module_id: moduleId,
        title: lessonData.title,
        type: lessonData.type,
        content: lessonData.content,
        order_index: lessonData.order,
        is_published: lessonData.isPublished
      };
      
      console.log('createLesson - insertData:', insertData);
      
      const { data, error } = await supabase
        .from('lessons')
        .insert(insertData)
        .select()
        .single();

      console.log('createLesson - response data:', data);
      console.log('createLesson - response error:', error);

      if (error) {
        console.error('createLesson - Supabase error:', error);
        throw error;
      }

      console.log('createLesson - chamando fetchCourses...');
      await fetchCourses(); // Recarregar lista
      console.log('createLesson - fetchCourses concluído');
      
      return data;
    } catch (err) {
      console.error('createLesson - catch error:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar aula');
    }
  }, [fetchCourses]);

  const updateModule = useCallback(async (moduleId: string, updates: Partial<Module>) => {
    try {
      const { error } = await supabase
        .from('modules')
        .update({
          title: updates.title,
          description: updates.description,
          order_index: updates.order,
          unlock_after_days: updates.unlockAfterDays,
          is_published: updates.isPublished
        })
        .eq('id', moduleId);

      if (error) throw error;

      await fetchCourses(); // Recarregar lista
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar módulo');
    }
  }, [fetchCourses]);

  const deleteModule = useCallback(async (moduleId: string) => {
    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;

      await fetchCourses(); // Recarregar lista
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao deletar módulo');
    }
  }, [fetchCourses]);

  const updateLesson = useCallback(async (lessonId: string, updates: Partial<Lesson>) => {
    try {
      console.log('updateLesson - lessonId:', lessonId);
      console.log('updateLesson - updates:', updates);
      
      const updateData = {
        title: updates.title,
        type: updates.type,
        content: updates.content,
        order_index: updates.order,
        is_published: updates.isPublished
      };
      
      console.log('updateLesson - updateData:', updateData);
      
      const { data, error } = await supabase
        .from('lessons')
        .update(updateData)
        .eq('id', lessonId)
        .select()
        .single();

      console.log('updateLesson - response data:', data);
      console.log('updateLesson - response error:', error);

      if (error) {
        console.error('updateLesson - Supabase error:', error);
        throw error;
      }

      console.log('updateLesson - chamando fetchCourses...');
      await fetchCourses(); // Recarregar lista
      console.log('updateLesson - fetchCourses concluído');
      
      return data;
    } catch (err) {
      console.error('updateLesson - catch error:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar aula');
    }
  }, [fetchCourses]);

  const deleteLesson = useCallback(async (lessonId: string) => {
    try {
      console.log('deleteLesson - lessonId:', lessonId);
      
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      console.log('deleteLesson - response error:', error);

      if (error) {
        console.error('deleteLesson - Supabase error:', error);
        throw error;
      }

      console.log('deleteLesson - chamando fetchCourses...');
      await fetchCourses(); // Recarregar lista
      console.log('deleteLesson - fetchCourses concluído');
    } catch (err) {
      console.error('deleteLesson - catch error:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao deletar aula');
    }
  }, [fetchCourses]);

  return {
    courses,
    isLoading,
    error,
    createCourse,
    updateCourse,
    deleteCourse,
    createModule,
    updateModule,
    deleteModule,
    createLesson,
    updateLesson,
    deleteLesson,
    refetch: fetchCourses
  };
}

export function useMyCourses() {
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchMyCourses = useCallback(async () => {
    if (!user) {
      setMyCourses([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('fetchMyCourses - buscando cursos para usuário:', user.id);

      // Buscar matrículas do usuário
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .eq('user_id', user.id);

      console.log('fetchMyCourses - matrículas encontradas:', enrollments);
      console.log('fetchMyCourses - erro nas matrículas:', enrollmentError);

      if (enrollmentError) throw enrollmentError;

      if (!enrollments || enrollments.length === 0) {
        console.log('fetchMyCourses - nenhuma matrícula encontrada');
        setMyCourses([]);
        setIsLoading(false);
        return;
      }

      const courseIds = enrollments.map(e => e.course_id);
      console.log('fetchMyCourses - IDs dos cursos:', courseIds);

      // Buscar cursos matriculados
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          modules (
            *,
            lessons (*)
          )
        `)
        .in('id', courseIds)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      console.log('fetchMyCourses - cursos encontrados:', courses);
      console.log('fetchMyCourses - erro nos cursos:', coursesError);

      if (coursesError) throw coursesError;

      // Buscar progresso do usuário
      const { data: progressData, error: progressError } = await supabase
        .from('lesson_progress')
        .select('lesson_id, course_id')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Transformar dados (mesmo processo do useCourses)
      const transformedCourses: Course[] = courses?.map(course => {
        // Encontrar progresso para este curso - agora usando lesson_progress
        const courseLessons = progressData?.filter(p => p.course_id === course.id) || [];
        const completedLessons = courseLessons.map(p => p.lesson_id);

        return {
          id: course.id,
          title: course.title,
          shortDescription: course.short_description,
          thumbnail: course.thumbnail,
          price: course.price,
          instructorId: course.instructor_id || '',
          instructorName: 'Instrutor',
          isPublished: course.is_published,
          totalLessons: course.total_lessons,
          estimatedDuration: course.estimated_duration,
          expirationDays: course.expiration_days || 0,
          modules: course.modules?.map((module: Record<string, unknown>) => ({
            id: module.id,
            courseId: module.course_id,
            title: module.title,
            description: module.description,
            order: module.order_index,
            unlockAfterDays: module.unlock_after_days,
            isPublished: module.is_published,
            lessons: Array.isArray(module.lessons) ? module.lessons.map((lesson: Record<string, unknown>) => {
              // Garantir que content seja um objeto
              let content = lesson.content;
              if (typeof content === 'string') {
                try {
                  content = JSON.parse(content);
                } catch {
                  content = {};
                }
              }
              
              return {
                id: lesson.id,
                moduleId: lesson.module_id,
                title: lesson.title,
                type: lesson.type,
                content: content || {},
                order: lesson.order_index,
                isPublished: lesson.is_published,
                completed: completedLessons.includes(lesson.id),
                created_at: lesson.created_at,
                updated_at: lesson.updated_at
              };
            }) : [],
            created_at: module.created_at,
            updated_at: module.updated_at
          })) || [],
          created_at: course.created_at,
          updated_at: course.updated_at
        };
      }) || [];

      setMyCourses(transformedCourses);
    } catch (error) {
      console.error('Erro ao carregar meus cursos:', error);
      setMyCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyCourses();
  }, [user]); // Only depend on user, not fetchMyCourses to avoid infinite loop

  const checkCourseAccess = useCallback(async (courseId: string) => {
    if (!user) return null;

    try {
      // Verificar se o usuário tem matrícula neste curso
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .single();

      if (enrollmentError && enrollmentError.code !== 'PGRST116') {
        throw enrollmentError;
      }

      if (!enrollment) {
        console.log('checkCourseAccess - usuário não tem matrícula no curso:', courseId);
        return null;
      }

      // Buscar o curso completo
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          modules (
            *,
            lessons (*)
          )
        `)
        .eq('id', courseId)
        .eq('is_published', true)
        .single();

      if (courseError) throw courseError;

      if (!course) {
        console.log('checkCourseAccess - curso não encontrado ou não publicado:', courseId);
        return null;
      }

      // Buscar progresso do usuário
      const { data: progressData, error: progressError } = await supabase
        .from('lesson_progress')
        .select('lesson_id, course_id')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Transformar dados
      const courseLessons = progressData?.filter(p => p.course_id === courseId) || [];
      const completedLessons = courseLessons.map(p => p.lesson_id);

      const transformedCourse: Course = {
        id: course.id,
        title: course.title,
        shortDescription: course.short_description,
        thumbnail: course.thumbnail,
        price: course.price,
        instructorId: course.instructor_id || '',
        instructorName: 'Instrutor',
        isPublished: course.is_published,
        totalLessons: course.total_lessons,
        estimatedDuration: course.estimated_duration,
        expirationDays: course.expiration_days,
        modules: course.modules?.map((module: Record<string, unknown>) => ({
          id: module.id,
          courseId: module.course_id,
          title: module.title,
          description: module.description,
          order: module.order_index,
          unlockAfterDays: module.unlock_after_days,
          isPublished: module.is_published,
          lessons: Array.isArray(module.lessons) ? module.lessons.map((lesson: Record<string, unknown>) => {
            // Garantir que content seja um objeto
            let content = lesson.content;
            if (typeof content === 'string') {
              try {
                content = JSON.parse(content);
              } catch {
                content = {};
              }
            }
            
            return {
              id: lesson.id,
              moduleId: lesson.module_id,
              title: lesson.title,
              type: lesson.type,
              content: content || {},
              order: lesson.order_index,
              isPublished: lesson.is_published,
              completed: completedLessons.includes(lesson.id),
              created_at: lesson.created_at,
              updated_at: lesson.updated_at
            };
          }) : [],
          created_at: module.created_at,
          updated_at: module.updated_at
        })) || [],
        created_at: course.created_at,
        updated_at: course.updated_at
      };

      console.log('checkCourseAccess - curso encontrado:', transformedCourse);
      return transformedCourse;
    } catch (error) {
      console.error('Erro ao verificar acesso ao curso:', error);
      return null;
    }
  }, [user]);

  const markLessonAsCompleted = useCallback(async (courseId: string, lessonId: string) => {
    if (!user) return;

    try {
      // Verificar se já existe um registro de progresso para esta aula específica
      const { data: existingProgress, error: fetchError } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!existingProgress) {
        // Criar novo registro de progresso para esta aula
        const { error: insertError } = await supabase
          .from('lesson_progress')
          .insert({
            course_id: courseId,
            user_id: user.id,
            lesson_id: lessonId,
            completed_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Erro ao inserir progresso:', insertError);
          throw insertError;
        }
      }

      // Não recarregar automaticamente para evitar problemas de estado
      // await fetchMyCourses();
    } catch (error) {
      console.error('Erro ao marcar aula como concluída:', error);
      throw error;
    }
  }, [user]);

  return {
    myCourses,
    isLoading,
    checkCourseAccess,
    markLessonAsCompleted,
    refetch: fetchMyCourses
  };
}
