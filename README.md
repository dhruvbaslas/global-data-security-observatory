# 🛡️ Global Data Security Observatory

> Compare data security policies across nations — powered by real-time scraping of official government sources.

[![Deploy to GitHub Pages](https://github.com/<YOUR_USERNAME>/Demo/actions/workflows/deploy.yml/badge.svg)](https://github.com/<YOUR_USERNAME>/Demo/actions/workflows/deploy.yml)

---

## 🌍 Overview

The **Global Data Security Observatory** is a single-page web application that scrapes, analyzes, and compares data security policies from official government websites across multiple countries. It provides:

- **Global 197 Sovereign Nations** — Complete database of all UN-recognized countries and sovereign territories
- **Instant Type-to-Search Comboboxes** — Fast interactive search & fuzzy filtering across all 197 nations and regulatory archetypes
- **Country Overview** — Filterable cards with search, jump-to-nation select, and archetype filters
- **Side-by-Side Comparison** — Head-to-head parameter breakdown, dual radar spider visualizer, and **Cross-Border Transfer Adequacy Matrix** (GDPR Art. 45 & Standard Contractual Clauses)
- **Interactive Country Swap** — 1-click swap button to invert Comparison perspectives
- **Social Media Story Sharing & Graphic Export** — Generate and share high-res 1200×630 cards formatted for Twitter/X, Instagram Stories, Facebook, and WhatsApp, plus instant `.png` canvas graphic download
- **Best of Best Analysis** — Podium showcasing **#1 Champions** and **#2 Runner-Ups** overall and across every security dimension
- **Dynamic Expansion** — Add new nations or regional frameworks on-the-fly with client-side sandbox validation
- **Regulatory Archetype Classification** — Grouping nations into EU Omnibus GDPR, US Sectoral, Data Localization, or Modern Hybrid frameworks
- **72-Hour Breach Mandate Flags** — Instant indicators for mandatory data breach notification requirements
- **Privacy-First Architecture** — Zero analytics, no cookies, isolated client sandbox, guaranteed viewport-centered modals
- **7-Language Localization** — Lightweight, accurate dictionary engine for English, French, Spanish, German, Japanese, Chinese, and Hindi

### Security Parameters Analyzed

| Parameter | Weight | Description |
|-----------|--------|-------------|
| **Policy Coverage** | 25% | Breadth and comprehensiveness of data protection laws |
| **Enforcement Strength** | 25% | Regulatory fines, audits, and statutory enforcement rigor |
| **Transparency** | 20% | Clarity, public disclosure, and accessibility of guidelines |
| **Update Frequency** | 15% | Cadence of regulatory updates, circulars, and modernization |
| **International Alignment** | 15% | Cross-border adequacy, APEC CBPR, Convention 108+, ISO conformity |


---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Actions CI/CD                  │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────┐  │
│  │ Python       │──▶│ Generate     │──▶│ Build &    │  │
│  │ Scraper      │   │ JSON Data    │   │ Deploy     │  │
│  └──────────────┘   └──────────────┘   └────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   GitHub Pages (Static)                  │
│  ┌──────────────┐   ┌──────────────┐                    │
│  │ React SPA    │◀──│ countries    │                    │
│  │ (Vite)       │   │ .json        │                    │
│  └──────────────┘   └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

- **Backend**: Python scraper with caching, sanitization, and policy analysis
- **Frontend**: React 19 + Vite SPA with pure SVG charts (no heavy chart libraries)
- **Data Flow**: Scraper runs in CI → generates static JSON → frontend reads at runtime

---

## 📋 Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Python** | 3.10+ | Scraper backend |
| **Node.js** | 20+ | Frontend build |
| **npm** | 10+ | Package management |
| **Git** | 2.30+ | Version control |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/<YOUR_USERNAME>/Demo.git
cd Demo

# Install all dependencies (Python + Node.js)
pip install -r scraper/requirements.txt
cd frontend && npm install && cd ..
```

### 2. Run the Scraper (Generate Data)

```bash
# Run scraper with caching (recommended for development)
cd scraper
python -m scraper.main --output ../frontend/public/data/countries.json

# Or run without cache (fresh scrape)
python -m scraper.main --output ../frontend/public/data/countries.json --no-cache

# Scrape a single country
python -m scraper.main --country US --output ../frontend/public/data/countries.json
```

> **Note**: If scraping fails (network issues, blocked requests), the scraper automatically falls back to comprehensive curated data.

### 3. Start the Development Server

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production

```bash
cd frontend
npm run build
npm run preview  # Preview the production build locally
```

---

## 🧪 Testing

### Run All Tests

```bash
# From the project root:

# Python scraper tests
cd scraper
python -m pytest tests/ -v

# Frontend tests
cd ../frontend
npm test

# Or run frontend tests with coverage
npm run test:ci
```

### Test Coverage

| Area | Tests | Coverage |
|------|-------|----------|
| Scraper Logic | `test_scraper.py` | HTTP mocking, caching, fallback data |
| Sanitization | `test_sanitizer.py` | XSS prevention, URL validation, input cleaning |
| Policy Analysis | `test_analyzer.py` | Scoring, ranking, comparison |
| React Components | `*.test.jsx` | Rendering, interaction, accessibility |
| Analysis Utils | `analysis.test.js` | Score calculation, ranking, labels |

### What's Tested

- ✅ Country filter works correctly
- ✅ Comparison feature selects and compares two countries
- ✅ Dynamic country addition validates and saves data
- ✅ Best of Best analysis ranks countries correctly
- ✅ XSS/injection prevention in all user inputs
- ✅ Fallback data loads when scraping fails
- ✅ Cache hit/miss behavior
- ✅ Responsive rendering

---

## 🌐 Deployment (GitHub Pages)

### Automatic Deployment

1. Push your code to the `main` branch on GitHub
2. Go to **Settings → Pages** in your GitHub repository
3. Under **Source**, select **GitHub Actions**
4. The workflow at `.github/workflows/deploy.yml` will automatically:
   - Run the Python scraper to generate fresh data
   - Run all tests (scraper + frontend)
   - Build the React app for production
   - Deploy to GitHub Pages

### Manual Deployment Trigger

1. Go to **Actions** tab in your GitHub repository
2. Select **"Deploy to GitHub Pages"** workflow
3. Click **"Run workflow"** → **"Run workflow"** button

### Scheduled Data Refresh

The workflow runs automatically every **Monday at 06:00 UTC** to refresh scraped data from government websites.

### Configuration

Before deploying, update these values:

1. In `frontend/vite.config.js`: The `base` path is automatically set to `/Demo/` when `GITHUB_PAGES=true`
2. If your repo name differs from `Demo`, update the base path accordingly

---

## 📁 Project Structure

```
Demo/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── scraper/                    # Python backend
│   ├── __init__.py
│   ├── main.py                 # Entry point & CLI
│   ├── config.py               # Country URLs & settings
│   ├── scraper.py              # Core scraping logic
│   ├── sanitizer.py            # Security sanitization
│   ├── analyzer.py             # Policy scoring engine
│   ├── cache.py                # Response caching
│   ├── requirements.txt        # Python dependencies
│   └── tests/                  # Pytest test suite
│       ├── test_scraper.py
│       ├── test_sanitizer.py
│       └── test_analyzer.py
├── frontend/                   # React SPA
│   ├── package.json
│   ├── vite.config.js
│   ├── vitest.config.js
│   ├── index.html
│   ├── public/
│   │   └── data/
│   │       └── countries.json  # Generated data
│   └── src/
│       ├── main.jsx
│       ├── App.jsx             # Main application
│       ├── App.css             # Global styles
│       ├── components/         # React components
│       │   ├── Header.jsx
│       │   ├── CountryFilter.jsx
│       │   ├── CountryCard.jsx
│       │   ├── ComparisonView.jsx
│       │   ├── AddCountry.jsx
│       │   ├── BestOfBest.jsx
│       │   └── ParameterRadar.jsx
│       ├── hooks/
│       │   └── useCountryData.js
│       ├── utils/
│       │   ├── sanitize.js
│       │   └── analysis.js
│       └── __tests__/          # Vitest test suite
│           ├── setup.js
│           ├── App.test.jsx
│           ├── CountryFilter.test.jsx
│           ├── ComparisonView.test.jsx
│           ├── AddCountry.test.jsx
│           ├── BestOfBest.test.jsx
│           └── analysis.test.js
├── package.json                # Root orchestration
└── README.md                   # This file
```

---

## 🔒 Security Considerations

- **Input Sanitization**: All user inputs are sanitized on both Python and JavaScript sides
- **XSS Prevention**: HTML entities escaped, dangerous tags stripped, CSP headers configured
- **URL Validation**: Only `http://` and `https://` schemes accepted
- **No Sensitive Data**: No API keys, tokens, or credentials stored in the codebase
- **Rate Limiting**: Scraper includes 2-second delays between requests to be polite
- **Cache Isolation**: Cached data is stored locally and never served to other users

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-country`
3. Make your changes and add tests
4. Run the full test suite: `npm run test:scraper && npm run test:frontend`
5. Commit and push: `git push origin feature/new-country`
6. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## ⚠️ Disclaimer

This site provides **informational summaries only** and is **not legal advice**. Data security policies are complex and subject to change. Always consult official government sources and qualified legal professionals for authoritative guidance.

