/**
 * Create Company Script
 * 
 * This script creates a new company for the current user
 */

async function createCompanyForUser() {
  console.log('🏢 Creating a new company...');
  
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.log('❌ No access token found. Please login first.');
    return;
  }
  
  const companyData = {
    name: 'Test Company Ltd',
    email: 'test@company.com',
    phone: '+250788123456',
    tin: '123456789',
    address: '123 Test Street',
    city: 'Kigali',
    district: 'Gasabo',
    sector: 'Kimihurura',
    cell: 'Kimihurura',
    postalCode: '250',
    businessType: 'Technology',
    registrationNumber: 'REG123456',
    vatNumber: 'VAT123456',
    currency: 'RWF',
    fiscalYearStart: '01-01',
    taxRegime: 'Standard',
    status: 'active'
  };
  
  try {
    const response = await fetch('http://localhost:5000/api/v1/companies', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(companyData)
    });
    
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Company created successfully!');
      console.log('🏢 New company:', result.data.company);
      
      // Set this as the selected company
      localStorage.setItem('selectedCompanyId', result.data.company.id);
      console.log('🎯 Set as selected company ID:', result.data.company.id);
      console.log('');
      console.log('🎉 Success! You can now refresh the page and access meetings!');
      
    } else {
      const errorData = await response.text();
      console.log('❌ Failed to create company:', response.status);
      console.log('Error details:', errorData);
      
      if (response.status === 403) {
        console.log('');
        console.log('🔧 403 Forbidden - This might mean:');
        console.log('1. Your user role doesn\'t have permission to create companies');
        console.log('2. You need admin/owner role to create companies');
        console.log('3. Try using an admin account instead');
      }
    }
    
  } catch (error) {
    console.log('❌ Error creating company:', error);
  }
}

// Run the company creation
createCompanyForUser();
