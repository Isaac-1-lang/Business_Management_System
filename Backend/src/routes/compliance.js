/**
 * COMPLIANCE ROUTES - Compliance Management
 * 
 * Handles compliance tracking, alerts, and regulatory requirements
 */

import express from 'express';
import { successResponse, errorResponse, asyncHandler } from '../middleware/errorHandler.js';
import { requireRole, requireCompanyAccess } from '../middleware/auth.js';

const router = express.Router();

// Hardcoded compliance data for testing
const complianceAlerts = [
  {
    id: '1',
    companyId: '1',
    type: 'VAT_DEADLINE',
    title: 'VAT Return Due',
    message: 'VAT return for January 2024 is due on February 15, 2024',
    severity: 'high',
    dueDate: '2024-02-15',
    status: 'pending',
    createdAt: '2024-01-20'
  },
  {
    id: '2',
    companyId: '1',
    type: 'CORPORATE_TAX',
    title: 'Corporate Tax Filing',
    message: 'Annual corporate tax return is due on April 30, 2024',
    severity: 'medium',
    dueDate: '2024-04-30',
    status: 'pending',
    createdAt: '2024-01-15'
  },
  {
    id: '3',
    companyId: '1',
    type: 'RSSB_CONTRIBUTION',
    title: 'RSSB Contribution Due',
    message: 'RSSB contribution for January 2024 is due on February 15, 2024',
    severity: 'high',
    dueDate: '2024-02-15',
    status: 'completed',
    createdAt: '2024-01-20',
    completedAt: '2024-02-10'
  }
];

const complianceStatus = {
  companyId: '1',
  overallStatus: 'compliant',
  lastUpdated: '2024-02-10',
  details: {
    vat: { status: 'compliant', lastSubmission: '2024-02-10', nextDeadline: '2024-03-15' },
    corporate: { status: 'pending', lastSubmission: null, nextDeadline: '2024-04-30' },
    rssb: { status: 'compliant', lastSubmission: '2024-02-10', nextDeadline: '2024-03-15' },
    rdb: { status: 'compliant', lastRenewal: '2024-01-15', nextRenewal: '2025-01-15' }
  }
};

/**
 * GET /compliance/alerts
 * Get compliance alerts for the company
 */
router.get('/alerts', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { status, severity } = req.query;
  
  let filteredAlerts = complianceAlerts.filter(alert => alert.companyId === companyId);
  
  if (status) {
    filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
  }
  
  if (severity) {
    filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
  }
  
  // Sort by due date
  filteredAlerts.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
  return successResponse(res, { alerts: filteredAlerts }, 'Compliance alerts retrieved successfully');
}));

/**
 * GET /compliance/status
 * Get overall compliance status
 */
router.get('/status', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  
  if (complianceStatus.companyId !== companyId) {
    return errorResponse(res, 'Compliance status not found', 404, 'COMPLIANCE_STATUS_NOT_FOUND');
  }
  
  return successResponse(res, { status: complianceStatus }, 'Compliance status retrieved successfully');
}));

/**
 * POST /compliance/alerts/:id/complete
 * Mark compliance alert as completed
 */
router.post('/alerts/:id/complete', requireCompanyAccess, requireRole(['admin', 'owner', 'accountant']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { companyId } = req;
  
  const alertIndex = complianceAlerts.findIndex(alert => alert.id === id && alert.companyId === companyId);
  
  if (alertIndex === -1) {
    return errorResponse(res, 'Compliance alert not found', 404, 'ALERT_NOT_FOUND');
  }
  
  if (complianceAlerts[alertIndex].status === 'completed') {
    return errorResponse(res, 'Alert already completed', 400, 'ALREADY_COMPLETED');
  }
  
  complianceAlerts[alertIndex].status = 'completed';
  complianceAlerts[alertIndex].completedAt = new Date().toISOString();
  
  return successResponse(res, { alert: complianceAlerts[alertIndex] }, 'Compliance alert marked as completed');
}));

/**
 * GET /compliance/deadlines
 * Get upcoming compliance deadlines
 */
router.get('/deadlines', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const now = new Date();
  
  const upcomingDeadlines = complianceAlerts
    .filter(alert => alert.companyId === companyId && alert.status === 'pending')
    .filter(alert => new Date(alert.dueDate) > now)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
  return successResponse(res, { deadlines: upcomingDeadlines }, 'Compliance deadlines retrieved successfully');
}));

/**
 * GET /compliance/overdue
 * Get overdue compliance items
 */
router.get('/overdue', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const now = new Date();
  
  const overdueItems = complianceAlerts
    .filter(alert => alert.companyId === companyId && alert.status === 'pending')
    .filter(alert => new Date(alert.dueDate) < now);
  
  return successResponse(res, { overdue: overdueItems }, 'Overdue compliance items retrieved successfully');
}));

export default router;
