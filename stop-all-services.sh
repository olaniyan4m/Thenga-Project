#!/bin/bash

echo "🛑 Stopping all Thenga services..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Stop Node.js processes
if [ -f ".service-pids" ]; then
    print_status "Stopping Node.js services..."
    PIDS=$(cat .service-pids)
    for pid in $PIDS; do
        if kill -0 $pid 2>/dev/null; then
            kill $pid
            print_success "Stopped process $pid"
        fi
    done
    rm .service-pids
fi

# Stop Docker containers
print_status "Stopping Docker containers..."
docker stop Thenga-postgres Thenga-redis 2>/dev/null || true
docker rm Thenga-postgres Thenga-redis 2>/dev/null || true

# Stop monitoring stack
print_status "Stopping monitoring stack..."
cd monitoring
docker-compose down 2>/dev/null || true
cd ..

# Kill any remaining Node.js processes on common ports
print_status "Cleaning up remaining processes..."
lsof -ti:3000,3001,3002,3003,3004,3005 | xargs kill -9 2>/dev/null || true

print_success "✅ All services stopped!"
