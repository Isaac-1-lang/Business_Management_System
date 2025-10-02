/**
 * DOCUMENT VAULT SERVICE
 * 
 * Frontend service for managing document categories, documents, access control, and activities
 */

import { apiService } from './apiService';

export class DocumentVaultService {
  // Get all document categories for the current company
  static async getDocumentCategories(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const res = await apiService.request(`/documents/categories?${queryParams.toString()}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch document categories:', res.error || res.message);
      return { categories: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    } catch (error) {
      console.error('Error fetching document categories:', error);
      return { categories: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    }
  }

  // Create new document category
  static async createDocumentCategory(payload) {
    try {
      const res = await apiService.request('/documents/categories', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to create document category:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error creating document category:', error);
      return null;
    }
  }

  // Get all documents for the current company
  static async getDocuments(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.category_id) queryParams.append('category_id', filters.category_id);
      if (filters.document_type) queryParams.append('document_type', filters.document_type);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.access_level) queryParams.append('access_level', filters.access_level);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const res = await apiService.request(`/documents?${queryParams.toString()}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch documents:', res.error || res.message);
      return { documents: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    } catch (error) {
      console.error('Error fetching documents:', error);
      return { documents: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    }
  }

  // Get specific document
  static async getDocument(id) {
    try {
      const res = await apiService.request(`/documents/${id}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch document:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error fetching document:', error);
      return null;
    }
  }

  // Upload new document
  static async uploadDocument(formData) {
    try {
      const res = await apiService.request('/documents', {
        method: 'POST',
        body: formData
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to upload document:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error uploading document:', error);
      return null;
    }
  }

  // Update document metadata
  static async updateDocument(id, payload) {
    try {
      const res = await apiService.request(`/documents/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to update document:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error updating document:', error);
      return null;
    }
  }

  // Download document
  static async downloadDocument(id) {
    try {
      const res = await apiService.request(`/documents/${id}/download`);
      if (res.success) return res.data;
      console.warn('Failed to download document:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error downloading document:', error);
      return null;
    }
  }

  // Delete document
  static async deleteDocument(id) {
    try {
      const res = await apiService.request(`/documents/${id}`, {
        method: 'DELETE'
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to delete document:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error deleting document:', error);
      return null;
    }
  }

  // Get document access permissions
  static async getDocumentAccess(id) {
    try {
      const res = await apiService.request(`/documents/${id}/access`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch document access:', res.error || res.message);
      return { access: [] };
    } catch (error) {
      console.error('Error fetching document access:', error);
      return { access: [] };
    }
  }

  // Grant document access
  static async grantDocumentAccess(id, accessDetails) {
    try {
      const res = await apiService.request(`/documents/${id}/access`, {
        method: 'POST',
        body: JSON.stringify(accessDetails)
      });
      if (res.success && res.data) return res.data;
      console.warn('Failed to grant document access:', res.error || res.message);
      return null;
    } catch (error) {
      console.error('Error granting document access:', error);
      return null;
    }
  }

  // Get document activities
  static async getDocumentActivities(id, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.activity_type) queryParams.append('activity_type', filters.activity_type);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const res = await apiService.request(`/documents/${id}/activities?${queryParams.toString()}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch document activities:', res.error || res.message);
      return { activities: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    } catch (error) {
      console.error('Error fetching document activities:', error);
      return { activities: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    }
  }

  // Get documents by category
  static async getDocumentsByCategory(categoryId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const res = await apiService.request(`/documents/by-category/${categoryId}?${queryParams.toString()}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch documents by category:', res.error || res.message);
      return { documents: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    } catch (error) {
      console.error('Error fetching documents by category:', error);
      return { documents: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    }
  }

  // Search documents
  static async searchDocuments(query, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('q', query);
      if (filters.category_id) queryParams.append('category_id', filters.category_id);
      if (filters.document_type) queryParams.append('document_type', filters.document_type);
      if (filters.tags) queryParams.append('tags', filters.tags);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const res = await apiService.request(`/documents/search?${queryParams.toString()}`);
      if (res.success && res.data) return res.data;
      console.warn('Failed to search documents:', res.error || res.message);
      return { documents: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    } catch (error) {
      console.error('Error searching documents:', error);
      return { documents: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    }
  }

  // Get document statistics
  static async getStatistics() {
    try {
      const res = await apiService.request('/documents/statistics/overview');
      if (res.success && res.data) return res.data;
      console.warn('Failed to fetch document statistics:', res.error || res.message);
      return {
        totalDocuments: 0,
        totalSize: 0,
        byCategory: {},
        byType: {},
        byStatus: {},
        byAccessLevel: {},
        monthlyTrends: []
      };
    } catch (error) {
      console.error('Error fetching document statistics:', error);
      return {
        totalDocuments: 0,
        totalSize: 0,
        byCategory: {},
        byType: {},
        byStatus: {},
        byAccessLevel: {},
        monthlyTrends: []
      };
    }
  }

  // Format file size
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get document type color
  static getDocumentTypeColor(type) {
    const colors = {
      contract: 'bg-blue-100 text-blue-800',
      agreement: 'bg-green-100 text-green-800',
      report: 'bg-purple-100 text-purple-800',
      invoice: 'bg-orange-100 text-orange-800',
      receipt: 'bg-yellow-100 text-yellow-800',
      certificate: 'bg-red-100 text-red-800',
      license: 'bg-indigo-100 text-indigo-800',
      permit: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  // Get document type label
  static getDocumentTypeLabel(type) {
    const labels = {
      contract: 'Contract',
      agreement: 'Agreement',
      report: 'Report',
      invoice: 'Invoice',
      receipt: 'Receipt',
      certificate: 'Certificate',
      license: 'License',
      permit: 'Permit',
      other: 'Other'
    };
    return labels[type] || type;
  }

  // Get access level color
  static getAccessLevelColor(level) {
    const colors = {
      public: 'bg-green-100 text-green-800',
      internal: 'bg-blue-100 text-blue-800',
      confidential: 'bg-yellow-100 text-yellow-800',
      restricted: 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  }

  // Get access level label
  static getAccessLevelLabel(level) {
    const labels = {
      public: 'Public',
      internal: 'Internal',
      confidential: 'Confidential',
      restricted: 'Restricted'
    };
    return labels[level] || level;
  }

  // Get status color
  static getStatusColor(status) {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      archived: 'bg-blue-100 text-blue-800',
      deleted: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  // Get status label
  static getStatusLabel(status) {
    const labels = {
      draft: 'Draft',
      active: 'Active',
      archived: 'Archived',
      deleted: 'Deleted'
    };
    return labels[status] || status;
  }

  // Get activity type color
  static getActivityTypeColor(type) {
    const colors = {
      created: 'bg-green-100 text-green-800',
      updated: 'bg-blue-100 text-blue-800',
      downloaded: 'bg-purple-100 text-purple-800',
      viewed: 'bg-gray-100 text-gray-800',
      shared: 'bg-yellow-100 text-yellow-800',
      deleted: 'bg-red-100 text-red-800',
      restored: 'bg-orange-100 text-orange-800',
      moved: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  // Get activity type label
  static getActivityTypeLabel(type) {
    const labels = {
      created: 'Created',
      updated: 'Updated',
      downloaded: 'Downloaded',
      viewed: 'Viewed',
      shared: 'Shared',
      deleted: 'Deleted',
      restored: 'Restored',
      moved: 'Moved'
    };
    return labels[type] || type;
  }

  // Get file icon based on MIME type
  static getFileIcon(mimeType) {
    if (mimeType.includes('pdf')) return 'file-text';
    if (mimeType.includes('word')) return 'file-text';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-spreadsheet';
    if (mimeType.includes('image')) return 'file-image';
    if (mimeType.includes('video')) return 'file-video';
    if (mimeType.includes('audio')) return 'file-audio';
    return 'file';
  }

  // Validate file type
  static isValidFileType(file, allowedTypes = []) {
    if (allowedTypes.length === 0) return true;
    return allowedTypes.includes(file.type);
  }

  // Validate file size
  static isValidFileSize(file, maxSizeMB = 50) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }
}
