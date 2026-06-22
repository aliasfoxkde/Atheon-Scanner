# Scanning Modes Guide

Comprehensive guide to all available scanning modes in Atheon-Scanner.

## Overview

The scanner supports multiple scanning modes to accommodate different use cases:

1. **Single Repository Scanning** - Analyze specific repositories
2. **Trending Repository Scanning** - Discover and scan trending projects
3. **Category-Based Scanning** - Scan curated repository lists
4. **Star-Based Scanning** - Filter by popularity threshold
5. **Batch Processing** - Handle multiple repositories efficiently

## Single Repository Scanning

### Usage

```bash
./scanner scan --repo=owner/repository
```

### Examples

```bash
# Scan a web framework
./scanner scan --repo=facebook/react

# Scan a database
./scanner scan --repo=postgres/postgres

# Scan a CLI tool
./scanner scan --repo=cli/cli
```

### Use Cases

- **Due Diligence**: Assess a repository before using it
- **Security Audit**: Check specific repository for vulnerabilities
- **Quality Assessment**: Evaluate code quality of a specific project
- **Comparison**: Compare with baseline expectations

### Output

- Single markdown report in current directory or specified output directory
- Console output with scan results and quality score
- Processing time and file count statistics

## Trending Repository Scanning

### Usage

```bash
./scanner scan --trending --languages=lang1,lang2 --limit=N --since=period
```

### Options

- `--languages`: Comma-separated list of programming languages
- `--limit`: Maximum number of repositories to scan (default: 10)
- `--since`: Time period (daily, weekly, monthly - default: daily)
- `--output`: Output directory for reports
- `--continue`: Continue on individual failures

### Examples

```bash
# Trending JavaScript repositories (daily)
./scanner scan --trending --languages=javascript --limit=10

# Trending Python repositories (weekly)
./scanner scan --trending --languages=python --since=weekly --limit=15

# Multiple languages
./scanner scan --trending --languages=javascript,python,go --limit=20

# With error resilience
./scanner scan --trending --languages=javascript --limit=50 --continue
```

### Use Cases

- **Discovery**: Find popular and trending projects
- **Market Research**: Understand current technology trends
- **Learning Resources**: Identify quality repositories to study
- **Technology Selection**: Compare trending options in a space

### Notes

- GitHub doesn't provide an official trending API
- Scanner uses search API with date filtering as proxy
- Results may vary based on GitHub's search algorithm

## Category-Based Scanning

### Available Categories

- `web-framework`: Web application frameworks (React, Vue, Angular, etc.)
- `cli-tool`: Command-line tools and utilities
- `library`: Programming libraries and packages
- `database`: Database systems and tools
- `testing`: Testing frameworks and tools
- `devops`: DevOps and infrastructure tools
- `ml-ai`: Machine learning and AI frameworks
- `documentation`: Documentation tools and generators

### Usage

```bash
./scanner scan --popular --category=category --limit=N
```

### Examples

```bash
# Web frameworks
./scanner scan --popular --category=web-framework --limit=20

# CLI tools
./scanner scan --popular --category=cli-tool --limit=15

# ML/AI frameworks
./scanner scan --popular --category=ml-ai --limit=10

# Databases
./scanner scan --popular --category=database --limit=8
```

### Use Cases

- **Category Research**: Compare options within a specific domain
- **Best Practices**: Learn from top repositories in a category
- **Technology Evaluation**: Assess leading solutions in a space
- **Quality Baseline**: Understand typical quality metrics for a category

### Repository Lists

Each category contains curated lists of popular repositories:
- **Web Frameworks**: React, Vue, Angular, Next.js, Svelte, Nuxt, Remix, Gatsby
- **CLI Tools**: Git, Vim, Neovim, Go, Rust, Python, Node.js, Docker, Kubernetes
- **ML/AI**: TensorFlow, PyTorch, Scikit-learn, Keras, Transformers, LangChain
- **Databases**: PostgreSQL, MongoDB, Redis, Elasticsearch, CockroachDB, Cassandra
- **Testing**: Jest, React Testing Library, Pytest, GoogleTest, JMeter, Appium

## Star-Based Scanning

### Usage

```bash
./scanner scan --stars-min=N --limit=M --language=lang
```

### Options

- `--stars-min`: Minimum star count threshold
- `--limit`: Maximum repositories to scan
- `--language`: Optional language filter
- `--output`: Output directory for reports

### Examples

```bash
# Repositories with 10K+ stars
./scanner scan --stars-min=10000 --limit=20

# Repositories with 50K+ stars
./scanner scan --stars-min=50000 --limit=10

# JavaScript repositories with 5K+ stars
./scanner scan --stars-min=5000 --language=javascript --limit=15
```

### Use Cases

- **Established Projects**: Focus on mature, popular repositories
- **Quality Threshold**: Filter by community adoption
- **Popular Solutions**: Analyze widely-used projects
- **Industry Standards**: Examine leading repositories

### Star Count Tiers

- **100K+ Stars**: Elite projects, industry leaders
- **50K+ Stars**: Very popular, well-established
- **10K+ Stars**: Popular and widely used
- **5K+ Stars**: Growing and active
- **1K+ Stars**: Established with dedicated community

## Batch Processing

### Basic Batch Scanning

```bash
# Scan multiple repositories
./scanner scan --trending --languages=javascript,python --limit=20

# Scan by category
./scanner scan --popular --category=web-framework --limit=30
```

### Error-Resilient Scanning

