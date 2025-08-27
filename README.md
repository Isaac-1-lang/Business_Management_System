## Office Nexus — Rwanda Business Management Platform

A modern, end‑to‑end platform for Rwandan businesses covering company management, compliance, HR, accounting, analytics, and reporting. This repository contains both the backend API and the frontend dashboard.

---

## Repository Structure

```
Dashboard/
├── Backend/                 # Node.js/Express API, PostgreSQL, Redis, JWT auth
└── office-nexus-schema/     # React + TypeScript + Vite frontend (Tailwind + shadcn/ui)
```

- Backend details: see `Backend/README.md`
- Frontend details: see `office-nexus-schema/README.md`

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm (or bun/yarn)
- PostgreSQL 12+
- Redis 6+

### 1) Clone
```bash
git clone <your-repo-url>
cd Dashboard
```

### 2) Backend setup
```bash
cd Backend
npm install
cp env.example .env
# Update .env with your local settings
# Create the database and run migrations if applicable
npm run migrate
# Start the API (dev)
npm run dev
# API default: http://localhost:5000
```

### 3) Frontend setup
```bash
cd ../office-nexus-schema
npm install
npm run dev
# App default: http://localhost:5173
```

---

## Environment Configuration

Minimum backend environment variables (see `Backend/env.example` for full list):
```bash
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_NAME=office_nexus_rw
DB_USER=postgres
DB_PASSWORD=your_password

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
```

---

## Key Capabilities

- Authentication and RBAC (multi‑company)
- Company, directors, shareholders, and capital management
- HR and payroll basics with employee records
- Accounting: general ledger, trial balance, invoices, fixed assets
- Rwanda‑specific tax logic (VAT, corporate tax, withholding) and compliance calendar
- Real‑time notifications and system health indicators
- Analytics and rich reporting with export options

---

## Technology Stack

- Backend: Node.js, Express, PostgreSQL (Sequelize), Redis, JWT, Socket.io
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Radix UI
- Tooling: ESLint, Prettier, Jest/Supertest (backend), React Query, React Router

---

## Development Workflow

- Backend (from `Backend/`):
```bash
npm run dev       # start dev server
npm run build     # production build
npm run test      # tests
npm run lint      # linting
```

- Frontend (from `office-nexus-schema/`):
```bash
npm run dev       # start dev server
npm run build     # production build
npm run preview   # preview built app
npm run lint      # linting
```

---

## Running Locally (Summary)

1. Start PostgreSQL and Redis locally
2. Start Backend: `cd Backend && npm run dev`
3. Start Frontend: `cd office-nexus-schema && npm run dev`
4. Open the app at `http://localhost:5173` (the frontend will talk to `http://localhost:${Backend_Port}`)

---

## Deployment Notes

- Build the frontend: `npm run build` in `office-nexus-schema/` and deploy the `dist/` folder to your static host.
- Build and run the backend under a process manager (e.g., PM2) with production environment variables and managed PostgreSQL/Redis services.
- Configure CORS to allow only your production frontend origin.

---

## Contributing

- Please follow the style and guidelines in the sub‑project READMEs.
- Create feature branches, add tests where applicable, and update documentation as needed.
- Open a pull request for review.

---

## License

MIT License. See `Backend/README.md` for details and any service‑specific notes.

---

Built with care for Rwanda businesses.
