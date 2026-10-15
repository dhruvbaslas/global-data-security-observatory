/**
 * analysis.js — Data analysis and scoring utilities.
 *
 * Provides functions for calculating composite scores, comparing countries,
 * ranking them, and mapping scores to human-readable labels and CSS colors.
 * All score values are expected to be on a 1–10 scale.
 */

/**
 * Parameter weights for calculating the overall composite score.
 * These weights reflect the relative importance of each dimension
 * in determining a country's overall data protection posture.
 *
 * Weights sum to 1.0 for easy weighted-average calculation.
 */
export const PARAMETER_WEIGHTS = {
  policy_coverage: 0.25,       // 25% — breadth of legal framework
  enforcement_strength: 0.25,  // 25% — effectiveness of enforcement
  transparency: 0.20,          // 20% — openness and accessibility
  update_frequency: 0.15,      // 15% — currency of regulations
  international_alignment: 0.15, // 15% — global interoperability
};

/**
 * Human-readable labels for each scoring parameter.
 * Used in UI elements like headers, tooltips, and comparison tables.
 */
const PARAMETER_LABELS = {
  policy_coverage: 'Policy Coverage',
  enforcement_strength: 'Enforcement Strength',
  transparency: 'Transparency',
  update_frequency: 'Update Frequency',
  international_alignment: 'International Alignment',
};

/**
 * Ordered list of all parameter keys.
 * Useful for iterating in a consistent order across components.
 */
export const PARAMETER_KEYS = [
  'policy_coverage',
  'enforcement_strength',
  'transparency',
  'update_frequency',
  'international_alignment',
];

/**
 * Calculate the overall weighted score for a country.
 *
 * @param {Object} scores - Object mapping parameter keys to numeric scores (1-10).
 * @returns {number} The weighted average score, rounded to one decimal place.
 *
 * @example
 * calculateOverallScore({
 *   policy_coverage: 8,
 *   enforcement_strength: 7,
 *   transparency: 9,
 *   update_frequency: 6,
 *   international_alignment: 7
 * }) // => 7.5
 */
export function calculateOverallScore(scores) {
  // Guard: return 0 if scores object is missing or empty
  if (!scores || typeof scores !== 'object') return 0;

  let totalWeight = 0;
  let weightedSum = 0;

  // Iterate through each parameter and its weight
  for (const [param, weight] of Object.entries(PARAMETER_WEIGHTS)) {
    const score = scores[param];

    // Only include parameters that have valid numeric scores
    if (typeof score === 'number' && !isNaN(score)) {
      weightedSum += score * weight;
      totalWeight += weight;
    }
  }

  // Avoid division by zero if no valid scores
  if (totalWeight === 0) return 0;

  // Normalize by actual total weight (handles missing parameters gracefully)
  const result = weightedSum / totalWeight;

  // Round to one decimal place for clean display
  return Math.round(result * 10) / 10;
}

/**
 * Compare two countries parameter by parameter.
 * Returns a detailed comparison object showing which country
 * leads in each dimension.
 *
 * @param {Object} countryA - First country data object (must have .scores).
 * @param {Object} countryB - Second country data object (must have .scores).
 * @returns {Object} Comparison result with per-parameter and overall analysis.
 *
 * @example
 * const result = compareCountries(germany, france);
 * // result.parameters.enforcement_strength.winner === 'B'
 * // result.overall.winner === 'A' (Germany)
 */
