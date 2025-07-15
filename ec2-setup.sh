#!/bin/bash

echo "🚀 Setting up PlexPay on EC2..."

# Update system
echo "📦 Updating system packages..."
sudo yum update -y

# Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install nginx
echo "📦 Installing nginx..."
sudo yum install -y nginx

# Install PM2 for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Create nginx configuration
echo "🔧 Creating nginx configuration..."
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

# Remove default nginx site
sudo rm -f /etc/nginx/conf.d/default.conf

# Test nginx configuration
echo "🔍 Testing nginx configuration..."
sudo nginx -t

# Start nginx
echo "🚀 Starting nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Configure firewall
echo "🔥 Configuring firewall..."
sudo yum install -y firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

echo "✅ EC2 setup completed!"
echo "📝 Next steps:"
echo "1. Deploy your application to /home/ec2-user/plexpay"
echo "2. Set up your .env file with DATABASE_URL"
echo "3. Run: cd /home/ec2-user/plexpay && npm install && npm run build"
echo "4. Start the app with: pm2 start dist/index.js --name plexpay"
echo "5. Access your app at: http://your-ec2-ip" 