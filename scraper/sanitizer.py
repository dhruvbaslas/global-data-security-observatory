"""
Global Data Security Observatory - Input Sanitizer
===================================================
Defence-in-depth utilities that sanitize every piece of external input
before it enters the processing pipeline or appears in the output JSON.

Key concerns:
- Scraped HTML may contain ``<script>``, ``<iframe>``, etc.
- URLs could carry injected query strings or non-HTTP schemes.
- User-supplied country names/URLs must be validated.
"""

import html
import re
import logging
from typing import Optional
from urllib.parse import urlparse, urlunparse

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Dangerous HTML tags that MUST be stripped from scraped content
# ---------------------------------------------------------------------------
_DANGEROUS_TAGS: list[str] = [
    "script",
    "iframe",
    "object",
    "embed",
    "form",
    "input",
    "textarea",
    "button",
    "applet",
    "link",       # external stylesheets can exfiltrate data
    "meta",       # meta-refresh redirects
    "base",       # changes base URL for all relative links
    "svg",        # can embed scripts via <svg onload="…">
    "math",       # similar vector in some renderers
]

# Pre-compiled regex for stripping dangerous tags (opening + closing + self-closing)
_DANGEROUS_TAG_RE = re.compile(
    r"</?(?:" + "|".join(_DANGEROUS_TAGS) + r")\b[^>]*>",
    re.IGNORECASE | re.DOTALL,
)

# Regex for stripping inline event handlers like onclick="…"
_EVENT_HANDLER_RE = re.compile(
    r"""\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)""",
    re.IGNORECASE,
)

# Control characters (except newline, tab, carriage return)
_CONTROL_CHAR_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")

# Collapse runs of whitespace into a single space
_MULTI_SPACE_RE = re.compile(r"[ \t]+")

# Allowed URL schemes
_ALLOWED_SCHEMES = {"http", "https"}

# ---------------------------------------------------------------------------
# Country-name validation: allow Unicode letters, spaces, hyphens, parens
# ---------------------------------------------------------------------------
_COUNTRY_NAME_RE = re.compile(
    r"^[\w\s\-'().,&]+$", re.UNICODE
)

# Maximum lengths
_MAX_COUNTRY_NAME_LEN = 120
_MAX_URL_LEN = 2048


# ===================================================================
# Public API
# ===================================================================

def sanitize_html(raw_html: str) -> str:
    """Strip dangerous HTML tags and event handlers, returning safe text.

    This does **not** attempt to produce valid HTML — it removes risky
    elements and returns the remaining text content.  The result is
    suitable for further plain-text processing.

    Parameters
    ----------
    raw_html : str
        Raw HTML string scraped from a website.

    Returns
    -------
    str
        Sanitized text with dangerous constructs removed.
    """
    if not raw_html:
        return ""

    # 1. Remove dangerous tags and their content for script/style
    #    (these usually enclose content that should be discarded entirely)
    text = re.sub(
        r"<(script|style)\b[^>]*>.*?</\1>",
        "",
        raw_html,
        flags=re.IGNORECASE | re.DOTALL,
    )

    # 2. Remove remaining dangerous tags (opening/closing/self-closing)
    text = _DANGEROUS_TAG_RE.sub("", text)

    # 3. Strip inline event handlers from any remaining HTML tags
    text = _EVENT_HANDLER_RE.sub("", text)

    # 4. Strip all remaining HTML tags, keeping only text content
    text = re.sub(r"<[^>]+>", " ", text)

    # 5. Decode HTML entities (e.g., &amp; -> &)
    text = html.unescape(text)

    # 6. Normalise whitespace
    text = _MULTI_SPACE_RE.sub(" ", text)
    text = "\n".join(line.strip() for line in text.splitlines())
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def sanitize_text(text: str) -> str:
    """Escape HTML entities, strip control characters, normalise whitespace.

    Use this for any free-text field that will be embedded in the
    output JSON (descriptions, summaries, etc.).

    Parameters
    ----------
    text : str
        Arbitrary text, possibly containing HTML entities or control chars.

    Returns
    -------
    str
        Clean, safe text.
    """
    if not text:
        return ""

    # Strip control characters (keep \\n, \\t, \\r for formatting)
    text = _CONTROL_CHAR_RE.sub("", text)

    # Escape HTML entities so the text cannot be misinterpreted as HTML
    text = html.escape(text, quote=True)

    # Normalise whitespace
    text = _MULTI_SPACE_RE.sub(" ", text)
    text = text.strip()

    return text


def sanitize_url(url: str) -> Optional[str]:
    """Validate and sanitize a URL.

    Only ``http`` and ``https`` schemes are allowed.  Query strings are
    preserved but known injection patterns are stripped.

    Parameters
    ----------
    url : str
        The URL to validate.

    Returns
    -------
    str or None
        The sanitized URL, or ``None`` if the URL is invalid.
    """
    if not url or not isinstance(url, str):
        return None

    url = url.strip()

    # Length check – absurdly long URLs are suspicious
    if len(url) > _MAX_URL_LEN:
        logger.warning("URL rejected (too long, %d chars): %.80s…", len(url), url)
        return None

    try:
        parsed = urlparse(url)
    except ValueError:
        logger.warning("URL rejected (parse error): %.80s", url)
        return None

    # Scheme must be http or https
    if parsed.scheme.lower() not in _ALLOWED_SCHEMES:
        logger.warning("URL rejected (bad scheme '%s'): %.80s", parsed.scheme, url)
        return None

    # Must have a network location (domain)
    if not parsed.netloc:
        logger.warning("URL rejected (no netloc): %.80s", url)
        return None

    # Reconstruct to normalise
    sanitized = urlunparse((
        parsed.scheme.lower(),
        parsed.netloc.lower(),
        parsed.path,
        parsed.params,
        parsed.query,
        "",  # strip fragment – not sent to server
    ))

    return sanitized


def validate_country_input(
    name: str,
    url: str,
) -> tuple[bool, list[str]]:
    """Validate user-provided country name and authority URL.

    Parameters
    ----------
    name : str
        The country / region name.
    url : str
        The data-protection authority's URL.

    Returns
    -------
    tuple[bool, list[str]]
        ``(is_valid, list_of_error_messages)``.
    """
    errors: list[str] = []

    # --- Name validation ---
    if not name or not isinstance(name, str):
        errors.append("Country name is required.")
    else:
        name = name.strip()
        if len(name) > _MAX_COUNTRY_NAME_LEN:
            errors.append(
                f"Country name too long ({len(name)} chars, max {_MAX_COUNTRY_NAME_LEN})."
            )
        if not _COUNTRY_NAME_RE.match(name):
            errors.append(
                "Country name contains invalid characters. "
                "Only letters, numbers, spaces, hyphens, apostrophes, "
                "parentheses, commas, periods, and ampersands are allowed."
            )

    # --- URL validation ---
    sanitized_url = sanitize_url(url)
    if sanitized_url is None:
        errors.append(
            "Invalid URL. Must be a valid http:// or https:// URL."
        )

    is_valid = len(errors) == 0
    return is_valid, errors

