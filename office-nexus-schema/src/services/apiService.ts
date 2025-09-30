/**
 * API SERVICE - Centralized Backend Communication
 * 
 * This service handles all API calls to the backend with:
 * - Automatic authentication token management
 * - Error handling and retry logic
 * - Request/response interceptors
 * - Type-safe API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  code?: string;
  timestamp?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  tin: string;
  vatNumber?: string;
  rdbRegistration?: string;
  address: {
    street: string;
    city: string;
    district: string;
    sector: string;
    cell: string;
    postalCode?: string;
  };
  phone: string;
  email: string;
  website?: string;
  industry: string;
  size: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  companyId?: string;
}

// API Service Class
class ApiService {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadTokens();
  }

  // Token Management
  private loadTokens(): void {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  private saveTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Request Headers
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  // HTTP Request Helper
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();

      // Handle token refresh if needed
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the original request
          config.headers = this.getHeaders();
          const retryResponse = await fetch(url, config);
          return await retryResponse.json();
        }
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        message: 'Network error occurred',
        error: 'NETWORK_ERROR',
      };
    }
  }

  // Token Refresh
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data: ApiResponse<AuthTokens> = await response.json();

      if (data.success && data.data) {
        this.saveTokens(data.data);
        return true;
      } else {
        this.clearTokens();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    }
  }

  // Authentication Methods
  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: User; companies: Company[]; tokens: AuthTokens }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    this.clearTokens();
    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User; companies: Company[] }>> {
    return this.request('/users/me');
  }

  // Company Methods
  async getCompanies(): Promise<ApiResponse<Company[]>> {
    return this.request('/companies');
  }

  async getCompany(id: string): Promise<ApiResponse<Company>> {
    return this.request(`/companies/${id}`);
  }

  async createCompany(companyData: Partial<Company>): Promise<ApiResponse<Company>> {
    return this.request('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  async updateCompany(id: string, companyData: Partial<Company>): Promise<ApiResponse<Company>> {
    return this.request(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companyData),
    });
  }

  // Employee Methods
  async getEmployees(companyId?: string): Promise<ApiResponse<any[]>> {
    const params = companyId ? `?companyId=${companyId}` : '';
    return this.request(`/employees${params}`);
  }

  async getEmployee(id: string): Promise<ApiResponse<any>> {
    return this.request(`/employees/${id}`);
  }

  async createEmployee(employeeData: any): Promise<ApiResponse<any>> {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  }

  async updateEmployee(id: string, employeeData: any): Promise<ApiResponse<any>> {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  }

  // Tax Methods
  async getTaxReturns(): Promise<ApiResponse<any[]>> {
    return this.request('/tax/returns');
  }

  async getTaxRates(): Promise<ApiResponse<any>> {
    return this.request('/tax/rates');
  }

  async calculateTax(taxData: any): Promise<ApiResponse<any>> {
    return this.request('/tax/calculate', {
      method: 'POST',
      body: JSON.stringify(taxData),
    });
  }

  // Compliance Methods
  async getComplianceAlerts(): Promise<ApiResponse<any[]>> {
    return this.request('/compliance/alerts');
  }

  async getComplianceStatus(): Promise<ApiResponse<any>> {
    return this.request('/compliance/status');
  }

  // Notification Methods
  async getNotifications(): Promise<ApiResponse<any[]>> {
    return this.request('/notifications');
  }

  async markNotificationRead(id: string): Promise<ApiResponse> {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead(): Promise<ApiResponse> {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // Report Methods
  async getReports(): Promise<ApiResponse<any[]>> {
    return this.request('/reports');
  }

  async generateReport(reportType: string, params?: any): Promise<ApiResponse<any>> {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ type: reportType, ...params }),
    });
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }

  // Accounting - Transactions
  async getAccountingTransactions(params?: {
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any[]>> {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.limit !== undefined) query.set('limit', String(params.limit));
    const qs = query.toString();
    const endpoint = qs ? `/accounting/transactions?${qs}` : '/accounting/transactions';
    return this.request(endpoint);
  }

  async getAccountingTransaction(id: string): Promise<ApiResponse<any>> {
    return this.request(`/accounting/transactions/${id}`);
  }

  async createAccountingTransaction(payload: any): Promise<ApiResponse<any>> {
    return this.request('/accounting/transactions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Accounting - Ledger & Reports
  async getAccountingLedger(params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    const qs = query.toString();
    const endpoint = qs ? `/accounting/ledger?${qs}` : '/accounting/ledger';
    return this.request(endpoint);
  }

  async getTrialBalance(params?: { asOfDate?: string }): Promise<ApiResponse<any>> {
    // Backend supports startDate/endDate; we map asOfDate to endDate for convenience
    const query = new URLSearchParams();
    if (params?.asOfDate) query.set('endDate', params.asOfDate);
    const qs = query.toString();
    const endpoint = qs ? `/accounting/trial-balance?${qs}` : '/accounting/trial-balance';
    return this.request(endpoint);
  }

  async getAccountingStats(): Promise<ApiResponse<any>> {
    return this.request('/accounting/stats');
  }

  // Dividends
  async getDividendDeclarations(): Promise<ApiResponse<{ declarations: any[] }>> {
    return this.request('/dividends');
  }

  async createDividendDeclaration(payload: any): Promise<ApiResponse<{ declaration: any }>> {
    return this.request('/dividends', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async confirmDividendDeclaration(id: string): Promise<ApiResponse<{ declaration: any }>> {
    return this.request(`/dividends/${id}/confirm`, { method: 'POST' });
  }

  async calculateDividendDistributions(id: string, shareholders: any[]): Promise<ApiResponse<{ distributions: any[] }>> {
    return this.request(`/dividends/${id}/distributions/calculate`, {
      method: 'POST',
      body: JSON.stringify({ shareholders })
    });
  }

  async getDividendDistributions(id: string): Promise<ApiResponse<{ distributions: any[] }>> {
    return this.request(`/dividends/${id}/distributions`);
  }

  async payDividend(distributionId: string, payment_proof_url?: string): Promise<ApiResponse<{ distribution: any }>> {
    return this.request(`/dividends/distributions/${distributionId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ payment_proof_url })
    });
  }

  // Utility Methods
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}

// Create and export singleton instance
export const apiService = new ApiService(API_BASE_URL);

// Export types for use in components
export type { ApiResponse, AuthTokens, User, Company, LoginRequest, RegisterRequest };
