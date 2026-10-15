# 🛡️ Global Data Security Observatory

> Compare data security policies across nations — powered by real-time scraping of official government sources.

[![Deploy to GitHub Pages](https://github.com/<YOUR_USERNAME>/Demo/actions/workflows/deploy.yml/badge.svg)](https://github.com/<YOUR_USERNAME>/Demo/actions/workflows/deploy.yml)

---

## 🌍 Overview

The **Global Data Security Observatory** is a single-page web application that scrapes, analyzes, and compares data security policies from official government websites across multiple countries. It provides:

- **Country Overview** — Filterable cards showing each country's data protection framework
- **Side-by-Side Comparison** — Select any two countries and compare their policies parameter-by-parameter
- **Best of Best Analysis** — AI-scored ranking identifying the strongest data security policies globally
- **Dynamic Expansion** — Add new countries on-the-fly with their official website links

### Countries Covered (Default)

| Country | Authority | Key Legislation |
|---------|-----------|-----------------|
| 🇺🇸 United States | FTC / State AGs | CCPA, HIPAA, GLBA, FERPA, FTC Act |
| 🇮🇳 India | MeitY | Digital Personal Data Protection Act 2023 |
| 🇫🇷 France | CNIL | GDPR (EU), Loi Informatique et Libertés |
| 🇬🇧 United Kingdom | ICO | UK GDPR, Data Protection Act 2018 |
| 🇯🇵 Japan | PPC | Act on Protection of Personal Information (APPI) |
| 🇨🇳 China | CAC | PIPL, Data Security Law, Cybersecurity Law |

### Security Parameters Analyzed

| Parameter | Description |
|-----------|-------------|
| **Policy Coverage** | Breadth and comprehensiveness of data protection laws |
| **Enforcement Strength** | How strictly rules are applied and penalties enforced |
| **Transparency** | Clarity and public accessibility of regulations |
| **Update Frequency** | How often policies are revised and modernized |
| **International Alignment** | Compliance with global standards (GDPR, ISO 27001, etc.) |

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

