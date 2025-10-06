'use client';

import { useEffect, useCallback } from 'react';

export function useVisibilityChange(callback: () => void) {
  const handleVisibilityChange = useCallback(() => {
    if (!document.hidden) {
      callback();
    }
  }, [callback]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);
}
