/**
 * DOCUMENT VAULT ROUTES
 * 
 * Handles document categories, documents, access control, and activities
 */

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { requireCompanyAccess, requireRole } from '../middleware/auth.js';
import { asyncHandler, successResponse, errorResponse } from '../middleware/errorHandler.js';
import { DocumentCategory, Document, DocumentAccess, DocumentActivity } from '../models/index.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'documents');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Validation rules
const categoryValidation = [
  body('name').notEmpty().withMessage('Category name is required'),
  body('description').optional().isString().withMessage('Valid description required')
];

const documentValidation = [
  body('category_id').isUUID().withMessage('Valid category ID required'),
  body('title').notEmpty().withMessage('Document title is required'),
  body('description').optional().isString().withMessage('Valid description required'),
  body('document_type').isIn(['contract', 'agreement', 'report', 'invoice', 'receipt', 'certificate', 'license', 'permit', 'other']).withMessage('Valid document type required'),
  body('access_level').isIn(['public', 'internal', 'confidential', 'restricted']).withMessage('Valid access level required')
];

// Get all document categories for a company
router.get('/categories', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { is_active, page = 1, limit = 50 } = req.query;
  
  const whereClause = { company_id: companyId };
  if (is_active !== undefined) whereClause.is_active = is_active === 'true';
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { count, rows: categories } = await DocumentCategory.findAndCountAll({
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
  }, 'Document categories retrieved');
}));

// Create new document category
router.post('/categories', categoryValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const payload = req.body;
  
  const category = await DocumentCategory.create({
    company_id: companyId,
    name: payload.name,
    description: payload.description,
    parent_id: payload.parent_id,
    color: payload.color || '#3B82F6',
    icon: payload.icon || 'folder',
    is_active: payload.is_active !== undefined ? payload.is_active : true
  });
  
  return successResponse(res, { category: category.getPublicData() }, 'Document category created', 201);
}));

// Update document category
router.put('/categories/:id', categoryValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const { id } = req.params;
  const payload = req.body;
  
  const category = await DocumentCategory.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!category) {
    return errorResponse(res, 'Document category not found', 404);
  }
  
  await category.update({
    name: payload.name,
    description: payload.description,
    parent_id: payload.parent_id,
    color: payload.color || category.color,
    icon: payload.icon || category.icon,
    is_active: payload.is_active !== undefined ? payload.is_active : category.is_active
  });
  
  return successResponse(res, { category: category.getPublicData() }, 'Document category updated');
}));

// Get all documents for a company
router.get('/', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { category_id, document_type, status, access_level, page = 1, limit = 50 } = req.query;
  
  const whereClause = { company_id: companyId };
  if (category_id) whereClause.category_id = category_id;
  if (document_type) whereClause.document_type = document_type;
  if (status) whereClause.status = status;
  if (access_level) whereClause.access_level = access_level;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { count, rows: documents } = await Document.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: DocumentCategory,
        as: 'category',
        attributes: ['id', 'name', 'color', 'icon']
      }
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
  
  return successResponse(res, {
    documents: documents.map(document => document.getPublicData()),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit))
    }
  }, 'Documents retrieved');
}));

// Get specific document
router.get('/:id', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  
  const document = await Document.findOne({
    where: { id, company_id: companyId },
    include: [
      {
        model: DocumentCategory,
        as: 'category',
        attributes: ['id', 'name', 'color', 'icon']
      }
    ]
  });
  
  if (!document) {
    return errorResponse(res, 'Document not found', 404);
  }
  
  // Log document access
  await DocumentActivity.create({
    company_id: companyId,
    document_id: id,
    user_id: req.user.id,
    activity_type: 'viewed',
    description: 'Document viewed',
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  });
  
  return successResponse(res, { document: document.getPublicData() }, 'Document retrieved');
}));

// Upload new document
router.post('/', upload.single('file'), documentValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  if (!req.file) {
    return errorResponse(res, 'File is required', 400);
  }
  
  const { companyId } = req;
  const payload = req.body;
  
  const document = await Document.create({
    company_id: companyId,
    category_id: payload.category_id,
    title: payload.title,
    description: payload.description,
    file_name: req.file.filename,
    original_file_name: req.file.originalname,
    file_path: req.file.path,
    file_size: req.file.size,
    mime_type: req.file.mimetype,
    file_extension: path.extname(req.file.originalname),
    version: 1,
    is_current_version: true,
    parent_document_id: payload.parent_document_id,
    document_type: payload.document_type,
    status: payload.status || 'active',
    tags: payload.tags ? JSON.parse(payload.tags) : [],
    metadata: payload.metadata ? JSON.parse(payload.metadata) : {},
    access_level: payload.access_level,
    expiry_date: payload.expiry_date,
    reminder_date: payload.reminder_date,
    uploaded_by: req.user.id,
    notes: payload.notes
  });
  
  // Log document creation
  await DocumentActivity.create({
    company_id: companyId,
    document_id: document.id,
    user_id: req.user.id,
    activity_type: 'created',
    description: 'Document uploaded',
    metadata: {
      file_size: req.file.size,
      mime_type: req.file.mimetype
    },
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  });
  
  return successResponse(res, { document: document.getPublicData() }, 'Document uploaded successfully', 201);
}));

