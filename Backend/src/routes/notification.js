/**
 * NOTIFICATION ROUTES - Notification Management
 * 
 * Handles notifications, alerts, and messaging
 */

import express from 'express';
import { successResponse, errorResponse, asyncHandler } from '../middleware/errorHandler.js';
import { requireCompanyAccess } from '../middleware/auth.js';

const router = express.Router();

// Hardcoded notification data for testing
const notifications = [
  {
    id: '1',
    userId: '1',
    companyId: '1',
    type: 'tax_deadline',
    title: 'VAT Return Due',
    message: 'Your VAT return for January 2024 is due on February 15, 2024',
    priority: 'high',
    isRead: false,
    createdAt: '2024-02-01T10:00:00Z'
  },
  {
    id: '2',
    userId: '1',
    companyId: '1',
    type: 'compliance_alert',
    title: 'RSSB Contribution Completed',
    message: 'RSSB contribution for January 2024 has been successfully submitted',
    priority: 'medium',
    isRead: true,
    createdAt: '2024-02-10T14:30:00Z'
  },
  {
    id: '3',
    userId: '1',
    companyId: '1',
    type: 'system_update',
    title: 'System Maintenance',
    message: 'Scheduled system maintenance will occur on February 20, 2024 from 2:00 AM to 4:00 AM',
    priority: 'low',
    isRead: false,
    createdAt: '2024-02-12T09:15:00Z'
  }
];

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
