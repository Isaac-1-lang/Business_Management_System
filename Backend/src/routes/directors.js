/**
 * DIRECTORS & SHAREHOLDERS MANAGEMENT ROUTES
 * 
 * Handles directors, shareholders, share certificates, and beneficial owners
 */

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { requireCompanyAccess, requireRole } from '../middleware/auth.js';
import { asyncHandler, successResponse, errorResponse } from '../middleware/errorHandler.js';
import { Director, Shareholder, ShareCertificate, BeneficialOwner, Person } from '../models/index.js';

const router = express.Router();

// Validation rules
const directorValidation = [
  body('person_id').isUUID().withMessage('Valid person ID required'),
  body('director_type').isIn(['executive', 'non_executive', 'independent', 'chairman', 'vice_chairman']).withMessage('Valid director type required'),
  body('appointment_date').isISO8601().withMessage('Valid appointment date required')
];

const shareholderValidation = [
  body('person_id').isUUID().withMessage('Valid person ID required'),
  body('shareholder_type').isIn(['individual', 'corporate', 'institutional', 'government']).withMessage('Valid shareholder type required'),
  body('shares_held').isInt({ min: 1 }).withMessage('Valid shares held required'),
  body('share_percentage').isDecimal({ decimal_digits: '0,4' }).withMessage('Valid share percentage required'),
  body('acquisition_date').isISO8601().withMessage('Valid acquisition date required')
];

const certificateValidation = [
  body('shareholder_id').isUUID().withMessage('Valid shareholder ID required'),
  body('certificate_number').notEmpty().withMessage('Certificate number is required'),
  body('shares_represented').isInt({ min: 1 }).withMessage('Valid shares represented required'),
  body('issue_date').isISO8601().withMessage('Valid issue date required')
];

// Get all directors for a company
router.get('/directors', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { status, director_type, page = 1, limit = 50 } = req.query;
  
  const whereClause = { company_id: companyId };
  if (status) whereClause.status = status;
  if (director_type) whereClause.director_type = director_type;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { count, rows: directors } = await Director.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Person,
        as: 'person',
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'nationality']
      }
    ],
    order: [['appointment_date', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
  
  return successResponse(res, {
    directors: directors.map(director => director.getPublicData()),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit))
    }
  }, 'Directors retrieved');
}));

// Create new director
router.post('/directors', directorValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const payload = req.body;
  
  const director = await Director.create({
    company_id: companyId,
    person_id: payload.person_id,
    director_type: payload.director_type,
    appointment_date: payload.appointment_date,
    resignation_date: payload.resignation_date,
    status: payload.status || 'active',
    board_committees: payload.board_committees || [],
    remuneration: payload.remuneration || 0,
    currency: payload.currency || 'RWF',
    notes: payload.notes
  });
  
  return successResponse(res, { director: director.getPublicData() }, 'Director created', 201);
}));

// Update director
router.put('/directors/:id', directorValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const { id } = req.params;
  const payload = req.body;
  
  const director = await Director.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!director) {
    return errorResponse(res, 'Director not found', 404);
  }
  
  await director.update({
    person_id: payload.person_id,
    director_type: payload.director_type,
    appointment_date: payload.appointment_date,
    resignation_date: payload.resignation_date,
    status: payload.status || director.status,
    board_committees: payload.board_committees || director.board_committees,
    remuneration: payload.remuneration || director.remuneration,
    currency: payload.currency || director.currency,
    notes: payload.notes
  });
  
  return successResponse(res, { director: director.getPublicData() }, 'Director updated');
}));

// Resign director
router.post('/directors/:id/resign', requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  const { resignation_date, notes } = req.body;
  
  const director = await Director.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!director) {
    return errorResponse(res, 'Director not found', 404);
  }
  
  if (director.status !== 'active') {
    return errorResponse(res, 'Director is not active', 400);
  }
  
  await director.update({
    status: 'resigned',
    resignation_date: resignation_date || new Date().toISOString().split('T')[0],
    notes: notes
  });
  
  return successResponse(res, { director: director.getPublicData() }, 'Director resigned');
}));

