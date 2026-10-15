"""
Global Data Security Observatory - Policy Analyzer
===================================================
Scores each country's data-security posture and produces comparative
analysis (best overall, best per-parameter, country-vs-country).

The scoring is based on well-researched policy attributes derived from
the fallback data and any supplementary scraped information.
"""

import logging
from typing import Any, Dict, List, Optional, Tuple

from scraper.config import PARAMETER_DESCRIPTIONS, SECURITY_PARAMETERS

logger = logging.getLogger(__name__)


class PolicyAnalyzer:
    """Analyse and compare countries' data-security frameworks.

    This class operates on the country data dicts produced by
    :class:`scraper.scraper.DataSecurityScraper`.
    """

    # ------------------------------------------------------------------
    # Scoring
    # ------------------------------------------------------------------

    @staticmethod
    def score_country(country_data: Dict[str, Any]) -> Dict[str, int]:
        """Return parameter scores (1-10) for a single country.

        If the country data already contains a ``scores`` dict (from the
        curated fallback data), those scores are used directly.  Otherwise,
        a basic heuristic is applied based on available metadata.

        Parameters
        ----------
        country_data : dict
            Country data dict as returned by the scraper.

        Returns
        -------
        dict
            Mapping of parameter name → integer score (1-10).
        """
        # Use pre-computed scores from fallback data when available
        if "scores" in country_data and isinstance(country_data["scores"], dict):
            scores = {}
            for param in SECURITY_PARAMETERS:
                raw = country_data["scores"].get(param, 5)
                # Clamp to valid range
                scores[param] = max(1, min(10, int(raw)))
            return scores

        # ---- Heuristic fallback (e.g. user-added countries) ----
        logger.debug(
            "No pre-computed scores for '%s'; using heuristic.",
            country_data.get("code", "??"),
        )
        key_laws: List[str] = country_data.get("key_laws", [])
        summary: str = country_data.get("summary", "")

        # Very rough heuristics based on available metadata
        law_count = len(key_laws)
        summary_len = len(summary)

        return {
            "policy_coverage": min(10, max(1, law_count + 2)),
            "enforcement_strength": 5,
            "transparency": 5,
            "update_frequency": 5,
            "international_alignment": 5 if summary_len > 100 else 3,
        }

    @staticmethod
    def overall_score(scores: Dict[str, int]) -> float:
        """Compute the arithmetic mean of all parameter scores.

        Parameters
        ----------
        scores : dict
            Parameter → score mapping.

        Returns
        -------
        float
            The overall score, rounded to one decimal place.
        """
        if not scores:
            return 0.0
        return round(sum(scores.values()) / len(scores), 1)

    # ------------------------------------------------------------------
    # Comparative analysis
    # ------------------------------------------------------------------

    def find_best_country(
        self,
        all_country_data: Dict[str, Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Determine the best country overall and per parameter.

        Parameters
        ----------
        all_country_data : dict
            Mapping of country code → country data dict (with scores).

        Returns
        -------
        dict
            Analysis result with ``best_overall`` and ``best_per_parameter``.
        """
        if not all_country_data:
            return {"best_overall": None, "best_per_parameter": {}}

        # Score every country
        scored: Dict[str, Tuple[Dict[str, int], float]] = {}
        for code, data in all_country_data.items():
            scores = self.score_country(data)
            scored[code] = (scores, self.overall_score(scores))

        # ---- Best overall ----
        best_code = max(scored, key=lambda c: scored[c][1])
        best_scores, best_overall = scored[best_code]
        best_data = all_country_data[best_code]

        best_overall_result = {
            "country": best_code,
            "name": best_data.get("name", best_code),
            "flag": best_data.get("flag", ""),
            "score": best_overall,
            "reason": (
                f"{best_data.get('name', best_code)} leads with an overall score "
                f"of {best_overall}/10, driven by its strong performance across "
                f"multiple parameters including "
                f"{self._top_parameters(best_scores, n=2)}."
            ),
        }

        # ---- Best per parameter ----
        best_per_param: Dict[str, Dict[str, Any]] = {}
        for param in SECURITY_PARAMETERS:
            param_best_code = max(
                scored,
                key=lambda c: scored[c][0].get(param, 0),
            )
            param_best_score = scored[param_best_code][0][param]
            param_data = all_country_data[param_best_code]
            # Build explanation from details if available
            detail_text = ""
            if "details" in param_data and param in param_data["details"]:
                detail_text = param_data["details"][param]
            best_per_param[param] = {
                "country": param_best_code,
                "name": param_data.get("name", param_best_code),
                "flag": param_data.get("flag", ""),
                "score": param_best_score,
                "reason": detail_text or (
                    f"{param_data.get('name', param_best_code)} scores highest "
                    f"in {param.replace('_', ' ')} with a score of "
                    f"{param_best_score}/10."
                ),
            }

        return {
            "best_overall": best_overall_result,
            "best_per_parameter": best_per_param,
            "parameter_descriptions": dict(PARAMETER_DESCRIPTIONS),
        }

    @staticmethod
    def _top_parameters(scores: Dict[str, int], n: int = 2) -> str:
        """Return a comma-separated string of the top N parameter names.

        Used for generating human-readable explanations.
        """
        sorted_params = sorted(scores, key=scores.get, reverse=True)  # type: ignore[arg-type]
        top = sorted_params[:n]
        return " and ".join(p.replace("_", " ") for p in top)

    def compare_countries(
        self,
        code_a: str,
        code_b: str,
        all_country_data: Dict[str, Dict[str, Any]],
    ) -> Optional[Dict[str, Any]]:
        """Generate a head-to-head comparison between two countries.

        Parameters
        ----------
        code_a : str
            First country code.
        code_b : str
            Second country code.
        all_country_data : dict
            Full dataset of country data.

        Returns
        -------
        dict or None
            Comparison data, or ``None`` if either country is not found.
        """
        data_a = all_country_data.get(code_a.upper())
        data_b = all_country_data.get(code_b.upper())

        if not data_a or not data_b:
            logger.warning(
                "Cannot compare %s vs %s – missing data.", code_a, code_b
            )
            return None

        scores_a = self.score_country(data_a)
        scores_b = self.score_country(data_b)
        overall_a = self.overall_score(scores_a)
        overall_b = self.overall_score(scores_b)

        comparison: Dict[str, Any] = {
            "countries": [
                {
                    "code": code_a.upper(),
                    "name": data_a.get("name", code_a),
                    "flag": data_a.get("flag", ""),
                    "overall_score": overall_a,
                    "scores": scores_a,
                },
                {
                    "code": code_b.upper(),
                    "name": data_b.get("name", code_b),
                    "flag": data_b.get("flag", ""),
                    "overall_score": overall_b,
                    "scores": scores_b,
                },
            ],
            "parameter_comparison": {},
        }

        for param in SECURITY_PARAMETERS:
            sa = scores_a.get(param, 0)
            sb = scores_b.get(param, 0)
            diff = sa - sb
            if diff > 0:
                leader = code_a.upper()
            elif diff < 0:
                leader = code_b.upper()
            else:
                leader = "tie"

            comparison["parameter_comparison"][param] = {
                "scores": {code_a.upper(): sa, code_b.upper(): sb},
                "difference": abs(diff),
                "leader": leader,
            }

        # Overall leader
        if overall_a > overall_b:
            comparison["overall_leader"] = code_a.upper()
        elif overall_b > overall_a:
            comparison["overall_leader"] = code_b.upper()
        else:
            comparison["overall_leader"] = "tie"

        return comparison

