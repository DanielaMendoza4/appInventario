import { createContext, useContext, useEffect, useState } from 'react';
import { tokenStore } from '../api/client';
import { login as apiLogin, getMe as apiGetMe } from '../api/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => tokenStore.getUser());
  const [loading, setLoading] = useState(Boolean(tokenStore.getToken()));

  useEffect(() => {
    const token = tokenStore.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    apiGetMe()
      .then((userData) => {
        setUser(userData);
        tokenStore.setUser(userData);
      })
      .catch(() => {
        tokenStore.clearToken();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await apiLogin(email, password);
      tokenStore.setToken(data.token);
      tokenStore.setUser(data.usuario);
      setUser(data.usuario);
      return data.usuario;
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Error al iniciar sesión';
      throw new Error(message);
    }
  };

  const logout = () => {
    tokenStore.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
}
