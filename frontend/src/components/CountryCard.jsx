/**
 * CountryCard.jsx — Card displaying single country data security profile.
 *
 * Highlights:
 * - Country flag, name, archetype badge & breach notification timeframe
 * - Overall calculated composite score badge
 * - Authority name & external link
 * - Key laws tags
 * - Interactive score breakdown progress bars
 * - Expandable details section with granular explanations
 * - Option to delete if user-added
 */

import React, { useState } from 'react';
import {
  PARAMETER_KEYS,
  calculateOverallScore,
  getParameterLabel,
  getScoreColor,
  getScoreLabel,
} from '../utils/analysis';
import { getCountryArchetype, has72hBreachNotification } from '../utils/archetypes';
import { t } from '../utils/i18n';
import ParameterRadar from './ParameterRadar';

export default function CountryCard({
  country,
  isUserAdded = false,
  onRemove = null,
  onCompareWith = null,
  lang = 'en',
}) {
  const [expanded, setExpanded] = useState(false);
  const [showRadar, setShowRadar] = useState(false);

  const overallScore = calculateOverallScore(country.scores);
  const scoreColor = getScoreColor(overallScore);
  const archetype = getCountryArchetype(country.code);
  const is72h = has72hBreachNotification(country.code);

  return (
    <article className="country-card" aria-labelledby={`title-${country.code}`}>
      <div className="card-header">
        <div className="country-identity">
          <span className="country-flag" role="img" aria-label={country.name}>
            {country.flag}
          </span>
          <div>
            <h3 id={`title-${country.code}`} className="country-name">
              {country.name}
              {isUserAdded && <span className="user-added-tag">{t(lang, 'userAdded')}</span>}
            </h3>
            <div className="country-badges-row">
              <span className="country-code-pill">{country.code}</span>
              <span className={`archetype-badge arch-${archetype.toLowerCase()}`}>
                {archetype === 'OMNIBUS' ? '🇪🇺 GDPR Omnibus' : archetype === 'LOCALIZATION' ? '🛡️ Sovereign / Local' : archetype === 'SECTORAL' ? '🇺🇸 Sectoral' : '⚖️ Modern Framework'}
              </span>
              {is72h && (
                <span className="breach-pill" title="Mandatory breach notification within 72 hours">
                  ⏱️ 72h Breach
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="overall-score-badge" style={{ borderColor: scoreColor }}>
          <span className="score-num" style={{ color: scoreColor }}>{overallScore}</span>
          <span className="score-denom">/10</span>
          <span className="score-quality-label">{getScoreLabel(overallScore)}</span>
        </div>
      </div>

      <p className="country-summary">{country.summary}</p>

      {/* Authority info */}
      <div className="authority-meta">
        <span className="meta-label">{t(lang, 'authority')}:</span>
        {country.authority_url ? (
          <a
            href={country.authority_url}
            target="_blank"
            rel="noopener noreferrer"
            className="authority-link"
          >
            {country.authority || 'Official Portal'} ↗
          </a>
        ) : (
          <span className="authority-text">{country.authority || 'Not Specified'}</span>
        )}
      </div>

      {/* Key Laws badges */}
      {country.key_laws && country.key_laws.length > 0 && (
        <div className="key-laws-container">
          <span className="meta-label">{t(lang, 'keyRegulations')}:</span>
          <div className="law-tags">
            {country.key_laws.map((law, idx) => (
              <span key={idx} className="law-tag">
                {law}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Parameter Score Bars */}
      <div className="parameters-list">
        {PARAMETER_KEYS.map((key) => {
          const score = country.scores ? country.scores[key] || 0 : 0;
          const barColor = getScoreColor(score);
          return (
            <div key={key} className="param-item">
              <div className="param-label-row">
                <span className="param-label">{getParameterLabel(key)}</span>
                <span className="param-score" style={{ color: barColor }}>
                  {score}/10
                </span>
              </div>
              <div className="progress-track" role="progressbar" aria-valuenow={score} aria-valuemin="0" aria-valuemax="10">
                <div
                  className="progress-fill"
                  style={{
                    width: `${score * 10}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable deep dive */}
      {expanded && (
        <div className="expanded-details">
          <h4>Parameter In-Depth Analysis</h4>
          {country.details &&
            PARAMETER_KEYS.map((key) => (
              <div key={key} className="detail-entry">
                <strong>{getParameterLabel(key)}: </strong>
                <span>{country.details[key] || 'Detailed analysis pending.'}</span>
              </div>
            ))}
        </div>
      )}

      {/* Radar view modal toggle */}
      {showRadar && (
        <div className="modal-backdrop-centered" onClick={() => setShowRadar(false)}>
          <div className="modal-box-centered radar-modal-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{country.flag} {country.name} — Security Radar</h3>
              <button className="modal-close-btn" onClick={() => setShowRadar(false)}>✕</button>
            </div>
            <ParameterRadar countryA={country} size={340} />
          </div>
        </div>
      )}

      {/* Card actions */}
      <div className="card-actions">
        <button
          className="btn btn-outline btn-details"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? `▲ ${t(lang, 'hideDetails')}` : `▼ ${t(lang, 'details')}`}
        </button>

        <button
          className="btn btn-outline btn-radar-modal"
          onClick={() => setShowRadar(true)}
        >
          🕸️ {t(lang, 'radar')}
        </button>

        {onCompareWith && (
          <button
            className="btn btn-secondary btn-compare-action"
            onClick={() => onCompareWith(country.code)}
          >
            ⚖️ {t(lang, 'compareWith')}
          </button>
        )}

        {isUserAdded && onRemove && (
          <button
            className="btn btn-danger-outline"
            onClick={() => onRemove(country.code)}
            aria-label={`Remove ${country.name}`}
          >
            🗑️ {t(lang, 'remove')}
          </button>
        )}
      </div>
    </article>
  );
}
