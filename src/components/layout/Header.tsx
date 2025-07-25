/**
 * Header Component
 * 
 * Main navigation header with logo, search, and user actions.
 * Responsive design that adapts to different screen sizes.
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Menu, User, LogOut, Settings, Palette } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { User as UserType } from '@/types';

interface HeaderProps {
  user?: UserType | null;
  onSearch?: (query: string) => void;
  onLogout?: () => void;
  isAuthenticated?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onSearch,
  onLogout,
  isAuthenticated = false
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleCreatePortfolio = () => {
    if (isAuthenticated) {
      navigate('/create');
    } else {
      navigate('/login');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary rounded-lg p-2">
              <Palette className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline-block font-bold text-xl">
              Portfolio Library
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search portfolios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Create Portfolio Button */}
            <Button
              onClick={handleCreatePortfolio}
              className="hidden sm:flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create</span>
            </Button>

            {/* User Menu or Auth Buttons */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name || user.email} />
                      <AvatarFallback>
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Button variant="ghost" onClick={handleLogin}>
                  Log in
                </Button>
                <Button onClick={handleSignup}>
                  Sign up
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="sm:hidden"
                  size="icon"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="flex">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search portfolios..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </form>

                  {/* Mobile Create Button */}
                  <Button
                    onClick={handleCreatePortfolio}
                    className="w-full justify-start"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Portfolio
                  </Button>

                  {/* Mobile Auth/User Menu */}
                  {isAuthenticated && user ? (
                    <div className="space-y-2">
                      <div className="px-3 py-2 border rounded-lg">
                        <p className="text-sm font-medium">{user.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => navigate('/profile')}
                        className="w-full justify-start"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                        className="w-full justify-start"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={onLogout}
                        className="w-full justify-start text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        onClick={handleLogin}
                        className="w-full justify-start"
                      >
                        Log in
                      </Button>
                      <Button
                        onClick={handleSignup}
                        className="w-full justify-start"
                      >
                        Sign up
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};