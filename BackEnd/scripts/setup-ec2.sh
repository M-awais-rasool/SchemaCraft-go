#!/bin/bash

# EC2 Setup Script for SchemaCraft Backend
# Run this script on your EC2 instance to set up the environment

set -e

echo "🚀 Setting up EC2 instance for SchemaCraft Backend..."

# Update system
echo "📦 Updating system packages..."
sudo yum update -y

# Install Docker
echo "🐳 Installing Docker..."
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
echo "📋 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
echo "📚 Installing Git..."
sudo yum install -y git

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/schemacraft
sudo chown ec2-user:ec2-user /opt/schemacraft
cd /opt/schemacraft

# Clone repository (you'll need to set up authentication)
echo "📥 Cloning repository..."
echo "Please run the following command to clone your repository:"
echo "git clone https://github.com/M-awais-rasool/SchemaCraft.git ."

# Install MongoDB (optional - you can use MongoDB Atlas instead)
echo "🍃 Setting up MongoDB..."
cat << EOF | sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2023/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-7.0.asc
EOF

sudo yum install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Create environment file
echo "⚙️ Creating environment configuration..."
cd /opt/schemacraft/BackEnd
cat << EOF > .env
PORT=8080
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=schemacraft
JWT_SECRET=$(openssl rand -base64 32)
GIN_MODE=release
EOF

echo "✅ EC2 setup completed!"
echo ""
echo "Next steps:"
echo "1. Clone your repository: git clone https://github.com/M-awais-rasool/SchemaCraft.git /opt/schemacraft"
echo "2. Configure your .env file with proper values"
echo "3. Set up GitHub secrets for automatic deployment"
echo "4. Configure security groups to allow HTTP traffic on port 8080"
echo ""
echo "🔒 Security Group Rules needed:"
echo "- HTTP (80) from 0.0.0.0/0"
echo "- HTTPS (443) from 0.0.0.0/0"  
echo "- Custom TCP (8080) from 0.0.0.0/0"
echo "- SSH (22) from your IP only"
