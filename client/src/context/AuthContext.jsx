import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api'; // Your axios instance

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check local storage on initial load
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        setIsAuthenticated(true);
        // Optional: Fetch user profile immediately if token exists
        try {
          const res = await api.get('/profile/');
          setUser(res.data);
        } catch (error) {
          console.error("Token invalid or expired");
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};