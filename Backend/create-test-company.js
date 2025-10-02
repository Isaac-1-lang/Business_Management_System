/**
 * CREATE TEST COMPANY SCRIPT
 * 
 * This script creates a test company in the database for development purposes
 */

import dotenv from 'dotenv';
import { connectDatabase } from './src/database/connection.js';
import { Company } from './src/models/Company.js';

// Load environment variables
dotenv.config();

async function createTestCompany() {
  try {
    console.log('🔄 Creating test company...');
    
    // Connect to database
    await connectDatabase();
    
    // Create test company
    const testCompany = await Company.create({
      name: 'Test Company Ltd',
      tin: '1234567890',
      registration_number: 'REG123456',
      address: 'Kigali, Rwanda',
      phone: '+250788123456',
      email: 'test@company.rw',
      currency: 'RWF',
      fiscal_year_start: '01-01',
      tax_regime: 'standard',
      status: 'active'
    });
    
    console.log('✅ Test company created successfully!');
    console.log('Company ID:', testCompany.id);
    console.log('Company Name:', testCompany.name);
    
    // Close connection
    await Company.sequelize.close();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create test company:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestCompany();
}

export default createTestCompany;
