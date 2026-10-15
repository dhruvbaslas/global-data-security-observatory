"""
Global Data Security Observatory - Configuration
=================================================
Central configuration for the scraper, defining country data sources,
security assessment parameters, caching, and rate limiting.

All URLs point to REAL government data protection authority websites.
"""

import os
from typing import Dict, Any

# ---------------------------------------------------------------------------
# Project paths
# ---------------------------------------------------------------------------

# Root directory of the scraper package
SCRAPER_DIR: str = os.path.dirname(os.path.abspath(__file__))

# Cache directory for storing scraped data between runs
CACHE_DIR: str = os.path.join(SCRAPER_DIR, "cache")

# Default output path – the React frontend reads this JSON file
OUTPUT_PATH: str = os.path.join(
    os.path.dirname(SCRAPER_DIR), "frontend", "public", "data", "countries.json"
)

# Cache time-to-live: 24 hours (in seconds)
CACHE_TTL: int = 24 * 60 * 60  # 86 400 seconds

# ---------------------------------------------------------------------------
# HTTP / Rate-Limiting
# ---------------------------------------------------------------------------

# Polite User-Agent identifying our research scraper
USER_AGENT: str = (
    "GlobalDataSecurityObservatory/1.0 "
    "(+https://github.com/global-data-security-observatory; research project)"
)

# Minimum seconds between consecutive HTTP requests (polite crawling)
RATE_LIMIT_SECONDS: float = 2.0

# Request timeout in seconds
REQUEST_TIMEOUT: int = 15

# Maximum number of retries for a failed request
MAX_RETRIES: int = 2

# ---------------------------------------------------------------------------
# Security assessment parameters
# ---------------------------------------------------------------------------
# Each parameter is scored 1-10 for every country.

SECURITY_PARAMETERS: list[str] = [
    "policy_coverage",           # Breadth & depth of data-protection laws
    "enforcement_strength",      # Track record of fines, orders, and litigation
    "transparency",              # Public reporting, open consultations, FOIA
    "update_frequency",          # How actively the legal framework evolves
    "international_alignment",   # Compatibility with global standards (e.g. GDPR adequacy)
]

# Human-readable descriptions shown in the frontend
PARAMETER_DESCRIPTIONS: Dict[str, str] = {
    "policy_coverage": (
        "Breadth and depth of data protection laws and regulations, including "
        "whether an omnibus federal/national law exists and how many sectors "
        "are covered."
    ),
    "enforcement_strength": (
        "Track record and capability of enforcement bodies – fines issued, "
        "investigations conducted, orders enforced, and litigation success."
    ),
    "transparency": (
        "Openness of the regulatory process: public consultations, published "
        "guidance, annual reports, breach-notification registers, and freedom-"
        "of-information access."
    ),
    "update_frequency": (
        "How actively the legal framework is updated to address emerging "
        "technologies, new threat vectors, and evolving best practices."
    ),
    "international_alignment": (
        "Degree of compatibility with major international data-protection "
        "standards such as the EU GDPR, APEC CBPR, and Council of Europe "
        "Convention 108+."
    ),
}

# ---------------------------------------------------------------------------
# Country data sources
# ---------------------------------------------------------------------------
# Maps ISO 3166-1 alpha-2 codes to metadata about each country's primary
# data-protection authority and legal framework.

