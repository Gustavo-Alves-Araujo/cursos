'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, GraduationCap, Sparkles, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    
    if (result.success) {
      // Verificar se precisa redefinir senha
      if (result.needsPasswordReset) {
        console.log('Redirecionando para /definir-senha');
        router.push('/definir-senha');
      } else {
        router.push('/');
      }
    } else {
      setError(result.error || 'Email ou senha incorretos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background com gradiente luxuoso */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
      

      {/* Card principal com glassmorphism */}
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
        <CardHeader className="text-center space-y-4 sm:space-y-6 pb-6 sm:pb-8">
          {/* Logo/Ícone luxuoso */}
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
            <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Plataforma Premium
            </CardTitle>
            <CardDescription className="text-purple-200 text-base sm:text-lg">
              Acesse sua conta para continuar sua jornada
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="email" className="text-blue-200 font-medium flex items-center gap-2 text-sm sm:text-base">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200 h-10 sm:h-12 text-sm sm:text-base"
              />
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="password" className="text-blue-200 font-medium flex items-center gap-2 text-sm sm:text-base">
                <Lock className="w-4 h-4" />
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200 h-10 sm:h-12 text-sm sm:text-base"
              />
            </div>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-center text-sm sm:text-base">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-10 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="text-sm sm:text-base">Entrando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Entrar</span>
                </div>
              )}
            </Button>
          </form>
          
          {/* Seção de usuários de teste com design elegante */}
        
        </CardContent>
      </Card>
    </div>
  );
}
