/**
 * ParameterRadar.jsx — Pure SVG Radar / Spider chart component.
 *
 * Renders a radar chart comparing 1 or 2 countries across 5 data security parameters:
 * - Policy Coverage
 * - Enforcement Strength
 * - Transparency
 * - Update Frequency
 * - International Alignment
 *
 * Implemented with pure SVG mathematics without any external charting dependencies.
 * Fully responsive: uses viewBox and expanded label bounding margins to prevent text clipping.
 */

import React from 'react';
import { PARAMETER_KEYS, getParameterLabel } from '../utils/analysis';

export default function ParameterRadar({
  countryA,
  countryB = null,
  size = 460,
}) {
  const center = size / 2;
  // Radius kept conservative (e.g. size/2 - 75) so long labels (e.g. "International Alignment")
  // and multi-line breaks fit cleanly within the SVG canvas without clipping
  const radius = (size / 2) - 80;
  const totalAxes = PARAMETER_KEYS.length;
  const angleStep = (Math.PI * 2) / totalAxes;

  // Levels for background grid polygons (2, 4, 6, 8, 10)
  const levels = [2, 4, 6, 8, 10];

  /**
   * Helper to compute (x, y) given an angle and score value (0 to 10)
   */
  const getCoordinates = (value, index) => {
    // Start from top (- PI / 2) and rotate clockwise
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 10) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  /**
   * Generates polygon SVG points string for a set of scores
   */
  const getPolygonPoints = (scores) => {
    if (!scores) return '';
    return PARAMETER_KEYS.map((key, i) => {
      const val = scores[key] || 0;
      const { x, y } = getCoordinates(val, i);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  };

  const pointsA = countryA ? getPolygonPoints(countryA.scores) : '';
  const pointsB = countryB ? getPolygonPoints(countryB.scores) : '';

  /**
   * Cleanly break parameter labels into 2 lines if needed so they never truncate
   */
  const splitLabel = (label) => {
    const parts = label.split(' ');
    if (parts.length > 1) {
      return [parts.slice(0, parts.length - 1).join(' '), parts[parts.length - 1]];
    }
    return [label];
  };

  return (
    <div className="radar-container" style={{ width: '100%', maxWidth: `${size}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto' }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        className="radar-svg"
        role="img"
        aria-label="Parameter Radar Chart"
      >
        {/* Background concentric reference polygons */}
        {levels.map((lvl) => {
          const gridPoints = PARAMETER_KEYS.map((_, i) => {
            const { x, y } = getCoordinates(lvl, i);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          }).join(' ');
          return (
            <polygon
              key={lvl}
              points={gridPoints}
              fill={lvl === 10 ? 'rgba(30, 41, 59, 0.4)' : 'none'}
              stroke="var(--color-border, #334155)"
              strokeDasharray={lvl === 10 ? 'none' : '3,3'}
              strokeWidth={lvl === 10 ? '1.5' : '1'}
              opacity={0.7}
            />
          );
        })}

        {/* Level indicators (2, 4, 6, 8, 10 on the vertical axis) */}
        {levels.map((lvl) => {
          const { x, y } = getCoordinates(lvl, 0);
          return (
            <text
              key={`level-${lvl}`}
              x={x + 4}
              y={y + 11}
              fill="var(--color-text-muted, #64748b)"
              fontSize="9"
              fontFamily="monospace"
            >
              {lvl}
            </text>
          );
        })}

        {/* Axis spokes from center to perimeter */}
        {PARAMETER_KEYS.map((key, i) => {
          const { x, y } = getCoordinates(10, i);
          return (
            <line
              key={key}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="var(--color-border, #334155)"
              strokeWidth="1.2"
              opacity={0.8}
            />
          );
        })}

        {/* Country A Polygon */}
        {pointsA && (
          <polygon
            points={pointsA}
            fill="rgba(56, 189, 248, 0.35)"
            stroke="#38bdf8"
            strokeWidth="2.5"
            className="radar-polygon-a"
          />
        )}

        {/* Country B Polygon (if comparing) */}
        {pointsB && (
          <polygon
            points={pointsB}
            fill="rgba(244, 63, 94, 0.35)"
            stroke="#f43f5e"
            strokeWidth="2.5"
            className="radar-polygon-b"
          />
        )}

        {/* Country A Data Points */}
        {countryA &&
          PARAMETER_KEYS.map((key, i) => {
            const val = countryA.scores ? countryA.scores[key] || 0 : 0;
            const { x, y } = getCoordinates(val, i);
            return (
              <circle
                key={`a-${key}`}
                cx={x}
                cy={y}
                r="5"
                fill="#38bdf8"
                stroke="#0f172a"
                strokeWidth="2"
              />
            );
          })}

        {/* Country B Data Points */}
        {countryB &&
          PARAMETER_KEYS.map((key, i) => {
            const val = countryB.scores ? countryB.scores[key] || 0 : 0;
            const { x, y } = getCoordinates(val, i);
            return (
              <circle
                key={`b-${key}`}
                cx={x}
                cy={y}
                r="5"
                fill="#f43f5e"
                stroke="#0f172a"
                strokeWidth="2"
              />
            );
          })}

        {/* Axis Labels - with safe spacing and tspan wrapping */}
        {PARAMETER_KEYS.map((key, i) => {
          const { angle } = getCoordinates(10, i);
          const labelDist = radius + 28;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);

          let textAnchor = 'middle';
          if (Math.cos(angle) > 0.3) textAnchor = 'start';
          else if (Math.cos(angle) < -0.3) textAnchor = 'end';

          const labelLines = splitLabel(getParameterLabel(key));

          return (
            <text
              key={`label-${key}`}
              x={lx}
              y={labelLines.length > 1 ? ly - 4 : ly + 4}
              textAnchor={textAnchor}
              fill="var(--color-text-primary, #f8fafc)"
              fontSize="12"
              fontWeight="600"
            >
              {labelLines.map((line, idx) => (
                <tspan
                  key={idx}
                  x={lx}
                  dy={idx === 0 ? '0' : '1.2em'}
                  textAnchor={textAnchor}
                >
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="radar-legend" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.25rem', marginTop: '1rem', fontSize: '0.9rem' }}>
        {countryA && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '14px', height: '14px', backgroundColor: '#38bdf8', borderRadius: '3px', display: 'inline-block' }}></span>
            <span style={{ fontWeight: 600 }}>{countryA.flag} {countryA.name}</span>
          </div>
        )}
        {countryB && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '14px', height: '14px', backgroundColor: '#f43f5e', borderRadius: '3px', display: 'inline-block' }}></span>
            <span style={{ fontWeight: 600 }}>{countryB.flag} {countryB.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
