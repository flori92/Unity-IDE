# Contributing to DevOps Unity IDE

First off, thank you for considering contributing to DevOps Unity IDE! It's people like you that make DevOps Unity IDE such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs** if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior** and **explain which behavior you expected to see instead**
* **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Setup

### Prerequisites

- Node.js 18+
- Go 1.21+
- Rust 1.70+
- Docker (optional)
- Git

### Setup

1. Clone your fork:
```bash
git clone https://github.com/your-username/devops-unity-ide.git
cd devops-unity-ide
```

2. Install dependencies:
```bash
make install
```

3. Create a branch:
```bash
git checkout -b feature/your-feature-name
```

4. Start development:
```bash
make dev
```

## Project Structure

```
devops-unity-ide/
├── frontend/          # React/TypeScript frontend
│   ├── src/          # Source code
│   └── src-tauri/    # Rust backend
├── backend/          # Go API server
├── extensions/       # Extension system
├── scripts/         # Build and utility scripts
└── docs/           # Documentation
```

## Coding Standards

### TypeScript/React

- Use TypeScript for all new code
- Follow the existing code style
- Use functional components and hooks
- Write tests for new features
- Use Material-UI components consistently

### Rust

- Follow Rust formatting conventions (`cargo fmt`)
- Use `clippy` for linting (`cargo clippy`)
- Write unit tests for new functionality
- Document public APIs

### Go

- Follow Go formatting conventions (`go fmt`)
- Use meaningful variable and function names
- Write tests for new features
- Document exported functions

## Testing

Run all tests:
```bash
make test
```

Run specific tests:
```bash
# Frontend tests
cd frontend && npm test

# Rust tests
cd frontend/src-tauri && cargo test

# Go tests
cd backend && go test ./...
```

## Documentation

- Update README.md with details of changes to the interface
- Update API documentation for new endpoints
- Add JSDoc comments for TypeScript functions
- Add rustdoc comments for Rust functions
- Add godoc comments for Go functions

## Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files

## Release Process

1. Update version in `frontend/package.json`
2. Update version in `frontend/src-tauri/Cargo.toml`
3. Update CHANGELOG.md
4. Create a git tag
5. Push to GitHub
6. Create a GitHub release

## Questions?

Feel free to open an issue with your question or contact the maintainers directly.

## Recognition

Contributors will be recognized in:
- The project README
- Release notes
- The project website

Thank you for contributing to DevOps Unity IDE! 🚀
