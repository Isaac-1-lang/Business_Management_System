/**
 * TAX ROUTES - Tax Management
 * 
 * Handles tax calculations, returns, and compliance
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { successResponse, errorResponse, asyncHandler } from '../middleware/errorHandler.js';
import { requireRole, requireCompanyAccess } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const createTaxReturnValidation = [
  body('period').isISO8601().withMessage('Invalid period format'),
  body('type').isIn(['VAT', 'Corporate', 'Withholding', 'RSSB']).withMessage('Invalid tax type'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('dueDate').isISO8601().withMessage('Invalid due date format')
];

// Hardcoded tax data for testing
const taxReturns = [
  {
    id: '1',
    companyId: '1',
    period: '2024-01',
    type: 'VAT',
    amount: 1800000,
    paidAmount: 1800000,
    dueDate: '2024-02-15',
    submissionDate: '2024-02-10',
    status: 'submitted',
    reference: 'VAT-2024-001',
    description: 'VAT Return for January 2024'
  },
  {
    id: '2',
    companyId: '1',
    period: '2024-01',
    type: 'Corporate',
    amount: 5000000,
    paidAmount: 0,
    dueDate: '2024-04-30',
    submissionDate: null,
    status: 'pending',
    reference: 'CORP-2024-001',
    description: 'Corporate Tax Return for 2023'
  },
  {
    id: '3',
    companyId: '1',
    period: '2024-01',
    type: 'RSSB',
    amount: 750000,
    paidAmount: 750000,
    dueDate: '2024-02-15',
    submissionDate: '2024-02-12',
    status: 'submitted',
    reference: 'RSSB-2024-001',
    description: 'RSSB Contribution for January 2024'
  }
];

const taxRates = {
  VAT: 18,
  Corporate: 30,
  Withholding: 15,
  RSSB_Employee: 5,
  RSSB_Employer: 10
};

/**
 * GET /tax/returns
 * Get all tax returns for the company
 */
router.get('/returns', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { type, status, period } = req.query;
  
  let filteredReturns = taxReturns.filter(ret => ret.companyId === companyId);
  
  if (type) {
    filteredReturns = filteredReturns.filter(ret => ret.type === type);
  }
  
  if (status) {
    filteredReturns = filteredReturns.filter(ret => ret.status === status);
  }
  
  if (period) {
    filteredReturns = filteredReturns.filter(ret => ret.period === period);
  }
  
  return successResponse(res, { returns: filteredReturns }, 'Tax returns retrieved successfully');
}));

/**
 * GET /tax/returns/:id
 * Get specific tax return details
 */
router.get('/returns/:id', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { companyId } = req;
  
  const taxReturn = taxReturns.find(ret => ret.id === id && ret.companyId === companyId);
  
  if (!taxReturn) {
    return errorResponse(res, 'Tax return not found', 404, 'TAX_RETURN_NOT_FOUND');
  }
  
  return successResponse(res, { taxReturn }, 'Tax return details retrieved successfully');
}));

/**
 * POST /tax/returns
 * Create a new tax return
 */
