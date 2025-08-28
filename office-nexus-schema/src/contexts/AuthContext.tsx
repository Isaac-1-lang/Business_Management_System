/**
 * AUTHENTICATION CONTEXT - Global Auth State Management
 * 
 * This context provides:
 * - User authentication state
 * - Login/logout functionality
 * - User profile management
 * - Company selection
 * - Protected route handling
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { apiService, User, Company, LoginRequest, RegisterRequest, ApiResponse } from '../services/apiService';

// Auth State Interface
interface AuthState {
  user: User | null;
  companies: Company[];
  selectedCompany: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; companies: Company[] } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_SELECTED_COMPANY'; payload: Company }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' };

// Initial State
const initialState: AuthState = {
  user: null,
  companies: [],
  selectedCompany: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        companies: action.payload.companies,
        selectedCompany: action.payload.companies[0] || null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        companies: [],
        selectedCompany: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        companies: [],
        selectedCompany: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'SET_SELECTED_COMPANY':
      return {
        ...state,
        selectedCompany: action.payload,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Auth Context Interface
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  setSelectedCompany: (company: Company) => void;
  updateUser: (user: User) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Check if user is authenticated
  const checkAuth = async (): Promise<void> => {
    if (!apiService.isAuthenticated()) {
      dispatch({ type: 'AUTH_FAILURE', payload: 'No authentication token' });
      return;
    }

    try {
      dispatch({ type: 'AUTH_START' });
      const response: ApiResponse<{ user: User; companies: Company[] }> = await apiService.getCurrentUser();

      if (response.success && response.data) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            companies: response.data.companies,
          },
        });
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.message || 'Authentication failed' });
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: 'Failed to check authentication status' });
    }
  };

  // Login function
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiService.login(credentials);

      if (response.success && response.data) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            companies: response.data.companies,
          },
        });
        return true;
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.message || 'Login failed' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: 'Login failed' });
      return false;
    }
  };

  // Register function
  const register = async (userData: RegisterRequest): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiService.register(userData);

      if (response.success && response.data) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            companies: [],
          },
        });
        return true;
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.message || 'Registration failed' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: 'Registration failed' });
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Set selected company
  const setSelectedCompany = (company: Company): void => {
    dispatch({ type: 'SET_SELECTED_COMPANY', payload: company });
  };

  // Update user profile
  const updateUser = (user: User): void => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  // Clear error
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Context value
  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    setSelectedCompany,
    updateUser,
    clearError,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export types
export type { AuthState, AuthAction, AuthContextType };
