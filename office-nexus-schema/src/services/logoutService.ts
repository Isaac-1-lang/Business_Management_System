/**
 * LOGOUT SERVICE - Centralized Logout Management
 * 
 * This service provides:
 * - Centralized logout logic
 * - User feedback and notifications
 * - Cleanup of local storage and state
 * - Navigation handling
 */

import { apiService } from './apiService';

export class LogoutService {
  /**
   * Perform a complete logout
   * @param showToast - Whether to show success/error toasts
   * @returns Promise<boolean> - Success status
   */
  static async logout(showToast: boolean = true): Promise<boolean> {
    try {
      // Call backend logout endpoint
      await apiService.logout();
      
      if (showToast) {
        // Note: We can't use useToast here as it's a hook
        // Toast will be handled by the calling component
      }
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      
      if (showToast) {
        // Note: We can't use useToast here as it's a hook
        // Toast will be handled by the calling component
      }
      
      return false;
    }
  }

  /**
   * Force logout without backend call (for error cases)
   * @returns Promise<boolean> - Always returns true
   */
  static async forceLogout(): Promise<boolean> {
    try {
      // Clear any local storage
      localStorage.removeItem('user');
      localStorage.removeItem('selectedCompany');
      sessionStorage.clear();
      
      return true;
    } catch (error) {
      console.error('Force logout error:', error);
      return true; // Always return true for force logout
    }
  }

  /**
   * Check if user should be logged out (token expired, etc.)
   * @returns boolean - Whether logout is needed
   */
  static shouldLogout(): boolean {
    return !apiService.isAuthenticated();
  }
}

export default LogoutService;
