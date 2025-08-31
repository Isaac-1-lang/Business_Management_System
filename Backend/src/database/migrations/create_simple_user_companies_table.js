/**
 * MIGRATION: Create simple user_companies table
 * 
 * This migration creates a basic user_companies junction table
 * without role information to get the system working immediately.
 * 
 * Later, we can add the role column and other features.
 */

import sequelize from '../connection.js';

export async function up() {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE ON UPDATE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, company_id)
      );
    `);

    // Create indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON user_companies(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_companies_company_id ON user_companies(company_id);
    `);

    console.log('✅ Simple user_companies table created successfully');
  } catch (error) {
    console.error('❌ Error creating user_companies table:', error);
    throw error;
  }
}

export async function down() {
  try {
    await sequelize.query(`
      DROP TABLE IF EXISTS user_companies CASCADE;
    `);
    
    console.log('✅ user_companies table dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping user_companies table:', error);
    throw error;
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'up') {
    up().then(() => process.exit(0)).catch(() => process.exit(1));
  } else if (command === 'down') {
    down().then(() => process.exit(0)).catch(() => process.exit(1));
  } else {
    console.log('Usage: node create_simple_user_companies_table.js [up|down]');
    process.exit(1);
  }
}
