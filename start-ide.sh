#!/bin/bash

# DevOps Unity IDE - Auto Start Script
# Automatically manages backend and frontend startup

set -e

# Configuration
BACKEND_PORT=9090
FRONTEND_PORT=5173
BACKEND_PID_FILE="$HOME/.devops-unity-ide/backend.pid"
FRONTEND_PID_FILE="$HOME/.devops-unity-ide/frontend.pid"
LOG_DIR="$HOME/.devops-unity-ide/logs"
BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Create log directory
mkdir -p "$LOG_DIR"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $*" | tee -a "$LOG_DIR/startup.log"
}

# Check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Wait for service to be ready
wait_for_service() {
    local url=$1
    local timeout=${2:-30}
    local count=0

    log "Waiting for service at $url..."

    while ! curl -s "$url" >/dev/null 2>&1; do
        if [ $count -ge $timeout ]; then
            echo -e "${RED}[ERROR]${NC} Service at $url failed to start within $timeout seconds"
            return 1
        fi
        sleep 1
        count=$((count + 1))
    done

    log "Service at $url is ready"
    return 0
}

# Start backend
start_backend() {
    log "Starting backend server..."

    # Check if backend is already running
    if [ -f "$BACKEND_PID_FILE" ]; then
        local old_pid=$(cat "$BACKEND_PID_FILE")
        if kill -0 "$old_pid" 2>/dev/null; then
            echo -e "${YELLOW}[WARNING]${NC} Backend already running (PID: $old_pid)"
            return 0
        else
            rm -f "$BACKEND_PID_FILE"
        fi
    fi

    # Start backend
    cd backend
    nohup go run -mod=mod cmd/server/main.go > "$BACKEND_LOG" 2>&1 &
    local backend_pid=$!
    echo $backend_pid > "$BACKEND_PID_FILE"

    log "Backend started with PID: $backend_pid"

    # Wait for backend to be ready
    if wait_for_service "http://localhost:$BACKEND_PORT/api/v1/health" 10; then
        echo -e "${GREEN}[SUCCESS]${NC} Backend ready on port $BACKEND_PORT"
    else
        echo -e "${RED}[ERROR]${NC} Backend failed to start. Check logs at $BACKEND_LOG"
        return 1
    fi

    cd - >/dev/null
}

# Start frontend
start_frontend() {
    log "Starting frontend development server..."

    # Check if frontend is already running
    if [ -f "$FRONTEND_PID_FILE" ]; then
        local old_pid=$(cat "$FRONTEND_PID_FILE")
        if kill -0 "$old_pid" 2>/dev/null; then
            echo -e "${YELLOW}[WARNING]${NC} Frontend already running (PID: $old_pid)"
            return 0
        else
            rm -f "$FRONTEND_PID_FILE"
        fi
    fi

    # Start frontend
    cd frontend
    nohup npm run dev > "$FRONTEND_LOG" 2>&1 &
    local frontend_pid=$!
    echo $frontend_pid > "$FRONTEND_PID_FILE"

    log "Frontend started with PID: $frontend_pid"

    # Wait for frontend to be ready
    if wait_for_service "http://localhost:$FRONTEND_PORT" 15; then
        echo -e "${GREEN}[SUCCESS]${NC} Frontend ready on port $FRONTEND_PORT"
    else
        echo -e "${RED}[ERROR]${NC} Frontend failed to start. Check logs at $FRONTEND_LOG"
        return 1
    fi

    cd - >/dev/null
}

# Stop services
stop_services() {
    log "Stopping services..."

    # Stop backend
    if [ -f "$BACKEND_PID_FILE" ]; then
        local backend_pid=$(cat "$BACKEND_PID_FILE")
        if kill -0 "$backend_pid" 2>/dev/null; then
            kill "$backend_pid"
            log "Backend stopped (PID: $backend_pid)"
        fi
        rm -f "$BACKEND_PID_FILE"
    fi

    # Stop frontend
    if [ -f "$FRONTEND_PID_FILE" ]; then
        local frontend_pid=$(cat "$FRONTEND_PID_FILE")
        if kill -0 "$frontend_pid" 2>/dev/null; then
            kill "$frontend_pid"
            log "Frontend stopped (PID: $frontend_pid)"
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi

    # Kill any remaining processes
    pkill -f "go run.*server/main.go" || true
    pkill -f "npm run dev" || true

    echo -e "${GREEN}[SUCCESS]${NC} All services stopped"
}

