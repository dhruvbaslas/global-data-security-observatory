import { describe, it, expect } from 'vitest';
import {
  calculateOverallScore,
  compareCountries,
  rankCountries,
  getParameterLabel,
  getScoreColor,
} from '../utils/analysis';

describe('Analysis Utilities', () => {
  const mockUS = {
    code: 'US',
    name: 'United States',
    scores: {
      policy_coverage: 7,
      enforcement_strength: 8,
      transparency: 9,
      update_frequency: 7,
      international_alignment: 5,
    },
  };

  const mockFR = {
    code: 'FR',
    name: 'France',
    scores: {
      policy_coverage: 9,
      enforcement_strength: 9,
      transparency: 9,
      update_frequency: 8,
      international_alignment: 9,
    },
  };

  it('calculates weighted composite score accurately', () => {
    const scoreUS = calculateOverallScore(mockUS.scores);
    expect(scoreUS).toBeGreaterThan(6.0);
    expect(scoreUS).toBeLessThan(8.5);

    const scoreFR = calculateOverallScore(mockFR.scores);
    expect(scoreFR).toBe(8.9);
  });

  it('correctly compares two countries parameter by parameter', () => {
    const comparison = compareCountries(mockUS, mockFR);
    expect(comparison.overall.winner).toBe('B'); // FR wins
    expect(comparison.parameters.policy_coverage.winner).toBe('B');
    expect(comparison.parameters.transparency.winner).toBe('tie');
  });

  it('ranks countries descending by composite score', () => {
    const ranked = rankCountries({ US: mockUS, FR: mockFR });
    expect(ranked[0].code).toBe('FR');
    expect(ranked[1].code).toBe('US');
  });

  it('converts parameter keys into clean labels', () => {
    expect(getParameterLabel('policy_coverage')).toBe('Policy Coverage');
    expect(getParameterLabel('international_alignment')).toBe('International Alignment');
  });

  it('assigns correct theme color by score threshold', () => {
    expect(getScoreColor(9)).toContain('excellent');
    expect(getScoreColor(3)).toContain('poor');
  });
});

