/**
 * MULTI-CURRENCY MANAGEMENT SERVICE
 * 
 * Frontend service for managing currency rates and transactions
 */

import { apiService } from './apiService';

export class MultiCurrencyService {
  // Get all currency rates for the current company
  static async getCurrencyRates(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.from_currency) queryParams.append('from_currency', filters.from_currency);
      if (filters.to_currency) queryParams.append('to_currency', filters.to_currency);
      if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const res = await apiService.request(`/currency/rates?${queryParams.toString()}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch currency rates:', res.error || res.message);
      return { rates: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      return { rates: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    }
  }

  // Get latest rates for specific currency pairs
  static async getLatestRates(pairs = []) {
    try {
      const queryParams = new URLSearchParams();
      if (pairs.length > 0) queryParams.append('pairs', pairs.join(','));
      
      const res = await apiService.request(`/currency/rates/latest?${queryParams.toString()}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch latest rates:', res.error || res.message);
      return { rates: [] };
    } catch (error) {
      console.error('Error fetching latest rates:', error);
      return { rates: [] };
    }
  }

  // Create new currency rate
  static async createCurrencyRate(payload) {
    try {
      const res = await apiService.request('/currency/rates', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to create currency rate:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error creating currency rate:', error);
      return null;
    }
  }

  // Update currency rate
  static async updateCurrencyRate(id, payload) {
    try {
      const res = await apiService.request(`/currency/rates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to update currency rate:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error updating currency rate:', error);
      return null;
    }
  }

  // Deactivate currency rate
  static async deactivateCurrencyRate(id) {
    try {
      const res = await apiService.request(`/currency/rates/${id}`, {
        method: 'DELETE'
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to deactivate currency rate:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error deactivating currency rate:', error);
      return null;
    }
  }

  // Get all currency transactions for the current company
  static async getCurrencyTransactions(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.transaction_type) queryParams.append('transaction_type', filters.transaction_type);
      if (filters.from_currency) queryParams.append('from_currency', filters.from_currency);
      if (filters.to_currency) queryParams.append('to_currency', filters.to_currency);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const res = await apiService.request(`/currency/transactions?${queryParams.toString()}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch currency transactions:', res.error || res.message);
      return { transactions: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    } catch (error) {
      console.error('Error fetching currency transactions:', error);
      return { transactions: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    }
  }

  // Create new currency transaction
  static async createCurrencyTransaction(payload) {
    try {
      const res = await apiService.request('/currency/transactions', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to create currency transaction:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error creating currency transaction:', error);
      return null;
    }
  }

  // Convert currency amount
  static async convertCurrency(fromCurrency, toCurrency, amount, rateDate) {
    try {
      const res = await apiService.request('/currency/convert', {
        method: 'POST',
        body: JSON.stringify({
          from_currency: fromCurrency,
          to_currency: toCurrency,
          amount: amount,
          rate_date: rateDate
        })
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to convert currency:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error converting currency:', error);
      return null;
    }
  }

  // Get supported currencies
  static async getSupportedCurrencies() {
    try {
      const res = await apiService.request('/currency/currencies');
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch supported currencies:', res.error || res.message);
      return { currencies: [] };
    } catch (error) {
      console.error('Error fetching supported currencies:', error);
      return { currencies: [] };
    }
  }

  // Get currency statistics
  static async getStatistics() {
    try {
      const res = await apiService.request('/currency/statistics');
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch currency statistics:', res.error || res.message);
      return {
        totalTransactions: 0,
        totalVolume: 0,
        byCurrency: {},
        byType: {},
        monthlyTrends: []
      };
    } catch (error) {
      console.error('Error fetching currency statistics:', error);
      return {
        totalTransactions: 0,
        totalVolume: 0,
        byCurrency: {},
        byType: {},
        monthlyTrends: []
      };
    }
  }

  // Format currency amount
  static formatCurrency(amount, currency = 'RWF') {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount);
  }

  // Format exchange rate
  static formatRate(rate) {
    return rate.toFixed(6);
  }

  // Get transaction type color
  static getTransactionTypeColor(type) {
    const colors = {
      exchange: 'bg-blue-100 text-blue-800',
      conversion: 'bg-green-100 text-green-800',
      hedge: 'bg-purple-100 text-purple-800',
      settlement: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  // Get transaction type label
  static getTransactionTypeLabel(type) {
    const labels = {
      exchange: 'Exchange',
      conversion: 'Conversion',
      hedge: 'Hedge',
      settlement: 'Settlement'
    };
    return labels[type] || type;
  }

  // Get source color
  static getSourceColor(source) {
    const colors = {
      manual: 'bg-gray-100 text-gray-800',
      api: 'bg-blue-100 text-blue-800',
      bank: 'bg-green-100 text-green-800'
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  }

  // Get source label
  static getSourceLabel(source) {
    const labels = {
      manual: 'Manual',
      api: 'API',
      bank: 'Bank'
    };
    return labels[source] || source;
  }

  // Calculate conversion
  static calculateConversion(fromAmount, exchangeRate) {
    return fromAmount * exchangeRate;
  }

  // Validate currency code
  static isValidCurrencyCode(code) {
    return /^[A-Z]{3}$/.test(code);
  }

  // Get currency symbol
  static getCurrencySymbol(currency) {
    const symbols = {
      'RWF': 'RF',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'INR': '₹'
    };
    return symbols[currency] || currency;
  }
}
