import React, { useState, useEffect, useMemo } from 'react';
import { Search, SortAsc, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { PortfolioCard } from '@/components/portfolio/PortfolioCard';
import { PortfolioGridSkeleton } from '@/components/portfolio/PortfolioSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { toast } from '@/hooks/use-toast';
import { debounce } from 'lodash';

const categories = ['All', 'Web Design', 'UI/UX', 'Branding', 'Photography', 'Illustration'];

export const HomePage = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: undefined,
    sortBy: 'newest',
    page: 1,
    limit: 12,
  });
  const [hasMore, setHasMore] = useState(true);

  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  const user = JSON.parse(localStorage.getItem('user')) || null;

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  // Fetch user's liked portfolios on initial load
  const fetchUserLikes = async () => {
    if (!isAuthenticated) return;
    
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/portfolios`, {
        params: {
          page: 1,
          limit: 100, // Adjust based on your needs
          sortBy: 'newest'
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      // Create a map of liked portfolio IDs
      const likedPortfolios = res.data.data.reduce((acc, portfolio) => {
        if (portfolio.isLikedByUser) {
          acc[portfolio._id] = true;
        }
        return acc;
      }, {});

      // Update existing portfolios with like status
      setPortfolios(prev => 
        prev.map(p => ({
          ...p,
          isLikedByUser: likedPortfolios[p._id] || false
        }))
      );
    } catch (err) {
      console.error('Failed to fetch user likes:', err);
    }
  };

  const fetchPortfolios = async (reset = false) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/portfolios`, {
        params: {
          page: filters.page,
          limit: filters.limit,
          category: filters.category,
          sortBy: filters.sortBy,
          searchQuery,
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const newPortfolios = Array.isArray(res.data.data) ? res.data.data : [];
      setPortfolios(prev => (reset ? newPortfolios : [...prev, ...newPortfolios]));
      setHasMore(newPortfolios.length >= filters.limit);
      
      // If resetting, fetch user likes
      if (reset && isAuthenticated) {
        fetchUserLikes();
      }
    } catch (err) {
      console.error('Fetch Portfolios Error:', err.response || err);
      toast({
        title: 'Error',
        description: 'Failed to load portfolios. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleCategoryFilter = (category) => {
    setFilters(prev => ({
      ...prev,
      category: category === 'All' ? undefined : category,
      page: 1,
    }));
  };

  const handleSortChange = (sortBy) => {
    setFilters(prev => ({ ...prev, sortBy, page: 1 }));
  };

  const handleLike = async (portfolioId) => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please log in to like portfolios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Optimistic update
      setPortfolios(prev =>
        prev.map(p =>
          p._id === portfolioId 
            ? { 
                ...p, 
                isLikedByUser: !p.isLikedByUser,
                likesCount: p.isLikedByUser ? p.likesCount - 1 : p.likesCount + 1,
                isLikeLoading: true
              } 
            : p
        )
      );

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/portfolios/${portfolioId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Sync with server response
      const { likesCount, isLikedByUser } = response.data;
      setPortfolios(prev =>
        prev.map(p =>
          p._id === portfolioId 
            ? { 
                ...p, 
                isLikedByUser, 
                likesCount,
                isLikeLoading: false
              } 
            : p
        )
      );
    } catch (err) {
      console.error('Like Error:', err.response || err);
      toast({
        title: 'Error',
        description: 'Failed to like/unlike portfolio.',
        variant: 'destructive',
      });
      
      // Revert optimistic update on error
      setPortfolios(prev =>
        prev.map(p =>
          p._id === portfolioId 
            ? { 
                ...p, 
                isLikedByUser: !p.isLikedByUser,
                likesCount: p.isLikedByUser ? p.likesCount + 1 : p.likesCount - 1,
                isLikeLoading: false
              } 
            : p
        )
      );
    }
  };

  const handleView = useMemo(
    () => debounce(async (portfolioId) => {
      try {
        await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/portfolios/${portfolioId}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
      } catch (err) {
        console.error('View Error:', err);
      }
    }, 1000),
    [token]
  );

  const loadMore = () => {
    setFilters(prev => ({ ...prev, page: prev.page + 1 }));
  };

  useEffect(() => {
    fetchPortfolios(true);
  }, [filters.category, filters.sortBy, searchQuery]);

  useEffect(() => {
    if (filters.page > 1) {
      fetchPortfolios(false);
    }
  }, [filters.page]);

  return (
     <div className="min-h-screen bg-background">
      <Header
        user={user}
        onSearch={handleSearch}
        onLogout={logout}
        isAuthenticated={isAuthenticated}
      />
      <main className="container mx-auto px-4 py-8 mt-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Discover Amazing <span className="text-primary">Creative Work</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore thousands of portfolios from talented creators around the world.
          </p>
        </div>
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
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
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={
                  filters.category === category || (!filters.category && category === 'All')
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                onClick={() => handleCategoryFilter(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        {!isLoading && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing {portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''}
              {searchQuery && ` for "${searchQuery}"`}
              {filters.category && ` in ${filters.category}`}
            </p>
          </div>
        )}
        {isLoading ? (
          <PortfolioGridSkeleton count={12} />
        ) : portfolios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {portfolios.map((portfolio) => (
              <PortfolioCard
                key={portfolio._id}
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
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setFilters((prev) => ({ ...prev, category: undefined, page: 1 }));
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
        {!isLoading && hasMore && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" onClick={loadMore}>
              Load More Portfolios
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};