import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Header } from './layout/Header';
import { ArrowLeft, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Portfolio {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  imageUrls: string[];
  category: string;
  creatorId: string;
  creator: { name: string; avatar: string };
  likesCount: number;
  viewsCount: number;
  isLikedByUser: boolean;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

interface Profile {
  _id: string;
  name: string;
  email: string;
  profileImage: string | null;
  bio: string;
  lastLogin: string | null;
  portfolios: Portfolio[];
}

const ProfileDetails: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleDelete = async (portfolioId: string) => {
    const confirm = window.confirm('Are you sure you want to delete this portfolio?');
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/portfolios/${portfolioId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: profile?._id }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || 'Delete failed');

      toast.success('Portfolio deleted');
      setProfile(prev => prev ? {
        ...prev,
        portfolios: prev.portfolios.filter(p => p._id !== portfolioId)
      } : prev);

    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-600">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!profile) return <div className="text-center py-10 text-gray-600">No profile data</div>;

  const totalPosts = profile.portfolios.length;
  const totalLikes = profile.portfolios.reduce((sum, p) => sum + (p.likesCount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 relative">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden shadow-xl rounded-2xl border border-gray-100 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl mt-6">
          <div className="p-4">
            <RouterLink
              to="/"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition"
            >
              <ArrowLeft size={18} />
              Back to Home
            </RouterLink>
          </div>

          <CardHeader className="text-center py-6 bg-gradient-to-r from-blue-100 to-indigo-100">
            <CardTitle className="text-2xl font-extrabold text-gray-900">
              Hello! {profile.name}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="flex flex-col items-center mb-8">
              <div className="relative cursor-pointer" onClick={() => setShowModal(true)}>
                <Avatar className="h-40 w-40 border-4 border-white shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <AvatarImage src={profile.profileImage || undefined} alt={profile.name} />
                  <AvatarFallback className="text-4xl bg-gray-200">
                    {profile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-green-400 h-6 w-6 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mt-4">{profile.name}</h2>
              <p className="text-gray-600 mt-1">{profile.email}</p>
              <p className="text-gray-500 mt-2 italic">{profile.bio || 'No bio available'}</p>
              <p className="text-sm text-gray-400 mt-1">
                Last Login: {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Never'}
              </p>

              <div className="mt-3 flex gap-4 text-sm text-gray-600">
                <span>📌 Posts: <strong>{totalPosts}</strong></span>
                <span>❤️ Likes: <strong>{totalLikes}</strong></span>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-2">Portfolios</h3>
            {profile.portfolios.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <p className="text-gray-500 mb-4">You haven't posted anything yet.</p>
                <RouterLink
                  to="/create"
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
                >
                  Create Your First Portfolio
                </RouterLink>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.portfolios.map((portfolio) => (
                  <Link key={portfolio._id} to={`/details/${portfolio._id}`} className="group block">
                    <Card className="overflow-hidden shadow-md bg-white hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                      <img
                        src={portfolio.thumbnailUrl}
                        alt={portfolio.title}
                        className="w-full h-48 object-cover transition-opacity duration-300 group-hover:opacity-90"
                      />
                      <CardContent className="p-4 space-y-2">
                        <h4 className="font-medium text-lg text-gray-800 line-clamp-1">{portfolio.title}</h4>
                        <p className="text-sm text-gray-500 line-clamp-2">{portfolio.description || 'No description'}</p>
                        <p className="text-xs text-gray-600">Category: {portfolio.category}</p>
                        <p className="text-xs text-gray-500">Views: {portfolio.viewsCount}</p>
                        <div className="flex justify-between mt-4 gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(`/update/${portfolio._id}`);
                            }}
                            className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition"
                          >
                            Update
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDelete(portfolio._id);
                            }}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showModal && profile.profileImage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="relative bg-white p-2 rounded-lg max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
              onClick={() => setShowModal(false)}
            >
              <X size={24} />
            </button>
            <img
              src={profile.profileImage}
              alt="Full Profile"
              className="rounded-lg w-full h-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDetails;
