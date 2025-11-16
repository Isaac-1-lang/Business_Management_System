/**
 * Fix Company Access - 403 Forbidden Solution
 * 
 * This script finds companies you have access to and sets the correct company ID
 */

async function fixCompanyAccess() {
  console.log('🔧 Fixing 403 Company Access Issue...');
  
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.log('❌ No access token found. Please run quick-auth-fix.js first.');
    return;
  }
  
  console.log('🔍 Step 1: Checking your user info and companies...');
  
  try {
    // Get current user and their companies
    const userResponse = await fetch('http://localhost:5000/api/v1/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ User authenticated successfully');
      console.log('👤 User:', userData.data.user.name, '(' + userData.data.user.email + ')');
      
      if (userData.data.companies && userData.data.companies.length > 0) {
        console.log('🏢 Companies you have access to:');
        userData.data.companies.forEach((company, index) => {
          console.log(`   ${index + 1}. ${company.name} (ID: ${company.id})`);
        });
        
        // Use the first company
        const firstCompany = userData.data.companies[0];
        localStorage.setItem('selectedCompanyId', firstCompany.id);
        console.log('');
        console.log('✅ Set company ID to:', firstCompany.id);
        console.log('🏢 Company name:', firstCompany.name);
        
        // Test the meetings API with the new company ID
        console.log('');
        console.log('🔍 Step 2: Testing meetings API with correct company ID...');
        
        const meetingsResponse = await fetch(`http://localhost:5000/api/v1/meetings?companyId=${firstCompany.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📡 Meetings API response:', meetingsResponse.status);
        
        if (meetingsResponse.ok) {
          const meetingsData = await meetingsResponse.json();
          console.log('✅ SUCCESS! Meetings API is working');
          console.log('📊 Found', meetingsData.data?.meetings?.length || 0, 'meetings');
          console.log('');
          console.log('🎉 403 error is fixed! Refresh the page now.');
          return true;
          
        } else {
          const errorText = await meetingsResponse.text();
          console.log('❌ Meetings API still failing:', errorText);
          
          if (meetingsResponse.status === 403) {
            console.log('');
            console.log('🔧 Still getting 403. This might mean:');
            console.log('1. The user-company association is not properly set in database');
            console.log('2. The company ID format doesn\'t match');
            console.log('3. There\'s a database issue');
            console.log('');
            console.log('Let\'s try creating a new company for you...');
            return await createNewCompany(token);
          }
        }
        
      } else {
        console.log('❌ No companies found for your user');
        console.log('🔧 Creating a new company for you...');
        return await createNewCompany(token);
      }
      
    } else {
      const errorText = await userResponse.text();
      console.log('❌ Failed to get user info:', userResponse.status);
      console.log('Error:', errorText);
      
      if (userResponse.status === 401) {
        console.log('🔧 Token might be expired. Please run quick-auth-fix.js again.');
      }
    }
    
  } catch (error) {
    console.log('❌ Error checking user info:', error);
  }
}

async function createNewCompany(token) {
  console.log('');
  console.log('🏢 Creating a new company for you...');
  
  const companyData = {
    name: 'My Test Company',
    email: 'mycompany@test.com',
    phone: '+250788123456',
    tin: Date.now().toString().slice(-9), // Generate unique TIN
    address: '123 Business Street',
    city: 'Kigali',
    district: 'Gasabo',
    sector: 'Kimihurura',
    cell: 'Kimihurura',
    postalCode: '250',
    businessType: 'Technology',
    registrationNumber: 'REG' + Date.now(),
    vatNumber: 'VAT' + Date.now(),
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
    
    console.log('📡 Company creation response:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Company created successfully!');
      console.log('🏢 New company:', result.data.company.name);
      console.log('🆔 Company ID:', result.data.company.id);
      
      // Set this as the selected company
      localStorage.setItem('selectedCompanyId', result.data.company.id);
      
      // Test meetings API
      const meetingsTest = await fetch(`http://localhost:5000/api/v1/meetings?companyId=${result.data.company.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (meetingsTest.ok) {
        console.log('✅ Meetings API test successful!');
        console.log('🎉 403 error is fixed! Refresh the page now.');
        return true;
      } else {
        console.log('⚠️ Company created but meetings API still has issues');
      }
      
    } else {
      const errorData = await response.text();
      console.log('❌ Failed to create company:', response.status);
      console.log('Error details:', errorData);
      
      if (response.status === 403) {
        console.log('');
        console.log('🔧 403 on company creation means your user role doesn\'t have permission');
        console.log('This suggests a backend permission issue');
        console.log('');
        console.log('💡 Alternative: Use development mode');
        setupDevMode();
      }
    }
    
  } catch (error) {
    console.log('❌ Error creating company:', error);
    setupDevMode();
  }
}

function setupDevMode() {
  console.log('');
  console.log('🔧 Setting up development mode as fallback...');
  localStorage.setItem('selectedCompanyId', 'test-company-dev-001');
  console.log('✅ Development mode enabled');
  console.log('🎉 Refresh the page - the app will use mock data');
}

// Run the fix
fixCompanyAccess();
