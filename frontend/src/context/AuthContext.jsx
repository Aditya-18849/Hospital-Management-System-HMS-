import React, { createContext, useState, useEffect, useContext } from 'react';
import { setAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved session on mount
    const storedUser = localStorage.getItem('hms_user');
    const token = localStorage.getItem('hms_token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
        setAuthToken(token); // Configure axios with the token
      } catch (e) {
        console.error("Failed to parse user data", e);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('hms_user', JSON.stringify(userData));
    localStorage.setItem('hms_token', token);
    setUser(userData);
    setAuthToken(token);
  };

  const logout = () => {
    localStorage.removeItem('hms_user');
    localStorage.removeItem('hms_token');
    setUser(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);