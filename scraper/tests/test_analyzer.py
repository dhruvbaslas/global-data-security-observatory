"""
Tests for the PolicyAnalyzer class.
====================================
Covers scoring logic, best-country finding, and country comparison.
"""

import os
import sys

import pytest

# Ensure imports work
_project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from scraper.analyzer import PolicyAnalyzer
from scraper.config import SECURITY_PARAMETERS
from scraper.scraper import FALLBACK_DATA


# ===================================================================
# Fixtures
# ===================================================================

@pytest.fixture
def analyzer():
    """Fresh PolicyAnalyzer instance."""
    return PolicyAnalyzer()


@pytest.fixture
def all_country_data():
    """Full fallback dataset for all countries."""
    return dict(FALLBACK_DATA)


@pytest.fixture
def sample_scored_data():
    """Minimal two-country dataset for comparison tests."""
    return {
        "AA": {
            "code": "AA",
            "name": "Country A",
            "flag": "🅰️",
            "summary": "A test country with strong coverage.",
            "key_laws": ["Law Alpha", "Law Beta"],
            "scores": {
                "policy_coverage": 9,
                "enforcement_strength": 7,
                "transparency": 8,
                "update_frequency": 6,
                "international_alignment": 5,
            },
            "details": {
                "policy_coverage": "Very broad coverage.",
                "enforcement_strength": "Active enforcement.",
                "transparency": "Open processes.",
                "update_frequency": "Moderate updates.",
                "international_alignment": "Some alignment.",
            },
        },
        "BB": {
            "code": "BB",
            "name": "Country B",
            "flag": "🅱️",
            "summary": "A test country with strong enforcement.",
            "key_laws": ["Law Gamma"],
            "scores": {
                "policy_coverage": 6,
                "enforcement_strength": 9,
                "transparency": 5,
                "update_frequency": 8,
                "international_alignment": 7,
            },
            "details": {
                "policy_coverage": "Moderate coverage.",
                "enforcement_strength": "Very strong enforcement.",
                "transparency": "Limited transparency.",
                "update_frequency": "Frequent updates.",
                "international_alignment": "Good alignment.",
            },
        },
    }


# ===================================================================
# Scoring Logic
# ===================================================================

class TestScoring:
    """Test the score_country() method."""

    def test_scores_from_fallback_data(self, analyzer):
        """Scores are correctly read from pre-computed fallback data."""
        scores = analyzer.score_country(FALLBACK_DATA["FR"])
        assert scores["policy_coverage"] == 9
        assert scores["enforcement_strength"] == 9
        assert scores["international_alignment"] == 10

    def test_all_parameters_present(self, analyzer):
        """Every security parameter is present in the scores dict."""
        for code, data in FALLBACK_DATA.items():
            scores = analyzer.score_country(data)
            for param in SECURITY_PARAMETERS:
                assert param in scores, f"{code} missing parameter: {param}"

    @pytest.mark.parametrize("code", list(FALLBACK_DATA.keys()))
    def test_scores_in_valid_range(self, analyzer, code):
        """All scores are between 1 and 10."""
        scores = analyzer.score_country(FALLBACK_DATA[code])
        for param, score in scores.items():
            assert 1 <= score <= 10, f"{code}.{param}={score} out of range"

    def test_heuristic_scoring_without_scores_key(self, analyzer):
        """Countries without pre-computed scores get heuristic scores."""
        data = {
            "code": "XX",
            "name": "Test Land",
            "key_laws": ["Law A", "Law B", "Law C"],
            "summary": "A substantial summary " * 20,
        }
        scores = analyzer.score_country(data)
        assert "policy_coverage" in scores
        # Heuristic: law_count(3) + 2 = 5
        assert scores["policy_coverage"] == 5

    def test_heuristic_clamps_to_max_10(self, analyzer):
        """Heuristic scoring should not exceed 10."""
        data = {
            "code": "YY",
            "name": "Many Laws Land",
            "key_laws": [f"Law {i}" for i in range(20)],
            "summary": "Short.",
        }
        scores = analyzer.score_country(data)
        assert scores["policy_coverage"] <= 10


# ===================================================================
# Overall Score
# ===================================================================

class TestOverallScore:
    """Test the overall_score() method."""

    def test_overall_score_calculation(self, analyzer):
        """Overall score is the arithmetic mean, rounded to 1 decimal."""
        scores = {
            "policy_coverage": 8,
            "enforcement_strength": 6,
            "transparency": 7,
            "update_frequency": 9,
            "international_alignment": 5,
        }
        result = analyzer.overall_score(scores)
        expected = round((8 + 6 + 7 + 9 + 5) / 5, 1)
        assert result == expected

    def test_overall_score_empty(self, analyzer):
        """Empty scores dict returns 0.0."""
        assert analyzer.overall_score({}) == 0.0

    def test_france_has_highest_overall(self, analyzer):
        """France should have the highest overall score in fallback data."""
        overall_scores = {}
        for code, data in FALLBACK_DATA.items():
            scores = analyzer.score_country(data)
            overall_scores[code] = analyzer.overall_score(scores)

        best = max(overall_scores, key=overall_scores.get)  # type: ignore[arg-type]
        assert best == "FR", (
            f"Expected France (FR) to be best overall, got {best}. "
            f"Scores: {overall_scores}"
        )


