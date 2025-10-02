/**
 * DIVIDENDS MANAGEMENT ROUTES
 * 
 * Handles dividend declarations and distributions
 */

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { requireCompanyAccess, requireRole } from '../middleware/auth.js';
import { asyncHandler, successResponse, errorResponse } from '../middleware/errorHandler.js';
import { DividendDeclaration, DividendDistribution, Shareholder } from '../models/index.js';

const router = express.Router();

// Validation rules
const declarationValidation = [
  body('declaration_date').isISO8601().withMessage('Valid declaration date required'),
  body('financial_year').notEmpty().withMessage('Financial year is required'),
  body('dividend_type').isIn(['interim', 'final', 'special']).withMessage('Valid dividend type required'),
  body('total_amount').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid total amount required'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Valid currency code required'),
  body('dividend_per_share').isDecimal({ decimal_digits: '0,4' }).withMessage('Valid dividend per share required'),
  body('total_shares').isInt({ min: 1 }).withMessage('Valid total shares required')
];

const distributionValidation = [
  body('declaration_id').isUUID().withMessage('Valid declaration ID required'),
  body('shareholder_id').isUUID().withMessage('Valid shareholder ID required'),
  body('shares_held').isInt({ min: 1 }).withMessage('Valid shares held required'),
  body('dividend_per_share').isDecimal({ decimal_digits: '0,4' }).withMessage('Valid dividend per share required')
];

// Get all dividend declarations for a company
router.get('/declarations', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { status, dividend_type, financial_year, page = 1, limit = 50 } = req.query;
  
  const whereClause = { company_id: companyId };
  if (status) whereClause.status = status;
  if (dividend_type) whereClause.dividend_type = dividend_type;
  if (financial_year) whereClause.financial_year = financial_year;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { count, rows: declarations } = await DividendDeclaration.findAndCountAll({
    where: whereClause,
    order: [['declaration_date', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
  
  return successResponse(res, {
    declarations: declarations.map(declaration => declaration.getPublicData()),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit))
    }
  }, 'Dividend declarations retrieved');
}));

// Get specific dividend declaration
router.get('/declarations/:id', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  
  const declaration = await DividendDeclaration.findOne({
    where: { id, company_id: companyId },
    include: [
      {
        model: DividendDistribution,
        as: 'distributions',
        include: [
          {
            model: Shareholder,
            as: 'shareholder',
            attributes: ['id', 'person_id', 'shares_held', 'share_percentage']
          }
        ]
      }
    ]
  });
  
  if (!declaration) {
    return errorResponse(res, 'Dividend declaration not found', 404);
  }
  
  return successResponse(res, { declaration: declaration.getPublicData() }, 'Dividend declaration retrieved');
}));

// Create new dividend declaration
router.post('/declarations', declarationValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const payload = req.body;
  
  const declaration = await DividendDeclaration.create({
    company_id: companyId,
    declaration_date: payload.declaration_date,
    financial_year: payload.financial_year,
    dividend_type: payload.dividend_type,
    total_amount: payload.total_amount,
    currency: payload.currency || 'RWF',
    dividend_per_share: payload.dividend_per_share,
    total_shares: payload.total_shares,
    status: payload.status || 'declared',
    payment_date: payload.payment_date,
    record_date: payload.record_date,
    ex_dividend_date: payload.ex_dividend_date,
    tax_rate: payload.tax_rate || 5.00,
    notes: payload.notes
  });
  
  return successResponse(res, { declaration: declaration.getPublicData() }, 'Dividend declaration created', 201);
}));

// Update dividend declaration
router.put('/declarations/:id', declarationValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const { id } = req.params;
  const payload = req.body;
  
  const declaration = await DividendDeclaration.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!declaration) {
    return errorResponse(res, 'Dividend declaration not found', 404);
  }
  
  if (declaration.status === 'paid') {
    return errorResponse(res, 'Cannot update paid dividend declaration', 400);
  }
  
  await declaration.update({
    declaration_date: payload.declaration_date,
    financial_year: payload.financial_year,
    dividend_type: payload.dividend_type,
    total_amount: payload.total_amount,
    currency: payload.currency,
    dividend_per_share: payload.dividend_per_share,
    total_shares: payload.total_shares,
    status: payload.status || declaration.status,
    payment_date: payload.payment_date,
    record_date: payload.record_date,
    ex_dividend_date: payload.ex_dividend_date,
    tax_rate: payload.tax_rate || declaration.tax_rate,
    notes: payload.notes
  });
  
  return successResponse(res, { declaration: declaration.getPublicData() }, 'Dividend declaration updated');
}));

