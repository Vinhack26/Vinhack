import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api/endpoints';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('breachbuddy_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('breachbuddy_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('breachbuddy_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res && res.user) {
            setUser(res.user);
            localStorage.setItem('breachbuddy_user', JSON.stringify(res.user));
          }
        } catch {
          // Token expired or invalid
          localStorage.removeItem('breachbuddy_token');
          localStorage.removeItem('breachbuddy_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('breachbuddy_token', data.token);
    localStorage.setItem('breachbuddy_user', JSON.stringify(data.user));
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await authApi.register(name, email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('breachbuddy_token', data.token);
    localStorage.setItem('breachbuddy_user', JSON.stringify(data.user));
  };

  const logout = () => {
    localStorage.removeItem('breachbuddy_token');
    localStorage.removeItem('breachbuddy_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
