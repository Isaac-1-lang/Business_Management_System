/**
 * AUTHENTICATION MIDDLEWARE - JWT Token Verification
 * 
 * This middleware handles:
 * - JWT token verification
 * - User authentication
 * - Role-based access control
 * - Company access validation
 * 
 * FEATURES:
 * - JWT token extraction from headers
 * - Token validation and expiration check
 * - User role verification
 * - Company access control
 * - Error handling for unauthorized access
 */

import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { RedisService } from '../database/redis.js';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for user
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Generate refresh token for user
 * @param {Object} payload - Token payload
 * @returns {string} Refresh token
 */
export function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' 
  });
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Main authentication middleware
 * Verifies JWT token and adds user info to request
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Check if token is blacklisted (logout)
    const isBlacklisted = await RedisService.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been invalidated',
        code: 'TOKEN_BLACKLISTED'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        code: 'TOKEN_INVALID'
      });
    }

    // Get user from database
    const user = await User.findByPk(decoded.userId, {
      include: [
        {
          model: Company,
          as: 'companies',
          through: { attributes: ['role'] }
        }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated',
        code: 'USER_DEACTIVATED'
      });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companies: user.companies,
      permissions: user.permissions
    };

    // Add token info
    req.token = {
      token,
      decoded
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Role-based access control middleware
 * @param {string[]} allowedRoles - Array of allowed roles
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

/**
 * Company access control middleware
 * Verifies user has access to the specified company
 */
export const requireCompanyAccess = async (req, res, next) => {
  try {
    const companyId = req.params.companyId || req.body.companyId || req.query.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID required',
        code: 'COMPANY_ID_REQUIRED'
      });
    }

    // Check if user has access to this company
    const hasAccess = req.user.companies.some(company => 
      company.id === companyId || company.id === parseInt(companyId)
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this company',
        code: 'COMPANY_ACCESS_DENIED'
      });
    }

    // Add company info to request
    req.companyId = companyId;
    next();
  } catch (error) {
    console.error('Company access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Company access verification failed',
      code: 'COMPANY_ACCESS_ERROR'
    });
  }
};

/**
 * Permission-based access control middleware
 * @param {string[]} requiredPermissions - Array of required permissions
 */
export const requirePermissions = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!req.user.permissions) {
      return res.status(403).json({
        success: false,
        message: 'No permissions defined',
        code: 'NO_PERMISSIONS'
      });
    }

    const hasAllPermissions = requiredPermissions.every(permission =>
      req.user.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Adds user info if token is provided, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user info
    }

    const token = authHeader.substring(7);
    
    // Check if token is blacklisted
    const isBlacklisted = await RedisService.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return next(); // Continue without user info
    }

    // Try to verify token
    try {
      const decoded = verifyToken(token);
      const user = await User.findByPk(decoded.userId, {
        include: [
          {
            model: Company,
            as: 'companies',
            through: { attributes: ['role'] }
          }
        ]
      });

      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          companies: user.companies,
          permissions: user.permissions
        };
      }
    } catch (error) {
      // Token is invalid, continue without user info
    }

    next();
  } catch (error) {
    // Continue without user info on error
    next();
  }
};

/**
 * Logout function - blacklist token
 * @param {string} token - JWT token to blacklist
 */
export async function logout(token) {
  try {
    const decoded = verifyToken(token);
    const exp = decoded.exp;
    const ttl = exp - Math.floor(Date.now() / 1000);
    
    if (ttl > 0) {
      await RedisService.set(`blacklist:${token}`, true, ttl);
    }
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}
