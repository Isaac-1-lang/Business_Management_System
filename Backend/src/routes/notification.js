/**
 * NOTIFICATION ROUTES - Notification Management
 * 
 * Handles notifications, alerts, and messaging
 */

import express from 'express';
import { successResponse, errorResponse, asyncHandler } from '../middleware/errorHandler.js';
import { requireCompanyAccess } from '../middleware/auth.js';

const router = express.Router();

// Empty notifications array - will be populated from database in production
const notifications = [];

/**
 * GET /notifications
 * Get all notifications for the user
 */
router.get('/', asyncHandler(async (req, res) => {
  const { user } = req;
  const { isRead, type, priority, page = 1, limit = 10 } = req.query;
  
  let filteredNotifications = notifications.filter(n => n.userId === user.id);
  
  if (isRead !== undefined) {
    filteredNotifications = filteredNotifications.filter(n => n.isRead === (isRead === 'true'));
  }
  
  if (type) {
    filteredNotifications = filteredNotifications.filter(n => n.type === type);
  }
  
  if (priority) {
    filteredNotifications = filteredNotifications.filter(n => n.priority === priority);
  }
  
  // Sort by creation date (newest first)
  filteredNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Pagination
  const offset = (page - 1) * limit;
  const paginatedNotifications = filteredNotifications.slice(offset, offset + parseInt(limit));
  
  return successResponse(res, {
    notifications: paginatedNotifications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredNotifications.length,
      pages: Math.ceil(filteredNotifications.length / limit)
    }
  }, 'Notifications retrieved successfully');
}));

/**
 * GET /notifications/unread
 * Get unread notifications count
 */
router.get('/unread', asyncHandler(async (req, res) => {
  const { user } = req;
  
  const unreadCount = notifications.filter(n => n.userId === user.id && !n.isRead).length;
  
  return successResponse(res, { unreadCount }, 'Unread notifications count retrieved successfully');
}));

/**
 * PUT /notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  
  const notificationIndex = notifications.findIndex(n => n.id === id && n.userId === user.id);
  
  if (notificationIndex === -1) {
    return errorResponse(res, 'Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
  }
  
  notifications[notificationIndex].isRead = true;
  
  return successResponse(res, { notification: notifications[notificationIndex] }, 'Notification marked as read');
}));

/**
 * PUT /notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', asyncHandler(async (req, res) => {
  const { user } = req;
  
  const userNotifications = notifications.filter(n => n.userId === user.id && !n.isRead);
  
  userNotifications.forEach(notification => {
    notification.isRead = true;
  });
  
  return successResponse(res, { updatedCount: userNotifications.length }, 'All notifications marked as read');
}));

/**
 * DELETE /notifications/:id
 * Delete notification
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  
  const notificationIndex = notifications.findIndex(n => n.id === id && n.userId === user.id);
  
  if (notificationIndex === -1) {
    return errorResponse(res, 'Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
  }
  
  notifications.splice(notificationIndex, 1);
  
  return successResponse(res, null, 'Notification deleted successfully');
}));

/**
 * POST /notifications/test
 * Create a test notification (for testing purposes)
 */
router.post('/test', requireCompanyAccess, asyncHandler(async (req, res) => {
  const { user } = req;
  const { title, message, type = 'system_update', priority = 'medium' } = req.body;
  
  if (!title || !message) {
    return errorResponse(res, 'Title and message are required', 400, 'MISSING_REQUIRED_FIELDS');
  }
  
  const newNotification = {
    id: (notifications.length + 1).toString(),
    userId: user.id,
    companyId: req.companyId,
    type,
    title,
    message,
    priority,
    isRead: false,
    createdAt: new Date().toISOString()
  };
  
  notifications.push(newNotification);
  
  return successResponse(res, { notification: newNotification }, 'Test notification created successfully', 201);
}));

export default router;