// Get all shareholders for a company
router.get('/shareholders', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { status, shareholder_type, page = 1, limit = 50 } = req.query;
  
  const whereClause = { company_id: companyId };
  if (status) whereClause.status = status;
  if (shareholder_type) whereClause.shareholder_type = shareholder_type;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { count, rows: shareholders } = await Shareholder.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Person,
        as: 'person',
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'nationality']
      }
    ],
    order: [['shares_held', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
  
  return successResponse(res, {
    shareholders: shareholders.map(shareholder => shareholder.getPublicData()),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit))
    }
  }, 'Shareholders retrieved');
}));

// Create new shareholder
router.post('/shareholders', shareholderValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const payload = req.body;
  
  const shareholder = await Shareholder.create({
    company_id: companyId,
    person_id: payload.person_id,
    shareholder_type: payload.shareholder_type,
    shares_held: payload.shares_held,
    share_percentage: payload.share_percentage,
    acquisition_date: payload.acquisition_date,
    acquisition_price_per_share: payload.acquisition_price_per_share,
    total_acquisition_cost: payload.total_acquisition_cost,
    currency: payload.currency || 'RWF',
    status: payload.status || 'active',
    beneficial_owner: payload.beneficial_owner !== undefined ? payload.beneficial_owner : true,
    nominee_details: payload.nominee_details,
    notes: payload.notes
  });
  
  return successResponse(res, { shareholder: shareholder.getPublicData() }, 'Shareholder created', 201);
}));

// Update shareholder
router.put('/shareholders/:id', shareholderValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const { id } = req.params;
  const payload = req.body;
  
  const shareholder = await Shareholder.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!shareholder) {
    return errorResponse(res, 'Shareholder not found', 404);
  }
  
  await shareholder.update({
    person_id: payload.person_id,
    shareholder_type: payload.shareholder_type,
    shares_held: payload.shares_held,
    share_percentage: payload.share_percentage,
    acquisition_date: payload.acquisition_date,
    acquisition_price_per_share: payload.acquisition_price_per_share,
    total_acquisition_cost: payload.total_acquisition_cost,
    currency: payload.currency || shareholder.currency,
    status: payload.status || shareholder.status,
    beneficial_owner: payload.beneficial_owner !== undefined ? payload.beneficial_owner : shareholder.beneficial_owner,
    nominee_details: payload.nominee_details || shareholder.nominee_details,
    notes: payload.notes
  });
  
  return successResponse(res, { shareholder: shareholder.getPublicData() }, 'Shareholder updated');
}));

// Transfer shares
router.post('/shareholders/:id/transfer', requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  const { to_person_id, shares_to_transfer, transfer_date, transfer_price_per_share, notes } = req.body;
  
  if (!to_person_id || !shares_to_transfer || shares_to_transfer <= 0) {
    return errorResponse(res, 'Valid transfer details required', 400);
  }
  
  const fromShareholder = await Shareholder.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!fromShareholder) {
    return errorResponse(res, 'Shareholder not found', 404);
  }
  
  if (fromShareholder.shares_held < shares_to_transfer) {
    return errorResponse(res, 'Insufficient shares to transfer', 400);
  }
  
  // Find or create the receiving shareholder
  let toShareholder = await Shareholder.findOne({
    where: { 
      company_id: companyId,
      person_id: to_person_id,
      status: 'active'
    }
  });
  
  if (!toShareholder) {
    // Create new shareholder record
    toShareholder = await Shareholder.create({
      company_id: companyId,
      person_id: to_person_id,
      shareholder_type: 'individual',
      shares_held: shares_to_transfer,
      share_percentage: (shares_to_transfer / fromShareholder.shares_held) * fromShareholder.share_percentage,
      acquisition_date: transfer_date || new Date().toISOString().split('T')[0],
      acquisition_price_per_share: transfer_price_per_share,
      total_acquisition_cost: shares_to_transfer * (transfer_price_per_share || 0),
      currency: fromShareholder.currency,
      status: 'active',
      beneficial_owner: true
    });
  } else {
    // Update existing shareholder
    const newSharesHeld = toShareholder.shares_held + shares_to_transfer;
    const newPercentage = (newSharesHeld / (fromShareholder.shares_held + toShareholder.shares_held)) * 100;
    
    await toShareholder.update({
      shares_held: newSharesHeld,
      share_percentage: newPercentage
    });
  }
  
  // Update from shareholder
  const remainingShares = fromShareholder.shares_held - shares_to_transfer;
  const newPercentage = (remainingShares / fromShareholder.shares_held) * fromShareholder.share_percentage;
  
  await fromShareholder.update({
    shares_held: remainingShares,
    share_percentage: newPercentage,
    transfer_date: transfer_date || new Date().toISOString().split('T')[0],
    notes: notes
  });
  
  return successResponse(res, { 
    fromShareholder: fromShareholder.getPublicData(),
    toShareholder: toShareholder.getPublicData()
  }, 'Shares transferred successfully');
}));

