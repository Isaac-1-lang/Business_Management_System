/**
 * API SERVICE - Centralized Backend Communication
 * 
 * This service handles all API calls to the backend with:
 * - Automatic authentication token management
 * - Error handling and retry logic
 * - Request/response interceptors
 * - Type-safe API calls
 */

const API_BASE_URL = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:5000/api/v1';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  code?: string;
  timestamp?: string;
  retryAfter?: number;
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
  company?: {
    name: string;
    tin?: string;
  };
}

// API Service Class
class ApiService {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5000; // 5 seconds cache for GET requests

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load tokens from localStorage on initialization
    this.loadTokensFromStorage();
    // Log the API base URL for debugging
    console.log('🔗 API Service initialized with base URL:', this.baseURL);
  }

  // Get current user's company ID dynamically
  private async getCurrentCompanyId(): Promise<string | null> {
    try {
      // First check if we have a selected company in localStorage
      const selectedCompanyId = localStorage.getItem('selectedCompanyId');
      if (selectedCompanyId && selectedCompanyId.trim() !== '' && !selectedCompanyId.includes('test-company') && !selectedCompanyId.includes('dev')) {
        console.log('✅ Using company ID from localStorage:', selectedCompanyId);
        return selectedCompanyId;
      }

      // If no valid company ID, fetch user info to get companies
      console.log('🔍 Fetching user companies to get company ID...');
      const response = await this.getCurrentUser();
      if (response.success && response.data) {
        const companies = response.data.companies || [];
        console.log('📋 User companies:', companies.length, 'found');
        
        if (companies.length > 0) {
          const firstCompany = companies[0];
          const companyId = firstCompany.id ? String(firstCompany.id) : null;
          if (companyId) {
            localStorage.setItem('selectedCompanyId', companyId);
            console.log('✅ Auto-selected company:', firstCompany.name || 'Unnamed', '(ID:', companyId, ')');
            return companyId;
          } else {
            console.warn('⚠️ Company object found but no ID:', firstCompany);
          }
        } else {
          console.warn('⚠️ User has no companies associated. Please create or join a company first.');
          console.log('💡 Response data:', JSON.stringify(response.data, null, 2));
        }
      } else {
        console.warn('⚠️ Failed to get user info:', response.message || response.error);
      }

      // If still no company, return null
      console.warn('⚠️ No company ID available');
      return null;
    } catch (error) {
      console.error('❌ Error getting current company ID:', error);
      const fallbackId = localStorage.getItem('selectedCompanyId');
      if (fallbackId && fallbackId.trim() !== '') {
        return fallbackId;
      }
      return null;
    }
  }

  private loadTokensFromStorage(): void {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  // Token Management

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
    // Always refresh tokens from localStorage before making requests
    this.loadTokensFromStorage();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  // HTTP Request Helper
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Check cache for GET requests
    const isGetRequest = !options.method || options.method === 'GET';
    const cacheKey = `${options.method || 'GET'}:${url}`;
    
    if (isGetRequest) {
      const cached = this.requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        console.log('📦 Using cached response for:', endpoint);
        return cached.data;
      }
    }
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Check content type to determine if response is JSON
      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      
      // Handle 401 errors in development mode (before parsing response)
      if (response.status === 401) {
        const testCompanyId = localStorage.getItem('selectedCompanyId');
        if (testCompanyId && (testCompanyId.includes('test') || testCompanyId.includes('dev'))) {
          console.warn('Development mode: API returned 401, returning mock success response');
          return {
            success: true,
            message: 'Development mode - mock response',
            data: {} as T,
          };
        }
        
        // Try token refresh if we have a refresh token
        if (this.refreshToken) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry the original request
            config.headers = this.getHeaders();
            const retryResponse = await fetch(url, config);
            const retryContentType = retryResponse.headers.get('content-type') || '';
            if (retryContentType.includes('application/json')) {
              try {
                return await retryResponse.json();
              } catch (e) {
                const retryText = await retryResponse.text().catch(() => 'Unable to read response');
                return {
                  success: false,
                  message: `Retry failed: ${retryText.substring(0, 200)}`,
                  error: 'INVALID_RESPONSE',
                };
              }
            } else {
              const retryText = await retryResponse.text().catch(() => 'Unable to read response');
              return {
                success: false,
                message: `Retry failed: ${retryText.substring(0, 200)}`,
                error: 'INVALID_RESPONSE',
              };
            }
          }
        }
      }

      // Handle rate limiting (429)
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60';
        console.warn(`⚠️ Rate limit exceeded. Please wait ${retryAfter} seconds before making more requests.`);
        return {
          success: false,
          message: `Too many requests. Please wait ${retryAfter} seconds and try again.`,
          error: 'RATE_LIMIT_EXCEEDED',
          retryAfter: parseInt(retryAfter),
        };
      }

      // Handle non-JSON responses (like HTML error pages)
      if (!isJson) {
        const text = await response.text();
        console.error(`API returned non-JSON response (${response.status}):`, text.substring(0, 200));
        
        // If it's a 404, provide a helpful error message
        if (response.status === 404) {
          return {
            success: false,
            message: `API endpoint not found: ${url}. Make sure the backend server is running on port 5000 (http://localhost:5000/api/v1).`,
            error: 'ENDPOINT_NOT_FOUND',
          };
        }
        
        // If it's a 409 Conflict (user already exists)
        if (response.status === 409) {
          return {
            success: false,
            message: 'An account with this email already exists. Please try logging in instead.',
            error: 'USER_EXISTS',
          };
        }
        
        // If it's a 400 Bad Request
        if (response.status === 400) {
          return {
            success: false,
            message: 'Invalid request. Please check your input and try again.',
            error: 'BAD_REQUEST',
          };
        }
        
        // If it's a 429, handle it
        if (response.status === 429) {
          return {
            success: false,
            message: 'Too many requests. Please wait a moment and try again.',
            error: 'RATE_LIMIT_EXCEEDED',
          };
        }
        
        return {
          success: false,
          message: `Server returned ${response.status} with non-JSON response`,
          error: 'INVALID_RESPONSE',
        };
      }

      // Handle specific status codes before parsing JSON
      if (response.status === 409) {
        // User already exists
        try {
          const data = await response.json();
          return {
            success: false,
            message: data.message || 'An account with this email already exists. Please try logging in instead.',
            error: 'USER_EXISTS',
            data: data.data,
          };
        } catch {
          return {
            success: false,
            message: 'An account with this email already exists. Please try logging in instead.',
            error: 'USER_EXISTS',
          };
        }
      }

      if (response.status === 400) {
        // Bad request - validation error
        try {
          const data = await response.json();
          console.error('400 Bad Request response:', data);
          
          // Format validation errors for display
          let errorMessage = data.message || 'Invalid request. Please check your input.';
          if (data.data && Array.isArray(data.data) && data.data.length > 0) {
            const errorDetails = data.data.map((err: any) => {
              const field = err.param || err.field || '';
              const msg = err.msg || err.message || '';
              return field ? `${field}: ${msg}` : msg;
            }).join(', ');
            if (errorDetails) {
              errorMessage = `${errorMessage}: ${errorDetails}`;
            }
          } else if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
            const errorDetails = data.errors.map((err: any) => {
              const field = err.param || err.field || '';
              const msg = err.msg || err.message || '';
              return field ? `${field}: ${msg}` : msg;
            }).join(', ');
            if (errorDetails) {
              errorMessage = `${errorMessage}: ${errorDetails}`;
            }
          }
          
          return {
            success: false,
            message: errorMessage,
            error: data.code || 'VALIDATION_ERROR',
            data: data.data || data.errors,
          };
        } catch (e) {
          console.error('Failed to parse 400 error response:', e);
          return {
            success: false,
            message: 'Invalid request. Please check your input and try again.',
            error: 'BAD_REQUEST',
          };
        }
      }

      // Parse JSON response
      let data: ApiResponse<T>;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, try to read as text for better error message
        // Note: This won't work if we already tried to read the response, but we haven't
        const text = await response.text().catch(() => 'Unable to read response');
        console.error('Failed to parse JSON response:', text.substring(0, 200));
        return {
          success: false,
          message: `Invalid JSON response from server: ${text.substring(0, 100)}`,
          error: 'INVALID_JSON',
        };
      }
      
      // Cache successful GET responses
      if (isGetRequest && data.success && response.status === 200) {
        this.requestCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
      }
      
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      
      // Development mode fallback
      const testCompanyId = localStorage.getItem('selectedCompanyId');
      if (testCompanyId && (testCompanyId.includes('test') || testCompanyId.includes('dev'))) {
        console.warn('Development mode: Network error, returning mock success response');
        return {
          success: true,
          message: 'Development mode - mock response due to network error',
          data: {} as T,
        };
      }
      
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
    const response = await this.makeRequest<{ user: User; companies: Company[]; tokens: AuthTokens }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // If login successful, save tokens and set company automatically
    if (response.success && response.data && response.data.tokens) {
      this.saveTokens(response.data.tokens);
      
      // Auto-select the first company if available
      if (response.data.companies && response.data.companies.length > 0) {
        const firstCompany = response.data.companies[0];
        localStorage.setItem('selectedCompanyId', firstCompany.id);
        console.log('✅ Login successful, auto-selected company:', firstCompany.name);
      } else {
        console.log('✅ Login successful, but no companies found');
      }
    }
    
    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: User; companies: Company[]; tokens: AuthTokens }>> {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.makeRequest('/auth/logout', {
      method: 'POST',
    });
    this.clearTokens();
    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User; companies: Company[] }>> {
    return this.makeRequest('/users/me');
  }

  // Company Methods
  async getCompanies(): Promise<ApiResponse<{ companies: Company[] }>> {
    return this.makeRequest('/companies');
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
  async getAccountingLedger(params?: { startDate?: string; endDate?: string; companyId?: string }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    
    // Get companyId from params or try to get it automatically
    let companyId = params?.companyId;
    if (!companyId) {
      companyId = await this.getCurrentCompanyId();
    }
    
    // CompanyId is required for this endpoint
    if (!companyId) {
      console.error('❌ No company ID available for ledger request');
      return {
        success: false,
        message: 'Company ID is required. Please select a company first.',
        error: 'COMPANY_ID_REQUIRED',
      };
    }
    
    query.set('companyId', companyId);
    console.log('🔗 Fetching ledger for company:', companyId);
    
    const qs = query.toString();
    const endpoint = `/accounting/ledger?${qs}`;
    return this.request(endpoint);
  }

  async getTrialBalance(params?: { asOfDate?: string; companyId?: string }): Promise<ApiResponse<any>> {
    // Backend supports startDate/endDate; we map asOfDate to endDate for convenience
    const query = new URLSearchParams();
    if (params?.asOfDate) query.set('endDate', params.asOfDate);
    
    // Ensure companyId is included
    let companyId = params?.companyId;
    if (!companyId) {
      companyId = await this.getCurrentCompanyId();
    }
    
    if (!companyId) {
      console.error('❌ No company ID available for trial balance request');
      return {
        success: false,
        message: 'Company ID is required. Please select a company first.',
        error: 'COMPANY_ID_REQUIRED',
      };
    }
    
    query.set('companyId', companyId);
    console.log('🔗 Fetching trial balance for company:', companyId);
    
    const qs = query.toString();
    const endpoint = `/accounting/trial-balance?${qs}`;
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

  // Meetings
  async getMeetings(): Promise<ApiResponse<{ meetings: any[] }>> {
    const companyId = await this.getCurrentCompanyId();
    if (!companyId) {
      return {
        success: false,
        message: 'No company selected or user has no companies',
        error: 'NO_COMPANY_ACCESS'
      };
    }
    return this.request(`/meetings?companyId=${companyId}`);
  }

  async createMeeting(payload: any): Promise<ApiResponse<{ meeting: any }>> {
    const companyId = await this.getCurrentCompanyId();
    if (!companyId) {
      return {
        success: false,
        message: 'No company selected or user has no companies',
        error: 'NO_COMPANY_ACCESS'
      };
    }
    const payloadWithCompany = { ...payload, companyId };
    return this.request('/meetings', { method: 'POST', body: JSON.stringify(payloadWithCompany) });
  }

  async updateMeeting(id: number, payload: any): Promise<ApiResponse<{ meeting: any }>> {
    const companyId = await this.getCurrentCompanyId();
    if (!companyId) {
      return {
        success: false,
        message: 'No company selected or user has no companies',
        error: 'NO_COMPANY_ACCESS'
      };
    }
    const payloadWithCompany = { ...payload, companyId };
    return this.request(`/meetings/${id}`, { method: 'PUT', body: JSON.stringify(payloadWithCompany) });
  }

  async deleteMeeting(id: number): Promise<ApiResponse> {
    const companyId = await this.getCurrentCompanyId();
    if (!companyId) {
      return {
        success: false,
        message: 'No company selected or user has no companies',
        error: 'NO_COMPANY_ACCESS'
      };
    }
    return this.request(`/meetings/${id}?companyId=${companyId}`, { method: 'DELETE' });
  }

  // Invoices/Receipts
  async getInvoiceReceipts(companyId?: string): Promise<ApiResponse<{ items: any[] }>> {
    const query = new URLSearchParams();
    
    // Ensure companyId is included
    let finalCompanyId = companyId;
    if (!finalCompanyId) {
      finalCompanyId = await this.getCurrentCompanyId();
    }
    
    if (!finalCompanyId) {
      console.error('❌ No company ID available for invoices request');
      return {
        success: false,
        message: 'Company ID is required. Please select a company first.',
        error: 'COMPANY_ID_REQUIRED',
      };
    }
    
    query.set('companyId', finalCompanyId);
    console.log('🔗 Fetching invoices for company:', finalCompanyId);
    
    const qs = query.toString();
    const endpoint = `/invoices?${qs}`;
    return this.request(endpoint);
  }

  async createInvoiceReceipt(payload: any): Promise<ApiResponse<{ item: any }>> {
    // Ensure companyId is included in payload
    if (!payload.companyId) {
      const companyId = await this.getCurrentCompanyId();
      if (companyId) {
        payload.companyId = companyId;
      } else {
        return {
          success: false,
          message: 'Company ID is required. Please select a company first.',
          error: 'COMPANY_ID_REQUIRED',
        };
      }
    }
    return this.request('/invoices', { method: 'POST', body: JSON.stringify(payload) });
  }

  async updateInvoiceStatus(id: string, status: string): Promise<ApiResponse<{ item: any }>> {
    return this.request(`/invoices/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  }

  // Assets
  async getAssets(companyId?: string): Promise<ApiResponse<{ assets: any[] }>> {
    const query = new URLSearchParams();
    
    // Ensure companyId is included
    let finalCompanyId = companyId;
    if (!finalCompanyId) {
      finalCompanyId = await this.getCurrentCompanyId();
    }
    
    if (!finalCompanyId) {
      console.error('❌ No company ID available for assets request');
      return {
        success: false,
        message: 'Company ID is required. Please select a company first.',
        error: 'COMPANY_ID_REQUIRED',
      };
    }
    
    query.set('companyId', finalCompanyId);
    console.log('🔗 Fetching assets for company:', finalCompanyId);
    
    const qs = query.toString();
    const endpoint = `/assets?${qs}`;
    return this.request(endpoint);
  }
  async createAsset(payload: any): Promise<ApiResponse<{ asset: any }>> {
    return this.request('/assets', { method: 'POST', body: JSON.stringify(payload) });
  }
  async updateAsset(id: string, payload: any): Promise<ApiResponse<{ asset: any }>> {
    return this.request(`/assets/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }
  async deleteAsset(id: string): Promise<ApiResponse> {
    return this.request(`/assets/${id}`, { method: 'DELETE' });
  }

  // Documents
  async getDocuments(): Promise<ApiResponse<{ documents: any[] }>> {
    return this.request('/documents');
  }

  async createDocument(payload: any): Promise<ApiResponse<{ document: any }>> {
    return this.request('/documents', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateDocument(id: string, payload: any): Promise<ApiResponse<{ document: any }>> {
    return this.request(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteDocument(id: string): Promise<ApiResponse> {
    return this.request(`/documents/${id}`, {
      method: 'DELETE'
    });
  }

  async uploadDocument(formData: FormData): Promise<ApiResponse<{ document: any }>> {
    return this.makeRequest('/documents/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        // Don't set Content-Type for FormData, let browser set it
      }
    });
  }

  // Directors & Shareholders
  async getDirectors(): Promise<ApiResponse<{ directors: any[] }>> {
    return this.request('/directors');
  }

  async createDirector(payload: any): Promise<ApiResponse<{ director: any }>> {
    return this.request('/directors', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateDirector(id: string, payload: any): Promise<ApiResponse<{ director: any }>> {
    return this.request(`/directors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteDirector(id: string): Promise<ApiResponse> {
    return this.request(`/directors/${id}`, {
      method: 'DELETE'
    });
  }

  async getShareholders(): Promise<ApiResponse<{ shareholders: any[] }>> {
    return this.request('/directors/shareholders');
  }

  async createShareholder(payload: any): Promise<ApiResponse<{ shareholder: any }>> {
    return this.request('/directors/shareholders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Capital Management
  async getLockedCapitals(): Promise<ApiResponse<{ capitals: any[] }>> {
    return this.request('/capital/locked');
  }

  async createLockedCapital(payload: any): Promise<ApiResponse<{ capital: any }>> {
    return this.request('/capital/locked', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateLockedCapital(id: string, payload: any): Promise<ApiResponse<{ capital: any }>> {
    return this.request(`/capital/locked/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async getWithdrawalRequests(): Promise<ApiResponse<{ requests: any[] }>> {
    return this.request('/capital/withdrawal-requests');
  }

  async createWithdrawalRequest(payload: any): Promise<ApiResponse<{ request: any }>> {
    return this.request('/capital/withdrawal-requests', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async approveWithdrawalRequest(id: string): Promise<ApiResponse<{ request: any }>> {
    return this.request(`/capital/withdrawal-requests/${id}/approve`, {
      method: 'POST'
    });
  }

  async rejectWithdrawalRequest(id: string, reason?: string): Promise<ApiResponse<{ request: any }>> {
    return this.request(`/capital/withdrawal-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  // Currency Management
  async getCurrencyRates(): Promise<ApiResponse<{ rates: any[] }>> {
    return this.request('/currency/rates');
  }

  async getCurrencyTransactions(): Promise<ApiResponse<{ transactions: any[] }>> {
    return this.request('/currency/transactions');
  }

  async createCurrencyTransaction(payload: any): Promise<ApiResponse<{ transaction: any }>> {
    return this.request('/currency/transactions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Payroll
  async getPayrollPeriods(): Promise<ApiResponse<{ periods: any[] }>> {
    return this.request('/payroll/periods');
  }

  async createPayrollPeriod(payload: any): Promise<ApiResponse<{ period: any }>> {
    return this.request('/payroll/periods', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getPayrollRecords(periodId?: string): Promise<ApiResponse<{ records: any[] }>> {
    const params = periodId ? `?periodId=${periodId}` : '';
    return this.request(`/payroll/records${params}`);
  }

  async createPayrollRecord(payload: any): Promise<ApiResponse<{ record: any }>> {
    return this.request('/payroll/records', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Ownership
  async getCapital(): Promise<ApiResponse<{ capital: any[] }>> { return this.request('/ownership/capital'); }
  async saveCapital(payload: any): Promise<ApiResponse<{ capital: any }>> { return this.request('/ownership/capital', { method: 'POST', body: JSON.stringify(payload) }); }
  async getBeneficialOwners(): Promise<ApiResponse<{ beneficialOwners: any[] }>> { return this.request('/ownership/beneficial-owners'); }
  async addBeneficialOwner(payload: any): Promise<ApiResponse<{ beneficialOwner: any }>> { return this.request('/ownership/beneficial-owners', { method: 'POST', body: JSON.stringify(payload) }); }

  // Utility Methods
  isAuthenticated(): boolean {
    // Always refresh tokens from localStorage
    this.loadTokensFromStorage();
    
    // Check for actual token first
    if (this.accessToken) {
      console.log('✅ JWT token found, user is authenticated');
      return true;
    }
    
    // Development mode: Allow access if we have a test company
    const testCompanyId = localStorage.getItem('selectedCompanyId');
    if (testCompanyId && (testCompanyId.includes('test') || testCompanyId.includes('dev'))) {
      console.log('Development mode: Using test company for authentication');
      return true;
    }
    
    console.log('❌ No JWT token found, user is not authenticated');
    return false;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  // User Management Methods
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    
    return this.makeRequest(endpoint);
  }

  async getUserById(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/users/${id}`);
  }

  async createUser(userData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async activateUser(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/users/${id}/activate`, {
      method: 'POST',
    });
  }

  async deactivateUser(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/users/${id}/deactivate`, {
      method: 'POST',
    });
  }

  async getUserRoles(): Promise<ApiResponse<any>> {
    return this.makeRequest('/users/roles');
  }

  async getUserStats(): Promise<ApiResponse<any>> {
    return this.makeRequest('/users/stats');
  }

  // Expose request method for direct use
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, options);
  }
}

// Create and export singleton instance
export const apiService = new ApiService(API_BASE_URL);
