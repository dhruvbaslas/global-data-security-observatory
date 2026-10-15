"""
Tests for the sanitizer module.
================================
Covers HTML sanitization (XSS prevention), URL validation,
text sanitization, and country-input validation.
"""

import os
import sys

import pytest

# Ensure imports work
_project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from scraper.sanitizer import (
    sanitize_html,
    sanitize_text,
    sanitize_url,
    validate_country_input,
)


# ===================================================================
# HTML Sanitization (XSS Prevention)
# ===================================================================

class TestSanitizeHTML:
    """Verify that dangerous HTML constructs are stripped."""

    def test_strips_script_tags(self):
        """<script> tags and their content must be removed."""
        html = '<p>Hello</p><script>alert("xss")</script><p>World</p>'
        result = sanitize_html(html)
        assert "script" not in result.lower()
        assert "alert" not in result
        assert "Hello" in result
        assert "World" in result

    def test_strips_iframe_tags(self):
        """<iframe> tags must be removed."""
        html = '<p>Content</p><iframe src="http://evil.com"></iframe>'
        result = sanitize_html(html)
        assert "iframe" not in result.lower()
        assert "evil.com" not in result
        assert "Content" in result

    def test_strips_object_embed_tags(self):
        """<object> and <embed> tags must be removed."""
        html = '<object data="x"></object><embed src="y">'
        result = sanitize_html(html)
        assert "object" not in result.lower()
        assert "embed" not in result.lower()

    def test_strips_form_tags(self):
        """<form> tags must be removed to prevent phishing."""
        html = '<form action="http://evil.com"><input type="text"></form>'
        result = sanitize_html(html)
        assert "form" not in result.lower()
        assert "input" not in result.lower()

    def test_strips_event_handlers(self):
        """Inline event handlers (onclick, onload, etc.) must be removed."""
        html = '<div onclick="alert(1)">Click me</div>'
        result = sanitize_html(html)
        assert "onclick" not in result.lower()
        assert "alert" not in result
        assert "Click me" in result

    def test_strips_style_tags(self):
        """<style> tags and their content should be removed."""
        html = '<style>body{background:url("evil")}</style><p>Text</p>'
        result = sanitize_html(html)
        assert "style" not in result.lower()
        assert "Text" in result

    def test_preserves_safe_text(self):
        """Normal text content should be preserved."""
        html = "<h1>Data Protection</h1><p>We protect your privacy.</p>"
        result = sanitize_html(html)
        assert "Data Protection" in result
        assert "We protect your privacy" in result

    def test_handles_empty_string(self):
        """Empty input returns empty output."""
        assert sanitize_html("") == ""

    def test_handles_none_like_input(self):
        """None-like falsy input returns empty string."""
        assert sanitize_html("") == ""

    def test_decodes_html_entities(self):
        """HTML entities should be decoded."""
        html = "<p>Tom &amp; Jerry &lt;3</p>"
        result = sanitize_html(html)
        assert "Tom & Jerry <3" in result

    def test_strips_svg_onload_xss(self):
        """SVG with onload XSS vector must be removed."""
        html = '<svg onload="alert(1)"><circle r="10"/></svg>'
        result = sanitize_html(html)
        assert "svg" not in result.lower()
        assert "alert" not in result


# ===================================================================
# Text Sanitization
# ===================================================================

class TestSanitizeText:
    """Test free-text sanitization."""

    def test_escapes_html_entities(self):
        """Angle brackets and quotes are escaped."""
        result = sanitize_text('<script>alert("xss")</script>')
        assert "&lt;" in result
        assert "&gt;" in result
        assert "<script>" not in result

    def test_strips_control_characters(self):
        """Control characters (except \\n, \\t, \\r) are removed."""
        text = "Hello\x00World\x07Test"
        result = sanitize_text(text)
        assert "\x00" not in result
        assert "\x07" not in result
        assert "HelloWorldTest" in result

    def test_normalises_whitespace(self):
        """Multiple spaces/tabs are collapsed to a single space."""
        text = "Hello   \t  World"
        result = sanitize_text(text)
        assert result == "Hello World"

    def test_handles_empty_string(self):
        assert sanitize_text("") == ""


