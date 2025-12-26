import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        validateToken(token);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        logout();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      await authAPI.validateToken(token);
      setLoading(false);
    } catch (error) {
      console.error('Token validation failed:', error);
      logout();
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      console.log('Login response:', response);
      
      // Handle ApiResponse wrapper format
      let token, userData;
      
      if (response.data) {
        // Response is wrapped in ApiResponse
        token = response.data.token;
        userData = response.data.user;
      } else {
        // Direct response
        token = response.token;
        userData = response.user;
      }
      
      if (!token || !userData) {
        throw new Error('Invalid login response format');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authAPI.register(userData);
      console.log('Register successful:', data);
      return { success: true, data: data };
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = error.message || 'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setLoading(false);
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isCustomer = () => user?.role === 'CUSTOMER';

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      isAdmin, 
      isCustomer 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};