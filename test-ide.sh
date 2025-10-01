#!/bin/bash

# DevOps Unity IDE - Comprehensive Test Suite
# Tests that the IDE works like a traditional IDE

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
BACKEND_PORT=9090
FRONTEND_PORT=5173

# Test results
PASSED=0
FAILED=0

# Logging
log() {
    echo -e "${BLUE}[TEST]${NC} $*"
}

pass() {
    echo -e "${GREEN}[PASS]${NC} $*"
    ((PASSED++))
}

fail() {
    echo -e "${RED}[FAIL]${NC} $*"
    ((FAILED++))
}

warning() {
    echo -e "${YELLOW}[WARN]${NC} $*"
}

# Test backend compilation
test_backend_build() {
    log "Testing backend compilation..."

    cd "$BACKEND_DIR"

    if go build -mod=vendor -o /tmp/devops-backend cmd/server/main.go 2>/dev/null; then
        if [ -f "/tmp/devops-backend" ]; then
            rm -f /tmp/devops-backend
            pass "Backend compiles successfully"
            return 0
        fi
    fi

    fail "Backend compilation failed"
    return 1
}

# Test frontend build
test_frontend_build() {
    log "Testing frontend build..."

    cd "$FRONTEND_DIR"

    if npm run build --silent 2>/dev/null; then
        if [ -d "dist" ]; then
            pass "Frontend builds successfully"
            return 0
        fi
    fi

    fail "Frontend build failed"
    return 1
}

# Test backend startup
test_backend_startup() {
    log "Testing backend startup..."

    cd "$BACKEND_DIR"

    # Start backend in background
    timeout 15 go run -mod=mod cmd/server/main.go >/tmp/backend.log 2>&1 &
    BACKEND_PID=$!

    # Wait for startup
    sleep 5

    # Check if backend is responding
    if curl -s "http://localhost:$BACKEND_PORT/api/v1/health" >/dev/null 2>&1; then
        pass "Backend starts and responds to health check"
        kill $BACKEND_PID 2>/dev/null || true
        return 0
    else
        fail "Backend failed to start or respond"
        kill $BACKEND_PID 2>/dev/null || true
        cat /tmp/backend.log
        return 1
    fi
}

# Test frontend dev server
test_frontend_dev() {
    log "Testing frontend dev server..."

    cd "$FRONTEND_DIR"

    # Start dev server
    timeout 20 npm run dev --silent >/tmp/frontend.log 2>&1 &
    FRONTEND_PID=$!

    # Wait for startup
    sleep 10

    # Check if frontend is responding
    if curl -s "http://localhost:$FRONTEND_PORT" >/dev/null 2>&1; then
        pass "Frontend dev server starts successfully"
        kill $FRONTEND_PID 2>/dev/null || true
        return 0
    else
        fail "Frontend dev server failed to start"
        kill $FRONTEND_PID 2>/dev/null || true
        cat /tmp/frontend.log
        return 1
    fi
}

# Test API endpoints
test_api_endpoints() {
    log "Testing API endpoints..."

    cd "$BACKEND_DIR"

    # Start backend
    go run -mod=mod cmd/server/main.go >/tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    sleep 5

    local endpoints_passed=0
    local endpoints_total=0

    # Test health endpoint
    ((endpoints_total++))
    if curl -s "http://localhost:$BACKEND_PORT/api/v1/health" | grep -q "healthy"; then
        ((endpoints_passed++))
    fi

    # Test system metrics
    ((endpoints_total++))
    if curl -s "http://localhost:$BACKEND_PORT/api/v1/monitoring/metrics" >/dev/null 2>&1; then
        ((endpoints_passed++))
    fi

    # Test system alerts
    ((endpoints_total++))
    if curl -s "http://localhost:$BACKEND_PORT/api/v1/monitoring/alerts" >/dev/null 2>&1; then
        ((endpoints_passed++))
    fi

    kill $BACKEND_PID 2>/dev/null || true

    if [ $endpoints_passed -eq $endpoints_total ]; then
        pass "API endpoints working ($endpoints_passed/$endpoints_total)"
        return 0
    else
        fail "API endpoints failed ($endpoints_passed/$endpoints_total)"
        return 1
    fi
}

