/**
 * ComparisonView.jsx — Side-by-side country data security comparison tool.
 *
 * Upgraded features:
 * - Cross-Border Data Transfer Adequacy Matrix (Evaluates GDPR, SCCs, BCRs)
 * - Social Media Snapshot & Story Card Generator (Twitter/X, WhatsApp, Instagram, Facebook, LinkedIn)
 * - Head-to-Head parameter scoring with pure SVG radar
 * - Export textual comparison report
 */

import React, { useState, useRef } from 'react';
import {
  PARAMETER_KEYS,
  compareCountries,
  calculateOverallScore,
  getParameterLabel,
  getScoreColor,
} from '../utils/analysis';
import { evaluateAdequacy, has72hBreachNotification } from '../utils/archetypes';
import { t } from '../utils/i18n';
import ParameterRadar from './ParameterRadar';

export default function ComparisonView({
  countries,
  initialCountryA = 'US',
  initialCountryB = 'FR',
  lang = 'en',
}) {
  const countryList = Object.values(countries);

  const [codeA, setCodeA] = useState(initialCountryA);
  const [codeB, setCodeB] = useState(initialCountryB);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const countryA = countries[codeA] || countryList[0] || null;
  const countryB = countries[codeB] || countryList[1] || countryList[0] || null;

  const comparison = countryA && countryB ? compareCountries(countryA, countryB) : null;
  const adequacyResult = countryA && countryB ? evaluateAdequacy(countryA.code, countryB.code) : null;

  const scoreA = countryA ? calculateOverallScore(countryA.scores) : 0;
  const scoreB = countryB ? calculateOverallScore(countryB.scores) : 0;

  // Generate plain text report
  const handleExportText = () => {
    if (!countryA || !countryB || !comparison) return;

    let text = `========================================================\n`;
    text += `DATA SECURITY COMPARISON: ${countryA.name} vs ${countryB.name}\n`;
    text += `========================================================\n\n`;
    text += `Overall Score:\n`;
    text += `  • ${countryA.name}: ${scoreA}/10\n`;
    text += `  • ${countryB.name}: ${scoreB}/10\n`;
    text += `  • Overall Winner: ${comparison.overall.winner === 'tie' ? 'Tie' : comparison.overall.winner === 'A' ? countryA.name : countryB.name}\n\n`;
    text += `Cross-Border Data Transfer Status:\n`;
    text += `  • ${adequacyResult?.badge}: ${adequacyResult?.text}\n\n`;
    text += `Parameter Breakdown:\n`;

    PARAMETER_KEYS.forEach((key) => {
      const p = comparison.parameters[key];
      const winLabel = p.winner === 'tie' ? 'Tie' : p.winner === 'A' ? countryA.name : countryB.name;
      text += `  - ${p.label}:\n`;
      text += `      ${countryA.name}: ${p.scoreA}/10 | ${countryB.name}: ${p.scoreB}/10 -> Leader: ${winLabel}\n`;
    });

    text += `\nExplore live: Global Data Security Observatory`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Social share triggers
  const getShareText = () => {
    const winnerName = comparison.overall.winner === 'A' ? countryA.name : countryB.name;
    return `Comparing Data Security Policies: ${countryA.flag} ${countryA.name} (${scoreA}/10) vs ${countryB.flag} ${countryB.name} (${scoreB}/10). Leader: ${winnerName}! Check the benchmark:`;
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${getShareText()} ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="comparison-section comparison-view">
      <div className="section-header">
        <h2>⚖️ {t(lang, 'headToHead')}</h2>
        <p>{t(lang, 'selectCountries')}</p>
      </div>

      {/* Selectors Bar */}
      <div className="selectors-bar">
        <div className="country-selector">
          <label htmlFor="country-a-select">{t(lang, 'countryA')}:</label>
          <select
            id="country-a-select"
            value={codeA}
            onChange={(e) => setCodeA(e.target.value)}
            className="select-input"
          >
            {countryList
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <option key={`a-${c.code}`} value={c.code}>
                  {c.flag} {c.name} ({c.code})
                </option>
              ))}
          </select>
        </div>

        <button
          type="button"
          className="vs-badge swap-btn"
          onClick={() => {
            const temp = codeA;
            setCodeA(codeB);
            setCodeB(temp);
          }}
          title="Swap countries"
          aria-label="Swap Country A and Country B"
        >
          ⇄ VS
        </button>

        <div className="country-selector">
          <label htmlFor="country-b-select">{t(lang, 'countryB')}:</label>
          <select
            id="country-b-select"
            value={codeB}
            onChange={(e) => setCodeB(e.target.value)}
            className="select-input"
          >
            {countryList
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <option key={`b-${c.code}`} value={c.code}>
                  {c.flag} {c.name} ({c.code})
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Comparison Grid */}
      {countryA && countryB && comparison && (
        <div className="comparison-content">
          {/* Summary Banner */}
          <div className="comparison-summary-card">
            <div className="team-header team-a">
              <span className="summary-flag">{countryA.flag}</span>
              <h3>{countryA.name}</h3>
              <div className="summary-score" style={{ color: getScoreColor(scoreA) }}>
                {scoreA} <small>/10</small>
              </div>
              <div className="summary-breach-badge">
                {has72hBreachNotification(countryA.code) ? '⏱️ 72h Breach Mandate' : '📋 Sectoral Reporting'}
              </div>
            </div>

            <div className="winner-declaration">
              {comparison.overall.winner === 'tie' ? (
                <div className="badge-tie">⚖️ {t(lang, 'tie')}</div>
              ) : (
                <div className="badge-winner">
                  🏆 {t(lang, 'overallLeader')}:{' '}
                  <strong>
                    {comparison.overall.winner === 'A' ? countryA.name : countryB.name}
                  </strong>{' '}
                  (+{Math.abs(comparison.overall.diff)} pts)
                </div>
              )}
              <div className="win-counts">
                <span>{countryA.name}: {comparison.overall.winsA} wins</span>
                <span>•</span>
                <span>{countryB.name}: {comparison.overall.winsB} wins</span>
                {comparison.overall.ties > 0 && <span>• {comparison.overall.ties} ties</span>}
              </div>
            </div>

            <div className="team-header team-b">
              <span className="summary-flag">{countryB.flag}</span>
              <h3>{countryB.name}</h3>
              <div className="summary-score" style={{ color: getScoreColor(scoreB) }}>
                {scoreB} <small>/10</small>
              </div>
              <div className="summary-breach-badge">
                {has72hBreachNotification(countryB.code) ? '⏱️ 72h Breach Mandate' : '📋 Sectoral Reporting'}
              </div>
            </div>
          </div>

          {/* Cross-Border Data Transfer Adequacy Matrix */}
          {adequacyResult && (
            <div className="adequacy-matrix-card">
              <div className="adequacy-header">
                <span className="matrix-icon">🔀</span>
                <div>
                  <h4>Cross-Border Data Transfer & Adequacy Protocol</h4>
                  <p className="adequacy-subtitle">
                    Legal interoperability for cross-border data transfer between {countryA.name} and {countryB.name}
                  </p>
                </div>
                <span className="adequacy-badge" style={{ backgroundColor: adequacyResult.color, color: '#fff' }}>
                  {adequacyResult.badge}
                </span>
              </div>
              <p className="adequacy-text">{adequacyResult.text}</p>
            </div>
          )}

          {/* Visual Dual Radar Section */}
          <div className="radar-comparison-wrapper">
            <h3>{t(lang, 'visualMap')}</h3>
            <ParameterRadar countryA={countryA} countryB={countryB} size={390} />
          </div>

          {/* Detailed Parameter Table */}
          <div className="table-responsive">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>{t(lang, 'parameter')}</th>
                  <th style={{ width: '30%' }}>{countryA.flag} {countryA.name}</th>
                  <th style={{ width: '15%' }}>{t(lang, 'leader')}</th>
                  <th style={{ width: '30%' }}>{countryB.flag} {countryB.name}</th>
                </tr>
              </thead>
              <tbody>
                {PARAMETER_KEYS.map((key) => {
                  const p = comparison.parameters[key];
                  const descA = countryA.details ? countryA.details[key] : '';
                  const descB = countryB.details ? countryB.details[key] : '';

                  return (
                    <tr key={key} className={p.winner === 'A' ? 'row-win-a' : p.winner === 'B' ? 'row-win-b' : ''}>
                      <td className="param-cell">
                        <strong>{p.label}</strong>
                      </td>
                      <td>
                        <div className="cell-score" style={{ color: getScoreColor(p.scoreA) }}>
                          {p.scoreA}/10
                        </div>
                        <div className="cell-desc">{descA}</div>
                      </td>
                      <td className="winner-cell">
                        {p.winner === 'A' && <span className="winner-tag tag-a">{countryA.flag} {countryA.code}</span>}
                        {p.winner === 'B' && <span className="winner-tag tag-b">{countryB.flag} {countryB.code}</span>}
                        {p.winner === 'tie' && <span className="winner-tag tag-tie">Tie</span>}
                      </td>
                      <td>
                        <div className="cell-score" style={{ color: getScoreColor(p.scoreB) }}>
                          {p.scoreB}/10
                        </div>
                        <div className="cell-desc">{descB}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Export & Social Share Actions */}
          <div className="comparison-footer-actions">
            <button className="btn btn-outline btn-copy-report" onClick={handleExportText}>
              {copied ? `✅ ${t(lang, 'copiedSuccess')}` : `📋 ${t(lang, 'copyReport')}`}
            </button>
            <button className="btn btn-primary btn-share-snapshot" onClick={() => setShowShareModal(true)}>
              📱 {t(lang, 'shareSnapshot')}
            </button>
          </div>

          {/* Social Share Modal Card for Stories/Posts */}
          {showShareModal && (
            <div className="modal-backdrop-centered" onClick={() => setShowShareModal(false)}>
              <div className="modal-box-centered share-snapshot-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>📱 Share Comparison Snapshot</h3>
                  <button className="modal-close-btn" onClick={() => setShowShareModal(false)}>✕</button>
                </div>

                <div className="social-story-card">
                  <div className="story-card-header">
                    <span className="story-brand">🛡️ Global Data Security Observatory</span>
                    <span className="story-tag">HEAD-TO-HEAD</span>
                  </div>

                  <div className="story-vs-row">
                    <div className="story-country">
                      <span className="story-flag">{countryA.flag}</span>
                      <h4>{countryA.name}</h4>
                      <span className="story-score" style={{ color: getScoreColor(scoreA) }}>{scoreA}/10</span>
                    </div>

                    <div className="story-vs-pill">VS</div>

                    <div className="story-country">
                      <span className="story-flag">{countryB.flag}</span>
                      <h4>{countryB.name}</h4>
                      <span className="story-score" style={{ color: getScoreColor(scoreB) }}>{scoreB}/10</span>
                    </div>
                  </div>

                  <div className="story-lead-badge">
                    🏆 Overall Leader: <strong>{comparison.overall.winner === 'A' ? countryA.name : countryB.name}</strong>
                  </div>

                  <div className="story-radar-mini">
                    <ParameterRadar countryA={countryA} countryB={countryB} size={260} />
                  </div>
                </div>

                <div className="social-share-buttons">
                  <button className="btn-social btn-twitter" onClick={shareToTwitter}>
                    Share on X / Twitter
                  </button>
                  <button className="btn-social btn-whatsapp" onClick={shareToWhatsApp}>
                    WhatsApp Post/Story
                  </button>
                  <button className="btn-social btn-linkedin" onClick={shareToLinkedIn}>
                    LinkedIn Update
                  </button>
                  <button className="btn-social btn-copy" onClick={handleExportText}>
                    📋 Copy Text Snippet
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
