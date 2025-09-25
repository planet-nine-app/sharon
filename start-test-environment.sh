#!/bin/bash

# Sharon Test Environment Startup Script
# Starts the dockerized test environment with nginx routing

set -e

echo "🚀 Starting Sharon test environment..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not available"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed or not available"
    exit 1
fi

# Clean up any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose down -v --remove-orphans 2>/dev/null || echo "No existing containers to clean up"

# Build and start the environment
echo "🏗️  Building and starting test environment..."
docker-compose up --build -d

# Function to check if a URL is responding
wait_for_url() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    echo "⏳ Waiting for $service_name at $url..."

    while [ $attempt -le $max_attempts ]; do
        if curl -sf "$url" > /dev/null 2>&1; then
            echo "✅ $service_name is ready!"
            return 0
        fi

        echo "   Attempt $attempt/$max_attempts, retrying in 10s..."
        sleep 10
        ((attempt++))
    done

    echo "❌ $service_name failed to start after $max_attempts attempts"
    return 1
}

# Wait for nginx to be ready
if wait_for_url "http://localhost:8080/health" "Nginx proxy"; then
    echo ""
    echo "🎯 Test environment is ready!"
    echo ""
    echo "📋 Available endpoints:"
    echo "   Nginx proxy:      http://localhost:8080"
    echo "   Service discovery: http://localhost:8080/services"
    echo "   Health check:     http://localhost:8080/health"
    echo ""
    echo "🔧 Service endpoints:"
    echo "   Addie:       http://localhost:8080/addie/"
    echo "   BDO:         http://localhost:8080/bdo/"
    echo "   Continuebee: http://localhost:8080/continuebee/"
    echo "   Dolores:     http://localhost:8080/dolores/"
    echo "   Fount:       http://localhost:8080/fount/"
    echo "   Joan:        http://localhost:8080/joan/"
    echo "   Julia:       http://localhost:8080/julia/"
    echo "   PN-Pref:     http://localhost:8080/pn-pref/"
    echo "   Sanora:      http://localhost:8080/sanora/"
    echo ""
    echo "🧪 To run tests:"
    echo "   docker-compose exec sharon node run-all-tests.js"
    echo ""
    echo "📊 To view logs:"
    echo "   docker-compose logs -f sharon"
    echo ""
    echo "🛑 To stop environment:"
    echo "   docker-compose down"
else
    echo "❌ Failed to start test environment"
    echo ""
    echo "🔍 Check logs with:"
    echo "   docker-compose logs"
    exit 1
fi