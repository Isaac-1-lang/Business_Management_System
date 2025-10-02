/**
 * DIVIDENDS MANAGEMENT SERVICE
 * 
 * Frontend service for managing dividend declarations and distributions
 */

import { apiService } from './apiService';

export class DividendsService {
  // Get all dividend declarations for the current company
  static async getDividendDeclarations(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.dividend_type) queryParams.append('dividend_type', filters.dividend_type);
      if (filters.financial_year) queryParams.append('financial_year', filters.financial_year);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const res = await apiService.request(`/dividends/declarations?${queryParams.toString()}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch dividend declarations:', res.error || res.message);
      return { declarations: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    } catch (error) {
      console.error('Error fetching dividend declarations:', error);
      return { declarations: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    }
  }

  // Get specific dividend declaration
  static async getDividendDeclaration(id) {
    try {
      const res = await apiService.request(`/dividends/declarations/${id}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch dividend declaration:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error fetching dividend declaration:', error);
      return null;
    }
  }

  // Create new dividend declaration
  static async createDividendDeclaration(payload) {
    try {
      const res = await apiService.request('/dividends/declarations', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to create dividend declaration:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error creating dividend declaration:', error);
      return null;
    }
  }

  // Update dividend declaration
  static async updateDividendDeclaration(id, payload) {
    try {
      const res = await apiService.request(`/dividends/declarations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to update dividend declaration:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error updating dividend declaration:', error);
      return null;
    }
  }

  // Approve dividend declaration
  static async approveDividendDeclaration(id) {
    try {
      const res = await apiService.request(`/dividends/declarations/${id}/approve`, {
        method: 'POST'
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to approve dividend declaration:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error approving dividend declaration:', error);
      return null;
    }
  }

  // Generate distributions for a declaration
  static async generateDistributions(id) {
    try {
      const res = await apiService.request(`/dividends/declarations/${id}/generate-distributions`, {
        method: 'POST'
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to generate distributions:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error generating distributions:', error);
      return null;
    }
  }

  // Get dividend distributions
  static async getDividendDistributions(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.declaration_id) queryParams.append('declaration_id', filters.declaration_id);
      if (filters.shareholder_id) queryParams.append('shareholder_id', filters.shareholder_id);
      if (filters.payment_status) queryParams.append('payment_status', filters.payment_status);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const res = await apiService.request(`/dividends/distributions?${queryParams.toString()}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch dividend distributions:', res.error || res.message);
      return { distributions: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    } catch (error) {
      console.error('Error fetching dividend distributions:', error);
      return { distributions: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    }
  }

  // Update distribution payment status
  static async updateDistributionPayment(id, paymentStatus, paymentDetails = {}) {
    try {
      const res = await apiService.request(`/dividends/distributions/${id}/payment`, {
        method: 'PUT',
        body: JSON.stringify({
          payment_status: paymentStatus,
          ...paymentDetails
        })
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to update distribution payment:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error updating distribution payment:', error);
      return null;
    }
  }

  // Get dividend statistics
  static async getStatistics() {
    try {
      const res = await apiService.request('/dividends/statistics');
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch dividend statistics:', res.error || res.message);
      return {
        totalDeclarations: 0,
        totalAmount: 0,
        totalDistributions: 0,
        byType: {},
        byStatus: {},
        byYear: {},
        monthlyTrends: []
      };
    } catch (error) {
      console.error('Error fetching dividend statistics:', error);
      return {
        totalDeclarations: 0,
        totalAmount: 0,
        totalDistributions: 0,
        byType: {},
        byStatus: {},
        byYear: {},
        monthlyTrends: []
      };
    }
  }

  // Get dividend history for a shareholder
  static async getShareholderHistory(shareholderId) {
    try {
      const res = await apiService.request(`/dividends/shareholder/${shareholderId}/history`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch shareholder dividend history:', res.error || res.message);
      return { distributions: [] };
    } catch (error) {
      console.error('Error fetching shareholder dividend history:', error);
      return { distributions: [] };
    }
  }

  // Calculate dividend per share
  static calculateDividendPerShare(totalAmount, totalShares) {
    return totalShares > 0 ? totalAmount / totalShares : 0;
  }

  // Calculate gross dividend amount
  static calculateGrossAmount(sharesHeld, dividendPerShare) {
    return sharesHeld * dividendPerShare;
  }

  // Calculate tax amount
  static calculateTaxAmount(grossAmount, taxRate) {
    return (grossAmount * taxRate) / 100;
  }

  // Calculate net dividend amount
  static calculateNetAmount(grossAmount, taxAmount) {
    return grossAmount - taxAmount;
  }

  // Format currency
  static formatCurrency(amount, currency = 'RWF') {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  // Format percentage
  static formatPercentage(value) {
    return `${value.toFixed(2)}%`;
  }

  // Get status color
  static getStatusColor(status) {
    const colors = {
      declared: 'bg-blue-100 text-blue-800',
      approved: 'bg-yellow-100 text-yellow-800',
      distributed: 'bg-purple-100 text-purple-800',
      paid: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  // Get status label
  static getStatusLabel(status) {
    const labels = {
      declared: 'Declared',
      approved: 'Approved',
      distributed: 'Distributed',
      paid: 'Paid',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  }

  // Get dividend type color
  static getDividendTypeColor(type) {
    const colors = {
      interim: 'bg-blue-100 text-blue-800',
      final: 'bg-green-100 text-green-800',
      special: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  // Get dividend type label
  static getDividendTypeLabel(type) {
    const labels = {
      interim: 'Interim',
      final: 'Final',
      special: 'Special'
    };
    return labels[type] || type;
  }

  // Get payment status color
  static getPaymentStatusColor(status) {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  // Get payment status label
  static getPaymentStatusLabel(status) {
    const labels = {
      pending: 'Pending',
      paid: 'Paid',
      failed: 'Failed',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  }

  // Validate financial year format
  static isValidFinancialYear(year) {
    return /^\d{4}-\d{4}$/.test(year);
  }

  // Generate financial year from date
  static generateFinancialYear(date) {
    const year = new Date(date).getFullYear();
    return `${year}-${year + 1}`;
  }

  // Get payment method color
  static getPaymentMethodColor(method) {
    const colors = {
      bank_transfer: 'bg-blue-100 text-blue-800',
      check: 'bg-green-100 text-green-800',
      cash: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  }

  // Get payment method label
  static getPaymentMethodLabel(method) {
    const labels = {
      bank_transfer: 'Bank Transfer',
      check: 'Check',
      cash: 'Cash',
      other: 'Other'
    };
    return labels[method] || method;
  }
}
