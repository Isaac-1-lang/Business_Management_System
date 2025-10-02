/**
 * INVOICES/RECEIPTS ROUTES - Basic CRUD
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { successResponse, errorResponse, asyncHandler } from '../middleware/errorHandler.js';
import { requireRole, requireCompanyAccess } from '../middleware/auth.js';

const router = express.Router();

// In-memory store (replace with DB)
const records = [];
let invoiceCounter = 1;
let receiptCounter = 1;

const createValidation = [
  body('type').isIn(['invoice','receipt']),
  body('party_name').isString().isLength({ min: 2 }),
  body('description').isString().isLength({ min: 2 }),
  body('amount').isNumeric(),
  body('vat').isNumeric(),
  body('total').isNumeric(),
  body('date').isString(),
];

function generateNumber(type) {
  if (type === 'invoice') return `INV-${new Date().getFullYear()}-${String(invoiceCounter++).padStart(3,'0')}`;
  return `REC-${new Date().getFullYear()}-${String(receiptCounter++).padStart(3,'0')}`;
}

/** GET /invoices */
router.get('/', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const items = records.filter(r => r.company_id === companyId).sort((a,b) => new Date(b.date) - new Date(a.date));
  return successResponse(res, { items }, 'Invoice/Receipt records retrieved');
}));

/** POST /invoices */
router.post('/', createValidation, requireCompanyAccess, requireRole(['admin','owner','accountant']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  const { companyId } = req;
  const p = req.body;
  const item = {
    id: `inv-${Date.now()}`,
    company_id: companyId,
    transaction_id: p.transaction_id || null,
    type: p.type,
    number: p.number || generateNumber(p.type),
    party_name: p.party_name,
    tin: p.tin || null,
    description: p.description,
    amount: p.amount,
    vat: p.vat,
    total: p.total,
    attachment_url: p.attachment_url || null,
    date: p.date,
    status: p.status || 'draft',
    created_at: new Date().toISOString(),
    payment_method: p.payment_method || null,
    phone_number: p.phone_number || null,
    momo_reference: p.momo_reference || null,
    tax_category: p.tax_category || null,
  };
  records.push(item);
  return successResponse(res, { item }, 'Record created', 201);
}));

/** PUT /invoices/:id/status */
router.put('/:id/status', requireCompanyAccess, requireRole(['admin','owner','accountant']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const rec = records.find(r => r.id === id);
  if (!rec) return errorResponse(res, 'Record not found', 404, 'RECORD_NOT_FOUND');
  rec.status = status;
  return successResponse(res, { item: rec }, 'Status updated');
}));

export default router;


