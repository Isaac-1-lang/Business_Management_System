#!/usr/bin/env node

/**
 * Setup Script for Backend Connection
 * This script helps configure the frontend to connect to the deployed backend
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up frontend connection to deployed backend...\n');

// Backend URL
const BACKEND_URL = 'https://newbiceracing.onrender.com';
const API_URL = `${BACKEND_URL}/api/v1`;

// Create .env file
const envContent = `# Frontend Environment Configuration
# API Configuration - Connected to Deployed Backend
VITE_API_URL=${API_URL}

# App Configuration
VITE_APP_NAME=Office Nexus
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_SOCKET_IO=true
VITE_ENABLE_REAL_TIME_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=false

# External Services (Optional)
VITE_GOOGLE_ANALYTICS_ID=
VITE_SENTRY_DSN=

# Development
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
`;

try {
  // Write .env file
  fs.writeFileSync('.env', envContent);
  console.log('✅ Created .env file with backend configuration');
  
  // Test backend connection
  console.log('\n🔍 Testing backend connection...');
  
  const https = require('https');
  
  const testConnection = () => {
    return new Promise((resolve, reject) => {
      const req = https.request(`${API_URL}/health`, {
        method: 'GET',
        timeout: 10000
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve({ status: res.statusCode, data: response });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });
      
      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.end();
    });
  };
  
  testConnection()
    .then(result => {
      console.log('✅ Backend connection successful!');
      console.log(`   Status: ${result.status}`);
      console.log(`   Response: ${JSON.stringify(result.data, null, 2)}`);
    })
    .catch(error => {
      console.log('❌ Backend connection failed:');
      console.log(`   Error: ${error.message}`);
      console.log('\n💡 This might be normal if the backend is still starting up.');
      console.log('   Try running the frontend anyway - it will retry connections.');
    });
    
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}

console.log('\n📋 Next steps:');
console.log('1. The .env file has been created with your backend URL');
console.log('2. Start the frontend development server: npm run dev');
console.log('3. The frontend will now connect to your deployed backend');
console.log(`4. Backend URL: ${BACKEND_URL}`);
console.log(`5. API Endpoint: ${API_URL}`);
console.log('\n🎉 Setup complete!');
