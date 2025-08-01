import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupForm } from '@/components/auth/SignupForm';
// import { useAuth } from '@/hooks/useAuth';

export const SignupPage = () => {
  const navigate = useNavigate();
  // const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      // Create FormData if image is present
      const submitData = {
        email: data.email,
        password: data.password,
        name: data.name,
        profileImage: data.profileImage // This will be the file object
      };

      // const response = await signup(submitData.email, submitData.password, submitData.name, submitData.profileImage);
      
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
    } catch (err) {
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