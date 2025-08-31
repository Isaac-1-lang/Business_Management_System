#!/bin/bash

# Render.com Deployment Preparation Script
# This script helps prepare your application for Render deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "Preparing for Render.com deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_error "Git repository not found. Please initialize git and push to GitHub first."
    exit 1
fi

# Check if files exist
if [ ! -f "Backend/render.yaml" ]; then
    print_error "Backend/render.yaml not found!"
    exit 1
fi

if [ ! -f "office-nexus-schema/render.yaml" ]; then
    print_error "office-nexus-schema/render.yaml not found!"
    exit 1
fi

print_success "Render configuration files found!"

# Check if .env files exist
if [ ! -f "Backend/.env" ]; then
    print_warning "Backend/.env not found. You'll need to set environment variables in Render dashboard."
fi

if [ ! -f "office-nexus-schema/.env" ]; then
    print_warning "office-nexus-schema/.env not found. You'll need to set environment variables in Render dashboard."
fi

print_status "Checking package.json files..."

# Check backend package.json
if [ ! -f "Backend/package.json" ]; then
    print_error "Backend/package.json not found!"
    exit 1
fi

# Check frontend package.json
if [ ! -f "office-nexus-schema/package.json" ]; then
    print_error "office-nexus-schema/package.json not found!"
    exit 1
fi

print_success "All required files found!"

print_status "Preparing deployment checklist..."

echo ""
echo "=========================================="
echo "RENDER.COM DEPLOYMENT CHECKLIST"
echo "=========================================="
echo ""
echo "1. ✅ Render configuration files created"
echo "2. ✅ CORS settings updated for Render domains"
echo "3. ✅ Health check endpoint configured"
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for Render deployment'"
echo "   git push origin main"
echo ""
echo "2. Set up Redis on Render:"
echo "   - Go to Render dashboard"
echo "   - Create new Redis service"
echo "   - Copy the Internal Database URL"
echo ""
echo "3. Deploy Backend:"
echo "   - Go to Render dashboard"
echo "   - Create new Web Service"
echo "   - Connect your GitHub repository"
echo "   - Set root directory to 'Backend'"
echo "   - Add environment variables:"
echo "     * NODE_ENV=production"
echo "     * PORT=10000"
echo "     * DATABASE_URL=your-neon-url"
echo "     * JWT_SECRET=your-secret"
echo "     * JWT_REFRESH_SECRET=your-refresh-secret"
echo "     * FRONTEND_URL=https://your-frontend-service.onrender.com"
echo "     * REDIS_URL=your-redis-url"
echo ""
echo "4. Deploy Frontend:"
echo "   - Go to Render dashboard"
echo "   - Create new Static Site"
echo "   - Connect your GitHub repository"
echo "   - Set root directory to 'office-nexus-schema'"
echo "   - Add environment variables:"
echo "     * VITE_API_URL=https://your-backend-service.onrender.com"
echo "     * VITE_WS_URL=wss://your-backend-service.onrender.com"
echo ""
echo "5. Update CORS settings after getting your frontend URL"
echo ""
echo "6. Test your deployment!"
echo ""
echo "For detailed instructions, see: RENDER_DEPLOYMENT.md"
echo "=========================================="

print_success "Deployment preparation completed!"
print_status "Follow the checklist above to deploy to Render.com"
