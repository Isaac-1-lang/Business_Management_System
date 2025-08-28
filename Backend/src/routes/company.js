/**
 * COMPANY ROUTES - Company Management
 * 
 * Handles company CRUD operations and management
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { Company } from '../models/Company.js';
import { User } from '../models/User.js';
import { successResponse, errorResponse, asyncHandler } from '../middleware/errorHandler.js';
import { requireRole, requireCompanyAccess } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const createCompanyValidation = [
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Company name must be between 2 and 200 characters'),
  body('businessType').isIn(['Ltd', 'SARL', 'Cooperative', 'Partnership', 'Sole Proprietorship', 'Branch', 'Other']).withMessage('Invalid business type'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().matches(/^(\+250|0)?7[2389][0-9]{7}$/).withMessage('Invalid Rwanda phone number')
];

/**
 * GET /companies
 * Get all companies for the authenticated user
 */
router.get('/', asyncHandler(async (req, res) => {
  const { user } = req;
  
  // Get companies associated with the user
  const userWithCompanies = await User.findByPk(user.id, {
    include: [{
      model: Company,
      as: 'companies',
      through: { attributes: ['role'] }
    }]
  });

  return successResponse(res, {
    companies: userWithCompanies.companies
  }, 'Companies retrieved successfully');
}));

/**
 * GET /companies/:id
 * Get specific company details
 */
router.get('/:id', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const company = await Company.findByPk(id, {
    include: [{
      model: User,
      as: 'users',
      through: { attributes: ['role'] },
      attributes: ['id', 'firstName', 'lastName', 'email', 'role']
    }]
  });

  if (!company) {
    return errorResponse(res, 'Company not found', 404, 'COMPANY_NOT_FOUND');
  }

  return successResponse(res, { company }, 'Company details retrieved successfully');
}));

/**
 * POST /companies
 * Create a new company
 */
router.post('/', createCompanyValidation, requireRole(['admin', 'owner']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }

  const companyData = {
    ...req.body,
    createdBy: req.user.id
  };

  const company = await Company.create(companyData);

  // Associate the current user with the company
  await req.user.addCompany(company, { through: { role: 'owner' } });

  return successResponse(res, { company }, 'Company created successfully', 201);
}));

/**
 * PUT /companies/:id
 * Update company details
 */
router.put('/:id', createCompanyValidation, requireCompanyAccess, requireRole(['admin', 'owner']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }

  const { id } = req.params;
  const updateData = {
    ...req.body,
    updatedBy: req.user.id
  };

  const company = await Company.findByPk(id);
  if (!company) {
    return errorResponse(res, 'Company not found', 404, 'COMPANY_NOT_FOUND');
  }

  await company.update(updateData);

  return successResponse(res, { company }, 'Company updated successfully');
}));

/**
 * DELETE /companies/:id
 * Delete a company (soft delete)
 */
router.delete('/:id', requireCompanyAccess, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const company = await Company.findByPk(id);
  if (!company) {
    return errorResponse(res, 'Company not found', 404, 'COMPANY_NOT_FOUND');
  }

  await company.destroy(); // Soft delete

  return successResponse(res, null, 'Company deleted successfully');
}));

/**
 * GET /companies/:id/users
 * Get all users associated with a company
 */
router.get('/:id/users', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const company = await Company.findByPk(id, {
    include: [{
      model: User,
      as: 'users',
      through: { attributes: ['role'] },
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive']
    }]
  });

  if (!company) {
    return errorResponse(res, 'Company not found', 404, 'COMPANY_NOT_FOUND');
  }

  return successResponse(res, { users: company.users }, 'Company users retrieved successfully');
}));

/**
 * POST /companies/:id/users
 * Add a user to a company
 */
router.post('/:id/users', requireCompanyAccess, requireRole(['admin', 'owner']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, role } = req.body;

  if (!userId || !role) {
    return errorResponse(res, 'User ID and role are required', 400, 'MISSING_REQUIRED_FIELDS');
  }

  const company = await Company.findByPk(id);
  const user = await User.findByPk(userId);

  if (!company) {
    return errorResponse(res, 'Company not found', 404, 'COMPANY_NOT_FOUND');
  }

  if (!user) {
    return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
  }

  // Check if user is already associated with the company
  const existingAssociation = await company.hasUser(user);
  if (existingAssociation) {
    return errorResponse(res, 'User is already associated with this company', 409, 'USER_ALREADY_ASSOCIATED');
  }

  await company.addUser(user, { through: { role } });

  return successResponse(res, null, 'User added to company successfully');
}));

/**
 * DELETE /companies/:id/users/:userId
 * Remove a user from a company
 */
router.delete('/:id/users/:userId', requireCompanyAccess, requireRole(['admin', 'owner']), asyncHandler(async (req, res) => {
  const { id, userId } = req.params;

  const company = await Company.findByPk(id);
  const user = await User.findByPk(userId);

  if (!company) {
    return errorResponse(res, 'Company not found', 404, 'COMPANY_NOT_FOUND');
  }

  if (!user) {
    return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
  }

  await company.removeUser(user);

  return successResponse(res, null, 'User removed from company successfully');
}));

export default router;
