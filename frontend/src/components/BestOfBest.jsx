/**
 * BestOfBest.jsx — Evaluates and spotlights the global leaders in data security.
 *
 * Requirements fulfilled:
 * - Highlights Champion (1st place) AND Runner-up (2nd place) overall.
 * - Highlights Champion AND Runner-up for every parameter:
 *   1. Policy Coverage
 *   2. Enforcement Strength
 *   3. Transparency
 *   4. Update Frequency
 *   5. International Alignment
 * - Complete Global Rankings leaderboard table.
 */

import React from 'react';
import {
  PARAMETER_KEYS,
  rankCountries,
  getParameterLabel,
  getScoreColor,
  getRankIndicator,
} from '../utils/analysis';
import { t } from '../utils/i18n';
import ParameterRadar from './ParameterRadar';

export default function BestOfBest({ countries, analysis, lang = 'en' }) {
  const rankedList = rankCountries(countries);
  const leader = rankedList.length > 0 ? countries[rankedList[0].code] : null;
  const runnerUp = rankedList.length > 1 ? countries[rankedList[1].code] : null;

  // Compute highest country AND runner-up per individual parameter
  const parameterLeaders = {};
  PARAMETER_KEYS.forEach((key) => {
    const sortedForParam = Object.values(countries)
      .map((c) => ({ country: c, score: c.scores ? c.scores[key] || 0 : 0 }))
      .sort((a, b) => b.score - a.score);

    const first = sortedForParam[0] || null;
    const second = sortedForParam[1] || null;
    parameterLeaders[key] = {
      champion: first?.country || null,
      championScore: first?.score || 0,
      runnerUp: second?.country || null,
      runnerUpScore: second?.score || 0,
    };
  });

  return (
    <section className="best-of-best-section">
      <div className="section-header">
        <h2>🏆 {t(lang, 'bestOfBestTitle')}</h2>
        <p>{t(lang, 'bestOfBestSubtitle')}</p>
      </div>

      {/* Top Benchmark Podiums: Champion (1st) and Runner-up (2nd) */}
      <div className="podium-grid">
        {/* 1st Place Champion */}
        {leader && (
          <div className="grand-champion-card champion-gold-border">
            <div className="trophy-badge gold-badge">🥇 {t(lang, 'topOverall')}</div>
            <div className="champion-main-grid">
              <div className="champion-info">
                <span className="champion-flag">{leader.flag}</span>
                <div>
                  <h3 className="champion-title">{leader.name}</h3>
                  <p className="champion-authority">
                    {t(lang, 'authority')}: <strong>{leader.authority}</strong>
                  </p>
                </div>
              </div>

              <div className="champion-score-box">
                <span className="overall-score-large">{rankedList[0].overallScore}</span>
                <span className="score-denom">/10 {t(lang, 'compositeScore')}</span>
              </div>
            </div>

            <div className="champion-rationale">
              <h4>{t(lang, 'whyLeads')}</h4>
              <p>
                {analysis?.best_overall?.reason ||
                  `${leader.name} stands as the gold standard in privacy jurisprudence. Combining expansive coverage, aggressive penalty enforcement, high civic transparency, and strict adherence to international standards.`}
              </p>
            </div>

            <div className="champion-chart">
              <ParameterRadar countryA={leader} size={280} />
            </div>
          </div>
        )}

        {/* 2nd Place Runner-Up */}
        {runnerUp && (
          <div className="grand-champion-card runner-up-silver-border">
            <div className="trophy-badge silver-badge">🥈 {t(lang, 'runnerUpBadge')}</div>
            <div className="champion-main-grid">
              <div className="champion-info">
                <span className="champion-flag">{runnerUp.flag}</span>
                <div>
                  <h3 className="champion-title">{runnerUp.name}</h3>
                  <p className="champion-authority">
                    {t(lang, 'authority')}: <strong>{runnerUp.authority}</strong>
                  </p>
                </div>
              </div>

              <div className="champion-score-box">
                <span className="overall-score-large" style={{ color: getScoreColor(rankedList[1].overallScore) }}>
                  {rankedList[1].overallScore}
                </span>
                <span className="score-denom">/10 {t(lang, 'compositeScore')}</span>
              </div>
            </div>

            <div className="champion-rationale">
              <h4>Benchmark Runner-Up Profile:</h4>
              <p>
                {runnerUp.name} closely mirrors the leading framework with exceptional performance in supervisory governance, civic privacy protections, and cross-border data transfer security.
              </p>
            </div>

            <div className="champion-chart">
              <ParameterRadar countryA={runnerUp} size={280} />
            </div>
          </div>
        )}
      </div>

      {/* Five Parameter Champions Grid (With 1st & Runner-up in each) */}
      <h3 className="subsection-title">🎖️ {t(lang, 'championsTitle')}</h3>
      <div className="parameter-champions-grid">
        {PARAMETER_KEYS.map((key) => {
          const p = parameterLeaders[key];
          const champ = p.champion;
          const champScore = p.championScore;
          const run = p.runnerUp;
          const runScore = p.runnerUpScore;

          return (
            <div key={key} className="param-champion-card">
              <div className="param-header">
                <span className="param-title">{getParameterLabel(key)}</span>
              </div>

              {/* Champion (1st) */}
              {champ && (
                <div className="param-rank-row champ-tier">
                  <span className="rank-mini-badge gold-text">🥇 1st Place</span>
                  <div className="champ-country-row">
                    <span className="champ-flag">{champ.flag}</span>
                    <strong className="champ-name">{champ.name}</strong>
                    <span className="param-score-pill" style={{ color: getScoreColor(champScore) }}>
                      {champScore}/10
                    </span>
                  </div>
                  <p className="param-justification">
                    {champ.details && champ.details[key] ? champ.details[key] : `Top performer in ${getParameterLabel(key)}.`}
                  </p>
                </div>
              )}

              {/* Runner Up (2nd) */}
              {run && (
                <div className="param-rank-row runner-up-tier">
                  <span className="rank-mini-badge silver-text">🥈 {t(lang, 'runnerUp')}</span>
                  <div className="champ-country-row">
                    <span className="champ-flag">{run.flag}</span>
                    <strong className="champ-name">{run.name}</strong>
                    <span className="param-score-pill" style={{ color: getScoreColor(runScore) }}>
                      {runScore}/10
                    </span>
                  </div>
                  <p className="param-justification">
                    {run.details && run.details[key] ? run.details[key] : `Second-highest score in ${getParameterLabel(key)}.`}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Global Rankings Leaderboard */}
      <h3 className="subsection-title">📊 {t(lang, 'globalRankings')}</h3>
      <div className="table-responsive">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th style={{ width: '10%' }}>{t(lang, 'rank')}</th>
              <th style={{ width: '25%' }}>Country</th>
              <th style={{ width: '15%' }}>{t(lang, 'compositeScore')}</th>
              <th style={{ width: '10%' }}>Coverage</th>
              <th style={{ width: '10%' }}>Enforcement</th>
              <th style={{ width: '10%' }}>Transparency</th>
              <th style={{ width: '10%' }}>Updates</th>
              <th style={{ width: '10%' }}>Alignment</th>
            </tr>
          </thead>
          <tbody>
            {rankedList.map((item, idx) => {
              const rankInd = getRankIndicator(idx);
              const scores = item.scores || {};
              return (
                <tr key={item.code} className={idx === 0 ? 'top-rank-row' : idx === 1 ? 'second-rank-row' : ''}>
                  <td className="rank-cell">
                    <span className={`rank-badge ${rankInd.className}`}>{rankInd.emoji}</span>
                  </td>
                  <td className="name-cell">
                    <span className="flag-cell">{item.flag}</span>
                    <strong>{item.name}</strong>
                  </td>
                  <td className="score-cell">
                    <strong style={{ color: getScoreColor(item.overallScore) }}>
                      {item.overallScore}
                    </strong>
                    <span className="denom">/10</span>
                  </td>
                  <td>{scores.policy_coverage || 0}</td>
                  <td>{scores.enforcement_strength || 0}</td>
                  <td>{scores.transparency || 0}</td>
                  <td>{scores.update_frequency || 0}</td>
                  <td>{scores.international_alignment || 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
