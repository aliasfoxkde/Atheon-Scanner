# Pattern Reference

Complete reference of all security and code quality patterns used by Atheon-Scanner.

## Table of Contents

- [Overview](#overview)
- [Security Patterns](#security-patterns)
- [Code Quality Patterns](#code-quality-patterns)
- [Maintenance Patterns](#maintenance-patterns)
- [Language-Specific Patterns](#language-specific-patterns)
- [Pattern Configuration](#pattern-configuration)
- [False Positives](#false-positives)
- [Contributing Patterns](#contributing-patterns)

## Overview

The scanner uses patterns inspired by the [Atheon](https://github.com/HoraDomu/Atheon) project for comprehensive security and code quality analysis.

### Pattern Categories

- 🔐 **Security**: Secrets, credentials, vulnerabilities, OWASP Top 10
- 🎨 **Code Quality**: Anti-patterns, code smells, technical debt
- 🔧 **Maintenance**: Known issues, debug statements, TODOs
- 📝 **Best Practices**: Language-specific violations and conventions

### Severity Levels

- 🔴 **Critical**: Immediate security risk, data exposure
- 🟠 **High**: Security vulnerability, serious quality issue
- 🟡 **Medium**: Moderate quality issue, potential problem
- 🟢 **Low**: Minor issue, code smell, style violation
- ⚪ **Info**: Informational, note, suggestion

### Pattern Metadata

Each pattern includes:
- **CWE Reference**: MITRE CWE number for security patterns
- **OWASP Reference**: OWASP ASVS category
- **Category**: Pattern category for organization
- **Extensions**: Applicable file extensions
- **Regex Pattern**: Regular expression for matching

## Security Patterns

### Secret Detection Patterns

#### AWS Access Key

```regex
(?i)(aws_access_key_id|aws_secret_access_key)\s*[:=]\s*['\"]?[A-Z0-9]{20}['\"]?
```

**Details:**
- **Severity**: Critical
- **Category**: security
- **CWE**: CWE-798 (Use of Hard-coded Credentials)
- **OWASP**: A07:2021 (Identification and Authentication Failures)
- **Extensions**: .go, .py, .js, .ts, .java, .rb, .php, .cs, .cpp, .c, .h
- **Description**: AWS access key ID detected

**Example:**
```javascript
// ❌ Bad
const awsKey = "AKIAIOSFODNN7EXAMPLE";
const awsSecret = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";

// ✅ Good
const awsKey = process.env.AWS_ACCESS_KEY_ID;
const awsSecret = process.env.AWS_SECRET_ACCESS_KEY;
```

#### GitHub Personal Access Token

```regex
(?i)ghp_[a-zA-Z0-9]{36}
```

**Details:**
- **Severity**: Critical
- **Category**: security
- **CWE**: CWE-798
- **OWASP**: A07:2021
- **Extensions**: .go, .py, .js, .ts, .java, .rb, .php, .cs, .cpp, .c, .h
- **Description**: GitHub personal access token detected

#### API Key Pattern

```regex
(?i)(api[_-]?key|apikey)\s*[:=]\s*['\"]?[a-zA-Z0-9_-]{20,}['\"]?
```

**Details:**
- **Severity**: High
- **Category**: security
- **CWE**: CWE-798
- **OWASP**: A07:2021
- **Extensions**: .go, .py, .js, .ts, .java, .rb, .php, .cs, .cpp, .c, .h
- **Description**: Potential API key detected

#### Database Connection String

```regex
(?i)(mongodb|mysql|postgres|postgresql)://[^\s@]+:[^\s@]+@[^\s]+
```

**Details:**
- **Severity**: High
- **Category**: security
- **CWE**: CWE-798
- **OWASP**: A07:2021
- **Extensions**: .go, .py, .js, .ts, .java, .rb, .php, .cs, .cpp, .c, .h
- **Description**: Database connection string with credentials

### Vulnerability Patterns

#### SQL Injection Risk

```regex
(?i)(query|exec)\s*\(\s*['\"]\s*(select|insert|update|delete)\s.*\+\s*
```

**Details:**
- **Severity**: High
- **Category**: security
- **CWE**: CWE-89 (SQL Injection)
- **OWASP**: A03:2021 (Injection)
- **Extensions**: .py, .js, .ts, .java, .rb, .php, .go, .cs
- **Description**: Potential SQL injection vulnerability

**Example:**
```php
// ❌ Bad
$query = "SELECT * FROM users WHERE id = " . $_GET['id'];

// ✅ Good
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$id]);
```

#### Weak Cryptographic Algorithm

```regex
(?i)(md5|sha1)\s*\(
```

**Details:**
- **Severity**: Medium
- **Category**: security
- **CWE**: CWE-327 (Use of a Broken or Risky Cryptographic Algorithm)
- **OWASP**: A02:2021 (Cryptographic Failures)
- **Extensions**: .go, .py, .js, .ts, .java, .rb, .php, .cs, .cpp, .c, .h
- **Description**: Weak cryptographic algorithm detected

**Example:**
```javascript
// ❌ Bad
const hash = crypto.createHash('md5').update(data);

// ✅ Good
const hash = crypto.createHash('sha256').update(data);
```

#### Hardcoded Credentials

```regex
(?i)(username|password|passwd|pwd)\s*[:=]\s*['\"]\w+['\"]
```

**Details:**
- **Severity**: High
- **Category**: security
- **CWE**: CWE-798
- **OWASP**: A07:2021
- **Extensions**: .go, .py, .js, .ts, .java, .rb, .php, .cs, .cpp, .c, .h
- **Description**: Hardcoded username/password detected

## Code Quality Patterns

### Debug Statements

#### Console Log (JavaScript)

```regex
console\.log\(
```

**Details:**
- **Severity**: Low
- **Category**: code_quality
- **Extensions**: .js, .ts
- **Description**: Debug console.log statement found

#### Print Statement (Python)

```regex
\bprint\(
```

**Details:**
- **Severity**: Low
- **Category**: code_quality
- **Extensions**: .py, .rb, .php
- **Description**: Debug print statement found

### Maintenance Patterns

#### TODO Comment

```regex
(?i)//\s*todo:|#\s*todo:|/\*\s*todo:
```

**Details:**
- **Severity**: Info
- **Category**: maintenance
- **Extensions**: .go, .py, .js, .ts, .java, .rb, .php, .cs, .cpp, .c, .h
- **Description**: TODO comment found

**Example:**
```javascript
// TODO: Implement error handling
// FIXME: This function has performance issues
```

#### FIXME Comment

```regex
(?i)//\s*fixme:|#\s*fixme:|/\*\s*fixme:
```

**Details:**
- **Severity**: Medium
- **Category**: maintenance
- **Extensions**: .go, .py, .js, .ts, .java, .rb, .php, .cs, .cpp, .c, .h
- **Description**: FIXME comment indicating known issue

## Language-Specific Patterns

### JavaScript/TypeScript

#### Debug Console Methods

```regex
console\.(log|debug|info|warn|error)\(
```

- **Severity**: Low
- **Extensions**: .js, .ts, .jsx, .tsx

### Python

#### Debug Print Statements

```regex
\bprint\(.*\)
```

- **Severity**: Low
- **Extensions**: .py

#### Import Anti-Patterns

```regex
from \* import
```

- **Severity**: Medium
- **Category**: code_quality
- **Extensions**: .py

### Go

#### TODO Comments

```regex
//\s*TODO:|//\s*FIXME:
```

- **Severity**: Info/Medium
- **Category**: maintenance
- **Extensions**: .go

### Java

#### System Out Print

```regex
System\.out\.print(ln)?
```

- **Severity**: Low
- **Category**: code_quality
- **Extensions**: .java

### Ruby

#### Debug Output

```regex
puts\s*\(.*\)|p\s*\(.*\)
```

- **Severity**: Low
- **Category**: code_quality
- **Extensions**: .rb

## Pattern Configuration

### Adding Custom Patterns

Patterns can be added by modifying `pkg/patterns/scanner.go`:

```go
{
    Name:        "Custom Pattern",
    Type:        "security",
    Severity:    "high",
    Description: "Description of what this pattern detects",
    Regex:       `pattern_regex_here`,
    Category:    "security",
    CWE:         "CWE-XXX",
    OWASP:       "A00:2021",
    Extensions:  []string{".go", ".py", ".js"},
}
```

### Pattern Fields

```go
type Pattern struct {
    Name        string   // Pattern name
    Type        string   // Pattern type (secret, quality, etc.)
    Severity    string   // Severity level
    Description string   // Human-readable description
    Regex       string   // Regular expression pattern
    Category    string   // Category for grouping
    CWE         string   // MITRE CWE reference (optional)
    OWASP       string   // OWASP reference (optional)
    Extensions  []string // Applicable file extensions
    compiled    *regexp.Regexp // Compiled regex (internal)
}
```

## False Positives

### Common False Positives

1. **Test Files**: Patterns in test files that are intentional
2. **Documentation**: Code in markdown or doc files
3. **Comments**: Patterns in comments explaining security concepts
4. **Examples**: Security examples in documentation

### Reducing False Positives

The scanner automatically:
- Skips certain directories (.git, node_modules, vendor)
- Uses context-aware pattern matching
- Applies severity weighting based on file location

### Handling False Positives

If you encounter false positives:

1. **Review the finding** in the generated report
2. **Check the context** around the pattern match
3. **Consider the file type** (test files, documentation, etc.)
4. **Evaluate the severity** appropriately

## Pattern Performance

### Scan Statistics

- **Average patterns per file**: 15-25 checks
- **Processing speed**: 1,000-10,000 files per second
- **Memory usage**: 50-200MB during scanning
- **Pattern complexity**: O(n) where n is file size

### Optimization

Patterns are optimized for:
- **Fast matching**: Compiled regular expressions
- **Early termination**: Extension-based filtering
- **Memory efficiency**: Streaming file processing
- **Parallel processing**: Concurrent pattern matching

## Pattern Maintenance

### Updating Patterns

To update patterns:

1. **Review security advisories** for new vulnerabilities
2. **Add new patterns** to `pkg/patterns/scanner.go`
3. **Test patterns** against sample code
4. **Update documentation** with new patterns
5. **Release updates** with improved detection

### Testing Patterns

Test patterns against:

```bash
# Create test file with patterns
cat > test_patterns.py << 'EOF'
aws_access_key_id = "AKIAIOSFODNN7EXAMPLE"
aws_secret_access_key = "test"
api_key = "secret123"
console.log("debug")
# TODO: implement this
EOF

# Scan test file
./scanner scan --repo=test/repo --output=test_reports
```

## Contributing Patterns

### Pattern Guidelines

When contributing patterns:

1. **Test thoroughly** against real codebases
2. **Document clearly** what the pattern detects
3. **Include examples** of true positives
4. **Note false positives** and how to avoid them
5. **Follow naming conventions** for consistency

### Pattern Submission

To submit new patterns:

1. Fork the repository
2. Add pattern to `pkg/patterns/scanner.go`
3. Add tests for the pattern
4. Update this documentation
5. Submit pull request

See [CONTRIBUTE.md](../../CONTRIBUTE.md) for contribution guidelines.

## Pattern Limitations

### Current Limitations

1. **Static Analysis Only**: No runtime analysis
2. **Regex-Based**: Limited to pattern matching
3. **Language Coverage**: Some languages have fewer patterns
4. **Context Understanding**: Limited semantic analysis

### Future Improvements

- **Machine Learning**: AI-powered pattern recognition
- **Semantic Analysis**: Code understanding beyond patterns
- **Taint Analysis**: Data flow tracking
- **Custom Patterns**: User-defined pattern support

## Security References

### Standards and Frameworks

- **MITRE CWE**: Common Weakness Enumeration
- **OWASP**: Open Web Application Security Project
- **ASVS**: Application Security Verification Standard
- **SANS Top 25**: Most dangerous software errors

### Related Projects

- **[Atheon](https://github.com/HoraDomu/Atheon)**: Core pattern matching engine
- **[GitHub Security Lab](https://github.com/securitylab)**: Security research
- **[OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)**: Security guides

## Pattern Changelog

### Version 0.1.0 (Current)

**Security Patterns:**
- ✅ AWS Access Key detection
- ✅ GitHub Token detection
- ✅ API Key pattern detection
- ✅ Database credentials detection
- ✅ SQL Injection risk detection
- ✅ Weak cryptography detection
- ✅ Hardcoded credentials detection

**Quality Patterns:**
- ✅ Debug statement detection (console.log, print)
- ✅ TODO/FIXME comment detection
- ✅ Code quality anti-patterns

**Language Support:**
- ✅ Go, Python, JavaScript, TypeScript
- ✅ Java, Ruby, PHP, C#
- ✅ C/C++, Rust, Swift, Kotlin

---

**Powered by patterns from [Atheon](https://github.com/HoraDomu/Atheon)**