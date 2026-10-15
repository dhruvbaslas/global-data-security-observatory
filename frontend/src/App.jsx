/**
 * App.jsx — Primary Single Page Application component.
 *
 * Coordinates:
 * - Country Data fetching via custom hook useCountryData
 * - Top header with navigation tabs, language switcher and dynamic country add trigger
 * - Active view rendering:
 *     1. Overview: Country filter, archetype categorization, live search, and paginated cards
 *     2. Comparison: Head-to-head parameter comparator, adequacy matrix, social sharing
 *     3. Best of Best: Policy ranking with Champion (1st) and Runner-up (2nd) for all dimensions
 * - Modal dialog for adding new countries
 */

import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import CountryFilter from './components/CountryFilter';
import CountryCard from './components/CountryCard';
import ComparisonView from './components/ComparisonView';
import BestOfBest from './components/BestOfBest';
import AddCountry from './components/AddCountry';
import { useCountryData } from './hooks/useCountryData';
import { getCountryArchetype } from './utils/archetypes';
import { t } from './utils/i18n';
import './App.css';

export default function App() {
  const {
    countries,
    analysis,
    loading,
    error,
    addCountry,
    removeCountry,
    userCountryCodes,
    generatedAt,
  } = useCountryData();

  // Active navigation view: 'overview' | 'comparison' | 'bestOfBest'
  const [activeView, setActiveView] = useState('overview');

  // Country filter in Overview: 'ALL' or country code
  const [selectedCountry, setSelectedCountry] = useState('ALL');

  // Legal archetype filter: 'ALL' | 'OMNIBUS' | 'SECTORAL' | 'LOCALIZATION' | 'HYBRID'
  const [selectedArchetype, setSelectedArchetype] = useState('ALL');

  // Live search query string
  const [searchQuery, setSearchQuery] = useState('');

  // Number of cards displayed in overview grid
  const [visibleCount, setVisibleCount] = useState(18);

  // Active UI localization language (en, fr, es, de, ja, zh, hi)
  const [lang, setLang] = useState('en');

  // Pre-selected compare pair when navigating from card
  const [comparePair, setComparePair] = useState({ a: 'US', b: 'FR' });

  // Add Country modal visibility
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Deep linking: Initial URL search param ingestion
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'compare' || tab === 'comparison') {
        setActiveView('comparison');
        const a = params.get('a');
        const b = params.get('b');
        if (a || b) {
          setComparePair({ a: a || 'US', b: b || 'FR' });
        }
      } else if (tab === 'bestOfBest' || tab === 'rankings') {
        setActiveView('bestOfBest');
      }
      const q = params.get('q');
      if (q) setSearchQuery(q);
      const country = params.get('country');
      if (country) setSelectedCountry(country);
    } catch (_) {}
  }, []);

  // Synchronize URL search params with active state
  useEffect(() => {
    try {
      const params = new URLSearchParams();
      if (activeView === 'comparison') {
        params.set('tab', 'compare');
        if (comparePair.a) params.set('a', comparePair.a);
        if (comparePair.b) params.set('b', comparePair.b);
      } else if (activeView === 'bestOfBest') {
        params.set('tab', 'bestOfBest');
      } else {
        if (selectedCountry !== 'ALL') params.set('country', selectedCountry);
        if (searchQuery.trim()) params.set('q', searchQuery.trim());
      }
      const searchStr = params.toString();
      const newUrl = `${window.location.pathname}${searchStr ? '?' + searchStr : ''}`;
      window.history.replaceState(null, '', newUrl);
    } catch (_) {}
  }, [activeView, comparePair, selectedCountry, searchQuery]);

  // Transition from a country card directly to comparison
  const handleCompareWith = (code) => {
    setComparePair((prev) => ({
      a: code,
      b: prev.a === code ? (code === 'FR' ? 'US' : 'FR') : prev.a,
    }));
    setActiveView('comparison');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered country list for Overview
  const filteredCountries = useMemo(() => {
    return Object.values(countries).filter((c) => {
      // 1. Filter by country pill or jump select
      if (selectedCountry !== 'ALL' && c.code !== selectedCountry) {
        return false;
      }
      // 2. Filter by legal archetype
      if (selectedArchetype !== 'ALL') {
        const arch = getCountryArchetype(c.code);
        if (arch !== selectedArchetype) return false;
      }
      // 3. Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = c.name?.toLowerCase().includes(q);
        const inCode = c.code?.toLowerCase().includes(q);
        const inSummary = c.summary?.toLowerCase().includes(q);
        const inLaws = c.key_laws?.some((law) => law.toLowerCase().includes(q));
        const inAuthority = c.authority?.toLowerCase().includes(q);
        return inName || inCode || inSummary || inLaws || inAuthority;
      }
      return true;
    });
  }, [countries, selectedCountry, selectedArchetype, searchQuery]);

  return (
    <div className="app-layout">
      <Header
        activeView={activeView}
        onViewChange={setActiveView}
        onAddCountry={() => setIsAddModalOpen(true)}
        generatedAt={generatedAt}
        lang={lang}
        onLangChange={setLang}
      />

      <main className="main-content" id="main-content">
        {loading && (
          <div className="state-card loading-card">
            <div className="spinner" />
            <p>Loading authoritative global data security policies across 197 sovereign nations...</p>
          </div>
        )}

        {error && !loading && (
          <div className="state-card error-card">
            <span className="error-icon">⚠️</span>
            <h3>Data Fetch Error</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* VIEW 1: Country Overviews */}
            {activeView === 'overview' && (
              <section className="overview-view">
                <div className="hero-banner">
                  <div className="hero-pill-badge">
                    <span className="live-status-dot" aria-hidden="true"></span>
                    <span>GLOBAL PRIVACY & DATA SOVEREIGNTY OBSERVATORY</span>
                  </div>
                  <h2 className="hero-title">Sovereign Data Protection Portfolios</h2>
                  <p className="hero-description">
                    Authoritative regulatory telemetry and policy benchmarking spanning all 197 sovereign United Nations economies.
                    Harmonized across statutory coverage, enforcement penalties, transparency, and cross-border adequacy.
                  </p>

                  <div className="global-stats-ribbon" role="region" aria-label="Global observatory statistics">
                    <div className="stat-card">
                      <span className="stat-value">{Object.keys(countries).length || 197}</span>
                      <span className="stat-label">Sovereign Nations</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">5</span>
                      <span className="stat-label">Security Dimensions</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">GDPR Art. 45</span>
                      <span className="stat-label">Transfer Adequacy</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">Zero-Trust</span>
                      <span className="stat-label">Client Sandbox</span>
                    </div>
                  </div>
                </div>

                <CountryFilter
                  countries={countries}
                  selectedCountry={selectedCountry}
                  onSelectCountry={(code) => {
                    setSelectedCountry(code);
                    setVisibleCount(18);
                  }}
                  selectedArchetype={selectedArchetype}
                  onSelectArchetype={(arch) => {
                    setSelectedArchetype(arch);
                    setVisibleCount(18);
                  }}
                  searchQuery={searchQuery}
                  onSearchChange={(q) => {
                    setSearchQuery(q);
                    setVisibleCount(18);
                  }}
                  lang={lang}
                />

                <div className="results-count-banner">
                  <span>
                    Showing <strong>{Math.min(filteredCountries.length, visibleCount)}</strong> of <strong>{filteredCountries.length}</strong> sovereign nations
                  </span>
                  {(selectedCountry !== 'ALL' || selectedArchetype !== 'ALL' || searchQuery) && (
                    <button
                      className="btn-link"
                      onClick={() => {
                        setSelectedCountry('ALL');
                        setSelectedArchetype('ALL');
                        setSearchQuery('');
                      }}
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>

                <div className="cards-grid">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.slice(0, visibleCount).map((c) => (
                      <CountryCard
                        key={c.code}
                        country={c}
                        isUserAdded={userCountryCodes.has(c.code)}
                        onRemove={removeCountry}
                        onCompareWith={handleCompareWith}
                        lang={lang}
                      />
                    ))
                  ) : (
                    <div className="no-results-box">
                      <p>No matching countries or regulations found for your active filters.</p>
                      <button
                        className="btn btn-outline"
                        onClick={() => {
                          setSelectedCountry('ALL');
                          setSelectedArchetype('ALL');
                          setSearchQuery('');
                        }}
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>

                {filteredCountries.length > visibleCount && (
                  <div className="load-more-container">
                    <button
                      className="btn btn-primary load-more-btn"
                      onClick={() => setVisibleCount((prev) => prev + 24)}
                    >
                      Load More Nations ({filteredCountries.length - visibleCount} remaining)
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => setVisibleCount(filteredCountries.length)}
                    >
                      Show All ({filteredCountries.length})
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* VIEW 2: Comparison Tool */}
            {activeView === 'comparison' && (
              <ComparisonView
                countries={countries}
                initialCountryA={comparePair.a}
                initialCountryB={comparePair.b}
                lang={lang}
              />
            )}

            {/* VIEW 3: Best of Best Benchmark */}
            {activeView === 'bestOfBest' && (
              <BestOfBest countries={countries} analysis={analysis} lang={lang} />
            )}
          </>
        )}
      </main>

      <AddCountry
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCountry={addCountry}
      />

      <footer className="app-footer">
        <div className="footer-content">
          <p>
            🛡️ <strong>Global Data Security Observatory</strong> — Comprehensive data protection intelligence covering all 197 UN sovereign nations.
          </p>
          <p className="footer-disclaimer">
            Disclaimer: For informational and research purposes only. Not official legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
