/**
 * BACKEND TEST SCRIPT
 * 
 * This script tests the basic functionality of the backend
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/v1';

// Test data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'Test123!',
  phone: '+250788999999'
};

let authToken = null;

/**
 * Test health endpoint
 */
async function testHealth() {
  try {
    console.log('🔍 Testing health endpoint...');
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Health check passed:', data);
      return true;
    } else {
      console.log('❌ Health check failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

/**
 * Test user registration
 */
async function testRegistration() {
  try {
    console.log('🔍 Testing user registration...');
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful:', data.message);
      authToken = data.data.tokens.accessToken;
      return true;
    } else {
      console.log('❌ Registration failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
    return false;
  }
}

/**
 * Test user login
 */
async function testLogin() {
  try {
    console.log('🔍 Testing user login...');
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful:', data.message);
      authToken = data.data.tokens.accessToken;
      return true;
    } else {
      console.log('❌ Login failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

/**
 * Test protected endpoint
 */
async function testProtectedEndpoint() {
  if (!authToken) {
    console.log('❌ No auth token available');
    return false;
  }
  
  try {
    console.log('🔍 Testing protected endpoint...');
    const response = await fetch(`${BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Protected endpoint successful:', data.message);
      return true;
    } else {
      console.log('❌ Protected endpoint failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Protected endpoint error:', error.message);
    return false;
  }
}

/**
 * Test tax rates endpoint
 */
async function testTaxRates() {
  try {
    console.log('🔍 Testing tax rates endpoint...');
    const response = await fetch(`${BASE_URL}/tax/rates`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Tax rates retrieved:', data.data.rates);
      return true;
    } else {
      console.log('❌ Tax rates failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Tax rates error:', error.message);
    return false;
  }
}

/**
 * Test notification endpoint
 */
async function testNotifications() {
  if (!authToken) {
    console.log('❌ No auth token available');
    return false;
  }
  
  try {
    console.log('🔍 Testing notifications endpoint...');
    const response = await fetch(`${BASE_URL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Notifications retrieved:', data.message);
      return true;
    } else {
      console.log('❌ Notifications failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Notifications error:', error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting backend tests...\n');
  
  const tests = [
    { name: 'Health Check', fn: testHealth },
    { name: 'User Registration', fn: testRegistration },
    { name: 'User Login', fn: testLogin },
    { name: 'Protected Endpoint', fn: testProtectedEndpoint },
    { name: 'Tax Rates', fn: testTaxRates },
    { name: 'Notifications', fn: testNotifications }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n📋 Running: ${test.name}`);
    const result = await test.fn();
    
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Backend is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the backend setup.');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}
