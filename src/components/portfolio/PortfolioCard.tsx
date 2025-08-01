import React, { useEffect } from 'react';
import { Heart, Eye, MoreHorizontal, Loader2 } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Portfolio } from '@/types';
import toast from 'react-hot-toast';

interface PortfolioCardProps {
  portfolio: Portfolio;
  onLike: (portfolioId: string) => void;
  onView: (portfolioId: string) => void;
  isAuthenticated: boolean;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  portfolio,
  onLike,
  onView,
  isAuthenticated,
}) => {
  const title = portfolio?.title || 'Untitled';
  const thumbnailUrl = portfolio?.thumbnailUrl || '/placeholder.svg';
  const creatorName = portfolio?.creator?.name || 'Unknown Creator';
  const creatorAvatar = portfolio?.creator?.avatar || '/placeholder.svg';
  const category = portfolio?.category || 'Uncategorized';
  const viewsCount = portfolio?.viewsCount ?? 0;
  const likesCount = portfolio?.likesCount ?? 0;
  const isLikedByUser = portfolio?.isLikedByUser ?? false;
  const isLikeLoading = portfolio?.isLikeLoading ?? false;
  const preview = portfolio?.preview;
  const source = portfolio?.source;
  const createdAt = portfolio?.createdAt;
  const navigate = useNavigate();

  useEffect(() => {
    // console.log('Rendering PortfolioCard for ID:', portfolio?._id, 'isLikedByUser:', isLikedByUser);
  }, [portfolio?._id, isLikedByUser]);

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please log in to like portfolios.')
      navigate("/login")
          // toast({
          //   title: 'Login Required',
          //   description: 'Please log in to like portfolios.',
          //   variant: 'destructive',
          // });

          return;
        }
    if (isAuthenticated && portfolio?._id) {
      // console.log('Calling onLike for portfolio ID:', portfolio._id);
      onLike(portfolio._id);
    }
  };

  const handleView = () => {
    if (onView && portfolio?._id) {
      // console.log('Calling onView for portfolio ID:', portfolio._id);
      onView(portfolio._id);
    }
  };

  return (
    <Card className="group overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 rounded-xl">
      <Link to={`/details/${portfolio?._id || ''}`} onClick={handleView} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-white/80 text-gray-800 font-semibold shadow-md">
              {category}
            </Badge>
          </div>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/80 hover:bg-gray-100 rounded-full shadow-md"
            >
              <MoreHorizontal className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
        <CardContent className="p-5 bg-gray-50">
          <h3 className="font-bold text-xl mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                <AvatarImage src={creatorAvatar} alt={creatorName} className="object-cover" />
                <AvatarFallback className="text-sm bg-gray-200">
                  {creatorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-md font-medium text-gray-800">
                  {creatorName}
                </span>
                <span className="text-xs text-gray-500">
                  {createdAt ? formatTimeAgo(createdAt) : 'Unknown date'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <Eye className="h-5 w-5" />
                <span className="text-md font-semibold">{viewsCount}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={ isLikeLoading}
                className={`transition-colors ${isAuthenticated ? 'hover:text-red-600' : 'cursor-default'}`}
                aria-label={isLikedByUser ? 'Unlike portfolio' : 'Like portfolio'}
              >
                {isLikeLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Heart
                      className={`h-5 w-5 ${isLikedByUser ? 'fill-red-600 text-red-600' : 'fill-none text-gray-600'}`}
                    />
                    <span className="ml-2 text-md font-semibold">{likesCount}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-center gap-6">
              <Button
                disabled={!preview}
                className={`bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg px-4 py-2 transition-all duration-200 ${
                  preview ? 'hover:shadow-md' : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  if (preview) window.open(preview, '_blank');
                }}
              >
                Preview
              </Button>
              <Button
                disabled={!source}
                className={`bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg px-4 py-2 transition-all duration-200 ${
                  source ? 'hover:shadow-md' : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  if (source) window.open(source, '_blank');
                }}
              >
                Source Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

// Utility function
function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return time.toLocaleDateString();
}

export default PortfolioCard;
