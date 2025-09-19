#!/bin/bash

# DevOps Unity IDE - macOS Build Script
# Script spécialisé pour la génération DMG sur macOS

set -e

echo "🍎 DevOps Unity IDE - macOS Build Script"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="DevOps Unity IDE"
VERSION="1.0.0"
DIST_DIR="dist"
TAURI_DIR="frontend/src-tauri"

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
    
    # Check if we're on macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo -e "${RED}❌ This script is designed for macOS only${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Running on macOS${NC}"
}

# Clean previous builds
clean_builds() {
    echo -e "\n${YELLOW}Cleaning previous builds...${NC}"
    
    # Clean frontend build
    if [ -d "frontend/dist" ]; then
        rm -rf frontend/dist
        echo -e "${GREEN}✓ Cleaned frontend/dist${NC}"
    fi
    
    # Clean Tauri target
    if [ -d "$TAURI_DIR/target" ]; then
        rm -rf "$TAURI_DIR/target"
        echo -e "${GREEN}✓ Cleaned Tauri target${NC}"
    fi
    
    # Clean dist directory
    if [ -d "$DIST_DIR" ]; then
        rm -rf "$DIST_DIR"
        echo -e "${GREEN}✓ Cleaned dist directory${NC}"
    fi
    
    mkdir -p "$DIST_DIR"
}

# Install dependencies
install_dependencies() {
    echo -e "\n${YELLOW}Installing dependencies...${NC}"
    
    # Frontend dependencies
    echo "Installing frontend dependencies..."
    cd frontend
    npm install --legacy-peer-deps
    cd ..
    
    # Backend dependencies
    echo "Installing backend dependencies..."
    cd backend
    go mod download
    cd ..
    
    echo -e "${GREEN}✓ Dependencies installed${NC}"
}

# Build backend
build_backend() {
    echo -e "\n${YELLOW}Building Go backend...${NC}"
    cd backend
    
    # Build for current architecture
    ARCH=$(uname -m)
    if [[ "$ARCH" == "arm64" ]]; then
        GOARCH="arm64"
    else
        GOARCH="amd64"
    fi
    
    GOOS=darwin GOARCH=$GOARCH go build -o ../$DIST_DIR/backend-server ./cmd/server
    echo -e "${GREEN}✓ Backend built for $GOARCH${NC}"
    cd ..
}

# Build frontend
build_frontend() {
    echo -e "\n${YELLOW}Building frontend...${NC}"
    cd frontend
    npm run build
    echo -e "${GREEN}✓ Frontend built successfully${NC}"
    cd ..
}

# Build Tauri app
build_tauri() {
    echo -e "\n${YELLOW}Building Tauri application...${NC}"
    cd frontend
    
    # Build for current architecture
    ARCH=$(uname -m)
    if [[ "$ARCH" == "arm64" ]]; then
        echo "Building for Apple Silicon (ARM64)..."
        npm run tauri:build
    else
        echo "Building for Intel (x64)..."
        npm run tauri:build
    fi
    
    echo -e "${GREEN}✓ Tauri application built successfully${NC}"
    cd ..
}

# Create DMG installer
create_dmg() {
    echo -e "\n${YELLOW}Creating DMG installer...${NC}"
    
    # Find the generated DMG
    DMG_DIR="$TAURI_DIR/target/release/bundle/dmg"
    
    if [ ! -d "$DMG_DIR" ]; then
        echo -e "${RED}❌ DMG directory not found: $DMG_DIR${NC}"
        echo "Available files in target/release/bundle/:"
        ls -la "$TAURI_DIR/target/release/bundle/" 2>/dev/null || echo "Bundle directory not found"
        exit 1
    fi
    
    # Find the DMG file
    DMG_FILE=$(find "$DMG_DIR" -name "*.dmg" | head -1)
    
    if [ -z "$DMG_FILE" ]; then
        echo -e "${RED}❌ No DMG file found in $DMG_DIR${NC}"
        echo "Available files:"
        ls -la "$DMG_DIR"
        exit 1
    fi
    
    echo -e "${BLUE}Found DMG: $DMG_FILE${NC}"
    
    # Copy DMG to dist directory
    ARCH=$(uname -m)
    if [[ "$ARCH" == "arm64" ]]; then
        DMG_NAME="DevOpsUnityIDE-macOS-ARM64.dmg"
    else
        DMG_NAME="DevOpsUnityIDE-macOS-x64.dmg"
    fi
    
    cp "$DMG_FILE" "$DIST_DIR/$DMG_NAME"
    echo -e "${GREEN}✓ DMG installer created: $DIST_DIR/$DMG_NAME${NC}"
    
    # Also copy the app bundle
    APP_BUNDLE_DIR="$TAURI_DIR/target/release/bundle/macos"
    if [ -d "$APP_BUNDLE_DIR" ]; then
        APP_BUNDLE=$(find "$APP_BUNDLE_DIR" -name "*.app" | head -1)
        if [ -n "$APP_BUNDLE" ]; then
            cp -r "$APP_BUNDLE" "$DIST_DIR/"
            echo -e "${GREEN}✓ App bundle copied to dist/${NC}"
        fi
    fi
}

# Create installation instructions
create_instructions() {
    echo -e "\n${YELLOW}Creating installation instructions...${NC}"
    
    cat > "$DIST_DIR/INSTALL.md" << 'EOL'
# DevOps Unity IDE - Installation Instructions

## macOS Installation

### Method 1: DMG Installer (Recommended)
1. Double-click the DMG file to mount it
2. Drag "DevOps Unity IDE" to your Applications folder
3. Launch from Applications or Spotlight

### Method 2: App Bundle
1. Copy the "DevOps Unity IDE.app" to your Applications folder
2. Right-click and select "Open" (first time only)
3. Launch from Applications or Spotlight

## First Launch
- The application may take a moment to start on first launch
- You may see a security warning - click "Open" to proceed
- The backend server will start automatically

## Troubleshooting
- If the app doesn't start, try running it from Terminal:
  ```bash
  /Applications/DevOps\ Unity\ IDE.app/Contents/MacOS/DevOps\ Unity\ IDE
  ```
- Check the console for any error messages
- Ensure you have the required permissions for network access

## System Requirements
- macOS 10.15 or later
- 4GB RAM minimum
- 500MB free disk space

Enjoy using DevOps Unity IDE! 🚀
EOL
    
    echo -e "${GREEN}✓ Installation instructions created${NC}"
}

# Main build process
main() {
    echo -e "\n${GREEN}Starting macOS build process...${NC}\n"
    
    check_prerequisites
    clean_builds
    install_dependencies
    build_backend
    build_frontend
    build_tauri
    create_dmg
    create_instructions
    
    echo -e "\n${GREEN}================================${NC}"
    echo -e "${GREEN}✅ macOS build completed successfully!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo -e "\n📦 Build artifacts are available in the ${YELLOW}$DIST_DIR/${NC} folder"
    echo -e "\n🚀 To install:"
    echo -e "  1. Open the DMG file in ${YELLOW}$DIST_DIR/${NC}"
    echo -e "  2. Drag the app to your Applications folder"
    echo -e "  3. Launch from Applications or Spotlight"
    echo -e "\n📋 For detailed instructions, see ${YELLOW}$DIST_DIR/INSTALL.md${NC}"
}

# Run main function
main
