/**
 * TypeScript Type Definitions for Portfolio Library
 * 
 * This file contains all the type definitions used throughout the application.
 * We use simple, well-documented interfaces to ensure type safety and code clarity.
 */

// ============= User & Authentication Types =============

/**
 * User interface - represents a registered user in the system
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Authentication request/response types
 */
export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OTPVerificationRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

// ============= Portfolio Types =============

/**
 * Portfolio interface - represents a creative work submitted by users
 */
export interface Portfolio {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  imageUrls: string[];
  category: string;
  creatorId: string;
  creator: {
    name: string;
    avatar?: string;
  };
  likesCount: number;
  viewsCount: number;
  isLikedByUser?: boolean; // Only present when user is authenticated
  createdAt: string;
  updatedAt: string;
}

/**
 * Portfolio creation/update request types
 */
export interface CreatePortfolioRequest {
  title: string;
  description?: string;
  thumbnailUrl: string;
  imageUrls: string[];
  category: string;
}

export interface UpdatePortfolioRequest extends Partial<CreatePortfolioRequest> {
  id: string;
}

// ============= API Response Types =============

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Paginated response for lists (portfolios, users, etc.)
 */
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ============= Component Props Types =============

/**
 * Common loading states used across components
 */
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

/**
 * Portfolio card component props
 */
export interface PortfolioCardProps {
  portfolio: Portfolio;
  onLike?: (portfolioId: string) => void;
  onView?: (portfolioId: string) => void;
}

/**
 * Auth form component props
 */
export interface AuthFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  error?: string;
}

// ============= Search & Filter Types =============

export interface SearchFilters {
  query?: string;
  category?: string;
  sortBy?: 'newest' | 'mostLiked' | 'mostViewed';
  page?: number;
  limit?: number;
}

// ============= Form Validation Types =============

/**
 * These types are used with react-hook-form and zod for form validation
 */
export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface OTPFormData {
  otp: string;
}

export interface PortfolioFormData {
  title: string;
  description?: string;
  category: string;
  thumbnailFile?: File;
  imageFiles?: File[];
}