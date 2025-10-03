/**
 * USER SERVICE - User Management API
 * 
 * This service handles all user-related API operations including:
 * - User CRUD operations
 * - Role management
 * - User statistics
 */

import { apiService, ApiResponse } from './apiService';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'owner' | 'manager' | 'accountant' | 'hr' | 'employee' | 'viewer';
  permissions: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  department?: string;
  avatar?: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  department?: string;
  permissions?: string[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  department?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Array<{ role: string; count: number }>;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class UserService {
  /**
   * Get all users with pagination and filtering
   */
  static async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<UsersResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    
    return apiService.request<UsersResponse>(endpoint);
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<ApiResponse<{ user: User; companies: any[] }>> {
    return apiService.request<{ user: User; companies: any[] }>('/users/me');
  }

  /**
   * Get specific user by ID
   */
  static async getUser(id: string): Promise<ApiResponse<{ user: User; companies: any[] }>> {
    return apiService.request<{ user: User; companies: any[] }>(`/users/${id}`);
  }

  /**
   * Create new user
   */
  static async createUser(userData: CreateUserRequest): Promise<ApiResponse<{ user: User }>> {
    return apiService.request<{ user: User }>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Update user profile (self)
   */
  static async updateProfile(userData: UpdateUserRequest): Promise<ApiResponse<{ user: User }>> {
    return apiService.request<{ user: User }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Update user by ID (admin only)
   */
  static async updateUser(id: string, userData: UpdateUserRequest): Promise<ApiResponse<{ user: User }>> {
    return apiService.request<{ user: User }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Delete user by ID (admin only)
   */
  static async deleteUser(id: string): Promise<ApiResponse> {
    return apiService.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Activate user account
   */
  static async activateUser(id: string): Promise<ApiResponse> {
    return apiService.request(`/users/${id}/activate`, {
      method: 'POST',
    });
  }

  /**
   * Deactivate user account
   */
  static async deactivateUser(id: string): Promise<ApiResponse> {
    return apiService.request(`/users/${id}/deactivate`, {
      method: 'POST',
    });
  }

  /**
   * Get all available roles
   */
  static async getRoles(): Promise<ApiResponse<{ roles: UserRole[] }>> {
    return apiService.request<{ roles: UserRole[] }>('/users/roles');
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<ApiResponse<UserStats>> {
    return apiService.request<UserStats>('/users/stats');
  }

  /**
   * Get companies for a specific user
   */
  static async getUserCompanies(id: string): Promise<ApiResponse<{ companies: any[] }>> {
    return apiService.request<{ companies: any[] }>(`/users/${id}/companies`);
  }
}

export default UserService;
