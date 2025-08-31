/**
 * REPORTS ROUTES - Reports and Analytics
 * 
 * Handles reports generation and analytics
 */

import express from 'express';
import { successResponse, errorResponse, asyncHandler } from '../middleware/errorHandler.js';
import { requireRole, requireCompanyAccess } from '../middleware/auth.js';

const router = express.Router();

// Empty reports array - will be populated from database in production
const reports = [];

/**
 * GET /reports
 * Get all reports for the company
 */
router.get('/', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { type, status, period, page = 1, limit = 10 } = req.query;
  
  let filteredReports = reports.filter(r => r.companyId === companyId);
  
  if (type) {
    filteredReports = filteredReports.filter(r => r.type === type);
  }
  
  if (status) {
    filteredReports = filteredReports.filter(r => r.status === status);
  }
  
  if (period) {
    filteredReports = filteredReports.filter(r => r.period === period);
  }
  
  // Sort by generation date (newest first)
  filteredReports.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
  
  // Pagination
  const offset = (page - 1) * limit;
  const paginatedReports = filteredReports.slice(offset, offset + parseInt(limit));
  
  return successResponse(res, {
    reports: paginatedReports,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredReports.length,
      pages: Math.ceil(filteredReports.length / limit)
    }
  }, 'Reports retrieved successfully');
}));

/**
 * GET /reports/:id
 * Get specific report details
 */
router.get('/:id', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { companyId } = req;
  
  const report = reports.find(r => r.id === id && r.companyId === companyId);
  
  if (!report) {
    return errorResponse(res, 'Report not found', 404, 'REPORT_NOT_FOUND');
  }
  
  return successResponse(res, { report }, 'Report details retrieved successfully');
}));

/**
 * POST /reports/generate
 * Generate a new report
 */
router.post('/generate', requireCompanyAccess, requireRole(['admin', 'owner', 'accountant']), asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { type, period, title, description } = req.body;
  
  if (!type || !period) {
    return errorResponse(res, 'Type and period are required', 400, 'MISSING_REQUIRED_FIELDS');
  }
  
  // Simulate report generation
  const newReport = {
    id: (reports.length + 1).toString(),
    companyId,
    type,
    title: title || `${type.replace('_', ' ').toUpperCase()} Report`,
    description: description || `Generated report for ${period}`,
    period,
    status: 'completed',
    generatedAt: new Date().toISOString(),
    data: generateReportData(type, period)
  };
  
  reports.push(newReport);
  
  return successResponse(res, { report: newReport }, 'Report generated successfully', 201);
}));

/**
 * GET /reports/dashboard
 * Get dashboard summary data
 */
router.get('/dashboard', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  
  const companyReports = reports.filter(r => r.companyId === companyId);
  
  const dashboard = {
    totalReports: companyReports.length,
    recentReports: companyReports.slice(0, 5),
    reportTypes: companyReports.reduce((acc, report) => {
      acc[report.type] = (acc[report.type] || 0) + 1;
      return acc;
    }, {}),
    lastGenerated: companyReports.length > 0 ? companyReports[0].generatedAt : null
  };
  
  return successResponse(res, { dashboard }, 'Dashboard data retrieved successfully');
}));

/**
 * GET /reports/available-types
 * Get available report types
 */
router.get('/available-types', asyncHandler(async (req, res) => {
  const reportTypes = [
    {
      type: 'financial_summary',
      name: 'Financial Summary',
      description: 'Monthly financial summary with revenue, expenses, and net income',
      periodOptions: ['monthly', 'quarterly', 'yearly']
    },
    {
      type: 'tax_summary',
      name: 'Tax Summary',
      description: 'Tax summary including VAT, corporate tax, and RSSB contributions',
      periodOptions: ['monthly', 'quarterly', 'yearly']
    },
    {
      type: 'compliance_report',
      name: 'Compliance Report',
      description: 'Compliance status and regulatory requirements',
      periodOptions: ['monthly', 'quarterly']
    },
    {
      type: 'employee_report',
      name: 'Employee Report',
      description: 'Employee statistics and payroll summary',
      periodOptions: ['monthly', 'quarterly']
    },
    {
      type: 'cash_flow',
      name: 'Cash Flow Report',
      description: 'Cash flow analysis and projections',
      periodOptions: ['monthly', 'quarterly']
    }
  ];
  
  return successResponse(res, { reportTypes }, 'Available report types retrieved successfully');
}));

/**
 * Helper function to generate report data based on type
 * This will be implemented with real data from the database in production
 */
function generateReportData(type, period) {
  // This will be implemented with real data from the database in production
  // For now, it returns empty data to avoid dummy data
  return {
    period,
    generatedAt: new Date().toISOString()
  };
}

export default router;
