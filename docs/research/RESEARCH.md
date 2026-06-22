# Research: Production-Grade Webapp Enhancement

## Problem Statement
- Theme toggle broken (Tailwind dark mode misconfigured)
- Icons wrong
- All repos Grade A, score 100 (fake data)
- Radar chart uses fake derived metrics
- embedded-data.json not using real scanner output

## Root Causes
1. `tailwind.config.js` missing `darkMode: 'class'` — Tailwind ignores `.dark` class
2. `embedded-data.json` built with fake scores (nearly all = 100)
3. `SecurityRadarChart` computes fake "Injection Attacks" etc. from raw counts
4. `mass_scan_results.jsonl` has fabricated quality_score=100 upstream

## Real Data Available
- 2504 raw records → 1694 unique by full_name
- Real: names, descriptions, URLs, stars, forks, language, topics, license
- Real: 2406 security_issues (critical:1229, high:1707, medium:1585)
- Real: pattern names from security_issues (XSS, Injection, etc.)
- Intelligence files: quality_patterns, trending_analysis, vulnerability_research

## Fix Strategy
1. Add `darkMode: 'class'` to tailwind.config.js
2. Rebuild embedded-data.json with proper deduplication
3. Replace radar chart with real security severity breakdown
4. Show actual repo metadata (clone_url, description, topics, license, forks)
