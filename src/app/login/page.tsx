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
      router.push('/');
    } else {
      setError(result.error || 'Email ou senha incorretos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center -ml-64 relative overflow-hidden">
      {/* Background com gradiente luxuoso */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
      

      {/* Card principal com glassmorphism */}
      <Card className="w-full max-w-lg backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
        <CardHeader className="text-center space-y-6 pb-8">
          {/* Logo/Ícone luxuoso */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
            <Crown className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Plataforma Premium
            </CardTitle>
            <CardDescription className="text-purple-200 text-lg">
              Acesse sua conta para continuar sua jornada
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-blue-200 font-medium flex items-center gap-2">
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
                className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200 h-12"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-blue-200 font-medium flex items-center gap-2">
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
                className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200 h-12"
              />
            </div>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Entrando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Entrar
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
