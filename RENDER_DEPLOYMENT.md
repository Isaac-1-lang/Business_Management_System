# Render.com Deployment Guide

This guide will help you deploy your Office Nexus application to Render.com.

## Prerequisites

1. **Render.com Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Neon Database**: You already have this set up
4. **Redis**: You'll need a Redis instance (Render provides this)

## Step 1: Set up Redis on Render

1. Go to your Render dashboard
2. Click "New +" → "Redis"
3. Choose a name (e.g., `office-nexus-redis`)
4. Select a plan (Free tier works for development)
5. Click "Create Redis"
6. Copy the **Internal Database URL** (you'll need this for the backend)

## Step 2: Deploy Backend API

### Option A: Using render.yaml (Recommended)

1. **Update the render.yaml file** in the `Backend` directory:
   - Replace `your-backend-service-name` with your actual service name
   - Update the `REDIS_URL` with your Redis instance URL

2. **Connect your GitHub repository**:
   - Go to Render dashboard
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository
   - Render will automatically detect the `render.yaml` file

### Option B: Manual Setup

1. **Create a new Web Service**:
   - Go to Render dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `Backend` directory as the root directory

2. **Configure the service**:
   - **Name**: `office-nexus-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm ci`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`

3. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=your-neon-database-url
   JWT_SECRET=your-jwt-secret
   JWT_REFRESH_SECRET=your-jwt-refresh-secret
   FRONTEND_URL=https://your-frontend-service-name.onrender.com
   REDIS_URL=your-redis-url-from-step-1
   ```

## Step 3: Deploy Frontend

### Option A: Using render.yaml (Recommended)

1. **Update the render.yaml file** in the `office-nexus-schema` directory:
   - Replace `your-backend-service-name` with your actual backend service name

2. **Create a new Static Site**:
   - Go to Render dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Select the `office-nexus-schema` directory as the root directory

### Option B: Manual Setup

1. **Create a new Static Site**:
   - Go to Render dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Select the `office-nexus-schema` directory

2. **Configure the service**:
   - **Name**: `office-nexus-frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`

3. **Add Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-service-name.onrender.com
   VITE_WS_URL=wss://your-backend-service-name.onrender.com
   VITE_APP_NAME=Office Nexus
   VITE_APP_VERSION=1.0.0
   VITE_APP_ENVIRONMENT=production
   VITE_ENABLE_ANALYTICS=false
   VITE_ENABLE_DEBUG=false
   VITE_ENABLE_SOCKET=true
   ```

## Step 4: Update CORS Settings

After deploying the backend, you need to update the CORS settings to allow your frontend domain:

1. **In your backend code** (`Backend/src/server.js`), update the CORS configuration:
   ```javascript
   app.use(cors({
     origin: [
       'https://your-frontend-service-name.onrender.com',
       'http://localhost:3000' // for local development
     ],
     credentials: true
   }));
   ```

2. **Redeploy the backend** after making this change.

## Step 5: Test Your Deployment

1. **Backend Health Check**: Visit `https://your-backend-service-name.onrender.com/health`
2. **Frontend**: Visit `https://your-frontend-service-name.onrender.com`
3. **Test Registration/Login**: Try creating a new account and logging in

## Environment Variables Reference

### Backend Environment Variables
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
FRONTEND_URL=https://your-frontend-service-name.onrender.com
REDIS_URL=redis://username:password@host:port
```

### Frontend Environment Variables
```
VITE_API_URL=https://your-backend-service-name.onrender.com
VITE_WS_URL=wss://your-backend-service-name.onrender.com
VITE_APP_NAME=Office Nexus
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false
VITE_ENABLE_SOCKET=true
```

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check the build logs in Render dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **Database Connection Issues**:
   - Verify your `DATABASE_URL` is correct
   - Check if your Neon database allows external connections
   - Ensure the database is running

3. **CORS Errors**:
   - Update CORS settings in backend
   - Verify frontend URL is correct in backend CORS configuration

4. **Health Check Failures**:
   - Check if the `/health` endpoint is working
   - Verify the service is starting correctly
   - Check application logs

### Useful Commands

- **View Logs**: Use the Render dashboard to view real-time logs
- **Redeploy**: Use the "Manual Deploy" button in Render dashboard
- **Environment Variables**: Update them in the Render dashboard under "Environment"

## Cost Considerations

- **Free Tier**: Includes 750 hours/month for web services
- **Static Sites**: Always free
- **Redis**: Free tier available
- **Custom Domains**: Available on paid plans

## Security Notes

1. **Environment Variables**: Never commit secrets to your repository
2. **HTTPS**: Render provides automatic HTTPS
3. **CORS**: Configure CORS properly to prevent unauthorized access
4. **Rate Limiting**: Your backend already includes rate limiting

## Next Steps

After successful deployment:

1. **Set up a custom domain** (optional)
2. **Configure monitoring** and alerts
3. **Set up CI/CD** for automatic deployments
4. **Configure backups** for your database
5. **Set up logging** and analytics

Your Office Nexus application should now be live on Render.com! 🚀
