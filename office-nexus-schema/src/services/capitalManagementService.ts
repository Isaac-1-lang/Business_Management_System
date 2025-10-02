/**
 * CAPITAL MANAGEMENT SERVICE
 * 
 * Frontend service for managing locked capital and early withdrawal requests
 */

import { apiService } from './apiService';

export class CapitalManagementService {
  // Get all locked capitals for the current company
  static async getLockedCapitals(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.investor_id) queryParams.append('investor_id', filters.investor_id);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const res = await apiService.request(`/capital?${queryParams.toString()}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch locked capitals:', res.error || res.message);
      return { capitals: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    } catch (error) {
      console.error('Error fetching locked capitals:', error);
      return { capitals: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    }
  }

  // Get specific locked capital
  static async getLockedCapital(id) {
    try {
      const res = await apiService.request(`/capital/${id}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch locked capital:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error fetching locked capital:', error);
      return null;
    }
  }

  // Create new locked capital
  static async createLockedCapital(payload) {
    try {
      const res = await apiService.request('/capital', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to create locked capital:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error creating locked capital:', error);
      return null;
    }
  }

  // Update locked capital
  static async updateLockedCapital(id, payload) {
    try {
      const res = await apiService.request(`/capital/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to update locked capital:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error updating locked capital:', error);
      return null;
    }
  }

  // Unlock capital
  static async unlockCapital(id) {
    try {
      const res = await apiService.request(`/capital/${id}/unlock`, {
        method: 'POST'
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to unlock capital:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error unlocking capital:', error);
      return null;
    }
  }

  // Request early withdrawal
  static async requestEarlyWithdrawal(id, payload) {
    try {
      const res = await apiService.request(`/capital/${id}/early-withdrawal`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to request early withdrawal:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error requesting early withdrawal:', error);
      return null;
    }
  }

  // Approve/Reject early withdrawal request
  static async processWithdrawalRequest(requestId, status, reviewNotes) {
    try {
      const res = await apiService.request(`/capital/withdrawal-requests/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify({ status, review_notes: reviewNotes })
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to process withdrawal request:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error processing withdrawal request:', error);
      return null;
    }
  }

  // Get early withdrawal requests
  static async getWithdrawalRequests(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const res = await apiService.request(`/capital/withdrawal-requests?${queryParams.toString()}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch withdrawal requests:', res.error || res.message);
      return { requests: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      return { requests: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    }
  }

  // Get capital statistics
  static async getStatistics() {
    try {
      const res = await apiService.request('/capital/statistics/overview');
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch capital statistics:', res.error || res.message);
      return {
        totalLocked: 0,
        totalAmount: 0,
        totalInvestors: 0,
        averageROI: 0,
        pendingWithdrawals: 0,
        byStatus: {},
        byCurrency: {},
        monthlyTrends: []
      };
    } catch (error) {
      console.error('Error fetching capital statistics:', error);
      return {
        totalLocked: 0,
        totalAmount: 0,
        totalInvestors: 0,
        averageROI: 0,
        pendingWithdrawals: 0,
        byStatus: {},
        byCurrency: {},
        monthlyTrends: []
      };
    }
  }

  // Calculate ROI for a capital
  static calculateROI(amount, roiRate, months) {
    const annualRate = roiRate / 100;
    const monthlyRate = annualRate / 12;
    const interest = amount * monthlyRate * months;
    return interest;
  }

  // Calculate penalty for early withdrawal
  static calculatePenalty(amount, penaltyRate) {
    return (amount * penaltyRate) / 100;
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
      locked: 'bg-blue-100 text-blue-800',
      unlocked: 'bg-green-100 text-green-800',
      early_withdrawal_requested: 'bg-yellow-100 text-yellow-800',
      penalty_applied: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  // Get status label
  static getStatusLabel(status) {
    const labels = {
      locked: 'Locked',
      unlocked: 'Unlocked',
      early_withdrawal_requested: 'Early Withdrawal Requested',
      penalty_applied: 'Penalty Applied'
    };
    return labels[status] || status;
  }
}
