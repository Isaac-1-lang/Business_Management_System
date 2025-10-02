/**
 * MULTI-CURRENCY MANAGEMENT ROUTES
 * 
 * Handles currency rates and transactions
 */

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { requireCompanyAccess, requireRole } from '../middleware/auth.js';
import { asyncHandler, successResponse, errorResponse } from '../middleware/errorHandler.js';
import { CurrencyRate, CurrencyTransaction } from '../models/index.js';

const router = express.Router();

// Validation rules
const rateValidation = [
  body('from_currency').isLength({ min: 3, max: 3 }).withMessage('Valid from currency code required'),
  body('to_currency').isLength({ min: 3, max: 3 }).withMessage('Valid to currency code required'),
  body('rate').isDecimal({ decimal_digits: '0,6' }).withMessage('Valid exchange rate required'),
  body('rate_date').optional().isISO8601().withMessage('Valid rate date required'),
  body('source').optional().isIn(['manual', 'api', 'bank']).withMessage('Valid source required')
];

const transactionValidation = [
  body('transaction_type').isIn(['exchange', 'conversion', 'hedge', 'settlement']).withMessage('Valid transaction type required'),
  body('from_currency').isLength({ min: 3, max: 3 }).withMessage('Valid from currency code required'),
  body('to_currency').isLength({ min: 3, max: 3 }).withMessage('Valid to currency code required'),
  body('from_amount').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid from amount required'),
  body('to_amount').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid to amount required'),
  body('exchange_rate').isDecimal({ decimal_digits: '0,6' }).withMessage('Valid exchange rate required')
];

// Get all currency rates for a company
router.get('/rates', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { from_currency, to_currency, is_active, page = 1, limit = 50 } = req.query;
  
  const whereClause = { company_id: companyId };
  if (from_currency) whereClause.from_currency = from_currency;
  if (to_currency) whereClause.to_currency = to_currency;
  if (is_active !== undefined) whereClause.is_active = is_active === 'true';
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { count, rows: rates } = await CurrencyRate.findAndCountAll({
    where: whereClause,
    order: [['rate_date', 'DESC'], ['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
  
  return successResponse(res, {
    rates: rates.map(rate => rate.getPublicData()),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit))
    }
  }, 'Currency rates retrieved');
}));

// Get latest rates for specific currency pairs
router.get('/rates/latest', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { pairs } = req.query; // Format: "USD-RWF,EUR-RWF"
  
  const currencyPairs = pairs ? pairs.split(',') : [];
  
  const rates = await CurrencyRate.getLatestRates(companyId, currencyPairs);
  
  return successResponse(res, { rates }, 'Latest currency rates retrieved');
}));

// Create new currency rate
router.post('/rates', rateValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const payload = req.body;
  
  // Check if rate already exists for the same date and currency pair
  const existingRate = await CurrencyRate.findOne({
    where: {
      company_id: companyId,
      from_currency: payload.from_currency,
      to_currency: payload.to_currency,
      rate_date: payload.rate_date || new Date().toISOString().split('T')[0]
    }
  });
  
  if (existingRate) {
    return errorResponse(res, 'Rate already exists for this currency pair and date', 400);
  }
  
  const rate = await CurrencyRate.create({
    company_id: companyId,
    from_currency: payload.from_currency,
    to_currency: payload.to_currency,
    rate: payload.rate,
    rate_date: payload.rate_date || new Date().toISOString().split('T')[0],
    source: payload.source || 'manual',
    is_active: payload.is_active !== undefined ? payload.is_active : true
  });
  
  return successResponse(res, { rate: rate.getPublicData() }, 'Currency rate created', 201);
}));

// Update currency rate
router.put('/rates/:id', rateValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const { id } = req.params;
  const payload = req.body;
  
  const rate = await CurrencyRate.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!rate) {
    return errorResponse(res, 'Currency rate not found', 404);
  }
  
  await rate.update({
    rate: payload.rate,
    source: payload.source || rate.source,
    is_active: payload.is_active !== undefined ? payload.is_active : rate.is_active
  });
  
  return successResponse(res, { rate: rate.getPublicData() }, 'Currency rate updated');
}));

// Deactivate currency rate
router.delete('/rates/:id', requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  
  const rate = await CurrencyRate.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!rate) {
    return errorResponse(res, 'Currency rate not found', 404);
  }
  
  await rate.update({ is_active: false });
  
  return successResponse(res, { rate: rate.getPublicData() }, 'Currency rate deactivated');
}));

// Get all currency transactions for a company
router.get('/transactions', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { transaction_type, from_currency, to_currency, page = 1, limit = 50 } = req.query;
  
  const whereClause = { company_id: companyId };
  if (transaction_type) whereClause.transaction_type = transaction_type;
  if (from_currency) whereClause.from_currency = from_currency;
  if (to_currency) whereClause.to_currency = to_currency;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { count, rows: transactions } = await CurrencyTransaction.findAndCountAll({
    where: whereClause,
    order: [['transaction_date', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
  
  return successResponse(res, {
    transactions: transactions.map(transaction => transaction.getPublicData()),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit))
    }
  }, 'Currency transactions retrieved');
}));

// Create new currency transaction
router.post('/transactions', transactionValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const payload = req.body;
  
  const transaction = await CurrencyTransaction.create({
    company_id: companyId,
    transaction_type: payload.transaction_type,
    from_currency: payload.from_currency,
    to_currency: payload.to_currency,
    from_amount: payload.from_amount,
    to_amount: payload.to_amount,
    exchange_rate: payload.exchange_rate,
    transaction_date: payload.transaction_date || new Date(),
    reference_id: payload.reference_id,
    notes: payload.notes
  });
  
  return successResponse(res, { transaction: transaction.getPublicData() }, 'Currency transaction created', 201);
}));

// Get currency statistics
router.get('/statistics', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  
  const stats = await CurrencyTransaction.getStatistics(companyId);
  
  return successResponse(res, stats, 'Currency statistics retrieved');
}));

// Convert currency amount
router.post('/convert', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { from_currency, to_currency, amount, rate_date } = req.body;
  
  if (!from_currency || !to_currency || !amount) {
    return errorResponse(res, 'from_currency, to_currency, and amount are required', 400);
  }
  
  const conversion = await CurrencyRate.convertAmount(companyId, from_currency, to_currency, amount, rate_date);
  
  if (!conversion) {
    return errorResponse(res, 'Exchange rate not found for the specified currency pair', 404);
  }
  
  return successResponse(res, conversion, 'Currency conversion completed');
}));

// Get supported currencies
router.get('/currencies', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  
  const currencies = await CurrencyRate.getSupportedCurrencies(companyId);
  
  return successResponse(res, { currencies }, 'Supported currencies retrieved');
}));

export default router;
