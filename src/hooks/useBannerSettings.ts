import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface BannerSettings {
  id: string;
  welcome_message?: string;
  banner_image_url?: string;
  banner_image_link?: string;
  created_at: string;
  updated_at: string;
}

interface BannerSettingsUpdate {
  welcome_message: string;
  banner_image_url?: string;
  banner_image_link?: string;
}

export function useBannerSettings() {
  const [settings, setSettings] = useState<BannerSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('banner_settings')
        .select('*')
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setSettings(data);
    } catch (err) {
      console.error('Erro ao buscar configurações do banner:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (welcomeMessage: string, bannerImageUrl?: string, bannerImageLink?: string) => {
    try {
      setError(null);

      const updateData: BannerSettingsUpdate = { welcome_message: welcomeMessage };
      if (bannerImageUrl !== undefined) updateData.banner_image_url = bannerImageUrl;
      if (bannerImageLink !== undefined) updateData.banner_image_link = bannerImageLink;

      // Se não existir configuração, criar uma nova
      if (!settings) {
        const { data, error: insertError } = await supabase
          .from('banner_settings')
          .insert([updateData])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        setSettings(data);
        return data;
      } else {
        // Atualizar configuração existente
        const { data, error: updateError } = await supabase
          .from('banner_settings')
          .update(updateData)
          .eq('id', settings.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        setSettings(data);
        return data;
      }
    } catch (err) {
      console.error('Erro ao atualizar configurações do banner:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    refetch: fetchSettings
  };
}
