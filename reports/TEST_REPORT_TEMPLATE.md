# Test & Quality Report

**Generated:** YYYY-MM-DD HH:MM:SS
**Environment:** Node vXX.XX.X · macOS / Linux · Asia/Tokyo

---

## Executive Summary

| Suite | Status | Details |
|---|---|---|
| **Static Verification (`npm run check`)** | PASSED / FAILED | Typecheck, 51 unit tests, data validator |
| **Link & Asset Crawler (`npm run check:links`)** | PASSED / FAILED | Internal links, hash anchors, images, scripts |
| **Interactive Element Checker (`npm run check:buttons`)** | PASSED / FAILED | Names, visibility, hit-tests, actionability across 3 viewports |
| **End-to-End & A11y Suite (`npm run test:e2e`)** | PASSED / FAILED | Smoke console check, WCAG 2.1 AA a11y, critical user journeys |
| **Performance & Payloads (`npm run test:perf`)** | PASSED / FAILED | Asset payload budgets, DOM nodes, load timing |

---

## Detailed Results

### 1. Static Checks
- TypeScript: `tsc --noEmit`
- Unit Tests: `node --import tsx --test tests/*.test.ts`
- Data Validation: `scripts/validate-data.ts`

### 2. Link & Anchor Crawler
- Pages crawled:
- Links inspected:
- Missing assets: 0
- Broken anchors: 0

### 3. Interactive Element Matrix
- Viewports tested: 390×844 (Mobile), 768×1024 (Tablet), 1440×900 (Desktop)
- Total elements evaluated:
- Center-point occlusion rate: 0%
- Accessible name coverage: 100%

### 4. End-to-End Journeys & Accessibility
- Uncaught console errors: 0
- WCAG 2.1 Level AA violations: 0
- Key user flows tested:
  - Rail Atlas search & interactive city selection
  - Curated Reviews filter, tags, and local private notes
  - Deterministic Itinerary Planner customization & pricing calculations

### 5. Performance Metrics
- Static bundle size
- Largest media assets
- Load duration
