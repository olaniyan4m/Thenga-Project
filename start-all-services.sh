#!/bin/bash

echo "🚀 Starting Thenga Platform Services..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}Port $1 is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}Port $1 is available${NC}"
        return 0
    fi
}

# Function to start a service
start_service() {
    local service_name=$1
    local port=$2
    local command=$3
    
    echo -e "\n${BLUE}Starting $service_name on port $port...${NC}"
    
    if check_port $port; then
        cd $service_name
        if [ -f "package.json" ]; then
            echo "Installing dependencies for $service_name..."
            npm install --silent
            
            echo "Starting $service_name..."
            eval $command &
            local pid=$!
            echo -e "${GREEN}$service_name started with PID $pid${NC}"
            
            # Store PID for cleanup
            echo $pid >> ../service_pids.txt
        else
            echo -e "${RED}package.json not found in $service_name${NC}"
        fi
        cd ..
    else
        echo -e "${YELLOW}Skipping $service_name - port $port is in use${NC}"
    fi
}

# Create PID file for cleanup
echo "" > service_pids.txt

echo -e "\n${YELLOW}Checking system requirements...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}Node.js and npm are available${NC}"

# Start services in order
echo -e "\n${YELLOW}Starting Thenga Services...${NC}"

# 1. Start the standalone PWA (main app)
echo -e "\n${BLUE}Starting Thenga PWA...${NC}"
if check_port 3000; then
    cd standalone-pwa
    echo "Installing PWA dependencies..."
    npm install --silent
    
    echo "Starting PWA development server..."
    npm run dev &
    pwa_pid=$!
    echo -e "${GREEN}PWA started with PID $pwa_pid${NC}"
    echo $pwa_pid >> ../service_pids.txt
    cd ..
else
    echo -e "${YELLOW}PWA port 3000 is in use - skipping${NC}"
fi

# 2. Start WhatsApp Service
start_service "services/whatsapp-service" 3001 "npm run dev"

# 3. Start Inventory Service
start_service "services/inventory-service" 3003 "npm run dev"

# 4. Start WebSocket Service
start_service "services/websocket-service" 3004 "npm run dev"

# 5. Start Analytics Service
start_service "services/analytics-service" 3005 "npm run dev"

# 6. Start API Gateway
start_service "services/api-gateway" 3000 "npm run dev"

# 7. Start Notifications Service
start_service "services/notifications-service" 3002 "npm run dev"

# 8. Start Payments Service
start_service "services/payments-service" 3006 "npm run dev"

# Wait a moment for services to start
echo -e "\n${YELLOW}Waiting for services to initialize...${NC}"
sleep 5

# Check service health
echo -e "\n${YELLOW}Checking service health...${NC}"

services=(
    "PWA:http://localhost:3000"
    "WhatsApp Service:http://localhost:3001/health"
    "Inventory Service:http://localhost:3003/health"
    "WebSocket Service:http://localhost:3004/health"
    "Analytics Service:http://localhost:3005/health"
)

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    url=$(echo $service | cut -d: -f2-)
    
    if curl -s -f $url > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name is healthy${NC}"
    else
        echo -e "${RED}❌ $name is not responding${NC}"
    fi
done

echo -e "\n${GREEN}🎉 Thenga Platform Services Started!${NC}"
echo -e "\n${BLUE}Available Services:${NC}"
echo -e "📱 PWA: ${GREEN}http://localhost:3000${NC}"
echo -e "💬 WhatsApp Service: ${GREEN}http://localhost:3001${NC}"
echo -e "📦 Inventory Service: ${GREEN}http://localhost:3003${NC}"
echo -e "🔌 WebSocket Service: ${GREEN}http://localhost:3004${NC}"
echo -e "📊 Analytics Service: ${GREEN}http://localhost:3005${NC}"

echo -e "\n${YELLOW}To stop all services, run: ./stop-all-services.sh${NC}"
echo -e "${YELLOW}To view logs, run: ./view-logs.sh${NC}"

# Keep script running to show status
echo -e "\n${BLUE}Press Ctrl+C to stop all services${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Stopping all services...${NC}"
    if [ -f "service_pids.txt" ]; then
        while read pid; do
            if [ ! -z "$pid" ]; then
                kill $pid 2>/dev/null
                echo -e "${GREEN}Stopped service with PID $pid${NC}"
            fi
        done < service_pids.txt
        rm service_pids.txt
    fi
    echo -e "${GREEN}All services stopped${NC}"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Wait for user to stop
while true; do
    sleep 1
done
