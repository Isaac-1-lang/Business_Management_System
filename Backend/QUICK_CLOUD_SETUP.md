# Quick Cloud Database Setup

## 🚀 Get Started in 5 Minutes

### Step 1: Choose Your Provider

**Recommended: Neon (Best Free Tier)**
- Go to [neon.tech](https://neon.tech)
- Sign up with GitHub
- Create a new project
- Copy connection details

### Step 2: Run Setup Script

```bash
cd Backend
npm install
npm run setup-db
```

Follow the interactive prompts to configure your database.

### Step 3: Test Connection

```bash
npm run dev
```

You should see:
```
✅ Database connection established successfully.
📍 Connected to: your-host:port/database-name
✅ Database synchronized successfully.
```

## Alternative: Manual Setup

### 1. Create .env File
```bash
cd Backend
cp env.example .env
```

### 2. Update Database Settings
Edit `.env` and uncomment one of the cloud options:

**For Neon:**
```bash
DB_HOST=ep-cool-name-123456.us-east-2.aws.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=your_neon_user
DB_PASSWORD=your_neon_password
DB_DIALECT=postgres
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

**For Supabase:**
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

### 3. Start Application
```bash
npm run dev
```

## Need Help?

- Check `CLOUD_DATABASE_SETUP.md` for detailed instructions
- Run `npm run setup-db` for interactive setup
- Verify your connection details
- Ensure SSL is enabled for cloud databases

## Next Steps

Once connected, you can:
1. Start building Rwanda-specific features
2. Implement tax calculation engine
3. Set up employee management
4. Create compliance tracking
5. Build notification system

Happy coding! 🎉
