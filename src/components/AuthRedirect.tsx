'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export function AuthRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirecionar baseado no tipo de usuário
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <LoadingSpinner 
        message="Redirecionando..."
        timeout={8000}
        onTimeout={() => {
          console.log('Timeout no redirecionamento');
          router.push('/');
        }}
      />
    );
  }

  return null;
}