```bash
# Continue on failures
./scanner scan --trending --languages=javascript --limit=100 --continue
```

### Organized Output

```bash
# Organize by category
./scanner scan --popular --category=web-framework --limit=10 --output=reports/web-frameworks

# Organize by language
./scanner scan --trending --languages=javascript --limit=15 --output=reports/javascript
```

### Use Cases

- **Large-Scale Analysis**: Scan many repositories for research
- **Report Database**: Build comprehensive database of analyses
- **Category Studies**: Analyze entire categories systematically
- **Quality Trends**: Compare quality across similar repositories

## Background Automation

### Automated Scanning Scripts

The scanner includes automation scripts for background processing:

```bash
# Quick scan of main categories
./scripts/background-scanner.sh quick

# Full scan of all categories
./scripts/background-scanner.sh full

# Trending repository scan
./scripts/background-scanner.sh trending

# Incremental update
./scripts/background-scanner.sh update
```

### Automation Features

- **Rate Limiting**: Intelligent GitHub API rate limit management
- **Error Handling**: Continue on individual repository failures
- **Progress Logging**: Detailed logging of scan progress
- **Report Organization**: Automatic categorization and indexing
- **Scheduling**: Can be scheduled with cron for regular updates

### Setting Up Automated Scanning

```bash
# Add to crontab for daily scanning
0 2 * * * cd /path/to/Atheon-Scanner && ./scripts/background-scanner.sh quick

# Weekly full scan
0 3 * * 0 cd /path/to/Atheon-Scanner && ./scripts/background-scanner.sh full
```

## Advanced Usage

### Multi-Category Scanning

```bash
# Scan multiple categories in sequence
for category in web-framework cli-tool ml-ai; do
    ./scanner scan --popular --category=$category --limit=10 --output=reports/$category
done
```

### Language-Specific Scanning

```bash
# Scan repositories by specific languages
./scanner scan --stars-min=10000 --language=javascript --limit=20
./scanner scan --stars-min=10000 --language=python --limit=20
./scanner scan --stars-min=10000 --language=go --limit=20
```

### Custom Repository Lists

```bash
# Create custom repository list
echo "facebook/react" > repos.txt
echo "vuejs/vue" >> repos.txt
echo "sveltejs/svelte" >> repos.txt

# Scan each repository
while read repo; do
    ./scanner scan --repo=$repo --output=reports/custom
done < repos.txt
```

## Performance Considerations

### Scan Time Estimates

- **Small Repos** (<1K files): 1-5 seconds
- **Medium Repos** (1K-5K files): 5-15 seconds
- **Large Repos** (5K-10K files): 15-30 seconds
- **Very Large Repos** (10K+ files): 30-60 seconds

### Resource Usage

- **Memory**: ~50-200MB during scanning
- **Disk**: ~10-50MB for temporary clones (auto-cleaned)
- **Network**: ~1-5MB per repository for API and clone
- **CPU**: Moderate during pattern matching

### Rate Limiting

- **Unauthenticated**: 60 requests/hour
- **Authenticated**: 5,000 requests/hour
- **Auto-Wait**: Scanner automatically waits for rate limit reset
- **Monitoring**: Check rate limit status with `client.GetRateLimit()`

## Best Practices

### 1. Use Appropriate Scanning Modes

Choose the right mode for your use case:
- **Due diligence**: Single repository scanning
- **Research**: Category-based or trending scanning
- **Large-scale**: Batch processing with error resilience

### 2. Organize Your Reports

```bash
# By category
./scanner scan --popular --category=web-framework --output=reports/web-frameworks

# By language
./scanner scan --trending --languages=javascript --output=reports/javascript

# By date
./scanner scan --stars-min=10000 --output=reports/$(date +%Y-%m-%d)
```

### 3. Use Error Resilience for Large Scans

```bash
# Always use --continue for batch operations
./scanner scan --popular --category=ml-ai --limit=100 --continue
```

### 4. Monitor Rate Limits

```bash
# Set GitHub token for higher limits
export GITHUB_TOKEN="your_token"
./scanner scan --popular --limit=100
```

### 5. Build Report Database

```bash
# Run scans
./scanner scan --popular --category=web-framework --limit=20

# Build index
./scripts/build-report-index.sh

# Review database
cat docs/reports/index.md
```

## Comparison of Scanning Modes

| Mode | Use Case | Speed | Coverage | Customization |
|------|----------|-------|----------|----------------|
| Single Repo | Specific analysis | Fast | One repo | Targeted |
| Trending | Discovery | Medium | 10-50 repos | Language/period |
| Category | Curated analysis | Medium | 10-50 repos | Category-specific |
| Star-Based | Quality threshold | Medium | 10-100 repos | Star/language |
| Batch Processing | Large-scale | Slow | Any number | Fully custom |

## Troubleshooting

### Common Issues

**Issue:** "GitHub API rate limit exceeded"

**Solution:**
```bash
# Use GitHub token
export GITHUB_TOKEN="your_token"

# Or wait for reset (typically 1 hour for unauthenticated)
```

**Issue:** "Repository not found"

**Solution:**
- Verify repository owner and name
- Check if repository is private
- Ensure repository exists

**Issue:** "Scan takes very long"

**Solution:**
- Large repositories require more time (normal behavior)
- Consider using --limit to reduce batch size
- Use category-based scanning for better focus

---

**See Also:**
- [Basic Usage Guide](../user-guide/basic-usage.md)
- [API Reference](../api/reference.md)
- [Technical Documentation](../technical/)