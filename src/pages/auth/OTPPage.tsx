/**
 * OTP Verification Page
 * 
 * Page component for OTP verification flow
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { OTPVerification } from '@/components/auth/OTPVerification';
import { OTPFormData } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export const OTPPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Get email from location state
  const email = location.state?.email;
  const fromSignup = location.state?.fromSignup;

  // Redirect if no email provided
  React.useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleSubmit = async (data: OTPFormData) => {
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await verifyOTP(email, data.otp);
      
      if (response.success) {
        // Redirect to home page after successful verification
        navigate('/', { replace: true });
      } else {
        setError(response.message || 'OTP verification failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) return;

    try {
      // In a real app, you'd have a separate resend OTP endpoint
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  const handleGoBack = () => {
    navigate('/signup');
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <OTPVerification
      email={email}
      onSubmit={handleSubmit}
      onResendOTP={handleResendOTP}
      onGoBack={handleGoBack}
      isLoading={isLoading}
      error={error}
    />
  );
};