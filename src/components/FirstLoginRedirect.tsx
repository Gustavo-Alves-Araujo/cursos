'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function FirstLoginRedirect() {
  const { user } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkFirstLogin = async () => {
      if (!user?.supabaseUser) {
        setIsChecking(false);
        return;
      }

      try {
        // Verificar metadados do usuário atual
        const needsPasswordReset = user.supabaseUser.user_metadata?.needs_password_reset;
        
        console.log('FirstLoginRedirect - Verificando:', {
          userId: user.id,
          needsPasswordReset,
          currentPath: window.location.pathname,
          userMetadata: user.supabaseUser.user_metadata
        });

        // Se precisa redefinir senha e não está na página de definir senha
        if (needsPasswordReset === true && window.location.pathname !== '/definir-senha') {
          console.log('FirstLoginRedirect - Redirecionando para /definir-senha');
          router.replace('/definir-senha');
          return;
        }
        
        // Se está na página de definir senha mas não precisa redefinir
        if (window.location.pathname === '/definir-senha' && needsPasswordReset !== true) {
          console.log('FirstLoginRedirect - Redirecionando para home');
          router.replace('/');
          return;
        }

      } catch (error) {
        console.error('Erro ao verificar primeiro login:', error);
      } finally {
        setIsChecking(false);
      }
    };

    // Aguardar um pouco para garantir que o usuário está carregado
    const timer = setTimeout(checkFirstLogin, 100);
    
    return () => clearTimeout(timer);
  }, [user, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2 text-white">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  return null;
}
