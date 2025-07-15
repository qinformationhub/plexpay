#!/bin/bash

echo "🚀 Deploying PlexPay to EC2..."

# Set variables
APP_DIR="/home/ec2-user/plexpay"
PM2_APP_NAME="plexpay"

# Create app directory if it doesn't exist
mkdir -p $APP_DIR
cd $APP_DIR

# Stop existing PM2 process if running
echo "🛑 Stopping existing application..."
pm2 stop $PM2_APP_NAME 2>/dev/null || true
pm2 delete $PM2_APP_NAME 2>/dev/null || true

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Verify build
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build failed! dist/index.js not found."
    exit 1
fi

if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Build failed! dist/public/index.html not found."
    exit 1
fi

echo "✅ Build completed successfully!"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "📝 Please create a .env file with:"
    echo "   DATABASE_URL=your_neon_database_url"
    echo "   NODE_ENV=production"
    echo "   PORT=3000"
    exit 1
fi

# Start the application with PM2
echo "🚀 Starting application with PM2..."
pm2 start dist/index.js --name $PM2_APP_NAME --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

echo "✅ Deployment completed!"
echo "📊 Application status:"
pm2 status

echo "🌐 Your application should be accessible at:"
echo "   http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'your-ec2-ip')"

echo "📝 Useful commands:"
echo "   pm2 logs plexpay          # View application logs"
echo "   pm2 restart plexpay       # Restart application"
echo "   pm2 stop plexpay          # Stop application"
echo "   pm2 delete plexpay        # Remove application from PM2" 