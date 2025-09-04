#!/bin/bash

# EC2 Setup Verification Script
# Run this script on your EC2 instance to verify everything is set up correctly

set -e

echo "🔍 Verifying EC2 setup for SchemaCraft deployment..."

# Check if Docker is installed and running
echo "📦 Checking Docker installation..."
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    if systemctl is-active --quiet docker; then
        echo "✅ Docker service is running"
    else
        echo "❌ Docker service is not running"
        echo "   Run: sudo systemctl start docker"
        exit 1
    fi
else
    echo "❌ Docker is not installed"
    echo "   Please run the setup script first"
    exit 1
fi

# Check if deploy directory exists
echo "📁 Checking deploy directory..."
if [ -d "/opt/schemacraft" ]; then
    echo "✅ Deploy directory exists"
else
    echo "❌ Deploy directory not found"
    echo "   Run: sudo mkdir -p /opt/schemacraft && sudo chown $USER:$USER /opt/schemacraft"
    exit 1
fi

# Check if repository is cloned
echo "📚 Checking repository..."
if [ -d "/opt/schemacraft/.git" ]; then
    echo "✅ Repository is cloned"
    cd /opt/schemacraft
    echo "   Current branch: $(git branch --show-current)"
    echo "   Latest commit: $(git log -1 --oneline)"
else
    echo "❌ Repository not cloned"
    echo "   Run: cd /opt/schemacraft && git clone https://github.com/M-awais-rasool/SchemaCraft.git ."
    exit 1
fi

# Check if environment file exists
echo "⚙️ Checking environment configuration..."
if [ -f "/opt/schemacraft/BackEnd/.env" ]; then
    echo "✅ Environment file exists"
    
    # Check if required variables are set
    if grep -q "JWT_SECRET=" /opt/schemacraft/BackEnd/.env && \
       grep -q "MONGODB_URI=" /opt/schemacraft/BackEnd/.env; then
        echo "✅ Required environment variables are configured"
    else
        echo "⚠️  Environment file exists but may be incomplete"
        echo "   Please verify JWT_SECRET and MONGODB_URI are set"
    fi
else
    echo "❌ Environment file not found"
    echo "   Run: cd /opt/schemacraft/BackEnd && cp .env.example .env"
    echo "   Then edit .env with your configuration"
    exit 1
fi

# Check if MongoDB is running (if using local MongoDB)
echo "🍃 Checking MongoDB..."
if systemctl is-active --quiet mongod 2>/dev/null; then
    echo "✅ MongoDB service is running"
elif grep -q "mongodb://localhost" /opt/schemacraft/BackEnd/.env; then
    echo "❌ Local MongoDB required but not running"
    echo "   Run: sudo systemctl start mongod"
    echo "   Or update MONGODB_URI in .env to use MongoDB Atlas"
    exit 1
else
    echo "✅ Using external MongoDB (Atlas or other)"
fi

# Test Docker build
echo "🏗️ Testing Docker build..."
cd /opt/schemacraft/BackEnd
if docker build -t schemacraft-test . &>/dev/null; then
    echo "✅ Docker build successful"
    docker rmi schemacraft-test &>/dev/null || true
else
    echo "❌ Docker build failed"
    echo "   Check the Dockerfile and try building manually"
    exit 1
fi

# Check SSH key for GitHub Actions (if exists)
echo "🔑 Checking SSH configuration for GitHub Actions..."
if [ -f "$HOME/.ssh/github-actions" ]; then
    echo "✅ GitHub Actions SSH key exists"
    echo "   Make sure to add this to GitHub secrets:"
    echo "   Key name: EC2_SSH_KEY"
    echo "   Value: Contents of ~/.ssh/github-actions"
else
    echo "⚠️  GitHub Actions SSH key not found"
    echo "   Generate with: ssh-keygen -t rsa -b 4096 -C 'github-actions' -f ~/.ssh/github-actions -N ''"
    echo "   Then add public key to authorized_keys: cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys"
fi

# Get EC2 public IP
echo "🌐 Getting EC2 public IP..."
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "Could not retrieve")
echo "   EC2 Public IP: $PUBLIC_IP"

echo ""
echo "🎯 Setup Verification Summary:"
echo "   Deploy Path: /opt/schemacraft"
echo "   EC2 User: $(whoami)"
echo "   Public IP: $PUBLIC_IP"
echo ""

if [ "$PUBLIC_IP" != "Could not retrieve" ]; then
    echo "📋 GitHub Secrets Configuration:"
    echo "   EC2_SSH_KEY: Contents of ~/.ssh/github-actions (private key)"
    echo "   EC2_HOST: $PUBLIC_IP"
    echo "   EC2_USER: $(whoami)"
    echo "   DEPLOY_PATH: /opt/schemacraft"
    echo ""
fi

echo "✅ EC2 setup verification completed successfully!"
echo "🚀 Your EC2 instance is ready for automatic deployment!"
echo ""
echo "Next steps:"
echo "1. Configure GitHub secrets (if not done already)"
echo "2. Push changes to trigger automatic deployment"
echo "3. Monitor deployment in GitHub Actions"
echo "4. Access your app at: http://$PUBLIC_IP:8080"
