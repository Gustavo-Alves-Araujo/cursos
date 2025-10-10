import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UpdateMetadataResult {
  success: boolean;
  error?: string;
}

export function useUpdateUserMetadata() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const updateMetadata = async (metadata: Record<string, unknown>): Promise<UpdateMetadataResult> => {
    if (!user) {
      return {
        success: false,
        error: 'Usuário não autenticado'
      };
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/update-user-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          metadata
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Erro ao atualizar metadados'
        };
      }

      return {
        success: true
      };

    } catch (error) {
      console.error('Erro ao atualizar metadados:', error);
      return {
        success: false,
        error: 'Erro de conexão'
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateMetadata,
    isLoading
  };
}
