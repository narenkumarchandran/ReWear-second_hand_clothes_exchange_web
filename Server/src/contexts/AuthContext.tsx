
import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem('rewear_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('rewear_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation - in real app, this would be API call
      const isValidCredentials = password.length >= 6;
      
      if (isValidCredentials) {
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name: email.split('@')[0],
          role,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        };
        
        setUser(newUser);
        localStorage.setItem('rewear_user', JSON.stringify(newUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation - in real app, this would be API call
      const isValidCredentials = password.length >= 6;
      
      if (isValidCredentials) {
        // For signup, create user immediately and set them as logged in
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name: email.split('@')[0],
          role,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        };
        
        setUser(newUser);
        localStorage.setItem('rewear_user', JSON.stringify(newUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rewear_user');
  };

  const isAdmin = () => user?.role === 'admin';
  const isAuthenticated = () => !!user;

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      signup,
      logout,
      isAdmin,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};
