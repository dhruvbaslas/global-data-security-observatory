/**
 * sanitize.js — Input sanitization utilities for XSS prevention.
 *
 * All user-provided strings MUST be passed through these functions
 * before rendering or storing. This module provides defense-in-depth
 * against cross-site scripting (XSS) attacks.
 */

/**
 * Map of characters that must be escaped in HTML contexts.
 * These are the five characters that can break out of HTML attribute
 * values or text content and enable XSS.
 */
const HTML_ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Regex matching any character that needs HTML entity escaping.
 */
const HTML_ESCAPE_REGEX = /[&<>"'/]/g;

/**
 * Maximum allowed length for sanitized input strings.
 * Prevents excessively long inputs that could cause performance issues.
 */
const MAX_INPUT_LENGTH = 1000;

/**
 * Maximum allowed length for country name inputs.
 */
const MAX_COUNTRY_NAME_LENGTH = 100;

/**
 * Maximum allowed length for URL inputs.
 */
const MAX_URL_LENGTH = 2048;

/**
 * Strip ALL HTML tags from a string.
 * This is the most aggressive sanitization — use when you need
 * plain text only (e.g., rendering user content in the DOM).
 *
 * @param {string} str - The input string potentially containing HTML.
 * @returns {string} The string with all HTML tags removed.
 *
 * @example
 * sanitizeHTML('<script>alert("xss")</script>Hello') // => 'Hello'
 * sanitizeHTML('<b>Bold</b> text') // => 'Bold text'
 */
export function sanitizeHTML(str) {
  // Guard against non-string inputs
  if (typeof str !== 'string') return '';

  // Remove all HTML tags iteratively until the string stabilizes.
  // This loop prevents incomplete multi-character sanitization bypasses
  // such as <<script>script> or <scr<script>ipt>.
  let prev;
  let sanitized = str;
  do {
    prev = sanitized;
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  } while (sanitized !== prev);

  return sanitized;
}

/**
 * Escape HTML entities, trim whitespace, and limit string length.
 * Use this for user text inputs that will be displayed in the UI.
 * Unlike sanitizeHTML, this preserves the content but makes it safe.
 *
 * @param {string} str - The raw user input string.
 * @param {number} [maxLength=MAX_INPUT_LENGTH] - Maximum allowed length.
 * @returns {string} The sanitized, escaped, trimmed string.
 *
 * @example
 * sanitizeInput('  <script>alert("xss")</script>  ')
 * // => '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
 */
export function sanitizeInput(str, maxLength = MAX_INPUT_LENGTH) {
  // Guard against non-string inputs
  if (typeof str !== 'string') return '';

  // 1. Trim leading/trailing whitespace
  let sanitized = str.trim();

  // 2. Truncate to maximum allowed length
  sanitized = sanitized.slice(0, maxLength);

  // 3. Escape HTML entities to prevent XSS when rendered
  sanitized = sanitized.replace(
    HTML_ESCAPE_REGEX,
    (char) => HTML_ENTITY_MAP[char] || char
  );

  return sanitized;
}

/**
 * Validate and sanitize a URL string.
 * Only allows http: and https: schemes to prevent javascript: URI attacks.
 * Returns an empty string for invalid or dangerous URLs.
 *
 * @param {string} url - The URL string to validate and sanitize.
 * @returns {string} The sanitized URL, or empty string if invalid/dangerous.
 *
 * @example
 * sanitizeURL('https://example.com') // => 'https://example.com'
 * sanitizeURL('javascript:alert(1)') // => ''
 * sanitizeURL('data:text/html,...')   // => ''
 */
export function sanitizeURL(url) {
  // Guard against non-string inputs
  if (typeof url !== 'string') return '';

  // Trim and limit length
  const trimmed = url.trim().slice(0, MAX_URL_LENGTH);

  // Reject empty strings
  if (!trimmed) return '';

  try {
    // Use the URL constructor for robust parsing
    const parsed = new URL(trimmed);

    // CRITICAL: Only allow safe schemes (http and https)
    // This prevents javascript:, data:, vbscript:, and other dangerous URIs
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }

    // Return the parsed URL string (normalized by the URL constructor)
    return parsed.href;
  } catch {
    // URL constructor throws for invalid URLs — return empty string
    return '';
  }
}

/**
 * Validate a country code string.
 * Must be 2-3 uppercase ASCII letters (ISO 3166-1 alpha-2 or alpha-3).
 *
 * @param {string} code - The country code to validate.
 * @returns {boolean} True if the code is valid.
 *
 * @example
 * isValidCountryCode('US')  // => true
 * isValidCountryCode('GBR') // => true
 * isValidCountryCode('us')  // => false (must be uppercase)
 * isValidCountryCode('1234') // => false
 */
export function isValidCountryCode(code) {
  if (typeof code !== 'string') return false;
  // Match exactly 2-3 uppercase ASCII letters
  return /^[A-Z]{2,3}$/.test(code);
}

/**
 * Validate a URL string using the URL constructor.
 * More permissive than sanitizeURL — allows any parseable URL with http/https.
 *
 * @param {string} url - The URL string to validate.
 * @returns {boolean} True if the URL is valid and uses http(s).
 *
 * @example
 * isValidURL('https://example.com')     // => true
 * isValidURL('not a url')               // => false
 * isValidURL('javascript:alert(1)')     // => false
 */
export function isValidURL(url) {
  if (typeof url !== 'string') return false;

  try {
    const parsed = new URL(url.trim());
    // Only accept http and https schemes
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Sanitize a country name for safe storage and display.
 * Strips HTML, trims, and limits length.
 *
 * @param {string} name - The raw country name input.
 * @returns {string} The sanitized country name.
 */
export function sanitizeCountryName(name) {
  if (typeof name !== 'string') return '';
  // First strip any HTML tags, then trim and limit length
  return sanitizeHTML(name).trim().slice(0, MAX_COUNTRY_NAME_LENGTH);
}
