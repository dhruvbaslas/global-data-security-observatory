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

import SearchableSelect from './SearchableSelect';

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

  const archetypeOptions = Object.values(LEGAL_ARCHETYPES).map((arch) => ({
    value: arch.id,
    label: t(lang, arch.labelKey, arch.id),
    icon: arch.emoji,
  }));

  const countryOptions = [
    { value: 'ALL', label: `${t(lang, 'allNations')} (${countryList.length})`, flag: '🌐' },
    ...countryList
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => ({
        value: c.code,
        label: c.name,
        sublabel: c.code,
        flag: c.flag,
      })),
  ];

  return (
    <div className="filter-section">
      {/* Unified Command & Filter Dock */}
      <div className="filter-command-bar">
        {/* Live Search Input */}
        <div className="search-bar-wrap">
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

        <div className="filter-select-group">
          {/* Regulatory Archetype Dropdown Filter */}
          <div className="archetype-filter-wrap">
            <SearchableSelect
              id="archetype-select"
              options={archetypeOptions}
              value={selectedArchetype}
              onChange={onSelectArchetype}
              placeholder="Archetype..."
              ariaLabel="Filter by regulatory archetype"
              className="archetype-select compact-select"
            />
          </div>

          {/* Sovereign Nations Dropdown for fast 1-click jump to any UN country */}
          <div className="country-quick-select-wrap">
            <SearchableSelect
              id="sovereign-jump-select"
              options={countryOptions}
              value={selectedCountry}
              onChange={onSelectCountry}
              placeholder="Jump to country..."
              ariaLabel="Jump to sovereign country"
              className="sovereign-select compact-select"
            />
          </div>
        </div>
      </div>

      {/* Quick-Access Filter Pills */}
      <div className="featured-pills-row">
        <span className="pills-lead-label">Featured:</span>
        <div className="filter-pills" role="toolbar" aria-label="Quick country filters">
          <button
            className={`filter-pill ${selectedCountry === 'ALL' ? 'active' : ''}`}
            onClick={() => onSelectCountry('ALL')}
            aria-pressed={selectedCountry === 'ALL'}
          >
            <span className="pill-flag">🌐</span>
            <span className="pill-name">{t(lang, 'allNations')}</span>
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
    </div>
  );
}
