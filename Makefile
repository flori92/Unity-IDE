# DevOps Unity IDE - Makefile

.PHONY: help install build run test clean dev docker-build docker-run

# Variables
FRONTEND_DIR = frontend
BACKEND_DIR = backend
TAURI_DIR = $(FRONTEND_DIR)/src-tauri
EXTENSIONS_DIR = extensions

# Colors for output
GREEN = \033[0;32m
YELLOW = \033[1;33m
NC = \033[0m # No Color

help: ## Show this help message
	@echo "$(GREEN)DevOps Unity IDE - Build System$(NC)"
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Install all dependencies
	@echo "$(GREEN)Installing frontend dependencies...$(NC)"
	cd $(FRONTEND_DIR) && npm install
	@echo "$(GREEN)Installing Tauri CLI...$(NC)"
	cd $(FRONTEND_DIR) && npm install --save-dev @tauri-apps/cli
	@echo "$(GREEN)Installing backend dependencies...$(NC)"
	cd $(BACKEND_DIR) && go mod init devops-unity-backend 2>/dev/null || true
	cd $(BACKEND_DIR) && go mod tidy
	@echo "$(GREEN)Installing Rust dependencies...$(NC)"
	cd $(TAURI_DIR) && cargo build --release
	@echo "$(GREEN)Dependencies installed successfully!$(NC)"

build: ## Build the application for production
	@echo "$(GREEN)Building frontend...$(NC)"
	cd $(FRONTEND_DIR) && npm run build
	@echo "$(GREEN)Building Tauri application...$(NC)"
	cd $(FRONTEND_DIR) && npm run tauri:build
	@echo "$(GREEN)Building backend...$(NC)"
	cd $(BACKEND_DIR) && go build -o bin/server cmd/server/main.go
	@echo "$(GREEN)Build complete!$(NC)"

dev: ## Run in development mode
	@echo "$(GREEN)Starting development servers...$(NC)"
	@echo "$(YELLOW)Starting backend server...$(NC)"
	cd $(BACKEND_DIR) && go run cmd/server/main.go &
	@echo "$(YELLOW)Starting Tauri dev server...$(NC)"
	cd $(FRONTEND_DIR) && npm run tauri:dev

run: ## Run the application
	@echo "$(GREEN)Starting DevOps Unity IDE...$(NC)"
	cd $(FRONTEND_DIR) && npm run tauri:dev

test: ## Run all tests
	@echo "$(GREEN)Running frontend tests...$(NC)"
	cd $(FRONTEND_DIR) && npm test -- --run
	@echo "$(GREEN)Running backend tests...$(NC)"
	cd $(BACKEND_DIR) && go test ./...
	@echo "$(GREEN)Running Rust tests...$(NC)"
	cd $(TAURI_DIR) && cargo test
	@echo "$(GREEN)All tests passed!$(NC)"

test-watch: ## Run tests in watch mode
	cd $(FRONTEND_DIR) && npm test

lint: ## Run linters
	@echo "$(GREEN)Linting frontend code...$(NC)"
	cd $(FRONTEND_DIR) && npm run lint
	@echo "$(GREEN)Linting backend code...$(NC)"
	cd $(BACKEND_DIR) && golangci-lint run ./... 2>/dev/null || go fmt ./...
	@echo "$(GREEN)Linting Rust code...$(NC)"
	cd $(TAURI_DIR) && cargo clippy

format: ## Format all code
	@echo "$(GREEN)Formatting frontend code...$(NC)"
	cd $(FRONTEND_DIR) && npx prettier --write "src/**/*.{ts,tsx,js,jsx,css,scss}"
	@echo "$(GREEN)Formatting backend code...$(NC)"
	cd $(BACKEND_DIR) && go fmt ./...
	@echo "$(GREEN)Formatting Rust code...$(NC)"
	cd $(TAURI_DIR) && cargo fmt

clean: ## Clean build artifacts
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	rm -rf $(FRONTEND_DIR)/dist
	rm -rf $(FRONTEND_DIR)/node_modules
	rm -rf $(TAURI_DIR)/target
	rm -rf $(BACKEND_DIR)/bin
	@echo "$(GREEN)Clean complete!$(NC)"

docker-build: ## Build Docker image
	@echo "$(GREEN)Building Docker image...$(NC)"
	docker build -t devops-unity-ide:latest .
	@echo "$(GREEN)Docker image built successfully!$(NC)"

docker-run: ## Run application in Docker
	@echo "$(GREEN)Running application in Docker...$(NC)"
	docker run -d \
		-p 3000:3000 \
		-p 8080:8080 \
		-v /var/run/docker.sock:/var/run/docker.sock \
		--name devops-unity-ide \
		devops-unity-ide:latest
	@echo "$(GREEN)Application running at http://localhost:3000$(NC)"

docker-stop: ## Stop Docker container
	@echo "$(YELLOW)Stopping Docker container...$(NC)"
	docker stop devops-unity-ide
	docker rm devops-unity-ide
	@echo "$(GREEN)Container stopped!$(NC)"

setup-dev: ## Setup development environment
	@echo "$(GREEN)Setting up development environment...$(NC)"
	@command -v node >/dev/null 2>&1 || { echo "$(YELLOW)Please install Node.js$(NC)"; exit 1; }
	@command -v go >/dev/null 2>&1 || { echo "$(YELLOW)Please install Go$(NC)"; exit 1; }
	@command -v cargo >/dev/null 2>&1 || { echo "$(YELLOW)Please install Rust$(NC)"; exit 1; }
	@command -v docker >/dev/null 2>&1 || { echo "$(YELLOW)Please install Docker$(NC)"; exit 1; }
	$(MAKE) install
	@echo "$(GREEN)Development environment ready!$(NC)"

release: ## Create a new release
	@echo "$(GREEN)Creating release...$(NC)"
	cd $(FRONTEND_DIR) && npm version patch
	git add .
	git commit -m "Release v$$(cat $(FRONTEND_DIR)/package.json | grep version | head -1 | awk -F: '{ print $$2 }' | sed 's/[",]//g' | tr -d ' ')"
	git tag v$$(cat $(FRONTEND_DIR)/package.json | grep version | head -1 | awk -F: '{ print $$2 }' | sed 's/[",]//g' | tr -d ' ')
	@echo "$(GREEN)Release created! Don't forget to push tags: git push --tags$(NC)"

update-deps: ## Update all dependencies
	@echo "$(GREEN)Updating frontend dependencies...$(NC)"
	cd $(FRONTEND_DIR) && npm update
	@echo "$(GREEN)Updating backend dependencies...$(NC)"
	cd $(BACKEND_DIR) && go get -u ./...
	cd $(BACKEND_DIR) && go mod tidy
	@echo "$(GREEN)Updating Rust dependencies...$(NC)"
	cd $(TAURI_DIR) && cargo update
	@echo "$(GREEN)Dependencies updated!$(NC)"

# Default target
.DEFAULT_GOAL := help
