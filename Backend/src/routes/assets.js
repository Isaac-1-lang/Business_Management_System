/**
 * ASSETS MANAGEMENT ROUTES
 * 
 * Handles asset categories, fixed assets, and maintenance
 */

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { requireCompanyAccess, requireRole } from '../middleware/auth.js';
import { asyncHandler, successResponse, errorResponse } from '../middleware/errorHandler.js';
import { AssetCategory, FixedAsset, AssetMaintenance } from '../models/index.js';

const router = express.Router();

// Validation rules
const categoryValidation = [
  body('name').notEmpty().withMessage('Category name is required'),
  body('description').optional().isString().withMessage('Valid description required')
];

const assetValidation = [
  body('category_id').isUUID().withMessage('Valid category ID required'),
  body('asset_tag').notEmpty().withMessage('Asset tag is required'),
  body('name').notEmpty().withMessage('Asset name is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('acquisition_date').isISO8601().withMessage('Valid acquisition date required'),
  body('acquisition_cost').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid acquisition cost required'),
  body('useful_life_years').isInt({ min: 1 }).withMessage('Valid useful life required')
];

const maintenanceValidation = [
  body('asset_id').isUUID().withMessage('Valid asset ID required'),
  body('maintenance_type').isIn(['preventive', 'corrective', 'emergency', 'inspection']).withMessage('Valid maintenance type required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('maintenance_date').isISO8601().withMessage('Valid maintenance date required'),
  body('cost').optional().isDecimal({ decimal_digits: '0,2' }).withMessage('Valid cost required')
];

// Get all asset categories for a company
router.get('/categories', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { is_active, page = 1, limit = 50 } = req.query;
  
  const whereClause = { company_id: companyId };
  if (is_active !== undefined) whereClause.is_active = is_active === 'true';
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { count, rows: categories } = await AssetCategory.findAndCountAll({
    where: whereClause,
    order: [['name', 'ASC']],
    limit: parseInt(limit),
    offset: offset
  });
  
  return successResponse(res, {
    categories: categories.map(category => category.getPublicData()),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit))
    }
  }, 'Asset categories retrieved');
}));

// Create new asset category
router.post('/categories', categoryValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const payload = req.body;
  
  const category = await AssetCategory.create({
    company_id: companyId,
    name: payload.name,
    description: payload.description,
    parent_id: payload.parent_id,
    color: payload.color || '#3B82F6',
    icon: payload.icon || 'folder',
    is_active: payload.is_active !== undefined ? payload.is_active : true
  });
  
  return successResponse(res, { category: category.getPublicData() }, 'Asset category created', 201);
}));

// Update asset category
router.put('/categories/:id', categoryValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const { id } = req.params;
  const payload = req.body;
  
  const category = await AssetCategory.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!category) {
    return errorResponse(res, 'Asset category not found', 404);
  }
  
  await category.update({
    name: payload.name,
    description: payload.description,
    parent_id: payload.parent_id,
    color: payload.color || category.color,
    icon: payload.icon || category.icon,
    is_active: payload.is_active !== undefined ? payload.is_active : category.is_active
  });
  
  return successResponse(res, { category: category.getPublicData() }, 'Asset category updated');
}));

// Get all fixed assets for a company
router.get('/', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { category_id, status, location, page = 1, limit = 50 } = req.query;
  
  const whereClause = { company_id: companyId };
  if (category_id) whereClause.category_id = category_id;
  if (status) whereClause.status = status;
  if (location) whereClause.location = { [Op.iLike]: `%${location}%` };
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { count, rows: assets } = await FixedAsset.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: AssetCategory,
        as: 'category',
        attributes: ['id', 'name', 'color', 'icon']
      }
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
  
  return successResponse(res, {
    assets: assets.map(asset => asset.getPublicData()),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit))
    }
  }, 'Fixed assets retrieved');
}));

// Get specific fixed asset
router.get('/:id', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  
  const asset = await FixedAsset.findOne({
    where: { id, company_id: companyId },
    include: [
      {
        model: AssetCategory,
        as: 'category',
        attributes: ['id', 'name', 'color', 'icon']
      },
      {
        model: AssetMaintenance,
        as: 'maintenance',
        order: [['maintenance_date', 'DESC']]
      }
    ]
  });
  
  if (!asset) {
    return errorResponse(res, 'Fixed asset not found', 404);
  }
  
  return successResponse(res, { asset: asset.getPublicData() }, 'Fixed asset retrieved');
}));

// Create new fixed asset
router.post('/', assetValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const payload = req.body;
  
  // Check if asset tag already exists
  const existingAsset = await FixedAsset.findOne({
    where: { asset_tag: payload.asset_tag }
  });
  
  if (existingAsset) {
    return errorResponse(res, 'Asset tag already exists', 400);
  }
  
  // Calculate book value (initially same as acquisition cost)
  const bookValue = payload.acquisition_cost - payload.residual_value;
  
  const asset = await FixedAsset.create({
    company_id: companyId,
    category_id: payload.category_id,
    asset_tag: payload.asset_tag,
    name: payload.name,
    description: payload.description,
    serial_number: payload.serial_number,
    model: payload.model,
    manufacturer: payload.manufacturer,
    location: payload.location,
    department: payload.department,
    custodian: payload.custodian,
    acquisition_date: payload.acquisition_date,
    acquisition_cost: payload.acquisition_cost,
    currency: payload.currency || 'RWF',
    useful_life_years: payload.useful_life_years,
    residual_value: payload.residual_value || 0,
    depreciation_method: payload.depreciation_method || 'straight_line',
    book_value: bookValue,
    status: payload.status || 'active',
    notes: payload.notes
  });
  
  return successResponse(res, { asset: asset.getPublicData() }, 'Fixed asset created', 201);
}));