router.post('/returns', createTaxReturnValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'accountant']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  
  const newTaxReturn = {
    id: (taxReturns.length + 1).toString(),
    ...req.body,
    companyId,
    status: 'pending',
    reference: `${req.body.type}-${new Date().getFullYear()}-${String(taxReturns.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString()
  };
  
  taxReturns.push(newTaxReturn);
  
  return successResponse(res, { taxReturn: newTaxReturn }, 'Tax return created successfully', 201);
}));

/**
 * PUT /tax/returns/:id
 * Update tax return
 */
router.put('/returns/:id', createTaxReturnValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'accountant']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { id } = req.params;
  const { companyId } = req;
  
  const taxReturnIndex = taxReturns.findIndex(ret => ret.id === id && ret.companyId === companyId);
  
  if (taxReturnIndex === -1) {
    return errorResponse(res, 'Tax return not found', 404, 'TAX_RETURN_NOT_FOUND');
  }
  
  taxReturns[taxReturnIndex] = {
    ...taxReturns[taxReturnIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  return successResponse(res, { taxReturn: taxReturns[taxReturnIndex] }, 'Tax return updated successfully');
}));

/**
 * POST /tax/returns/:id/submit
 * Submit a tax return
 */
router.post('/returns/:id/submit', requireCompanyAccess, requireRole(['admin', 'owner', 'accountant']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { companyId } = req;
  
  const taxReturnIndex = taxReturns.findIndex(ret => ret.id === id && ret.companyId === companyId);
  
  if (taxReturnIndex === -1) {
    return errorResponse(res, 'Tax return not found', 404, 'TAX_RETURN_NOT_FOUND');
  }
  
  if (taxReturns[taxReturnIndex].status === 'submitted') {
    return errorResponse(res, 'Tax return already submitted', 400, 'ALREADY_SUBMITTED');
  }
  
  taxReturns[taxReturnIndex].status = 'submitted';
  taxReturns[taxReturnIndex].submissionDate = new Date().toISOString();
  taxReturns[taxReturnIndex].updatedAt = new Date().toISOString();
  
  return successResponse(res, { taxReturn: taxReturns[taxReturnIndex] }, 'Tax return submitted successfully');
}));

/**
 * GET /tax/rates
 * Get current tax rates
 */
router.get('/rates', asyncHandler(async (req, res) => {
  return successResponse(res, { rates: taxRates }, 'Tax rates retrieved successfully');
}));

/**
 * POST /tax/calculate
 * Calculate tax amount
 */
router.post('/calculate', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { type, amount, isVATRegistered = true } = req.body;
  
  if (!type || !amount) {
    return errorResponse(res, 'Type and amount are required', 400, 'MISSING_REQUIRED_FIELDS');
  }
  
  let calculatedTax = 0;
  
  switch (type) {
    case 'VAT':
      if (isVATRegistered) {
        calculatedTax = amount * (taxRates.VAT / 100);
      }
      break;
    case 'Corporate':
      calculatedTax = amount * (taxRates.Corporate / 100);
      break;
    case 'Withholding':
      calculatedTax = amount * (taxRates.Withholding / 100);
      break;
    case 'RSSB_Employee':
      calculatedTax = amount * (taxRates.RSSB_Employee / 100);
      break;
    case 'RSSB_Employer':
      calculatedTax = amount * (taxRates.RSSB_Employer / 100);
      break;
    default:
      return errorResponse(res, 'Invalid tax type', 400, 'INVALID_TAX_TYPE');
  }
  
  return successResponse(res, {
    calculation: {
      type,
      baseAmount: amount,
      rate: taxRates[type] || 0,
      taxAmount: calculatedTax,
      totalAmount: amount + calculatedTax
    }
  }, 'Tax calculation completed successfully');
}));

/**
 * GET /tax/deadlines
 * Get upcoming tax deadlines
 */
router.get('/deadlines', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const now = new Date();
  
  const upcomingDeadlines = taxReturns
    .filter(ret => ret.companyId === companyId && ret.status === 'pending')
    .filter(ret => new Date(ret.dueDate) > now)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 10);
  
  return successResponse(res, { deadlines: upcomingDeadlines }, 'Tax deadlines retrieved successfully');
}));

/**
 * GET /tax/stats
 * Get tax statistics
 */
router.get('/stats', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  
  const companyReturns = taxReturns.filter(ret => ret.companyId === companyId);
  
  const stats = {
    total: companyReturns.length,
    submitted: companyReturns.filter(ret => ret.status === 'submitted').length,
    pending: companyReturns.filter(ret => ret.status === 'pending').length,
    overdue: companyReturns.filter(ret => ret.status === 'pending' && new Date(ret.dueDate) < new Date()).length,
    totalAmount: companyReturns.reduce((sum, ret) => sum + ret.amount, 0),
    totalPaid: companyReturns.reduce((sum, ret) => sum + ret.paidAmount, 0),
    byType: companyReturns.reduce((acc, ret) => {
      acc[ret.type] = (acc[ret.type] || 0) + ret.amount;
      return acc;
    }, {})
  };
  
  return successResponse(res, { stats }, 'Tax statistics retrieved successfully');
}));

export default router;
