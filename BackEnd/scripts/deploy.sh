#!/bin/bash

# Manual deployment script
# Use this for manual deployments or troubleshooting

set -e

echo "🚀 Deploying SchemaCraft Backend..."

# Navigate to application directory
cd /opt/schemacraft

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Navigate to backend directory
cd BackEnd

# Build Docker image
echo "🏗️ Building Docker image..."
docker build -t schemacraft-backend .

# Stop existing container
echo "🛑 Stopping existing container..."
docker stop schemacraft-backend 2>/dev/null || true
docker rm schemacraft-backend 2>/dev/null || true

# Start new container
echo "🌟 Starting new container..."
docker run -d \
  --name schemacraft-backend \
  -p 8080:8080 \
  --env-file .env \
  --restart unless-stopped \
  schemacraft-backend

# Clean up unused images
echo "🧹 Cleaning up..."
docker system prune -f

# Wait and verify
echo "⏳ Waiting for application to start..."
sleep 10

# Check if container is running
if docker ps | grep -q schemacraft-backend; then
    echo "✅ Deployment successful!"
    echo "🌐 Application is running on: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080"
else
    echo "❌ Deployment failed!"
    echo "📋 Container logs:"
    docker logs schemacraft-backend
    exit 1
fi
