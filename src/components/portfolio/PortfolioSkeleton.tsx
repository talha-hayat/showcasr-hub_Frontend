/**
 * Portfolio Card Skeleton Component
 * 
 * Loading placeholder for portfolio cards that matches the exact layout
 * of the actual PortfolioCard component for seamless transitions.
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const PortfolioSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/3]">
        <Skeleton className="w-full h-full" />
        {/* Category Badge Skeleton */}
        <div className="absolute top-3 left-3">
          <Skeleton className="h-6 w-20" />
        </div>
      </div>

      <CardContent className="p-4">
        {/* Title Skeleton */}
        <div className="mb-3">
          <Skeleton className="h-6 w-3/4 mb-1" />
          <Skeleton className="h-6 w-1/2" />
        </div>

        {/* Creator and Metadata Row */}
        <div className="flex items-center justify-between">
          {/* Creator Info Skeleton */}
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex flex-col space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-8" />
            </div>
            <div className="flex items-center space-x-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Portfolio Grid Skeleton
 * 
 * Displays multiple skeleton cards in a grid layout
 */
interface PortfolioGridSkeletonProps {
  count?: number;
}

export const PortfolioGridSkeleton: React.FC<PortfolioGridSkeletonProps> = ({ 
  count = 12 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <PortfolioSkeleton key={index} />
      ))}
    </div>
  );
};