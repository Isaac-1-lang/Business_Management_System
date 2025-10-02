/**
 * Development Authentication Setup
 * 
 * This script sets up localStorage with test data to enable
 * development mode authentication bypass.
 */

console.log('🔧 Setting up development authentication...');

// Set up test company ID
localStorage.setItem('selectedCompanyId', 'test-company-dev-001');

// Set up mock user data
const mockUser = {
  id: 'user-dev-001',
  email: 'dev@test.com',
  name: 'Development User',
  role: 'admin'
};

localStorage.setItem('currentUser', JSON.stringify(mockUser));

// Set up mock companies
const mockCompanies = [
  {
    id: 'test-company-dev-001',
    name: 'Test Company Ltd',
    tin: '123456789',
    email: 'test@company.com',
    phone: '+250788123456',
    address: '123 Test Street',
    city: 'Kigali',
    district: 'Gasabo',
    sector: 'Kimihurura',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

localStorage.setItem('companies', JSON.stringify(mockCompanies));

console.log('✅ Development authentication setup complete!');
console.log('📋 Mock data created:');
console.log('   - Company ID: test-company-dev-001');
console.log('   - User: dev@test.com');
console.log('   - Authentication bypass enabled');
console.log('');
console.log('🚀 You can now use the application in development mode!');
console.log('💡 All API calls will use mock responses when authentication fails.');
