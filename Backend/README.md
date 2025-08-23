# 🚀 Office Nexus Backend - Rwanda Business Management System

## 📋 Overview

This is the backend API for the Office Nexus Schema project, a comprehensive business management system designed specifically for Rwanda businesses. The system handles company management, tax calculations, compliance tracking, HR operations, and financial management.

## 🏗️ Architecture

### **Technology Stack**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Cache**: Redis for sessions and real-time features
- **Authentication**: JWT with bcrypt password hashing
- **Real-time**: Socket.io for notifications
- **Background Jobs**: Bull Queue with Redis
- **Validation**: Express-validator with custom schemas
- **Security**: Helmet, CORS, rate limiting

### **Key Features**
- 🔐 **Multi-company authentication** with role-based access control
- 🏢 **Rwanda-specific business rules** (TIN, VAT, RSSB, RDB)
- 📊 **Real-time notifications** via WebSocket
- 💰 **Tax calculation engine** with current Rwanda rates
- 📅 **Compliance calendar** with automated reminders
- 👥 **HR management** with employee records
- 📈 **Financial reporting** and analytics
- 🌍 **Multi-currency support** (RWF, USD, EUR)

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ or Bun
- PostgreSQL 12+
- Redis 6+
- Git

### **Installation**

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Backend
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Environment Setup**
```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
nano .env
```

4. **Database Setup**
```bash
# Create PostgreSQL database
createdb office_nexus_rw

# Run migrations (in development, tables are auto-created)
npm run migrate
```

5. **Start the server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## ⚙️ Configuration

### **Environment Variables**

```bash
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=office_nexus_rw
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

# Rwanda Tax Rates
VAT_RATE=18
CORPORATE_TAX_RATE=30
WITHHOLDING_TAX_RATE=15
RSSB_EMPLOYEE_RATE=5
RSSB_EMPLOYER_RATE=10
```

## 🗄️ Database Schema

### **Core Tables**
- **users** - User accounts and authentication
- **companies** - Business entities and compliance
- **employees** - HR records and payroll
- **tax_returns** - Tax submissions and calculations
- **financial_transactions** - Accounting and bookkeeping
- **compliance_deadlines** - Regulatory requirements
- **notifications** - System alerts and reminders

### **Rwanda-Specific Fields**
- **TIN** (Tax Identification Number)
- **VAT Number** and registration status
- **RDB Registration** details
- **RSSB Status** and contributions
- **Local Address** format (District, Sector, Cell)
- **Fiscal Year** configuration
- **Currency** preferences (RWF primary)

## 🔌 API Endpoints

### **Authentication** (`/api/v1/auth`)
- `POST /register` - User registration
- `POST /login` - User authentication
- `POST /logout` - User logout
- `POST /refresh` - Token refresh
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset
- `POST /verify-email` - Email verification

### **Companies** (`/api/v1/companies`)
- `GET /` - List companies
- `POST /` - Create company
- `GET /:id` - Get company details
- `PUT /:id` - Update company
- `DELETE /:id` - Delete company
- `GET /:id/compliance` - Compliance status
- `GET /:id/tax-summary` - Tax summary

### **Users** (`/api/v1/users`)
- `GET /` - List users
- `POST /` - Create user
- `GET /:id` - Get user profile
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user
- `GET /:id/permissions` - User permissions

### **Tax Management** (`/api/v1/tax`)
- `GET /vat-calculator` - VAT calculation
- `POST /vat-return` - Submit VAT return
- `GET /corporate-tax` - Corporate tax info
- `POST /corporate-tax-return` - Submit corporate tax
- `GET /withholding-tax` - Withholding tax info
- `GET /compliance-deadlines` - Upcoming deadlines

### **Accounting** (`/api/v1/accounting`)
- `GET /general-ledger` - General ledger entries
- `POST /transaction` - Create transaction
- `GET /trial-balance` - Trial balance
- `GET /income-statement` - Income statement
- `GET /balance-sheet` - Balance sheet
- `GET /cash-flow` - Cash flow statement

### **Compliance** (`/api/v1/compliance`)
- `GET /status` - Overall compliance status
- `GET /deadlines` - Upcoming deadlines
- `GET /alerts` - Compliance alerts
- `POST /reminder` - Set compliance reminder
- `GET /reports` - Compliance reports

### **Notifications** (`/api/v1/notifications`)
- `GET /` - List notifications
- `POST /` - Create notification
- `PUT /:id/read` - Mark as read
- `DELETE /:id` - Delete notification
- `GET /preferences` - Notification preferences
- `PUT /preferences` - Update preferences

## 🔐 Authentication & Authorization

### **JWT Tokens**
- **Access Token**: Short-lived (7 days) for API access
- **Refresh Token**: Long-lived (30 days) for token renewal
- **Token Blacklisting**: Secure logout with Redis

### **User Roles**
- **admin** - System administrator
- **owner** - Company owner
- **manager** - Business manager
- **accountant** - Financial professional
- **hr** - Human resources
- **employee** - Regular employee
- **viewer** - Read-only access

### **Permissions System**
- **user:read/write/delete** - User management
- **company:read/write/delete** - Company management
- **tax:read/write** - Tax operations
- **accounting:read/write** - Financial operations
- **reports:read/write** - Reporting access

