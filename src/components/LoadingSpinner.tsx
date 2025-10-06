'use client';

import { useEffect, useState } from 'react';

interface LoadingSpinnerProps {
  message?: string;
  timeout?: number;
  onTimeout?: () => void;
}

export function LoadingSpinner({ 
  message = 'Carregando...', 
  timeout = 10000,
  onTimeout 
}: LoadingSpinnerProps) {
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

  useEffect(() => {
    if (timeout > 0) {
      const timer = setTimeout(() => {
        setShowTimeoutMessage(true);
        onTimeout?.();
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [timeout, onTimeout]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p className="mt-2">{message}</p>
        {showTimeoutMessage && (
          <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              Carregamento está demorando mais que o esperado. 
              <br />
              <button 
                onClick={() => window.location.reload()} 
                className="underline hover:text-yellow-300 mt-1"
              >
                Recarregar página
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
