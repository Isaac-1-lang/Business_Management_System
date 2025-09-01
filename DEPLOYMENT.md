# 🚀 Office Nexus Deployment Guide

This guide covers deploying the Office Nexus application (both backend and frontend) to production environments.

## 📋 Prerequisites

Before deploying, ensure you have the following installed:

- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **Node.js** (v18.0+)
- **Git**

## 🏗️ Architecture Overview

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

## 🔧 Environment Setup

### Backend Environment Variables

Create a `.env` file in the `Backend/` directory:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here

# Application Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=http://localhost

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload Configuration (optional)
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

### Frontend Environment Variables

Create a `.env` file in the `office-nexus-schema/` directory:

```bash
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000

# Application Configuration
VITE_APP_NAME=Office Nexus
VITE_APP_VERSION=1.0.0
```

## 🐳 Docker Deployment

### Quick Start

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
   
   # Edit the files with your configuration
   nano Backend/.env
   nano office-nexus-schema/.env
   ```

3. **Deploy everything:**
   ```bash
   ./deploy.sh all
   ```

### Individual Services

- **Deploy backend only:**
  ```bash
  ./deploy.sh backend
  ```

- **Deploy frontend only:**
  ```bash
  ./deploy.sh frontend
  ```

- **Health checks:**
  ```bash
  ./deploy.sh health
  ```

- **View logs:**
  ```bash
  ./deploy.sh logs
  ```

- **Cleanup:**
  ```bash
  ./deploy.sh cleanup
  ```

## 🌐 Production Deployment

### Cloud Platforms

#### 1. **AWS (EC2 + RDS)**

```bash
# Install Docker on EC2
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Deploy application
./deploy.sh all
```

#### 2. **Google Cloud Platform (GCE)**

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Deploy application
./deploy.sh all
```

#### 3. **DigitalOcean Droplet**

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Deploy application
./deploy.sh all
```

### SSL/HTTPS Setup

1. **Install Certbot:**
   ```bash
   sudo apt-get update
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Get SSL certificate:**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Update Nginx configuration** (see `Backend/nginx.conf`)

## 📊 Monitoring & Logging

### Health Checks

The application provides health check endpoints:

- **Backend:** `http://localhost:5000/health`
- **Frontend:** `http://localhost/health`

### Logs

View application logs:

```bash
# Backend logs
cd Backend
docker-compose logs -f backend

# Frontend logs
cd office-nexus-schema
docker-compose logs -f frontend

# All logs
./deploy.sh logs
```

### Performance Monitoring

Consider setting up:

- **Prometheus + Grafana** for metrics
- **ELK Stack** for log aggregation
- **Uptime Robot** for uptime monitoring

## 🔒 Security Considerations

### Environment Variables

- ✅ Use strong, unique secrets for JWT keys
- ✅ Store sensitive data in environment variables
- ✅ Never commit `.env` files to version control
- ✅ Use different secrets for different environments

### Network Security

- ✅ Configure firewall rules
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Set up proper CORS policies

### Database Security

- ✅ Use connection pooling
- ✅ Implement proper authentication
- ✅ Regular backups
- ✅ Monitor for suspicious activity

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   sudo netstat -tulpn | grep :5000
   
   # Kill the process
   sudo kill -9 <PID>
   ```

2. **Database connection failed:**
   - Check `DATABASE_URL` in `.env`
   - Ensure database is accessible
   - Verify network connectivity

3. **Docker build fails:**
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker build --no-cache -t office-nexus-backend .
   ```

4. **Memory issues:**
   ```bash
   # Increase Docker memory limit
   # Edit Docker Desktop settings or docker daemon config
   ```

### Debug Mode

Enable debug logging:

```bash
# Backend
export DEBUG=*
cd Backend
docker-compose up

# Frontend
cd office-nexus-schema
npm run dev
```

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale backend services
cd Backend
docker-compose up -d --scale backend=3

# Use load balancer (Nginx)
# Update nginx.conf with multiple backend servers
```

### Vertical Scaling

- Increase container memory limits
- Optimize database queries
- Use CDN for static assets
- Implement caching strategies

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          script: |
            cd /path/to/office-nexus
            git pull origin main
            ./deploy.sh all
```

## 📞 Support

For deployment issues:

1. Check the logs: `./deploy.sh logs`
2. Verify environment variables
3. Test connectivity to external services
4. Review this documentation
5. Create an issue in the repository

## 📝 Maintenance

### Regular Tasks

- **Daily:** Monitor logs and health checks
- **Weekly:** Review performance metrics
- **Monthly:** Update dependencies
- **Quarterly:** Security audit
- **Annually:** Full system review

### Backup Strategy

```bash
# Database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Application backup
tar -czf app_backup_$(date +%Y%m%d).tar.gz Backend/ office-nexus-schema/
```

---

**🎉 Congratulations!** Your Office Nexus application is now deployed and ready for production use.
