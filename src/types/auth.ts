export type UserRole = 'admin' | 'aluno';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string; // Em produção, isso seria hash
};

export type LoggedInUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AuthContextType = {
  user: LoggedInUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
};