## 📱 Real-time Features

### **Socket.io Integration**
- **Company Rooms**: Users join company-specific channels
- **Real-time Notifications**: Instant delivery of alerts
- **Live Updates**: Dashboard data synchronization
- **User Presence**: Online/offline status tracking

### **Notification Channels**
- **In-app**: Real-time dashboard notifications
- **Email**: SMTP integration for important alerts
- **SMS**: Twilio integration for urgent messages
- **Push**: Firebase Cloud Messaging

## 🧮 Tax Calculation Engine

### **VAT Calculations**
- **Standard Rate**: 18% (Rwanda)
- **Zero Rate**: Exports and specific goods
- **Exempt**: Financial services, education
- **Threshold**: 20M RWF annual turnover

### **Corporate Tax**
- **Rate**: 30% for resident companies
- **Fiscal Year**: January 1 - December 31
- **Deadline**: 90 days after fiscal year end
- **Provisional Payments**: Quarterly installments

### **RSSB Contributions**
- **Employee**: 5% of gross salary
- **Employer**: 10% of gross salary
- **Deadline**: 15th of following month
- **Coverage**: Health, pension, occupational risks

## 📊 Compliance Management

### **Automated Tracking**
- **VAT Returns**: Monthly submission reminders
- **Corporate Tax**: Annual filing deadlines
- **RSSB**: Monthly contribution tracking
- **Business License**: Renewal notifications

### **Compliance Status**
- **Compliant**: All requirements met
- **Non-compliant**: Overdue submissions
- **Pending**: Upcoming deadlines
- **Under Review**: Submissions being processed

## 🚀 Development

### **Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data
```

### **Code Structure**
```
src/
├── models/          # Database models
├── routes/          # API endpoints
├── middleware/      # Custom middleware
├── services/        # Business logic
├── database/        # Database connections
├── socket/          # Real-time features
├── queue/           # Background jobs
├── utils/           # Helper functions
└── config/          # Configuration files
```

### **Adding New Features**
1. **Create Model** in `src/models/`
2. **Add Routes** in `src/routes/`
3. **Implement Services** in `src/services/`
4. **Add Validation** with express-validator
5. **Update Tests** in test directory

## 🧪 Testing

### **Test Setup**
```bash
# Install test dependencies
npm install --save-dev jest supertest

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### **Test Structure**
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: Model and query testing
- **Authentication Tests**: JWT and permissions

## 🚀 Deployment

### **Production Setup**
```bash
# Build the application
npm run build

# Set production environment
NODE_ENV=production

# Use PM2 for process management
npm install -g pm2
pm2 start ecosystem.config.js
```

### **Environment Variables**
- **Database**: Production PostgreSQL instance
- **Redis**: Production Redis cluster
- **JWT**: Strong secret keys
- **CORS**: Restrict to production domains
- **Rate Limiting**: Stricter limits

### **Monitoring**
- **Health Checks**: `/health` endpoint
- **Logging**: Structured logging with Winston
- **Metrics**: Performance monitoring
- **Error Tracking**: Sentry integration

## 🔒 Security Features

### **Authentication Security**
- **Password Hashing**: bcrypt with 12 rounds
- **JWT Security**: Secure token storage
- **Session Management**: Redis-based sessions
- **Rate Limiting**: API abuse prevention

### **Data Protection**
- **Input Validation**: Comprehensive validation
- **SQL Injection**: Sequelize ORM protection
- **XSS Prevention**: Helmet security headers
- **CORS Configuration**: Restricted origins

## 📚 API Documentation

### **Swagger/OpenAPI**
- **Interactive Docs**: `/api-docs` endpoint
- **API Specification**: OpenAPI 3.0 compliant
- **Request/Response Examples**: Detailed examples
- **Authentication**: JWT token integration

### **Postman Collection**
- **Pre-configured Requests**: Ready-to-use
- **Environment Variables**: Easy switching
- **Test Scripts**: Automated testing
- **Documentation**: Request descriptions

## 🤝 Contributing

### **Development Guidelines**
1. **Code Style**: ESLint + Prettier
2. **Git Flow**: Feature branches
3. **Testing**: 80%+ coverage required
4. **Documentation**: JSDoc comments
5. **Security**: Security review required

### **Pull Request Process**
1. **Create Feature Branch**
2. **Implement Changes**
3. **Add Tests**
4. **Update Documentation**
5. **Submit PR**
6. **Code Review**
7. **Merge to Main**

## 📞 Support

### **Getting Help**
- **Documentation**: Check this README first
- **Issues**: GitHub Issues for bugs
- **Discussions**: GitHub Discussions for questions
- **Email**: support@officenexus.rw

### **Common Issues**
- **Database Connection**: Check PostgreSQL status
- **Redis Connection**: Verify Redis server
- **JWT Errors**: Check token expiration
- **CORS Issues**: Verify frontend URL

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Rwanda Revenue Authority** for tax regulations
- **Rwanda Social Security Board** for RSSB guidelines
- **Rwanda Development Board** for business registration
- **Open Source Community** for amazing tools

---

**Built with ❤️ for Rwanda Businesses**

For more information, visit [Office Nexus](https://officenexus.rw)
