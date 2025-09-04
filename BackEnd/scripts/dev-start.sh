#!/bin/bash

# Quick start script for SchemaCraft Backend development

set -e

echo "🚀 Starting SchemaCraft Backend Development Environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your configuration."
fi

# Build and start the development environment
echo "🏗️ Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if the application is running
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ SchemaCraft Backend is running!"
    echo ""
    echo "🌐 Application: http://localhost:8080"
    echo "📚 API Documentation: http://localhost:8080/swagger/index.html"
    echo "🗄️ MongoDB: localhost:27017"
    echo ""
    echo "🔍 View logs: docker-compose logs -f"
    echo "🛑 Stop services: docker-compose down"
else
    echo "❌ Application failed to start. Check logs with: docker-compose logs"
    exit 1
fi
