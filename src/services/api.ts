/**
 * API Service Layer
 * 
 * This service handles all HTTP requests to our backend API.
 * It uses axios for HTTP client and provides type-safe API calls.
 */

import axios, { AxiosResponse } from 'axios';
import { 
  AuthResponse, 
  SignupRequest, 
  LoginRequest, 
  OTPVerificationRequest,
  Portfolio,
  CreatePortfolioRequest,
  UpdatePortfolioRequest,
  ApiResponse,
  PaginatedResponse,
  SearchFilters 
} from '@/types';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (401, 403, etc.)
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============= Authentication API =============

export const authAPI = {
  /**
   * Register a new user account
   */
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/signup', data);
    return response.data;
  },

  /**
   * Verify OTP after signup
   */
  verifyOTP: async (data: OTPVerificationRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/verify-otp', data);
    return response.data;
  },

  /**
   * Login with email and password
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/login', data);
    return response.data;
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password with OTP
   */
  resetPassword: async (email: string, otp: string, newPassword: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/auth/reset-password', {
      email,
      otp,
      newPassword,
    });
    return response.data;
  },
};

// ============= Portfolio API =============

export const portfolioAPI = {
  /**
   * Get all portfolios with optional filters
   */
  getPortfolios: async (filters?: SearchFilters): Promise<PaginatedResponse<Portfolio>> => {
    const params = new URLSearchParams();
    if (filters?.query) params.append('query', filters.query);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response: AxiosResponse<PaginatedResponse<Portfolio>> = await apiClient.get(
      `/portfolios?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get a single portfolio by ID
   */
  getPortfolio: async (id: string): Promise<Portfolio> => {
    const response: AxiosResponse<{ data: Portfolio }> = await apiClient.get(`/portfolios/${id}`);
    return response.data.data;
  },

  /**
   * Create a new portfolio (requires authentication)
   */
  createPortfolio: async (data: CreatePortfolioRequest): Promise<Portfolio> => {
    const response: AxiosResponse<{ data: Portfolio }> = await apiClient.post('/portfolios', data);
    return response.data.data;
  },

  /**
   * Update an existing portfolio (requires authentication & ownership)
   */
  updatePortfolio: async (data: UpdatePortfolioRequest): Promise<Portfolio> => {
    const response: AxiosResponse<{ data: Portfolio }> = await apiClient.patch(
      `/portfolios/${data.id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete a portfolio (requires authentication & ownership)
   */
  deletePortfolio: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(`/portfolios/${id}`);
    return response.data;
  },

  /**
   * Like or unlike a portfolio (requires authentication)
   */
  toggleLike: async (id: string): Promise<{ likesCount: number; isLiked: boolean }> => {
    const response: AxiosResponse<{ data: { likesCount: number; isLiked: boolean } }> = 
      await apiClient.patch(`/portfolios/${id}/like`);
    return response.data.data;
  },
};

// ============= Utility Functions =============

/**
 * Store authentication token
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

/**
 * Remove authentication token
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token');
};