# ===================================================================
# Best Country Finding
# ===================================================================

class TestFindBestCountry:
    """Test the find_best_country() analysis method."""

    def test_best_overall_is_france(self, analyzer, all_country_data):
        """France should be identified as the best overall."""
        analysis = analyzer.find_best_country(all_country_data)

        best = analysis["best_overall"]
        assert best is not None
        assert best["country"] == "FR"
        assert best["score"] > 0

    def test_best_per_parameter_populated(self, analyzer, all_country_data):
        """Every parameter should have a best-country entry."""
        analysis = analyzer.find_best_country(all_country_data)
        best_per = analysis["best_per_parameter"]

        for param in SECURITY_PARAMETERS:
            assert param in best_per, f"Missing best for {param}"
            entry = best_per[param]
            assert "country" in entry
            assert "score" in entry
            assert entry["score"] >= 1

    def test_best_international_alignment_is_france(self, analyzer, all_country_data):
        """France (GDPR) should lead in international alignment."""
        analysis = analyzer.find_best_country(all_country_data)
        best_intl = analysis["best_per_parameter"]["international_alignment"]
        assert best_intl["country"] == "FR"
        assert best_intl["score"] == 10

    def test_parameter_descriptions_included(self, analyzer, all_country_data):
        """The analysis should include parameter descriptions."""
        analysis = analyzer.find_best_country(all_country_data)
        assert "parameter_descriptions" in analysis
        descs = analysis["parameter_descriptions"]
        for param in SECURITY_PARAMETERS:
            assert param in descs
            assert len(descs[param]) > 20

    def test_empty_data_returns_none_best(self, analyzer):
        """Empty input returns None for best_overall."""
        analysis = analyzer.find_best_country({})
        assert analysis["best_overall"] is None

    def test_with_synthetic_data(self, analyzer, sample_scored_data):
        """Synthetic data: Country A (mean 7.0) should beat B (mean 7.0)."""
        analysis = analyzer.find_best_country(sample_scored_data)
        best = analysis["best_overall"]
        assert best is not None
        # Both have same mean (7.0), so either is acceptable
        assert best["country"] in ("AA", "BB")


# ===================================================================
# Country Comparison
# ===================================================================

class TestCompareCountries:
    """Test head-to-head country comparison."""

    def test_compare_us_vs_fr(self, analyzer, all_country_data):
        """Comparing US and FR produces a valid comparison structure."""
        result = analyzer.compare_countries("US", "FR", all_country_data)

        assert result is not None
        assert len(result["countries"]) == 2
        assert result["countries"][0]["code"] == "US"
        assert result["countries"][1]["code"] == "FR"

        # FR should lead overall
        assert result["overall_leader"] == "FR"

    def test_compare_parameter_breakdown(self, analyzer, all_country_data):
        """Parameter comparison has entries for all parameters."""
        result = analyzer.compare_countries("GB", "JP", all_country_data)
        assert result is not None

        for param in SECURITY_PARAMETERS:
            assert param in result["parameter_comparison"]
            entry = result["parameter_comparison"][param]
            assert "scores" in entry
            assert "difference" in entry
            assert "leader" in entry

    def test_compare_nonexistent_country(self, analyzer, all_country_data):
        """Comparing with an unknown code returns None."""
        result = analyzer.compare_countries("US", "ZZ", all_country_data)
        assert result is None

    def test_compare_same_country(self, analyzer, all_country_data):
        """Comparing a country with itself yields a tie."""
        result = analyzer.compare_countries("FR", "FR", all_country_data)
        assert result is not None
        assert result["overall_leader"] == "tie"
        for param_info in result["parameter_comparison"].values():
            assert param_info["leader"] == "tie"
            assert param_info["difference"] == 0

    def test_compare_with_synthetic_data(self, analyzer, sample_scored_data):
        """Synthetic comparison: A leads in coverage, B in enforcement."""
        result = analyzer.compare_countries("AA", "BB", sample_scored_data)
        assert result is not None

        pc = result["parameter_comparison"]["policy_coverage"]
        assert pc["leader"] == "AA"
        assert pc["scores"]["AA"] == 9
        assert pc["scores"]["BB"] == 6

        es = result["parameter_comparison"]["enforcement_strength"]
        assert es["leader"] == "BB"
        assert es["scores"]["BB"] == 9

