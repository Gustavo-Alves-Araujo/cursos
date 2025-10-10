import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function usePasswordReset() {
  const { user } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkPasswordReset = async () => {
      if (!user?.supabaseUser) return;

      setIsChecking(true);
      
      try {
        // Verificar metadados do usuário
        const needsPasswordReset = user.supabaseUser.user_metadata?.needs_password_reset;
        
        console.log('usePasswordReset - Verificando:', {
          userId: user.id,
          needsPasswordReset,
          currentPath: window.location.pathname
        });

        // Se precisa redefinir senha e não está na página de definir senha
        if (needsPasswordReset === true && window.location.pathname !== '/definir-senha') {
          console.log('usePasswordReset - Redirecionando para /definir-senha');
          router.push('/definir-senha');
        }
        
        // Se está na página de definir senha mas não precisa redefinir
        if (window.location.pathname === '/definir-senha' && needsPasswordReset !== true) {
          console.log('usePasswordReset - Redirecionando para home');
          router.push('/');
        }
        
      } catch (error) {
        console.error('Erro ao verificar reset de senha:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkPasswordReset();
  }, [user, router]);

  return { isChecking };
}
