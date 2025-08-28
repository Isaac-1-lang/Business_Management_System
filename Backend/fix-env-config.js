import fs from 'fs';
import path from 'path';

// Clean Neon database configuration
const cleanEnvContent = `# ==================== SERVER CONFIGURATION ====================
NODE_ENV=development
PORT=3220

# ==================== DATABASE CONFIGURATION ====================
# Neon PostgreSQL Database - Using the correct host from your connection string
DB_HOST=ep-summer-poetry-adv42kl7-pooler.c-2.us-east-1.aws.neon.tech
DB_PORT=5432
DB_NAME=Business
DB_USER=neondb_owner
DB_PASSWORD=npg_Y4bdJDAr1lae
DB_DIALECT=postgres
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false

# ==================== JWT CONFIGURATION ====================
JWT_SECRET=taketimeandthenworkhardtowards361304olc0012024121402pr07320221541230203uirhgjrhhkfhurelhflhrhhkgrhejlrjhrhrrbfghjrrhkhwerhjhbbrhhfbflhrhglgegjhrglbdbfsbvfnvnvnrvnvlwrhjgjgejgrewb2hio3ii2992u3828
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# ==================== REDIS CONFIGURATION ====================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# ==================== FRONTEND URL ====================
FRONTEND_URL=http://localhost:5173
`;

// Create backup of current .env
const envPath = path.join(process.cwd(), '.env');
const backupPath = path.join(process.cwd(), '.env.backup');

try {
  // Create backup
  if (fs.existsSync(envPath)) {
    fs.copyFileSync(envPath, backupPath);
    console.log('✅ Created backup of current .env file as .env.backup');
  }

  // Write clean configuration
  fs.writeFileSync(envPath, cleanEnvContent);
  console.log('✅ Created clean .env file with correct Neon database configuration');
  console.log('');
  console.log('📋 Database Configuration:');
  console.log('Host: ep-summer-poetry-adv42kl7-pooler.c-2.us-east-1.aws.neon.tech');
  console.log('Port: 5432');
  console.log('Database: Business');
  console.log('User: neondb_owner');
  console.log('SSL: Enabled');
  console.log('');
  console.log('🔧 Next steps:');
  console.log('1. Test the connection with: node test-db-connection.js');
  console.log('2. Start the server with: npm run dev');
  console.log('3. If you need to restore the old config, copy .env.backup to .env');

} catch (error) {
  console.error('❌ Error fixing .env file:', error.message);
}
