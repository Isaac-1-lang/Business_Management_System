/**
 * Debug Login Helper
 * 
 * This script provides detailed debugging for authentication issues
 */

async function debugLogin() {
  console.log('🔧 Debug Login Helper Starting...');
  console.log('');
  
  const API_BASE_URL = 'http://localhost:5000/api/v1';
  
  // Step 1: Test backend connectivity
  console.log('1️⃣ Testing backend connectivity...');
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    if (healthResponse.ok) {
      console.log('✅ Backend is running and accessible');
    } else {
      console.log('⚠️ Backend responded but with status:', healthResponse.status);
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend:', error.message);
    console.log('🔧 Make sure backend is running on http://localhost:5000');
    return;
  }
  
  // Step 2: Clear existing tokens
  console.log('');
  console.log('2️⃣ Clearing existing tokens...');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('currentUser');
  console.log('✅ Tokens cleared');
  
  // Step 3: Attempt login
  console.log('');
  console.log('3️⃣ Attempting login...');
  
  const loginData = {
    email: 'test@example.com',
    password: 'password123'
  };
  
  console.log('📤 Sending login request with:', loginData);
  
  try {
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    console.log('📡 Login response status:', loginResponse.status);
    
    const responseText = await loginResponse.text();
    console.log('📄 Raw response:', responseText);
    
    let loginResult;
    try {
      loginResult = JSON.parse(responseText);
    } catch (e) {
      console.log('❌ Response is not valid JSON');
      return;
    }
    
    if (loginResponse.ok && loginResult.success) {
      console.log('✅ Login successful!');
      console.log('👤 User data:', loginResult.data.user);
      console.log('🏢 Companies:', loginResult.data.companies);
      console.log('🔑 Tokens received:', !!loginResult.data.tokens);
      
      // Save tokens
      if (loginResult.data.tokens) {
        localStorage.setItem('accessToken', loginResult.data.tokens.accessToken);
        localStorage.setItem('refreshToken', loginResult.data.tokens.refreshToken);
        console.log('💾 Tokens saved to localStorage');
      }
      
      // Save user data
      localStorage.setItem('currentUser', JSON.stringify(loginResult.data.user));
      
      // Set company ID
      if (loginResult.data.companies && loginResult.data.companies.length > 0) {
        localStorage.setItem('selectedCompanyId', loginResult.data.companies[0].id);
        console.log('🏢 Company ID set:', loginResult.data.companies[0].id);
      } else {
        localStorage.setItem('selectedCompanyId', '44349013-82b3-4aa7-bce0-b51bc970387b');
        console.log('🏢 Using fallback company ID: 44349013-82b3-4aa7-bce0-b51bc970387b');
      }
      
    } else {
      console.log('❌ Login failed:', loginResult.message);
      
      // Try registration if user doesn't exist
      if (loginResult.message && loginResult.message.includes('User not found')) {
        console.log('');
        console.log('4️⃣ User not found, attempting registration...');
        
        const registerData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        };
        
        const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registerData)
        });
        
        const registerResult = await registerResponse.json();
        console.log('📡 Registration response:', registerResult);
        
        if (registerResponse.ok && registerResult.success) {
          console.log('✅ Registration successful! Now try login again.');
          // Retry login
          return debugLogin();
        } else {
          console.log('❌ Registration failed:', registerResult.message);
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Login request failed:', error);
  }
  
  // Step 4: Test API call
  console.log('');
  console.log('5️⃣ Testing API call with new token...');
  
  const token = localStorage.getItem('accessToken');
  const companyId = localStorage.getItem('selectedCompanyId');
  
  if (token && companyId) {
    try {
      const testResponse = await fetch(`${API_BASE_URL}/meetings?companyId=${companyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📡 Test API call status:', testResponse.status);
      
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('✅ API call successful!');
        console.log('📊 Meetings data:', testData);
        console.log('');
        console.log('🎉 Authentication is working! You can now refresh the page.');
      } else {
        const errorText = await testResponse.text();
        console.log('❌ API call failed:', errorText);
      }
      
    } catch (error) {
      console.log('❌ API test failed:', error);
    }
  } else {
    console.log('❌ Missing token or company ID for API test');
  }
}

// Run the debug login
debugLogin();
