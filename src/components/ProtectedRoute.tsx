'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'student')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  console.log('ProtectedRoute - estado:', { user, isLoading, allowedRoles });

  useEffect(() => {
    // Timeout para evitar loading infinito
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('Timeout no ProtectedRoute, redirecionando para login');
        setHasRedirected(true);
        router.push('/login');
      }
    }, 10000); // 10 segundos de timeout

    if (!isLoading && !hasRedirected) {
      if (!user) {
        setHasRedirected(true);
        router.push('/login');
        return;
      }
      
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        setHasRedirected(true);
        // Redirecionar para área apropriada baseada no role
        if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        return;
      }
    }

    return () => clearTimeout(timeout);
  }, [user, isLoading, allowedRoles, hasRedirected, router]);

  if (isLoading) {
    return (
      <LoadingSpinner 
        message="Verificando autenticação..."
        timeout={10000}
        onTimeout={() => {
          console.log('Timeout na verificação de autenticação');
          router.push('/login');
        }}
      />
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
