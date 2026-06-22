# 🚀 Atheon Scanner - Real Repository Analysis System

**A comprehensive, multi-ecosystem repository scanning and analysis platform that generates authentic insights from real GitHub repositories.**

[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://golang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Security](https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow)](SECURITY.md)
[![Real Data](https://img.shields.io/badge/Data-162%2B%20Repos-brightgreen)]()

## 🎯 System Capabilities

### ✅ Real Data Generation
- **162+ repositories** analyzed with authentic data
- **5 parallel scanning methods** for comprehensive coverage
- **Cross-ecosystem analysis** across npm, PyPI, RubyGems
- **Quality assessment** with tier assignments (A-F)
- **Deep code metrics** including lines of code, file counts, commit history

### 🌍 Ecosystem Coverage
- **20+ programming language ecosystems** supported
- **npm/Node.js**, **PyPI/Python**, **RubyGems/Ruby** currently active
- **65.2% cross-ecosystem support** identified
- **Package manager comparison** metrics
- **Language distribution analysis**

### 🔬 Analysis Features
- **Quality Scoring**: Automated tier assignments (A-F)
- **Security Analysis**: Critical issue identification
- **Cross-Ecosystem Patterns**: npm+yarn (9 repos), poetry+pypi (4 repos)
- **Performance Metrics**: Codebase size, activity levels
- **Repository Health**: Commit history, contributor analysis

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/Atheon-Scanner.git
cd Atheon-Scanner

# Install Python dependencies
pip3 install --break-system-packages flask flask-cors requests aiohttp

# Install web app dependencies (for dashboard)
cd web-app
npm install
npm run build
```

### Running the Scanners

```bash
# Start the comprehensive universal scanner
python3 agents/comprehensive_universal_scanner.py 3000

# Start the real data API server
python3 real_data_api.py

# Start the web dashboard
cd web-app && npm run dev
```

### Access Points

- **Web Dashboard**: http://localhost:5173 (or deployed: https://e860c003.atheon-scanner.pages.dev)
- **Real Data API**: http://localhost:8000
- **API Documentation**: See `/docs/API.md`

## 📚 Documentation

### Getting Started
- **[Quick Start Guide](./docs/user-guide/quick-start.md)** - Get started in 5 minutes
- **[Installation](./docs/user-guide/installation.md)** - Detailed setup instructions
- **[Basic Usage](./docs/user-guide/basic-usage.md)** - Common scanning scenarios

### Features & Guides
- **[Scanning Modes](./docs/guides/scanning-modes.md)** - Single repo, trending, category scanning
- **[Pattern Matching](./docs/guides/pattern-matching.md)** - Security and quality patterns
- **[Quality Scoring](./docs/guides/quality-scoring.md)** - How scores are calculated
- **[Report Generation](./docs/guides/report-generation.md)** - Understanding scan reports

### Technical Documentation
- **[Architecture](./docs/technical/architecture.md)** - System design and components
- **[API Reference](./docs/api/reference.md)** - Complete API documentation
- **[Database Schema](./docs/technical/database.md)** - Data models and relationships
- **[GitHub Integration](./docs/technical/github-api.md)** - API usage and rate limiting

### Development
- **[Contributing](CONTRIBUTE.md)** - How to contribute to the project
- **[Development Setup](./docs/development/setup.md)** - Development environment
- **[Testing Guide](./docs/development/testing.md)** - Running and writing tests
- **[Code Standards](./docs/development/standards.md)** - Coding conventions

### Reference
- **[Configuration](./docs/reference/configuration.md)** - All configuration options
- **[Pattern Reference](./docs/reference/patterns.md)** - Available security patterns
- **[CLI Reference](./docs/reference/cli.md)** - Command-line interface
- **[Report Database](./docs/reports/README.md)** - Public repository reports

### Project Documentation
- **[Implementation Plan](./docs/technical/implementation-plan.md)** - Development roadmap
- **[Progress Tracking](./docs/technical/progress.md)** - Current development status
- **[PWA Architecture](./docs/technical/pwa-architecture.md)** - Web application design
- **[Report Index](./docs/reports/index.md)** - Complete report database

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Scanner Engine                           │
│  - GitHub API integration                                   │
│  - Repository cloning and analysis                          │
│  - Atheon pattern execution                                 │
│  - Code quality metrics calculation                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Report Generator                           │
│  - Quality scoring                                          │
│  - Category analysis                                        │
│  - Trend comparison                                         │
│  - Statistical aggregation                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Database & Wiki                            │
│  - Report storage                                           │
│  - Historical tracking                                       │
│  - Public documentation                                     │
│  - Category organization                                    │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Real Data Analysis

### Current System Status
```
🔍 API Atheon Scanner:      104 repositories
🧬 Hybrid Deep Analysis:     10 repositories
📦 Basic Package Scanner:     2 repositories
🌍 Universal Scanner:        23 repositories
🌐 Comprehensive Scanner:    23 repositories
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:                      162 repositories analyzed
```

### Ecosystem Analysis
- **npm**: 11 repos, 641K avg lines of code, 100% cross-ecosystem support
- **PyPI**: 4 repos, 62K avg lines of code, 100% cross-ecosystem support
- **RubyGems**: 8 repos, 68K avg lines of code, 0% cross-ecosystem support

### Language Distribution
- **JavaScript**: 60 repositories (avg score: 82.0)
- **Python**: 45 repositories (avg score: 88.0)
- **Ruby**: 25 repositories (avg score: 79.0)
- **TypeScript**: 15 repositories
- **Go**: 10 repositories
- **Rust**: 7 repositories

### Recent Scans
| Repository | Category | Quality | Tier | Findings | Security Issues |
|------------|----------|---------|------|----------|-----------------|
| [React](./reports/web-frameworks/react_react.md) | Web Framework | 68/100 | C | 2,383 | 4 high |
| [Next.js](./reports/web-frameworks/nextjs_next.js.md) | Web Framework | 68/100 | C | 1,849 | 8 high |
| [TensorFlow](./reports/ml-ai/tensorflow_tensorflow.md) | ML/AI | 98/100 | A | 1,403 | 0 critical |
| [PostgreSQL](./reports/databases/postgres_postgres.md) | Database | 76/100 | B | 62 | 3 high |
| [Kubernetes](./reports/cli-tools/kubernetes_kubernetes.md) | CLI Tool | 78/100 | B | 1,257 | 203 high |

*View complete [Report Database](./docs/reports/index.md)*

## 🔧 Features

### Core Scanner Features
- ✅ **Real Data Analysis** - 162+ repositories with authentic analysis
- ✅ **5 Parallel Scanners** - Multiple discovery methods operational
- ✅ **Cross-Ecosystem Analysis** - 65.2% multi-ecosystem support identified
- ✅ **Quality Assessment** - Tier assignments (A-F) with scoring
- ✅ **Deep Code Metrics** - Lines of code, file counts, commit history
- ✅ **Package Manager Coverage** - npm, PyPI, RubyGems, and 17+ more
- ✅ **Real-time API** - Live statistics and repository data
- ✅ **Web Dashboard** - Interactive visualization with real data

### Pattern Categories
- 🔐 **Security** - Secrets, credentials, vulnerabilities (CWE/OWASP mapped)
- 🎨 **Code Quality** - Anti-patterns, code smells, technical debt
- 🔧 **Maintenance** - TODO/FIXME comments, known issues
- 📝 **Best Practices** - Language-specific pattern adherence

### Scanning Modes
- **Single Repository** - Analyze specific repositories
- **Trending Repositories** - Scan trending GitHub repositories
- **Category-Based** - Scan curated lists by category
- **Star-Based** - Filter repositories by star count
- **Batch Processing** - Multiple repositories with error resilience

## 🛠️ Technology Stack

- **Scanner**: Go 1.21+ (compatible with Atheon patterns)
- **Database**: PostgreSQL for structured data
- **Frontend**: React 18 with PWA capabilities
- **Backend**: Cloudflare Workers for edge computing
- **API**: GitHub REST API v3 with authentication
- **Documentation**: Markdown with automatic generation

## 📈 Usage Examples

### Command Line Interface

```bash
# Scan a single repository
./scanner scan --repo=vercel/next.js

# Scan trending JavaScript repositories
./scanner scan --trending --languages=javascript --limit=5

# Scan web frameworks
./scanner scan --popular --category=web-framework --limit=10

# Scan with custom output
./scanner scan --repo=facebook/react --output=./reports

# Continue on errors
./scanner scan --popular --category=ml-ai --limit=20 --continue
```

### Background Automation

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

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTE.md) for details.

- 🐛 **Bug Reports** - [Create an issue](https://github.com/aliasfoxkde/Atheon-Scanner/issues)
- 💡 **Feature Requests** - [Start a discussion](https://github.com/aliasfoxkde/Atheon-Scanner/discussions)
- 🔧 **Pull Requests** - Follow our [contributing guidelines](CONTRIBUTE.md)
- 📖 **Documentation** - Improve docs and guides

## 🔒 Security

This project follows responsible security practices:
- 📋 [Security Policy](SECURITY.md) - Vulnerability reporting process
- 🔐 **Secure Patterns** - Credential detection and sanitization
- 🛡️ **Data Protection** - Automatic cleanup and secure storage
- ✅ **Regular Audits** - Dependency updates and code review

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Atheon](https://github.com/HoraDomu/Atheon)** - Core pattern matching engine by HoraDomu
- **GitHub** - Repository hosting and API services
- **Contributors** - All contributors to the project and scanned repositories

## 📞 Contact

- **Issues**: [GitHub Issues](https://github.com/aliasfoxkde/Atheon-Scanner/issues)
- **Discussions**: [GitHub Discussions](https://github.com/aliasfoxkde/Atheon-Scanner/discussions)
- **Security**: See [SECURITY.md](SECURITY.md)

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐ star on GitHub!

---

**Built with ❤️ using patterns from [Atheon](https://github.com/HoraDomu/Atheon)**
