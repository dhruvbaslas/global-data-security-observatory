import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CountryFilter from '../components/CountryFilter';
import CountryCard from '../components/CountryCard';
import ComparisonView from '../components/ComparisonView';
import BestOfBest from '../components/BestOfBest';
import AddCountry from '../components/AddCountry';

const mockCountries = {
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    summary: 'Sectoral data privacy system.',
    authority: 'FTC',
    authority_url: 'https://www.ftc.gov',
    key_laws: ['CCPA', 'HIPAA'],
    scores: {
      policy_coverage: 7,
      enforcement_strength: 8,
      transparency: 9,
      update_frequency: 7,
      international_alignment: 5,
    },
    details: {
      policy_coverage: 'Federal sectoral approach with comprehensive state rules.',
    },
  },
  FR: {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    summary: 'Strict GDPR benchmark framework.',
    authority: 'CNIL',
    authority_url: 'https://www.cnil.fr',
    key_laws: ['GDPR', 'LIL'],
    scores: {
      policy_coverage: 9,
      enforcement_strength: 9,
      transparency: 9,
      update_frequency: 8,
      international_alignment: 9,
    },
    details: {
      policy_coverage: 'Omnibus GDPR coverage across all sectors.',
    },
  },
};

describe('Frontend Component Tests', () => {
  it('renders CountryFilter and triggers selection and search events', () => {
    const handleSelect = vi.fn();
    const handleSearch = vi.fn();

    render(
      <CountryFilter
        countries={mockCountries}
        selectedCountry="ALL"
        onSelectCountry={handleSelect}
        searchQuery=""
        onSearchChange={handleSearch}
      />
    );

    expect(screen.getByText('All Nations')).toBeInTheDocument();
    expect(screen.getAllByText('United States').length).toBeGreaterThan(0);

    const usPill = screen.getAllByText('United States')[0];
    fireEvent.click(usPill);
    expect(handleSelect).toHaveBeenCalledWith('US');

    const searchInput = screen.getByRole('textbox', { name: /search countries/i });
    fireEvent.change(searchInput, { target: { value: 'GDPR' } });
    expect(handleSearch).toHaveBeenCalledWith('GDPR');
  });

  it('renders CountryCard correctly with scores and toggles expanded details', () => {
    render(<CountryCard country={mockCountries.US} />);

    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('CCPA')).toBeInTheDocument();
    expect(screen.getByText('FTC ↗')).toBeInTheDocument();

    const expandBtn = screen.getByText('▼ View Details');
    fireEvent.click(expandBtn);
    expect(screen.getByText(/Federal sectoral approach/i)).toBeInTheDocument();
  });

  it('renders ComparisonView and demonstrates country comparison', () => {
    render(
      <ComparisonView
        countries={mockCountries}
        initialCountryA="US"
        initialCountryB="FR"
      />
    );

    expect(screen.getByText(/Head-to-Head Country Comparison/i)).toBeInTheDocument();
    expect(screen.getByText(/Overall Leader/i)).toBeInTheDocument();
  });

  it('renders BestOfBest leaderboard and identifies the top country', () => {
    render(<BestOfBest countries={mockCountries} analysis={{}} />);

    expect(screen.getByText(/Best of Best: Global Security Benchmark/i)).toBeInTheDocument();
    expect(screen.getByText(/TOP OVERALL NATION/i)).toBeInTheDocument();
    expect(screen.getAllByText(/France/i).length).toBeGreaterThan(0);
  });

  it('renders AddCountry modal and executes input validation and submit callback', () => {
    const handleAdd = vi.fn().mockReturnValue({ success: true });
    const handleClose = vi.fn();

    render(
      <AddCountry isOpen={true} onClose={handleClose} onAddCountry={handleAdd} />
    );

    expect(screen.getByText(/Dynamic Country Expansion/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Country Name \*/i), {
      target: { value: 'Germany' },
    });
    fireEvent.change(screen.getByLabelText(/ISO Alpha Code/i), {
      target: { value: 'DE' },
    });
    fireEvent.change(screen.getByLabelText(/Official Government Portal URL \*/i), {
      target: { value: 'https://www.bfdi.bund.de/' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Add to Dataset/i }));

    expect(handleAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'DE',
        name: 'Germany',
        authority_url: 'https://www.bfdi.bund.de/',
      })
    );
  });
});

