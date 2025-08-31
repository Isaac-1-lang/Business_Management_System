/**
 * COMPLIANCE ROUTES - Compliance Management
 * 
 * Handles compliance tracking, alerts, and regulatory requirements
 */

import express from 'express';
import { successResponse, errorResponse, asyncHandler } from '../middleware/errorHandler.js';
import { requireRole, requireCompanyAccess } from '../middleware/auth.js';

const router = express.Router();

// Empty compliance data arrays - will be populated from database in production
const complianceAlerts = [];

const complianceStatus = {
  companyId: null,
  overallStatus: 'unknown',
  lastUpdated: null,
  details: {
    vat: { status: 'unknown', lastSubmission: null, nextDeadline: null },
    corporate: { status: 'unknown', lastSubmission: null, nextDeadline: null },
    rssb: { status: 'unknown', lastSubmission: null, nextDeadline: null },
    rdb: { status: 'unknown', lastRenewal: null, nextRenewal: null }
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
