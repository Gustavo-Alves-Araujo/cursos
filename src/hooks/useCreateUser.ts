import { useState } from 'react';

interface CreateUserData {
  name: string;
  email: string;
  role?: 'student' | 'admin';
}

interface CreateUserResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    temporaryPassword: string;
  };
}

export function useCreateUser() {
  const [isLoading, setIsLoading] = useState(false);

  const createUser = async (userData: CreateUserData): Promise<CreateUserResult> => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Erro ao criar usuário'
        };
      }

      return {
        success: true,
        user: data.user
      };

    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return {
        success: false,
        error: 'Erro de conexão'
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createUser,
    isLoading
  };
}
