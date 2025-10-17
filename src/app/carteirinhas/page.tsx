'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IdCard, Clock, Download, Upload, Lock, CheckCircle } from 'lucide-react';
import { CardGeneratorModal } from '@/components/CardGeneratorModal';
import { supabase } from '@/lib/supabase';

interface StudentCard {
  id: string;
  user_id: string;
  course_id: string;
  enrollment_date: string;
  available_date: string;
  profile_photo_url: string | null;
  generated_card_url: string | null;
  is_generated: boolean;
  is_available: boolean;
  days_remaining: number;
  courses: {
    id: string;
    title: string;
    thumbnail: string;
  };
}

export default function CarteirinhasPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [cards, setCards] = useState<StudentCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<StudentCard | null>(null);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role === 'admin') {
        router.push('/admin');
        return;
      }
      loadCards();
    }
  }, [user, authLoading]);

  const loadCards = async () => {
    try {
      console.log('🔍 Carregando carteirinhas...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('❌ Sem sessão ativa');
        return;
      }

      console.log('✅ Sessão ativa, fazendo request para /api/student-cards');

      const response = await fetch('/api/student-cards', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Carteirinhas recebidas:', data);
        console.log('📊 Total de carteirinhas:', data.length);
        setCards(data);
      } else {
        const error = await response.json();
        console.error('❌ Erro na resposta:', error);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar carteirinhas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCard = (card: StudentCard) => {
    setSelectedCard(card);
    setShowGeneratorModal(true);
  };

  const handleCardGenerated = () => {
    setShowGeneratorModal(false);
    setSelectedCard(null);
    loadCards(); // Recarregar lista
  };

  const handleDownloadCard = async (cardUrl: string, courseName: string) => {
    try {
      console.log('⬇️ Baixando carteirinha de:', cardUrl);
      
      // Buscar a imagem do Supabase
      const response = await fetch(cardUrl);
      const blob = await response.blob();
      
      // Criar URL local do blob
      const url = window.URL.createObjectURL(blob);
      
      // Criar link de download
      const link = document.createElement('a');
      link.href = url;
      link.download = `carteirinha-${courseName.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Download concluído');
    } catch (error) {
      console.error('❌ Erro ao baixar:', error);
      alert('Erro ao baixar a carteirinha. Tente novamente.');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="relative">
        <Sidebar />
        <main className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-2">Carregando...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user || user.role === 'admin') {
    return null;
  }

  const availableCards = cards.filter(c => c.is_available);
  const unavailableCards = cards.filter(c => !c.is_available);

  return (
    <div className="relative">
      <Sidebar />
      <main className="lg:ml-64 p-6 space-y-6">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <IdCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-200">Minhas Carteirinhas</h1>
              <p className="text-blue-300 mt-1">
                {cards.length === 0 
                  ? 'Você ainda não possui carteirinhas' 
                  : `${availableCards.length} disponível(is) • ${unavailableCards.length} aguardando`}
              </p>
            </div>
          </div>
        </div>

        {/* Carteirinhas Disponíveis */}
        {availableCards.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-semibold text-green-200">
                Carteirinhas Disponíveis ({availableCards.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCards.map((card) => (
                <Card key={card.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-green-500/50 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-blue-200 text-lg">
                          {card.courses.title}
                        </CardTitle>
                        <CardDescription className="text-blue-300 mt-1">
                          Matriculado em {new Date(card.enrollment_date).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-500/20 text-green-200 border-green-500/50">
                        Disponível
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {card.courses.thumbnail && (
                      <img 
                        src={card.courses.thumbnail} 
                        alt={card.courses.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    
                    {card.is_generated && card.generated_card_url ? (
                      <div className="space-y-3">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                          <p className="text-sm text-green-200 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Carteirinha já gerada
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleDownloadCard(card.generated_card_url!, card.courses.title)}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Baixar
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleGenerateCard(card)}
                            className="bg-white/10 hover:bg-white/20"
                          >
                            Regerar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleGenerateCard(card)}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Emitir Carteirinha
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Carteirinhas Indisponíveis */}
        {unavailableCards.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-semibold text-orange-200">
                Aguardando Disponibilidade ({unavailableCards.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unavailableCards.map((card) => (
                <Card key={card.id} className="bg-white/5 backdrop-blur-sm border-white/10 opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-blue-200 text-lg">
                          {card.courses.title}
                        </CardTitle>
                        <CardDescription className="text-blue-300 mt-1">
                          Matriculado em {new Date(card.enrollment_date).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </div>
                      <Badge className="bg-orange-500/20 text-orange-200 border-orange-500/50">
                        <Lock className="w-3 h-3 mr-1" />
                        Bloqueada
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {card.courses.thumbnail && (
                      <img 
                        src={card.courses.thumbnail} 
                        alt={card.courses.title}
                        className="w-full h-32 object-cover rounded-lg opacity-50"
                      />
                    )}
                    
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 text-center">
                      <Clock className="w-8 h-8 text-orange-300 mx-auto mb-2" />
                      <p className="text-orange-200 font-semibold">
                        Disponível em {card.days_remaining} {card.days_remaining === 1 ? 'dia' : 'dias'}
                      </p>
                      <p className="text-orange-300 text-sm mt-1">
                        {new Date(card.available_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Nenhuma carteirinha */}
        {cards.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <IdCard className="w-12 h-12 text-blue-300" />
            </div>
            <h3 className="text-xl font-semibold text-blue-200 mb-2">Nenhuma carteirinha disponível</h3>
            <p className="text-blue-300">
              Matricule-se em um curso para ter acesso às carteirinhas
            </p>
          </div>
        )}
      </main>

      {/* Modal de Geração */}
      {selectedCard && (
        <CardGeneratorModal
          isOpen={showGeneratorModal}
          onClose={() => {
            setShowGeneratorModal(false);
            setSelectedCard(null);
          }}
          card={selectedCard}
          onCardGenerated={handleCardGenerated}
        />
      )}
    </div>
  );
}
