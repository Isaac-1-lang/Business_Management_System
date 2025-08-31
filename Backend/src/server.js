/**
 * MAIN SERVER FILE - Office Nexus Backend
 * 
 * This is the entry point for the backend API server.
 * It sets up Express, middleware, routes, and Socket.io for real-time features.
 * 
 * FEATURES:
 * - RESTful API endpoints
 * - Real-time notifications via Socket.io
 * - Authentication & authorization
 * - Rate limiting & security
 * - Database connections
 * - Background job processing
 * 
 * RWANDA-SPECIFIC:
 * - Tax calculation engine
 * - Compliance management
 * - Multi-company support
 * - Local business rules
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
// Import middleware and utilities
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import { connectDatabase } from './database/connection.js';
// Redis disabled for now
import { setupSocketIO } from './socket/socketServer.js';
// Bull queue disabled for now

// Import route modules
import authRoutes from './routes/auth.js';
import companyRoutes from './routes/company.js';
import userRoutes from './routes/user.js';
import employeeRoutes from './routes/employee.js';
import taxRoutes from './routes/tax.js';
import accountingRoutes from './routes/accounting.js';
import complianceRoutes from './routes/compliance.js';
import notificationRoutes from './routes/notification.js';
import reportRoutes from './routes/reports.js';

// Import model associations
import './models/associations.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const sql = neon(process.env.DATABASE_URL);
const requestHandler = async (req,res)=> {
  const result = await sql`SELECT version()`;
  const { version } = result[0];
  res.writeHead(200,{'Content-Type':'text/html'})
  res.end(version);
}
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:8080",
      "http://localhost:3000",
      "http://localhost:5174"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Make io globally available for socket functions
global.io = io;

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ==================== MIDDLEWARE SETUP ====================

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:8080",
      "http://localhost:3000",
      "http://localhost:5174",
      // Render.com domains
      /^https:\/\/.*\.onrender\.com$/,
      /^https:\/\/.*\.render\.com$/
    ];
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ==================== HEALTH CHECK ====================

// Simple health check endpoint (for load balancers and Render)
app.get('/health', (req, res) => {
  res.status(200).send('healthy\n');
});

// API health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      version: '1.0.0',
      uptime: process.uptime()
    }
  });
});

// ==================== API ROUTES ====================

// API version prefix
const API_PREFIX = '/api/v1';

// Public routes (no authentication required)
app.use(`${API_PREFIX}/auth`, authRoutes);

// Protected routes (authentication required)
app.use(`${API_PREFIX}/companies`, authMiddleware, companyRoutes);
app.use(`${API_PREFIX}/users`, authMiddleware, userRoutes);
app.use(`${API_PREFIX}/employees`, authMiddleware, employeeRoutes);
app.use(`${API_PREFIX}/tax`, authMiddleware, taxRoutes);
app.use(`${API_PREFIX}/accounting`, authMiddleware, accountingRoutes);
app.use(`${API_PREFIX}/compliance`, authMiddleware, complianceRoutes);
app.use(`${API_PREFIX}/notifications`, authMiddleware, notificationRoutes);
app.use(`${API_PREFIX}/reports`, authMiddleware, reportRoutes);

// ==================== SOCKET.IO SETUP ====================

// Setup Socket.io with authentication and business logic
setupSocketIO(io);

// ==================== ERROR HANDLING ====================

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use(errorHandler);

// ==================== SERVER STARTUP ====================

async function startServer() {
  try {
    console.log('Starting Office Nexus Backend Server...');
    
    // Connect to database
    await connectDatabase();
    console.log('Database connected successfully');
    
    // Redis and background queue disabled
    
    // Start the server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${NODE_ENV}`);
      console.log(`API Base URL: http://localhost:${PORT}${API_PREFIX}`);
      console.log(`Socket.io ready for real-time connections`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

export default app;
