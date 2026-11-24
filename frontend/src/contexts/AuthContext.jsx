/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';
import { setOfflineAccount } from '../utils/offlineQueue';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI.me()
      .then((res) => {
        setOfflineAccount(res.data.sub);
        setUser(res.data);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    setOfflineAccount(res.data.sub);
    setUser(res.data);
    return res.data;
  };

  // Demande de compte : creee « en attente », aucune session ouverte.
  const register = async (userData) => {
    const res = await authAPI.register(userData);
    return res.data;
  };

  const logout = async () => {
    await authAPI.logout();
    setOfflineAccount(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
