/**
 * Create Admin User Script
 * 
 * This script creates an admin user for testing the user management system.
 * Run with: node create-admin-user.js
 */

import bcrypt from 'bcryptjs';
import { User } from './src/models/index.js';
import sequelize from './src/database/connection.js';

async function createAdminUser() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', {
        id: existingAdmin.id,
        email: existingAdmin.email,
        firstName: existingAdmin.firstName,
        lastName: existingAdmin.lastName,
        role: existingAdmin.role
      });
      
      // Update to ensure admin is active
      await existingAdmin.update({ isActive: true });
      console.log('Admin user activated');
      
      process.exit(0);
    }

    // Create admin user
    const adminData = {
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@officenexus.com',
      password: 'admin123456', // This will be hashed automatically
      role: 'admin',
      permissions: ['all'],
      isActive: true,
      isEmailVerified: true,
      country: 'Rwanda',
      language: 'en',
      timezone: 'Africa/Kigali',
      currency: 'RWF'
    };

    const adminUser = await User.create(adminData);
    
    console.log('✅ Admin user created successfully!');
    console.log('Login credentials:');
    console.log('Email: admin@officenexus.com');
    console.log('Password: admin123456');
    console.log('');
    console.log('User details:', {
      id: adminUser.id,
      email: adminUser.email,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: adminUser.role,
      isActive: adminUser.isActive
    });

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log('Admin user might already exist with this email.');
    }
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Also create some test users with different roles
async function createTestUsers() {
  try {
    await sequelize.authenticate();
    
    const testUsers = [
      {
        firstName: 'John',
        lastName: 'Manager',
        email: 'manager@test.com',
        password: 'password123',
        role: 'manager',
        permissions: ['employee_manage', 'reports_view', 'finance_view'],
        department: 'Management',
        isActive: true,
        isEmailVerified: true
      },
      {
        firstName: 'Sarah',
        lastName: 'HR',
        email: 'hr@test.com',
        password: 'password123',
        role: 'hr',
        permissions: ['employee_manage', 'payroll_manage', 'compliance_view'],
        department: 'Human Resources',
        isActive: true,
        isEmailVerified: true
      },
      {
        firstName: 'Mike',
        lastName: 'Accountant',
        email: 'accountant@test.com',
        password: 'password123',
        role: 'accountant',
        permissions: ['finance_manage', 'reports_view', 'tax_manage'],
        department: 'Accounting',
        isActive: true,
        isEmailVerified: true
      },
      {
        firstName: 'Jane',
        lastName: 'Employee',
        email: 'employee@test.com',
        password: 'password123',
        role: 'employee',
        permissions: ['profile_view', 'documents_view'],
        department: 'Operations',
        isActive: true,
        isEmailVerified: true
      }
    ];

    for (const userData of testUsers) {
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Created test user: ${userData.email} (${userData.role})`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

  } catch (error) {
    console.error('Error creating test users:', error);
  }
}

// Run the functions
async function main() {
  console.log('🚀 Creating admin user and test users...\n');
  
  await createAdminUser();
  await createTestUsers();
  
  console.log('\n✅ Setup complete!');
  console.log('\nYou can now login with any of these accounts:');
  console.log('- admin@officenexus.com / admin123456 (Admin)');
  console.log('- manager@test.com / password123 (Manager)');
  console.log('- hr@test.com / password123 (HR)');
  console.log('- accountant@test.com / password123 (Accountant)');
  console.log('- employee@test.com / password123 (Employee)');
}

main();
