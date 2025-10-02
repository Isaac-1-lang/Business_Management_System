/**
 * CAPITAL MANAGEMENT ROUTES
 * 
 * Handles all capital locking and management operations
 */

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { requireCompanyAccess, requireRole } from '../middleware/auth.js';
import { asyncHandler, successResponse, errorResponse } from '../middleware/errorHandler.js';
import { LockedCapital, EarlyWithdrawalRequest, Person } from '../models/index.js';

const router = express.Router();

// Validation rules
const capitalValidation = [
  body('investor_id').isUUID().withMessage('Valid investor ID required'),
  body('investor_name').notEmpty().withMessage('Investor name is required'),
  body('amount').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid amount required'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Valid currency code required'),
  body('lock_period_months').isInt({ min: 1, max: 60 }).withMessage('Lock period must be 1-60 months'),
  body('lock_date').isISO8601().withMessage('Valid lock date required'),
  body('base_roi_rate').optional().isDecimal({ decimal_digits: '0,2' }).withMessage('Valid ROI rate required'),
  body('bonus_rate').optional().isDecimal({ decimal_digits: '0,2' }).withMessage('Valid bonus rate required')
];

const withdrawalValidation = [
  body('locked_capital_id').isUUID().withMessage('Valid locked capital ID required'),
  body('reason').notEmpty().withMessage('Withdrawal reason is required')
];

// Get all locked capitals for a company
router.get('/', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { status, investor_id, page = 1, limit = 50 } = req.query;
  
  const whereClause = { company_id: companyId };
  if (status) whereClause.status = status;
  if (investor_id) whereClause.investor_id = investor_id;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { count, rows: capitals } = await LockedCapital.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Person,
        as: 'investor',
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
      }
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
  
  return successResponse(res, {
    capitals: capitals.map(capital => capital.getPublicData()),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit))
    }
  }, 'Locked capitals retrieved');
}));

// Get specific locked capital
router.get('/:id', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  
  const capital = await LockedCapital.findOne({
    where: { id, company_id: companyId },
    include: [
      {
        model: Person,
        as: 'investor',
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'address']
      },
      {
        model: EarlyWithdrawalRequest,
        as: 'withdrawalRequests',
        order: [['created_at', 'DESC']]
      }
    ]
  });
  
  if (!capital) {
    return errorResponse(res, 'Locked capital not found', 404);
  }
  
  return successResponse(res, { capital: capital.getPublicData() }, 'Locked capital retrieved');
}));

// Create new locked capital
router.post('/', capitalValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const payload = req.body;
  
  // Calculate unlock date
  const lockDate = new Date(payload.lock_date);
  const unlockDate = new Date(lockDate);
  unlockDate.setMonth(unlockDate.getMonth() + payload.lock_period_months);
  
  // Calculate total ROI rate
  const totalRoiRate = parseFloat(payload.base_roi_rate || 8.00) + parseFloat(payload.bonus_rate || 0.00);
  
  const capital = await LockedCapital.create({
    company_id: companyId,
    investor_id: payload.investor_id,
    investor_name: payload.investor_name,
    amount: payload.amount,
    currency: payload.currency || 'RWF',
    lock_period_months: payload.lock_period_months,
    lock_date: payload.lock_date,
    unlock_date: unlockDate.toISOString().split('T')[0],
    base_roi_rate: payload.base_roi_rate || 8.00,
    bonus_rate: payload.bonus_rate || 0.00,
    total_roi_rate: totalRoiRate,
    early_withdrawal_penalty_rate: payload.early_withdrawal_penalty_rate || 2.00,
    notes: payload.notes
  });
  
  return successResponse(res, { capital: capital.getPublicData() }, 'Capital locked successfully', 201);
}));