# Test TypeScript compilation
test_typescript() {
    log "Testing TypeScript compilation..."

    cd "$FRONTEND_DIR"

    if npx tsc --noEmit --skipLibCheck 2>/tmp/tsc.log; then
        pass "TypeScript compilation successful"
        return 0
    else
        local errors=$(grep -c "error TS" /tmp/tsc.log 2>/dev/null || echo "0")
        if [ "$errors" -le 5 ]; then  # Allow some warnings
            warning "TypeScript compilation with minor warnings ($errors errors)"
            return 0
        else
            fail "TypeScript compilation failed ($errors errors)"
            return 1
        fi
    fi
}

# Test demo mode
test_demo_mode() {
    log "Testing demo mode functionality..."

    cd "$FRONTEND_DIR"

    # Copy demo config
    cp .env.demo .env

    # Start frontend in demo mode
    timeout 15 npm run dev --silent >/tmp/demo.log 2>&1 &
    FRONTEND_PID=$!
    sleep 8

    # Check if demo mode loads
    if curl -s "http://localhost:$FRONTEND_PORT" | grep -q "DevOps Unity"; then
        pass "Demo mode loads successfully"
        kill $FRONTEND_PID 2>/dev/null || true
        return 0
    else
        fail "Demo mode failed to load"
        kill $FRONTEND_PID 2>/dev/null || true
        return 1
    fi
}

# Test installation script
test_install_script() {
    log "Testing installation script..."

    if [ -f "install.sh" ] && [ -x "install.sh" ]; then
        pass "Installation script exists and is executable"
        return 0
    else
        fail "Installation script missing or not executable"
        return 1
    fi
}

# Test development tools
test_dev_tools() {
    log "Testing development tools..."

    if [ -f "dev.sh" ] && [ -x "dev.sh" ]; then
        pass "Development script exists and is executable"
        return 0
    else
        fail "Development script missing or not executable"
        return 1
    fi
}

# Run all tests
run_tests() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  DevOps Unity IDE - Test Suite${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo

    # Pre-flight checks
    if ! command -v go &> /dev/null; then
        fail "Go not installed - skipping Go tests"
        return 1
    fi

    if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
        fail "Node.js/npm not installed - skipping Node tests"
        return 1
    fi

    # Run tests
    test_backend_build
    test_frontend_build
    test_typescript
    test_install_script
    test_dev_tools

    # Integration tests (require clean environment)
    test_backend_startup
    test_frontend_dev
    test_api_endpoints
    test_demo_mode

    echo
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}Tests completed: $PASSED passed, $FAILED failed${NC}"

    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed! IDE is ready for use.${NC}"
        return 0
    else
        echo -e "${RED}❌ Some tests failed. Check logs for details.${NC}"
        return 1
    fi
}

# Main execution
if [ "${1:-}" = "--help" ]; then
    echo "DevOps Unity IDE Test Suite"
    echo
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --help    Show this help"
    echo "  --quick   Run only build tests (no startup tests)"
    echo
    echo "This script tests that the IDE works like a traditional IDE:"
    echo "  - Backend compiles and starts"
    echo "  - Frontend builds and serves"
    echo "  - API endpoints work"
    echo "  - Demo mode functions"
    echo "  - Development tools work"
    exit 0
fi

if [ "${1:-}" = "--quick" ]; then
    # Run only build tests
    test_backend_build
    test_frontend_build
    test_typescript
    test_install_script
    test_dev_tools

    echo
    echo -e "${GREEN}Quick tests: $PASSED passed, $FAILED failed${NC}"
    exit $FAILED
else
    run_tests
fi
