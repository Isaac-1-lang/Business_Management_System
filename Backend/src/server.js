/**
 * MAIN SERVER FILE - Intego Office Backend
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
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
import dividendRoutes from './routes/dividends.js';
import reportRoutes from './routes/reports.js';
import meetingRoutes from './routes/meetings.js';
import invoiceRoutes from './routes/invoices.js';
import assetRoutes from './routes/assets.js';
import ownershipRoutes from './routes/ownership.js';
import capitalRoutes from './routes/capital.js';
import currencyRoutes from './routes/currency.js';
import dividendsRoutes from './routes/dividends.js';
import payrollRoutes from './routes/payroll.js';
import directorsRoutes from './routes/directors.js';
import documentsRoutes from './routes/documents.js';

// Import model associations
import './models/associations.js';

// Load environment variables
dotenv.config();

// Load Swagger documentation synchronously at startup
let swaggerDocument;
try {
  const swaggerPath = join(__dirname, '..', 'swagger.yaml');
  const swaggerFile = readFileSync(swaggerPath, 'utf8');
  // We'll load js-yaml dynamically when needed
} catch (error) {
  console.warn('Could not find swagger.yaml:', error.message);
}

const app = express();
const server = createServer(app);
const sql = neon(process.env.DATABASE_URL);
const requestHandler = async (req,res)=> {
  const result = await sql`SELECT version()`;
  const { version } = result[0];
  res.writeHead(200,{'Content-Type':'text/html'})
  res.end(version);
}
// Socket.io CORS configuration - needs string origins only (no regex)
const socketOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
  "http://localhost:5174",
  "https://business-management-system-5c4g.vercel.app",
  "https://business-management-system-em23.vercel.app",
  "https://int-black.vercel.app"
];

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin
      if (!origin) return callback(null, true);
      
      // Check if origin matches any allowed origin or matches patterns
      const isAllowed = socketOrigins.includes(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin) ||
        /^https:\/\/.*\.onrender\.com$/.test(origin) ||
        /^https:\/\/.*\.render\.com$/.test(origin);
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
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
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
  "http://localhost:5174",
  "https://business-management-system-em23.vercel.app",
  "https://business-management-system-5c4g.vercel.app",
  "https://int-black.vercel.app", // Explicitly add the frontend domain
  /^https:\/\/.*\.vercel\.app$/, // Regex pattern for all Vercel apps
  /^https:\/\/.*\.onrender\.com$/, // Regex pattern for Render apps
  /^https:\/\/.*\.render\.com$/, // Regex pattern for Render apps
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman, curl, mobile apps)
    if (!origin) {
      console.log('✅ Allowing request with no origin (Postman/curl/mobile)');
      return callback(null, true);
    }

    // Check if origin is in the list
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === "string") {
        return allowed === origin;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      console.log(`✅ CORS allowed request from: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked request from: ${origin}`);
      console.log('Allowed origins:', allowedOrigins.map(o => typeof o === 'string' ? o : o.toString()));
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400, // 24 hours - cache preflight requests
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Rate limiting - more lenient in development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'development' ? 500 : 100, // Higher limit in development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/v1/health';
  },
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

// ==================== SWAGGER DOCUMENTATION ====================

// Setup Swagger UI route
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', async (req, res) => {
  try {
    if (!swaggerDocument) {
      const swaggerPath = join(__dirname, '..', 'swagger.yaml');
      const swaggerFile = readFileSync(swaggerPath, 'utf8');
      const yaml = await import('js-yaml');
      swaggerDocument = yaml.load(swaggerFile);
    }
    
    const html = swaggerUi.generateHTML(swaggerDocument, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: "Intego Office API Documentation"
    });
    res.send(html);
  } catch (error) {
    console.error('Error loading Swagger documentation:', error);
    res.status(500).json({
      success: false,
      message: 'Swagger documentation not available',
      error: error.message
    });
  }
});

// Redirect root to API docs for convenience
app.get('/', (req, res) => {
  res.redirect('/api-docs');
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
app.use(`${API_PREFIX}/dividends`, authMiddleware, dividendRoutes);
app.use(`${API_PREFIX}/reports`, authMiddleware, reportRoutes);
app.use(`${API_PREFIX}/meetings`, authMiddleware, meetingRoutes);
app.use(`${API_PREFIX}/invoices`, authMiddleware, invoiceRoutes);
app.use(`${API_PREFIX}/assets`, authMiddleware, assetRoutes);
app.use(`${API_PREFIX}/ownership`, authMiddleware, ownershipRoutes);
app.use(`${API_PREFIX}/capital`, authMiddleware, capitalRoutes);
app.use(`${API_PREFIX}/currency`, authMiddleware, currencyRoutes);
app.use(`${API_PREFIX}/dividends`, authMiddleware, dividendsRoutes);
app.use(`${API_PREFIX}/payroll`, authMiddleware, payrollRoutes);
app.use(`${API_PREFIX}/directors`, authMiddleware, directorsRoutes);
app.use(`${API_PREFIX}/documents`, authMiddleware, documentsRoutes);

// ==================== CATCH-ALL FOR INCORRECT API PATHS ====================
// Handle requests to /auth/* without /api/v1 prefix - provide helpful error
app.use('/auth', (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.path} not found. Please use ${API_PREFIX}${req.path} instead.`,
    error: 'ROUTE_NOT_FOUND',
    suggestion: `The correct endpoint is: ${API_PREFIX}${req.path}`,
    currentPath: req.path,
    correctPath: `${API_PREFIX}${req.path}`
  });
});

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
    console.log('Starting Intego Office Backend Server...');
    
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
