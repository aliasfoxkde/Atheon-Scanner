# Arheon-Scanner Gap Resolution Plan

## Executive Summary

Comprehensive audit found **73+ issues** across Go, Python, JavaScript, Cloudflare Worker, and Flask API:
- Critical: 14+
- High: 22+
- Medium: 23+
- Low: 14+

---

## Phase 1: Critical Security Fixes

### C1: Python Command Injection (CRITICAL)
- [ ] Sanitize all subprocess calls in Python agents
- [ ] Package names must be validated before shell commands
- Files: `go_scanner.py`, `npm_speed_scanner.py`, `python_ultra_fast_scanner.py`, `rubygems_scanner.py`, `quality_audit_system.py`, `universal_package_scanner.py`

### C2: Path Traversal Fixes (CRITICAL)
- [ ] Fix path traversal in `daemon_runner.py:270`
- [ ] Fix path traversal in `intelligence_sharing_agent.py:310,383`
- [ ] Fix path traversal in `universal_package_scanner.py:394`
- [ ] Fix path traversal in `package_registry_scanner.py:345`
- [ ] Fix path traversal in `Flask API static_files`

### C3: Authentication & CORS (CRITICAL)
- [ ] Remove CORS wildcard in Cloudflare Worker
- [ ] Remove CORS wildcard in Flask API
- [ ] Add authentication to Flask API endpoints
- [ ] Add authentication to Cloudflare Worker /api/refresh

### C4: Go Security Issues (CRITICAL)
- [ ] Fix token exposure in `pkg/github/client.go:218-225`
- [ ] Fix path traversal in `pkg/scanner/scanner.go:128-145`

### C5: Rate Limiting & Input Validation (HIGH)
- [ ] Add rate limiting to Cloudflare Worker
- [ ] Add rate limiting to Flask API
- [ ] Fix pagination division by zero in Cloudflare Worker
- [ ] Add POST body validation to Cloudflare Worker

---

## Phase 2: Hardcoded Values & Configuration

### H1: Hardcoded Paths
- [ ] Replace `/nas/Temp/repos/Atheon-GitHub-Scanner` with env vars
- [ ] Replace `/nas/Temp/atheon-scanner` with env vars
- [ ] Make temp directories configurable

### H2: Hardcoded URLs
- [ ] Replace hardcoded Worker URL in `web-app/src/services/realScannerData.js`
- [ ] Use environment variables for API URLs

### H3: Configuration Management
- [ ] Add config.yaml or environment-based config
- [ ] Document required environment variables

---

## Phase 3: Code Quality Improvements

### Q1: Error Handling
- [ ] Fix bare except clauses in Python agents (50+ instances)
- [ ] Add proper error propagation
- [ ] Remove silent failures

### Q2: Type Safety
- [ ] Migrate web-app from JavaScript to TypeScript
- [ ] Add Go input validation structs
- [ ] Add Zod validation for API inputs

### Q3: Test Coverage
- [ ] Add tests for security-critical functions
- [ ] Add integration tests for API endpoints
- [ ] Improve Go test coverage

---

## Phase 4: Documentation & Structure

### D1: Documentation
- [ ] Update README for new Arheon-Scanner name
- [ ] Fix outdated links
- [ ] Add security policy
- [ ] Document deployment process

### D2: Project Structure
- [ ] Rename repository references
- [ ] Update Docker configuration
- [ ] Fix symlinks to global configs

---

## Phase 5: Feature Gaps

### F1: Missing Security Features
- [ ] Add HTTPS enforcement
- [ ] Add security headers (CSP, X-Frame-Options, etc.)
- [ ] Add input sanitization
- [ ] Add request validation

### F2: Missing Operational Features
- [ ] Add logging/monitoring
- [ ] Add health check endpoints
- [ ] Add graceful shutdown

---

## Phase 6: Extraction Opportunities for Atheon-Benchmark

### E1: Shared Components
- [ ] Extract pattern matching engine
- [ ] Extract report generation system
- [ ] Extract web dashboard components

### E2: Shared Infrastructure
- [ ] Extract Cloudflare Worker patterns
- [ ] Extract Docker configurations
- [ ] Extract CI/CD workflows

---

## Priority Order

1. Phase 1: All C* items (Critical security)
2. Phase 2: H* items (Configuration)
3. Phase 3: Q* items (Code quality)
4. Phase 4: D* items (Documentation)
5. Phase 5: F* items (Missing features)
6. Phase 6: E* items (Extraction)
