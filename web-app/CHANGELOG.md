# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-27

### Added

- **Background sync for offline submissions**: When a user submits a scan while offline, the request is queued in localStorage and automatically retried when the browser comes back online. A toast notification confirms successful submission of pending scans.
- **Animated page transitions**: Framer Motion animations (fade + slide) applied to all route transitions for a smoother navigation experience.
- **Sitemap auto-generation**: `sitemap.xml` is now automatically generated via `vite-sitemap` plugin, improving SEO and crawler discovery.
- **Favicon fallback**: SVG favicon with proper fallback handling when browser cannot render SVG favicons.
- **Document lang attribute**: `<html lang="en">` set explicitly for i18n readiness and accessibility.

### Fixed

- **Phase 1 audit fixes**: Resolved accessibility and SEO issues identified in the first phase of the comprehensive audit.
- **Phase 2 audit fixes**: Addressed performance and PWA configuration issues from the second audit phase.
- **Phase 3 audit fixes**: Fixed remaining code quality and consistency issues identified in the third audit phase.
- **Phase 4 audit fixes**: Completed all outstanding accessibility, SEO, and configuration items from the final audit phase.