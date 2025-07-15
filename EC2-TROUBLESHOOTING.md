# EC2 Deployment Troubleshooting Guide

## Current Issue Analysis

Based on your logs, the problem is:

- Your Node.js app is running correctly on port 3000
- But you're accessing it through port 80 (likely nginx/apache)
- The port 80 server is not properly proxying API requests to your Node.js app

## Quick Fix Steps

### 1. **Immediate Solution - Access Port 3000 Directly**

```bash
# Instead of accessing http://your-ec2-ip
# Use: http://your-ec2-ip:3000
```

### 2. **Check Your Current Setup**

```bash
# Check if your app is running
pm2 status

# Check if nginx is running
sudo systemctl status nginx

# Check what's listening on port 80
sudo lsof -i :80

# Check what's listening on port 3000
sudo lsof -i :3000
```

### 3. **Fix Nginx Configuration**

If you're using nginx, replace your current config with the proper one:

```bash
# Backup current config
sudo cp /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.backup

# Create new config
sudo tee /etc/nginx/conf.d/plexpay.conf > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    # Proxy API requests to Node.js app
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Serve static files from Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 4. **Alternative: Run App on Port 80**

If you don't want to use nginx, you can run your app directly on port 80:

```bash
# Stop current app
pm2 stop plexpay

# Edit your .env file
echo "PORT=80" >> .env

# Restart app
pm2 start dist/index.js --name plexpay
```

## Common Issues and Solutions

### Issue 1: "Permission denied" when binding to port 80

**Solution:**

```bash
# Use nginx as reverse proxy (recommended)
# OR run with sudo (not recommended for production)
sudo pm2 start dist/index.js --name plexpay
```

### Issue 2: Environment variables not loading

**Solution:**

```bash
# Check if .env file exists
ls -la .env

# Create .env file if missing
cat > .env <<EOF
DATABASE_URL=your_neon_database_url
NODE_ENV=production
PORT=3000
EOF
```

### Issue 3: Database connection failing

**Solution:**

```bash
# Test database connection
node test-db.js

# Check if DATABASE_URL is set
echo $DATABASE_URL
```

### Issue 4: App not starting

**Solution:**

```bash
# Check logs
pm2 logs plexpay

# Check if build files exist
ls -la dist/

# Rebuild if needed
npm run build
```

## Complete Deployment Checklist

1. **✅ Node.js app running on port 3000**
2. **✅ .env file with DATABASE_URL**
3. **✅ Database connection working**
4. **✅ Nginx configured to proxy to port 3000**
5. **✅ Firewall allows port 80**
6. **✅ PM2 managing the process**

## Testing Your Deployment

```bash
# Test API directly
curl http://localhost:3000/api/users

# Test through nginx
curl http://localhost/api/users

# Test from external
curl http://your-ec2-ip/api/users
```

## Monitoring Commands

```bash
# View app logs
pm2 logs plexpay

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check app status
pm2 status

# Check system resources
htop
```

## Security Considerations

1. **Use HTTPS in production**
2. **Configure firewall properly**
3. **Keep system updated**
4. **Use environment variables for secrets**
5. **Monitor logs regularly**
