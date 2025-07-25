/**
 * Home Page Component
 * 
 * Main landing page that displays the portfolio grid with search and filtering.
 * Implements infinite scrolling and responsive design.
 */

import React, { useState, useEffect } from 'react';
import { Search, Filter, SortAsc } from 'lucide-react';

import { Header } from '@/components/layout/Header';
import { PortfolioCard } from '@/components/portfolio/PortfolioCard';
import { PortfolioGridSkeleton } from '@/components/portfolio/PortfolioSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Portfolio, SearchFilters } from '@/types';
import { portfolioAPI } from '@/services/api';
import { toast } from '@/hooks/use-toast';

// Mock data for initial development
const mockPortfolios: Portfolio[] = [
  {
    id: '1',
    title: 'Modern Web Design Collection',
    description: 'A collection of modern, clean web designs',
    thumbnailUrl: '/placeholder.svg',
    imageUrls: ['/placeholder.svg'],
    category: 'Web Design',
    creatorId: '1',
    creator: {
      name: 'Sarah Johnson',
      avatar: '/placeholder.svg'
    },
    likesCount: 42,
    viewsCount: 1205,
    isLikedByUser: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Brand Identity Project',
    description: 'Complete brand identity design for tech startup',
    thumbnailUrl: '/placeholder.svg',
    imageUrls: ['/placeholder.svg'],
    category: 'Branding',
    creatorId: '2',
    creator: {
      name: 'Alex Chen',
      avatar: '/placeholder.svg'
    },
    likesCount: 87,
    viewsCount: 2340,
    isLikedByUser: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    updatedAt: new Date().toISOString()
  },
  // Add more mock portfolios...
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `${i + 3}`,
    title: `Creative Portfolio ${i + 3}`,
    description: `Amazing creative work showcase ${i + 3}`,
    thumbnailUrl: '/placeholder.svg',
    imageUrls: ['/placeholder.svg'],
    category: ['Photography', 'Illustration', 'UI/UX', 'Web Design'][i % 4],
    creatorId: `${i + 3}`,
    creator: {
      name: `Creator ${i + 3}`,
      avatar: '/placeholder.svg'
    },
    likesCount: Math.floor(Math.random() * 100),
    viewsCount: Math.floor(Math.random() * 5000),
    isLikedByUser: Math.random() > 0.7,
    createdAt: new Date(Date.now() - (i + 1) * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }))
];

const categories = ['All', 'Web Design', 'UI/UX', 'Branding', 'Photography', 'Illustration'];

export const HomePage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    category: undefined,
    sortBy: 'newest',
    page: 1,
    limit: 12
  });

  // Load portfolios
  useEffect(() => {
    loadPortfolios();
  }, [filters]);

  const loadPortfolios = async () => {
    setIsLoading(true);
    try {
      // For now, use mock data. In production, this would be:
      // const response = await portfolioAPI.getPortfolios(filters);
      // setPortfolios(response.items);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredPortfolios = [...mockPortfolios];
      
      // Apply search filter
      if (searchQuery) {
        filteredPortfolios = filteredPortfolios.filter(portfolio =>
          portfolio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          portfolio.creator.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Apply category filter
      if (filters.category && filters.category !== 'All') {
        filteredPortfolios = filteredPortfolios.filter(portfolio =>
          portfolio.category === filters.category
        );
      }
      
      // Apply sorting
      if (filters.sortBy === 'mostLiked') {
        filteredPortfolios.sort((a, b) => b.likesCount - a.likesCount);
      } else if (filters.sortBy === 'mostViewed') {
        filteredPortfolios.sort((a, b) => b.viewsCount - a.viewsCount);
      } else {
        filteredPortfolios.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      
      setPortfolios(filteredPortfolios);
    } catch (error) {
      toast({
        title: "Failed to load portfolios",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({ 
      ...prev, 
      category: category === 'All' ? undefined : category,
      page: 1 
    }));
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ 
      ...prev, 
      sortBy: sortBy as 'newest' | 'mostLiked' | 'mostViewed',
      page: 1 
    }));
  };

  const handleLike = async (portfolioId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to like portfolios.",
        variant: "destructive",
      });
      return;
    }

    try {
      // In production: await portfolioAPI.toggleLike(portfolioId);
      
      // Mock implementation
      setPortfolios(prev => prev.map(portfolio => {
        if (portfolio.id === portfolioId) {
          const isLiked = !portfolio.isLikedByUser;
          return {
            ...portfolio,
            isLikedByUser: isLiked,
            likesCount: portfolio.likesCount + (isLiked ? 1 : -1)
          };
        }
        return portfolio;
      }));
    } catch (error) {
      toast({
        title: "Failed to update like",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleView = (portfolioId: string) => {
    // Increment view count (in production, this would be handled by the backend)
    setPortfolios(prev => prev.map(portfolio => 
      portfolio.id === portfolioId 
        ? { ...portfolio, viewsCount: portfolio.viewsCount + 1 }
        : portfolio
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onSearch={handleSearch}
        onLogout={logout}
        isAuthenticated={isAuthenticated}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Discover Amazing
            <span className="text-primary"> Creative Work</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore thousands of portfolios from talented creators around the world.
            Get inspired, share your work, and connect with the creative community.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search portfolios or creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                className="pl-10"
              />
            </div>

            {/* Sort Dropdown */}
            <Select value={filters.sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="mostLiked">Most Liked</SelectItem>
                <SelectItem value="mostViewed">Most Viewed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={filters.category === category || (category === 'All' && !filters.category) ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryFilter(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        {!isLoading && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing {portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''}
              {searchQuery && ` for "${searchQuery}"`}
              {filters.category && ` in ${filters.category}`}
            </p>
          </div>
        )}

        {/* Portfolio Grid */}
        {isLoading ? (
          <PortfolioGridSkeleton count={12} />
        ) : portfolios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {portfolios.map((portfolio) => (
              <PortfolioCard
                key={portfolio.id}
                portfolio={portfolio}
                onLike={handleLike}
                onView={handleView}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              No portfolios found matching your criteria.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setFilters(prev => ({ ...prev, category: undefined }));
            }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Load More Button (for pagination) */}
        {!isLoading && portfolios.length > 0 && portfolios.length >= (filters.limit || 12) && (
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
            >
              Load More Portfolios
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};