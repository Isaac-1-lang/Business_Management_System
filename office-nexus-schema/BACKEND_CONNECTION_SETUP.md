# Backend Connection Setup

This guide will help you connect your frontend to the deployed backend at `https://intoffice.onrender.com`.

## Quick Setup

### Option 1: Automated Setup (Recommended)
Run the setup script to automatically configure everything:

```bash
cd office-nexus-schema
node setup-backend-connection.js
```

### Option 2: Manual Setup
1. Create a `.env` file in the `office-nexus-schema` directory
2. Add the following content:

```env
# API Configuration - Connected to Deployed Backend
VITE_API_URL=https://intoffice.onrender.com/api/v1

# App Configuration
VITE_APP_NAME=Office Nexus
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_SOCKET_IO=true
VITE_ENABLE_REAL_TIME_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=false

# Development
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

## What This Does

- **API Endpoint**: Your frontend will now make API calls to `https://intoffice.onrender.com/api/v1`
- **CORS**: The backend is already configured to accept requests from your frontend
- **Authentication**: All auth endpoints will work with the deployed backend
- **Real-time**: WebSocket connections will work for notifications and live updates

## Testing the Connection

After setup, you can test the connection by:

1. Starting the frontend: `npm run dev`
2. Opening the browser console
3. Looking for successful API calls to the backend
4. Checking the Network tab for successful requests

## Backend Endpoints

Your deployed backend provides these main endpoints:

- **Health Check**: `GET /health`
- **Authentication**: `POST /auth/login`, `POST /auth/register`
- **Users**: `GET /users/me`, `PUT /users/:id`
- **Companies**: `GET /companies`, `POST /companies`
- **Employees**: `GET /employees`, `POST /employees`
- **Tax**: `GET /tax/returns`, `POST /tax/calculate`
- **Compliance**: `GET /compliance/alerts`
- **Reports**: `GET /reports`, `POST /reports/generate`

## Troubleshooting

### Connection Issues
- Ensure the backend is running (check `https://intoffice.onrender.com/health`)
- Check browser console for CORS errors
- Verify the `.env` file is in the correct location

### API Errors
- Check the backend logs for any errors
- Verify the API endpoints match between frontend and backend
- Check authentication tokens are being sent correctly

### Development vs Production
- The `.env` file is for local development
- For production builds, use `env.production.example` as a template
- Update `VITE_API_URL` in production to match your production backend

## Next Steps

1. ✅ Run the setup script or create the `.env` file
2. 🚀 Start the frontend: `npm run dev`
3. 🔐 Test login/registration functionality
4. 📊 Verify data is loading from the backend
5. 🎉 Your frontend is now connected to the deployed backend!

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify the backend is accessible at `https://intoffice.onrender.com`
3. Check the Network tab in browser dev tools for failed requests
4. Review the backend logs for any server-side errors
