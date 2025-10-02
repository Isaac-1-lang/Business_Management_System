/**
 * DIRECTORS & SHAREHOLDERS MANAGEMENT SERVICE
 * 
 * Frontend service for managing directors, shareholders, share certificates, and beneficial owners
 */

import { apiService } from './apiService';

export class DirectorsShareholdersService {
  // Get all directors for the current company
  static async getDirectors(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.director_type) queryParams.append('director_type', filters.director_type);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const res = await apiService.request(`/directors/directors?${queryParams.toString()}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch directors:', res.error || res.message);
      return { directors: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    } catch (error) {
      console.error('Error fetching directors:', error);
      return { directors: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    }
  }

  // Create new director
  static async createDirector(payload) {
    try {
      const res = await apiService.request('/directors/directors', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to create director:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error creating director:', error);
      return null;
    }
  }

  // Resign director
  static async resignDirector(id, resignationDetails) {
    try {
      const res = await apiService.request(`/directors/directors/${id}/resign`, {
        method: 'POST',
        body: JSON.stringify(resignationDetails)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to resign director:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error resigning director:', error);
      return null;
    }
  }

  // Get all shareholders for the current company
  static async getShareholders(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.shareholder_type) queryParams.append('shareholder_type', filters.shareholder_type);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const res = await apiService.request(`/directors/shareholders?${queryParams.toString()}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch shareholders:', res.error || res.message);
      return { shareholders: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    } catch (error) {
      console.error('Error fetching shareholders:', error);
      return { shareholders: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    }
  }

  // Create new shareholder
  static async createShareholder(payload) {
    try {
      const res = await apiService.request('/directors/shareholders', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to create shareholder:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error creating shareholder:', error);
      return null;
    }
  }

  // Transfer shares
  static async transferShares(shareholderId, transferDetails) {
    try {
      const res = await apiService.request(`/directors/shareholders/${shareholderId}/transfer`, {
        method: 'POST',
        body: JSON.stringify(transferDetails)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to transfer shares:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error transferring shares:', error);
      return null;
    }
  }

  // Get share certificates
  static async getShareCertificates(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.shareholder_id) queryParams.append('shareholder_id', filters.shareholder_id);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const res = await apiService.request(`/directors/certificates?${queryParams.toString()}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch share certificates:', res.error || res.message);
      return { certificates: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    } catch (error) {
      console.error('Error fetching share certificates:', error);
      return { certificates: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    }
  }

  // Create share certificate
  static async createShareCertificate(payload) {
    try {
      const res = await apiService.request('/directors/certificates', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to create share certificate:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error creating share certificate:', error);
      return null;
    }
  }

  // Get beneficial owners
  static async getBeneficialOwners(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.ownership_type) queryParams.append('ownership_type', filters.ownership_type);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const res = await apiService.request(`/directors/beneficial-owners?${queryParams.toString()}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch beneficial owners:', res.error || res.message);
      return { beneficialOwners: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    } catch (error) {
      console.error('Error fetching beneficial owners:', error);
      return { beneficialOwners: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    }
  }

  // Create beneficial owner
  static async createBeneficialOwner(payload) {
    try {
      const res = await apiService.request('/directors/beneficial-owners', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to create beneficial owner:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error creating beneficial owner:', error);
      return null;
    }
  }

  // Get ownership statistics
  static async getStatistics() {
    try {
      const res = await apiService.request('/directors/statistics');
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch ownership statistics:', res.error || res.message);
      return {
        totalDirectors: 0,
        totalShareholders: 0,
        totalShares: 0,
        totalCertificates: 0,
        byType: {},
        byStatus: {},
        ownershipDistribution: []
      };
    } catch (error) {
      console.error('Error fetching ownership statistics:', error);
      return {
        totalDirectors: 0,
        totalShareholders: 0,
        totalShares: 0,
        totalCertificates: 0,
        byType: {},
        byStatus: {},
        ownershipDistribution: []
      };
    }
  }

  // Get board composition
  static async getBoardComposition() {
    try {
      const res = await apiService.request('/directors/board-composition');
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch board composition:', res.error || res.message);
      return {
        totalDirectors: 0,
        byType: {},
        byCommittee: {},
        averageAge: 0,
        genderDistribution: {}
      };
    } catch (error) {
      console.error('Error fetching board composition:', error);
      return {
        totalDirectors: 0,
        byType: {},
        byCommittee: {},
        averageAge: 0,
        genderDistribution: {}
      };
    }
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

  // Get director type color
  static getDirectorTypeColor(type) {
    const colors = {
      executive: 'bg-blue-100 text-blue-800',
      non_executive: 'bg-green-100 text-green-800',
      independent: 'bg-purple-100 text-purple-800',
      chairman: 'bg-red-100 text-red-800',
      vice_chairman: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  // Get director type label
  static getDirectorTypeLabel(type) {
    const labels = {
      executive: 'Executive',
      non_executive: 'Non-Executive',
      independent: 'Independent',
      chairman: 'Chairman',
      vice_chairman: 'Vice Chairman'
    };
    return labels[type] || type;
  }

  // Get shareholder type color
  static getShareholderTypeColor(type) {
    const colors = {
      individual: 'bg-blue-100 text-blue-800',
      corporate: 'bg-green-100 text-green-800',
      institutional: 'bg-purple-100 text-purple-800',
      government: 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  // Get shareholder type label
  static getShareholderTypeLabel(type) {
    const labels = {
      individual: 'Individual',
      corporate: 'Corporate',
      institutional: 'Institutional',
      government: 'Government'
    };
    return labels[type] || type;
  }

  // Get status color
  static getStatusColor(status) {
    const colors = {
      active: 'bg-green-100 text-green-800',
      resigned: 'bg-red-100 text-red-800',
      removed: 'bg-gray-100 text-gray-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      transferred: 'bg-blue-100 text-blue-800',
      sold: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  // Get status label
  static getStatusLabel(status) {
    const labels = {
      active: 'Active',
      resigned: 'Resigned',
      removed: 'Removed',
      suspended: 'Suspended',
      transferred: 'Transferred',
      sold: 'Sold',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  }
}
