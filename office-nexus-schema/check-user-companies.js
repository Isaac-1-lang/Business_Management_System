/**
 * Check User Companies Script
 * 
 * This script checks what companies the current user has access to
 */

async function checkUserCompanies() {
  console.log('🔍 Checking user companies...');
  
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.log('❌ No access token found. Please login first.');
    return;
  }
  
  try {
    // Get current user info
    const userResponse = await fetch('http://localhost:5000/api/v1/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('👤 Current user:', userData.data.user);
      console.log('🏢 User companies:', userData.data.companies);
      
      if (userData.data.companies && userData.data.companies.length > 0) {
        console.log('');
        console.log('✅ Available company IDs:');
        userData.data.companies.forEach((company, index) => {
          console.log(`   ${index + 1}. ${company.name} (ID: ${company.id})`);
        });
        
        // Set the first available company
        const firstCompany = userData.data.companies[0];
        localStorage.setItem('selectedCompanyId', firstCompany.id);
        console.log('');
        console.log(`🎯 Set company ID to: ${firstCompany.id}`);
        console.log('✅ You can now refresh the page and try again!');
        
      } else {
        console.log('❌ User has no companies assigned.');
        console.log('');
        console.log('🔧 Solutions:');
        console.log('1. Create a new company for this user');
        console.log('2. Assign this user to an existing company');
        console.log('3. Use a different user account');
      }
      
    } else {
      console.log('❌ Failed to get user info:', userResponse.status);
      const errorText = await userResponse.text();
      console.log('Error details:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Error checking user companies:', error);
  }
}

// Also try to get all companies
async function getAllCompanies() {
  console.log('');
  console.log('🏢 Checking all available companies...');
  
  const token = localStorage.getItem('accessToken');
  
  try {
    const companiesResponse = await fetch('http://localhost:5000/api/v1/companies', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (companiesResponse.ok) {
      const companiesData = await companiesResponse.json();
      console.log('🏢 All companies:', companiesData);
    } else {
      console.log('❌ Failed to get companies:', companiesResponse.status);
    }
    
  } catch (error) {
    console.log('❌ Error getting companies:', error);
  }
}

// Run both checks
checkUserCompanies().then(() => getAllCompanies());
