import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import * as authApi from '../api/auth';
import { TOKEN_STORAGE_KEY } from '../api/axios';
import type { LoginPayload, User } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    authApi
      .fetchProfile()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (payload: LoginPayload) => {
    const data = await authApi.login(payload);
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
