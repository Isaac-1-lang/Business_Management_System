/**
 * Test Dynamic Company ID Functionality
 * 
 * This script tests the new automatic company ID detection
 */

async function testDynamicCompany() {
  console.log('🔍 Testing Dynamic Company ID Functionality...');
  
  // Clear any hardcoded company ID
  localStorage.removeItem('selectedCompanyId');
  console.log('🧹 Cleared hardcoded company ID');
  
  // Test login with automatic company selection
  console.log('');
  console.log('1️⃣ Testing login with auto company selection...');
  
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
      console.log('✅ Login successful');
      
      if (data.data.companies && data.data.companies.length > 0) {
        console.log('🏢 Available companies:');
        data.data.companies.forEach((company, index) => {
          console.log(`   ${index + 1}. ${company.name} (ID: ${company.id})`);
        });
        
        // The apiService should auto-select the first company
        const firstCompany = data.data.companies[0];
        localStorage.setItem('selectedCompanyId', firstCompany.id);
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        
        console.log('✅ Auto-selected company:', firstCompany.name);
        
        // Test meetings API with dynamic company ID
        console.log('');
        console.log('2️⃣ Testing meetings API with dynamic company ID...');
        
        // Refresh the page to reload the apiService with new tokens
        console.log('🔄 Refreshing page to test dynamic company ID...');
        console.log('');
        console.log('✅ Setup complete! The page will refresh and test dynamic company ID.');
        console.log('📋 After refresh, check console for "Auto-selected company" messages');
        
        setTimeout(() => {
          location.reload();
        }, 2000);
        
      } else {
        console.log('❌ No companies found for user');
        console.log('🔧 You may need to create a company first');
      }
      
    } else {
      console.log('❌ Login failed:', response.status);
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Error during login test:', error);
  }
}

// Also test the dynamic company ID after page load
async function testAfterPageLoad() {
  console.log('');
  console.log('3️⃣ Testing dynamic company ID after page load...');
  
  // Wait for apiService to be available
  if (typeof apiService !== 'undefined') {
    try {
      console.log('🔍 Testing getMeetings with dynamic company ID...');
      const meetingsResponse = await apiService.getMeetings();
      
      if (meetingsResponse.success) {
        console.log('✅ Dynamic company ID is working!');
        console.log('📊 Found', meetingsResponse.data?.meetings?.length || 0, 'meetings');
      } else {
        console.log('❌ getMeetings failed:', meetingsResponse.message);
        
        if (meetingsResponse.error === 'NO_COMPANY_ACCESS') {
          console.log('🔧 This means the dynamic company detection isn\'t finding any companies');
          console.log('   Check if the user has companies assigned in the database');
        }
      }
      
    } catch (error) {
      console.log('❌ Error testing dynamic company ID:', error);
    }
  } else {
    console.log('⚠️ apiService not available yet, try running this after page load');
  }
}

// Run the appropriate test based on current state
const hasToken = localStorage.getItem('accessToken');
if (hasToken) {
  console.log('🔑 Token found, testing dynamic company ID...');
  testAfterPageLoad();
} else {
  console.log('🔑 No token found, testing full login flow...');
  testDynamicCompany();
}
