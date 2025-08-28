/**
 * SOCKET.IO SERVER - Real-time Communication
 * 
 * Handles real-time features:
 * - Live notifications
 * - Dashboard updates
 * - Chat functionality
 * - Real-time data synchronization
 */

import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Setup Socket.io with authentication and business logic
 */
export function setupSocketIO(io) {
  console.log('Setting up Socket.io server...');
  
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }
      
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from database
      const user = await User.findByPk(decoded.userId, {
        include: [{
          model: Company,
          as: 'companies',
          through: { attributes: ['role'] }
        }]
      });
      
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }
      
      // Attach user info to socket
      socket.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companies: user.companies
      };
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });
  
  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.email} (${socket.user.id})`);
    
    // Join user to their company rooms
    socket.user.companies.forEach(company => {
      socket.join(`company:${company.id}`);
      console.log(`User ${socket.user.email} joined company room: ${company.id}`);
    });
    
    // Join user to their personal room
    socket.join(`user:${socket.user.id}`);
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.email} (${socket.user.id})`);
    });
    
    // Handle join room
    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`User ${socket.user.email} joined room: ${room}`);
    });
    
    // Handle leave room
    socket.on('leave-room', (room) => {
      socket.leave(room);
      console.log(`User ${socket.user.email} left room: ${room}`);
    });
    
    // Handle private message
    socket.on('private-message', (data) => {
      const { recipientId, message } = data;
      
      // Emit to recipient's personal room
      io.to(`user:${recipientId}`).emit('private-message', {
        senderId: socket.user.id,
        senderName: `${socket.user.firstName} ${socket.user.lastName}`,
        message,
        timestamp: new Date().toISOString()
      });
      
      console.log(`Private message from ${socket.user.email} to user ${recipientId}`);
    });
    
    // Handle company message
    socket.on('company-message', (data) => {
      const { companyId, message, type = 'general' } = data;
      
      // Check if user has access to this company
      const hasAccess = socket.user.companies.some(company => company.id === companyId);
      
      if (!hasAccess) {
        socket.emit('error', { message: 'Access denied to this company' });
        return;
      }
      
      // Emit to company room
      io.to(`company:${companyId}`).emit('company-message', {
        senderId: socket.user.id,
        senderName: `${socket.user.firstName} ${socket.user.lastName}`,
        companyId,
        message,
        type,
        timestamp: new Date().toISOString()
      });
      
      console.log(`Company message from ${socket.user.email} in company ${companyId}`);
    });
    
    // Handle typing indicator
    socket.on('typing', (data) => {
      const { room, isTyping } = data;
      
      socket.to(room).emit('typing', {
        userId: socket.user.id,
        userName: `${socket.user.firstName} ${socket.user.lastName}`,
        isTyping,
        timestamp: new Date().toISOString()
      });
    });
    
    // Handle read receipts
    socket.on('message-read', (data) => {
      const { messageId, room } = data;
      
      socket.to(room).emit('message-read', {
        messageId,
        readBy: socket.user.id,
        readBy: `${socket.user.firstName} ${socket.user.lastName}`,
        timestamp: new Date().toISOString()
      });
    });
  });
  
  // Global error handler
  io.on('error', (error) => {
    console.error('Socket.io error:', error);
  });
  
  console.log('Socket.io server setup completed');
}

/**
 * Send notification to user
 */
export function sendNotificationToUser(userId, notification) {
  const io = global.io; // Access io instance globally
  
  if (io) {
    io.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Notification sent to user: ${userId}`);
  }
}

/**
 * Send notification to company
 */
export function sendNotificationToCompany(companyId, notification) {
  const io = global.io; // Access io instance globally
  
  if (io) {
    io.to(`company:${companyId}`).emit('company-notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Company notification sent to company: ${companyId}`);
  }
}

/**
 * Send real-time update to user
 */
export function sendUpdateToUser(userId, update) {
  const io = global.io; // Access io instance globally
  
  if (io) {
    io.to(`user:${userId}`).emit('update', {
      ...update,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Update sent to user: ${userId}`);
  }
}

/**
 * Send real-time update to company
 */
export function sendUpdateToCompany(companyId, update) {
  const io = global.io; // Access io instance globally
  
  if (io) {
    io.to(`company:${companyId}`).emit('company-update', {
      ...update,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Company update sent to company: ${companyId}`);
  }
}

/**
 * Broadcast to all connected users
 */
export function broadcastToAll(event, data) {
  const io = global.io; // Access io instance globally
  
  if (io) {
    io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Broadcast sent to all users: ${event}`);
  }
}

/**
 * Get connected users count
 */
export function getConnectedUsersCount() {
  const io = global.io; // Access io instance globally
  
  if (io) {
    return io.engine.clientsCount;
  }
  
  return 0;
}

/**
 * Get connected users in a room
 */
export function getConnectedUsersInRoom(room) {
  const io = global.io; // Access io instance globally
  
  if (io) {
    const roomSockets = io.sockets.adapter.rooms.get(room);
    return roomSockets ? roomSockets.size : 0;
  }
  
  return 0;
}
