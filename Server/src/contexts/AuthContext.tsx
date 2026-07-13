
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, setToken, clearToken, getToken, ApiUser } from '@/services/api';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  location?: string;
  bio?: string;
  phone?: string;
  points?: number;
  level?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<{success: boolean, message?: string}>;
  signup: (email: string, password: string, name: string) => Promise<{success: boolean, message?: string}>;
  logout: () => void;
  isAdmin: () => boolean;
  isAuthenticated: () => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Convert an API user response to the frontend User shape.
 */
function toFrontendUser(apiUser: ApiUser): User {
  return {
    id: apiUser._id,
    email: apiUser.email,
    name: apiUser.name,
    role: apiUser.role as UserRole,
    avatar: apiUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiUser.email}`,
    location: apiUser.location,
    bio: apiUser.bio,
    phone: apiUser.phone,
    points: apiUser.points,
    level: apiUser.level,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check for existing JWT and restore session
  useEffect(() => {
    const restoreSession = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const { user: apiUser } = await authApi.me();
        const frontendUser = toFrontendUser(apiUser);
        setUser(frontendUser);
        localStorage.setItem('rewear_user', JSON.stringify(frontendUser));
      } catch (error) {
        console.error('Session restoration failed:', error);
        // Token is invalid or expired — clear it
        clearToken();
        localStorage.removeItem('rewear_user');
      }

      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const refreshUser = async () => {
    try {
      const { user: apiUser } = await authApi.me();
      const frontendUser = toFrontendUser(apiUser);
      setUser(frontendUser);
      localStorage.setItem('rewear_user', JSON.stringify(frontendUser));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const login = async (email: string, password: string, role: UserRole): Promise<{success: boolean, message?: string}> => {
    setIsLoading(true);
    
    try {
      const response = await authApi.login(email, password, role);
      
      setToken(response.token);
      const frontendUser = toFrontendUser(response.user);
      setUser(frontendUser);
      localStorage.setItem('rewear_user', JSON.stringify(frontendUser));
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<{success: boolean, message?: string}> => {
    setIsLoading(true);
    
    try {
      const response = await authApi.signup(email, password, name);
      
      setToken(response.token);
      const frontendUser = toFrontendUser(response.user);
      setUser(frontendUser);
      localStorage.setItem('rewear_user', JSON.stringify(frontendUser));
      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false, message: error.message || 'Signup failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    clearToken();
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
      isAuthenticated,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
