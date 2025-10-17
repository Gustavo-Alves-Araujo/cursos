'use client';

import { useState, useEffect } from 'react';
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

export function useStudentCards() {
  const [cards, setCards] = useState<StudentCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Não autenticado');
      }

      const response = await fetch('/api/student-cards', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar carteirinhas');
      }

      const data = await response.json();
      setCards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao buscar carteirinhas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const refreshCards = () => {
    fetchCards();
  };

  const availableCards = cards.filter(c => c.is_available);
  const unavailableCards = cards.filter(c => !c.is_available);

  return {
    cards,
    availableCards,
    unavailableCards,
    isLoading,
    error,
    refreshCards
  };
}
