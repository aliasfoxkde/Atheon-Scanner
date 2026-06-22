# Atheon-Enhanced Benchmark Results

**Generated:** 2026-06-21
**Platform:** linux | **Node:** v24.16.0
**Atheon Version:** dev
**Binary:** /tmp/atheon (9.3MB)

---

## Performance Summary

| Metric | Value |
|--------|-------|
| Total npm packages scanned | 6 |
| Total GitHub repos scanned | 1 |
| Total findings (npm) | 21,079 |
| Total files scanned | ~1,350 (npm) |
| Patterns enabled | 175 |
| Patterns disabled | 1 |
| Categories covered | 19/19 |
| **Avg scan time** | **25,887ms** (npm packages) |
| Fastest scan | 311ms (vue, 37 files) |
| Slowest scan | 120,111ms (typescript, **TIMEOUT — broken**) |
| **Throughput** | **~9 files/sec** |

---

## Finding Severity Totals (from npm package scans)

| Severity | Count | Source |
|----------|-------|--------|
| Critical | 157 | circleci-personal-token (axios) |
| High | 41 | prototype-pollution (axios) |
| Medium | 0 | — |
| Low | 20,881 | missing-skip-links, placeholder-code, aria-labels, etc. |

---

## Top 20 Patterns Found in Real Packages

| Count | Pattern | Category | Notes |
|-------|---------|----------|-------|
| 18,429 | missing-skip-links | accessibility | **Massive FP**: matches every browserslistrc entry |
| 809 | dockerfile | devops | Real: Dockerfile present in packages |
| 462 | placeholder-code | code-quality | FP: matches README template text |
| 240 | console-log | code-quality | Real: debug statements in source |
| 224 | cruft | code-quality | Dead code / outdated patterns |
| 202 | aria-labels | accessibility | Real: missing ARIA labels |
| 201 | missing-alt-text | accessibility | Real: images without alt text |
| 157 | circleci-personal-token | secrets | **FALSE POSITIVE**: matches version string literals |
| 59 | typescript-any | code-quality | Real: `any` type usage |
| 41 | prototype-pollution | security-hardening | Real: prototype chain manipulation |
| 30 | ci-cd | devops | Real: CI workflow files present |
| 28 | unreachable-code | code-quality | Real: dead code paths |
| 27 | timeout | performance | Real: setTimeout/clearTimeout calls |
| 21 | empty-catch-block | code-quality | Real: catch with no handling |
| 19 | github-workflow | devops | Real: GitHub Actions present |

---

## Per-Scan Breakdown

### npm packages

| Package | Files | Findings | Time | Status |
|---------|-------|----------|------|--------|
| lodash | 1,051 | 14,230 | 24,513ms | ✅ |
| axios | 85 | 4,625 | 6,777ms | ✅ |
| react | 27 | 1,315 | 2,329ms | ✅ |
| express | 10 | 840 | 1,280ms | ✅ |
| vue | 37 | 69 | 311ms | ✅ |
| typescript | 140 | 0 | 120,111ms | **❌ TIMEOUT** |

### GitHub repos

| Repo | Files | Findings | Time | Status |
|------|-------|----------|------|--------|
| bootstrap | ~539 | 28,136 | ~60s | ✅ (exit 1 but valid JSON) |

---

## ✅ What's Working Well

- Scanning produces structured JSON output suitable for CI integration
- Binary is lightweight (9.3MB) and fully portable (single binary, no deps)
- All 19 categories covered with 175 enabled patterns
- Supports `--categories` filter for targeted scans
- Supports `--file` for single-file targeted scans
- Pattern enable/disable/list commands work correctly
- Secrets detection functional (aws keys, azure tokens detected)
- Accessibility patterns work (aria-labels, missing-alt-text, table-headers)
- Code quality patterns catch real issues (console-log, unreachable-code, empty-catch-block)
- Performance patterns present (n-plus-one-query, memory-leaks, timeout)

---

