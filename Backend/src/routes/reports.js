/**
 * REPORTS ROUTES - Reports and Analytics
 * 
 * Handles reports generation and analytics
 */

import express from 'express';
import { successResponse, errorResponse, asyncHandler } from '../middleware/errorHandler.js';
import { requireRole, requireCompanyAccess } from '../middleware/auth.js';

const router = express.Router();

// Hardcoded reports data for testing
const reports = [
  {
    id: '1',
    companyId: '1',
    type: 'financial_summary',
    title: 'Financial Summary Report',
    description: 'Monthly financial summary for January 2024',
    period: '2024-01',
    status: 'completed',
    generatedAt: '2024-02-01T10:00:00Z',
    data: {
      revenue: 5000000,
      expenses: 2000000,
      netIncome: 3000000,
      cashFlow: 2500000
    }
  },
  {
    id: '2',
    companyId: '1',
    type: 'tax_summary',
    title: 'Tax Summary Report',
    description: 'Tax summary for Q4 2023',
    period: '2023-Q4',
    status: 'completed',
    generatedAt: '2024-01-15T14:30:00Z',
    data: {
      vatCollected: 900000,
      vatPaid: 720000,
      vatNet: 180000,
      corporateTax: 1500000,
      rssbContributions: 450000
    }
  },
  {
    id: '3',
    companyId: '1',
    type: 'compliance_report',
    title: 'Compliance Status Report',
    description: 'Compliance status as of February 2024',
    period: '2024-02',
    status: 'completed',
    generatedAt: '2024-02-10T09:15:00Z',
    data: {
      overallStatus: 'compliant',
      vatStatus: 'compliant',
      corporateStatus: 'pending',
      rssbStatus: 'compliant',
      rdbStatus: 'compliant'
    }
  }
];

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
 */
function generateReportData(type, period) {
  const baseData = {
    period,
    generatedAt: new Date().toISOString()
  };
  
  switch (type) {
    case 'financial_summary':
      return {
        ...baseData,
        revenue: Math.floor(Math.random() * 10000000) + 1000000,
        expenses: Math.floor(Math.random() * 5000000) + 500000,
        netIncome: Math.floor(Math.random() * 5000000) + 500000,
        cashFlow: Math.floor(Math.random() * 3000000) + 200000
      };
    
    case 'tax_summary':
      return {
        ...baseData,
        vatCollected: Math.floor(Math.random() * 2000000) + 500000,
        vatPaid: Math.floor(Math.random() * 1500000) + 300000,
        vatNet: Math.floor(Math.random() * 500000) + 100000,
        corporateTax: Math.floor(Math.random() * 3000000) + 1000000,
        rssbContributions: Math.floor(Math.random() * 1000000) + 200000
      };
    
    case 'compliance_report':
      return {
        ...baseData,
        overallStatus: 'compliant',
        vatStatus: 'compliant',
        corporateStatus: 'pending',
        rssbStatus: 'compliant',
        rdbStatus: 'compliant'
      };
    
    default:
      return baseData;
  }
}

export default router;
