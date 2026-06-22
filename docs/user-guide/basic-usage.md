# Basic Usage Guide

This guide covers the most common usage scenarios for the Atheon-Scanner.

## Table of Contents

- [First Time Setup](#first-time-setup)
- [Scanning Repositories](#scanning-repositories)
- [Understanding Reports](#understanding-reports)
- [Common Workflows](#common-workflows)
- [Troubleshooting](#troubleshooting)

## First Time Setup

### Installation

```bash
# Clone the repository
git clone https://github.com/aliasfoxkde/Atheon-Scanner.git
cd Atheon-Scanner

# Build the scanner
go build -o scanner cmd/scanner/main.go
```

### Quick Verification

```bash
./scanner --help
```

You should see the help output with all available commands and options.

## Scanning Repositories

### Scan a Single Repository

The most common use case is scanning a specific repository:

```bash
./scanner scan --repo=facebook/react
```

**Output:**
```
[1/1] Scanning facebook/react...
Completed in 10.57 seconds
Quality Score: 68/100 (Tier C)
Total Findings: 2,383 (0 critical, 4 high, 2 medium, 1366 low)
Report saved to: reports/facebook_react.md
```

### Scan Multiple Repositories

#### By Category

Scan curated lists of popular repositories by category:

```bash
# Web frameworks
./scanner scan --popular --category=web-framework --limit=10

# CLI tools
./scanner scan --popular --category=cli-tool --limit=5

# ML/AI frameworks
./scanner scan --popular --category=ml-ai --limit=8
```

#### By Star Count

Find repositories above a certain popularity threshold:

```bash
# Repositories with 10K+ stars
./scanner scan --stars-min=10000 --limit=20

# Repositories with 50K+ stars
./scanner scan --stars-min=50000 --limit=10
```

#### Trending Repositories

Scan currently trending repositories:

```bash
# Trending JavaScript repositories
./scanner scan --trending --languages=javascript --limit=10

# Trending across multiple languages
./scanner scan --trending --languages=javascript,python,go --limit=15
```

### Batch Scanning

For larger scanning operations, use error resilience:

```bash
# Continue even if individual repos fail
./scanner scan --popular --category=web-framework --limit=50 --continue
```

## Understanding Reports

### Report Structure

Each generated report contains the following sections:

#### 1. Executive Summary

High-level overview including:
- Overall quality tier and score
- Total findings breakdown
- Files scanned count
- Category statistics

#### 2. Repository Overview

Repository metadata:
- Basic information (owner, name, description)
- Statistics (stars, forks, issues)
- Technical details (language, size, topics)

#### 3. Security Analysis

Security findings organized by severity:
- 🚨 Critical issues
- ⚠️ High severity issues
- Detailed findings table

#### 4. Code Quality Analysis

Quality metrics and findings:
- Test coverage percentage
- Documentation coverage
- Complexity assessment
- Code quality issues

#### 5. Detailed Findings

Complete findings by category:
- Security findings
- Code quality issues
- Maintenance items

#### 6. Recommendations

Actionable improvement suggestions based on findings.

### Quality Tiers

| Tier | Score Range | Description |
|------|-------------|-------------|
| A | 90-100 | Excellent quality, minimal issues |
| B | 75-89 | Good quality with minor issues |
| C | 60-74 | Acceptable quality with moderate issues |
| D | 40-59 | Below average quality with significant issues |
| F | 0-39 | Poor quality requiring critical improvements |

### Finding Categories

- **Security**: Vulnerabilities, secrets, credentials, API keys
- **Code Quality**: Technical debt, code smells, anti-patterns
- **Maintenance**: TODOs, FIXMEs, known issues

### Severity Levels

- 🔴 **Critical**: Immediate attention required
- 🟠 **High**: Should be addressed soon
- 🟡 **Medium**: Should be addressed when possible
- 🟢 **Low**: Minor issues, can be deferred
- ⚪ **Info**: Informational findings

## Common Workflows

### Workflow 1: Repository Assessment

Assess a repository before using it in your project:

```bash
# Scan the repository
./scanner scan --repo=library/author

# Review the report
cat reports/library_author.md

# Check quality score and security findings
# Evaluate if it meets your standards
```

### Workflow 2: Competitive Analysis

Compare similar repositories:

```bash
# Scan multiple alternatives
./scanner scan --repo=framework/a --output=reports/alternatives
./scanner scan --repo=framework/b --output=reports/alternatives
./scanner scan --repo=framework/c --output=reports/alternatives

# Compare their quality scores and findings
```

### Workflow 3: Security Audit

Perform security audit on dependencies:

```bash
# Scan all your dependencies
./scanner scan --popular --category=library --limit=50 --continue

# Review security findings in each report
# Check for critical and high severity issues
```

### Workflow 4: Quality Tracking

Track repository quality over time:

```bash
# Initial scan
./scanner scan --repo=myorg/myrepo --output=reports/baseline

# After updates
./scanner scan --repo=myorg/myrepo --output=reports/after-update

# Compare the reports
```

### Workflow 5: Category Research

Research best repositories in a category:

```bash
# Scan top web frameworks
./scanner scan --popular --category=web-framework --limit=20

# Review the report index
./scripts/build-report-index.sh

# Compare quality scores and findings
```

## Troubleshooting

### Common Issues

#### 1. GitHub API Rate Limit

**Error:** `GitHub API returned status 403`

**Solution:**
```bash
# Set GitHub token for higher rate limits
export GITHUB_TOKEN="your_token_here"

# Or wait for rate limit reset (typically 1 hour)
```

#### 2. Repository Not Found

**Error:** `GitHub API returned status 404`

**Solution:**
- Verify repository owner and name are correct
- Check if repository is private (requires access)
- Ensure repository exists

#### 3. Clone Timeout

**Error:** `git clone failed: timeout`

**Solution:**
```bash
# Use --continue flag to skip problematic repos
./scanner scan --trending --limit=10 --continue
```

#### 4. Large Repository Processing

**Issue:** Scan takes very long time

**Solution:**
- Large repos (7K+ files) take 30+ seconds - this is normal
- Consider using specific categories instead of broad searches
- Use --limit to reduce batch size

#### 5. File Access Issues

**Error:** `bufio.Scanner: token too long`

**Solution:**
- This is handled automatically in the latest version
- Update to the latest scanner version

### Getting Help

- **Documentation**: Check [./docs](../docs/) for detailed guides
- **Issues**: [GitHub Issues](https://github.com/aliasfoxkde/Atheon-Scanner/issues)
- **Security**: See [SECURITY.md](../../SECURITY.md)

## Advanced Usage

For more advanced usage, see:
- [Scanning Modes Guide](../guides/scanning-modes.md)
- [Pattern Matching](../guides/pattern-matching.md)
- [API Reference](../api/reference.md)
- [Technical Documentation](../technical/)

## Best Practices

### 1. Use GitHub Tokens

Always use a GitHub token for better rate limits:

```bash
export GITHUB_TOKEN="your_token"
./scanner scan --popular --limit=100
```

### 2. Start with Categories

Begin with category-based scanning for better results:

```bash
./scanner scan --popular --category=web-framework --limit=10
```

### 3. Use Error Resilience

For batch operations, always use --continue:

```bash
./scanner scan --trending --languages=javascript --limit=50 --continue
```

### 4. Review Reports Regularly

Check reports after scanning:
```bash
# View the report
cat reports/repository_name.md

# Or open in your editor
code reports/repository_name.md
```

### 5. Build Report Database

Regularly update your report database:

```bash
# Run background scanner
./scripts/background-scanner.sh full

# Build index
./scripts/build-report-index.sh
```

---

**Next Steps:**
- Explore [Advanced Guides](../guides/)
- Check [API Documentation](../api/reference.md)
- Review [Technical Architecture](../technical/architecture.md)