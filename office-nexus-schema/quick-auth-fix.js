/**
 * Quick Authentication Fix
 * 
 * This script quickly sets up authentication and fixes token issues
 */

async function quickAuthFix() {
  console.log('🔧 Quick Authentication Fix Starting...');
  
  // Step 1: Clear any corrupted tokens
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  console.log('🧹 Cleared old tokens');
  
  // Step 2: Quick login
  try {
    const response = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data.tokens) {
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        localStorage.setItem('currentUser', JSON.stringify(data.data.user));
        
        // Set company ID
        if (data.data.companies && data.data.companies.length > 0) {
          localStorage.setItem('selectedCompanyId', data.data.companies[0].id);
          console.log('✅ Authentication successful!');
          console.log('🏢 Company:', data.data.companies[0].name);
          console.log('👤 User:', data.data.user.name);
        } else {
          // Create a company
          console.log('🏢 No companies found, creating one...');
          await createCompany();
        }
        
        console.log('🎉 Ready! Refresh the page now.');
        return true;
      }
    } else {
      console.log('❌ Login failed, trying registration...');
      await registerAndLogin();
    }
  } catch (error) {
    console.log('❌ Error:', error);
    console.log('🔧 Trying alternative setup...');
    setupDevMode();
  }
}

async function registerAndLogin() {
  try {
    // Register
    const regResponse = await fetch('http://localhost:5000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      })
    });
    
    if (regResponse.ok) {
      console.log('✅ Registration successful, logging in...');
      return quickAuthFix(); // Retry login
    }
  } catch (error) {
    console.log('❌ Registration failed:', error);
    setupDevMode();
  }
}

async function createCompany() {
  const token = localStorage.getItem('accessToken');
  try {
    const response = await fetch('http://localhost:5000/api/v1/companies', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Company Ltd',
        email: 'test@company.com',
        phone: '+250788123456',
        tin: '123456789',
        address: '123 Test Street',
        city: 'Kigali',
        district: 'Gasabo',
        sector: 'Kimihurura',
        businessType: 'Technology',
        currency: 'RWF',
        status: 'active'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('selectedCompanyId', data.data.company.id);
      console.log('✅ Company created:', data.data.company.name);
    }
  } catch (error) {
    console.log('⚠️ Company creation failed, using dev mode');
    setupDevMode();
  }
}

function setupDevMode() {
  console.log('🔧 Setting up development mode...');
  localStorage.setItem('selectedCompanyId', 'test-company-dev-001');
  localStorage.setItem('currentUser', JSON.stringify({
    id: 'user-dev-001',
    name: 'Dev User',
    email: 'dev@test.com'
  }));
  console.log('✅ Development mode enabled');
  console.log('🎉 Refresh the page to continue');
}

// Run the fix
quickAuthFix();
