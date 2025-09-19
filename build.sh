#!/bin/bash

# DevOps Unity IDE Build Script
# Generates executables for all platforms

set -e

echo "🚀 DevOps Unity IDE - Build Script"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Node.js $(node -v)${NC}"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ npm $(npm -v)${NC}"
    
    # Check Rust
    if ! command -v rustc &> /dev/null; then
        echo -e "${RED}❌ Rust is not installed${NC}"
        echo "Please install Rust from https://rustup.rs/"
        exit 1
    fi
    echo -e "${GREEN}✓ Rust $(rustc --version)${NC}"
    
    # Check Tauri CLI
    if ! command -v cargo-tauri &> /dev/null; then
        echo -e "${YELLOW}Installing Tauri CLI...${NC}"
        cargo install tauri-cli
    fi
    echo -e "${GREEN}✓ Tauri CLI installed${NC}"
}

# Install dependencies
install_dependencies() {
    echo -e "\n${YELLOW}Installing dependencies...${NC}"
    
    # Frontend dependencies
    echo "Installing frontend dependencies..."
    cd frontend
    npm install --legacy-peer-deps
    
    # Rust dependencies
    echo "Installing Rust dependencies..."
    cd src-tauri
    cargo build --release
    cd ../..
}

# Build frontend
build_frontend() {
    echo -e "\n${YELLOW}Building frontend...${NC}"
    cd frontend
    npm run build
    cd ..
    echo -e "${GREEN}✓ Frontend built successfully${NC}"
}

# Build backend
build_backend() {
    echo -e "\n${YELLOW}Building Go backend...${NC}"
    cd backend
    go mod download
    go build -o ../dist/backend-server ./cmd/server
    cd ..
    echo -e "${GREEN}✓ Backend built successfully${NC}"
}

# Build Tauri app for current platform
build_tauri() {
    echo -e "\n${YELLOW}Building Tauri application...${NC}"
    cd frontend
    
    # Build for current platform
    npm run tauri:build
    
    cd ..
    echo -e "${GREEN}✓ Tauri application built successfully${NC}"
}

# Create installers
create_installers() {
    echo -e "\n${YELLOW}Creating installers...${NC}"
    
    PLATFORM=$(uname -s)
    
    case $PLATFORM in
        Darwin)
            echo "Building for macOS..."
            # The DMG will be in frontend/src-tauri/target/release/bundle/dmg/
            if [ -f "frontend/src-tauri/target/release/bundle/dmg/DevOps Unity IDE_0.1.0_x64.dmg" ]; then
                cp "frontend/src-tauri/target/release/bundle/dmg/DevOps Unity IDE_0.1.0_x64.dmg" "dist/DevOpsUnityIDE-macOS.dmg"
                echo -e "${GREEN}✓ macOS installer created: dist/DevOpsUnityIDE-macOS.dmg${NC}"
            fi
            
            # Also create app bundle
            if [ -d "frontend/src-tauri/target/release/bundle/macos/DevOps Unity IDE.app" ]; then
                cp -r "frontend/src-tauri/target/release/bundle/macos/DevOps Unity IDE.app" "dist/"
                echo -e "${GREEN}✓ macOS app bundle created: dist/DevOps Unity IDE.app${NC}"
            fi
            ;;
            
        Linux)
            echo "Building for Linux..."
            # AppImage
            if [ -f "frontend/src-tauri/target/release/bundle/appimage/devops-unity-ide_0.1.0_amd64.AppImage" ]; then
                cp "frontend/src-tauri/target/release/bundle/appimage/devops-unity-ide_0.1.0_amd64.AppImage" "dist/DevOpsUnityIDE-linux.AppImage"
                chmod +x "dist/DevOpsUnityIDE-linux.AppImage"
                echo -e "${GREEN}✓ Linux AppImage created: dist/DevOpsUnityIDE-linux.AppImage${NC}"
            fi
            
            # Debian package
            if [ -f "frontend/src-tauri/target/release/bundle/deb/devops-unity-ide_0.1.0_amd64.deb" ]; then
                cp "frontend/src-tauri/target/release/bundle/deb/devops-unity-ide_0.1.0_amd64.deb" "dist/DevOpsUnityIDE-linux.deb"
                echo -e "${GREEN}✓ Debian package created: dist/DevOpsUnityIDE-linux.deb${NC}"
            fi
            ;;
            
        MINGW*|CYGWIN*|MSYS*)
            echo "Building for Windows..."
            # MSI installer
            if [ -f "frontend/src-tauri/target/release/bundle/msi/DevOps Unity IDE_0.1.0_x64_en-US.msi" ]; then
                cp "frontend/src-tauri/target/release/bundle/msi/DevOps Unity IDE_0.1.0_x64_en-US.msi" "dist/DevOpsUnityIDE-windows.msi"
                echo -e "${GREEN}✓ Windows MSI installer created: dist/DevOpsUnityIDE-windows.msi${NC}"
            fi
            
            # EXE
            if [ -f "frontend/src-tauri/target/release/devops-unity-ide.exe" ]; then
                cp "frontend/src-tauri/target/release/devops-unity-ide.exe" "dist/DevOpsUnityIDE.exe"
                echo -e "${GREEN}✓ Windows executable created: dist/DevOpsUnityIDE.exe${NC}"
            fi
            ;;
    esac
}

