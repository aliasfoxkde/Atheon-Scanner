# Installation Guide

Complete installation instructions for Atheon-Scanner on various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Methods](#installation-methods)
- [Platform-Specific Setup](#platform-specific-setup)
- [Configuration](#configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required

- **Go 1.21+**: For building the scanner from source
- **Git**: For cloning repositories
- **Basic shell access**: Terminal or command line access

### Optional (Recommended)

- **GitHub Token**: For higher API rate limits (5,000 requests/hour vs 60/hour)
- **PostgreSQL**: For database functionality (optional)
- **Make**: For using build scripts (optional)

### System Requirements

- **Disk Space**: 100MB for scanner + 1GB for temporary repo clones
- **Memory**: 512MB minimum, 2GB recommended for large repositories
- **Network**: Internet connection for GitHub API and git operations

## Installation Methods

### Method 1: Build from Source (Recommended)

#### Clone Repository

```bash
git clone https://github.com/aliasfoxkde/Atheon-Scanner.git
cd Atheon-Scanner
```

#### Build Scanner

```bash
# Using Go directly
go build -o scanner cmd/scanner/main.go

# Or using make (if Makefile is available)
make build
```

#### Verify Installation

```bash
./scanner --help
```

You should see the help output with all available commands.

### Method 2: Using Go Install

```bash
go install github.com/aliasfoxkde/Atheon-Scanner/cmd/scanner@latest
```

The binary will be installed to your Go bin path (usually `$GOPATH/bin` or `~/go/bin`).

### Method 3: Download Release Binary

```bash
# Download latest release
wget https://github.com/aliasfoxkde/Atheon-Scanner/releases/latest/download/scanner-linux-amd64

# Make executable
chmod +x scanner-linux-amd64

# Optionally rename
mv scanner-linux-amd64 scanner
```

## Platform-Specific Setup

### Linux

#### Debian/Ubuntu

```bash
# Install dependencies
sudo apt update
sudo apt install -y golang git

# Clone and build
git clone https://github.com/aliasfoxkde/Atheon-Scanner.git
cd Atheon-Scanner
go build -o scanner cmd/scanner/main.go

# Optional: Install globally
sudo cp scanner /usr/local/bin/
```

#### Fedora/RHEL

```bash
# Install dependencies
sudo dnf install -y golang git

# Clone and build
git clone https://github.com/aliasfoxkde/Atheon-Scanner.git
cd Atheon-Scanner
go build -o scanner cmd/scanner/main.go

# Optional: Install globally
sudo cp scanner /usr/local/bin/
```

#### Arch Linux

```bash
# Install dependencies
sudo pacman -S go git

# Clone and build
git clone https://github.com/aliasfoxkde/Atheon-Scanner.git
cd Atheon-Scanner
go build -o scanner cmd/scanner/main.go

# Optional: Install globally
sudo cp scanner /usr/local/bin/
```

### macOS

#### Using Homebrew

```bash
# Install Go if not already installed
brew install go

# Clone and build
git clone https://github.com/aliasfoxkde/Atheon-Scanner.git
cd Atheon-Scanner
go build -o scanner cmd/scanner/main.go

# Optional: Install globally
sudo cp scanner /usr/local/bin/
```

#### Manual Installation

```bash
# Install Go from https://golang.org/dl/
# Follow official Go installation instructions

# Clone and build
git clone https://github.com/aliasfoxkde/Atheon-Scanner.git
cd Atheon-Scanner
go build -o scanner cmd/scanner/main.go
```

### Windows

#### Using Chocolatey

```powershell
# Install Go
choco install golang git

# Clone and build
git clone https://github.com/aliasfoxkde/Atheon-Scanner.git
cd Atheon-Scanner
go build -o scanner.exe cmd/scanner/main.go
```

#### Manual Installation

1. Install Go from https://golang.org/dl/
2. Install Git from https://git-scm.com/downloads
3. Clone repository:
   ```cmd
   git clone https://github.com/aliasfoxkde/Atheon-Scanner.git
   cd Atheon-Scanner
   ```
4. Build:
   ```cmd
   go build -o scanner.exe cmd/scanner/main.go
   ```

### Docker (All Platforms)

```bash
# Build Docker image
docker build -t atheon-scanner .

# Run scanner
docker run -v $(pwd)/reports:/reports atheon-scanner scan --repo=facebook/react
```

## Configuration

### GitHub Token Setup

For higher rate limits (5,000 requests/hour vs 60/hour):

#### Create GitHub Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Select scopes: `public_repo`, `read:org`
4. Generate and copy token

#### Set Environment Variable

```bash
# Linux/macOS
export GITHUB_TOKEN="your_token_here"

# Windows (Command Prompt)
set GITHUB_TOKEN=your_token_here

# Windows (PowerShell)
$env:GITHUB_TOKEN="your_token_here"
```

#### Persistent Configuration

```bash
# Add to shell profile (~/.bashrc, ~/.zshrc, etc.)
echo 'export GITHUB_TOKEN="your_token_here"' >> ~/.bashrc
source ~/.bashrc
```

### Database Setup (Optional)

For database functionality and historical tracking:

#### PostgreSQL Installation

```bash
# Linux
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download from https://www.postgresql.org/download.html
```

#### Database Initialization

```bash
# Create database
createdb atheon_scanner

# Set connection string
export DATABASE_URL="postgres://user:password@localhost/atheon_scanner"
```

### Output Directory Configuration

```bash
# Create reports directory
mkdir -p reports

# Set as default location in shell profile
echo 'export ATHEON_REPORTS_DIR="./reports"' >> ~/.bashrc
```

## Verification

### Basic Verification

```bash
# Check scanner version/help
./scanner --help

# Scan a test repository
./scanner scan --repo=vuejs/vue --output=reports/test

# Verify report created
ls -la reports/test/
```

### Advanced Verification

```bash
# Test all scanning modes
./scanner scan --repo=facebook/react
./scanner scan --trending --languages=javascript --limit=2
./scanner scan --popular --category=web-framework --limit=2

# Verify report generation
cat reports/*.md | head -20
```

### Performance Test

```bash
# Test scanning performance
time ./scanner scan --repo=facebook/react

# Expected: 10-30 seconds for large repositories
```

## Troubleshooting

### Common Issues

#### Issue: "go: command not found"

**Solution:**
```bash
# Install Go
# Linux: sudo apt install golang
# macOS: brew install go
# Windows: Download from golang.org
```

#### Issue: "permission denied" when running scanner

**Solution:**
```bash
# Make executable
chmod +x scanner

# Or rebuild
go build -o scanner cmd/scanner/main.go
```

#### Issue: "GitHub API rate limit exceeded"

**Solution:**
```bash
# Set GitHub token
export GITHUB_TOKEN="your_token"

# Or wait 1 hour for rate limit reset
```

#### Issue: "git clone failed"

**Solution:**
```bash
# Install git
# Linux: sudo apt install git
# macOS: brew install git
# Check network connectivity
```

#### Issue: "too many open files"

**Solution:**
```bash
# Linux: Increase file limit
ulimit -n 4096

# macOS: Increase file limit
ulimit -n 8192
```

### Platform-Specific Issues

#### Linux: "cannot find libc.musl"

**Solution:**
```bash
# Install musl library
sudo apt install libc6-dev

# Or use static binary if available
```

#### macOS: "cannot open file: too many open files"

**Solution:**
```bash
# Increase file limit
ulimit -n 8192

# For persistent change, create /Library/LaunchDaemons/limit.maxfiles.plist
```

#### Windows: "scanner.exe is not a valid Win32 application"

**Solution:**
```bash
# Rebuild with correct target
$env:GOOS="windows"
$env:GOARCH="amd64"
go build -o scanner.exe cmd/scanner/main.go
```

### Getting Help

If you encounter issues not covered here:

1. Check [Troubleshooting Guide](../guides/troubleshooting.md)
2. Search [GitHub Issues](https://github.com/aliasfoxkde/Atheon-Scanner/issues)
3. Ask in [GitHub Discussions](https://github.com/aliasfoxkde/Atheon-Scanner/discussions)
4. Review [Technical Documentation](../technical/)

## Next Steps

After successful installation:

1. **Read Quick Start Guide** - [Quick Start](../user-guide/quick-start.md)
2. **Try Basic Scanning** - [Basic Usage](../user-guide/basic-usage.md)
3. **Explore All Features** - [Scanning Modes](../guides/scanning-modes.md)
4. **Understand Reports** - [Report Database](../reports/README.md)

## Advanced Installation

### Development Setup

For contributing to the project:

```bash
# Clone repository
git clone https://github.com/aliasfoxkde/Atheon-Scanner.git
cd Atheon-Scanner

# Install development dependencies
go mod download

# Run tests
go test ./...

# Run with race detection
go test -race ./...

# Build with coverage
go test -cover ./...
```

### Production Deployment

For production use:

```bash
# Build optimized binary
go build -ldflags="-s -w" -o scanner cmd/scanner/main.go

# Create systemd service
sudo cp scripts/scanner.service /etc/systemd/system/
sudo systemctl enable scanner
sudo systemctl start scanner
```

### Container Deployment

```bash
# Build multi-arch image
docker buildx build --platform linux/amd64,linux/arm64 -t atheon-scanner:latest .

# Run in production
docker run -d \
  -v /path/to/reports:/reports \
  -e GITHUB_TOKEN=your_token \
  --name atheon-scanner \
  atheon-scanner:latest
```

## Version Information

- **Current Version**: 0.1.0-alpha
- **Go Version**: 1.21+
- **Platform Support**: Linux, macOS, Windows
- **Dependencies**: Git, GitHub API (optional token)

## Uninstallation

```bash
# Remove binary
rm scanner

# Remove from global path (if installed globally)
sudo rm /usr/local/bin/scanner

# Remove source code
cd ..
rm -rf Atheon-Scanner
```

---

**See Also:**
- [Quick Start Guide](../user-guide/quick-start.md)
- [Basic Usage](../user-guide/basic-usage.md)
- [Configuration Reference](../reference/configuration.md)
- [Troubleshooting](../guides/troubleshooting.md)