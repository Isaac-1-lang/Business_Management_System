/**
 * USER ROUTES - User Management
 * 
 * Handles user CRUD operations and profile management
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { User, Company } from '../models/index.js';
import { successResponse, errorResponse, asyncHandler } from '../middleware/errorHandler.js';
import { requireRole, requirePermissions } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const updateUserValidation = [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('phone').optional().matches(/^(\+250|0)?7[2389][0-9]{7}$/).withMessage('Invalid Rwanda phone number'),
  body('role').optional().isIn(['admin', 'owner', 'manager', 'accountant', 'hr', 'employee', 'viewer']).withMessage('Invalid role')
];

/**
 * GET /users
 * Get all users (admin only)
 */
router.get('/', requireRole(['admin']), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, isActive } = req.query;
  
  const where = {};
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const offset = (page - 1) * limit;
  
  const { count, rows: users } = await User.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'isEmailVerified', 'lastLoginAt', 'createdAt'],
    order: [['createdAt', 'DESC']]
  });

  return successResponse(res, {
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  }, 'Users retrieved successfully');
}));

/**
 * GET /users/me
 * Get current user profile
 */
router.get('/me', asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [{
      model: Company,
      as: 'companies',
      through: { attributes: ['role'] }
    }]
  });

  return successResponse(res, {
    user: user.getPublicProfile(),
    companies: user.companies
  }, 'Profile retrieved successfully');
}));

/**
 * GET /users/:id
 * Get specific user details (admin or self)
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Users can only view their own profile unless they're admin
  if (req.user.role !== 'admin' && req.user.id !== id) {
    return errorResponse(res, 'Access denied', 403, 'ACCESS_DENIED');
  }

  const user = await User.findByPk(id, {
    include: [{
      model: Company,
      as: 'companies',
      through: { attributes: ['role'] }
    }]
  });

  if (!user) {
    return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
  }

  return successResponse(res, {
    user: user.getPublicProfile(),
    companies: user.companies
  }, 'User details retrieved successfully');
}));

/**
 * PUT /users/me
 * Update current user profile
 */
router.put('/me', updateUserValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }

  const user = await User.findByPk(req.user.id);
  if (!user) {
    return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
  }

  // Only allow updating certain fields for self
  const allowedFields = ['firstName', 'lastName', 'phone', 'address', 'city', 'country', 'language', 'timezone', 'currency', 'notificationPreferences'];
  const updateData = {};
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  await user.update(updateData);

  return successResponse(res, {
    user: user.getPublicProfile()
  }, 'Profile updated successfully');
}));

/**
 * PUT /users/:id
 * Update user details (admin only)
 */
router.put('/:id', updateUserValidation, requireRole(['admin']), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }

  const { id } = req.params;
  const user = await User.findByPk(id);

  if (!user) {
    return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
  }

  // Admin can update more fields
  const allowedFields = ['firstName', 'lastName', 'phone', 'role', 'isActive', 'permissions', 'address', 'city', 'country', 'language', 'timezone', 'currency'];
  const updateData = {};
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  updateData.updatedBy = req.user.id;

  await user.update(updateData);

  return successResponse(res, {
    user: user.getPublicProfile()
  }, 'User updated successfully');
}));

/**
 * DELETE /users/:id
 * Delete user (admin only)
 */
router.delete('/:id', requireRole(['admin']), asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (req.user.id === id) {
    return errorResponse(res, 'Cannot delete your own account', 400, 'CANNOT_DELETE_SELF');
  }

  const user = await User.findByPk(id);
  if (!user) {
    return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
  }

  await user.destroy(); // Soft delete

  return successResponse(res, null, 'User deleted successfully');
}));

/**
 * POST /users/:id/activate
 * Activate user account (admin only)
 */
router.post('/:id/activate', requireRole(['admin']), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);
  if (!user) {
    return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
  }

  await user.update({ isActive: true, updatedBy: req.user.id });

  return successResponse(res, null, 'User activated successfully');
}));

/**
 * POST /users/:id/deactivate
 * Deactivate user account (admin only)
 */
router.post('/:id/deactivate', requireRole(['admin']), asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent admin from deactivating themselves
  if (req.user.id === id) {
    return errorResponse(res, 'Cannot deactivate your own account', 400, 'CANNOT_DEACTIVATE_SELF');
  }

  const user = await User.findByPk(id);
  if (!user) {
    return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
  }

  await user.update({ isActive: false, updatedBy: req.user.id });

  return successResponse(res, null, 'User deactivated successfully');
}));

/**
 * GET /users/:id/companies
 * Get companies associated with a user
 */
router.get('/:id/companies', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Users can only view their own companies unless they're admin
  if (req.user.role !== 'admin' && req.user.id !== id) {
    return errorResponse(res, 'Access denied', 403, 'ACCESS_DENIED');
  }

  const user = await User.findByPk(id, {
    include: [{
      model: Company,
      as: 'companies',
      through: { attributes: ['role'] }
    }]
  });

  if (!user) {
    return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
  }

  return successResponse(res, {
    companies: user.companies
  }, 'User companies retrieved successfully');
}));

export default router;
