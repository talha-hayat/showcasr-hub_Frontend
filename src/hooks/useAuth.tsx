/**
 * Authentication Hook
 * 
 * Custom hook that manages authentication state and provides auth-related functions.
 * Uses React Context for state management and localStorage for persistence.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthResponse } from '@/types';
import { authAPI, setAuthToken, removeAuthToken, isAuthenticated } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (email: string, password: string, name?: string) => Promise<AuthResponse>;
  verifyOTP: (email: string, otp: string) => Promise<AuthResponse>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 * Wraps the app and provides authentication context to all child components
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          // In a real app, you'd validate the token with the backend
          // For now, we'll assume the token is valid if it exists
          const userData = localStorage.getItem('user_data');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        removeAuthToken();
        localStorage.removeItem('user_data');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Login function
   */
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.success && response.token && response.user) {
        setAuthToken(response.token);
        setUser(response.user);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  /**
   * Signup function
   */
  const signup = async (email: string, password: string, name?: string): Promise<AuthResponse> => {
    try {
      const response = await authAPI.signup({ email, password, name });
      
      if (response.success) {
        toast({
          title: "Account Created!",
          description: "Please check your email for verification code.",
        });
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Signup failed';
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  /**
   * OTP Verification function
   */
  const verifyOTP = async (email: string, otp: string): Promise<AuthResponse> => {
    try {
      const response = await authAPI.verifyOTP({ email, otp });
      
      if (response.success && response.token && response.user) {
        setAuthToken(response.token);
        setUser(response.user);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        
        toast({
          title: "Email Verified!",
          description: "Your account has been successfully verified.",
        });
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'OTP verification failed';
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    removeAuthToken();
    localStorage.removeItem('user_data');
    setUser(null);
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  /**
   * Forgot Password function
   */
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await authAPI.forgotPassword(email);
      toast({
        title: "Reset Email Sent",
        description: "Please check your email for password reset instructions.",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      toast({
        title: "Request Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  /**
   * Reset Password function
   */
  const resetPassword = async (email: string, otp: string, newPassword: string): Promise<void> => {
    try {
      await authAPI.resetPassword(email, otp, newPassword);
      toast({
        title: "Password Reset",
        description: "Your password has been successfully reset.",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      toast({
        title: "Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    verifyOTP,
    logout,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};