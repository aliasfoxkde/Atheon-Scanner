# Progress

## 2026-06-21

### Iteration cycle: rename + structure + test expansion

- Renamed all instances of "Atheon GitHub Scanner" to "Atheon Scanner"
- Moved PLAN.md, PROGRESS.md, TASKS.md, RESEARCH.md to docs/
- Removed temp files: rails/, express-5.2.1.tgz, lodash-4.18.1.tgz
- Added .gitignore with proper rules for temp files, AI tooling
- Added CONTRIBUTING.md and CODE_OF_CONDUCT.md
- Expanded test suite from 101 to 135 tests:
  - security/ (12 tests): XSS, CSP, headers, localStorage, injection, rate limit
  - e2e/user-flows.spec.js (11 tests): complete flows, bookmark persistence, sort, pagination, compare modal
  - lint/ (11 tests): ESLint, console.error, dead exports, a11y, inline styles, bundle size
- Deployed to https://7ab08637.atheon-scanner.pages.dev

## Prior work

See docs/PROGRESS.md for historical progress.
