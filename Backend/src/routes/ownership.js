/**
 * OWNERSHIP ROUTES - Company Capital, Shareholders, Beneficial Owners
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { successResponse, errorResponse, asyncHandler } from '../middleware/errorHandler.js';
import { requireRole, requireCompanyAccess } from '../middleware/auth.js';

const router = express.Router();

// In-memory (replace with DB)
const capital = []; // { id, company_id, authorized_shares, par_value, created_at }
const contributions = []; // { id, company_id, shareholder_id, amount, shares_allocated, created_at }
const shareholders = []; // { id, company_id, name, shares_held }
const beneficialOwners = []; // { id, company_id, full_name, ownership_percentage }

/** CAPITAL */
router.get('/capital', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const items = capital.filter(c => c.company_id === companyId);
  return successResponse(res, { capital: items }, 'Capital retrieved');
}));

router.post('/capital', [
  body('authorized_shares').isNumeric(),
  body('par_value').isNumeric(),
], requireCompanyAccess, requireRole(['admin','owner']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  const { companyId } = req;
  const item = { id: `cap-${Date.now()}`, company_id: companyId, authorized_shares: req.body.authorized_shares, par_value: req.body.par_value, created_at: new Date().toISOString() };
  capital.push(item);
  return successResponse(res, { capital: item }, 'Capital saved', 201);
}));

/** SHAREHOLDERS */
router.get('/shareholders', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const items = shareholders.filter(s => s.company_id === companyId);
  return successResponse(res, { shareholders: items }, 'Shareholders retrieved');
}));

router.post('/shareholders', [
  body('name').isString().isLength({ min: 2 }),
  body('shares_held').isNumeric(),
], requireCompanyAccess, requireRole(['admin','owner']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  const { companyId } = req;
  const s = { id: `shr-${Date.now()}`, company_id: companyId, name: req.body.name, shares_held: Number(req.body.shares_held) };
  shareholders.push(s);
  return successResponse(res, { shareholder: s }, 'Shareholder added', 201);
}));

/** BENEFICIAL OWNERS */
router.get('/beneficial-owners', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const items = beneficialOwners.filter(b => b.company_id === companyId);
  return successResponse(res, { beneficialOwners: items }, 'Beneficial owners retrieved');
}));

router.post('/beneficial-owners', [
  body('full_name').isString().isLength({ min: 2 }),
  body('ownership_percentage').isNumeric(),
], requireCompanyAccess, requireRole(['admin','owner']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  const { companyId } = req;
  const b = { id: `bo-${Date.now()}`, company_id: companyId, full_name: req.body.full_name, ownership_percentage: Number(req.body.ownership_percentage) };
  beneficialOwners.push(b);
  return successResponse(res, { beneficialOwner: b }, 'Beneficial owner added', 201);
}));

export default router;


