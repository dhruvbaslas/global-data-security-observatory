"""
Global Data Security Observatory - Web Scraper
===============================================
Fetches data-protection information from official government websites,
with comprehensive fallback data for offline / demo operation.

The fallback data is the PRIMARY data source for reliable demos – it
contains carefully researched, accurate information about each country's
data-protection framework.
"""

import logging
import time
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import requests
from bs4 import BeautifulSoup

from scraper.cache import FileCache
from scraper.config import (
    COUNTRY_SOURCES,
    MAX_RETRIES,
    RATE_LIMIT_SECONDS,
    REQUEST_TIMEOUT,
    USER_AGENT,
)
from scraper.sanitizer import sanitize_html, sanitize_text

logger = logging.getLogger(__name__)


# ===================================================================
# Comprehensive fallback data
# ===================================================================
# This is intentionally detailed and accurate – it serves as the
# primary data source when live scraping is unavailable (demo mode,
# CI/CD, rate-limited, or site-down scenarios).

FALLBACK_DATA: Dict[str, Dict[str, Any]] = {
    "US": {
        "code": "US",
        "name": "United States",
        "flag": "🇺🇸",
        "authority": "FTC / State Attorneys General",
        "authority_url": "https://www.ftc.gov/legal-library/browse/rules/federal-trade-commission-act",
        "summary": (
            "The United States relies on a patchwork of sector-specific federal "
            "laws and an expanding set of state-level comprehensive privacy "
            "statutes. There is no single federal omnibus data-protection law. "
            "The Federal Trade Commission (FTC) enforces data-protection "
            "obligations primarily under Section 5 of the FTC Act (unfair or "
            "deceptive practices). Major federal statutes include HIPAA "
            "(healthcare), GLBA (financial services), COPPA (children's data), "
            "FERPA (education), and the Fair Credit Reporting Act (FCRA). At "
            "the state level, the California Consumer Privacy Act / California "
            "Privacy Rights Act (CCPA/CPRA) is the most prominent, granting "
            "consumers rights to know, delete, and opt out of the sale of "
            "personal information. Virginia (VCDPA), Colorado (CPA), "
            "Connecticut (CTDPA), Utah (UCPA), Texas (TDPSA), Oregon, Montana, "
            "and several other states have enacted comprehensive privacy laws. "
            "The American Data Privacy and Protection Act (ADPPA) has been "
            "proposed at the federal level but has not been enacted."
        ),
        "key_laws": [
            "FTC Act (Section 5)",
            "CCPA / CPRA (California)",
            "HIPAA",
            "GLBA",
            "COPPA",
            "FERPA",
            "FCRA",
            "VCDPA (Virginia)",
            "CPA (Colorado)",
            "CTDPA (Connecticut)",
        ],
        "scores": {
            "policy_coverage": 7,
            "enforcement_strength": 7,
            "transparency": 8,
            "update_frequency": 7,
            "international_alignment": 5,
        },
        "details": {
            "policy_coverage": (
                "Extensive sectoral coverage at both federal and state levels, "
                "but the absence of a single federal omnibus privacy law creates "
                "gaps and inconsistencies. Over a dozen states now have "
                "comprehensive privacy statutes."
            ),
            "enforcement_strength": (
                "The FTC has become increasingly aggressive, pursuing major "
                "enforcement actions with consent orders and significant fines "
                "(e.g., Facebook $5 billion, Epic Games $520 million). State AGs "
                "have also imposed record penalties. However, the FTC lacks "
                "dedicated data-protection rule-making authority."
            ),
            "transparency": (
                "High transparency overall: federal rulemaking processes are "
                "public (Federal Register, FOIA), the FTC publishes detailed "
                "case decisions and guidance, and most state AG offices publish "
                "enforcement reports. However, fragmentation makes it harder "
                "for businesses to navigate."
            ),
            "update_frequency": (
                "Active legislative environment: new state privacy laws pass "
                "every year, and the FTC continually updates guidance and "
                "pursues novel theories. Federal omnibus legislation remains "
                "stalled but sector-specific updates continue."
            ),
            "international_alignment": (
                "No EU adequacy decision. The EU-US Data Privacy Framework "
                "(DPF) provides a mechanism for certified companies, but it "
                "is narrower than an adequacy finding. The sectoral approach "
                "diverges significantly from the GDPR model adopted by most "
                "trading partners."
            ),
        },
    },
    "IN": {
        "code": "IN",
        "name": "India",
        "flag": "🇮🇳",
        "authority": "Data Protection Board of India (under MeitY)",
        "authority_url": "https://www.meity.gov.in/",
        "summary": (
            "India enacted the Digital Personal Data Protection Act (DPDPA) in "
            "August 2023, its first comprehensive data-protection statute. The "
            "law establishes consent-based processing, data-principal rights "
            "(access, correction, erasure, grievance redressal), obligations on "
            "data fiduciaries (including Significant Data Fiduciaries with "
            "enhanced duties), and a new Data Protection Board of India (DPBI) "
            "as the adjudicatory body. Penalties can reach ₹250 crore (~$30M) "
            "per violation. The government may notify certain countries to "
            "which cross-border transfers are restricted. Prior to the DPDPA, "
            "data protection was governed by Section 43A of the Information "
            "Technology Act, 2000 and the Sensitive Personal Data or "
            "Information (SPDI) Rules, 2011. Implementing rules for the DPDPA "
            "are expected to be finalised soon."
        ),
        "key_laws": [
            "Digital Personal Data Protection Act, 2023 (DPDPA)",
            "Information Technology Act, 2000 (Section 43A)",
            "SPDI Rules, 2011",
            "Aadhaar Act, 2016",
        ],
        "scores": {
            "policy_coverage": 6,
            "enforcement_strength": 5,
            "transparency": 6,
            "update_frequency": 8,
            "international_alignment": 6,
        },
        "details": {
            "policy_coverage": (
                "The DPDPA provides a solid baseline but is narrower than the "
                "GDPR – it covers only digital personal data and exempts "
                "non-automated processing. Sector-specific regulations "
                "(RBI data localisation, SEBI, IRDAI) add additional layers. "
                "Implementing rules are still pending."
            ),
            "enforcement_strength": (
                "The Data Protection Board of India has been constituted but is "
                "yet to build a significant enforcement track record. Maximum "
                "penalties are meaningful (₹250 crore) but real-world "
                "enforcement remains to be demonstrated."
            ),
            "transparency": (
                "The DPDPA mandates breach notification and consent management, "
                "improving transparency. However, the government retains broad "
                "exemption powers (Section 17), and the DPBI proceedings may "
                "not always be public. The legislative drafting process involved "
                "public consultation."
            ),
            "update_frequency": (
                "Very active: India moved from the 2019 Personal Data Protection "
                "Bill to the 2022 Digital Personal Data Protection Bill and "
                "finally enacted the DPDPA 2023. The implementing rules and "
                "additional sectoral guidelines are expected soon, indicating "
                "a rapidly evolving framework."
            ),
            "international_alignment": (
                "The DPDPA borrows concepts from the GDPR (consent, rights, DPO "
                "requirement) but diverges in several areas: no right to data "
                "portability, government exemptions, and a blacklist (rather "
                "than whitelist) model for cross-border transfers. No EU "
                "adequacy decision."
            ),
        },
    },
    "FR": {
        "code": "FR",
        "name": "France",
        "flag": "🇫🇷",
        "authority": "CNIL (Commission Nationale de l'Informatique et des Libertés)",
        "authority_url": "https://www.cnil.fr/en",
        "summary": (
            "France is one of the world's leading data-protection jurisdictions. "
            "The CNIL (Commission Nationale de l'Informatique et des Libertés) "
            "was established in 1978 under the 'Loi Informatique et Libertés', "
            "making France a pioneer in data protection. Today, France enforces "
            "the EU General Data Protection Regulation (GDPR), which directly "
            "applies across all EU member states. The CNIL is one of the most "
            "active GDPR enforcement authorities, having imposed record fines "
            "including €150 million on Google (2022), €60 million on Facebook "
            "(2022), and €40 million on Criteo (2023). France also participates "
            "in the European Data Protection Board (EDPB) and has been at the "
            "forefront of regulating AI, cookies, and cross-border data "
            "transfers through the GDPR framework."
        ),
        "key_laws": [
            "EU General Data Protection Regulation (GDPR)",
            "Loi Informatique et Libertés (1978, amended)",
            "ePrivacy Directive (implemented nationally)",
            "EU Data Governance Act",
            "EU AI Act",
        ],
        "scores": {
            "policy_coverage": 9,
            "enforcement_strength": 9,
            "transparency": 8,
            "update_frequency": 8,
            "international_alignment": 10,
        },
        "details": {
            "policy_coverage": (
                "Comprehensive coverage through the GDPR, which applies to all "
                "sectors and all personal data processing. Supplemented by the "
                "national Loi Informatique et Libertés, sector-specific guidance, "
                "and emerging EU regulations (AI Act, Data Governance Act, Data "
                "Act). Covers both automated and manual processing."
            ),
            "enforcement_strength": (
                "The CNIL is among the most assertive data-protection authorities "
                "in the world. It conducts hundreds of investigations annually, "
                "issues formal notices, and levies substantial fines (up to 4% of "
                "global annual turnover under the GDPR). Landmark cases against "
                "Google, Meta, Amazon, and Criteo demonstrate willingness to "
                "target major global platforms."
            ),
            "transparency": (
                "High transparency: the CNIL publishes annual activity reports, "
                "detailed guidance documents, public deliberations, and maintains "
                "an open complaints process. GDPR requirements for Data "
                "Protection Impact Assessments (DPIAs) and Data Protection "
                "Officers (DPOs) further enhance organisational transparency."
            ),
            "update_frequency": (
                "The EU regulatory framework is continuously evolving: the GDPR "
                "itself is supplemented by new regulations (AI Act, Data "
                "Governance Act, Digital Services Act, Digital Markets Act), and "
                "the CNIL regularly updates its guidance on cookies, AI, "
                "biometrics, and international transfers."
            ),
            "international_alignment": (
                "As an EU member state, France benefits from the GDPR's global "
                "influence – the 'Brussels Effect'. The GDPR sets the de facto "
                "international standard, and France actively participates in the "
                "EDPB, Council of Europe Convention 108+, and OECD privacy "
                "guidelines. EU adequacy decisions facilitate data flows to "
                "approved third countries."
            ),
        },
    },
    "GB": {
        "code": "GB",
        "name": "United Kingdom",
        "flag": "🇬🇧",
        "authority": "ICO (Information Commissioner's Office)",
        "authority_url": "https://ico.org.uk/",
        "summary": (
            "The United Kingdom operates one of the most mature data-protection "
            "regimes globally. Post-Brexit, the UK adopted the UK General Data "
            "Protection Regulation (UK GDPR) – a domestic version of the EU "
            "GDPR – alongside the Data Protection Act 2018. The Information "
            "Commissioner's Office (ICO) is the independent supervisory "
            "authority with powers to investigate, issue enforcement notices, "
            "and fine up to £17.5 million or 4% of global turnover. The UK "
            "has secured an EU adequacy decision (June 2021, renewed/extended "
            "through a bridging mechanism), enabling continued data flows with "
            "the EEA. The government has proposed the Data Protection and "
            "Digital Information Bill (DPDI) to reform the framework, "
            "potentially diverging from the GDPR in areas like automated "
            "decision-making and data protection officers."
        ),
        "key_laws": [
            "UK GDPR",
            "Data Protection Act 2018",
            "Privacy and Electronic Communications Regulations (PECR)",
            "Data Protection and Digital Information Bill (proposed)",
            "Network and Information Systems Regulations 2018",
        ],
        "scores": {
            "policy_coverage": 8,
            "enforcement_strength": 8,
            "transparency": 9,
            "update_frequency": 7,
            "international_alignment": 8,
        },
        "details": {
            "policy_coverage": (
                "Comprehensive coverage through the UK GDPR and DPA 2018, "
                "applying to all sectors and all personal data. The PECR adds "
                "specific rules for electronic communications. Coverage is "
                "broadly equivalent to the EU GDPR, with some UK-specific "
                "derogations (e.g., immigration exemption, national security)."
            ),
            "enforcement_strength": (
                "The ICO has issued significant fines (e.g., British Airways "
                "£20M, Marriott £18.4M, Clearview AI £7.5M) and conducts "
                "regular audits and investigations. It has published a "
                "Regulatory Action Policy and is increasingly focused on "
                "adtech, AI, and children's privacy (Age Appropriate Design "
                "Code)."
            ),
            "transparency": (
                "The ICO is widely regarded as one of the most transparent "
                "regulators: it publishes detailed enforcement notices, annual "
                "reports, statutory guidance, consultation responses, and a "
                "comprehensive public-facing website with toolkits for SMEs and "
                "individuals. The data-protection fee register is public."
            ),
            "update_frequency": (
                "The UK actively updates its framework – the DPDI Bill proposes "
                "significant reforms, the ICO regularly issues new codes of "
                "practice (e.g., Children's Code, AI guidance), and the "
                "government is exploring new approaches to international "
                "data transfers post-Brexit."
            ),
            "international_alignment": (
                "Strong alignment: the UK GDPR is substantially based on the EU "
                "GDPR, and the UK holds an EU adequacy decision. The UK has also "
                "established its own adequacy framework and data-bridge "
                "agreements. However, proposed DPDI reforms could risk the EU "
                "adequacy status if divergence becomes significant."
            ),
        },
    },
    "JP": {
        "code": "JP",
        "name": "Japan",
        "flag": "🇯🇵",
        "authority": "PPC (Personal Information Protection Commission)",
        "authority_url": "https://www.ppc.go.jp/en/",
        "summary": (
            "Japan's Act on the Protection of Personal Information (APPI) is "
            "one of Asia's most established data-protection frameworks. "
            "Originally enacted in 2003, the APPI was substantially amended "
            "in 2020 (effective April 2022) to strengthen individual rights, "
            "tighten cross-border transfer rules, introduce mandatory breach "
            "notification, and increase penalties. The Personal Information "
            "Protection Commission (PPC) is the independent supervisory "
            "authority. Japan and the EU have a mutual adequacy arrangement, "
            "creating the 'world's largest area of safe data flows'. Japan is "
            "also a founding member of the APEC Cross-Border Privacy Rules "
            "(CBPR) system and the Global CBPR Forum."
        ),
        "key_laws": [
            "Act on the Protection of Personal Information (APPI)",
            "APPI Amendment 2020 (effective April 2022)",
            "My Number Act",
            "Telecommunications Business Act (privacy provisions)",
            "Act on Prevention of Unauthorized Computer Access",
        ],
        "scores": {
            "policy_coverage": 7,
            "enforcement_strength": 6,
            "transparency": 7,
            "update_frequency": 7,
            "international_alignment": 8,
        },
        "details": {
            "policy_coverage": (
                "The APPI provides comprehensive coverage for personal "
                "information held by both private businesses and (since the "
                "2020 amendment) public sector entities. It covers pseudonymised "
                "and anonymised data, with specific rules for sensitive personal "
                "information. Coverage is broad but enforcement has historically "
                "relied more on administrative guidance than formal sanctions."
            ),
            "enforcement_strength": (
                "The PPC primarily uses administrative guidance, recommendations, "
                "and orders rather than large fines. The 2020 amendment "
                "introduced criminal penalties (up to ¥100 million for "
                "corporations) and the PPC has increased enforcement activity. "
                "However, compared to EU DPAs, the PPC takes a more "
                "consensus-oriented approach."
            ),
            "transparency": (
                "The PPC publishes annual reports, guidance documents, Q&A "
                "resources, and international cooperation summaries. Japan's "
                "regulatory process is generally transparent, though some "
                "industry consultations are less public than EU equivalents."
            ),
            "update_frequency": (
                "The APPI mandates a review every three years. The major 2020 "
                "amendment reflected significant modernisation. The PPC "
                "regularly issues updated guidelines and has conducted public "
                "consultations on AI, cookies, and children's data."
            ),
            "international_alignment": (
                "Strong alignment: Japan holds a mutual adequacy arrangement "
                "with the EU (since 2019), is a founding member of the APEC "
                "CBPR system, and participates in the Global CBPR Forum, the "
                "OECD Privacy Guidelines, and bilateral data-flow agreements. "
                "The 2020 APPI amendments further align Japan with global "
                "standards."
            ),
        },
    },
    "CN": {
        "code": "CN",
        "name": "China",
        "flag": "🇨🇳",
        "authority": "CAC (Cyberspace Administration of China)",
        "authority_url": "http://www.cac.gov.cn/",
        "summary": (
            "China has rapidly built one of the world's most comprehensive "
            "data governance regimes through three landmark laws enacted in "
            "quick succession: the Cybersecurity Law (CSL, effective June 2017), "
            "the Data Security Law (DSL, effective September 2021), and the "
            "Personal Information Protection Law (PIPL, effective November "
            "2021). The PIPL is China's first dedicated personal data-protection "
            "statute and shares structural similarities with the EU GDPR, "
            "including consent requirements, data-subject rights, data "
            "protection impact assessments, and extraterritorial scope. "
            "However, it includes distinctive provisions such as strict data "
            "localisation for critical information infrastructure operators "
            "(CIIOs), mandatory security assessments for cross-border data "
            "transfers, and broad state-access provisions. The Cyberspace "
            "Administration of China (CAC) is the primary regulator, supported "
            "by the Ministry of Public Security and sector-specific authorities."
        ),
        "key_laws": [
            "Personal Information Protection Law (PIPL)",
            "Data Security Law (DSL)",
            "Cybersecurity Law (CSL)",
            "Standard Contract Measures for Cross-Border Transfers",
            "Data Export Security Assessment Measures",
            "Civil Code (privacy provisions, Book IV)",
        ],
        "scores": {
            "policy_coverage": 8,
            "enforcement_strength": 8,
            "transparency": 4,
            "update_frequency": 8,
            "international_alignment": 4,
        },
        "details": {
            "policy_coverage": (
                "Extremely broad coverage across three interlocking statutes "
                "(PIPL, DSL, CSL) that together address personal data, important "
                "data, and cybersecurity. The PIPL covers all personal "
                "information processing within China and has extraterritorial "
                "reach. Sector-specific rules add further layers for finance, "
                "healthcare, and automotive data."
            ),
            "enforcement_strength": (
                "Very strong enforcement: the CAC has ordered app removals "
                "(Didi investigation, 2021), imposed significant fines, "
                "conducted cross-sector compliance campaigns, and exercised "
                "its power to suspend data-export activities. Penalties under "
                "the PIPL can reach ¥50 million or 5% of prior-year revenue. "
                "Enforcement can also involve criminal liability."
            ),
            "transparency": (
                "Regulatory processes are considerably less transparent than in "
                "Western democracies. Public consultations exist but are limited "
                "in scope and duration. Enforcement decisions are often not "
                "published in detail. The legal framework grants broad "
                "government access to data, and national-security exemptions "
                "are opaque."
            ),
            "update_frequency": (
                "Extremely active: China enacted three major laws in four years "
                "(2017-2021) and continuously issues implementing regulations, "
                "standard contracts, security-assessment guidelines, and "
                "sector-specific rules. The regulatory landscape evolves "
                "rapidly."
            ),
            "international_alignment": (
                "The PIPL borrows structural elements from the GDPR but "
                "diverges significantly in practice: strict data localisation, "
                "mandatory security assessments for outbound transfers, "
                "government data-access provisions, and no mutual adequacy "
                "arrangements with the EU or other major jurisdictions. China "
                "does not participate in the APEC CBPR system."
            ),
        },
    },
}


