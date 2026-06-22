# Contributing to Atheon-Scanner

First off, thank you for considering contributing to Atheon-Scanner! It's people like you that make this project successful.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)
- [Community](#community)

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Go 1.21 or higher
- Git
- GitHub account (for contributions)
- Basic understanding of GitHub, Go, and security concepts

### Setting Up Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/Atheon-Scanner.git
   cd Atheon-Scanner
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Build the project**
   ```bash
   go build -o scanner cmd/scanner/main.go
   ```

4. **Test your build**
   ```bash
   ./scanner --help
   ```

### Development Tools

- **Editor**: VS Code, GoLand, or your preferred Go IDE
- **Linting**: `golangci-lint` for code quality
- **Testing**: `go test` for unit tests
- **Documentation**: Markdown for docs, GoDoc for code comments

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes

- Follow the coding standards (below)
- Add tests for new functionality
- Update documentation as needed
- Keep changes focused and atomic

### 3. Test Your Changes

```bash
# Run tests
go test ./...

# Run linting
go vet ./...
golangci-lint run

# Build and test manually
go build -o scanner cmd/scanner/main.go
./scanner scan --repo=test/repo
```

### 4. Commit Your Changes

Follow conventional commit format:
```
feat: add new pattern for detecting API keys
fix: resolve rate limiting issue with GitHub API
docs: update installation instructions
test: add tests for scanner module
refactor: improve error handling in client
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub with:
- Clear title and description
- Reference any related issues
- Link to documentation updates
- Explain the change and its impact

## Coding Standards

### Go Code Style

Follow standard Go conventions:
- Use `gofmt` for formatting
- Follow Effective Go guidelines
- Add godoc comments for exported functions
- Use meaningful variable names
- Keep functions focused and small

### Example:
```go
// ScanRepository scans a single repository and returns analysis results
// It handles repository cloning, pattern matching, and quality assessment
func (s *Scanner) ScanRepository(owner, name string) (*ScanResult, error) {
    // Implementation...
}
```

### Pattern Definitions

When adding new patterns:
- Include clear descriptions
- Assign appropriate severity levels
- Add CWE/OWASP references for security issues
- Test against real code samples
- Document false positives

### Error Handling

- Always handle errors appropriately
- Provide context in error messages
- Use wrapping errors with `fmt.Errorf`
- Log important errors with context

### Testing

- Write tests for all new functionality
- Aim for >80% code coverage
- Test edge cases and error conditions
- Use table-driven tests where appropriate

## Documentation

### Code Documentation

- Exported functions must have godoc comments
- Complex algorithms need explanation
- Security patterns need usage examples
- Configuration options need documentation

### Project Documentation

Update relevant docs in `./docs/`:
- **User Guides**: For new features or workflows
- **Technical Docs**: For architecture changes
- **API Docs**: For new API endpoints or functions
- **Guides**: For new usage patterns

### Documentation Structure

```
docs/
├── user-guide/        # End-user documentation
├── technical/         # Technical architecture
├── api/              # API documentation
├── guides/           # How-to guides
└── reference/        # Reference materials
```

## Submitting Changes

### Pull Request Checklist

Before submitting, ensure:
- [ ] Code follows project standards
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] Commit messages follow conventional format
- [ ] No merge conflicts
- [ ] Ready for review and testing

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How changes were tested

## Related Issues
Fixes #issue_number
Related to #issue_number
```

## Testing

### Running Tests

```bash
# Run all tests
go test ./...

# Run with coverage
go test -cover ./...

# Run specific package
go test ./pkg/scanner

# Run with race detection
go test -race ./...
```

### Adding Tests

```go
func TestScanRepository(t *testing.T) {
    tests := []struct {
        name    string
        owner   string
        repo    string
        wantErr bool
    }{
        {"valid repo", "facebook", "react", false},
        {"invalid repo", "invalid", "repo", true},
    }
    // Test implementation...
}
```

## Project Areas

### Core Components
- **Scanner**: Pattern matching and repository analysis
- **GitHub Client**: API integration and rate limiting
- **Report Generator**: Markdown and JSON report creation
- **Database**: PostgreSQL integration and storage

### Pattern Definitions
- Security patterns (secrets, vulnerabilities)
- Code quality patterns (anti-patterns, code smells)
- Language-specific patterns

### Documentation
- User guides and tutorials
- Technical architecture
- API documentation
- Contributing guidelines

## Getting Help

### Questions?
- Check existing [documentation](./docs/)
- Search [existing issues](https://github.com/aliasfoxkde/Atheon-Scanner/issues)
- Start a [discussion](https://github.com/aliasfoxkde/Atheon-Scanner/discussions)

### Found a Bug?
- Search for existing issues first
- Create a new issue with detailed information
- Include steps to reproduce
- Provide environment details

### Feature Request?
- Check if it's already planned
- Start a discussion to gather feedback
- Submit a detailed proposal

## Recognition

Contributors are recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Atheon-Scanner!**

Every contribution, no matter how small, helps improve the project. Whether it's bug reports, feature requests, code contributions, or documentation improvements, we appreciate your time and effort.