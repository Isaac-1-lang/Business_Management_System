/**
 * AUTHENTICATION ROUTES - User Authentication & Authorization
 * 
 * This module handles:
 * - User registration
 * - User login/logout
 * - Password reset
 * - Email verification
 * - Token refresh
 * - Account management
 * 
 * FEATURES:
 * - JWT-based authentication
 * - Password hashing with bcrypt
 * - Email verification system
 * - Password reset functionality
 * - Account security features
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { generateToken, generateRefreshToken, verifyToken, logout } from '../middleware/auth.js';
import { successResponse, errorResponse, asyncHandler } from '../middleware/errorHandler.js';
import { RedisService } from '../database/redis.js';

const router = express.Router();

// ==================== VALIDATION RULES ====================

const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('phone')
    .optional()
    .matches(/^(\+250|0)?7[2389][0-9]{7}$/)
    .withMessage('Please provide a valid Rwanda phone number'),
  
  body('role')
    .optional()
    .isIn(['admin', 'owner', 'manager', 'accountant', 'hr', 'employee', 'viewer'])
    .withMessage('Invalid role specified'),
  
  body('companyId')
    .optional()
    .isUUID()
    .withMessage('Invalid company ID format')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const passwordResetValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

const newPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

// ==================== REGISTRATION ====================

/**
 * POST /auth/register
 * Register a new user
 */
router.post('/register', registerValidation, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }

  const { firstName, lastName, email, password, phone, role, companyId } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return errorResponse(res, 'User with this email already exists', 409, 'USER_EXISTS');
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    phone,
    role: role || 'employee',
    permissions: getDefaultPermissions(role || 'employee'),
    createdBy: req.body.createdBy || null
  });

  // Associate with company if provided
  if (companyId) {
    const company = await Company.findByPk(companyId);
    if (company) {
      await user.addCompany(company, { through: { role: role || 'employee' } });
    }
  }

  // Generate tokens
  const accessToken = generateToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

  // Store refresh token in Redis
  await RedisService.set(`refresh_token:${user.id}`, refreshToken, 30 * 24 * 60 * 60); // 30 days

  // Send verification email (TODO: implement email service)
  // await sendVerificationEmail(user.email, user.emailVerificationToken);

  return successResponse(res, {
    user: user.getPublicProfile(),
    tokens: {
      accessToken,
      refreshToken
    }
  }, 'User registered successfully', 201);
}));

// ==================== LOGIN ====================

/**
 * POST /auth/login
 * Authenticate user and return tokens
 */
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }

  const { email, password } = req.body;

  // Find user by email
  const user = await User.findByEmail(email);
  if (!user) {
    return errorResponse(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Check if user is active
  if (!user.isActive) {
    return errorResponse(res, 'Account is deactivated', 401, 'ACCOUNT_DEACTIVATED');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return errorResponse(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Generate tokens
  const accessToken = generateToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

  // Store refresh token in Redis
  await RedisService.set(`refresh_token:${user.id}`, refreshToken, 30 * 24 * 60 * 60); // 30 days

  // Get user companies
  const userWithCompanies = await User.findByPk(user.id, {
    include: [{
      model: Company,
      as: 'companies',
      through: { attributes: ['role'] }
    }]
  });

  return successResponse(res, {
    user: userWithCompanies.getPublicProfile(),
    companies: userWithCompanies.companies,
    tokens: {
      accessToken,
      refreshToken
    }
  }, 'Login successful');
}));

// ==================== LOGOUT ====================

/**
 * POST /auth/logout
 * Logout user and invalidate tokens
 */
router.post('/logout', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    await logout(token);
  }

  return successResponse(res, null, 'Logout successful');
}));