# ===================================================================
# URL Validation
# ===================================================================

class TestSanitizeURL:
    """Test URL validation and sanitization."""

    def test_valid_https_url(self):
        """A normal HTTPS URL passes validation."""
        result = sanitize_url("https://www.example.com/path?q=1")
        assert result is not None
        assert result.startswith("https://")

    def test_valid_http_url(self):
        """HTTP is allowed (some government sites still use it)."""
        result = sanitize_url("http://www.cac.gov.cn/")
        assert result is not None
        assert result.startswith("http://")

    def test_rejects_javascript_scheme(self):
        """javascript: URIs are blocked."""
        result = sanitize_url("javascript:alert(1)")
        assert result is None

    def test_rejects_data_scheme(self):
        """data: URIs are blocked."""
        result = sanitize_url("data:text/html,<script>alert(1)</script>")
        assert result is None

    def test_rejects_ftp_scheme(self):
        """FTP is not allowed."""
        result = sanitize_url("ftp://files.example.com/data.csv")
        assert result is None

    def test_rejects_empty_url(self):
        """Empty strings return None."""
        assert sanitize_url("") is None
        assert sanitize_url(None) is None  # type: ignore[arg-type]

    def test_rejects_very_long_url(self):
        """Absurdly long URLs are rejected."""
        long_url = "https://example.com/" + "a" * 3000
        assert sanitize_url(long_url) is None

    def test_rejects_no_netloc(self):
        """URLs without a domain are rejected."""
        assert sanitize_url("https://") is None

    def test_strips_fragment(self):
        """URL fragments are stripped (they're not sent to the server)."""
        result = sanitize_url("https://example.com/page#section")
        assert result is not None
        assert "#" not in result

    def test_normalises_scheme_and_host(self):
        """Scheme and host are lowercased."""
        result = sanitize_url("HTTPS://WWW.Example.COM/Path")
        assert result is not None
        assert result.startswith("https://www.example.com")


# ===================================================================
# Country Input Validation
# ===================================================================

class TestValidateCountryInput:
    """Test user-provided country name and URL validation."""

    def test_valid_input(self):
        """A valid name + URL passes validation."""
        is_valid, errors = validate_country_input(
            "United Kingdom", "https://ico.org.uk/"
        )
        assert is_valid is True
        assert errors == []

    def test_empty_name_fails(self):
        is_valid, errors = validate_country_input("", "https://example.com")
        assert is_valid is False
        assert any("required" in e.lower() for e in errors)

    def test_name_with_special_chars_fails(self):
        """Names with dangerous characters are rejected."""
        is_valid, errors = validate_country_input(
            '<script>alert("xss")</script>',
            "https://example.com",
        )
        assert is_valid is False

    def test_name_too_long_fails(self):
        long_name = "A" * 200
        is_valid, errors = validate_country_input(long_name, "https://example.com")
        assert is_valid is False
        assert any("too long" in e.lower() for e in errors)

    def test_invalid_url_fails(self):
        is_valid, errors = validate_country_input(
            "Test Country", "not-a-url"
        )
        assert is_valid is False
        assert any("invalid url" in e.lower() for e in errors)

    def test_javascript_url_fails(self):
        is_valid, errors = validate_country_input(
            "Test Country", "javascript:void(0)"
        )
        assert is_valid is False

    def test_name_with_unicode_passes(self):
        """Country names with accented characters are valid."""
        is_valid, errors = validate_country_input(
            "Côte d'Ivoire", "https://example.ci/"
        )
        assert is_valid is True

    def test_name_with_parentheses_passes(self):
        """Names like 'Korea (Republic of)' are valid."""
        is_valid, errors = validate_country_input(
            "Korea (Republic of)", "https://example.kr/"
        )
        assert is_valid is True

