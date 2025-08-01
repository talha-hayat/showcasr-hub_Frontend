/**
 * OTP Verification Page
 * 
 * Page component for OTP verification flow
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { OTPVerification } from '@/components/auth/OTPVerification';
import axios from 'axios';

export const OTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get email from location state
  const email = location.state?.email;
  const fromSignup = location.state?.fromSignup;

  // Redirect if no email provided
  React.useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleSubmit = async (data) => {
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/verify-otp`, {
        email,
        otp: data.otp,
      });

      if (response.data.success) {
        // Redirect to home page after successful verification
        navigate('/', { replace: true });
      } else {
        setError(response.data.message || 'OTP verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      // Use a dedicated resend OTP endpoint (recommended)
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/resendOtp`, { email });

      if (response.data.success) {
        setError('OTP resent successfully'); // Display as success message
      } else {
        setError(response.data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
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

export default OTPPage;