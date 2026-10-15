/**
 * SearchableSelect.jsx — Accessible, searchable dropdown (combobox).
 *
 * Solves:
 * - Instant type-to-search filtering across 197 sovereign nations and categories
 * - Full keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
 * - Outside click handling
 * - Clean visual presentation with flag/icon, title, and sublabel/code
 */

import React, { useState, useRef, useEffect, useId } from 'react';

export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Search or select...',
  id,
  ariaLabel = 'Searchable select',
  className = '',
  disabled = false,
}) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Selected option lookup
  const selectedOption = options.find((opt) => opt.value === value) || null;

  const [dropUp, setDropUp] = useState(false);

  // Filter options based on user search query
  const filteredOptions = options.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchLabel = opt.label?.toLowerCase().includes(q);
    const matchVal = opt.value?.toLowerCase().includes(q);
    const matchSub = opt.sublabel?.toLowerCase().includes(q);
    return matchLabel || matchVal || matchSub;
  });

  // Calculate if dropdown should flip upwards when space below is tight
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 280 && spaceAbove > spaceBelow) {
        setDropUp(true);
      } else {
        setDropUp(false);
      }
    }
  }, [isOpen]);

  // Keep highlighted index in valid range when filtered list changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Auto-scroll highlighted option into view
  useEffect(() => {
    if (isOpen && listRef.current && listRef.current.children[highlightedIndex]) {
      listRef.current.children[highlightedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [highlightedIndex, isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex].value);
          setIsOpen(false);
          setSearchQuery('');
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;
      case 'Tab':
        setIsOpen(false);
        setSearchQuery('');
        break;
      default:
        break;
    }
  };

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div
      ref={containerRef}
      className={`searchable-select-container ${isOpen ? 'is-open' : ''} ${className}`}
      onKeyDown={handleKeyDown}
    >
      <div
        className={`searchable-select-trigger ${disabled ? 'is-disabled' : ''}`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 50);
            }
          }
        }}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${selectId}-list`}
        aria-label={ariaLabel}
        tabIndex={disabled ? -1 : 0}
      >
        <div className="select-selected-content">
          {selectedOption ? (
            <span className="selected-item-text">
              {selectedOption.icon || selectedOption.flag ? (
                <span className="select-icon" aria-hidden="true">
                  {selectedOption.icon || selectedOption.flag}
                </span>
              ) : null}
              <span className="select-label">{selectedOption.label}</span>
              {selectedOption.sublabel && (
                <span className="select-sublabel">({selectedOption.sublabel})</span>
              )}
            </span>
          ) : (
            <span className="select-placeholder">{placeholder}</span>
          )}
        </div>
        <span className="select-arrow-icon" aria-hidden="true">
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {isOpen && (
        <div
          className={`searchable-select-dropdown ${dropUp ? 'is-drop-up' : ''}`}
          id={`${selectId}-list`}
        >
          <div className="search-input-wrap">
            <span className="search-inline-icon" aria-hidden="true">🔍</span>
            <input
              ref={inputRef}
              type="text"
              className="search-inline-input"
              placeholder="Type to filter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              aria-label="Filter options"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                className="search-inline-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
                aria-label="Clear filter"
              >
                ✕
              </button>
            )}
          </div>

          <ul className="searchable-options-list" ref={listRef} role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    className={`select-option-item ${isSelected ? 'is-selected' : ''} ${
                      isHighlighted ? 'is-highlighted' : ''
                    }`}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                  >
                    <div className="option-label-group">
                      {opt.icon || opt.flag ? (
                        <span className="option-icon" aria-hidden="true">
                          {opt.icon || opt.flag}
                        </span>
                      ) : null}
                      <span className="option-label">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="option-sublabel">{opt.sublabel}</span>
                      )}
                    </div>
                    {isSelected && <span className="option-checkmark" aria-hidden="true">✓</span>}
                  </li>
                );
              })
            ) : (
              <li className="no-options-item">No matching items found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

