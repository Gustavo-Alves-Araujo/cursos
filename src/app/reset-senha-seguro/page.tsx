'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown, Lock, Eye, EyeOff, CheckCircle, KeyRound, Mail, Shield } from 'lucide-react';

export default function ResetSenhaSeguroPage() {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email) {
      setError('Email é obrigatório');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/generate-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Erro ao gerar token');
      } else {
        setToken(result.token);
        setStep('password');
      }
    } catch (error) {
      console.error('Erro ao gerar token:', error);
      setError('Erro ao gerar token. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!password || !confirmPassword) {
      setError('Todos os campos são obrigatórios');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          newPassword: password,
          token: token
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Erro ao redefinir senha');
      } else {
        setSuccess(true);
        
        // Redirecionar após 3 segundos
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      setError('Erro ao redefinir senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
        
        <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 sm:space-y-6 pb-6 sm:pb-8">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                Senha Redefinida!
              </CardTitle>
              <CardDescription className="text-green-200 text-base sm:text-lg">
                Sua senha foi alterada com sucesso
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert className="bg-green-500/20 border-green-500/50">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-200">
                Sua senha foi redefinida com sucesso! Você será redirecionado para a página de login em alguns segundos.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={() => router.push('/login')}
              className="w-full h-10 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
      
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
        <CardHeader className="text-center space-y-4 sm:space-y-6 pb-6 sm:pb-8">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Reset Seguro de Senha
            </CardTitle>
            <CardDescription className="text-purple-200 text-base sm:text-lg">
              {step === 'email' ? 'Digite seu email para gerar um token seguro' : 'Digite sua nova senha'}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6">
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4 sm:space-y-6">
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
              
              {error && (
                <Alert variant="destructive" className="bg-red-500/20 border-red-500/50">
                  <AlertDescription className="text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-10 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-sm sm:text-base">Gerando Token...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Gerar Token Seguro</span>
                  </div>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="password" className="text-blue-200 font-medium flex items-center gap-2 text-sm sm:text-base">
                  <Lock className="w-4 h-4" />
                  Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                    required
                    minLength={6}
                    className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200 h-10 sm:h-12 text-sm sm:text-base pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="confirmPassword" className="text-blue-200 font-medium flex items-center gap-2 text-sm sm:text-base">
                  <Lock className="w-4 h-4" />
                  Confirmar Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    required
                    minLength={6}
                    className="bg-white/15 border-white/40 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 hover:bg-white/20 transition-all duration-200 h-10 sm:h-12 text-sm sm:text-base pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive" className="bg-red-500/20 border-red-500/50">
                  <AlertDescription className="text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-10 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-sm sm:text-base">Redefinindo...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Redefinir Senha</span>
                  </div>
                )}
              </Button>
            </form>
          )}
          
          {/* Link para voltar ao login */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-blue-200 hover:text-white text-sm transition-colors duration-200"
            >
              Voltar ao Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
