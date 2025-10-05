import { User as SupabaseUser } from '@supabase/supabase-js'

export type UserRole = 'admin' | 'student';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type LoggedInUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  supabaseUser: SupabaseUser;
};

export type AuthContextType = {
  user: LoggedInUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
};
