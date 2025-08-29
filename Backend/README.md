# Office Nexus Backend

A comprehensive backend API for Rwanda business management system with authentication, company management, tax calculations, and compliance tracking.

## Features

- 🔐 **Authentication & Authorization**: JWT-based auth with role-based access control
- 🏢 **Company Management**: Multi-company support with user associations
- 👥 **Employee Management**: HR functionality with employee records
- 💰 **Tax Management**: VAT, Corporate Tax, RSSB calculations and returns
- 📊 **Accounting**: Financial transactions, ledgers, and reports
- ✅ **Compliance**: Regulatory compliance tracking and alerts
- 🔔 **Notifications**: Real-time notifications and alerts
- 📈 **Reports**: Comprehensive reporting and analytics
- 🔄 **Real-time**: Socket.io for live updates
- ⚡ **Background Jobs**: (temporarily disabled)

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Redis (disabled)

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd Backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

3. **Database setup:**
   ```bash
   # Create database and run migrations
   npm run migrate
   
   # Seed with test data
   npm run seed
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Reset password

### Companies
- `GET /api/v1/companies` - Get user's companies
- `POST /api/v1/companies` - Create company
- `GET /api/v1/companies/:id` - Get company details
- `PUT /api/v1/companies/:id` - Update company
- `DELETE /api/v1/companies/:id` - Delete company

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update profile
- `GET /api/v1/users` - Get all users (admin only)
- `PUT /api/v1/users/:id` - Update user (admin only)

### Employees
- `GET /api/v1/employees` - Get company employees
- `POST /api/v1/employees` - Create employee
- `GET /api/v1/employees/:id` - Get employee details
- `PUT /api/v1/employees/:id` - Update employee
- `DELETE /api/v1/employees/:id` - Delete employee

### Tax
- `GET /api/v1/tax/returns` - Get tax returns
- `POST /api/v1/tax/returns` - Create tax return
- `GET /api/v1/tax/rates` - Get tax rates
- `POST /api/v1/tax/calculate` - Calculate tax
- `GET /api/v1/tax/deadlines` - Get tax deadlines

### Accounting
- `GET /api/v1/accounting/transactions` - Get transactions
- `POST /api/v1/accounting/transactions` - Create transaction
- `GET /api/v1/accounting/ledger` - Get general ledger
- `GET /api/v1/accounting/trial-balance` - Get trial balance

### Compliance
- `GET /api/v1/compliance/alerts` - Get compliance alerts
- `GET /api/v1/compliance/status` - Get compliance status
- `POST /api/v1/compliance/alerts/:id/complete` - Mark alert complete

### Notifications
- `GET /api/v1/notifications` - Get notifications
- `PUT /api/v1/notifications/:id/read` - Mark notification read
- `PUT /api/v1/notifications/read-all` - Mark all read

### Reports
- `GET /api/v1/reports` - Get reports
- `POST /api/v1/reports/generate` - Generate report
- `GET /api/v1/reports/available-types` - Get report types

## Test Data

The system comes with hardcoded test data for development:

### Test Users
- **Admin**: `admin@test.com` / `Admin123!`
- **Owner**: `john@test.com` / `John123!`

### Test Company
- **Tech Solutions Rwanda Ltd** with TIN: `123456789`

## Development

### Running Tests
```bash
npm test
```

### Database Seeding
```bash
npm run seed
```

### Linting
```bash
npm run lint
```

## Environment Variables

Key environment variables:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=office_nexus_dev
DB_USER=postgres
DB_PASSWORD=password123

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# (Redis disabled)
```

## Architecture

- **Models**: Sequelize ORM with User and Company models
- **Routes**: Express.js RESTful API routes
- **Middleware**: Authentication, validation, error handling
- **Real-time**: Socket.io for live updates
- **Background Jobs**: Bull queue with Redis
- **Security**: Helmet, CORS, rate limiting

## License

MIT License
