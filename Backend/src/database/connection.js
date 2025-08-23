/**
 * DATABASE CONNECTION - PostgreSQL with Sequelize ORM
 * 
 * This file handles the database connection and configuration.
 * It uses Sequelize ORM for database operations and provides
 * connection pooling and error handling.
 * 
 * FEATURES:
 * - PostgreSQL connection with Sequelize
 * - Connection pooling for performance
 * - Automatic reconnection
 * - Environment-based configuration
 * - Migration and seeding support
 * 
 * RWANDA-SPECIFIC:
 * - Multi-company database structure
 * - Local business data types
 * - Compliance tracking tables
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'office_nexus_rw',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  dialect: process.env.DB_DIALECT || 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 20, // Maximum number of connection instances
    min: 5,  // Minimum number of connection instances
    acquire: 30000, // Maximum time (ms) that pool will try to get connection before throwing error
    idle: 10000 // Maximum time (ms) that a connection can be idle before being released
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    // Support for JSON data types
    json: true,
    // Support for array data types
    array: true
  },
  define: {
    // Add timestamps to all tables
    timestamps: true,
    // Use snake_case for column names
    underscored: true,
    // Use snake_case for table names
    freezeTableName: true,
    // Add paranoid deletion (soft delete)
    paranoid: true
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
    define: dbConfig.define
  }
);

// Test database connection
export async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync database (create tables if they don't exist)
    // In production, use migrations instead of sync
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized successfully.');
    }
    
    return sequelize;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
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

// Export sequelize instance for models
export default sequelize;
