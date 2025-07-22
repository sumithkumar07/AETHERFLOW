import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('aetherflow_user');
    const storedAuth = localStorage.getItem('aetherflow_auth');
    
    if (storedUser && storedAuth === 'true') {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('aetherflow_user');
        localStorage.removeItem('aetherflow_auth');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Check for demo credentials
      if (email === 'demo@aetherflow.dev' && password === 'cosmicpower2025') {
        const mockUser = {
          id: '1',
          email,
          name: 'Demo User',
          plan: 'Professional',
          avatar: null,
          joinDate: new Date().toISOString(),
          credits: 1000
        };
        
        setUser(mockUser);
        setIsAuthenticated(true);
        localStorage.setItem('aetherflow_user', JSON.stringify(mockUser));
        localStorage.setItem('aetherflow_auth', 'true');
        return { success: true, user: mockUser };
      }
      
      // Regular login logic (can be expanded later)
      const mockUser = {
        id: '1',
        email,
        name: 'Demo User',
        plan: 'Professional',
        avatar: null,
        joinDate: new Date().toISOString(),
        credits: 1000
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('aetherflow_user', JSON.stringify(mockUser));
      localStorage.setItem('aetherflow_auth', 'true');
      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, name) => {
    try {
      setLoading(true);
      // Mock signup for now - replace with actual API call
      const mockUser = {
        id: Date.now().toString(),
        email,
        name,
        plan: 'Free',
        avatar: null,
        joinDate: new Date().toISOString(),
        credits: 500
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('aetherflow_user', JSON.stringify(mockUser));
      localStorage.setItem('aetherflow_auth', 'true');
      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('aetherflow_user');
    localStorage.removeItem('aetherflow_auth');
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('aetherflow_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};