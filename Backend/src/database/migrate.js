/**
 * DATABASE MIGRATION RUNNER
 * 
 * This script runs database migrations to set up the database schema.
 * It uses Sequelize to handle migrations automatically.
 */

import dotenv from 'dotenv';
import { connectDatabase } from './connection.js';

// Load environment variables
dotenv.config();

async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...');
    
    // Connect to database
    const sequelize = await connectDatabase();
    
    // Run migrations
    await sequelize.sync({ alter: true });
    
    console.log('✅ Database migrations completed successfully!');
    
    // Close connection
    await sequelize.close();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export default runMigrations;
