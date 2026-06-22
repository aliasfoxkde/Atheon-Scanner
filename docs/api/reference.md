# API Reference

Complete API documentation for Atheon-Scanner packages and modules.

## Table of Contents

- [Scanner API](#scanner-api)
- [GitHub Client API](#github-client-api)
- [Pattern Scanner API](#pattern-scanner-api)
- [Report Generator API](#report-generator-api)
- [Database API](#database-api)
- [CLI Interface](#cli-interface)

## Scanner API

### Package: scanner

The scanner package provides the main repository scanning functionality.

#### Types

```go
type Scanner struct {
    githubClient   *github.Client
    patternScanner *patterns.Scanner
    ctx            context.Context
    workDir        string
}
```

#### Functions

##### NewScanner

```go
func NewScanner(ctx context.Context, githubToken string) (*Scanner, error)
```

Creates a new repository scanner with GitHub API integration.

**Parameters:**
- `ctx`: Context for cancellation and timeouts
- `githubToken`: Optional GitHub API token for rate limit increases

**Returns:**
- `*Scanner`: Configured scanner instance
- `error`: Error if scanner initialization fails

**Example:**
```go
scanner, err := scanner.NewScanner(context.Background(), "github_token")
if err != nil {
    log.Fatal(err)
}
result, err := scanner.ScanRepository("facebook", "react")
```

##### ScanRepository

```go
func (s *Scanner) ScanRepository(owner, name string) (*ScanResult, error)
```

Scans a single GitHub repository and returns comprehensive analysis results.

**Parameters:**
- `owner`: Repository owner (username or organization)
- `name`: Repository name

**Returns:**
- `*ScanResult`: Complete scan results including findings and quality metrics
- `error`: Error if scanning fails

**Example:**
```go
result, err := scanner.ScanRepository("vercel", "next.js")
fmt.Printf("Quality Score: %d/100 (Tier %s)\n", result.QualityScore, result.Tier)
```

##### ScanMultipleRepositories

```go
func (s *Scanner) ScanMultipleRepositories(repos []*github.Repository) ([]*ScanResult, error)
```

Scans multiple repositories in sequence with error handling.

**Parameters:**
- `repos`: Slice of GitHub repositories to scan

**Returns:**
- `[]*ScanResult`: Results for successfully scanned repositories
- `error`: Cumulative errors if all scans fail

#### ScanResult

```go
type ScanResult struct {
    Repository   *github.Repository     // Repository metadata
    Findings     []patterns.Finding      // All findings discovered
    Statistics   map[string]int          // Statistical breakdown
    QualityScore int                     // 0-100 quality score
    Tier         string                  // Quality tier (A-F)
    ScanDate     time.Time               // When scan was performed
    Summary      ScanSummary            // High-level summary
}
```

## GitHub Client API

### Package: github

The github package provides GitHub API integration and repository management.

#### Types

```go
type Client struct {
    httpClient *http.Client
    token      string
    rateLimit  *RateLimit
}

type Repository struct {
    ID            int64
    Name          string
    FullName      string
    Owner         Owner
    Description   string
    Language      string
    Stars         int
    Forks         int
    OpenIssues    int
    CreatedAt     time.Time
    UpdatedAt     time.Time
    PushedAt      time.Time
    Size          int
    Topics        []string
    License       *License
    CloneURL      string
    DefaultBranch string
}
```

#### Functions

##### NewClient

```go
func NewClient(token string) *Client
```

Creates a new GitHub API client with optional authentication.

**Parameters:**
- `token`: GitHub personal access token (optional)

**Returns:**
- `*Client`: Configured GitHub API client

##### GetRepository

```go
func (c *Client) GetRepository(ctx context.Context, owner, name string) (*Repository, error)
```

Fetches a single repository by owner and name.

**Parameters:**
- `owner`: Repository owner
- `name`: Repository name

**Returns:**
- `*Repository`: Repository metadata
- `error`: API or network error

##### SearchRepositories

```go
func (c *Client) SearchRepositories(ctx context.Context, query, sort, order string, perPage, page int) ([]*Repository, error)
```

Searches for repositories matching the query.

**Parameters:**
- `query`: GitHub search query
- `sort`: Sort field (stars, forks, updated)
- `order`: Sort order (asc, desc)
- `perPage`: Results per page (max 100)
- `page`: Page number

**Returns:**
- `[]*Repository`: Matching repositories
- `error`: Search error

##### GetTrendingRepositories

```go
func (c *Client) GetTrendingRepositories(ctx context.Context, language, since string, limit int) ([]*Repository, error)
```

Fetches trending repositories by language and time period.

**Parameters:**
- `language`: Programming language filter (empty for all)
- `since`: Time period (daily, weekly, monthly)
- `limit`: Maximum repositories to return

**Returns:**
- `[]*Repository`: Trending repositories
- `error": API error

##### GetRateLimit

```go
func (c *Client) GetRateLimit() *RateLimit
```

Returns current GitHub API rate limit information.

**Returns:**
- `*RateLimit`: Rate limit status including remaining requests and reset time

## Pattern Scanner API

### Package: patterns

The patterns package provides security and code quality pattern matching.

#### Types

```go
type Scanner struct {
    patterns map[string][]Pattern
    ctx      context.Context
    maxFiles int
    findings []Finding
}

type Finding struct {
    Type        string
    Severity    string
    File        string
    Line        int
    Column      int
    Description string
    Match       string
    Category    string
    CWE         string
    OWASP       string
}
```

#### Functions

##### NewScanner

```go
func NewScanner(ctx context.Context) *Scanner
```

Creates a new pattern scanner with default security patterns.

**Parameters:**
- `ctx`: Context for cancellation

**Returns:**
- `*Scanner`: Configured pattern scanner

##### ScanDirectory

```go
func (s *Scanner) ScanDirectory(rootPath string) ([]Finding, error)
```

Scans a directory for pattern matches.

**Parameters:**
- `rootPath`: Root directory to scan

**Returns:**
- `[]Finding`: All findings discovered
- `error`: Scan error

##### GetFindingsByCategory

```go
func (s *Scanner) GetFindingsByCategory() map[string][]Finding
```

Returns findings grouped by category.

**Returns:**
- `map[string][]Finding`: Findings grouped by category (security, code_quality, maintenance)

##### GetFindingsBySeverity

```go
func (s *Scanner) GetFindingsBySeverity() map[string][]Finding
```

Returns findings grouped by severity level.

**Returns:**
- `map[string][]Finding`: Findings grouped by severity (critical, high, medium, low, info)

## Report Generator API

### Package: report

The report package provides comprehensive report generation.

#### Types

```go
type Generator struct {
    outputDir string
}
```

#### Functions

##### NewGenerator

```go
func NewGenerator(outputDir string) *Generator
```

Creates a new report generator.

**Parameters:**
- `outputDir`: Directory for generated reports

**Returns:**
- `*Generator`: Configured report generator

##### GenerateMarkdownReport

```go
func (g *Generator) GenerateMarkdownReport(result *scanner.ScanResult) (string, error)
```

Generates a comprehensive markdown report from scan results.

**Parameters:**
- `result`: Scan result to generate report from

**Returns:**
- `string`: Complete markdown report
- `error`: Generation error

**Report Sections:**
1. Executive Summary
2. Repository Overview
3. Security Analysis
4. Code Quality Analysis
5. Detailed Findings
6. Quality Metrics
7. Recommendations

## Database API

### Package: database

The database package provides PostgreSQL integration for scan results.

#### Types

```go
type Database struct {
    db *sql.DB
}

type Repository struct {
    ID            string
    Owner         string
    Name          string
    FullName      string
    Description   string
    Language      string
    Stars         int
    Forks         int
    OpenIssues    int
    CreatedAt     time.Time
    UpdatedAt     time.Time
    DefaultBranch string
    Topics        []string
    License       *License
}

type Analysis struct {
    ID                  string
    RepoID              string
    QualityScore        int
    Tier                string
    TotalFindings       int
    CriticalFindings    int
    HighFindings        int
    MediumFindings      int
    LowFindings         int
    ScanDate            time.Time
    ScanDurationSeconds float64
    Status              string
    Findings            []Finding
    QualityMetrics      QualityMetrics
}
```

#### Functions

##### NewDatabase

```go
func NewDatabase(connection string) (*Database, error)
```

Creates a new database connection and initializes schema.

**Parameters:**
- `connection`: PostgreSQL connection string

**Returns:**
- `*Database`: Database instance
- `error`: Connection error

##### StoreRepository

```go
func (d *Database) StoreRepository(repo Repository) error
```

Stores or updates repository metadata.

**Parameters:**
- `repo`: Repository to store

**Returns:**
- `error`: Storage error

##### StoreAnalysis

```go
func (d *Database) StoreAnalysis(analysis Analysis) error
```

Stores analysis results with findings and metrics.

**Parameters:**
- `analysis`: Analysis results to store

**Returns:**
- `error`: Storage error

##### GetRepositoryByName

```go
func (d *Database) GetRepositoryByName(fullName string) (*Repository, error)
```

Retrieves repository by full name.

**Parameters:**
- `fullName`: Repository full name (owner/repo)

**Returns:**
- `*Repository`: Repository metadata
- `error`: Query error

##### SearchRepositories

```go
func (d *Database) SearchRepositories(filters SearchFilters) ([]Repository, error)
```

Searches repositories with filters.

**Parameters:**
- `filters`: Search criteria (language, stars, category)

**Returns:**
- `[]Repository`: Matching repositories
- `error`: Search error

## CLI Interface

### Command: scan

```bash
scanner scan [flags]
```

**Flags:**
- `--repo string`: Repository to scan (owner/name)
- `--trending`: Scan trending repositories
- `--popular`: Scan curated popular repositories
- `--category string`: Repository category (web-framework, cli-tool, library, database, testing, devops, ml-ai, documentation)
- `--languages string`: Comma-separated language list
- `--stars-min int`: Minimum star count
- `--since string`: Time period for trending (daily, weekly, monthly)
- `--limit int`: Maximum repositories to scan
- `--output string`: Output directory for reports
- `--continue`: Continue scanning even if individual repos fail

**Examples:**

```bash
# Single repository
scanner scan --repo=facebook/react

# Trending repositories
scanner scan --trending --languages=javascript,python --limit=10

# Category-based
scanner scan --popular --category=web-framework --limit=5

# Star-based
scanner scan --stars-min=10000 --limit=20
```

### Command: db

```bash
scanner db [subcommand]
```

**Subcommands:**
- `init`: Initialize database
- `update`: Update repository metadata
- `query`: Query database with filters

### Command: report

```bash
scanner report [subcommand] [flags]
```

**Subcommands:**
- `generate`: Generate report from scan results
- `compare`: Compare multiple repositories
- `query`: Query report database

**Flags:**
- `--format string`: Output format (markdown, json, html)
- `--compare string`: Repositories to compare (comma-separated)
- `--category string`: Category filter
- `--period string`: Time period for reports

## Error Handling

All API functions return errors that should be handled appropriately:

```go
result, err := scanner.ScanRepository("owner", "repo")
if err != nil {
    // Handle error
    log.Printf("Scan failed: %v", err)
    return
}
```

Common error types:
- **API Errors**: GitHub API rate limits, network issues
- **Repository Errors**: Invalid repository names, access denied
- **Scanning Errors**: Clone failures, file system errors
- **Database Errors**: Connection issues, query failures

## Rate Limiting

GitHub API rate limits are automatically managed:

- **Unauthenticated**: 60 requests/hour
- **Authenticated**: 5,000 requests/hour
- **Auto-wait**: Scanner waits when rate limit is reached
- **Status**: Check with `client.GetRateLimit()`

## Configuration

### Environment Variables

- `GITHUB_TOKEN`: GitHub personal access token
- `DATABASE_URL`: PostgreSQL connection string

### Example Configuration

```bash
export GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
export DATABASE_URL="postgres://user:pass@localhost/dbname"
```

---

For more detailed examples and usage, see the [User Guide](../user-guide/) and [Technical Documentation](../technical/).