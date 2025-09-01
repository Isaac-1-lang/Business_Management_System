module.exports = {
  apps: [
    {
      name: 'office-nexus-backend',
      script: 'src/server.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Monitoring
      watch: false,
      ignore_watch: ['node_modules', 'logs', '*.log'],
      
      // Restart policy
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Environment variables
      env_file: '.env',
      
      // Health check
      health_check_grace_period: 3000,
      
      // Auto restart on file changes (development only)
      watch_delay: 1000,
      
      // Node.js options
      node_args: '--max-old-space-size=1024',
      
      // PM2 options
      pmx: true,
      source_map_support: true,
      
      // Error handling
      autorestart: true,
      cron_restart: '0 2 * * *', // Restart daily at 2 AM
      
      // Metrics
      merge_logs: true,
      
      // Security
      uid: 'nodejs',
      gid: 'nodejs'
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/office-nexus.git',
      path: '/var/www/office-nexus-backend',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
