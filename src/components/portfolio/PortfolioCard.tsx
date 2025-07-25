/**
 * Portfolio Card Component
 * 
 * Displays a single portfolio in a card format with image, metadata, and actions.
 * Implements the Dribbble/Behance-inspired design with hover effects.
 */

import React from 'react';
import { Heart, Eye, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Portfolio } from '@/types';


interface PortfolioCardProps {
  portfolio: Portfolio;
  onLike?: (portfolioId: string) => void;
  onView?: (portfolioId: string) => void;
  isAuthenticated?: boolean;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  portfolio,
  onLike,
  onView,
  isAuthenticated = false
}) => {
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking like
    if (isAuthenticated && onLike) {
      onLike(portfolio.id);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(portfolio.id);
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <Link to={`/portfolio/${portfolio.id}`} onClick={handleView}>
        {/* Portfolio Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={portfolio.thumbnailUrl}
            alt={portfolio.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-background/90 text-foreground">
              {portfolio.category}
            </Badge>
          </div>

          {/* Action Buttons Overlay */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/90 hover:bg-background"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Portfolio Title */}
          <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {portfolio.title}
          </h3>

          {/* Creator and Metadata Row */}
          <div className="flex items-center justify-between">
            {/* Creator Info */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={portfolio.creator.avatar} 
                  alt={portfolio.creator.name}
                />
                <AvatarFallback className="text-xs">
                  {portfolio.creator.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {portfolio.creator.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(portfolio.createdAt)}
                </span>
              </div>
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center space-x-4">
              {/* Views */}
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span className="text-sm">{portfolio.viewsCount}</span>
              </div>

              {/* Likes */}
              <button
                onClick={handleLike}
                disabled={!isAuthenticated}
                className={`flex items-center space-x-1 transition-colors ${
                  isAuthenticated 
                    ? 'hover:text-red-500 cursor-pointer' 
                    : 'cursor-default'
                } ${
                  portfolio.isLikedByUser ? 'text-red-500' : 'text-muted-foreground'
                }`}
              >
                <Heart 
                  className={`h-4 w-4 ${
                    portfolio.isLikedByUser ? 'fill-current' : ''
                  }`} 
                />
                <span className="text-sm">{portfolio.likesCount}</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 * This is a simple utility function - in a real app you might use date-fns or similar
 */
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