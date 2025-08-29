import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Log current environment variables for debugging
console.log('Current Database Configuration:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_DIALECT:', process.env.DB_DIALECT);
console.log('DB_SSL:', process.env.DB_SSL);
console.log('');

// Parse the connection string if it exists in DB_HOST
let host = process.env.DB_HOST;
let port = process.env.DB_PORT || 5432;
let database = process.env.DB_NAME;
let username = process.env.DB_USER;
let password = process.env.DB_PASSWORD;

// If DB_HOST contains a connection string, try to parse it
if (host && host.includes('postgresql://')) {
  try {
    const url = new URL(host);
    host = url.hostname;
    port = url.port || 5432;
    database = url.pathname.substring(1); // Remove leading slash
    username = url.username;
    password = url.password;
    console.log('Parsed connection string:');
    console.log('Host:', host);
    console.log('Port:', port);
    console.log('Database:', database);
    console.log('Username:', username);
    console.log('');
  } catch (error) {
    console.log('Failed to parse connection string:', error.message);
  }
}

// Create Sequelize instance with SSL configurable via env
const shouldUseSsl = String(process.env.DB_SSL || 'false').toLowerCase() === 'true';
const rejectUnauthorized = String(process.env.DB_SSL_REJECT_UNAUTHORIZED || 'true').toLowerCase() === 'true';

const sequelize = new Sequelize(database, username, password, {
  host: host,
  port: port,
  dialect: 'postgres',
  logging: false,
  dialectOptions: (() => {
    const base = { connectTimeout: 30000 };
    if (shouldUseSsl) {
      return {
        ...base,
        ssl: {
          require: true,
          rejectUnauthorized,
        },
      };
    }
    return base;
  })(),
  retry: {
    max: 3,
    timeout: 3000
  }
});

// Test connection
async function testConnection() {
  console.log('Testing PostgreSQL connection...');
  console.log(`Attempting to connect to: ${host}:${port}/${database}`);
  console.log('');

  try {
    await sequelize.authenticate();
    console.log('SUCCESS: Database connection established successfully!');
    console.log(`Connected to: ${host}:${port}/${database}`);
    console.log('Database is ready for use');
    
    // Test a simple query
    const [results] = await sequelize.query('SELECT version()');
    console.log('Database version:', results[0].version);
    
    await sequelize.close();
    console.log('Connection closed successfully');
    
  } catch (error) {
    console.log('FAILED: Unable to connect to the database');
    console.log('Error details:', error.message);
    console.log('');
    console.log('Troubleshooting tips:');
    console.log('1. Check if your database credentials are correct');
    console.log('2. Ensure the database server is running');
    console.log('3. Verify network connectivity');
    console.log('4. Check SSL configuration for cloud databases');
    console.log('5. Ensure the database exists and is accessible');
    
    process.exit(1);
  }
}

// Run the test
testConnection();
