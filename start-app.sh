#!/bin/bash

# DevOps Unity IDE - Startup Script
# This script starts both the backend and frontend

echo "==============================================="
echo "    DevOps Unity IDE - Starting Application"
echo "==============================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    
    # Kill backend if running
    if [ ! -z "$BACKEND_PID" ]; then
        echo "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
    fi
    
    # Kill frontend if running
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    exit 0
}

# Set trap for cleanup
trap cleanup EXIT INT TERM

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo -e "${RED}Go is not installed. Please install Go first.${NC}"
    echo "Visit: https://golang.org/dl/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Step 1: Build and start the backend
echo -e "\n${YELLOW}Step 1: Building backend...${NC}"
cd backend

# Install Go dependencies
go mod init devops-unity-backend 2>/dev/null
go get github.com/gorilla/mux
go get github.com/gorilla/websocket
go get github.com/rs/cors

# Build the backend
go build -o devops-backend local-server.go

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to build backend${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Backend built successfully${NC}"

# Start the backend
echo -e "${YELLOW}Starting backend server...${NC}"
./devops-backend &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend to start..."
for i in {1..10}; do
    if curl -s http://127.0.0.1:9090/api/health > /dev/null; then
        echo -e "${GREEN}✓ Backend is running on http://127.0.0.1:9090${NC}"
        break
    fi
    sleep 1
done

# Step 2: Start the frontend
echo -e "\n${YELLOW}Step 2: Starting frontend...${NC}"
cd ../frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install --legacy-peer-deps
fi

# Start the frontend in development mode
echo -e "${YELLOW}Starting frontend application...${NC}"
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

echo -e "\n${GREEN}===============================================${NC}"
echo -e "${GREEN}    DevOps Unity IDE is running!${NC}"
echo -e "${GREEN}===============================================${NC}"
echo ""
echo -e "  Backend API: ${YELLOW}http://127.0.0.1:9090${NC}"
echo -e "  Frontend UI: ${YELLOW}http://localhost:5173${NC}"
echo ""
echo -e "  Docker Status: $(if docker info >/dev/null 2>&1; then echo -e "${GREEN}Connected${NC}"; else echo -e "${RED}Not Available${NC}"; fi)"
echo -e "  Kubernetes Status: $(if kubectl version --short >/dev/null 2>&1; then echo -e "${GREEN}Connected${NC}"; else echo -e "${RED}Not Available${NC}"; fi)"
echo ""
echo -e "Press ${YELLOW}Ctrl+C${NC} to stop the application"
echo ""

# Keep script running
wait $FRONTEND_PID
