# 🏢 Office Nexus - Rwanda Business Management System

A comprehensive business management platform designed specifically for Rwandan businesses, handling tax compliance, accounting, HR management, and regulatory requirements.

## 🚀 Quick Start

### Prerequisites

- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **Node.js** (v18.0+)
- **Git**

### Quick Deployment

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd office-nexus
   ```

2. **Set up environment variables:**
   ```bash
   # Copy example files
   cp Backend/env.example Backend/.env
   cp office-nexus-schema/env.example office-nexus-schema/.env
   
   # Edit with your configuration
   nano Backend/.env
   nano office-nexus-schema/.env
   ```

3. **Deploy everything:**
   ```bash
   ./deploy.sh all
   ```

4. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000

## 📋 Features

### 🏢 Business Management
- **Multi-company support** - Manage multiple businesses
- **Company registration** - Complete business setup
- **Document management** - Store and organize business documents

### 💰 Financial Management
- **Accounting system** - Double-entry bookkeeping
- **Tax calculations** - Rwanda-specific tax compliance
- **Financial reporting** - Comprehensive financial statements
- **Cash flow management** - Track income and expenses

### 👥 HR Management
- **Employee management** - Complete employee lifecycle
- **Payroll system** - Automated salary calculations
- **Leave management** - Track employee time off
- **Performance tracking** - Employee evaluations

### 📊 Compliance & Reporting
- **Tax compliance** - VAT, corporate tax, RSSB
- **Regulatory reporting** - Government requirements
- **Audit trails** - Complete transaction history
- **Compliance alerts** - Deadline notifications

### 🔔 Notifications & Communication
- **Real-time notifications** - Instant updates
- **Email notifications** - Automated alerts
- **System messaging** - Internal communication

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Express)     │◄──►│   (PostgreSQL)  │
│   Port: 80      │    │   Port: 5000    │    │   (Neon/Cloud)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └──────────────►│   Redis         │
                        │   (Caching)     │
                        │   Port: 6379    │
                        └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible components
- **React Router** - Client-side routing
- **React Query** - Server state management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Sequelize** - ORM for database
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **JWT** - Authentication
- **Socket.io** - Real-time communication

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and load balancer
- **PM2** - Process manager

## 📁 Project Structure

```
office-nexus/
├── Backend/                    # Backend API
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── models/            # Database models
│   │   ├── middleware/        # Express middleware
│   │   ├── database/          # Database configuration
│   │   └── socket/            # WebSocket handlers
│   ├── Dockerfile             # Backend container
│   ├── docker-compose.yml     # Backend services
│   └── nginx.conf            # Reverse proxy config
├── office-nexus-schema/        # Frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── contexts/         # React contexts
│   │   └── hooks/            # Custom hooks
│   ├── Dockerfile             # Frontend container
│   └── nginx.conf            # Frontend server config
├── deploy.sh                  # Deployment script
├── DEPLOYMENT.md             # Deployment guide
└── README.md                 # This file
```

## 🚀 Deployment Options

### 1. Docker (Recommended)
```bash
./deploy.sh all
```

### 2. Manual Deployment
```bash
# Backend
cd Backend
npm install
npm start

# Frontend
cd office-nexus-schema
npm install
npm run build
npm run preview
```

### 3. Cloud Platforms
- **AWS EC2** - Virtual servers
- **Google Cloud** - Cloud computing
- **DigitalOcean** - Cloud hosting
- **Heroku** - Platform as a service

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🔧 Development

### Local Development

1. **Backend:**
   ```bash
   cd Backend
   npm install
   npm run dev
   ```

2. **Frontend:**
   ```bash
   cd office-nexus-schema
   npm install
   npm run dev
   ```

### Environment Variables

#### Backend (.env)
```bash
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:8080
```

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
VITE_APP_NAME=Office Nexus
```

## 📊 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh

### Companies
- `GET /api/companies` - List companies
- `POST /api/companies` - Create company
- `GET /api/companies/:id` - Get company details
- `PUT /api/companies/:id` - Update company

### Employees
- `GET /api/employees` - List employees
- `POST /api/employees` - Create employee
- `GET /api/employees/:id` - Get employee details
- `PUT /api/employees/:id` - Update employee

### Accounting
- `GET /api/accounting/transactions` - List transactions
- `POST /api/accounting/transactions` - Create transaction
- `GET /api/accounting/reports` - Financial reports

### Compliance
- `GET /api/compliance/alerts` - Compliance alerts
- `GET /api/compliance/status` - Compliance status
- `POST /api/compliance/alerts/:id/complete` - Mark alert complete

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt encryption
- **Rate Limiting** - API protection
- **CORS Protection** - Cross-origin security
- **Input Validation** - Data sanitization
- **SQL Injection Protection** - ORM usage
- **XSS Protection** - Content security policies

## 📈 Performance Features

- **Database Indexing** - Optimized queries
- **Redis Caching** - Fast data access
- **Gzip Compression** - Reduced bandwidth
- **CDN Ready** - Static asset optimization
- **Lazy Loading** - Code splitting
- **Image Optimization** - Compressed assets

## 🧪 Testing

```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd office-nexus-schema
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Documentation:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues:** [GitHub Issues](https://github.com/your-repo/issues)
- **Email:** support@your-domain.com

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ User authentication
- ✅ Company management
- ✅ Basic accounting
- ✅ Employee management

### Phase 2 (Next)
- 🔄 Advanced reporting
- 🔄 Tax automation
- 🔄 Document management
- 🔄 Mobile app

### Phase 3 (Future)
- 📋 AI-powered insights
- 📋 Multi-language support
- 📋 Advanced analytics
- 📋 Third-party integrations

---

**🏢 Office Nexus** - Empowering Rwandan businesses with modern management tools.
