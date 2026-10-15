/**
 * AddCountry.jsx — Modal for dynamically adding new countries with official URLs.
 *
 * Implements requirement:
 * - Dynamic Expansion: Add an option for users to input a new country name and official website link.
 * - Secure input sanitization (XSS and URL scheme validation).
 * - Automatic incorporation into the dataset and active session.
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  sanitizeCountryName,
  sanitizeURL,
  isValidCountryCode,
  isValidURL,
} from '../utils/sanitize';

export default function AddCountry({ isOpen, onClose, onAddCountry }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [url, setUrl] = useState('');
  const [flag, setFlag] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const cleanName = sanitizeCountryName(name);
    const cleanCode = code.trim().toUpperCase();
    const cleanUrl = url.trim();

    // Validation
    if (!cleanName) {
      setError('Please provide a valid country name.');
      return;
    }

    if (!isValidCountryCode(cleanCode)) {
      setError('Country code must be 2 to 3 uppercase letters (e.g. DE, AUS, BR).');
      return;
    }

    if (!cleanUrl || !isValidURL(cleanUrl)) {
      setError('Please provide a valid official website URL starting with https:// or http://');
      return;
    }

    const sanitizedUrl = sanitizeURL(cleanUrl);

    // Call hook callback
    const res = onAddCountry({
      code: cleanCode,
      name: cleanName,
      flag: flag.trim() || '🌐',
      authority_url: sanitizedUrl,
    });

    if (!res.success) {
      setError(res.error || 'Failed to add country.');
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      setName('');
      setCode('');
      setUrl('');
      setFlag('');
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return typeof document !== 'undefined'
    ? createPortal(
        <div className="modal-backdrop modal-backdrop-centered" onClick={onClose} role="dialog" aria-modal="true">
          <div className="modal-box modal-box-centered add-country-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Dynamic Country Expansion</h3>
              <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">✕</button>
            </div>

            <p className="modal-intro">
              Expand the global dataset by registering a new sovereign nation and its official data privacy authority website.
            </p>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">✅ Country added successfully into dataset!</div>}

            <form onSubmit={handleSubmit} className="modal-form" noValidate>
              <div className="form-group">
                <label htmlFor="country-name-input">Country Name *</label>
                <input
                  id="country-name-input"
                  type="text"
                  placeholder="e.g. Germany, Australia, Brazil"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={80}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="country-code-input">ISO Alpha Code (2-3 letters) *</label>
                  <input
                    id="country-code-input"
                    type="text"
                    placeholder="e.g. DE, AU, BR"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                    maxLength={3}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="country-flag-input">Flag Emoji (optional)</label>
                  <input
                    id="country-flag-input"
                    type="text"
                    placeholder="e.g. 🇩🇪, 🇦🇺"
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="country-url-input">Official Government Portal URL *</label>
                <input
                  id="country-url-input"
                  type="url"
                  placeholder="https://www.bfdi.bund.de/"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                <small className="form-help">Only secured http:// or https:// government authorities are permitted.</small>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-submit">
                  Add to Dataset
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )
    : null;
}

