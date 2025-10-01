#!/bin/bash

# DevOps Unity IDE - Installation Script
# Renders the IDE truly installable like VS Code

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="DevOps Unity IDE"
PROJECT_VERSION="1.0.0"
INSTALL_DIR="$HOME/.devops-unity-ide"
BIN_DIR="$HOME/.local/bin"
CONFIG_DIR="$HOME/.config/devops-unity-ide"
DATA_DIR="$HOME/.local/share/devops-unity-ide"
LOG_FILE="$HOME/.devops-unity-ide/install.log"

# Create log directory first
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $*" >> "$LOG_FILE"
    echo -e "${BLUE}[INFO]${NC} $*"
}

error() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ERROR: $*" >> "$LOG_FILE"
    echo -e "${RED}[ERROR]${NC} $*" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*"
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."

    # Check OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        OS="windows"
    else
        error "Unsupported operating system: $OSTYPE"
        exit 1
    fi

    success "Detected OS: $OS"

    # Check required tools
    local required_tools=("curl" "tar" "unzip")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            error "Required tool not found: $tool"
            exit 1
        fi
    done

    # Check programming languages
    if ! command -v node &> /dev/null; then
        error "Node.js is required. Please install it from https://nodejs.org/"
        exit 1
    fi

    if ! command -v go &> /dev/null; then
        error "Go is required. Please install it from https://golang.org/"
        exit 1
    fi

    if ! command -v cargo &> /dev/null; then
        error "Rust/Cargo is required. Please install it from https://rustup.rs/"
        exit 1
    fi

    success "All requirements satisfied"
}

# Download and extract the IDE
download_and_extract() {
    log "Downloading $PROJECT_NAME $PROJECT_VERSION..."

    # Get the actual script directory (where install.sh is located)
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # The source is the directory containing install.sh
    local source_dir="$script_dir"

    if [[ ! -d "$source_dir" ]]; then
        error "Source directory not found: $source_dir"
        exit 1
    fi

    success "Using local source directory: $source_dir"

    # Create temporary directory for build
    local temp_dir=$(mktemp -d)
    
    # Copy only the necessary files (not system temp files!)
    log "Copying source files to temporary build directory..."
    
    # Copy backend
    if [[ -d "$source_dir/backend" ]]; then
        cp -r "$source_dir/backend" "$temp_dir/"
    fi
    
    # Copy frontend
    if [[ -d "$source_dir/frontend" ]]; then
        cp -r "$source_dir/frontend" "$temp_dir/"
    fi
    
    # Copy scripts
    if [[ -d "$source_dir/scripts" ]]; then
        cp -r "$source_dir/scripts" "$temp_dir/"
    fi
    
    # Create bin directory
    mkdir -p "$temp_dir/bin"
    
    # Change to temp directory for build
    cd "$temp_dir"

    log "Source copied to temp directory: $temp_dir"
}

# Build the backend
build_backend() {
    log "Building backend..."

    cd backend

    # Clean and build
    go mod tidy
    go build -o ../bin/server cmd/server/main.go

    if [[ ! -f "../bin/server" ]]; then
        error "Backend build failed"
        exit 1
    fi

    success "Backend built successfully"
}

# Build the frontend and Tauri app
build_frontend() {
    log "Building frontend and Tauri application..."

    cd frontend

    # Install dependencies
    npm install

    # Build for production
    npm run build

    # Build Tauri application
    npm run tauri:build

    # Check if build succeeded
    if [[ ! -d "src-tauri/target/release" ]]; then
        warning "Tauri build may have failed - checking alternative locations..."
    fi

    success "Frontend and Tauri application built"
}

