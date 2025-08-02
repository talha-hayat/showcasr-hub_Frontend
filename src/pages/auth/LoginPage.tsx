/**
 * Login Page
 * 
 * Page component that handles user authentication
 */

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { LoginFormData } from '@/types';
import { ArrowLeft } from 'lucide-react';
// import { useAuth } from '@/hooks/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      // const response = await login(data.email, data.password);
      
      if (response.success) {
        // Redirect to intended destination or home
        navigate(from, { replace: true });
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
    
    <LoginForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
    />
    </div>
  );
};