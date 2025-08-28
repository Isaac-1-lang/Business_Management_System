/**
 * DATABASE SEEDER - Hardcoded Test Data
 * 
 * This file creates initial test data for development:
 * - Test companies
 * - Test users with different roles
 * - Sample data for all modules
 */

import { connectDatabase } from './connection.js';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';

const testCompanies = [
  {
    name: 'Tech Solutions Rwanda Ltd',
    tradingName: 'TechSol RW',
    rdbRegistrationNumber: 'RDB123456789',
    businessType: 'Ltd',
    tin: '123456789',
    vatNumber: 'VAT123456789',
    taxRegime: 'Standard',
    currency: 'RWF',
    address: 'KN 4 Ave, Kigali',
    city: 'Kigali',
    country: 'Rwanda',
    phone: '+250788123456',
    email: 'info@techsol.rw',
    status: 'active',
    complianceStatus: 'compliant',
    annualTurnover: 50000000,
    isVATRegistered: true
  }
];

const testUsers = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@test.com',
    password: 'Admin123!',
    phone: '+250788111111',
    role: 'admin',
    isActive: true,
    isEmailVerified: true
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    password: 'John123!',
    phone: '+250788222222',
    role: 'owner',
    isActive: true,
    isEmailVerified: true
  }
];

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    const sequelize = await connectDatabase();
    
    // Create companies
    const companies = [];
    for (const companyData of testCompanies) {
      const company = await Company.create(companyData);
      companies.push(company);
      console.log(`✅ Created company: ${company.name}`);
    }
    
    // Create users
    const users = [];
    for (const userData of testUsers) {
      const user = await User.create(userData);
      users.push(user);
      console.log(`✅ Created user: ${user.email}`);
    }
    
    // Associate users with companies
    await users[1].addCompany(companies[0], { through: { role: 'owner' } });
    
    console.log('✅ Database seeding completed!');
    console.log('🔑 Test Login: admin@test.com / Admin123!');
    
    return { companies, users };
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
