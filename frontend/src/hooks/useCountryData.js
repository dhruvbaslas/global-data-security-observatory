/**
 * useCountryData.js — Custom hook for loading and managing country data.
 *
 * This hook handles:
 * 1. Fetching country data from the static JSON file (/data/countries.json)
 * 2. Merging fetched data with user-added countries from localStorage
 * 3. Providing CRUD operations for user-added countries
 * 4. Managing loading and error states
 * 5. Memoizing computed values for performance
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

/** LocalStorage key for user-added countries */
const STORAGE_KEY = 'gdso_user_countries';

/**
 * Safely read user-added countries from localStorage.
 * Returns an empty object if data is missing, corrupted, or inaccessible.
 *
 * @returns {Object} Parsed user countries object, keyed by country code.
 */
function loadUserCountries() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const parsed = JSON.parse(stored);

    // Validate that parsed data is a non-null object with strictly sanitized properties
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const sanitizedObj = {};
      for (const [code, entry] of Object.entries(parsed)) {
        // Enforce valid country code and object structure
        if (/^[A-Z]{2,3}$/.test(code) && entry && typeof entry === 'object') {
          sanitizedObj[code] = {
            ...entry,
            code,
            name: typeof entry.name === 'string' ? entry.name.slice(0, 100) : code,
            authority_url: typeof entry.authority_url === 'string' && entry.authority_url.startsWith('http')
              ? entry.authority_url
              : '',
          };
        }
      }
      return sanitizedObj;
    }
    return {};
  } catch (error) {
    // localStorage might be unavailable (SSR, private browsing, quota exceeded)
    console.warn('Failed to load user countries from localStorage:', error);
    return {};
  }
}

/**
 * Safely persist user-added countries to localStorage.
 *
 * @param {Object} countries - The user countries object to save.
 */
function saveUserCountries(countries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(countries));
  } catch (error) {
    console.warn('Failed to save user countries to localStorage:', error);
  }
}

/**
 * Custom hook for loading, merging, and managing country data.
 *
 * @returns {Object} Hook return value:
 *   - countries: Merged object of all countries (fetched + user-added)
 *   - analysis: Analysis metadata from the JSON file
 *   - loading: Boolean indicating initial data fetch in progress
 *   - error: Error message string, or null
 *   - addCountry: Function to add a new user country
 *   - removeCountry: Function to remove a user-added country
 *   - refreshData: Function to re-fetch the JSON data
 *   - userCountryCodes: Set of country codes that were user-added
 *   - generatedAt: Timestamp when the data was last generated
 */
export function useCountryData() {
  // --- State ---

  /** Countries fetched from the static JSON file */
  const [fetchedCountries, setFetchedCountries] = useState({});

  /** Analysis metadata from the JSON file */
  const [analysis, setAnalysis] = useState(null);

  /** Timestamp when the data was generated */
  const [generatedAt, setGeneratedAt] = useState(null);

  /** User-added countries stored in localStorage */
  const [userCountries, setUserCountries] = useState(() => loadUserCountries());

  /** Loading state for the initial fetch */
  const [loading, setLoading] = useState(true);

  /** Error message from fetch failures */
  const [error, setError] = useState(null);

  // --- Data Fetching ---

  /**
   * Fetch country data from the static JSON file.
   * This is called on mount and can be triggered manually via refreshData().
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Determine the base path for the fetch
      // In production (GitHub Pages) or local preview, ensure correct relative or absolute resolution
      const rawBase = import.meta.env.BASE_URL || './';
      const basePath = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
      const url = `${basePath}data/countries.json`;

      const response = await fetch(url);

      // Handle HTTP errors
      if (!response.ok) {
        throw new Error(
          `Failed to fetch country data: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Validate the response structure
      if (!data || !data.countries) {
        throw new Error('Invalid data format: missing "countries" field');
      }

      // Update state with fetched data
      setFetchedCountries(data.countries);
      setAnalysis(data.analysis || null);
      setGeneratedAt(data.generated_at || null);
    } catch (err) {
      console.error('Error fetching country data:', err);
      setError(err.message || 'An unknown error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Merged Countries (memoized) ---

  /**
   * Merge fetched countries with user-added countries.
   * User-added countries with the same code will override fetched data,
   * but this is intentional to allow user customization.
   */
  const countries = useMemo(() => {
    return { ...fetchedCountries, ...userCountries };
  }, [fetchedCountries, userCountries]);

  /**
   * Set of country codes that were added by the user.
   * Used to display delete buttons only for user-added entries.
   */
  const userCountryCodes = useMemo(() => {
    return new Set(Object.keys(userCountries));
  }, [userCountries]);

  // --- CRUD Operations ---

  /**
   * Add a new country to localStorage.
   * Creates a country object with default scores and the provided metadata.
   *
   * @param {Object} countryData - The country data to add.
   * @param {string} countryData.code - 2-3 letter country code (e.g., 'NZ').
   * @param {string} countryData.name - Country name (e.g., 'New Zealand').
   * @param {string} [countryData.flag] - Flag emoji (e.g., '🇳🇿').
   * @param {string} [countryData.authority_url] - URL to the data authority.
   * @returns {{ success: boolean, error?: string }} Result object.
   */
  const addCountry = useCallback((countryData) => {
    const { code, name, flag, authority_url } = countryData;

    // Validate required fields
    if (!code || !name) {
      return { success: false, error: 'Country code and name are required.' };
    }

    // Check if the code already exists in fetched data
    if (fetchedCountries[code]) {
      return {
        success: false,
        error: `Country code "${code}" already exists in the database.`,
      };
    }

    // Build the new country object with sensible defaults
    const newCountry = {
      code,
      name,
      flag: flag || '🏳️',
      summary: `User-added country: ${name}. Data pending verification.`,
      key_laws: [],
      authority: 'Not specified',
      authority_url: authority_url || '',
      scores: {
        policy_coverage: 5,
        enforcement_strength: 5,
        transparency: 5,
        update_frequency: 5,
        international_alignment: 5,
      },
      details: {
        policy_coverage: 'Score pending detailed analysis.',
        enforcement_strength: 'Score pending detailed analysis.',
        transparency: 'Score pending detailed analysis.',
        update_frequency: 'Score pending detailed analysis.',
        international_alignment: 'Score pending detailed analysis.',
      },
      last_updated: new Date().toISOString(),
      _userAdded: true, // Internal flag to identify user-added entries
    };

    // Update state and persist
    setUserCountries((prev) => {
      const updated = { ...prev, [code]: newCountry };
      saveUserCountries(updated);
      return updated;
    });

    return { success: true };
  }, [fetchedCountries]);

  /**
   * Remove a user-added country from localStorage.
   * Cannot remove countries from the fetched dataset.
   *
   * @param {string} code - The country code to remove.
   * @returns {{ success: boolean, error?: string }} Result object.
   */
  const removeCountry = useCallback((code) => {
    if (!code) {
      return { success: false, error: 'Country code is required.' };
    }

    setUserCountries((prev) => {
      // Only allow removing user-added countries
      if (!prev[code]) {
        return prev; // No change needed
      }

      const updated = { ...prev };
      delete updated[code];
      saveUserCountries(updated);
      return updated;
    });

    return { success: true };
  }, []);

  /**
   * Refresh data by re-fetching the JSON file.
   * Useful if the user suspects the data has been updated.
   */
  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // --- Return Value ---

  return {
    countries,
    analysis,
    loading,
    error,
    addCountry,
    removeCountry,
    refreshData,
    userCountryCodes,
    generatedAt,
  };
}
