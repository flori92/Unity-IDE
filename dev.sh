#!/bin/bash

# DevOps Unity IDE - Development Script
# Tools for development workflow

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Logging
log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $*"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*"
}

error() {
    echo -e "${RED}[ERROR]${NC} $*" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*"
}

# Check dependencies
check_deps() {
    log "Checking dependencies..."

    local missing=()

    if ! command -v node &> /dev/null; then
        missing+=("Node.js (https://nodejs.org/)")
    fi

    if ! command -v npm &> /dev/null; then
        missing+=("npm")
    fi

    if ! command -v go &> /dev/null; then
        missing+=("Go (https://golang.org/)")
    fi

    if ! command -v cargo &> /dev/null; then
        missing+=("Rust/Cargo (https://rustup.rs/)")
    fi

    if ! command -v docker &> /dev/null; then
        missing+=("Docker (https://docker.com/)")
    fi

    if [ ${#missing[@]} -ne 0 ]; then
        error "Missing dependencies:"
        for dep in "${missing[@]}"; do
            echo "  - $dep"
        done
        exit 1
    fi

    success "All dependencies found"
}

# Setup development environment
setup() {
    log "Setting up development environment..."

    # Backend setup
    log "Setting up backend..."
    cd "$BACKEND_DIR"
    go mod tidy
    go mod vendor

    # Frontend setup
    log "Setting up frontend..."
    cd "$FRONTEND_DIR"
    npm install

    # Install Tauri CLI if not present
    if ! command -v tauri &> /dev/null; then
        log "Installing Tauri CLI..."
        npm install -g @tauri-apps/cli
    fi

    cd "$PROJECT_ROOT"
    success "Development environment ready!"
}

# Start development servers
dev() {
    log "Starting development servers..."

    # Check if ports are available
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null; then
        error "Port 5173 (frontend) is already in use"
        exit 1
    fi

    if lsof -Pi :9090 -sTCP:LISTEN -t >/dev/null; then
        error "Port 9090 (backend) is already in use"
        exit 1
    fi

    # Start backend in background
    log "Starting backend..."
    cd "$BACKEND_DIR"
    go run -mod=mod cmd/server/main.go &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$PROJECT_ROOT/.backend.pid"

    # Wait for backend to start
    sleep 3
    if ! curl -s http://localhost:9090/api/v1/health >/dev/null; then
        error "Backend failed to start"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    success "Backend ready on port 9090"

    # Start frontend
    log "Starting frontend..."
    cd "$FRONTEND_DIR"
    npm run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$PROJECT_ROOT/.frontend.pid"

    # Wait for frontend to start
    sleep 5
    if ! curl -s http://localhost:5173 >/dev/null; then
        error "Frontend failed to start"
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
        exit 1
    fi
    success "Frontend ready on port 5173"

    cd "$PROJECT_ROOT"

    echo
    echo -e "${GREEN}🎉 DevOps Unity IDE is running in development mode!${NC}"
    echo
    echo -e "${BLUE}Access URLs:${NC}"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend API: http://localhost:9090/api/v1"
    echo
    echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
    echo

    # Setup cleanup trap
    cleanup() {
        echo
        log "Stopping development servers..."
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
        rm -f "$PROJECT_ROOT/.backend.pid" "$PROJECT_ROOT/.frontend.pid"
        success "Development servers stopped"
        exit 0
    }

    trap cleanup INT TERM

    # Keep running
    wait
}

# Build for production
build() {
    log "Building for production..."

    # Build backend
    log "Building backend..."
    cd "$BACKEND_DIR"
    go mod tidy
    go mod vendor
    go build -mod=vendor -o ../bin/server cmd/server/main.go

    if [ ! -f "../bin/server" ]; then
        error "Backend build failed"
        exit 1
    fi
    success "Backend built"

    # Build frontend and Tauri
    log "Building frontend and Tauri app..."
    cd "$FRONTEND_DIR"
    npm run build

    if [ $? -eq 0 ]; then
        success "Frontend built"
    else
        error "Frontend build failed"
        exit 1
    fi

    # Build Tauri (optional, might fail on some systems)
    log "Building Tauri application..."
    if npm run tauri:build; then
        success "Tauri application built"
    else
        warning "Tauri build failed - web version still available"
    fi

    cd "$PROJECT_ROOT"
    success "Production build complete!"
}

# Run tests
test() {
    log "Running tests..."

    # Backend tests
    log "Running backend tests..."
    cd "$BACKEND_DIR"
    if go test ./... -v; then
        success "Backend tests passed"
    else
        error "Backend tests failed"
        cd "$PROJECT_ROOT"
        exit 1
    fi

    # Frontend tests
    log "Running frontend tests..."
    cd "$FRONTEND_DIR"
    if npm test -- --run --watchAll=false; then
        success "Frontend tests passed"
    else
        error "Frontend tests failed"
        cd "$PROJECT_ROOT"
        exit 1
    fi

    cd "$PROJECT_ROOT"
    success "All tests passed!"
}

# Clean build artifacts
clean() {
    log "Cleaning build artifacts..."

    rm -rf "$FRONTEND_DIR/node_modules"
    rm -rf "$FRONTEND_DIR/dist"
    rm -rf "$FRONTEND_DIR/src-tauri/target"
    rm -rf "$BACKEND_DIR/bin"
    rm -f "$PROJECT_ROOT/.backend.pid"
    rm -f "$PROJECT_ROOT/.frontend.pid"

    success "Clean complete"
}

# Show help
show_help() {
    echo "DevOps Unity IDE - Development Tools"
    echo
    echo "Usage: $0 <command>"
    echo
    echo "Commands:"
    echo "  setup     - Setup development environment"
    echo "  dev       - Start development servers"
    echo "  build     - Build for production"
    echo "  test      - Run all tests"
    echo "  clean     - Clean build artifacts"
    echo "  install   - Install IDE system-wide"
    echo "  help      - Show this help"
    echo
    echo "Examples:"
    echo "  $0 setup    # First time setup"
    echo "  $0 dev      # Start development"
    echo "  $0 build    # Production build"
    echo "  $0 test     # Run tests"
}

# Main function
main() {
    case "${1:-help}" in
        "setup")
            check_deps
            setup
            ;;
        "dev")
            check_deps
            dev
            ;;
        "build")
            check_deps
            build
            ;;
        "test")
            check_deps
            test
            ;;
        "clean")
            clean
            ;;
        "install")
            if [ -f "install.sh" ]; then
                ./install.sh
            else
                error "install.sh not found"
                exit 1
            fi
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function
main "$@"
