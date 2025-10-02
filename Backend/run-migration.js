/**
 * SIMPLE MIGRATION RUNNER
 * 
 * This script runs the database migration to create all tables
 */

import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { up } from './src/database/migrations/create_all_tables.js';

// Load environment variables
dotenv.config();

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'postgres',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

async function runMigration() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');
    
    // Run the migration
    await up(sequelize.getQueryInterface(), Sequelize);
    
    console.log('✅ Database migration completed successfully!');
    
    // Close connection
    await sequelize.close();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Full error:', error.message);
    process.exit(1);
  }
}

// Run migration
runMigration();

