'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const { logout, user } = useAuth();

  if (!user) return null;

  return (
    <Button 
      variant="outline" 
      onClick={logout}
        className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border-white/30 text-blue-200 hover:text-white text-sm sm:text-base transition-all duration-200"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Sair</span>
    </Button>
  );
}