export function compareCountries(countryA, countryB) {
  // Guard: validate inputs
  if (!countryA?.scores || !countryB?.scores) {
    return { parameters: {}, overall: { winner: null, scoreA: 0, scoreB: 0 } };
  }

  const parameters = {};
  let winsA = 0; // Count of parameters where A scores higher
  let winsB = 0; // Count of parameters where B scores higher
  let ties = 0;  // Count of parameters where scores are equal

  // Compare each parameter individually
  for (const param of PARAMETER_KEYS) {
    const scoreA = countryA.scores[param] || 0;
    const scoreB = countryB.scores[param] || 0;
    const diff = scoreA - scoreB;

    // Determine the winner for this parameter
    let winner;
    if (diff > 0) {
      winner = 'A';
      winsA++;
    } else if (diff < 0) {
      winner = 'B';
      winsB++;
    } else {
      winner = 'tie';
      ties++;
    }

    parameters[param] = {
      scoreA,
      scoreB,
      diff,         // Positive means A leads, negative means B leads
      absDiff: Math.abs(diff),
      winner,
      label: getParameterLabel(param),
    };
  }

  // Calculate overall composite scores
  const overallA = calculateOverallScore(countryA.scores);
  const overallB = calculateOverallScore(countryB.scores);

  // Determine the overall winner
  let overallWinner;
  if (overallA > overallB) {
    overallWinner = 'A';
  } else if (overallB > overallA) {
    overallWinner = 'B';
  } else {
    overallWinner = 'tie';
  }

  return {
    parameters,
    overall: {
      winner: overallWinner,
      scoreA: overallA,
      scoreB: overallB,
      diff: Math.round((overallA - overallB) * 10) / 10,
      winsA,
      winsB,
      ties,
    },
  };
}

/**
 * Rank all countries by their overall composite score (descending).
 *
 * @param {Object} countries - Object mapping country codes to country data objects.
 * @returns {Array<Object>} Array of { code, name, flag, overallScore, scores } sorted descending.
 *
 * @example
 * const ranked = rankCountries(countriesData);
 * ranked[0].name // => "Germany" (highest overall score)
 */
export function rankCountries(countries) {
  // Guard: validate input
  if (!countries || typeof countries !== 'object') return [];

  return Object.entries(countries)
    .map(([code, data]) => ({
      code,
      name: data.name || code,
      flag: data.flag || '',
      overallScore: calculateOverallScore(data.scores),
      scores: data.scores || {},
    }))
    // Sort descending by overall score; tie-break alphabetically by name
    .sort((a, b) => {
      if (b.overallScore !== a.overallScore) {
        return b.overallScore - a.overallScore;
      }
      return a.name.localeCompare(b.name);
    });
}

/**
 * Get a human-readable label for a scoring parameter key.
 *
 * @param {string} key - The parameter key (e.g., 'policy_coverage').
 * @returns {string} The human-readable label (e.g., 'Policy Coverage').
 */
export function getParameterLabel(key) {
  return PARAMETER_LABELS[key] || key
    // Fallback: convert snake_case to Title Case
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Get a CSS color corresponding to a score value.
 * Uses a traffic-light color scheme:
 *   - 8-10: Green (excellent)
 *   - 6-7:  Teal/Yellow-green (good)
 *   - 4-5:  Orange/Amber (fair)
 *   - 1-3:  Red (poor)
 *
 * @param {number} score - The score value (1-10).
 * @returns {string} A CSS color string.
 */
export function getScoreColor(score) {
  if (typeof score !== 'number' || isNaN(score)) return 'var(--color-neutral)';

  if (score >= 8) return 'var(--color-score-excellent)'; // Green
  if (score >= 6) return 'var(--color-score-good)';      // Teal
  if (score >= 4) return 'var(--color-score-fair)';      // Orange
  return 'var(--color-score-poor)';                       // Red
}

/**
 * Get a human-readable quality label for a score.
 *
 * @param {number} score - The score value (1-10).
 * @returns {string} A quality label: "Excellent", "Good", "Fair", or "Poor".
 */
export function getScoreLabel(score) {
  if (typeof score !== 'number' || isNaN(score)) return 'N/A';

  if (score >= 8) return 'Excellent';
  if (score >= 6) return 'Good';
  if (score >= 4) return 'Fair';
  return 'Poor';
}

/**
 * Get a medal/rank indicator based on position.
 *
 * @param {number} rank - The rank position (0-indexed).
 * @returns {{ emoji: string, label: string, className: string }}
 */
export function getRankIndicator(rank) {
  switch (rank) {
    case 0:
      return { emoji: '🥇', label: 'Gold', className: 'rank-gold' };
    case 1:
      return { emoji: '🥈', label: 'Silver', className: 'rank-silver' };
    case 2:
      return { emoji: '🥉', label: 'Bronze', className: 'rank-bronze' };
    default:
      return { emoji: `#${rank + 1}`, label: `Rank ${rank + 1}`, className: 'rank-default' };
  }
}