// ==================== TOKEN REFRESH ====================

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return errorResponse(res, 'Refresh token is required', 400, 'REFRESH_TOKEN_REQUIRED');
  }

  try {
    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    
    // Check if refresh token exists in Redis
    const storedToken = await RedisService.get(`refresh_token:${decoded.userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      return errorResponse(res, 'Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Get user
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      return errorResponse(res, 'User not found or inactive', 401, 'USER_NOT_FOUND');
    }

    // Generate new tokens
    const newAccessToken = generateToken({ userId: user.id, email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // Update refresh token in Redis
    await RedisService.set(`refresh_token:${user.id}`, newRefreshToken, 30 * 24 * 60 * 60);

    return successResponse(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }, 'Token refreshed successfully');

  } catch (error) {
    return errorResponse(res, 'Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }
}));

// ==================== PASSWORD RESET ====================

/**
 * POST /auth/forgot-password
 * Send password reset email
 */
router.post('/forgot-password', passwordResetValidation, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }

  const { email } = req.body;

  // Find user by email
  const user = await User.findByEmail(email);
  if (!user) {
    // Don't reveal if user exists or not
    return successResponse(res, null, 'If an account with that email exists, a password reset link has been sent');
  }

  // Generate reset token
  const resetToken = uuidv4();
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Save reset token to user
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = resetExpires;
  await user.save();

  // Send reset email (TODO: implement email service)
  // await sendPasswordResetEmail(user.email, resetToken);

  return successResponse(res, null, 'If an account with that email exists, a password reset link has been sent');
}));

/**
 * POST /auth/reset-password
 * Reset password using reset token
 */
router.post('/reset-password', newPasswordValidation, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }

  const { token, password } = req.body;

  // Find user by reset token
  const user = await User.findOne({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { [sequelize.Op.gt]: new Date() }
    }
  });

  if (!user) {
    return errorResponse(res, 'Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');
  }

  // Update password
  user.password = password;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  // Invalidate all refresh tokens
  await RedisService.del(`refresh_token:${user.id}`);

  return successResponse(res, null, 'Password reset successfully');
}));

// ==================== EMAIL VERIFICATION ====================

/**
 * POST /auth/verify-email
 * Verify email using verification token
 */
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return errorResponse(res, 'Verification token is required', 400, 'VERIFICATION_TOKEN_REQUIRED');
  }

  // Find user by verification token
  const user = await User.findOne({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: { [sequelize.Op.gt]: new Date() }
    }
  });

  if (!user) {
    return errorResponse(res, 'Invalid or expired verification token', 400, 'INVALID_VERIFICATION_TOKEN');
  }

  // Verify email
  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();

  return successResponse(res, null, 'Email verified successfully');
}));

/**
 * POST /auth/resend-verification
 * Resend email verification
 */
router.post('/resend-verification', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return errorResponse(res, 'Email is required', 400, 'EMAIL_REQUIRED');
  }

  // Find user by email
  const user = await User.findByEmail(email);
  if (!user) {
    return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
  }

  if (user.isEmailVerified) {
    return errorResponse(res, 'Email is already verified', 400, 'EMAIL_ALREADY_VERIFIED');
  }

  // Generate new verification token
  const verificationToken = uuidv4();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Save verification token to user
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = verificationExpires;
  await user.save();

  // Send verification email (TODO: implement email service)
  // await sendVerificationEmail(user.email, verificationToken);

  return successResponse(res, null, 'Verification email sent successfully');
}));

// ==================== ACCOUNT MANAGEMENT ====================

/**
 * GET /auth/me
 * Get current user profile
 */
router.get('/me', asyncHandler(async (req, res) => {
  // This route should be protected by auth middleware
  // For now, we'll get user from query params (in real app, from JWT token)
  const { userId } = req.query;

  if (!userId) {
    return errorResponse(res, 'User ID is required', 400, 'USER_ID_REQUIRED');
  }

  const user = await User.findByPk(userId, {
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
  }, 'User profile retrieved successfully');
}));

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get default permissions for user role
 */
function getDefaultPermissions(role) {
  const permissions = {
    admin: [
      'user:read', 'user:write', 'user:delete',
      'company:read', 'company:write', 'company:delete',
      'employee:read', 'employee:write', 'employee:delete',
      'tax:read', 'tax:write', 'tax:delete',
      'accounting:read', 'accounting:write', 'accounting:delete',
      'reports:read', 'reports:write',
      'settings:read', 'settings:write'
    ],
    owner: [
      'user:read', 'user:write',
      'company:read', 'company:write',
      'employee:read', 'employee:write', 'employee:delete',
      'tax:read', 'tax:write',
      'accounting:read', 'accounting:write',
      'reports:read', 'reports:write',
      'settings:read', 'settings:write'
    ],
    manager: [
      'user:read',
      'company:read',
      'employee:read', 'employee:write',
      'tax:read', 'tax:write',
      'accounting:read', 'accounting:write',
      'reports:read', 'reports:write'
    ],
    accountant: [
      'company:read',
      'tax:read', 'tax:write',
      'accounting:read', 'accounting:write',
      'reports:read', 'reports:write'
    ],
    hr: [
      'company:read',
      'employee:read', 'employee:write',
      'reports:read'
    ],
    employee: [
      'company:read',
      'employee:read'
    ],
    viewer: [
      'company:read',
      'reports:read'
    ]
  };

  return permissions[role] || permissions.employee;
}

export default router;
