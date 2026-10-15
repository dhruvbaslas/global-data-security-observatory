/**
 * CountryFilter.jsx — Horizontal filter bar for countries.
 *
 * Upgraded with:
 * - Search input by country name, code, law, or authority
 * - Regulatory Archetype Filter (Omnibus GDPR, Sectoral, Localization, Hybrid)
 * - Quick filter pills for priority benchmark countries
 * - Full searchable select dropdown for all 197 sovereign nations
 * - Multilingual support
 */

import React from 'react';
import { LEGAL_ARCHETYPES } from '../utils/archetypes';
import { t } from '../utils/i18n';

// Priority benchmark countries displayed as quick access pills
const QUICK_PILL_CODES = ['US', 'IN', 'FR', 'GB', 'DE', 'JP', 'CN', 'BR', 'CA', 'AU', 'KR', 'SG'];

export default function CountryFilter({
  countries,
  selectedCountry,
  onSelectCountry,
  selectedArchetype,
  onSelectArchetype,
  searchQuery,
  onSearchChange,
  lang = 'en',
}) {
  const countryList = Object.values(countries);

  return (
    <div className="filter-section">
      <div className="filter-controls-row">
        {/* Live Search Input */}
        <div className="search-bar-container">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder={t(lang, 'searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search countries"
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Regulatory Archetype Dropdown Filter */}
        <div className="archetype-filter-wrap">
          <label htmlFor="archetype-select" className="sr-only">Regulatory Archetype</label>
          <select
            id="archetype-select"
            className="select-input archetype-select"
            value={selectedArchetype}
            onChange={(e) => onSelectArchetype(e.target.value)}
            aria-label="Filter by regulatory archetype"
          >
            {Object.values(LEGAL_ARCHETYPES).map((arch) => (
              <option key={arch.id} value={arch.id}>
                {arch.emoji} {t(lang, arch.labelKey, arch.id)}
              </option>
            ))}
          </select>
        </div>

        {/* Sovereign Nations Dropdown for fast 1-click jump to any UN country */}
        <div className="country-quick-select-wrap">
          <label htmlFor="sovereign-jump-select" className="sr-only">{t(lang, 'jumpToCountry')}</label>
          <select
            id="sovereign-jump-select"
            className="select-input sovereign-select"
            value={selectedCountry}
            onChange={(e) => onSelectCountry(e.target.value)}
            aria-label="Jump to sovereign country"
          >
            <option value="ALL">🌐 {t(lang, 'allNations')} ({countryList.length})</option>
            {countryList
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <option key={`opt-${c.code}`} value={c.code}>
                  {c.flag} {c.name} ({c.code})
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Quick-Access Filter Pills */}
      <div className="filter-pills" role="toolbar" aria-label="Quick country filters">
        <button
          className={`filter-pill ${selectedCountry === 'ALL' ? 'active' : ''}`}
          onClick={() => onSelectCountry('ALL')}
          aria-pressed={selectedCountry === 'ALL'}
        >
          <span className="pill-flag">🌐</span>
          <span className="pill-name">{t(lang, 'allNations')}</span>
          <span className="pill-badge">{countryList.length}</span>
        </button>

        {QUICK_PILL_CODES.map((code) => {
          const country = countries[code];
          if (!country) return null;
          return (
            <button
              key={country.code}
              className={`filter-pill ${selectedCountry === country.code ? 'active' : ''}`}
              onClick={() => onSelectCountry(country.code)}
              aria-pressed={selectedCountry === country.code}
            >
              <span className="pill-flag">{country.flag}</span>
              <span className="pill-name">{country.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
