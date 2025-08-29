/**
 * DATABASE CONNECTION - PostgreSQL with Sequelize ORM (Updated)
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  dialect: process.env.DB_DIALECT || 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10, // Reduced from 20 for better resource management
    min: 2,  // Reduced from 5
    acquire: 90000, // Increased to 90 seconds
    idle: 30000, // Increased to 30 seconds
    evict: 1000 // Check for idle connections every 1 second
  },
  dialectOptions: (() => {
    const shouldUseSsl = String(process.env.DB_SSL || 'false').toLowerCase() === 'true';
    const rejectUnauthorized = String(process.env.DB_SSL_REJECT_UNAUTHORIZED || 'false').toLowerCase() === 'true'; // Changed default to false
    const base = { 
      connectTimeout: 120000, // Increased to 2 minutes
      requestTimeout: 120000,
      cancelTimeout: 5000
    };
    if (shouldUseSsl) {
      return {
        ...base,
        ssl: {
          require: true,
          rejectUnauthorized,
        },
      };
    }
    return base;
  })(),
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    paranoid: true
  },
  // Enhanced retry configuration
  retry: {
    max: 5, // Increased retry attempts
    timeout: 5000 // Increased timeout between retries
  }
};

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions,
    define: dbConfig.define,
    retry: dbConfig.retry
  }
);

// Enhanced connection function with better error handling
export async function connectDatabase() {
  let retryCount = 0;
  const maxRetries = 5;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`Attempting database connection... (attempt ${retryCount + 1}/${maxRetries})`);
      
      // Test authentication first
      await sequelize.authenticate();
      console.log('✅ Database connection established successfully.');
      console.log(`📍 Connected to: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
      
      // Sync database only in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Synchronizing database schema...');
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized successfully.');
      }
      
      return sequelize;
      
    } catch (error) {
      retryCount++;
      console.error(`❌ Database connection attempt ${retryCount} failed:`, error.message);
      
      // Log specific error details
      if (error.name === 'ConnectionError') {
        console.error('🔍 Connection Error Details:');
        console.error(`   - Host: ${dbConfig.host}`);
        console.error(`   - Port: ${dbConfig.port}`);
        console.error(`   - Database: ${dbConfig.database}`);
        console.error(`   - Username: ${dbConfig.username}`);
        console.error(`   - SSL Enabled: ${String(process.env.DB_SSL || 'false')}`);
      }
      
      if (error.name === 'ConnectionTimedOutError' || error.message.includes('timed out')) {
        console.error('⏰ Connection timed out. This could be due to:');
        console.error('   - Slow network connection');
        console.error('   - Database server overload');
        console.error('   - Incorrect host/port configuration');
        console.error('   - Firewall blocking the connection');
      }
      
      if (retryCount >= maxRetries) {
        console.error('💥 Maximum retry attempts reached. Please check:');
        console.error('1. Database server is running and accessible');
        console.error('2. Credentials in .env file are correct');
        console.error('3. Network connectivity to database host');
        console.error('4. SSL configuration if using cloud database');
        console.error('5. Firewall/security group settings');
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, retryCount) * 1000;
      console.log(`⏳ Waiting ${waitTime/1000} seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Close database connection
export async function closeDatabase() {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed successfully.');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
}

// Get database instance
export function getDatabase() {
  return sequelize;
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    await sequelize.authenticate();
    return { status: 'healthy', message: 'Database connection is working' };
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
}

// Export sequelize instance for models
export default sequelize;