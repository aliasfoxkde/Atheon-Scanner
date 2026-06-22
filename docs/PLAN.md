# Plan: Fix Dark Mode, Charts, and Real Data

## Phase 1: Fix Tailwind darkMode
- Add `darkMode: 'class'` to `web-app/tailwind.config.js`

## Phase 2: Rebuild embedded-data.json
- Load all JSONL sources (mass, local, comprehensive, hybrid, incremental)
- Deduplicate by full_name, keeping richest record
- Sort by stars descending
- Include all real metadata fields
- Use actual security_issues severity counts for tier computation

## Phase 3: Replace SecurityRadarChart
- Replace fake derived metrics with real severity counts
- Show actual security_issue patterns (XSS, Injection, etc.)
- Display real counts per severity level
