import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthService } from '../services/authService';
import { GoogleAuthService } from '../services/googleAuthService';
import type { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean }>;
  googleAuth: () => Promise<void>;
  logout: () => void;
  updateUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      if (AuthService.isAuthenticated()) {
        const storedUser = AuthService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          // Optionally refresh user data from server
          try {
            const currentUser = await AuthService.getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            console.error('Failed to refresh user data:', error);
            // If token is invalid, clear it
            AuthService.signout();
            setUser(null);
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await AuthService.signin({ email, password });
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      await AuthService.signup({ name, email, password });
      // Don't set user state - force user to sign in
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const googleAuth = async () => {
    try {
      const response = await GoogleAuthService.signInWithGoogle();
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    AuthService.signout();
    setUser(null);
  };

  const updateUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    googleAuth,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
