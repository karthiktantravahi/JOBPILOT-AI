import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('jobpilot_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('jobpilot_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('jobpilot_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('jobpilot_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Failed to verify token on boot:', err.message);
          localStorage.removeItem('jobpilot_token');
          localStorage.removeItem('jobpilot_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.token && data.user) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('jobpilot_token', data.token);
      localStorage.setItem('jobpilot_user', JSON.stringify(data.user));
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data.token && data.user) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('jobpilot_token', data.token);
      localStorage.setItem('jobpilot_user', JSON.stringify(data.user));
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('jobpilot_token');
    localStorage.removeItem('jobpilot_user');
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('jobpilot_user', JSON.stringify(updatedUser));
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
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
