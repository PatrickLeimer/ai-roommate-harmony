
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { authService, User } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, '_id' | 'createdAt'>) => Promise<boolean>;
  logout: () => void;
  setMongoURI: (uri: string) => Promise<boolean>;
  isDBConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDBConnected, setIsDBConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if database is connected
    setIsDBConnected(authService.isConnected());
    
    // Check for stored token
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const { valid } = authService.verifyToken(storedToken);
      if (valid) {
        setToken(storedToken);
        setIsAuthenticated(true);
        // In a real app, you would fetch user data here
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await authService.login(email, password);
    
    if (result.success && result.token && result.user) {
      setToken(result.token);
      setUser(result.user);
      setIsAuthenticated(true);
      localStorage.setItem('token', result.token);
      toast({ title: "Login Successful", description: "Welcome back!" });
      return true;
    } else {
      toast({ 
        title: "Login Failed", 
        description: result.message, 
        variant: "destructive" 
      });
      return false;
    }
  };

  const register = async (userData: Omit<User, '_id' | 'createdAt'>): Promise<boolean> => {
    const result = await authService.register(userData);
    
    if (result.success && result.token) {
      setToken(result.token);
      setIsAuthenticated(true);
      localStorage.setItem('token', result.token);
      toast({ title: "Registration Successful", description: "Your account has been created!" });
      return true;
    } else {
      toast({ 
        title: "Registration Failed", 
        description: result.message, 
        variant: "destructive" 
      });
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    toast({ title: "Logged Out", description: "You have been logged out successfully." });
  };

  const setMongoURI = async (uri: string): Promise<boolean> => {
    const success = await authService.setMongoURI(uri);
    setIsDBConnected(success);
    if (success) {
      toast({ title: "Connection Successful", description: "Connected to MongoDB" });
    } else {
      toast({ 
        title: "Connection Failed", 
        description: "Could not connect to MongoDB", 
        variant: "destructive" 
      });
    }
    return success;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated, 
      login, 
      register, 
      logout, 
      setMongoURI, 
      isDBConnected 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
