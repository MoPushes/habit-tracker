import { createContext, useContext, useState, ReactNode } from 'react';
import { AuthResponse, apiLogin, apiRegister } from '../api';

type AuthUser = { userId: number; email: string };

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  function applyAuth(data: AuthResponse) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ userId: data.userId, email: data.email }));
    setToken(data.token);
    setUser({ userId: data.userId, email: data.email });
  }

  async function login(email: string, password: string) {
    applyAuth(await apiLogin(email, password));
  }

  async function register(email: string, password: string) {
    applyAuth(await apiRegister(email, password));
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}