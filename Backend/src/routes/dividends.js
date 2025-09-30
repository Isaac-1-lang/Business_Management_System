/**
 * DIVIDENDS ROUTES - Dividend Declarations and Distributions
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { successResponse, errorResponse, asyncHandler } from '../middleware/errorHandler.js';
import { requireRole, requireCompanyAccess } from '../middleware/auth.js';

const router = express.Router();

// In-memory store (replace with DB)
const declarations = [];
const distributions = [];

const declarationValidation = [
  body('profit_amount').isNumeric().withMessage('profit_amount must be a number'),
  body('dividend_percentage').isNumeric().withMessage('dividend_percentage must be a number'),
  body('approved_by').isString().isLength({ min: 2 }).withMessage('approved_by is required'),
  body('declaration_date').isString().withMessage('declaration_date is required'),
];

/**
 * GET /dividends
 * List dividend declarations for current company
 */
router.get('/', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const items = declarations
    .filter(d => d.company_id === companyId)
    .sort((a, b) => new Date(b.declaration_date) - new Date(a.declaration_date));
  return successResponse(res, { declarations: items }, 'Dividend declarations retrieved successfully');
}));

/**
 * POST /dividends
 * Create a new dividend declaration
 */
router.post('/', declarationValidation, requireCompanyAccess, requireRole(['admin','owner','accountant']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }

  const { companyId } = req;
  const { profit_amount, dividend_percentage, approved_by, declaration_date, document_url } = req.body;
  const dividend_pool = profit_amount * (dividend_percentage / 100);

  const declaration = {
    id: `div-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    company_id: companyId,
    profit_amount,
    dividend_percentage,
    dividend_pool,
    approved_by,
    declaration_date,
    document_url: document_url || null,
    status: 'draft',
    created_at: new Date().toISOString()
  };

  declarations.push(declaration);
  return successResponse(res, { declaration }, 'Dividend declaration created', 201);
}));

/**
 * POST /dividends/:id/confirm
 * Confirm a dividend declaration
 */
router.post('/:id/confirm', requireCompanyAccess, requireRole(['admin','owner','accountant']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { companyId } = req;
  const declaration = declarations.find(d => d.id === id && d.company_id === companyId);
  if (!declaration) {
    return errorResponse(res, 'Declaration not found', 404, 'DECLARATION_NOT_FOUND');
  }
  declaration.status = 'confirmed';
  return successResponse(res, { declaration }, 'Declaration confirmed');
}));

/**
 * POST /dividends/:id/distributions/calculate
 * Calculate distributions for a declaration
 */
router.post('/:id/distributions/calculate', requireCompanyAccess, requireRole(['admin','owner','accountant']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { companyId } = req;
  const declaration = declarations.find(d => d.id === id && d.company_id === companyId);
  if (!declaration) {
    return errorResponse(res, 'Declaration not found', 404, 'DECLARATION_NOT_FOUND');
  }

  const shareholders = (req.body.shareholders || []).filter(s => Number(s.shares_held_at_time) > 0);
  if (shareholders.length === 0) {
    return errorResponse(res, 'No shareholders provided', 400, 'NO_SHAREHOLDERS');
  }

  const totalShares = shareholders.reduce((sum, s) => sum + Number(s.shares_held_at_time), 0);
  if (totalShares <= 0) {
    return errorResponse(res, 'Total shares must be positive', 400, 'INVALID_TOTAL_SHARES');
  }

  const perShare = declaration.dividend_pool / totalShares;
  const newDists = shareholders.map(s => ({
    id: `dist-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    declaration_id: declaration.id,
    shareholder_id: s.shareholder_id,
    shareholder_name: s.shareholder_name,
    shares_held_at_time: Number(s.shares_held_at_time),
    amount: Math.round(Number(s.shares_held_at_time) * perShare),
    is_paid: false,
    payment_proof_url: null,
    paid_on: null
  }));

  // Replace existing for this declaration
  for (let i = distributions.length - 1; i >= 0; i--) {
    if (distributions[i].declaration_id === declaration.id) distributions.splice(i, 1);
  }
  distributions.push(...newDists);

  return successResponse(res, { distributions: newDists }, 'Distributions calculated');
}));

/**
 * GET /dividends/:id/distributions
 */
router.get('/:id/distributions', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const items = distributions.filter(d => d.declaration_id === id);
  return successResponse(res, { distributions: items }, 'Distributions retrieved');
}));

/**
 * POST /dividends/distributions/:distributionId/pay
 */
router.post('/distributions/:distributionId/pay', requireCompanyAccess, requireRole(['admin','owner','accountant']), asyncHandler(async (req, res) => {
  const { distributionId } = req.params;
  const dist = distributions.find(d => d.id === distributionId);
  if (!dist) {
    return errorResponse(res, 'Distribution not found', 404, 'DISTRIBUTION_NOT_FOUND');
  }
  dist.is_paid = true;
  dist.paid_on = new Date().toISOString().split('T')[0];
  dist.payment_proof_url = req.body.payment_proof_url || null;
  return successResponse(res, { distribution: dist }, 'Dividend marked as paid');
}));

export default router;


