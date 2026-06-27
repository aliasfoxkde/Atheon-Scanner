# Atheon GitHub Scanner — PWA

> Security vulnerability detection, code quality scoring, and open-source health analysis for GitHub repositories.

**Live:** https://atheon-scanner.pages.dev

## Features

- **Dashboard** — Real-time stats, recent scans, quality distribution, security findings
- **Reports** — Filterable/sortable table of 2,100+ analyzed packages, CSV/JSON export
- **Compare** — Side-by-side comparison of up to 4 reports
- **Trending** — Top-scoring packages, watchlist
- **Submit** — Request analysis of any public GitHub repository
- **Pipeline** — Security scan pattern reference (33 secret patterns, 20 security patterns, etc.)
- **Settings** — Auto-refresh interval, display density, column visibility
- **PWA** — Offline-capable, installable on desktop and mobile
- **Keyboard shortcuts** — `g d` Dashboard, `g r` Reports, `g t` Trending, `/` search, `?` shortcuts

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts |
| Routing | React Router 6 |
| PWA | vite-plugin-pwa (Workbox) |
| Testing | Jest + Testing Library / Playwright |
| Deployment | Cloudflare Pages |

## Getting Started

```bash
# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run all tests
npm test

# Unit tests only
npm run test:unit

# E2E tests (headless)
npm run test:e2e

# E2E tests (headed)
npm run test:e2e:headed

# Lighthouse audit
node scripts/lighthouse-audit.js https://your-preview.pages.dev
```

## Project Structure

```
web-app/
├── public/
│   ├── embedded-data.json   # Pre-baked dataset (2,100+ repos)
│   ├── favicon.svg
│   ├── icons/               # PWA icons (192x192, 512x512)
│   ├── offline.html         # Offline fallback page
│   ├── robots.txt
│   ├── sitemap.xml
│   └── browserconfig.xml   # Windows tile config
├── src/
│   ├── components/
│   │   ├── Charts.jsx       # BarChart, DonutChart, RepositoryRadarChart
│   │   ├── CompareModal.jsx # Side-by-side comparison
│   │   ├── EmptyState.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── Layout/
│   │   ├── Modal.jsx
│   │   ├── Pagination.jsx
│   │   ├── ReportDetailModal.jsx
│   │   ├── Skeleton.jsx     # SkeletonCard, SkeletonTable, etc.
│   │   ├── ThemeToggle.jsx
│   │   └── Toast.jsx
│   ├── contexts/
│   │   ├── SettingsContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── ToastContext.jsx
│   ├── hooks/
│   │   ├── useDocumentTitle.js
│   │   └── useKeyboardShortcuts.jsx
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── ApiDocs.jsx
│   │   ├── Dashboard.jsx
│   │   ├── NotFound.jsx
│   │   ├── Pipeline.jsx
│   │   ├── ReportDetail.jsx
│   │   ├── Reports.jsx
│   │   ├── Settings.jsx
│   │   ├── Submit.jsx
│   │   └── Trending.jsx
│   ├── services/
│   │   ├── api.js           # API client with embedded-data fallback
│   │   └── realScannerData.js
│   └── utils/
│       ├── colors.js
│       ├── date.js
│       └── scanCategories.js
├── tests/
│   ├── e2e/                 # Playwright E2E tests
│   ├── integration/
│   ├── smoke/
│   └── performance/
├── .github/workflows/
│   └── lighthouse.yml       # Lighthouse CI on every push/PR
└── vite.config.js
```

## Data Architecture

The app is **fully static** — no backend required. At build time, `embedded-data.json` is generated from the scanner pipeline and embedded into the PWA. The service worker caches it with a 5-minute TTL and falls back to the cache when offline.

```
embedded-data.json → build → PWA precache → SW runtime cache (5m TTL)
                                        ↘ offline fallback (offline.html)
```

## Deployment

```bash
# Build
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name atheon-scanner

# Or via GitHub Actions (automatic on push to master)
# See .github/workflows/ in the root repo
```

## Accessibility

- Semantic HTML throughout (`<nav>`, `<main>`, `<article>`, `<section>`)
- ARIA labels on all interactive elements
- Skip-to-content link
- Keyboard-navigable (all actions reachable via keyboard)
- `role="status"` on skeleton loaders with `aria-busy`
- `aria-current="page"` on active nav links
- Dark/light theme support
- Print stylesheet (media=print)

## Performance

- Code splitting: `react-vendor` and `charts` chunks separate
- Embedded data excluded from precache (too large)
- Service worker runtime caching with NetworkFirst for data, CacheFirst for assets
- Skeleton loaders instead of spinners
- `AbortSignal` for cancellable data fetches

## Lighthouse CI Budget

| Category | Threshold |
|----------|-----------|
| Performance | ≥ 80 |
| Accessibility | ≥ 90 |
| Best Practices | ≥ 90 |
| SEO | ≥ 90 |

See `.lighthouserc.json` for full budget configuration.