// Get share certificates
router.get('/certificates', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { shareholder_id, status, page = 1, limit = 50 } = req.query;
  
  const whereClause = { company_id: companyId };
  if (shareholder_id) whereClause.shareholder_id = shareholder_id;
  if (status) whereClause.status = status;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { count, rows: certificates } = await ShareCertificate.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Shareholder,
        as: 'shareholder',
        attributes: ['id', 'person_id', 'shares_held', 'share_percentage'],
        include: [
          {
            model: Person,
            as: 'person',
            attributes: ['id', 'first_name', 'last_name']
          }
        ]
      }
    ],
    order: [['issue_date', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
  
  return successResponse(res, {
    certificates: certificates.map(certificate => certificate.getPublicData()),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit))
    }
  }, 'Share certificates retrieved');
}));

// Create share certificate
router.post('/certificates', certificateValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const payload = req.body;
  
  // Check if certificate number already exists
  const existingCertificate = await ShareCertificate.findOne({
    where: { certificate_number: payload.certificate_number }
  });
  
  if (existingCertificate) {
    return errorResponse(res, 'Certificate number already exists', 400);
  }
  
  const certificate = await ShareCertificate.create({
    company_id: companyId,
    shareholder_id: payload.shareholder_id,
    certificate_number: payload.certificate_number,
    shares_represented: payload.shares_represented,
    issue_date: payload.issue_date,
    status: payload.status || 'active',
    notes: payload.notes
  });
  
  return successResponse(res, { certificate: certificate.getPublicData() }, 'Share certificate created', 201);
}));

// Get beneficial owners
router.get('/beneficial-owners', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { status, ownership_type, page = 1, limit = 50 } = req.query;
  
  const whereClause = { company_id: companyId };
  if (status) whereClause.status = status;
  if (ownership_type) whereClause.ownership_type = ownership_type;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { count, rows: beneficialOwners } = await BeneficialOwner.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Person,
        as: 'person',
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'nationality']
      }
    ],
    order: [['ownership_percentage', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
  
  return successResponse(res, {
    beneficialOwners: beneficialOwners.map(owner => owner.getPublicData()),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit))
    }
  }, 'Beneficial owners retrieved');
}));

// Create beneficial owner
router.post('/beneficial-owners', requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const { companyId } = req;
  const payload = req.body;
  
  if (!payload.person_id || !payload.ownership_percentage) {
    return errorResponse(res, 'Person ID and ownership percentage are required', 400);
  }
  
  const beneficialOwner = await BeneficialOwner.create({
    company_id: companyId,
    person_id: payload.person_id,
    ownership_percentage: payload.ownership_percentage,
    ownership_type: payload.ownership_type || 'direct',
    control_type: payload.control_type || 'both',
    acquisition_date: payload.acquisition_date || new Date().toISOString().split('T')[0],
    status: payload.status || 'active',
    notes: payload.notes
  });
  
  return successResponse(res, { beneficialOwner: beneficialOwner.getPublicData() }, 'Beneficial owner created', 201);
}));

// Get ownership statistics
router.get('/statistics', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  
  const stats = await Shareholder.getOwnershipStatistics(companyId);
  
  return successResponse(res, stats, 'Ownership statistics retrieved');
}));

// Get board composition
router.get('/board-composition', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  
  const composition = await Director.getBoardComposition(companyId);
  
  return successResponse(res, composition, 'Board composition retrieved');
}));

export default router;
