import { useEffect, useRef } from 'react';

/**
 * Hook para gerenciar mudanças de visibilidade da página
 * Evita refresh desnecessários quando o usuário troca de aba
 */
export function useVisibilityChange() {
  const isVisible = useRef(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisible.current = !document.hidden;
      
      if (isVisible.current) {
        console.log('Página ficou visível - evitando refresh desnecessário');
      } else {
        console.log('Página ficou oculta');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible.current;
}