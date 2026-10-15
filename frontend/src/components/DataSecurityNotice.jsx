/**
 * DataSecurityNotice.jsx — Transparency and data privacy principles of this observatory.
 *
 * Demonstrates how this application itself adheres to privacy-by-design:
 * 1. Zero Tracking & No Third-Party Analytics
 * 2. Client-Side Only Storage (Isolated localStorage, never transmitted)
 * 3. Strict Content Security Policy (CSP nosniff, no unsafe-eval)
 * 4. Rel-noopener and strict origin isolation on all official links
 * 5. Input Sanitization & Anti-XSS encoding on all inputs
 *
 * Sits in the center of the window with fixed coordinates and responsive max bounds.
 */

import React, { useState, useEffect } from 'react';
import { t } from '../utils/i18n';

export default function DataSecurityNotice({ lang = 'en' }) {
  const [isOpen, setIsOpen] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <button
        className="security-badge-btn"
        onClick={() => setIsOpen(true)}
        aria-label="View Data Security & Privacy Safeguards"
        title="Application Data Security Safeguards"
      >
        <span className="shield-icon" aria-hidden="true">🔒</span>
        <span>{t(lang, 'privacyFirst', 'Privacy-First Architecture')}</span>
      </button>

      {isOpen && (
        <div
          className="modal-backdrop-centered"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-box-centered security-modal-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-header-title-group">
                <span className="modal-icon-badge" aria-hidden="true">🔒</span>
                <div>
                  <h3>Data Security & Privacy Safeguards</h3>
                  <p className="modal-subheading">ISO/IEC 27701 & GDPR Article 25 Architectural Alignment</p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <p className="modal-intro">
              As an observatory assessing sovereign privacy frameworks, this application embodies the principle of <strong>Privacy by Design (PbD)</strong>.
            </p>

            <div className="security-safeguards-list">
              <div className="safeguard-card">
                <div className="safeguard-icon" aria-hidden="true">🛡️</div>
                <div className="safeguard-text">
                  <strong>Zero User Profiling & No Cookies</strong>
                  <p>No analytics trackers, third-party cookies, tracking pixels, or fingerprinting scripts are loaded on this application.</p>
                </div>
              </div>

              <div className="safeguard-card">
                <div className="safeguard-icon" aria-hidden="true">💻</div>
                <div className="safeguard-text">
                  <strong>Local-First Client Sandbox</strong>
                  <p>When you dynamically add countries, your inputs are validated and saved strictly inside your browser's private sandbox (<code>localStorage</code>) and are never transmitted to external servers.</p>
                </div>
              </div>

              <div className="safeguard-card">
                <div className="safeguard-icon" aria-hidden="true">🔐</div>
                <div className="safeguard-text">
                  <strong>Defensive Sanitization & XSS Mitigation</strong>
                  <p>All user inputs are aggressively sanitized via DOM-stripping and HTML entity encoding. External links enforce <code>rel="noopener noreferrer"</code> to protect against tabnabbing attacks.</p>
                </div>
              </div>

              <div className="safeguard-card">
                <div className="safeguard-icon" aria-hidden="true">📜</div>
                <div className="safeguard-text">
                  <strong>Content Security Policy (CSP)</strong>
                  <p>Hardened HTTP headers prevent execution of unauthorized scripts, frames, and cross-site injections.</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setIsOpen(false)}>
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
