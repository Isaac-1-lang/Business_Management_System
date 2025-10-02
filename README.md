# 🏢 Office Nexus · Rwanda Business Management System

Office Nexus is a full‑stack business management platform tailored for Rwandan SMEs. It centralizes accounting, HR, tax compliance, reporting, and governance — with multi‑company support, strong security, and real‑time updates.

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
   # Backend/.env
   #   - DATABASE_URL, JWT_SECRET, PORT, FRONTEND_URL
   # Frontend/.env
   #   - VITE_API_URL (include /api/v1), VITE_WS_URL
   ```

3. **Deploy everything:**
   ```bash
   ./deploy.sh all
   ```

4. **Access the application:**
   - Frontend: http://localhost (or Vite dev at http://localhost:5173)
   - Backend API: http://localhost:5000/api/v1

## 📋 Features

### 🏢 Business Management
- **Multi-company support** - Manage multiple businesses
- **Company registration** - Complete business setup
- **Document management** - Store and organize business documents

### 💰 Financial & Tax Management
- **Double‑entry accounting** with general ledger and trial balance
- **Rwanda‑specific taxes** (VAT, PAYE/RSSB, corporate tax)
- **Financial statements** and KPI dashboards
- **Universal Transaction System (UTS)** for consistent posting

### 👥 HR Management
- **Employee management** - Complete employee lifecycle
- **Payroll system** - Automated salary calculations
- **Leave management** - Track employee time off
- **Performance tracking** - Employee evaluations

### 📊 Compliance & Reporting
- **Tax & regulatory** workflows and alerts
- **Audit logs** and activity trails
- **Reports** for finance, HR, and compliance

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
- **Node.js + Express**
- **Sequelize** (PostgreSQL)
- **Redis** (caching, sessions)
- **JWT Auth**
- **Socket.io** (real‑time)

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

### 2. Manual (dev-friendly)
```bash
# Backend
cd Backend
npm install
npm run dev

# Frontend
cd office-nexus-schema
npm install
npm run dev
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
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api/v1
VITE_WS_URL=ws://localhost:5000
VITE_APP_NAME=Office Nexus
```

## 📊 API Overview (prefix: `/api/v1`)

### Authentication
- `POST /auth/register` – User registration
- `POST /auth/login` – User login
- `POST /auth/logout` – Logout
- `POST /auth/refresh` – Refresh token

### Companies
- `GET /companies` – List companies
- `POST /companies` – Create company
- `GET /companies/:id` – Company details
- `PUT /companies/:id` – Update company

### Employees
- `GET /employees` – List employees
- `POST /employees` – Create employee
- `GET /employees/:id` – Employee details
- `PUT /employees/:id` – Update employee

### Accounting
- `GET /accounting/transactions` – List transactions (filters: type, dates, pagination)
- `GET /accounting/transactions/:id` – Transaction details
- `POST /accounting/transactions` – Create transaction
- `GET /accounting/ledger` – General ledger
- `GET /accounting/trial-balance` – Trial balance
- `GET /accounting/stats` – Statistics

### Dividends
- `GET /dividends` – List dividend declarations
- `POST /dividends` – Create declaration
- `POST /dividends/:id/confirm` – Confirm declaration
- `POST /dividends/:id/distributions/calculate` – Calculate distributions
- `GET /dividends/:id/distributions` – List distributions
- `POST /dividends/distributions/:distributionId/pay` – Mark distribution paid

### Compliance
- `GET /compliance/alerts` – Compliance alerts
- `GET /compliance/status` – Compliance status
- `POST /compliance/alerts/:id/complete` – Mark alert complete

## 🔒 Security

- **JWT auth** with refresh tokens
- **Rate limiting** and CORS hardening
- **Input validation** on all critical routes
- **Sequelize** parameterization (SQLi protection)
- **Helmet** CSP for XSS mitigation

## 📈 Performance

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
- ✅ Auth & multi‑company
- ✅ Company & employee management
- ✅ Accounting transactions, ledger, TB
- ✅ Backend‑backed dividends

### Phase 2 (Next)
- 🔄 Replace remaining local storage with DB APIs (assets, meetings, invoices, ownership)
- 🔄 Advanced reporting & dashboards
- 🔄 Document AI for OCR/extraction
- 🔄 Mobile app

### Phase 3 (Future)
- 📋 AI assistant (RAG over company docs + actions)
- 📋 Predictive analytics & anomaly detection
- 📋 Multi‑language support
- 📋 Third‑party integrations

---

Notes
- Business data is persisted in the backend database; the app no longer relies on browser localStorage for core records.
- The frontend expects `VITE_API_URL` to point to the versioned API base (e.g., `http://localhost:5000/api/v1`).

---

**🏢 Office Nexus** - Empowering Rwandan businesses with modern management tools.
