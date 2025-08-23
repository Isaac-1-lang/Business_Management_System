# Cloud Database Setup Guide

This guide will help you set up a cloud PostgreSQL database for your Office Nexus Rwanda project.

## Quick Start Options

### 🚀 **Option 1: Neon (Recommended - Best Free Tier)**

**Step 1: Create Neon Account**
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub or email
3. Create a new project

**Step 2: Get Connection Details**
1. In your Neon dashboard, click on your project
2. Go to "Connection Details"
3. Copy the connection string

**Step 3: Configure Environment**
```bash
# Copy env.example to .env
cp env.example .env

# Update your .env file with Neon credentials:
DB_HOST=ep-cool-name-123456.us-east-2.aws.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=your_neon_user
DB_PASSWORD=your_neon_password
DB_DIALECT=postgres
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

**Step 4: Test Connection**
```bash
cd Backend
npm install
npm run dev
```

### 🎯 **Option 2: Supabase (Easy Setup)**

**Step 1: Create Supabase Account**
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub
3. Create a new project

**Step 2: Get Connection Details**
1. Go to Settings > Database
2. Copy the connection string

**Step 3: Configure Environment**
```bash
DB_HOST=db.your-project-ref.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_password
DB_DIALECT=postgres
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

### 🚂 **Option 3: Railway (Simple Deployment)**

**Step 1: Create Railway Account**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

**Step 2: Add PostgreSQL**
1. Click "New Service"
2. Select "Database" > "PostgreSQL"
3. Copy connection details

**Step 3: Configure Environment**
```bash
DB_HOST=containers-us-west-123.railway.app
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your_railway_password
DB_DIALECT=postgres
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

### 🌍 **Option 4: PlanetScale (MySQL Alternative)**

If you prefer MySQL over PostgreSQL:

**Step 1: Create PlanetScale Account**
1. Go to [planetscale.com](https://planetscale.com)
2. Sign up with GitHub
3. Create a new database

**Step 2: Get Connection Details**
1. Go to "Connect" tab
2. Copy the connection string

**Step 3: Configure Environment**
```bash
DB_HOST=aws.connect.psdb.cloud
DB_PORT=3306
DB_NAME=office_nexus_rw
DB_USER=your_planetscale_user
DB_PASSWORD=your_planetscale_password
DB_DIALECT=mysql
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

**Step 4: Install MySQL Driver**
```bash
npm uninstall pg
npm install mysql2
```

## Environment Configuration

### 1. Create .env File
```bash
cd Backend
cp env.example .env
```

### 2. Update Database Settings
Choose one of the options above and update your `.env` file accordingly.

### 3. Test Connection
```bash
npm run dev
```

You should see:
```
✅ Database connection established successfully.
📍 Connected to: your-host:port/database-name
✅ Database synchronized successfully.
```

## Troubleshooting

### Common Issues

**1. SSL Connection Error**
```
Error: no pg_hba.conf entry for host
```
**Solution**: Set `DB_SSL_REJECT_UNAUTHORIZED=false` in your `.env`

**2. Connection Timeout**
```
Error: connect ETIMEDOUT
```
**Solution**: 
- Check your internet connection
- Verify host and port are correct
- Try increasing `connectTimeout` in connection.js

**3. Authentication Failed**
```
Error: password authentication failed
```
**Solution**:
- Double-check username and password
- Ensure user has proper permissions
- Try regenerating credentials in your cloud provider

**4. Database Not Found**
```
Error: database "database_name" does not exist
```
**Solution**:
- Create the database in your cloud provider
- Check the database name in your connection string

### SSL Configuration

For cloud databases, SSL is usually required:

```bash
# Enable SSL
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

### Connection Pooling

The default configuration includes connection pooling:

```javascript
pool: {
  max: 20,    // Maximum connections
  min: 5,     // Minimum connections
  acquire: 30000,  // Connection timeout
  idle: 10000      // Idle timeout
}
```

## Migration and Seeding

### Development Mode
In development, tables are automatically created:
```javascript
await sequelize.sync({ alter: true });
```

### Production Mode
For production, use migrations:
```bash
# Create migration
npx sequelize-cli migration:generate --name create-users

# Run migrations
npx sequelize-cli db:migrate

# Seed data
npx sequelize-cli db:seed:all
```

## Security Best Practices

1. **Never commit .env files**
2. **Use strong passwords**
3. **Enable SSL for all connections**
4. **Restrict database access by IP**
5. **Regularly rotate credentials**
6. **Monitor connection logs**

## Cost Comparison

| Provider | Free Tier | Paid Plans | Best For |
|----------|-----------|------------|----------|
| **Neon** | 3GB storage, unlimited bandwidth | $0.10/GB | Best free tier |
| **Supabase** | 500MB, 2GB bandwidth | $25/month | Easy setup |
| **Railway** | $5 credit/month | Pay-as-you-go | Simple deployment |
| **PlanetScale** | 1GB, 1B reads/month | $29/month | MySQL alternative |

## Next Steps

1. **Choose a provider** from the options above
2. **Set up your account** and create a database
3. **Configure your .env file** with the connection details
4. **Test the connection** with `npm run dev`
5. **Start building** your Rwanda-specific features!

## Need Help?

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify your connection details
3. Ensure SSL is properly configured
4. Check your cloud provider's documentation
5. Review the error logs for specific details

Happy coding! 🚀
