# Tasks

## Completed

### Core App
- [x] Fix tailwind.config.js: add `darkMode: 'class'`
- [x] Rebuild embedded-data.json with real data pipeline (2182 repos)
- [x] Replace SecurityRadarChart with real security data
- [x] Rebuild and deploy
- [x] Add skeleton loading states
- [x] Add keyboard shortcuts (g d/r/t/s/p/a, /, ?, Esc)
- [x] Add CompareModal for side-by-side comparison
- [x] Add Settings page with display/density controls
- [x] Add sortable columns and CSV/JSON export to Reports
- [x] Add global search to Dashboard (Cmd/Ctrl+K)

### Architecture & Performance
- [x] Code splitting (react-vendor, charts chunks)
- [x] PWA with service worker (vite-plugin-pwa)
- [x] Offline-capable (embedded data + runtime caching)
- [x] AbortSignal for cancellable fetches
- [x] TypeScript support (tsconfig, vite-plugin-checker)
- [x] Vite build optimization (chunkSizeWarningLimit, sourcemaps off)

### Testing & CI/CD
- [x] Add unit tests (39 passing — colors, date, ToastContext, SettingsContext, useKeyboardShortcuts)
- [x] Add E2E tests (8 Playwright specs: basic-ui, compare-modal, filter-validation, keyboard-shortcuts, new-features, reports-filters, settings, user-flows)
- [x] Add GitHub Actions CI (web-app-ci.yml — unit tests + build on push/PR)
- [x] Add Lighthouse CI workflow on master push
- [x] Add Lighthouse audit script (scripts/lighthouse-audit.js)

### PWA & SEO
- [x] Add PWA offline fallback (offline.html)
- [x] Add manifest (vite-plugin-pwa auto-generates)
- [x] Add robots.txt
- [x] Add sitemap.xml (7 routes)
- [x] Add browserconfig.xml (Windows tile)
- [x] Add print stylesheet (print.css)

### Accessibility
- [x] Skip-to-content link
- [x] aria-current on active nav links
- [x] aria-haspopup/aria-expanded on column picker menu
- [x] aria-labels on Settings reset, clear filters, print buttons
- [x] aria-label on Settings icon in nav
- [x] role="status" + aria-busy on skeleton loaders
- [x] Focus trap in modals (Escape to close)
- [x] Skeleton loaders instead of spinners

### Infrastructure & Docs
- [x] Fix stop hook JSON validation error (outcome-analyzer.py always outputs JSON)
- [x] Add web-app README.md
- [x] Fix package.json name/description/homepage/repository/keywords
- [x] sitemap.xml fixed to cover all 7 routes
- [x] Add docs/planning/ with SDLC, WORKFLOW, PIPELINE, DEPLOYMENT, SYSTEM_ARCHITECTURE

## Pending (Future Work)

### High Priority
- [x] Run E2E Playwright tests (164 passing — `npm run test:e2e`)
- [ ] sitemap.xml auto-generation on deploy (currently static, manual update)
- [ ] PWA push notifications / background sync for scan submission

### Medium Priority
- [ ] Convert pages to React.lazy + Suspense for route-level code splitting
- [ ] Add search autocomplete with debounce visualization
- [ ] Add data refresh indicator (last-updated timestamp with countdown)
- [ ] Add CSV/JSON import for watchlist/bookmarks
- [ ] Improve print stylesheet (add ReportDetail print view)
- [ ] Add `/api` page with interactive API explorer

### Low Priority / Nice-to-Have
- [ ] Custom scrollbar styling
- [ ] Animated page transitions
- [ ] Add `prefers-reduced-motion` media query check for animations
- [ ] Favicon.ico fallback for very old browsers
- [ ] Add `lang` attribute dynamic update for i18n readiness
- [ ] Apple touch icon (180x180 PNG)
- [ ] Add changelog entry for web-app releases