// Approve dividend declaration
router.post('/declarations/:id/approve', requireCompanyAccess, requireRole(['admin', 'owner']), asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  
  const declaration = await DividendDeclaration.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!declaration) {
    return errorResponse(res, 'Dividend declaration not found', 404);
  }
  
  if (declaration.status !== 'declared') {
    return errorResponse(res, 'Only declared dividends can be approved', 400);
  }
  
  await declaration.update({ status: 'approved' });
  
  return successResponse(res, { declaration: declaration.getPublicData() }, 'Dividend declaration approved');
}));

// Generate distributions for a declaration
router.post('/declarations/:id/generate-distributions', requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  
  const declaration = await DividendDeclaration.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!declaration) {
    return errorResponse(res, 'Dividend declaration not found', 404);
  }
  
  if (declaration.status !== 'approved') {
    return errorResponse(res, 'Only approved dividends can have distributions generated', 400);
  }
  
  // Get all active shareholders
  const shareholders = await Shareholder.findAll({
    where: { 
      company_id: companyId,
      status: 'active'
    }
  });
  
  if (shareholders.length === 0) {
    return errorResponse(res, 'No active shareholders found', 400);
  }
  
  // Create distributions for each shareholder
  const distributions = [];
  for (const shareholder of shareholders) {
    const grossAmount = shareholder.shares_held * declaration.dividend_per_share;
    const taxAmount = (grossAmount * declaration.tax_rate) / 100;
    const netAmount = grossAmount - taxAmount;
    
    const distribution = await DividendDistribution.create({
      company_id: companyId,
      declaration_id: id,
      shareholder_id: shareholder.id,
      shares_held: shareholder.shares_held,
      dividend_per_share: declaration.dividend_per_share,
      gross_amount: grossAmount,
      tax_amount: taxAmount,
      net_amount: netAmount,
      payment_status: 'pending'
    });
    
    distributions.push(distribution.getPublicData());
  }
  
  await declaration.update({ status: 'distributed' });
  
  return successResponse(res, { 
    distributions,
    declaration: declaration.getPublicData()
  }, 'Distributions generated successfully', 201);
}));

// Get dividend distributions
router.get('/distributions', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { declaration_id, shareholder_id, payment_status, page = 1, limit = 50 } = req.query;
  
  const whereClause = { company_id: companyId };
  if (declaration_id) whereClause.declaration_id = declaration_id;
  if (shareholder_id) whereClause.shareholder_id = shareholder_id;
  if (payment_status) whereClause.payment_status = payment_status;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { count, rows: distributions } = await DividendDistribution.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: DividendDeclaration,
        as: 'declaration',
        attributes: ['id', 'declaration_date', 'financial_year', 'dividend_type']
      },
      {
        model: Shareholder,
        as: 'shareholder',
        attributes: ['id', 'person_id', 'shares_held', 'share_percentage']
      }
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
  
  return successResponse(res, {
    distributions: distributions.map(distribution => distribution.getPublicData()),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit))
    }
  }, 'Dividend distributions retrieved');
}));

// Update distribution payment status
router.put('/distributions/:id/payment', requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  const { payment_status, payment_method, payment_reference, payment_proof_url } = req.body;
  
  if (!['paid', 'failed', 'cancelled'].includes(payment_status)) {
    return errorResponse(res, 'Invalid payment status', 400);
  }
  
  const distribution = await DividendDistribution.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!distribution) {
    return errorResponse(res, 'Dividend distribution not found', 404);
  }
  
  const updateData = { payment_status };
  if (payment_status === 'paid') {
    updateData.payment_date = new Date();
    updateData.payment_method = payment_method;
    updateData.payment_reference = payment_reference;
    updateData.payment_proof_url = payment_proof_url;
  }
  
  await distribution.update(updateData);
  
  return successResponse(res, { distribution: distribution.getPublicData() }, 'Payment status updated');
}));

// Get dividend statistics
router.get('/statistics', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  
  const stats = await DividendDeclaration.getStatistics(companyId);
  
  return successResponse(res, stats, 'Dividend statistics retrieved');
}));

// Get dividend history for a shareholder
router.get('/shareholder/:shareholderId/history', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { shareholderId } = req.params;
  
  const distributions = await DividendDistribution.findAll({
    where: { 
      company_id: companyId,
      shareholder_id: shareholderId
    },
    include: [
      {
        model: DividendDeclaration,
        as: 'declaration',
        attributes: ['id', 'declaration_date', 'financial_year', 'dividend_type', 'status']
      }
    ],
    order: [['created_at', 'DESC']]
  });
  
  return successResponse(res, {
    distributions: distributions.map(distribution => distribution.getPublicData())
  }, 'Shareholder dividend history retrieved');
}));

export default router;