#!/bin/bash

echo "🚀 Starting Complete Thenga Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_status "Setting up environment..."

# Create environment files if they don't exist
if [ ! -f "services/api-gateway/.env" ]; then
    print_status "Creating API Gateway environment file..."
    cp services/api-gateway/env.example services/api-gateway/.env
fi

# Start PostgreSQL with Docker
print_status "Starting PostgreSQL database..."
docker run -d \
    --name Thenga-postgres \
    -e POSTGRES_DB=Thenga \
    -e POSTGRES_USER=Thenga \
    -e POSTGRES_PASSWORD=Thenga123 \
    -p 5432:5432 \
    postgres:15-alpine

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
sleep 10

# Start Redis with Docker
print_status "Starting Redis cache..."
docker run -d \
    --name Thenga-redis \
    -p 6379:6379 \
    redis:7-alpine

# Wait for Redis to be ready
print_status "Waiting for Redis to be ready..."
sleep 5

# Install dependencies for API Gateway
print_status "Installing API Gateway dependencies..."
cd services/api-gateway
npm install --legacy-peer-deps

# Run database migrations
print_status "Running database migrations..."
npx prisma migrate dev --name init
npx prisma generate

# Start API Gateway
print_status "Starting API Gateway..."
npm run start:dev &
API_PID=$!

# Go back to root directory
cd ../..

# Start PWA
print_status "Starting PWA..."
cd standalone-pwa
npm install --legacy-peer-deps
npm run dev &
PWA_PID=$!

# Go back to root directory
cd ..

# Start WhatsApp Service
print_status "Starting WhatsApp Service..."
cd services/whatsapp-service
npm install --legacy-peer-deps
npm run start:dev &
WHATSAPP_PID=$!

# Go back to root directory
cd ../..

# Start Inventory Service
print_status "Starting Inventory Service..."
cd services/inventory-service
npm install --legacy-peer-deps
npm run start:dev &
INVENTORY_PID=$!

# Go back to root directory
cd ../..

# Start WebSocket Service
print_status "Starting WebSocket Service..."
cd services/websocket-service
npm install --legacy-peer-deps
npm run start:dev &
WEBSOCKET_PID=$!

# Go back to root directory
cd ../..

# Start Analytics Service
print_status "Starting Analytics Service..."
cd services/analytics-service
npm install --legacy-peer-deps
npm run start:dev &
ANALYTICS_PID=$!

# Go back to root directory
cd ../..

# Start Monitoring Stack
print_status "Starting Monitoring Stack..."
cd monitoring
docker-compose up -d

# Go back to root directory
cd ..

# Wait for services to start
print_status "Waiting for services to start..."
sleep 15

# Check service health
print_status "Checking service health..."

# Check API Gateway
if curl -s http://localhost:3001/health > /dev/null; then
    print_success "✅ API Gateway is running at http://localhost:3001"
else
    print_warning "⚠️  API Gateway may not be ready yet"
fi

# Check PWA
if curl -s http://localhost:3000 > /dev/null; then
    print_success "✅ PWA is running at http://localhost:3000"
else
    print_warning "⚠️  PWA may not be ready yet"
fi

# Check PostgreSQL
if docker exec Thenga-postgres pg_isready -U Thenga > /dev/null 2>&1; then
    print_success "✅ PostgreSQL is running"
else
    print_warning "⚠️  PostgreSQL may not be ready yet"
fi

# Check Redis
if docker exec Thenga-redis redis-cli ping > /dev/null 2>&1; then
    print_success "✅ Redis is running"
else
    print_warning "⚠️  Redis may not be ready yet"
fi

print_success "🎉 Thenga Platform is starting up!"
echo ""
echo "📱 PWA: http://localhost:3000"
echo "🔌 API Gateway: http://localhost:3001"
echo "📚 API Docs: http://localhost:3001/api/docs"
echo "🏥 Health Check: http://localhost:3001/health"
echo "📊 Prometheus: http://localhost:9090"
echo "📈 Grafana: http://localhost:3001 (admin/Thenga123)"
echo ""
echo "🔧 Services running:"
echo "  - API Gateway (PID: $API_PID)"
echo "  - PWA (PID: $PWA_PID)"
echo "  - WhatsApp Service (PID: $WHATSAPP_PID)"
echo "  - Inventory Service (PID: $INVENTORY_PID)"
echo "  - WebSocket Service (PID: $WEBSOCKET_PID)"
echo "  - Analytics Service (PID: $ANALYTICS_PID)"
echo "  - PostgreSQL (Docker)"
echo "  - Redis (Docker)"
echo "  - Monitoring Stack (Docker)"
echo ""
echo "🛑 To stop all services, run: ./stop-all-services.sh"
echo "📝 To view logs, run: ./view-logs.sh"

# Save PIDs to file for cleanup
echo "$API_PID $PWA_PID $WHATSAPP_PID $INVENTORY_PID $WEBSOCKET_PID $ANALYTICS_PID" > .service-pids

print_success "Setup complete! 🚀"
