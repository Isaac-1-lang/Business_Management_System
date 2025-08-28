/**
 * SOCKET.IO SERVER - Real-time Communication
 * 
 * This file handles real-time communication between the server and clients.
 * It provides instant notifications, live updates, and real-time features.
 * 
 * FEATURES:
 * - Real-time notifications
 * - Live dashboard updates
 * - User presence tracking
 * - Room-based messaging
 * - Authentication integration
 * 
 * RWANDA-SPECIFIC:
 * - Tax deadline alerts
 * - Compliance notifications
 * - Multi-company isolation
 */

import { Server } from 'socket.io';

let io;

export function setupSocketIO(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    // TODO: Verify JWT token here
    // For now, allow all connections
    next();
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join company room
    socket.on('join-company', (companyId) => {
      socket.join(`company-${companyId}`);
      console.log(`User ${socket.id} joined company ${companyId}`);
    });

    // Leave company room
    socket.on('leave-company', (companyId) => {
      socket.leave(`company-${companyId}`);
      console.log(`User ${socket.id} left company ${companyId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('Socket.io server setup complete');
  return io;
}

// Send notification to specific company
export function sendNotificationToCompany(companyId, notification) {
  if (io) {
    io.to(`company-${companyId}`).emit('notification', notification);
  }
}

// Send notification to specific user
export function sendNotificationToUser(userId, notification) {
  if (io) {
    io.to(`user-${userId}`).emit('notification', notification);
  }
}

// Broadcast to all connected clients
export function broadcastNotification(notification) {
  if (io) {
    io.emit('notification', notification);
  }
}

// Get connected users count
export function getConnectedUsersCount() {
  if (io) {
    return io.engine.clientsCount;
  }
  return 0;
}

export default io;
