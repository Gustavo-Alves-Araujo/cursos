'use client';

import { usePasswordReset } from '@/hooks/usePasswordReset';

interface PasswordResetGuardProps {
  children: React.ReactNode;
}

export function PasswordResetGuard({ children }: PasswordResetGuardProps) {
  const { isChecking } = usePasswordReset();

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2 text-white">Verificando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