COUNTRY_SOURCES: Dict[str, Dict[str, Any]] = {
    "US": {
        "name": "United States",
        "flag": "🇺🇸",
        "authority": "FTC / State Attorneys General",
        "authority_url": "https://www.ftc.gov/legal-library/browse/rules/federal-trade-commission-act",
        "urls": [
            "https://www.ftc.gov/legal-library/browse/rules/federal-trade-commission-act",
        ],
        "description": (
            "The United States takes a sectoral approach to data protection "
            "with no single federal omnibus privacy law. Key statutes include "
            "the California Consumer Privacy Act (CCPA/CPRA), the Health "
            "Insurance Portability and Accountability Act (HIPAA), the "
            "Gramm-Leach-Bliley Act (GLBA), the Children's Online Privacy "
            "Protection Act (COPPA), and the Federal Trade Commission Act "
            "(Section 5 – unfair or deceptive practices). The FTC serves as "
            "the primary federal enforcer, while state attorneys general "
            "enforce state-level statutes."
        ),
    },
    "IN": {
        "name": "India",
        "flag": "🇮🇳",
        "authority": "Ministry of Electronics & IT (MeitY)",
        "authority_url": "https://www.meity.gov.in/",
        "urls": [
            "https://www.meity.gov.in/",
        ],
        "description": (
            "India enacted the Digital Personal Data Protection Act (DPDPA) in "
            "August 2023, establishing a comprehensive framework for personal "
            "data processing. The DPDPA introduces consent-based processing, "
            "data principal rights, obligations on data fiduciaries, and a new "
            "Data Protection Board of India for enforcement. It replaces the "
            "earlier Information Technology Act, 2000 (Section 43A) and its "
            "SPDI Rules. The implementing rules are still being drafted."
        ),
    },
    "FR": {
        "name": "France",
        "flag": "🇫🇷",
        "authority": "CNIL (Commission Nationale de l'Informatique et des Libertés)",
        "authority_url": "https://www.cnil.fr/en",
        "urls": [
            "https://www.cnil.fr/en",
        ],
        "description": (
            "France enforces the EU General Data Protection Regulation (GDPR) "
            "through its national data protection authority, the CNIL. France "
            "was a pioneer in data protection law, having adopted the 'Loi "
            "Informatique et Libertés' in 1978. The CNIL is one of the most "
            "active EU regulators, issuing landmark fines against major tech "
            "companies. France also participates in the European Data "
            "Protection Board (EDPB) for cross-border enforcement."
        ),
    },
    "GB": {
        "name": "United Kingdom",
        "flag": "🇬🇧",
        "authority": "ICO (Information Commissioner's Office)",
        "authority_url": "https://ico.org.uk/",
        "urls": [
            "https://ico.org.uk/",
        ],
        "description": (
            "The United Kingdom operates under the UK General Data Protection "
            "Regulation (UK GDPR) and the Data Protection Act 2018, post-Brexit "
            "adaptations of the EU GDPR. The Information Commissioner's Office "
            "(ICO) is the independent supervisory authority responsible for "
            "upholding information rights. The UK maintains an EU adequacy "
            "decision, facilitating cross-border data flows. The government has "
            "proposed the Data Protection and Digital Information Bill to "
            "reform and simplify the framework."
        ),
    },
    "JP": {
        "name": "Japan",
        "flag": "🇯🇵",
        "authority": "PPC (Personal Information Protection Commission)",
        "authority_url": "https://www.ppc.go.jp/en/",
        "urls": [
            "https://www.ppc.go.jp/en/",
        ],
        "description": (
            "Japan's Act on the Protection of Personal Information (APPI), "
            "originally enacted in 2003 and substantially amended in 2020 "
            "(effective April 2022), provides comprehensive data protection. "
            "The Personal Information Protection Commission (PPC) serves as "
            "the independent supervisory authority. Japan holds a mutual "
            "adequacy finding with the EU, enabling free data flows between "
            "Japan and EEA countries under the GDPR framework."
        ),
    },
    "CN": {
        "name": "China",
        "flag": "🇨🇳",
        "authority": "CAC (Cyberspace Administration of China)",
        "authority_url": "http://www.cac.gov.cn/",
        "urls": [
            "http://www.cac.gov.cn/",
        ],
        "description": (
            "China has built one of the world's most comprehensive data "
            "governance frameworks through three landmark laws: the Personal "
            "Information Protection Law (PIPL, effective November 2021), the "
            "Data Security Law (DSL, effective September 2021), and the "
            "Cybersecurity Law (CSL, effective June 2017). The Cyberspace "
            "Administration of China (CAC) is the primary regulator. The PIPL "
            "shares structural similarities with the GDPR but includes "
            "provisions for state access to data and strict data-localisation "
            "requirements for critical information infrastructure operators."
        ),
    },
}

