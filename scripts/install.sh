#!/bin/bash

# DevOps Unity IDE - Installation Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${2}${1}${NC}\n"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Main installation function
main() {
    print_color "=====================================" "$GREEN"
    print_color "  DevOps Unity IDE - Installation   " "$GREEN"
    print_color "=====================================" "$GREEN"
    echo ""

    # Detect operating system
    OS=$(detect_os)
    print_color "Detected OS: $OS" "$YELLOW"
    echo ""

    # Check prerequisites
    print_color "Checking prerequisites..." "$YELLOW"
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_color "✓ Node.js installed: $NODE_VERSION" "$GREEN"
    else
        print_color "✗ Node.js not found. Please install Node.js 18+" "$RED"
        print_color "  Visit: https://nodejs.org/" "$YELLOW"
        exit 1
    fi

    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_color "✓ npm installed: $NPM_VERSION" "$GREEN"
    else
        print_color "✗ npm not found" "$RED"
        exit 1
    fi

    # Check Go
    if command_exists go; then
        GO_VERSION=$(go version | awk '{print $3}')
        print_color "✓ Go installed: $GO_VERSION" "$GREEN"
    else
        print_color "✗ Go not found. Please install Go 1.21+" "$RED"
        print_color "  Visit: https://go.dev/dl/" "$YELLOW"
        exit 1
    fi

    # Check Rust
    if command_exists rustc; then
        RUST_VERSION=$(rustc --version | awk '{print $2}')
        print_color "✓ Rust installed: $RUST_VERSION" "$GREEN"
    else
        print_color "✗ Rust not found. Installing Rust..." "$YELLOW"
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source "$HOME/.cargo/env"
        print_color "✓ Rust installed successfully" "$GREEN"
    fi

    # Check Docker
    if command_exists docker; then
        DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//')
        print_color "✓ Docker installed: $DOCKER_VERSION" "$GREEN"
    else
        print_color "⚠ Docker not found (optional for full functionality)" "$YELLOW"
        print_color "  Visit: https://www.docker.com/get-started" "$YELLOW"
    fi

    # Check kubectl
    if command_exists kubectl; then
        KUBECTL_VERSION=$(kubectl version --client --short 2>/dev/null | awk '{print $3}')
        print_color "✓ kubectl installed: $KUBECTL_VERSION" "$GREEN"
    else
        print_color "⚠ kubectl not found (optional for Kubernetes features)" "$YELLOW"
        print_color "  Visit: https://kubernetes.io/docs/tasks/tools/" "$YELLOW"
    fi

    # Check Ansible
    if command_exists ansible; then
        ANSIBLE_VERSION=$(ansible --version | head -1 | awk '{print $2}')
        print_color "✓ Ansible installed: $ANSIBLE_VERSION" "$GREEN"
    else
        print_color "⚠ Ansible not found (optional for Ansible features)" "$YELLOW"
        if [[ "$OS" == "macos" ]]; then
            print_color "  Install with: brew install ansible" "$YELLOW"
        else
            print_color "  Install with: pip install ansible" "$YELLOW"
        fi
    fi

    echo ""
    print_color "Installing DevOps Unity IDE..." "$YELLOW"
    echo ""

    # Create necessary directories
    mkdir -p frontend/src-tauri/icons
    mkdir -p backend/cmd/server
    mkdir -p backend/internal/{api,services,models}
    mkdir -p extensions/sdk
    mkdir -p scripts
    mkdir -p docs

    # Install frontend dependencies
    print_color "Installing frontend dependencies..." "$YELLOW"
    cd frontend
    npm install
    cd ..

    # Initialize Go module if needed
    if [ ! -f "backend/go.mod" ]; then
        print_color "Initializing Go module..." "$YELLOW"
        cd backend
        go mod init devops-unity-backend
        go mod tidy
        cd ..
    fi

    # Build Rust/Tauri components
    print_color "Building Tauri components..." "$YELLOW"
    cd frontend/src-tauri
    cargo build
    cd ../..

    # Create default configuration
    print_color "Creating default configuration..." "$YELLOW"
    mkdir -p "$HOME/.config/devops-unity-ide"
    cat > "$HOME/.config/devops-unity-ide/config.yaml" << EOF
# DevOps Unity IDE Configuration
theme: dark
language: en
modules:
  docker:
    enabled: true
    socket: unix:///var/run/docker.sock
  kubernetes:
    enabled: true
    config: ~/.kube/config
  ansible:
    enabled: true
    inventory: ./inventory
monitoring:
  interval: 5s
  retention: 30d
extensions:
  auto_update: true
  registry: https://extensions.devops-unity.io
EOF

    print_color "✓ Configuration created at ~/.config/devops-unity-ide/config.yaml" "$GREEN"

    # Create desktop entry for Linux
    if [[ "$OS" == "linux" ]]; then
        print_color "Creating desktop entry..." "$YELLOW"
        cat > "$HOME/.local/share/applications/devops-unity-ide.desktop" << EOF
[Desktop Entry]
Name=DevOps Unity IDE
Comment=The unified platform for modern infrastructure
Exec=$PWD/scripts/start.sh
Icon=$PWD/frontend/src-tauri/icons/icon.png
Terminal=false
Type=Application
Categories=Development;
EOF
        chmod +x "$HOME/.local/share/applications/devops-unity-ide.desktop"
        print_color "✓ Desktop entry created" "$GREEN"
    fi

    # Create start script
    print_color "Creating start script..." "$YELLOW"
    cat > scripts/start.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")/.."
make run
EOF
    chmod +x scripts/start.sh

    echo ""
    print_color "=====================================" "$GREEN"
    print_color "  Installation Complete!             " "$GREEN"
    print_color "=====================================" "$GREEN"
    echo ""
    print_color "To start DevOps Unity IDE, run:" "$YELLOW"
    print_color "  make run" "$GREEN"
    print_color "    or" "$YELLOW"
    print_color "  ./scripts/start.sh" "$GREEN"
    echo ""
    print_color "For development mode, run:" "$YELLOW"
    print_color "  make dev" "$GREEN"
    echo ""
    print_color "For help, run:" "$YELLOW"
    print_color "  make help" "$GREEN"
    echo ""
}

# Run main function
main "$@"
