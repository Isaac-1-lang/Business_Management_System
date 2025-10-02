/**
 * ASSETS MANAGEMENT SERVICE
 * 
 * Frontend service for managing asset categories, fixed assets, and maintenance
 */

import { apiService } from './apiService';

export class AssetsService {
  // Get all asset categories for the current company
  static async getAssetCategories(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const res = await apiService.request(`/assets/categories?${queryParams.toString()}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch asset categories:', res.error || res.message);
      return { categories: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    } catch (error) {
      console.error('Error fetching asset categories:', error);
      return { categories: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    }
  }

  // Create new asset category
  static async createAssetCategory(payload) {
    try {
      const res = await apiService.request('/assets/categories', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to create asset category:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error creating asset category:', error);
      return null;
    }
  }

  // Get all fixed assets for the current company
  static async getFixedAssets(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.category_id) queryParams.append('category_id', filters.category_id);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const res = await apiService.request(`/assets?${queryParams.toString()}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch fixed assets:', res.error || res.message);
      return { assets: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    } catch (error) {
      console.error('Error fetching fixed assets:', error);
      return { assets: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    }
  }

  // Create new fixed asset
  static async createFixedAsset(payload) {
    try {
      const res = await apiService.request('/assets', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to create fixed asset:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error creating fixed asset:', error);
      return null;
    }
  }

  // Update fixed asset
  static async updateFixedAsset(id, payload) {
    try {
      const res = await apiService.request(`/assets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to update fixed asset:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error updating fixed asset:', error);
      return null;
    }
  }

  // Dispose asset
  static async disposeAsset(id, disposalDetails) {
    try {
      const res = await apiService.request(`/assets/${id}/dispose`, {
        method: 'POST',
        body: JSON.stringify(disposalDetails)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to dispose asset:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error disposing asset:', error);
      return null;
    }
  }

  // Get asset maintenance records
  static async getAssetMaintenance(assetId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.maintenance_type) queryParams.append('maintenance_type', filters.maintenance_type);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const res = await apiService.request(`/assets/${assetId}/maintenance?${queryParams.toString()}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch asset maintenance:', res.error || res.message);
      return { maintenance: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    } catch (error) {
      console.error('Error fetching asset maintenance:', error);
      return { maintenance: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    }
  }

  // Create maintenance record
  static async createMaintenanceRecord(assetId, payload) {
    try {
      const res = await apiService.request(`/assets/${assetId}/maintenance`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to create maintenance record:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      return null;
    }
  }

  // Get asset statistics
  static async getStatistics() {
    try {
      const res = await apiService.request('/assets/statistics/overview');
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch asset statistics:', res.error || res.message);
      return {
        totalAssets: 0,
        totalValue: 0,
        byCategory: {},
        byStatus: {},
        byLocation: {},
        maintenanceDue: 0,
        monthlyTrends: []
      };
    } catch (error) {
      console.error('Error fetching asset statistics:', error);
      return {
        totalAssets: 0,
        totalValue: 0,
        byCategory: {},
        byStatus: {},
        byLocation: {},
        maintenanceDue: 0,
        monthlyTrends: []
      };
    }
  }

  // Calculate depreciation
  static calculateDepreciation(acquisitionCost, residualValue, usefulLifeYears, monthsElapsed) {
    const depreciableAmount = acquisitionCost - residualValue;
    const monthlyDepreciation = depreciableAmount / (usefulLifeYears * 12);
    return Math.min(monthlyDepreciation * monthsElapsed, depreciableAmount);
  }

  // Calculate book value
  static calculateBookValue(acquisitionCost, accumulatedDepreciation) {
    return acquisitionCost - accumulatedDepreciation;
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
      active: 'bg-green-100 text-green-800',
      disposed: 'bg-red-100 text-red-800',
      transferred: 'bg-blue-100 text-blue-800',
      under_maintenance: 'bg-yellow-100 text-yellow-800',
      lost: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  // Get status label
  static getStatusLabel(status) {
    const labels = {
      active: 'Active',
      disposed: 'Disposed',
      transferred: 'Transferred',
      under_maintenance: 'Under Maintenance',
      lost: 'Lost'
    };
    return labels[status] || status;
  }

  // Get maintenance type color
  static getMaintenanceTypeColor(type) {
    const colors = {
      preventive: 'bg-blue-100 text-blue-800',
      corrective: 'bg-red-100 text-red-800',
      emergency: 'bg-orange-100 text-orange-800',
      inspection: 'bg-green-100 text-green-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  // Get maintenance type label
  static getMaintenanceTypeLabel(type) {
    const labels = {
      preventive: 'Preventive',
      corrective: 'Corrective',
      emergency: 'Emergency',
      inspection: 'Inspection'
    };
    return labels[type] || type;
  }
}
