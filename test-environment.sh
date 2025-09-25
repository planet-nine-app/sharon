#!/bin/bash

# Sharon Test Environment Setup Script
# This script sets up the test environment with Docker-in-Docker to mimic production

set -e

echo "🚀 Setting up Sharon test environment..."

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=60
    local attempt=1

    echo "⏳ Waiting for $service_name to be ready at $url..."

    while [ $attempt -le $max_attempts ]; do
        if curl -sf "$url" > /dev/null 2>&1; then
            echo "✅ $service_name is ready!"
            return 0
        fi

        echo "   Attempt $attempt/$max_attempts failed, retrying in 5s..."
        sleep 5
        ((attempt++))
    done

    echo "❌ $service_name failed to start after $max_attempts attempts"
    return 1
}

# Start allyabase container using Docker-in-Docker
echo "🐳 Starting allyabase container..."

# Build allyabase image
docker -H tcp://allyabase:2375 build -t allyabase:test /allyabase/deployment/docker/

# Run allyabase container with nginx
docker -H tcp://allyabase:2375 run -d \
    --name allyabase-instance \
    -p 80:80 \
    -p 443:443 \
    -p 3000-3011:3000-3011 \
    -p 7243:7243 \
    -p 7277:7277 \
    -p 2525:2525 \
    -p 2999:2999 \
    -e NODE_ENV=test \
    -v /allyabase:/app \
    allyabase:test

# Wait for services to be ready
wait_for_service "http://nginx:80/health" "Nginx proxy"
wait_for_service "http://nginx:80/services" "Service discovery"

# Verify key services are accessible
echo "🔍 Verifying service endpoints..."
services=("fount" "bdo" "julia" "addie" "sanora" "dolores")

for service in "${services[@]}"; do
    if wait_for_service "http://nginx:80/$service/" "$service service"; then
        echo "   ✅ $service endpoint verified"
    else
        echo "   ⚠️  $service endpoint not ready (may still be starting)"
    fi
done

echo ""
echo "🎯 Test environment ready!"
echo "   Nginx proxy: http://localhost:8080"
echo "   Services accessible at: http://localhost:8080/{service}/"
echo "   Service discovery: http://localhost:8080/services"
echo ""
echo "🧪 Running tests..."

# Run the test suite
if [ "$RUN_TESTS" != "false" ]; then
    cd /sharon
    export ALLYABASE_BASE_URL="http://nginx:80"
    node run-all-tests.js "$@"
else
    echo "Skipping tests (RUN_TESTS=false). Environment is ready for manual testing."
    tail -f /dev/null  # Keep container running
fi