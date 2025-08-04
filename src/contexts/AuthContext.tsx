
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authCache } from '@/utils/cacheManager';

interface User {
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  console.log('useAuth called, AuthContext is:', AuthContext);
  const context = useContext(AuthContext);
  console.log('useAuth context result:', context);
  if (context === undefined) {
    console.error('useAuth called outside of AuthProvider!');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('AuthProvider rendering...');
  const [user, setUser] = useState<User | null>(() => {
    // Try to load user from cache on initialization
    const cachedUser = authCache.getUser();
    console.log('AuthProvider: cached user on init:', cachedUser);
    return cachedUser || null;
  });

  const login = async (username: string, email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple validation - in real app this would be server-side
    if (username && email && password.length >= 6) {
      const userData = { username, email };
      setUser(userData);
      authCache.setUser(userData); // Cache user data
      return true;
    }
    return false;
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple validation - in real app this would be server-side
    if (username && email && password.length >= 6) {
      const userData = { username, email };
      setUser(userData);
      authCache.setUser(userData); // Cache user data
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    authCache.clearUser(); // Clear cached user data
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  console.log('AuthProvider: providing value:', value);
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
