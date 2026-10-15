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

        {/* Regulatory Archetype Dropdown Filter with Type-Search */}
        <div className="archetype-filter-wrap">
          <SearchableSelect
            id="archetype-select"
            options={archetypeOptions}
            value={selectedArchetype}
            onChange={onSelectArchetype}
            placeholder="Filter framework..."
            ariaLabel="Filter by regulatory archetype"
            className="archetype-select"
          />
        </div>

        {/* Sovereign Nations Dropdown with Fast Type-Search across all 197 UN countries */}
        <div className="country-quick-select-wrap">
          <SearchableSelect
            id="sovereign-jump-select"
            options={countryOptions}
            value={selectedCountry}
            onChange={onSelectCountry}
            placeholder="Type country name..."
            ariaLabel="Jump to sovereign country"
            className="sovereign-select"
          />
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
