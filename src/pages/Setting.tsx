import React, { useState, useEffect, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { Header } from '../components/layout/Header';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  bio?: string;
}

const Setting = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [imageUrl, setImageUrl] = useState('/placeholder.svg');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasProfileChanges, setHasProfileChanges] = useState(false);
  const [hasPasswordChanges, setHasPasswordChanges] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);

  // Store initial values to detect changes
  const initialProfile = useRef<UserProfile | null>(null);

  // Base URL from environment variable
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in to view your profile');
          return;
        }

        const response = await axios.get<{ success: boolean; user: UserProfile }>(
          `${baseUrl}/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          const { name, email, profileImage, bio } = response.data.user;
          setName(name);
          setEmail(email);
          setBio(bio || '');
          setImageUrl(profileImage || '/placeholder.svg');
          initialProfile.current = { name, email, profileImage, bio };
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        if (axiosError.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
        } else {
          toast.error(axiosError.response?.data.message || 'Failed to fetch profile');
        }
      }
    };

    fetchProfile();
  }, [baseUrl]);

  // Detect profile changes
  useEffect(() => {
    if (initialProfile.current) {
      const profileChanges =
        name !== initialProfile.current.name ||
        email !== initialProfile.current.email ||
        bio !== (initialProfile.current.bio || '') ||
        imageFile !== null;
      setHasProfileChanges(profileChanges);
    }
  }, [name, email, bio, imageFile]);

  // Detect password changes
  useEffect(() => {
    const passwordChanges = currentPassword !== '' && newPassword !== '';
    setHasPasswordChanges(passwordChanges);
  }, [currentPassword, newPassword]);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to update your profile');
        setLoading(false);
        return;
      }

      let uploadedImageUrl = imageUrl;
      if (imageFile) {
        const formData = new FormData();
        formData.append('profileImage', imageFile);

        const uploadResponse = await axios.post<{ message: string; ImageUrl: string }>(
          `${baseUrl}/`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (uploadResponse.data.ImageUrl) {
          uploadedImageUrl = uploadResponse.data.ImageUrl;
        } else {
          toast.error('Image upload failed');
          setLoading(false);
          return;
        }
      }

      const response = await axios.put<{ success: boolean; message: string; user: UserProfile }>(
        `${baseUrl}/auth/me`,
        { name, email, profileImage: uploadedImageUrl !== '/placeholder.svg' ? uploadedImageUrl : undefined, bio },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setImageFile(null);
        initialProfile.current = response.data.user;
        setHasProfileChanges(false);
        setIsModalOpen(false); // Close modal after successful profile update
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      if (axiosError.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(axiosError.response?.data.message || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle password change submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to change your password');
        setPasswordLoading(false);
        return;
      }

      const response = await axios.put<{ success: boolean; message: string }>(
        `${baseUrl}/auth/me/password`,
        { currentPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setCurrentPassword('');
        setNewPassword('');
        setHasPasswordChanges(false);
        setPasswordModal(false); // Close password form after successful submission
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      if (axiosError.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(axiosError.response?.data.message || 'Failed to change password');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const togglePasswordModal = () => {
    setPasswordModal(!passwordModal);
    setCurrentPassword(''); // Reset password fields when toggling
    setNewPassword('');
    setHasPasswordChanges(false);
  };

  return (
    <div>
      <Header />
      <Card className="max-w-2xl mx-auto mt-10 p-4">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarImage src={imageUrl} alt="profile" />
              <AvatarFallback>
                {name ? name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{name}</p>
              <p className="text-sm text-gray-500">{email}</p>
              {bio && <p className="text-sm text-gray-600 mt-1">{bio}</p>}
            </div>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full"
          >
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) setPasswordModal(false); // Reset password modal when closing main modal
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{passwordModal ? 'Change Password' : 'Edit Profile'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {!passwordModal ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={imageUrl} alt="profile" />
                    <AvatarFallback>
                      {name ? name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="image">Profile Image</Label>
                    <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself (max 500 characters)"
                    maxLength={500}
                    disabled={loading}
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={togglePasswordModal}
                  disabled={loading}
                >
                  Change Password
                </Button>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !hasProfileChanges}
                >
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    disabled={passwordLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={passwordLoading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={passwordLoading || !hasPasswordChanges}
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={togglePasswordModal}
                  disabled={passwordLoading}
                >
                  Back to Profile
                </Button>
              </form>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={loading || passwordLoading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Setting;