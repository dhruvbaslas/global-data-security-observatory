import { describe, it, expect } from 'vitest';
import {
  sanitizeHTML,
  sanitizeInput,
  sanitizeURL,
  isValidCountryCode,
  isValidURL,
  sanitizeCountryName,
} from '../utils/sanitize';

describe('Sanitization & Security Utilities', () => {
  it('strips all malicious HTML tags completely', () => {
    const dirty = '<script>alert("XSS")</script><b>Legal Document</b>';
    expect(sanitizeHTML(dirty)).toBe('alert("XSS")Legal Document');
  });

  it('escapes characters vulnerable to XSS injection in input strings', () => {
    const malicious = '<img src=x onerror=alert(1)>';
    const clean = sanitizeInput(malicious);
    expect(clean).toContain('&lt;');
    expect(clean).toContain('&gt;');
    expect(clean).not.toContain('<img');
  });

  it('validates and allows only safe HTTP/HTTPS URLs', () => {
    expect(sanitizeURL('https://www.ftc.gov')).toBe('https://www.ftc.gov/');
    expect(sanitizeURL('http://example.com/law')).toBe('http://example.com/law');
    expect(sanitizeURL('javascript:alert(1)')).toBe('');
    expect(sanitizeURL('data:text/html,<script>alert(1)</script>')).toBe('');
  });

  it('checks standard ISO country codes', () => {
    expect(isValidCountryCode('US')).toBe(true);
    expect(isValidCountryCode('IND')).toBe(true);
    expect(isValidCountryCode('us')).toBe(false);
    expect(isValidCountryCode('12')).toBe(false);
  });

  it('verifies URL validity format', () => {
    expect(isValidURL('https://gov.in')).toBe(true);
    expect(isValidURL('not_a_valid_url')).toBe(false);
  });

  it('properly cleans country name input', () => {
    expect(sanitizeCountryName('  <script>evil()</script>Brazil  ')).toBe('evil()Brazil');
  });
});

