import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'student'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'admin' | 'student'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'student'
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string
          short_description: string
          thumbnail: string | null
          price: number
          instructor_id: string | null
          is_published: boolean
          total_lessons: number
          estimated_duration: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          short_description: string
          thumbnail?: string | null
          price?: number
          instructor_id?: string | null
          is_published?: boolean
          total_lessons?: number
          estimated_duration?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          short_description?: string
          thumbnail?: string | null
          price?: number
          instructor_id?: string | null
          is_published?: boolean
          total_lessons?: number
          estimated_duration?: string
          created_at?: string
          updated_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string
          order_index: number
          unlock_after_days: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description: string
          order_index: number
          unlock_after_days?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string
          order_index?: number
          unlock_after_days?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          description: string
          type: 'video' | 'document' | 'text'
          duration: string | null
          content: any
          order_index: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          description: string
          type: 'video' | 'document' | 'text'
          duration?: string | null
          content?: any
          order_index: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          description?: string
          type?: 'video' | 'document' | 'text'
          duration?: string | null
          content?: any
          order_index?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      course_enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          enrolled_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          enrolled_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          enrolled_at?: string
        }
      }
      course_progress: {
        Row: {
          id: string
          user_id: string
          course_id: string
          completed_lessons: any
          current_module_id: string | null
          completion_percentage: number
          last_accessed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          completed_lessons?: any
          current_module_id?: string | null
          completion_percentage?: number
          last_accessed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          completed_lessons?: any
          current_module_id?: string | null
          completion_percentage?: number
          last_accessed_at?: string
        }
      }
      certificate_templates: {
        Row: {
          id: string
          course_id: string
          background_image_url: string
          text_config: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          background_image_url: string
          text_config?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          background_image_url?: string
          text_config?: any
          created_at?: string
          updated_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          course_id: string
          template_id: string
          student_name: string
          completion_date: string
          certificate_url: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          template_id: string
          student_name: string
          completion_date: string
          certificate_url: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          template_id?: string
          student_name?: string
          completion_date?: string
          certificate_url?: string
          created_at?: string
        }
      }
    }
  }
}