// Update document metadata
router.put('/:id', documentValidation, requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  
  const { companyId } = req;
  const { id } = req.params;
  const payload = req.body;
  
  const document = await Document.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!document) {
    return errorResponse(res, 'Document not found', 404);
  }
  
  await document.update({
    category_id: payload.category_id,
    title: payload.title,
    description: payload.description,
    document_type: payload.document_type,
    status: payload.status || document.status,
    tags: payload.tags || document.tags,
    metadata: payload.metadata || document.metadata,
    access_level: payload.access_level,
    expiry_date: payload.expiry_date,
    reminder_date: payload.reminder_date,
    notes: payload.notes
  });
  
  // Log document update
  await DocumentActivity.create({
    company_id: companyId,
    document_id: id,
    user_id: req.user.id,
    activity_type: 'updated',
    description: 'Document metadata updated',
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  });
  
  return successResponse(res, { document: document.getPublicData() }, 'Document updated');
}));

// Download document
router.get('/:id/download', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  
  const document = await Document.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!document) {
    return errorResponse(res, 'Document not found', 404);
  }
  
  // Check if file exists
  if (!fs.existsSync(document.file_path)) {
    return errorResponse(res, 'File not found on server', 404);
  }
  
  // Log download activity
  await DocumentActivity.create({
    company_id: companyId,
    document_id: id,
    user_id: req.user.id,
    activity_type: 'downloaded',
    description: 'Document downloaded',
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  });
  
  // Update download count
  await document.update({
    download_count: document.download_count + 1,
    last_accessed_at: new Date()
  });
  
  // Set appropriate headers and send file
  res.setHeader('Content-Type', document.mime_type);
  res.setHeader('Content-Disposition', `attachment; filename="${document.original_file_name}"`);
  res.setHeader('Content-Length', document.file_size);
  
  const fileStream = fs.createReadStream(document.file_path);
  fileStream.pipe(res);
}));

// Delete document
router.delete('/:id', requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  
  const document = await Document.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!document) {
    return errorResponse(res, 'Document not found', 404);
  }
  
  // Delete physical file
  if (fs.existsSync(document.file_path)) {
    fs.unlinkSync(document.file_path);
  }
  
  // Log deletion activity
  await DocumentActivity.create({
    company_id: companyId,
    document_id: id,
    user_id: req.user.id,
    activity_type: 'deleted',
    description: 'Document deleted',
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  });
  
  // Soft delete the document
  await document.update({ status: 'deleted' });
  
  return successResponse(res, { document: document.getPublicData() }, 'Document deleted');
}));

// Get document access permissions
router.get('/:id/access', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  
  const document = await Document.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!document) {
    return errorResponse(res, 'Document not found', 404);
  }
  
  const access = await DocumentAccess.findAll({
    where: { document_id: id },
    order: [['granted_at', 'DESC']]
  });
  
  return successResponse(res, {
    access: access.map(access => access.getPublicData())
  }, 'Document access permissions retrieved');
}));

// Grant document access
router.post('/:id/access', requireCompanyAccess, requireRole(['admin', 'owner', 'manager']), asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  const { user_id, role_id, access_type, expires_at } = req.body;
  
  if (!user_id && !role_id) {
    return errorResponse(res, 'Either user_id or role_id is required', 400);
  }
  
  if (!['read', 'write', 'admin'].includes(access_type)) {
    return errorResponse(res, 'Invalid access type', 400);
  }
  
  const document = await Document.findOne({
    where: { id, company_id: companyId }
  });
  
  if (!document) {
    return errorResponse(res, 'Document not found', 404);
  }
  
  const access = await DocumentAccess.create({
    company_id: companyId,
    document_id: id,
    user_id: user_id,
    role_id: role_id,
    access_type: access_type,
    granted_by: req.user.id,
    expires_at: expires_at,
    is_active: true
  });
  
  return successResponse(res, { access: access.getPublicData() }, 'Document access granted', 201);
}));

// Get document activities
router.get('/:id/activities', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { id } = req.params;
  const { activity_type, page = 1, limit = 50 } = req.query;
  
  const whereClause = { 
    company_id: companyId,
    document_id: id
  };
  if (activity_type) whereClause.activity_type = activity_type;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { count, rows: activities } = await DocumentActivity.findAndCountAll({
    where: whereClause,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
  
  return successResponse(res, {
    activities: activities.map(activity => activity.getPublicData()),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit))
    }
  }, 'Document activities retrieved');
}));

// Get documents by category
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
  
  const { count, rows: documents } = await Document.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: DocumentCategory,
        as: 'category',
        attributes: ['id', 'name', 'color', 'icon']
      }
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
  
  return successResponse(res, {
    documents: documents.map(document => document.getPublicData()),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit))
    }
  }, 'Documents by category retrieved');
}));

// Get document statistics
router.get('/statistics/overview', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  
  const stats = await Document.getStatistics(companyId);
  
  return successResponse(res, stats, 'Document statistics retrieved');
}));

// Search documents
router.get('/search', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { companyId } = req;
  const { q, category_id, document_type, tags, page = 1, limit = 50 } = req.query;
  
  if (!q) {
    return errorResponse(res, 'Search query is required', 400);
  }
  
  const whereClause = { 
    company_id: companyId,
    status: 'active'
  };
  
  if (category_id) whereClause.category_id = category_id;
  if (document_type) whereClause.document_type = document_type;
  
  // Add text search conditions
  whereClause[Op.or] = [
    { title: { [Op.iLike]: `%${q}%` } },
    { description: { [Op.iLike]: `%${q}%` } },
    { original_file_name: { [Op.iLike]: `%${q}%` } }
  ];
  
  if (tags) {
    const tagArray = tags.split(',');
    whereClause.tags = { [Op.contains]: tagArray };
  }
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { count, rows: documents } = await Document.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: DocumentCategory,
        as: 'category',
        attributes: ['id', 'name', 'color', 'icon']
      }
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });
  
  return successResponse(res, {
    documents: documents.map(document => document.getPublicData()),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit))
    }
  }, 'Document search results');
}));

export default router;
