/**
 * Signup Page
 * 
 * Page component that handles user registration flow
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupForm } from '@/components/auth/SignupForm';
import { SignupFormData } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await signup(data.email, data.password, data.name);
      
      if (response.success) {
        // Redirect to OTP verification page
        navigate('/verify-otp', { 
          state: { 
            email: data.email,
            fromSignup: true 
          } 
        });
      } else {
        setError(response.message || 'Signup failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SignupForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
    />
  );
};