'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { LoggedInUser, AuthContextType } from '@/types/auth';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const isInitializing = useRef(false);
  const lastProcessedUserId = useRef<string | null>(null);

  console.log('AuthProvider - estado atual:', { user, isLoading, hasInitialized });

  useEffect(() => {
    let isMounted = true;

    // A verificação inicial será feita pelo onAuthStateChange com INITIAL_SESSION

    // Escutar mudanças na autenticação - callback síncrono para evitar deadlock
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (!isMounted) return;
        
        // Tratar cada evento específico conforme documentação
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoading(false);
          setHasInitialized(true);
        } else if (event === 'SIGNED_IN') {
          // Processar SIGNED_IN apenas se o usuário mudou e não está sendo inicializado
          if (session?.user && !isInitializing.current && lastProcessedUserId.current !== session.user.id) {
            console.log('Processing SIGNED_IN event for user:', session.user.id);
            isInitializing.current = true;
            lastProcessedUserId.current = session.user.id;
            
            setTimeout(async () => {
              if (isMounted) {
                await loadUserProfile(session.user);
                setIsLoading(false);
                setHasInitialized(true);
                isInitializing.current = false;
              }
            }, 0);
          } else {
            console.log('Ignoring SIGNED_IN - already processing or same user');
          }
        } else if (event === 'TOKEN_REFRESHED') {
          // Não fazer nada no TOKEN_REFRESHED para evitar recarregamentos desnecessários
          // Este evento pode ser disparado frequentemente e não deve causar refresh da página
          console.log('Token refreshed, but not reloading user data to prevent page refresh');
          return; // Sair imediatamente para evitar qualquer processamento
        } else if (event === 'INITIAL_SESSION') {
          if (session?.user && !isInitializing.current) {
            console.log('Processing INITIAL_SESSION for user:', session.user.id);
            isInitializing.current = true;
            lastProcessedUserId.current = session.user.id;
            
            setTimeout(async () => {
              if (isMounted) {
                await loadUserProfile(session.user);
                setIsLoading(false);
                setHasInitialized(true);
                isInitializing.current = false;
              }
            }, 0);
          } else {
            setIsLoading(false);
            setHasInitialized(true);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('AuthContext - Carregando perfil do usuário:', supabaseUser.id);
      console.log('AuthContext - User metadata:', supabaseUser.user_metadata);
      
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Erro ao carregar perfil do usuário:', error);
        return;
      }

      if (userProfile) {
        setUser({
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          role: userProfile.role,
          cpf: userProfile.cpf,
          supabaseUser
        });
        
        console.log('AuthContext - Perfil carregado:', userProfile);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; needsPasswordReset?: boolean }> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user);
        
        // Como agora todos os usuários vêm com senha padrão "123123",
        // não precisamos mais verificar needs_password_reset
        return { 
          success: true
        };
      }

      return { success: false, error: 'Erro desconhecido' };
    } catch (error: unknown) {
      console.error('Erro no login:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro de conexão';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Criar perfil do usuário na tabela users
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name,
            role: 'student' // Por padrão, novos usuários são estudantes
          });

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
          return { success: false, error: 'Erro ao criar perfil do usuário' };
        }

        await loadUserProfile(data.user);
        return { success: true };
      }

      return { success: false, error: 'Erro desconhecido' };
    } catch (error: unknown) {
      console.error('Erro no registro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro de conexão';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha-simples`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar email de reset:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao enviar email de reset' 
      };
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        await loadUserProfile(supabaseUser);
      }
    } catch (error) {
      console.error('Erro ao recarregar usuário:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, resetPassword, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
