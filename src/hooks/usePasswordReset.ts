import { useState } from 'react';

// Como agora todos os usuários vêm com senha padrão "123123",
// este hook não é mais necessário
// Mantido apenas para compatibilidade, mas não faz nada

export function usePasswordReset() {
  const [isChecking] = useState(false);
  
  // Hook vazio - não há mais verificações baseadas em needs_password_reset
  return { isChecking };
}
