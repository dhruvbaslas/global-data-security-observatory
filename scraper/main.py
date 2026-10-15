"""
Global Data Security Observatory - Entry Point
===============================================
CLI entry point that orchestrates scraping, analysis, and JSON output.

Usage::

    python -m scraper.main
    python -m scraper.main --output ./output.json
    python -m scraper.main --country US
    python -m scraper.main --no-cache
"""

import argparse
import json
import logging
import os
import sys
from datetime import datetime, timezone
from typing import Any, Dict

# Ensure the project root is on sys.path so ``scraper.*`` imports work
# when running ``python -m scraper.main`` from the project root.
_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from scraper.analyzer import PolicyAnalyzer
from scraper.config import COUNTRY_SOURCES, OUTPUT_PATH, SECURITY_PARAMETERS
from scraper.scraper import DataSecurityScraper

# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# CLI argument parser
# ---------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    """Build and return the argument parser."""
    parser = argparse.ArgumentParser(
        prog="scraper",
        description=(
            "Global Data Security Observatory – scraper & analyzer. "
            "Fetches data-protection information for selected countries, "
            "scores them, and writes a structured JSON file for the "
            "frontend dashboard."
        ),
    )
    parser.add_argument(
        "--output", "-o",
        type=str,
        default=OUTPUT_PATH,
        help="Path for the output JSON file (default: %(default)s).",
    )
    parser.add_argument(
        "--country", "-c",
        type=str,
        default=None,
        help=(
            "Scrape a single country by ISO 3166-1 alpha-2 code "
            "(e.g. US, FR). Omit to scrape all configured countries."
        ),
    )
    parser.add_argument(
        "--no-cache",
        action="store_true",
        default=False,
        help="Disable the file cache and always fetch fresh data.",
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        default=False,
        help="Enable debug-level logging.",
    )
    return parser


# ---------------------------------------------------------------------------
# Output builder
# ---------------------------------------------------------------------------

def build_output(
    country_data: Dict[str, Dict[str, Any]],
    analyzer: PolicyAnalyzer,
) -> Dict[str, Any]:
    """Assemble the final JSON structure expected by the frontend.

    Parameters
    ----------
    country_data : dict
        Mapping of country code → country data dict.
    analyzer : PolicyAnalyzer
        Analyzer instance for scoring and comparison.

    Returns
    -------
    dict
        The complete output structure.
    """
    # Score every country and attach scores + details to the output
    countries_output: Dict[str, Dict[str, Any]] = {}
    for code, data in country_data.items():
        scores = analyzer.score_country(data)
        countries_output[code] = {
            "code": data.get("code", code),
            "name": data.get("name", code),
            "flag": data.get("flag", ""),
            "summary": data.get("summary", data.get("description", "")),
            "key_laws": data.get("key_laws", []),
            "authority": data.get("authority", ""),
            "authority_url": data.get("authority_url", ""),
            "scores": scores,
            "details": data.get("details", {}),
            "last_updated": data.get(
                "last_updated", datetime.now(timezone.utc).isoformat()
            ),
        }

    # Run comparative analysis
    analysis = analyzer.find_best_country(country_data)

    output: Dict[str, Any] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "countries": countries_output,
        "analysis": analysis,
    }
    return output


def write_output(output: Dict[str, Any], path: str) -> None:
    """Write the output dict to a JSON file, creating directories as needed.

    Parameters
    ----------
    output : dict
        The assembled output data.
    path : str
        Filesystem path for the output file.
    """
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(output, fh, ensure_ascii=False, indent=2)
    logger.info("Output written to %s (%d bytes)", path, os.path.getsize(path))


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main(argv: list[str] | None = None) -> None:
    """CLI entry point."""
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    logger.info("=" * 60)
    logger.info("Global Data Security Observatory – Scraper")
    logger.info("=" * 60)

    # ---- Initialise components ----
    scraper = DataSecurityScraper(use_cache=not args.no_cache)
    analyzer = PolicyAnalyzer()

    # ---- Scrape ----
    if args.country:
        code = args.country.upper()
        if code not in COUNTRY_SOURCES:
            logger.error(
                "Unknown country code '%s'. Available: %s",
                code,
                ", ".join(sorted(COUNTRY_SOURCES.keys())),
            )
            sys.exit(1)
        logger.info("Scraping single country: %s", code)
        data = scraper.scrape_country(code)
        country_data = {code: data} if data else {}
    else:
        logger.info(
            "Scraping all %d countries: %s",
            len(COUNTRY_SOURCES),
            ", ".join(sorted(COUNTRY_SOURCES.keys())),
        )
        country_data = scraper.scrape_all()

    if not country_data:
        logger.error("No country data collected – aborting.")
        sys.exit(1)

    # ---- Merge full sovereign registry with scraped data ----
    sovereign_file = os.path.join(_project_root, "scraper", "all_sovereign_countries.json")
    if os.path.exists(sovereign_file):
        try:
            with open(sovereign_file, "r", encoding="utf-8") as sf:
                sovereign_data = json.load(sf)
                # Keep any live-scraped data prioritized, then fill the rest
                for c_code, c_info in sovereign_data.items():
                    if c_code not in country_data:
                        country_data[c_code] = c_info
            logger.info("Loaded full sovereign registry: %d countries in database.", len(country_data))
        except Exception as err:
            logger.warning("Could not load sovereign registry: %s", err)

    # ---- Analyse & output ----
    output = build_output(country_data, analyzer)
    write_output(output, args.output)

    # ---- Summary ----
    best = output.get("analysis", {}).get("best_overall")
    if best:
        logger.info(
            "Best overall: %s %s (score %.1f/10)",
            best.get("flag", ""),
            best.get("name", ""),
            best.get("score", 0),
        )

    logger.info("Done.")


if __name__ == "__main__":
    main()

