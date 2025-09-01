#!/bin/bash

# Office Nexus Deployment Script
# This script deploys both backend and frontend to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="Backend"
FRONTEND_DIR="office-nexus-schema"
DOCKER_REGISTRY="your-registry.com"
PROJECT_NAME="office-nexus"

# Function to print colored output
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    print_success "All prerequisites are met!"
}

# Build and deploy backend
deploy_backend() {
  print_status "Deploying backend..."
  
  cd "$BACKEND_DIR"
  
  # Check if .env file exists
  if [ ! -f ".env" ]; then
    print_warning "Backend .env file not found. Creating from example..."
    if [ -f "env.example" ]; then
      cp env.example .env
      print_warning "Please edit Backend/.env with your configuration before continuing."
      print_warning "Press Enter to continue or Ctrl+C to abort..."
      read -r
    else
      print_error "No .env file or env.example found. Please create Backend/.env manually."
      exit 1
    fi
  fi
    
    # Build Docker image
    print_status "Building backend Docker image..."
    docker build -t "$PROJECT_NAME-backend:latest" .
    
    # Run database migrations
    print_status "Running database migrations..."
    docker run --rm --env-file .env "$PROJECT_NAME-backend:latest" npm run migrate
    
    # Start backend services
    print_status "Starting backend services..."
    docker-compose up -d backend redis
    
    cd ..
    print_success "Backend deployed successfully!"
}

# Build and deploy frontend
deploy_frontend() {
  print_status "Deploying frontend..."
  
  cd "$FRONTEND_DIR"
  
  # Check if .env file exists
  if [ ! -f ".env" ]; then
    print_warning "Frontend .env file not found. Creating from example..."
    if [ -f "env.example" ]; then
      cp env.example .env
      print_warning "Please edit office-nexus-schema/.env with your configuration before continuing."
      print_warning "Press Enter to continue or Ctrl+C to abort..."
      read -r
    else
      print_error "No .env file or env.example found. Please create office-nexus-schema/.env manually."
      exit 1
    fi
  fi
    
    # Build Docker image
    print_status "Building frontend Docker image..."
    docker build -t "$PROJECT_NAME-frontend:latest" .
    
    # Start frontend service
    print_status "Starting frontend service..."
    docker-compose up -d frontend
    
    cd ..
    print_success "Frontend deployed successfully!"
}

# Deploy everything
deploy_all() {
    print_status "Starting full deployment..."
    
    check_prerequisites
    deploy_backend
    deploy_frontend
    
    print_success "Full deployment completed!"
    print_status "Your application should be available at: http://localhost"
    print_status "Backend API: http://localhost:5000"
}

# Health check
health_check() {
  print_status "Performing health checks..."
  
  # Wait a bit for services to start
  sleep 5
  
  # Check backend health
  if curl -f http://localhost:5000/health >/dev/null 2>&1; then
    print_success "Backend is healthy!"
  else
    print_warning "Backend health check failed! Service might still be starting..."
    return 1
  fi
  
  # Check frontend health (only if frontend is deployed)
  if curl -f http://localhost/health >/dev/null 2>&1; then
    print_success "Frontend is healthy!"
  else
    print_warning "Frontend health check failed! Service might not be deployed or still starting..."
  fi
  
  print_success "Health checks completed!"
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    
    # Stop and remove containers
    cd "$BACKEND_DIR"
    docker-compose down
    cd ..
    
    cd "$FRONTEND_DIR"
    docker-compose down
    cd ..
    
    # Remove unused images
    docker image prune -f
    
    print_success "Cleanup completed!"
}

# Show logs
show_logs() {
    print_status "Showing logs..."
    
    cd "$BACKEND_DIR"
    docker-compose logs -f
}

# Main script logic
case "${1:-}" in
  "backend")
    check_prerequisites
    deploy_backend
    ;;
  "frontend")
    check_prerequisites
    deploy_frontend
    ;;
  "all")
    deploy_all
    ;;
  "health")
    health_check
    ;;
  "cleanup")
    cleanup
    ;;
  "logs")
    show_logs
    ;;
  "migrate")
    print_status "Running database migrations..."
    cd "$BACKEND_DIR"
    if [ -f ".env" ]; then
      docker run --rm --env-file .env "$PROJECT_NAME-backend:latest" npm run migrate
    else
      print_error "Backend .env file not found. Please run './deploy.sh backend' first."
      exit 1
    fi
    ;;
  *)
    echo "Usage: $0 {backend|frontend|all|health|cleanup|logs|migrate}"
    echo ""
    echo "Commands:"
    echo "  backend   - Deploy only the backend"
    echo "  frontend  - Deploy only the frontend"
    echo "  all       - Deploy both backend and frontend"
    echo "  health    - Perform health checks"
    echo "  cleanup   - Clean up containers and images"
    echo "  logs      - Show application logs"
    echo "  migrate   - Run database migrations only"
    exit 1
    ;;
esac
