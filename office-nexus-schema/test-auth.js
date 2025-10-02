/**
 * Authentication Test Script
 * 
 * This script tests if JWT authentication is working properly
 */

async function testAuthentication() {
  console.log('🔍 Testing authentication...');
  
  // Check if tokens exist in localStorage
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const companyId = localStorage.getItem('selectedCompanyId');
  
  console.log('📋 Current localStorage data:');
  console.log('   - Access Token:', accessToken ? '✅ Present' : '❌ Missing');
  console.log('   - Refresh Token:', refreshToken ? '✅ Present' : '❌ Missing');
  console.log('   - Company ID:', companyId || '❌ Missing');
  
  if (!accessToken) {
    console.log('❌ No access token found. Please run the login helper first.');
    return false;
  }
  
  // Test API call with current token
  console.log('🔄 Testing API call...');
  
  try {
    const response = await fetch('http://localhost:5000/api/v1/meetings?companyId=' + companyId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('📡 API Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API call successful!');
      console.log('📊 Response data:', data);
      return true;
    } else {
      const errorData = await response.text();
      console.log('❌ API call failed:', response.status, response.statusText);
      console.log('📄 Error details:', errorData);
      
      if (response.status === 401) {
        console.log('🔐 Token might be expired or invalid. Try logging in again.');
      }
      
      return false;
    }
    
  } catch (error) {
    console.log('❌ Network error:', error);
    console.log('🔧 Make sure your backend is running on http://localhost:5000');
    return false;
  }
}

// Run the test
testAuthentication();
