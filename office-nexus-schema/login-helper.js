/**
 * Login Helper for Development
 * 
 * This script helps you authenticate with the backend API
 * and get a valid JWT token for API calls.
 */

async function loginAndSetupAuth() {
  console.log('🔐 Starting authentication process...');
  
  const API_BASE_URL = 'http://localhost:5000/api/v1';
  
  try {
    // First, let's try to register a test user (in case they don't exist)
    console.log('📝 Attempting to register test user...');
    
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      })
    });
    
    if (registerResponse.ok) {
      console.log('✅ Test user registered successfully');
    } else {
      console.log('ℹ️ User might already exist, proceeding to login...');
    }
    
    // Now login
    console.log('🔑 Logging in...');
    
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful!', loginData);
    
    if (loginData.success && loginData.data) {
      // Store the tokens
      localStorage.setItem('accessToken', loginData.data.tokens.accessToken);
      localStorage.setItem('refreshToken', loginData.data.tokens.refreshToken);
      
      // Store user data
      localStorage.setItem('currentUser', JSON.stringify(loginData.data.user));
      
      // Store companies if available
      if (loginData.data.companies && loginData.data.companies.length > 0) {
        localStorage.setItem('companies', JSON.stringify(loginData.data.companies));
        localStorage.setItem('selectedCompanyId', loginData.data.companies[0].id);
        console.log('🏢 Company set:', loginData.data.companies[0].name);
      } else {
        // Use the company ID you specified
        localStorage.setItem('selectedCompanyId', '44349013-82b3-4aa7-bce0-b51bc970387b');
        console.log('🏢 Using specified company ID: 44349013-82b3-4aa7-bce0-b51bc970387b');
      }
      
      console.log('🎉 Authentication setup complete!');
      console.log('📋 Stored data:');
      console.log('   - Access Token: ✅');
      console.log('   - Refresh Token: ✅');
      console.log('   - User Data: ✅');
      console.log('   - Company ID: ✅');
      console.log('');
      console.log('🚀 You can now refresh the page and use the application!');
      
      return true;
    } else {
      throw new Error('Login response missing required data');
    }
    
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure your backend is running on http://localhost:5000');
    console.log('2. Check if the database is connected');
    console.log('3. Verify the API endpoints are working');
    console.log('');
    console.log('💡 You can also try the development mode bypass:');
    console.log('   localStorage.setItem("selectedCompanyId", "test-company-dev-001");');
    
    return false;
  }
}

// Run the authentication
loginAndSetupAuth();
