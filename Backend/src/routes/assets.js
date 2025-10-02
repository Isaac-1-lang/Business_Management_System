/**
 * FIXED ASSETS ROUTES - CRUD
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { successResponse, errorResponse, asyncHandler } from '../middleware/errorHandler.js';
import { requireRole, requireCompanyAccess } from '../middleware/auth.js';

const router = express.Router();

// In-memory store (replace with DB)
const assets = [];

const createValidation = [
  body('name').isString().isLength({ min: 2 }),
  body('category').isString().isLength({ min: 2 }),
  body('location').isString().isLength({ min: 1 }),
  body('acquisitionCost').isNumeric(),
  body('residualValue').isNumeric(),
  body('usefulLifeYears').isNumeric(),
  body('acquiredOn').isString(),
];

/** GET /assets */
router.get('/', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const items = assets.filter(a => a.company_id === companyId).sort((a,b) => new Date(b.acquiredOn) - new Date(a.acquiredOn));
  return successResponse(res, { assets: items }, 'Assets retrieved');
}));

/** POST /assets */
router.post('/', createValidation, requireCompanyAccess, requireRole(['admin','owner','accountant']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  const { companyId } = req;
  const p = req.body;
  const asset = {
    id: `asset-${Date.now()}`,
    company_id: companyId,
    name: p.name,
    category: p.category,
    location: p.location,
    acquisitionCost: p.acquisitionCost,
    residualValue: p.residualValue,
    usefulLifeYears: p.usefulLifeYears,
    depreciationMethod: p.depreciationMethod || 'straight_line',
    acquiredOn: p.acquiredOn,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  assets.unshift(asset);
  return successResponse(res, { asset }, 'Asset created', 201);
}));

/** PUT /assets/:id */
router.put('/:id', requireCompanyAccess, requireRole(['admin','owner','accountant']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { companyId } = req;
  const idx = assets.findIndex(a => a.id === id && a.company_id === companyId);
  if (idx === -1) return errorResponse(res, 'Asset not found', 404, 'ASSET_NOT_FOUND');
  assets[idx] = { ...assets[idx], ...req.body, updated_at: new Date().toISOString() };
  return successResponse(res, { asset: assets[idx] }, 'Asset updated');
}));

/** DELETE /assets/:id */
router.delete('/:id', requireCompanyAccess, requireRole(['admin','owner','accountant']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { companyId } = req;
  const lenBefore = assets.length;
  for (let i = assets.length - 1; i >= 0; i--) {
    if (assets[i].id === id && assets[i].company_id === companyId) assets.splice(i,1);
  }
  if (lenBefore === assets.length) return errorResponse(res, 'Asset not found', 404, 'ASSET_NOT_FOUND');
  return successResponse(res, {}, 'Asset deleted');
}));

export default router;


