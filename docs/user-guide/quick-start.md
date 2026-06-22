# Quick Start Guide - Atheon-Scanner

This guide will help you get started with the Atheon-Scanner system.

## Installation

### Prerequisites
- Go 1.21 or higher
- Git
- GitHub API token (optional, for higher rate limits)

### Building the Scanner

```bash
# Clone the repository
git clone https://github.com/aliasfoxkde/Atheon-Scanner.git
cd Atheon-Scanner

# Build the scanner
go build -o scanner cmd/scanner/main.go

# Or use make if available
make build
```

## Basic Usage

### Scan a Single Repository

```bash
./scanner scan --repo=facebook/react
```

### Scan Trending Repositories

```bash
# Scan trending Python repositories
./scanner scan --trending --languages=python --limit=5

# Scan multiple languages
./scanner scan --trending --languages=javascript,python,go --limit=10
```

### Scan by Star Count

```bash
# Scan repositories with 10K+ stars
./scanner scan --stars-min=10000 --limit=5

# Scan repositories with 50K+ stars
./scanner scan --stars-min=50000 --limit=10
```

## Advanced Usage

### Custom Output Directory

```bash
./scanner scan --repo=vercel/next.js --output=/path/to/reports
```

### Continue on Errors

```bash
# Continue scanning even if some repos fail
./scanner scan --trending --languages=javascript --limit=10 --continue
```

### Time Period for Trending

```bash
# Daily trending (default)
./scanner scan --trending --since=daily --limit=5

# Weekly trending
./scanner scan --trending --since=weekly --limit=5

# Monthly trending
./scanner scan --trending --since=monthly --limit=5
```

## Understanding the Reports

### Quality Scores

The scanner assigns quality scores from 0-100 with the following tiers:

- **A (90-100)**: Excellent quality, minimal issues
- **B (75-89)**: Good quality with minor issues
- **C (60-74)**: Acceptable quality with moderate issues
- **D (40-59)**: Below average quality with significant issues
- **F (0-39)**: Poor quality with critical issues

### Finding Categories

- **Security**: Potential vulnerabilities, secrets, credentials
- **Code Quality**: Technical debt, code smells, anti-patterns
- **Maintenance**: TODOs, FIXMEs, known issues
- **Secrets**: API keys, tokens, credentials

### Severity Levels

- **Critical**: Immediate attention required
- **High**: Should be addressed soon
- **Medium**: Should be addressed when possible
- **Low**: Minor issues, can be deferred
- **Info**: Informational findings

## Example Reports

### High Quality Repository

```
# Repository Analysis Report: codecrafters-io/build-your-own-x

**Quality Score:** 100/100 (Tier A)

## Executive Summary
- **Overall Quality:** A (100/100)
- **Total Findings:** 0
- **Critical Issues:** 0
- **High Issues:** 0
```

### Repository with Issues

```
# Repository Analysis Report: facebook/react

**Quality Score:** 68/100 (Tier C)

## Executive Summary
- **Overall Quality:** C (68/100)
- **Total Findings:** 2,383
- **Critical Issues:** 0
- **High Issues:** 4
- **Medium Issues:** 2
- **Low Issues:** 1,366

### ⚠️ High Severity Issues (4)
| File | Line | Severity | Description |
|------|------|----------|-------------|
| compiler/packages/react-mcp-server/src/utils/algolia.ts | 14 | 🟠 HIGH | Potential API key detected |
```

## Tips and Best Practices

### 1. Use GitHub Tokens
Setting a `GITHUB_TOKEN` environment variable increases rate limits:

```bash
export GITHUB_TOKEN=your_token_here
./scanner scan --trending --limit=50
```

### 2. Batch Processing
For large scans, use the `--continue` flag to avoid stopping on single failures:

```bash
./scanner scan --stars-min=1000 --limit=100 --continue
```

### 3. Organize Reports by Category
Create separate output directories for different repository types:

```bash
# Web frameworks
./scanner scan --trending --languages=javascript --output=reports/web-frameworks

# Data science
./scanner scan --trending --languages=python --output=reports/data-science
```

### 4. Regular Updates
Schedule regular scans to track repository quality over time:

```bash
# Daily scan of trending repos
./scanner scan --trending --since=daily --limit=10 --output=reports/$(date +%Y-%m-%d)
```

## Troubleshooting

### Rate Limiting Issues
If you encounter rate limiting, wait a few minutes or add a GitHub token.

### Large Repository Timeouts
For very large repositories, the scanner might take longer. Use `--continue` to handle timeouts gracefully.

### Build Errors
Make sure you have Go 1.21+ installed and all dependencies are updated:

```bash
go version
go mod tidy
go build -o scanner cmd/scanner/main.go
```

## Integration with Atheon

This scanner uses patterns and concepts from the [Atheon](https://github.com/HoraDomu/Atheon) project. The pattern matching engine is inspired by Atheon's comprehensive security and code quality analysis capabilities.

## Next Steps

1. **Set Up Automation**: Create cron jobs for regular scanning
2. **Database Integration**: Implement database storage for historical tracking
3. **Custom Patterns**: Add project-specific patterns for your use case
4. **Web Interface**: Set up a web interface for browsing reports

## Support and Contributing

- **Issues**: Report bugs and feature requests on GitHub
- **Contributing**: Follow the contribution guidelines in CONTRIBUTING.md
- **Attribution**: This project builds upon the Atheon pattern matching engine

For more information, see the main [README.md](../README.md) and [documentation](./).