## ⚠️ Limitations & Issues

### 🔴 Bugs (Priority)

1. **TypeScript scan times out (~120s)** — exits 1, produces no JSON. The Go scanner hangs on large TypeScript type-definition files. **Broken for any significant TS project.**
2. **Exit code 1 on valid scans** — bootstrap scan exits 1 even with valid JSON output. CI pipelines treat this as failure. `--json` should exit 0 when JSON is valid.
3. **No progress indicator** — scans of 1000+ files show zero feedback until complete. Terminal appears hung.
4. **`missing-skip-links` massive false-positive rate** — matches every entry in `browserslistrc`, `.cspell.json`, and similar config files as if they were HTML skip links. 18,429 of 21,079 findings (87%) are this single pattern on config files.

### 🟡 Missing Features (High Priority)

1. **No ignore/exclude patterns** — scans everything including `node_modules`, `.git`, `dist`. Without `.gitignore`-style support, real-world use is impractical.
2. **No SARIF output** — required for GitHub Advanced Security integration.
3. **No JUnit output** — required for most CI/CD pipeline integrations.
4. **No JSON schema** — output format is undocumented.
5. **No .atheonignore** — no way to suppress per-file or per-pattern findings.
6. **Single-threaded only** — no `-j/--jobs` for parallel scanning on multi-core machines.
7. **No incremental/resume** — always full re-scan, no caching between runs.
8. **No diff view** — cannot compare findings between two commits.

### 🟢 Performance Issues

1. **~9 files/sec throughput** — very slow. Semgrep processes ~10,000 files/sec. Target for competitiveness: 1,000+ files/sec.
2. **Memory unbounded** — large repos (50k+ files) may exhaust memory. No streaming output.
3. **No caching** — same repo re-scanned fully each time.
4. **TypeScript + node_modules** — pathological combination causes timeout. Needs special handling.

---

## Recommendations for Atheon-Benchmark

### Metrics to Track

| Metric | Current | Target | Priority |
|--------|---------|--------|----------|
| Throughput (files/sec) | 9 | 1,000+ | 🔴 Critical |
| TypeScript scan time (140 files) | 120s (timeout) | <5s | 🔴 Critical |
| Exit code on valid JSON | 1 (broken) | 0 | 🔴 Critical |
| Small pkg scan (27 files) | 2.3s | <0.5s | 🟡 High |
| Medium pkg scan (1,051 files) | 24.5s | <5s | 🟡 High |
| Memory at 10k files | unknown | <500MB | 🟡 High |
| False-positive rate | 87% (missing-skip-links) | <10% | 🔴 Critical |
| JSON schema available | no | yes | 🟡 High |

### Critical Fixes for Competitive Parity

1. **Add `.gitignore`-style exclude patterns** — biggest blocker for real-world adoption
2. **Fix TypeScript scan timeout** — currently BROKEN for TypeScript projects
3. **Exit code 0 for valid JSON output** — CI pipelines fail otherwise
4. **Add `--pattern <name>` filter to JSON** — dramatically reduce noise
5. **Fix missing-skip-links false-positive rate** — 87% of findings are wrong
6. **Add progress output** — give users feedback during long scans
7. **Add SARIF output format** — table stakes for security tooling
8. **Profile and optimize hot path** — identify where Go runtime spends time

### False Positive Analysis

- **lodash**: 14,230 findings / 1,051 files = 13.5 findings/file → **Extremely high FP**
  - Root cause: `missing-skip-links` matches every `browserslistrc` entry
- **vue**: 69 findings / 37 files = 1.9 findings/file → **Acceptable**
- **react**: 1,315 findings / 27 files = 48.7 findings/file → **High FP**
- **axios**: 4,625 findings / 85 files = 54.4 findings/file → **Extremely high FP**
  - `circleci-personal-token` pattern matches version string literals, not real secrets

---

*Auto-generated by atheon-benchmark.cjs + real-repo-scan.cjs — Atheon-Scanner*
