#!/usr/bin/env node

/**
 * Cloud Database Setup Script
 * 
 * This script helps you test and validate your cloud database connection
 * before starting the main application.
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function testConnection(config) {
  const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      logging: false,
      dialectOptions: {
        ssl: config.ssl ? {
          require: true,
          rejectUnauthorized: config.sslRejectUnauthorized !== false
        } : false,
        connectTimeout: 30000
      }
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Connection successful!');
    await sequelize.close();
    return true;
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Cloud Database Setup Helper\n');
  
  console.log('Available providers:');
  console.log('1. Neon (Recommended)');
  console.log('2. Supabase');
  console.log('3. Railway');
  console.log('4. PlanetScale (MySQL)');
  console.log('5. Custom configuration');
  console.log('6. Test current .env configuration\n');

  const choice = await question('Choose your provider (1-6): ');

  let config = {};

  switch (choice) {
    case '1': // Neon
      console.log('\n📋 Neon Configuration:');
      config.host = await question('Host (e.g., ep-cool-name-123456.us-east-2.aws.neon.tech): ');
      config.port = await question('Port (default: 5432): ') || '5432';
      config.database = await question('Database name (default: neondb): ') || 'neondb';
      config.username = await question('Username: ');
      config.password = await question('Password: ');
      config.dialect = 'postgres';
      config.ssl = true;
      config.sslRejectUnauthorized = false;
      break;

    case '2': // Supabase
      console.log('\n📋 Supabase Configuration:');
      config.host = await question('Host (e.g., db.your-project-ref.supabase.co): ');
      config.port = await question('Port (default: 5432): ') || '5432';
      config.database = await question('Database name (default: postgres): ') || 'postgres';
      config.username = await question('Username (default: postgres): ') || 'postgres';
      config.password = await question('Password: ');
      config.dialect = 'postgres';
      config.ssl = true;
      config.sslRejectUnauthorized = false;
      break;

    case '3': // Railway
      console.log('\n📋 Railway Configuration:');
      config.host = await question('Host (e.g., containers-us-west-123.railway.app): ');
      config.port = await question('Port (default: 5432): ') || '5432';
      config.database = await question('Database name (default: railway): ') || 'railway';
      config.username = await question('Username (default: postgres): ') || 'postgres';
      config.password = await question('Password: ');
      config.dialect = 'postgres';
      config.ssl = true;
      config.sslRejectUnauthorized = false;
      break;

    case '4': // PlanetScale
      console.log('\n📋 PlanetScale Configuration:');
      config.host = await question('Host (e.g., aws.connect.psdb.cloud): ');
      config.port = await question('Port (default: 3306): ') || '3306';
      config.database = await question('Database name: ');
      config.username = await question('Username: ');
      config.password = await question('Password: ');
      config.dialect = 'mysql';
      config.ssl = true;
      config.sslRejectUnauthorized = false;
      break;

    case '5': // Custom
      console.log('\n📋 Custom Configuration:');
      config.host = await question('Host: ');
      config.port = await question('Port: ');
      config.database = await question('Database name: ');
      config.username = await question('Username: ');
      config.password = await question('Password: ');
      config.dialect = await question('Dialect (postgres/mysql): ') || 'postgres';
      config.ssl = (await question('Use SSL? (y/n): ')).toLowerCase() === 'y';
      config.sslRejectUnauthorized = (await question('Reject unauthorized SSL? (y/n): ')).toLowerCase() === 'y';
      break;

    case '6': // Test current .env
      console.log('\n📋 Testing current .env configuration...');
      config = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        dialect: process.env.DB_DIALECT,
        ssl: process.env.DB_SSL === 'true',
        sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
      };
      break;

    default:
      console.log('Invalid choice. Exiting...');
      rl.close();
      return;
  }

  console.log('\n🔍 Testing connection...');
  const success = await testConnection(config);

  if (success) {
    console.log('\n✅ Connection successful!');
    
    if (choice !== '6') {
      const saveToEnv = await question('\n💾 Save configuration to .env file? (y/n): ');
      
      if (saveToEnv.toLowerCase() === 'y') {
        const fs = await import('fs');
        const envPath = '.env';
        
        let envContent = '';
        if (fs.existsSync(envPath)) {
          envContent = fs.readFileSync(envPath, 'utf8');
        }
        
        // Update or add database configuration
        const lines = envContent.split('\n');
        const dbConfig = {
          'DB_HOST': config.host,
          'DB_PORT': config.port,
          'DB_NAME': config.database,
          'DB_USER': config.username,
          'DB_PASSWORD': config.password,
          'DB_DIALECT': config.dialect,
          'DB_SSL': config.ssl.toString(),
          'DB_SSL_REJECT_UNAUTHORIZED': config.sslRejectUnauthorized.toString()
        };

        let updated = false;
        const newLines = lines.map(line => {
          const [key] = line.split('=');
          if (dbConfig[key]) {
            updated = true;
            return `${key}=${dbConfig[key]}`;
          }
          return line;
        });

        if (!updated) {
          newLines.push('');
          newLines.push('# Database Configuration');
          Object.entries(dbConfig).forEach(([key, value]) => {
            newLines.push(`${key}=${value}`);
          });
        }

        fs.writeFileSync(envPath, newLines.join('\n'));
        console.log('✅ Configuration saved to .env file');
      }
    }
    
    console.log('\n🎉 You\'re ready to start your application!');
    console.log('Run: npm run dev');
  } else {
    console.log('\n❌ Connection failed. Please check your configuration.');
    console.log('Common issues:');
    console.log('- Verify host, port, and credentials');
    console.log('- Ensure SSL is properly configured');
    console.log('- Check if the database exists');
    console.log('- Verify network connectivity');
  }

  rl.close();
}

main().catch(console.error);
