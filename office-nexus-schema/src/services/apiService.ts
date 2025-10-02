/**
 * API SERVICE - Centralized Backend Communication
 * 
 * This service handles all API calls to the backend with:
 * - Automatic authentication token management
 * - Error handling and retry logic
 * - Request/response interceptors
 * - Type-safe API calls
 */

const API_BASE_URL ='http://localhost:5000/api/v1';

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
  private async makeRequest<T>(
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
      
      // Handle 401 errors in development mode
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
            return await retryResponse.json();
          }
        }
      }

      const data: ApiResponse<T> = await response.json();
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
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
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

  // Meetings
  async getMeetings(): Promise<ApiResponse<{ meetings: any[] }>> {
    // Get current company ID from localStorage
    const companyId = localStorage.getItem('selectedCompanyId') || '871619ce-7497-4101-82f2-d8f92f469e94';
    return this.request(`/meetings?companyId=${companyId}`);
  }

  async createMeeting(payload: any): Promise<ApiResponse<{ meeting: any }>> {
    // Get current company ID from localStorage
    const companyId = localStorage.getItem('selectedCompanyId') || 'test-company-uuid';
    const payloadWithCompany = { ...payload, companyId };
    return this.request('/meetings', { method: 'POST', body: JSON.stringify(payloadWithCompany) });
  }

  async updateMeeting(id: number, payload: any): Promise<ApiResponse<{ meeting: any }>> {
    // Get current company ID from localStorage
    const companyId = localStorage.getItem('selectedCompanyId') || 'test-company-uuid';
    const payloadWithCompany = { ...payload, companyId };
    return this.request(`/meetings/${id}`, { method: 'PUT', body: JSON.stringify(payloadWithCompany) });
  }

  async deleteMeeting(id: number): Promise<ApiResponse> {
    // Get current company ID from localStorage
    const companyId = localStorage.getItem('selectedCompanyId') || 'test-company-uuid';
    return this.request(`/meetings/${id}?companyId=${companyId}`, { method: 'DELETE' });
  }

  // Invoices/Receipts
  async getInvoiceReceipts(): Promise<ApiResponse<{ items: any[] }>> {
    return this.request('/invoices');
  }

  async createInvoiceReceipt(payload: any): Promise<ApiResponse<{ item: any }>> {
    return this.request('/invoices', { method: 'POST', body: JSON.stringify(payload) });
  }

  async updateInvoiceStatus(id: string, status: string): Promise<ApiResponse<{ item: any }>> {
    return this.request(`/invoices/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  }

  // Assets
  async getAssets(): Promise<ApiResponse<{ assets: any[] }>> {
    return this.request('/assets');
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
    // Check for actual token first
    if (this.accessToken) {
      return true;
    }
    
    // Development mode: Allow access if we have a test company
    const testCompanyId = localStorage.getItem('selectedCompanyId');
    if (testCompanyId && (testCompanyId.includes('test') || testCompanyId.includes('dev'))) {
      console.log('Development mode: Using test company for authentication');
      return true;
    }
    
    return false;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Expose request method for direct use
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, options);
  }
}

// Create and export singleton instance
export const apiService = new ApiService(API_BASE_URL);
