/**
 * PAYROLL MANAGEMENT SERVICE
 * 
 * Frontend service for managing payroll periods and employee payroll records
 */

import { apiService } from './apiService';

export default class PayrollService {
  // Get all payroll periods for the current company
  static async getPayrollPeriods(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.year) queryParams.append('year', filters.year);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const res = await apiService.request(`/payroll/periods?${queryParams.toString()}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch payroll periods:', res.error || res.message);
      return { periods: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    } catch (error) {
      console.error('Error fetching payroll periods:', error);
      return { periods: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    }
  }

  // Create new payroll period
  static async createPayrollPeriod(payload) {
    try {
      const res = await apiService.request('/payroll/periods', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to create payroll period:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error creating payroll period:', error);
      return null;
    }
  }

  // Generate payroll records for a period
  static async generatePayrollRecords(id) {
    try {
      const res = await apiService.request(`/payroll/periods/${id}/generate-records`, {
        method: 'POST'
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to generate payroll records:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error generating payroll records:', error);
      return null;
    }
  }

  // Get payroll records
  static async getPayrollRecords(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.payroll_period_id) queryParams.append('payroll_period_id', filters.payroll_period_id);
      if (filters.employee_id) queryParams.append('employee_id', filters.employee_id);
      if (filters.payment_status) queryParams.append('payment_status', filters.payment_status);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const res = await apiService.request(`/payroll/records?${queryParams.toString()}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch payroll records:', res.error || res.message);
      return { records: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    } catch (error) {
      console.error('Error fetching payroll records:', error);
      return { records: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    }
  }

  // Update payment status
  static async updatePaymentStatus(id, paymentStatus, paymentReference) {
    try {
      const res = await apiService.request(`/payroll/records/${id}/payment`, {
        method: 'PUT',
        body: JSON.stringify({
          payment_status: paymentStatus,
          payment_reference: paymentReference
        })
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to update payment status:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error updating payment status:', error);
      return null;
    }
  }

  // Get payroll statistics
  static async getStatistics() {
    try {
      const res = await apiService.request('/payroll/statistics');
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch payroll statistics:', res.error || res.message);
      return {
        totalPeriods: 0,
        totalEmployees: 0,
        totalGrossPay: 0,
        totalNetPay: 0,
        totalTaxes: 0,
        totalDeductions: 0,
        byStatus: {},
        byMonth: {},
        monthlyTrends: []
      };
    } catch (error) {
      console.error('Error fetching payroll statistics:', error);
      return {
        totalPeriods: 0,
        totalEmployees: 0,
        totalGrossPay: 0,
        totalNetPay: 0,
        totalTaxes: 0,
        totalDeductions: 0,
        byStatus: {},
        byMonth: {},
        monthlyTrends: []
      };
    }
  }

  // Calculate gross salary
  static calculateGrossSalary(basicSalary, overtimeAmount, totalAllowances) {
    return basicSalary + overtimeAmount + totalAllowances;
  }

  // Calculate net salary
  static calculateNetSalary(grossSalary, totalDeductions) {
    return grossSalary - totalDeductions;
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

  // Get status color
  static getStatusColor(status) {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      processing: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  // Get status label
  static getStatusLabel(status) {
    const labels = {
      draft: 'Draft',
      processing: 'Processing',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  }
}