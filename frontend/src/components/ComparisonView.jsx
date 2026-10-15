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
import { createPortal } from 'react-dom';
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
import SearchableSelect from './SearchableSelect';

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
  const [downloadingImg, setDownloadingImg] = useState(false);

  const countryA = countries[codeA] || countryList[0] || null;
  const countryB = countries[codeB] || countryList[1] || countryList[0] || null;

  const comparison = countryA && countryB ? compareCountries(countryA, countryB) : null;
  const adequacyResult = countryA && countryB ? evaluateAdequacy(countryA.code, countryB.code) : null;

  const scoreA = countryA ? calculateOverallScore(countryA.scores) : 0;
  const scoreB = countryB ? calculateOverallScore(countryB.scores) : 0;

  const countryOptions = countryList
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({
      value: c.code,
      label: c.name,
      sublabel: c.code,
      flag: c.flag,
    }));

  // Download high-res 1200x630 graphic card for social media posting
  const downloadCardImage = () => {
    if (!countryA || !countryB || !comparison) return;
    try {
      setDownloadingImg(true);
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext('2d');

      // 1. Cybersecurity dark background
      const grad = ctx.createLinearGradient(0, 0, 1200, 630);
      grad.addColorStop(0, '#030712');
      grad.addColorStop(0.5, '#0b1329');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 630);

      // Glowing border
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.strokeRect(12, 12, 1176, 606);

      // Top branding
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 24px system-ui, -apple-system, sans-serif';
      ctx.fillText('🛡️ GLOBAL DATA SECURITY OBSERVATORY', 60, 70);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('SOVEREIGN BENCHMARK', 1140, 70);
      ctx.textAlign = 'left';

      // Divider line
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, 95);
      ctx.lineTo(1140, 95);
      ctx.stroke();

      // Country A side (Left)
      ctx.fillStyle = '#ffffff';
      ctx.font = '80px system-ui';
      ctx.fillText(countryA.flag || '🌐', 140, 210);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 36px system-ui, -apple-system, sans-serif';
      ctx.fillText(countryA.name, 140, 275);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '800 48px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${scoreA} / 10`, 140, 340);

      // VS badge (Center)
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(600, 255, 48, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '800 30px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('VS', 600, 266);
      ctx.textAlign = 'left';

      // Country B side (Right)
      ctx.fillStyle = '#ffffff';
      ctx.font = '80px system-ui';
      ctx.fillText(countryB.flag || '🌐', 760, 210);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 36px system-ui, -apple-system, sans-serif';
      ctx.fillText(countryB.name, 760, 275);

      ctx.fillStyle = '#f43f5e';
      ctx.font = '800 48px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${scoreB} / 10`, 760, 340);

      // Outcome Banner
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.fillRect(140, 395, 920, 60);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(140, 395, 920, 60);

      ctx.fillStyle = '#34d399';
      ctx.font = '700 24px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      const outcomeText =
        scoreA > scoreB
          ? `🏆 ${countryA.name} leads overall (+${(scoreA - scoreB).toFixed(1)} pts advantage)`
          : scoreB > scoreA
          ? `🏆 ${countryB.name} leads overall (+${(scoreB - scoreA).toFixed(1)} pts advantage)`
          : '🤝 Benchmark Parity: Both jurisdictions scored equally';
      ctx.fillText(outcomeText, 600, 434);

      // Cross-Border Transfer Status
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 20px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        `Cross-Border Transfer: ${adequacyResult?.status || 'Assessed'} (${adequacyResult?.badge || 'SCC / BCR'})`,
        600,
        500
      );
      ctx.fillText('Observatory covers all 197 sovereign UN nations', 600, 540);
      ctx.textAlign = 'left';

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `data-security-${countryA.code}-vs-${countryB.code}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      setDownloadingImg(false);
    }
  };

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

      {/* Selectors Bar with Type-Search across all 197 countries */}
      <div className="selectors-bar">
        <div className="country-selector">
          <label id="country-a-label">{t(lang, 'countryA')}:</label>
          <SearchableSelect
            id="country-a-select"
            options={countryOptions}
            value={codeA}
            onChange={setCodeA}
            placeholder="Type country A..."
            ariaLabel="Select Country A"
            className="country-a-select"
          />
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
          <label id="country-b-label">{t(lang, 'countryB')}:</label>
          <SearchableSelect
            id="country-b-select"
            options={countryOptions}
            value={codeB}
            onChange={setCodeB}
            placeholder="Type country B..."
            ariaLabel="Select Country B"
            className="country-b-select"
          />
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

          {/* Social Share Modal Card for Stories/Posts — Mounted to document.body via Portal */}
          {showShareModal && typeof document !== 'undefined' && createPortal(
            <div className="modal-backdrop-centered" onClick={() => setShowShareModal(false)} role="dialog" aria-modal="true">
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
                  <button className="btn-social btn-download" onClick={downloadCardImage} disabled={downloadingImg}>
                    {downloadingImg ? '⏳ Rendering...' : '💾 Download Story Graphic (.png)'}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      )}
    </section>
  );
}
