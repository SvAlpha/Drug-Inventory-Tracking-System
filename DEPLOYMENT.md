# 🚀 Deployment Guide

This guide provides step-by-step instructions for deploying the Drug Inventory System to production.

## Table of Contents
1. [Docker Deployment (Recommended)](#docker-deployment)
2. [AWS Deployment](#aws-deployment)
3. [Heroku Deployment](#heroku-deployment)
4. [Manual Server Deployment](#manual-server-deployment)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [Monitoring & Maintenance](#monitoring--maintenance)

## Docker Deployment (Recommended)

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- MongoDB Atlas account (or local MongoDB)

### Steps

1. **Set environment variables**
```bash
cat > server/.env << EOF
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
EOF
```

2. **Build and start containers**
```bash
docker-compose up --build -d
```

3. **Verify deployment**
```bash
# Check running containers
docker-compose ps

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

4. **Seed database**
```bash
docker-compose exec backend npm run seed
```

### Docker Production Checklist

- [ ] Use strong JWT_SECRET (generate with OpenSSL)
- [ ] Configure MONGO_URI with authentication
- [ ] Set NODE_ENV=production
- [ ] Configure CORS_ORIGIN for your domain
- [ ] Setup health checks in docker-compose.yml
- [ ] Configure volume persistence for MongoDB
- [ ] Setup SSL/TLS with reverse proxy (Nginx)
- [ ] Configure resource limits in docker-compose.yml
- [ ] Setup log rotation and monitoring

## AWS Deployment

### Using ECS (Elastic Container Service)

1. **Push Docker images to ECR**
```bash
aws ecr create-repository --repository-name drug-inventory-backend
aws ecr create-repository --repository-name drug-inventory-frontend

docker tag drug-inventory-backend:latest <aws-account>.dkr.ecr.<region>.amazonaws.com/drug-inventory-backend:latest
docker push <aws-account>.dkr.ecr.<region>.amazonaws.com/drug-inventory-backend:latest

# Repeat for frontend
```

2. **Create MongoDB Atlas cluster** (or RDS)
```bash
# Get connection string from MongoDB Atlas
export MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/db"
```

3. **Create ECS cluster and task definitions**
```bash
aws ecs create-cluster --cluster-name drug-inventory

# Define task definitions in task-definition.json
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

4. **Deploy with load balancer**
```bash
aws elbv2 create-load-balancer --name drug-inventory-lb --subnets subnet-xxx subnet-yyy
```

### Using Elastic Beanstalk (Simpler)

```bash
eb init -p docker drug-inventory
eb create production
eb deploy
```

## Heroku Deployment

### Backend Deployment

1. **Create Heroku app**
```bash
heroku create drug-inventory-api
```

2. **Set environment variables**
```bash
heroku config:set MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
heroku config:set JWT_SECRET=$(openssl rand -hex 32)
heroku config:set NODE_ENV=production
```

3. **Deploy**
```bash
git push heroku main
```

4. **Scale dynos**
```bash
heroku ps:scale web=2
```

### Frontend Deployment

1. **Using Netlify (Recommended)**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=client/build
```

Or connect GitHub repo directly to Netlify UI.

2. **Update API URL in frontend**
```bash
# In client/.env.production
REACT_APP_API_URL=https://drug-inventory-api.herokuapp.com/api
```

## Manual Server Deployment

### Ubuntu/Debian Server Setup

1. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Install MongoDB**
```bash
# Or use MongoDB Atlas (recommended)
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

3. **Install Nginx (reverse proxy)**
```bash
sudo apt-get install -y nginx
```

4. **Setup application**
```bash
git clone <repo-url> /opt/drug-inventory
cd /opt/drug-inventory/server
npm install --production
npm run seed
```

5. **Create systemd service**
```bash
sudo tee /etc/systemd/system/drug-inventory.service << EOF
[Unit]
Description=Drug Inventory Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/drug-inventory/server
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable drug-inventory
sudo systemctl start drug-inventory
```

6. **Configure Nginx**
```nginx
upstream backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

7. **Setup SSL with Let's Encrypt**
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Database Setup

### MongoDB Atlas (Production Recommended)

1. Create cluster
2. Enable network access from your server IPs
3. Create database user with strong password
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/db`

### Local MongoDB with Replication (High Availability)

```bash
# MongoDB replica set setup
mongod --replSet rs0 --bind_ip 127.0.0.1,<ip-address>
mongo
> rs.initiate()
```

## Environment Configuration

### Production Environment Variables

```env
# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/drug-inventory
MONGO_RETRY_ATTEMPTS=5
MONGO_RETRY_DELAY=1000

# Security
JWT_SECRET=<generate-with-openssl-rand-hex-32>
JWT_EXPIRES_IN=7d
NODE_ENV=production

# Server
PORT=5000
CORS_ORIGIN=https://your-domain.com

# SSL (if not using reverse proxy)
# SSL_KEY_PATH=/path/to/key.pem
# SSL_CERT_PATH=/path/to/cert.pem

# Email (for notifications, optional)
# EMAIL_SERVICE=sendgrid
# EMAIL_API_KEY=xxx

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=<sentry-dsn-if-using>
```

## Monitoring & Maintenance

### Health Checks

```bash
# Check backend health
curl https://your-domain.com/api

# Check frontend
curl https://your-domain.com/

# Check API docs
curl https://your-domain.com/api-docs
```

### Performance Monitoring

```bash
# Monitor logs
docker-compose logs -f backend --tail=100

# Monitor disk usage
df -h

# Monitor database
mongostat
```

### Backup Strategy

```bash
# Daily MongoDB backup
0 2 * * * mongodump --uri="mongodb+srv://..." --out=/backups/$(date +\%Y\%m\%d)

# Upload to S3 (AWS)
0 3 * * * aws s3 sync /backups/ s3://your-backup-bucket/ --delete
```

### Updates & Scaling

```bash
# Update Docker images
docker pull mongo:6.0
docker-compose up --no-deps -d backend

# Scale horizontally
docker-compose up -d --scale backend=3

# Or using orchestration tools
kubectl scale deployment drug-inventory-backend --replicas=3
```

## Troubleshooting

### Database Connection Issues
```bash
# Test MongoDB connection
mongo <connection-string>

# Check network connectivity
nc -zv cluster.mongodb.net 27017
```

### Memory Issues
```bash
# Check container memory usage
docker stats

# Increase Node.js heap
export NODE_OPTIONS="--max-old-space-size=4096"
```

### SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew

# Check certificate validity
openssl s_client -connect your-domain.com:443
```

## Summary Checklist

- [ ] Database configured and seeded
- [ ] Environment variables set correctly
- [ ] SSL/TLS configured
- [ ] Reverse proxy (Nginx) configured
- [ ] Firewall rules configured
- [ ] Backup strategy implemented
- [ ] Monitoring setup (CloudWatch, Datadog, etc.)
- [ ] Load balancer configured
- [ ] Auto-scaling configured
- [ ] Health checks passing
- [ ] Logs centralized (CloudWatch, ELK, etc.)
- [ ] Rate limiting and DDoS protection
- [ ] Database replication/backup tested