// Update fixed asset
router.put('/:id', assetValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const { id } = req.params;
  const payload = req.body;
  
  const asset = await FixedAsset.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!asset) {
    return errorResponse(res, 'Fixed asset not found', 404);
  }
  
  if (asset.status === 'disposed') {
    return errorResponse(res, 'Cannot update disposed asset', 400);
  }
  
  await asset.update({
    category_id: payload.category_id,
    asset_tag: payload.asset_tag,
    name: payload.name,
    description: payload.description,
    serial_number: payload.serial_number,
    model: payload.model,
    manufacturer: payload.manufacturer,
    location: payload.location,
    department: payload.department,
    custodian: payload.custodian,
    acquisition_date: payload.acquisition_date,
    acquisition_cost: payload.acquisition_cost,
    currency: payload.currency || asset.currency,
    useful_life_years: payload.useful_life_years,
    residual_value: payload.residual_value || asset.residual_value,
    depreciation_method: payload.depreciation_method || asset.depreciation_method,
    status: payload.status || asset.status,
    notes: payload.notes
  });
  
  return successResponse(res, { asset: asset.getPublicData() }, 'Fixed asset updated');
}));

// Dispose asset
router.post('/:id/dispose', requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  const { disposal_date, disposal_value, disposal_method, notes } = req.body;
  
  const asset = await FixedAsset.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!asset) {
    return errorResponse(res, 'Fixed asset not found', 404);
  }
  
  if (asset.status === 'disposed') {
    return errorResponse(res, 'Asset already disposed', 400);
  }
  
  await asset.update({
    status: 'disposed',
    disposal_date: disposal_date || new Date().toISOString().split('T')[0],
    disposal_value: disposal_value || 0,
    disposal_method: disposal_method || 'sale',
    notes: notes
  });
  
  return successResponse(res, { asset: asset.getPublicData() }, 'Asset disposed successfully');
}));

// Get asset maintenance records
router.get('/:id/maintenance', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  const { maintenance_type, status, page = 1, limit = 50 } = req.query;
  
  const whereClause = { 
    company_id: companyId,
    asset_id: id
  };
  if (maintenance_type) whereClause.maintenance_type = maintenance_type;
  if (status) whereClause.status = status;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { count, rows: maintenance } = await AssetMaintenance.findAndCountAll({
    where: whereClause,
    order: [['maintenance_date', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
  
  return successResponse(res, {
    maintenance: maintenance.map(record => record.getPublicData()),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit))
    }
  }, 'Asset maintenance records retrieved');
}));

// Create maintenance record
router.post('/:id/maintenance', maintenanceValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const { id } = req.params;
  const payload = req.body;
  
  const asset = await FixedAsset.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!asset) {
    return errorResponse(res, 'Fixed asset not found', 404);
  }
  
  const maintenance = await AssetMaintenance.create({
    company_id: companyId,
    asset_id: id,
    maintenance_type: payload.maintenance_type,
    description: payload.description,
    maintenance_date: payload.maintenance_date,
    cost: payload.cost || 0,
    vendor: payload.vendor,
    technician: payload.technician,
    status: payload.status || 'scheduled',
    next_maintenance_date: payload.next_maintenance_date,
    notes: payload.notes
  });
  
  return successResponse(res, { maintenance: maintenance.getPublicData() }, 'Maintenance record created', 201);
}));

// Update maintenance record
router.put('/maintenance/:maintenanceId', maintenanceValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const { maintenanceId } = req.params;
  const payload = req.body;
  
  const maintenance = await AssetMaintenance.findOne({
    where: { id: maintenanceId, company_id: companyId }
  });
  
  if (!maintenance) {
    return errorResponse(res, 'Maintenance record not found', 404);
  }
  
  await maintenance.update({
    maintenance_type: payload.maintenance_type,
    description: payload.description,
    maintenance_date: payload.maintenance_date,
    cost: payload.cost || maintenance.cost,
    vendor: payload.vendor,
    technician: payload.technician,
    status: payload.status || maintenance.status,
    next_maintenance_date: payload.next_maintenance_date,
    notes: payload.notes
  });
  
  return successResponse(res, { maintenance: maintenance.getPublicData() }, 'Maintenance record updated');
}));

// Get asset statistics
router.get('/statistics/overview', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  
  const stats = await FixedAsset.getStatistics(companyId);
  
  return successResponse(res, stats, 'Asset statistics retrieved');
}));

// Get assets by category
router.get('/by-category/:categoryId', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { categoryId } = req.params;
  const { status, page = 1, limit = 50 } = req.query;
  
  const whereClause = { 
    company_id: companyId,
    category_id: categoryId
  };
  if (status) whereClause.status = status;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { count, rows: assets } = await FixedAsset.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: AssetCategory,
        as: 'category',
        attributes: ['id', 'name', 'color', 'icon']
      }
    ],
    order: [['name', 'ASC']],
    limit: parseInt(limit),
    offset: offset
  });
  
  return successResponse(res, {
    assets: assets.map(asset => asset.getPublicData()),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit))
    }
  }, 'Assets by category retrieved');
}));

// Calculate depreciation for an asset
router.post('/:id/calculate-depreciation', requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  const { as_of_date } = req.body;
  
  const asset = await FixedAsset.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!asset) {
    return errorResponse(res, 'Fixed asset not found', 404);
  }
  
  const depreciation = await asset.calculateDepreciation(as_of_date);
  
  return successResponse(res, depreciation, 'Depreciation calculated');
}));

export default router;