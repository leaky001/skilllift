# SkillLift Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Docker and Docker Compose installed
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account for file storage
- Paystack account for payments
- Gmail account for email notifications

### 1. Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skilllift
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=secure_password

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here-make-it-very-long-and-random

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend Configuration
VITE_API_URL=https://api.yourdomain.com/api
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key
```

### 2. Docker Deployment

#### Quick Start
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Individual Service Deployment
```bash
# Build backend image
docker build -t skilllift-backend ./backend

# Run backend container
docker run -d \
  --name skilllift-backend \
  -p 5000:5000 \
  --env-file .env \
  skilllift-backend
```

### 3. Production Server Setup

#### Using Nginx as Reverse Proxy

Create `/etc/nginx/sites-available/skilllift`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API Documentation
    location /api-docs {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # File uploads
    location /uploads {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/skilllift /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL Certificate Setup

#### Using Let's Encrypt (Certbot)
```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 5. Database Setup

#### MongoDB Atlas (Recommended)
1. Create a MongoDB Atlas cluster
2. Set up database access (username/password)
3. Configure network access (IP whitelist)
4. Get connection string and update `.env`

#### Local MongoDB
```bash
# Install MongoDB
sudo apt update
sudo apt install mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database and user
mongo
> use skilllift
> db.createUser({
    user: "skilllift_user",
    pwd: "secure_password",
    roles: ["readWrite"]
})
```

### 6. Monitoring and Logging

#### Application Monitoring
```bash
# Install PM2 for process management
npm install -g pm2

# Start application with PM2
pm2 start ecosystem.config.js

# Monitor processes
pm2 monit

# View logs
pm2 logs
```

#### Log Rotation
Create `/etc/logrotate.d/skilllift`:
```
/path/to/skilllift/backend/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nodejs nodejs
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 7. Backup Strategy

#### Database Backup
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
mkdir -p $BACKUP_DIR

# MongoDB backup
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/skilllift" \
  --out="$BACKUP_DIR/skilllift_$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/skilllift_$DATE.tar.gz" "$BACKUP_DIR/skilllift_$DATE"
rm -rf "$BACKUP_DIR/skilllift_$DATE"

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

#### File Uploads Backup
```bash
# Backup uploads directory
rsync -avz /path/to/skilllift/backend/uploads/ /backups/uploads/
```

### 8. Security Checklist

- [ ] Change default MongoDB credentials
- [ ] Use strong JWT secret
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure firewall (UFW)
- [ ] Set up fail2ban for brute force protection
- [ ] Regular security updates
- [ ] Database connection encryption
- [ ] File upload validation
- [ ] Rate limiting enabled
- [ ] CORS properly configured

### 9. Performance Optimization

#### Database Indexes
```javascript
// Add these indexes to MongoDB
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "phone": 1 }, { unique: true });
db.courses.createIndex({ "status": 1, "isApproved": 1 });
db.courses.createIndex({ "tutor": 1, "status": 1 });
db.courses.createIndex({ "category": 1, "status": 1 });
db.enrollments.createIndex({ "student": 1, "course": 1 });
```

#### Caching Strategy
```javascript
// Add Redis caching
const redis = require('redis');
const client = redis.createClient();

// Cache frequently accessed data
const cacheCourse = async (courseId, courseData) => {
  await client.setex(`course:${courseId}`, 3600, JSON.stringify(courseData));
};

const getCachedCourse = async (courseId) => {
  const cached = await client.get(`course:${courseId}`);
  return cached ? JSON.parse(cached) : null;
};
```

### 10. Troubleshooting

#### Common Issues

1. **Database Connection Failed**
   - Check MongoDB URI in `.env`
   - Verify network access (IP whitelist)
   - Check credentials

2. **File Upload Issues**
   - Verify Cloudinary credentials
   - Check file size limits
   - Ensure upload directory permissions

3. **Email Not Sending**
   - Check Gmail app password
   - Verify SMTP settings
   - Check firewall blocking port 587

4. **Payment Integration Issues**
   - Verify Paystack API keys
   - Check webhook URL configuration
   - Test with Paystack test mode first

#### Health Checks
```bash
# Check application health
curl http://localhost:5000/health

# Check database connection
curl http://localhost:5000/api/health/db

# Check external services
curl http://localhost:5000/api/health/external
```

### 11. Scaling Considerations

#### Horizontal Scaling
- Use load balancer (Nginx/HAProxy)
- Multiple application instances
- Database read replicas
- CDN for static assets

#### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching layers
- Use connection pooling

---

## 🎯 Next Steps

1. **Set up monitoring** (Prometheus + Grafana)
2. **Implement CI/CD** (GitHub Actions)
3. **Add automated testing** in deployment pipeline
4. **Set up staging environment**
5. **Implement blue-green deployment**

For support, contact the development team or check the documentation.
