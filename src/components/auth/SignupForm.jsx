import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardHeader, CardTitle, CardDescription,
  CardContent, CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MainImage from '../../pages/auth/MainImage';
import axios from 'axios';

export const SignupForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    profileImage: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (file) => {
    setFormData(prev => ({ ...prev, profileImage: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match!');
        setIsLoading(false);
        return;
      }

      let imageUploadData = {
        public_id: '',
        url: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || formData.email)}`
      };

      // If user selected an image, upload it
      if (formData.profileImage) {
        const cloudForm = new FormData();
        cloudForm.append('profileImage', formData.profileImage);

        const cloudRes = await axios.post(`${import.meta.env.VITE_BASE_URL}/upload`, cloudForm);
        imageUploadData = cloudRes.data.ImageUrl;
      }

      // Send signup request
      const finalData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        profileImage: imageUploadData,
      };

      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/signup`, finalData);

      if (response.status === 201 && response.data?.success) {
        const userData = response.data.user;

        // Save user only
        localStorage.setItem('user', JSON.stringify(userData));

        navigate('/verify-otp', {
          state: {
            email: formData.email,
            fromSignup: true,
          },
        });
      } else {
        setError(response.data.message || 'Signup failed.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong during signup.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">Enter your details to create your account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <MainImage
              onImageSelect={handleImageSelect}
              imagePreview={imagePreview}
              setImagePreview={setImagePreview}
              setShowEditor={() => { }}
              imageError={imageError}
              setImageError={setImageError}
            />

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" type="text" required value={formData.name} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required value={formData.password} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleInputChange} />
              {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                <p className="text-sm text-red-500">Passwords do not match</p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || formData.password !== formData.confirmPassword}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <p className="text-sm text-center w-full text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">Sign in</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignupForm;