class DataSecurityScraper:
    """Scrape government data-protection authority websites.

    The scraper attempts to fetch live data from official URLs, falling
    back to curated, comprehensive data if the request fails.  Results
    are cached to avoid hammering government servers.

    Parameters
    ----------
    use_cache : bool
        Whether to use the file cache (default ``True``).
    """

    def __init__(self, use_cache: bool = True) -> None:
        self.use_cache = use_cache
        self.cache = FileCache() if use_cache else None
        self._last_request_time: float = 0.0
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": USER_AGENT})

    # ------------------------------------------------------------------
    # Rate limiting
    # ------------------------------------------------------------------

    def _rate_limit(self) -> None:
        """Wait if needed to respect the configured rate limit."""
        elapsed = time.time() - self._last_request_time
        if elapsed < RATE_LIMIT_SECONDS:
            wait = RATE_LIMIT_SECONDS - elapsed
            logger.debug("Rate limiting: sleeping %.2fs", wait)
            time.sleep(wait)
        self._last_request_time = time.time()

    # ------------------------------------------------------------------
    # HTTP fetch
    # ------------------------------------------------------------------

    def _fetch_url(self, url: str) -> Optional[str]:
        """Fetch a URL and return the response text, or ``None`` on failure.

        Retries up to ``MAX_RETRIES`` times.
        """
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                self._rate_limit()
                logger.info("Fetching %s (attempt %d/%d)", url, attempt, MAX_RETRIES)
                response = self.session.get(url, timeout=REQUEST_TIMEOUT)
                response.raise_for_status()
                return response.text
            except requests.RequestException as exc:
                logger.warning(
                    "Request failed for %s (attempt %d/%d): %s",
                    url,
                    attempt,
                    MAX_RETRIES,
                    exc,
                )
                if attempt < MAX_RETRIES:
                    time.sleep(1)  # brief backoff before retry
        return None

    # ------------------------------------------------------------------
    # HTML parsing
    # ------------------------------------------------------------------

    @staticmethod
    def _parse_html(raw_html: str) -> Dict[str, Any]:
        """Parse HTML and extract useful metadata.

        Returns a dict with ``title``, ``description``, and ``text_snippet``.
        """
        soup = BeautifulSoup(raw_html, "lxml")

        # Page title
        title = ""
        if soup.title and soup.title.string:
            title = sanitize_html(soup.title.string.strip())

        # Meta description
        description = ""
        meta_desc = soup.find("meta", attrs={"name": "description"})
        if meta_desc and meta_desc.get("content"):
            description = sanitize_html(str(meta_desc["content"]))

        # Extract first meaningful paragraph as a text snippet
        text_snippet = ""
        for tag in soup.find_all(["p", "h1", "h2", "h3"], limit=20):
            text = sanitize_html(tag.get_text(separator=" ", strip=True))
            if len(text) > 50:
                text_snippet = text[:500]
                break

        return {
            "title": title,
            "meta_description": description,
            "text_snippet": text_snippet,
        }

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def scrape_country(self, country_code: str) -> Dict[str, Any]:
        """Scrape data for a single country.

        Attempts live scraping first, then falls back to curated data.

        Parameters
        ----------
        country_code : str
            ISO 3166-1 alpha-2 country code (e.g., ``"US"``).

        Returns
        -------
        dict
            Country data dict ready for the analyzer and JSON output.
        """
        country_code = country_code.upper()
        source = COUNTRY_SOURCES.get(country_code)

        if source is None:
            logger.error("Unknown country code: %s", country_code)
            return {}

        # ---- Check cache ----
        cache_key = f"country_{country_code}"
        if self.cache:
            cached = self.cache.get(cache_key)
            if cached is not None:
                logger.info("Using cached data for %s", country_code)
                return cached

        # ---- Attempt live scrape ----
        scraped: Dict[str, Any] = {}
        for url in source.get("urls", []):
            raw_html = self._fetch_url(url)
            if raw_html:
                parsed = self._parse_html(raw_html)
                scraped = {
                    "scraped_title": parsed.get("title", ""),
                    "scraped_description": parsed.get("meta_description", ""),
                    "scraped_snippet": parsed.get("text_snippet", ""),
                    "source_url": url,
                    "scraped_at": datetime.now(timezone.utc).isoformat(),
                }
                logger.info("Successfully scraped %s from %s", country_code, url)
                break  # first successful URL is enough

        # ---- Build result from fallback + any scraped supplement ----
        fallback = FALLBACK_DATA.get(country_code, {})
        if not fallback:
            logger.warning("No fallback data for %s", country_code)

        # Start with a copy of the fallback data (our primary source)
        result: Dict[str, Any] = dict(fallback)

        # If we got live-scraped data, attach it as supplementary metadata
        if scraped:
            result["live_scrape"] = scraped
            # Use scraped description as a supplement if available
            if scraped.get("scraped_description"):
                result["scraped_description"] = sanitize_text(
                    scraped["scraped_description"]
                )

        result["last_updated"] = datetime.now(timezone.utc).isoformat()

        # ---- Cache the result ----
        if self.cache:
            self.cache.set(cache_key, result)

        return result

    def scrape_all(self) -> Dict[str, Dict[str, Any]]:
        """Scrape data for all configured countries.

        Respects rate limiting between requests.

        Returns
        -------
        dict
            Mapping of country codes to country data dicts.
        """
        results: Dict[str, Dict[str, Any]] = {}
        codes = list(COUNTRY_SOURCES.keys())
        total = len(codes)

        for idx, code in enumerate(codes, 1):
            logger.info("Scraping %d/%d: %s", idx, total, code)
            data = self.scrape_country(code)
            if data:
                results[code] = data

        logger.info("Completed scraping %d countries.", len(results))
        return results