// Update locked capital
router.put('/:id', capitalValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const { id } = req.params;
  const payload = req.body;
  
  const capital = await LockedCapital.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!capital) {
    return errorResponse(res, 'Locked capital not found', 404);
  }
  
  if (capital.status !== 'locked') {
    return errorResponse(res, 'Only locked capitals can be updated', 400);
  }
  
  // Update fields
  const updateData = {};
  if (payload.investor_name) updateData.investor_name = payload.investor_name;
  if (payload.base_roi_rate) updateData.base_roi_rate = payload.base_roi_rate;
  if (payload.bonus_rate) updateData.bonus_rate = payload.bonus_rate;
  if (payload.notes) updateData.notes = payload.notes;
  
  // Recalculate total ROI rate
  if (payload.base_roi_rate || payload.bonus_rate) {
    updateData.total_roi_rate = parseFloat(updateData.base_roi_rate || capital.base_roi_rate) + 
                                 parseFloat(updateData.bonus_rate || capital.bonus_rate);
  }
  
  await capital.update(updateData);
  
  return successResponse(res, { capital: capital.getPublicData() }, 'Capital updated successfully');
}));

// Unlock capital
router.post('/:id/unlock', requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  
  const capital = await LockedCapital.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!capital) {
    return errorResponse(res, 'Locked capital not found', 404);
  }
  
  if (capital.status !== 'locked') {
    return errorResponse(res, 'Capital is not locked', 400);
  }
  
  await capital.update({ status: 'unlocked' });
  
  return successResponse(res, { capital: capital.getPublicData() }, 'Capital unlocked successfully');
}));

// Request early withdrawal
router.post('/:id/early-withdrawal', withdrawalValidation, requireCompanyAccess, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const { id } = req.params;
  const payload = req.body;
  
  const capital = await LockedCapital.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!capital) {
    return errorResponse(res, 'Locked capital not found', 404);
  }
  
  if (capital.status !== 'locked') {
    return errorResponse(res, 'Capital is not locked', 400);
  }
  
  // Calculate penalty amount
  const penaltyAmount = (capital.amount * capital.early_withdrawal_penalty_rate) / 100;
  
  const withdrawalRequest = await EarlyWithdrawalRequest.create({
    company_id: companyId,
    locked_capital_id: id,
    reason: payload.reason,
    penalty_amount: penaltyAmount,
    status: 'pending'
  });
  
  await capital.update({ 
    status: 'early_withdrawal_requested',
    penalty_amount: penaltyAmount
  });
  
  return successResponse(res, { 
    withdrawalRequest: withdrawalRequest.getPublicData(),
    capital: capital.getPublicData()
  }, 'Early withdrawal requested', 201);
}));

// Approve/Reject early withdrawal
router.put('/withdrawal-requests/:requestId', requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { requestId } = req.params;
  const { status, review_notes } = req.body;
  
  if (!['approved', 'rejected'].includes(status)) {
    return errorResponse(res, 'Invalid status. Must be approved or rejected', 400);
  }
  
  const withdrawalRequest = await EarlyWithdrawalRequest.findOne({
    where: { id: requestId, company_id: companyId },
    include: [{ model: LockedCapital, as: 'lockedCapital' }]
  });
  
  if (!withdrawalRequest) {
    return errorResponse(res, 'Withdrawal request not found', 404);
  }
  
  if (withdrawalRequest.status !== 'pending') {
    return errorResponse(res, 'Withdrawal request already processed', 400);
  }
  
  await withdrawalRequest.update({
    status,
    reviewed_by: req.user.id,
    reviewed_at: new Date(),
    review_notes
  });
  
  // Update capital status
  const capitalStatus = status === 'approved' ? 'penalty_applied' : 'locked';
  await withdrawalRequest.lockedCapital.update({ status: capitalStatus });
  
  return successResponse(res, { 
    withdrawalRequest: withdrawalRequest.getPublicData(),
    capital: withdrawalRequest.lockedCapital.getPublicData()
  }, `Withdrawal request ${status}`);
}));

// Get capital statistics
router.get('/statistics/overview', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  
  const stats = await LockedCapital.getStatistics(companyId);
  
  return successResponse(res, stats, 'Capital statistics retrieved');
}));

// Get early withdrawal requests
router.get('/withdrawal-requests', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { status, page = 1, limit = 50 } = req.query;
  
  const whereClause = { company_id: companyId };
  if (status) whereClause.status = status;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { count, rows: requests } = await EarlyWithdrawalRequest.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: LockedCapital,
        as: 'lockedCapital',
        attributes: ['id', 'investor_name', 'amount', 'currency', 'lock_date', 'unlock_date']
      }
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
  
  return successResponse(res, {
    requests: requests.map(request => request.getPublicData()),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit))
    }
  }, 'Withdrawal requests retrieved');
}));

export default router;
