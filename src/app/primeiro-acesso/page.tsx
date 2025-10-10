'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, Mail, Key } from 'lucide-react';

export default function PrimeiroAcessoPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Chamar API para fazer login automático
      const response = await fetch('/api/yampi-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao verificar acesso');
        return;
      }

      if (data.success) {
        // Fazer login automático com a senha temporária
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: email,
          password: data.tempPassword
        });

        if (loginError) {
          setError('Erro ao fazer login automático. Tente novamente.');
          return;
        }

        if (loginData.user) {
          // Verificar se precisa redefinir senha
          const needsPasswordReset = loginData.user.user_metadata?.needs_password_reset;
          
          if (needsPasswordReset) {
            // Redirecionar para definir senha
            setSuccess(true);
            setTimeout(() => {
              router.push('/definir-senha');
            }, 1000);
          } else {
            // Usuário já tem senha definida, ir para dashboard
            router.push('/');
          }
        }
      }

    } catch (error: unknown) {
      console.error('Erro no primeiro acesso:', error);
      setError('Erro ao verificar acesso. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Acesso Verificado!
              </h2>
              <p className="text-gray-600 mb-4">
                Redirecionando para definir sua senha...
              </p>
              <div className="flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Key className="w-6 h-6" />
            Primeiro Acesso
          </CardTitle>
          <CardDescription className="text-center">
            Digite seu email para acessar sua conta após a compra
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email da Compra</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite o email usado na compra"
                  required
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">
                Digite apenas o email usado na compra. O sistema fará o resto automaticamente.
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Acessar Conta'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma senha?{' '}
              <button 
                onClick={() => router.push('/login')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Fazer login
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