# Install the application
install_app() {
    log "Installing $PROJECT_NAME..."

    # Create directories
    mkdir -p "$INSTALL_DIR"
    mkdir -p "$BIN_DIR"
    mkdir -p "$CONFIG_DIR"
    mkdir -p "$DATA_DIR"

    # Copy built application
    if [[ -d "frontend/src-tauri/target/release" ]]; then
        cp -r frontend/src-tauri/target/release/* "$INSTALL_DIR/"
    elif [[ -d "frontend/dist" ]]; then
        warning "Using web build instead of native app"
        cp -r frontend/dist/* "$INSTALL_DIR/"
    else
        error "No built application found"
        exit 1
    fi

    # Copy backend
    if [[ -f "bin/server" ]]; then
        cp bin/server "$INSTALL_DIR/"
        chmod +x "$INSTALL_DIR/server"
    fi

    # Create wrapper script
    cat > "$BIN_DIR/devops-unity-ide" << 'EOF'
#!/bin/bash

# DevOps Unity IDE Launcher
INSTALL_DIR="$HOME/.devops-unity-ide"
CONFIG_DIR="$HOME/.config/devops-unity-ide"
DATA_DIR="$HOME/.local/share/devops-unity-ide"

# Create directories if they don't exist
mkdir -p "$CONFIG_DIR"
mkdir -p "$DATA_DIR"

# Set environment variables
export DEVOPS_UNITY_CONFIG="$CONFIG_DIR"
export DEVOPS_UNITY_DATA="$DATA_DIR"

# Start backend if available
if [[ -f "$INSTALL_DIR/server" ]]; then
    echo "Starting DevOps Unity IDE backend..."
    nohup "$INSTALL_DIR/server" > "$DATA_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$DATA_DIR/backend.pid"

    # Wait a moment for backend to start
    sleep 3
fi

# Start frontend
if [[ -f "$INSTALL_DIR/devops-unity-ide" ]]; then
    # Native app
    "$INSTALL_DIR/devops-unity-ide"
elif [[ -f "$INSTALL_DIR/index.html" ]]; then
    # Web app - open in browser
    if command -v xdg-open &> /dev/null; then
        xdg-open "file://$INSTALL_DIR/index.html"
    elif command -v open &> /dev/null; then
        open "file://$INSTALL_DIR/index.html"
    else
        echo "Please open $INSTALL_DIR/index.html in your browser"
    fi
else
    echo "Error: Could not find application to launch"
    exit 1
fi
EOF

    chmod +x "$BIN_DIR/devops-unity-ide"

    # Create desktop entry for Linux
    if [[ "$OS" == "linux" ]]; then
        mkdir -p "$HOME/.local/share/applications"
        cat > "$HOME/.local/share/applications/devops-unity-ide.desktop" << EOF
[Desktop Entry]
Name=DevOps Unity IDE
Exec=$BIN_DIR/devops-unity-ide
Icon=$INSTALL_DIR/icons/128x128.png
Type=Application
Categories=Development;IDE;
Comment=Unified DevOps IDE for Docker, Kubernetes, and Ansible
EOF
        chmod +x "$HOME/.local/share/applications/devops-unity-ide.desktop"
    fi

    # Create default configuration
    cat > "$CONFIG_DIR/config.json" << EOF
{
  "theme": "dark",
  "language": "fr",
  "modules": {
    "docker": {
      "enabled": true
    },
    "kubernetes": {
      "enabled": true
    },
    "ansible": {
      "enabled": true
    },
    "monitoring": {
      "enabled": true,
      "interval": "5s"
    }
  },
  "extensions": {
    "autoUpdate": true,
    "registry": "https://extensions.devops-unity.io"
  }
}
EOF

    success "$PROJECT_NAME installed successfully!"
}

# Post-installation setup
post_install() {
    log "Performing post-installation setup..."

    # Add to PATH if not already there
    if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
        echo "export PATH=\"$BIN_DIR:\$PATH\"" >> "$HOME/.bashrc"
        echo "export PATH=\"$BIN_DIR:\$PATH\"" >> "$HOME/.zshrc" 2>/dev/null || true
        warning "Added $BIN_DIR to PATH. Please restart your terminal or run 'source ~/.bashrc'"
    fi

    # Create uninstall script
    cat > "$INSTALL_DIR/uninstall.sh" << EOF
#!/bin/bash
echo "Uninstalling DevOps Unity IDE..."

# Stop running processes
if [[ -f "$DATA_DIR/backend.pid" ]]; then
    kill \$(cat "$DATA_DIR/backend.pid") 2>/dev/null || true
    rm -f "$DATA_DIR/backend.pid"
fi

# Remove files
rm -rf "$INSTALL_DIR"
rm -rf "$CONFIG_DIR"
rm -rf "$DATA_DIR"
rm -f "$BIN_DIR/devops-unity-ide"
rm -f "$HOME/.local/share/applications/devops-unity-ide.desktop"

echo "DevOps Unity IDE uninstalled successfully!"
EOF

    chmod +x "$INSTALL_DIR/uninstall.sh"

    success "Post-installation setup completed"
}

# Main installation function
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════╗"
    echo "║        DevOps Unity IDE Installer        ║"
    echo "║        Version $PROJECT_VERSION                  ║"
    echo "╚══════════════════════════════════════════╝"
    echo -e "${NC}"

    log "Starting installation of $PROJECT_NAME $PROJECT_VERSION"

    # Run installation steps
    check_requirements
    download_and_extract
    build_backend
    build_frontend
    install_app
    post_install

    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════╗"
    echo "║        Installation Completed!           ║"
    echo "╚══════════════════════════════════════════╝"
    echo -e "${NC}"

    echo -e "${GREEN}DevOps Unity IDE has been successfully installed!${NC}"
    echo ""
    echo "To start the IDE:"
    echo "  devops-unity-ide"
    echo ""
    echo "Or from the application menu on Linux"
    echo ""
    echo "Installation directory: $INSTALL_DIR"
    echo "Configuration: $CONFIG_DIR"
    echo "Data: $DATA_DIR"
    echo ""
    echo "To uninstall: $INSTALL_DIR/uninstall.sh"
    echo ""
    echo "Log file: $LOG_FILE"

    log "Installation completed successfully"
}

# Handle command line arguments
case "${1:-}" in
    "--help"|"-h")
        echo "DevOps Unity IDE Installer"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h          Show this help message"
        echo "  --uninstall         Uninstall DevOps Unity IDE"
        echo "  --version, -v       Show version information"
        echo ""
        echo "Examples:"
        echo "  $0                  Install DevOps Unity IDE"
        echo "  $0 --uninstall      Uninstall DevOps Unity IDE"
        exit 0
        ;;
    "--uninstall")
        if [[ -f "$INSTALL_DIR/uninstall.sh" ]]; then
            "$INSTALL_DIR/uninstall.sh"
        else
            error "Uninstall script not found. Please manually remove $INSTALL_DIR"
            exit 1
        fi
        ;;
    "--version"|"-v")
        echo "$PROJECT_NAME $PROJECT_VERSION"
        exit 0
        ;;
    *)
        main
        ;;
esac
