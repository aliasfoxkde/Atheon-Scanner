# Contributing to Atheon Scanner

Thank you for your interest in contributing to Atheon Scanner!

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Atheon-Scanner.git
   cd Atheon-Scanner
   ```
3. **Install dependencies** for the web-app:
   ```bash
   cd web-app && npm install
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Web App

```bash
cd web-app
npm run dev       # Start dev server with hot reload
npm run build     # Production build
npm run preview   # Preview production build locally
npm run test      # Run unit tests
npx playwright test  # Run E2E test suite
```

### Code Style

- **React**: Follow existing component patterns, use functional components with hooks
- **CSS**: Use Tailwind utility classes; avoid arbitrary values
- **JS/ESLint**: 2-space indentation, single quotes, no semicolons
- **Testing**: Add Playwright tests for new features; run full suite before submitting PR

### Testing Requirements

All new features must include appropriate test coverage:

```bash
# Unit/integration tests
npm run test

# E2E tests
npx playwright test

# Accessibility tests
npx playwright test tests/accessibility/

# Full test suite
npx playwright test --reporter=list
```

Tests must pass on all three browser targets (Chromium, Firefox, WebKit).

### Pull Request Process

1. **Keep PRs focused** — one feature or fix per pull request
2. **Update documentation** — README, docs/, and inline comments as needed
3. **Add tests** — E2E, integration, or unit tests for all new behavior
4. **Run the full test suite** locally before submitting
5. **Fill out the PR template** completely

## Project Structure

```
Atheon-Scanner/
├── web-app/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route-level page components
│   │   ├── services/    # API and data services
│   │   ├── hooks/       # Custom React hooks
│   │   └── contexts/    # React context providers
│   └── tests/           # Playwright test suites
│       ├── e2e/         # End-to-end tests
│       ├── integration/ # Integration tests
│       ├── regression/   # Regression test suite
│       └── smoke/        # Smoke tests
├── docs/                 # Project documentation
└── data/                 # Embedded datasets
```

## Reporting Issues

- Search existing issues before opening a new one
- Use the issue templates (Bug Report, Feature Request)
- Include reproduction steps, expected vs actual behavior, and environment details
- For security vulnerabilities, see [SECURITY.md](docs/security/SECURITY.md)

## Code Quality Standards

- No `console.error` calls in production code
- All interactive elements must be keyboard accessible
- Color contrast must meet WCAG 2 AA standards
- SVG icons must include accessible text alternatives
- All API responses must be validated before use

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

*Last updated: 2026-06-21*