# Create distribution folder
create_dist() {
    echo -e "\n${YELLOW}Creating distribution folder...${NC}"
    mkdir -p dist
    
    # Copy README and LICENSE
    cp README.md dist/
    cp LICENSE dist/
    
    # Create quick start guide
    cat > dist/QUICK_START.md << 'EOL'
# DevOps Unity IDE - Quick Start Guide

## Installation

### macOS
1. Open the DMG file
2. Drag DevOps Unity IDE to your Applications folder
3. Launch from Applications

### Linux
**AppImage:**
```bash
chmod +x DevOpsUnityIDE-linux.AppImage
./DevOpsUnityIDE-linux.AppImage
```

**Debian/Ubuntu:**
```bash
sudo dpkg -i DevOpsUnityIDE-linux.deb
```

### Windows
1. Run the MSI installer
2. Follow the installation wizard
3. Launch from Start Menu

## First Run

1. Launch DevOps Unity IDE
2. Configure your cloud providers (AWS, Azure, GCP)
3. Connect to your Kubernetes clusters
4. Start managing your infrastructure!

## Features

- 🐳 Docker Management
- ☸️ Kubernetes Operations
- 📚 Ansible Playbooks
- 🤖 AI Assistant
- 🔐 Security Scanner
- ☁️ Multi-Cloud Support
- 📊 Real-time Monitoring
- 🚀 CI/CD Pipeline Designer
- 💰 Cost Optimizer
- 🎯 Chaos Engineering

## Support

- GitHub: https://github.com/flori92/Unity-IDE
- Documentation: https://github.com/flori92/Unity-IDE/wiki

Enjoy DevOps Unity IDE! 🚀
EOL
    
    echo -e "${GREEN}✓ Distribution folder created${NC}"
}

# Main build process
main() {
    echo -e "\n${GREEN}Starting build process...${NC}\n"
    
    check_prerequisites
    install_dependencies
    build_frontend
    build_backend
    build_tauri
    create_dist
    create_installers
    
    echo -e "\n${GREEN}================================${NC}"
    echo -e "${GREEN}✅ Build completed successfully!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo -e "\nExecutables are available in the ${YELLOW}dist/${NC} folder"
    echo -e "\nTo install:"
    echo -e "  macOS: Open ${YELLOW}dist/DevOpsUnityIDE-macOS.dmg${NC}"
    echo -e "  Linux: Run ${YELLOW}dist/DevOpsUnityIDE-linux.AppImage${NC}"
    echo -e "  Windows: Run ${YELLOW}dist/DevOpsUnityIDE-windows.msi${NC}"
}

# Run main function
main
