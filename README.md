# 🛡️ Global Data Security Observatory

> **Compare sovereign data security and privacy frameworks across 197 nations — powered by automated scraping of official statutory and regulatory sources.**

[![Deploy to GitHub Pages](https://github.com/dhruvbaslas/global-data-security-observatory/actions/workflows/deploy.yml/badge.svg)](https://github.com/dhruvbaslas/global-data-security-observatory/actions/workflows/deploy.yml)
[![Live Site](https://img.shields.io/badge/Live%20Website-dhruvbaslas.github.io-00f0ff?style=for-the-badge&logo=google-chrome&logoColor=000)](https://dhruvbaslas.github.io/global-data-security-observatory/)
[![License: Non-Commercial](https://img.shields.io/badge/License-Non--Commercial%20(No%20Sale)-blueviolet?style=for-the-badge)](LICENSE)
[![CodeQL Security](https://img.shields.io/badge/Security-CodeQL%20Passed-2ea44f?style=for-the-badge&logo=github)](https://github.com/dhruvbaslas/global-data-security-observatory/security/code-scanning)

---

### 🌐 Live Production Website

👉 **[https://dhruvbaslas.github.io/global-data-security-observatory/](https://dhruvbaslas.github.io/global-data-security-observatory/)**

Experience the live interactive observatory across all devices — desktop, tablet, and mobile browsers.

---

## 🌍 Overview

The **Global Data Security Observatory** is a high-performance web platform and automated intelligence pipeline that scrapes, analyzes, and evaluates national data security frameworks, statutory regulations, and privacy enforcement practices across the globe.

### Key Capabilities

- **All 197 Sovereign Nations**: Comprehensive index covering UN member states and sovereign jurisdictions.
- **Type-Ahead Combobox Filtering**: Search across nation names, ISO codes, and legal archetypes with instant query highlighting.
- **Deep Head-to-Head Comparison**: 
  - Dynamic **Dual-Radar Visualizer** showing polygon overlays across 5 critical parameters.
  - **Cross-Border Transfer Adequacy Matrix** (GDPR Art. 45 adequacy status & Standard Contractual Clauses).
  - **1-Click Perspective Swap** to invert sovereign comparison sides.
  - **Adaptive Viewports**: Comprehensive side-by-side table on desktop/tablet; dedicated per-parameter battle cards on mobile.
- **Social Story & Post Sharing**:
  - Direct sharing to **Twitter / X**, **Instagram Stories**, **Facebook**, and **WhatsApp**.
  - One-click high-resolution **Canvas Image Export (`.png`)** pre-formatted with comparison scores, radar graphics, and deep links.
- **Best of the Best Intelligence**:
  - Podium showcasing **#1 Champions** and **#2 Runner-Ups** overall and across individual security dimensions.
- **Dynamic Policy Sandbox**: Client-side form to test, simulate, and analyze prospective national data frameworks against existing regimes.
- **Privacy-First Architecture**: Viewport-centered modals, zero trackers, zero ad cookies, isolated sandbox execution, and strict client-side data isolation.
- **7-Language Localization**: Instant runtime switching between English, French, Spanish, German, Japanese, Chinese, and Hindi.

---

## 📊 Security Parameters Analyzed

| Parameter | Weight | Description |
|-----------|:------:|-------------|
| **Policy Coverage** | 25% | Scope, definitions, data subject rights, and statutory breadth. |
| **Enforcement Strength** | 25% | Regulatory fines (% of global turnover or fixed caps), audit powers, and litigation rigor. |
| **Transparency** | 20% | Public disclosure rules, accessibility of privacy guidelines, and register publication. |
| **Update Frequency** | 15% | Cadence of regulatory amendments, AI/cloud circulars, and framework modernization. |
| **International Alignment** | 15% | Adequacy recognition, APEC CBPR, Convention 108+, and ISO/IEC standard conformity. |

---

## 🏗️ Architecture & Data Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GitHub Actions CI/CD Pipeline                   │
│                                                                        │
│   ┌────────────────────┐    ┌─────────────────────┐    ┌───────────┐   │
│   │ Python 3.12        │───▶│ Sanitization &      │───▶│ Vite /    │   │
│   │ Statutory Scraper  │    │ JSON Normalization  │    │ React SPA │   │
│   └────────────────────┘    └─────────────────────┘    └───────────┘   │
└────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 GitHub Pages Production Edge Deployment                │
│                                                                        │
│    https://dhruvbaslas.github.io/global-data-security-observatory/     │
│    ├── Instant Client-Side Filtering                                   │
│    ├── Pure Vector SVG Radar & Interactive Polygons                    │
│    └── Zero-Tracker Privacy Guarantee                                  │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Scraper Backend (`scraper/`)**: Python-based statutory scraper with multi-pass security sanitizers, rate limiting, and cached fallback persistence.
2. **Analysis Engine (`scraper/analyzer.py` & `frontend/src/utils/analysis.js`)**: Deterministic scoring and comparative algorithms.
3. **Frontend Application (`frontend/`)**: React 19 single-page app bundled with Vite, featuring bespoke SVG charts without third-party tracking or bloated charting libraries.
4. **CI/CD Pipeline (`.github/workflows/deploy.yml`)**: Automated testing, linting, building, and deployment to GitHub Pages on every `main` push and scheduled weekly refreshes.

---

## 📋 Prerequisites

| Component | Minimum Version | Recommended |
|-----------|:---------------:|:-----------:|
| **Python** | 3.10+ | 3.12+ |
| **Node.js** | 20+ | 24 LTS |
| **npm** | 10+ | 10+ |
| **Git** | 2.30+ | Latest |

---

## 🚀 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/dhruvbaslas/global-data-security-observatory.git
cd global-data-security-observatory
```

### 2. Set Up the Python Scraper

```bash
# Install Python dependencies
pip install -r scraper/requirements.txt

# Run the scraper with caching enabled
cd scraper
python -m scraper.main --output ../frontend/public/data/countries.json
cd ..
```

### 3. Launch the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Quality Assurance

### Run Frontend & Scraper Tests

```bash
# Python scraper test suite (pytest)
python -m pytest scraper/tests/ -v

# Frontend test suite (vitest)
cd frontend
npm run test:ci
```

### Multi-Device Responsive Verification

A headless Puppeteer test suite verifies viewport responsiveness and zero layout regressions across 4K TV, 1080p Desktop, iPad/Tablet, and iPhone/Mobile:

```bash
node frontend/verify_multidevice.cjs
```

---

## 🌐 Deployment to GitHub Pages

Deployments are fully automated via GitHub Actions:

1. **Continuous Deployment**: Pushing to `main` executes scraper validation, frontend unit tests, Vite production builds, and pushes directly to GitHub Pages.
2. **Weekly Statutory Refreshes**: A scheduled cron trigger (`0 6 * * 1`) checks official sources every Monday at 06:00 UTC.
3. **Production URL**: 
   **[https://dhruvbaslas.github.io/global-data-security-observatory/](https://dhruvbaslas.github.io/global-data-security-observatory/)**

---

## 📄 License & Terms of Use

This project is licensed under a **Source-Available Non-Commercial License (Attribution-NonCommercial)**:

- ✅ **Re-use Permitted**: You are welcome to view, study, fork, modify, reference, and re-use this software for **personal, educational, academic, non-commercial, and open-source research purposes**.
- ❌ **Commercial Copying & Resale Strictly Prohibited**: You **MAY NOT** copy, package, white-label, sublicense, or sell this software, its source code, or any derivative works for commercial gain, monetary compensation, or as a paid commercial product/service.
- 🏷️ **Attribution Required**: Any permitted non-commercial redistribution must retain the original copyright notice and a link back to this repository.

See the complete terms in the [LICENSE](LICENSE) file.

---

## 👤 Author

**Dhruv Baslas**
- GitHub: [@dhruvbaslas](https://github.com/dhruvbaslas)
- Repository: [global-data-security-observatory](https://github.com/dhruvbaslas/global-data-security-observatory)

---

## ⚠️ Legal Disclaimer

The data and policy evaluations presented in this observatory are compiled for **educational, academic, and informational purposes only** and do not constitute formal legal counsel. For authoritative statutory interpretations, consult official governmental gazettes and accredited legal counsel.