# Check status
check_status() {
    echo -e "${BLUE}DevOps Unity IDE Status:${NC}"
    echo

    # Backend status
    if [ -f "$BACKEND_PID_FILE" ]; then
        local backend_pid=$(cat "$BACKEND_PID_FILE")
        if kill -0 "$backend_pid" 2>/dev/null; then
            echo -e "✅ Backend: Running (PID: $backend_pid)"
            if curl -s "http://localhost:$BACKEND_PORT/api/v1/health" >/dev/null; then
                echo -e "   Health: OK"
            else
                echo -e "   Health: FAIL"
            fi
        else
            echo -e "❌ Backend: Dead (PID file exists but process not found)"
        fi
    else
        echo -e "❌ Backend: Not running"
    fi

    # Frontend status
    if [ -f "$FRONTEND_PID_FILE" ]; then
        local frontend_pid=$(cat "$FRONTEND_PID_FILE")
        if kill -0 "$frontend_pid" 2>/dev/null; then
            echo -e "✅ Frontend: Running (PID: $frontend_pid)"
            if curl -s "http://localhost:$FRONTEND_PORT" >/dev/null; then
                echo -e "   Status: OK"
            else
                echo -e "   Status: FAIL"
            fi
        else
            echo -e "❌ Frontend: Dead (PID file exists but process not found)"
        fi
    else
        echo -e "❌ Frontend: Not running"
    fi

    echo
    echo -e "${BLUE}URLs:${NC}"
    echo "  Frontend: http://localhost:$FRONTEND_PORT"
    echo "  Backend API: http://localhost:$BACKEND_PORT/api/v1"
    echo
    echo -e "${BLUE}Logs:${NC}"
    echo "  Backend: $BACKEND_LOG"
    echo "  Frontend: $FRONTEND_LOG"
    echo "  Startup: $LOG_DIR/startup.log"
}

# Main function
main() {
    case "${1:-start}" in
        "start")
            echo -e "${BLUE}Starting DevOps Unity IDE...${NC}"
            echo

            # Start services
            if start_backend && start_frontend; then
                echo
                echo -e "${GREEN}🎉 DevOps Unity IDE is now running!${NC}"
                echo
                echo -e "${BLUE}Access URLs:${NC}"
                echo "  Frontend: http://localhost:$FRONTEND_PORT"
                echo "  Backend API: http://localhost:$BACKEND_PORT/api/v1"
                echo
                echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
                echo

                # Keep running and show logs
                tail -f "$BACKEND_LOG" "$FRONTEND_LOG" 2>/dev/null &
                local tail_pid=$!

                # Wait for interrupt
                trap "stop_services; kill $tail_pid 2>/dev/null; exit 0" INT TERM
                wait
            else
                echo -e "${RED}Failed to start some services${NC}"
                exit 1
            fi
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            echo -e "${BLUE}Restarting DevOps Unity IDE...${NC}"
            stop_services
            sleep 2
            main start
            ;;
        "status")
            check_status
            ;;
        "logs")
            echo -e "${BLUE}Showing logs...${NC}"
            echo "Backend logs:"
            tail -f "$BACKEND_LOG" &
            backend_tail=$!
            echo
            echo "Frontend logs:"
            tail -f "$FRONTEND_LOG" &
            frontend_tail=$!
            trap "kill $backend_tail $frontend_tail 2>/dev/null" INT TERM
            wait
            ;;
        *)
            echo "Usage: $0 {start|stop|restart|status|logs}"
            echo
            echo "Commands:"
            echo "  start   - Start both backend and frontend"
            echo "  stop    - Stop all services"
            echo "  restart - Restart all services"
            echo "  status  - Show status of all services"
            echo "  logs    - Show live logs from all services"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
