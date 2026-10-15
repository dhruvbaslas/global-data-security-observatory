/**
 * Header.jsx — Application header with navigation, language selector, and branding.
 *
 * Renders:
 * - App title with shield icon
 * - Navigation tabs: Overview, Compare, Best Analysis
 * - Language Selector dropdown (en, fr, es, de, ja, zh, hi)
 * - "Privacy-First Architecture" modal button (Centered)
 * - "Add Country" button
 * - Mobile hamburger menu
 */

import { useState, useCallback } from 'react';
import DataSecurityNotice from './DataSecurityNotice';
import { SUPPORTED_LANGUAGES, t } from '../utils/i18n';

export default function Header({
  activeView,
  onViewChange,
  onAddCountry,
  generatedAt,
  lang = 'en',
  onLangChange,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NAV_TABS = [
    { id: 'overview', label: t(lang, 'overview'), icon: '🌍' },
    { id: 'comparison', label: t(lang, 'compare'), icon: '⚖️' },
    { id: 'bestOfBest', label: t(lang, 'bestAnalysis'), icon: '🏆' },
  ];

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const handleTabClick = useCallback(
    (viewId) => {
      onViewChange(viewId);
      setMobileMenuOpen(false);
    },
    [onViewChange]
  );

  const formattedDate = generatedAt
    ? new Date(generatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <header className="app-header" role="banner">
      {/* Branding Section */}
      <div className="header-brand">
        <div className="header-title-group">
          <span className="header-icon" aria-hidden="true">
            🛡️
          </span>
          <div>
            <h1 className="header-title">{t(lang, 'appTitle')}</h1>
            <p className="header-subtitle">{t(lang, 'appSubtitle')}</p>
          </div>
        </div>

        {/* Mobile hamburger button */}
        <button
          className="hamburger-btn"
          onClick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-controls="main-nav"
        >
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
        </button>
      </div>

      {/* Navigation Section */}
      <nav
        id="main-nav"
        className={`header-nav ${mobileMenuOpen ? 'nav-open' : ''}`}
        aria-label="Main navigation"
      >
        {/* Tab list */}
        <div className="nav-tabs" role="tablist" aria-label="View navigation">
          {NAV_TABS.map((tab, index) => (
            <button
              key={tab.id}
              role="tab"
              data-tab={tab.id}
              className={`nav-tab ${activeView === tab.id ? 'nav-tab-active' : ''}`}
              aria-selected={activeView === tab.id}
              tabIndex={activeView === tab.id ? 0 : -1}
              data-tab-index={index}
              onClick={() => handleTabClick(tab.id)}
            >
              <span className="nav-tab-icon" aria-hidden="true">
                {tab.icon}
              </span>
              <span className="nav-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Action buttons & Language Switcher */}
        <div className="header-actions">
          {/* Language Selector */}
          <div className="language-selector-wrap">
            <label htmlFor="language-select" className="sr-only">Language</label>
            <select
              id="language-select"
              className="select-input language-select"
              value={lang}
              onChange={(e) => onLangChange(e.target.value)}
              aria-label="Select Language"
            >
              {SUPPORTED_LANGUAGES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.flag} {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Privacy & Data Security Architecture badge (Centered Modal) */}
          <DataSecurityNotice lang={lang} />

          {/* Add Country button */}
          <button
            className="btn btn-primary header-add-btn btn-add-country"
            onClick={() => {
              onAddCountry();
              setMobileMenuOpen(false);
            }}
            aria-label="Add a new country"
          >
            <span aria-hidden="true">➕</span>
            <span>{t(lang, 'addCountry')}</span>
          </button>

          {/* Generated-at timestamp */}
          {formattedDate && (
            <span className="header-timestamp" title="Data last refreshed">
              <span aria-hidden="true">🕐</span>
              <span>{formattedDate}</span>
            </span>
          )}
        </div>
      </nav>
    </header>
  );
}
