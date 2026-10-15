/**
 * archetypes.js — Legal archetypes, breach notification thresholds, and adequacy rules.
 */

export const LEGAL_ARCHETYPES = {
  ALL: { id: 'ALL', labelKey: 'archetypeAll', emoji: '🌐' },
  OMNIBUS: { id: 'OMNIBUS', labelKey: 'archetypeOmnibus', emoji: '🇪🇺' },
  SECTORAL: { id: 'SECTORAL', labelKey: 'archetypeSectoral', emoji: '🇺🇸' },
  LOCALIZATION: { id: 'LOCALIZATION', labelKey: 'archetypeLocalization', emoji: '🛡️' },
  HYBRID: { id: 'HYBRID', labelKey: 'archetypeHybrid', emoji: '⚖️' },
};

// EU / EEA countries adhering to the Omnibus GDPR
export const EU_EEA_CODES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES',
  'SE', 'IS', 'LI', 'NO', 'GB'
]);

// Countries with strict data localization / sovereignty mandates
export const LOCALIZATION_CODES = new Set([
  'CN', 'RU', 'VN', 'SA', 'IR', 'BY', 'KZ', 'ID'
]);

// Sectoral approach
export const SECTORAL_CODES = new Set([
  'US'
]);

// Countries requiring 72-hour mandatory breach notifications
export const MANDATORY_72H_BREACH = new Set([
  ...EU_EEA_CODES,
  'IN', 'BR', 'KR', 'SG', 'ZA', 'NZ', 'IL', 'TH', 'PH', 'KE', 'NG', 'AE'
]);

/**
 * Determine a country's regulatory archetype
 */
export function getCountryArchetype(code) {
  if (EU_EEA_CODES.has(code)) return 'OMNIBUS';
  if (LOCALIZATION_CODES.has(code)) return 'LOCALIZATION';
  if (SECTORAL_CODES.has(code)) return 'SECTORAL';
  return 'HYBRID';
}

/**
 * Check if a country has mandatory 72-hour breach reporting
 */
export function has72hBreachNotification(code) {
  return MANDATORY_72H_BREACH.has(code);
}

// EU adequacy decision recognized partners
export const EU_ADEQUACY_PARTNERS = new Set([
  'AD', 'AR', 'CA', 'FO', 'GG', 'IL', 'IM', 'JP', 'JE', 'NZ', 'KR', 'CH', 'GB', 'US', 'UY'
]);

/**
 * Evaluates cross-border adequacy transfer status between two countries
 */
export function evaluateAdequacy(codeA, codeB) {
  if (codeA === codeB) {
    return {
      status: 'INTERNAL',
      text: 'Domestic processing: standard national regulations apply without cross-border transfer friction.',
      badge: 'Domestic',
      color: 'var(--color-score-good)',
    };
  }

  const isEuA = EU_EEA_CODES.has(codeA);
  const isEuB = EU_EEA_CODES.has(codeB);

  // Both EU/EEA
  if (isEuA && isEuB) {
    return {
      status: 'FREE_FLOW',
      text: 'Free data flow guaranteed under EU GDPR single market framework without additional transfer instruments.',
      badge: 'EU Free Flow',
      color: 'var(--color-score-excellent)',
    };
  }

  // EU to Adequacy partner
  if ((isEuA && EU_ADEQUACY_PARTNERS.has(codeB)) || (isEuB && EU_ADEQUACY_PARTNERS.has(codeA))) {
    return {
      status: 'ADEQUATE',
      text: 'Official European Commission Mutual Adequacy Finding in effect: seamless commercial data transfers permitted.',
      badge: 'Adequacy Decision',
      color: 'var(--color-score-excellent)',
    };
  }

  // Cross-border safeguards required
  return {
    status: 'SAFEGUARDS_REQUIRED',
    text: 'No omnibus adequacy: requires Standard Contractual Clauses (SCCs), BCRs, or explicit consent safeguards.',
    badge: 'Safeguards Required (SCC/BCR)',
    color: 'var(--color-score-fair)',
  };
}

