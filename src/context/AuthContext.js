import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    // const result = await authService.login(email, password);
    const result ={
      success: true, 
      data: { 
        user: { 
          id: 1, 
          name: 'John Doe', 
          role: 'Manager' 
        }, 
        token: 'abc123', 
        refreshToken: 'xyz456' 
      }  // Example response structure  
    }
    if (result.success) {
      const userData = {
        ...result.data.user,
        role: result.data.user.role // Role is already included in the API response
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('refreshToken', result.data.refreshToken);
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
