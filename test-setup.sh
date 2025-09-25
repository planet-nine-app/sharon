#!/bin/bash

# Quick setup test - just start environment and verify it works
# This is a simplified version of setup-and-test.sh for testing

set -e

echo "🧪 Quick Sharon Environment Test"
echo "==============================="

# Clean up
echo "🧹 Cleaning up..."
docker-compose down -v --remove-orphans 2>/dev/null || echo "Nothing to clean"

# Start environment
echo "🚀 Starting environment..."
if docker-compose up --build -d; then
    echo "✅ Containers started"
else
    echo "❌ Failed to start containers"
    exit 1
fi

# Wait a bit for services to start
echo "⏳ Waiting for services to initialize..."
sleep 30

# Check if nginx is responding
echo "🔍 Testing nginx..."
if curl -sf http://localhost:8080/health > /dev/null; then
    echo "✅ Nginx is responding"
else
    echo "❌ Nginx not responding"
    echo "Container status:"
    docker-compose ps
    echo "Nginx logs:"
    docker-compose logs nginx | tail -20
    exit 1
fi

# Test a service through nginx
echo "🔍 Testing service routing..."
if curl -sf http://localhost:8080/services > /dev/null; then
    echo "✅ Service discovery is working"
    echo "📋 Available services:"
    curl -s http://localhost:8080/services | head -20
else
    echo "⚠️  Service discovery not ready"
fi

echo ""
echo "🎯 Basic environment test complete!"
echo "   Nginx: http://localhost:8080"
echo "   Services: http://localhost:8080/services"
echo ""
echo "To run verification: docker-compose exec sharon node verify-environment.js"
echo "To run tests: docker-compose exec sharon node run-all-tests.js"
echo "To stop: docker-compose down"