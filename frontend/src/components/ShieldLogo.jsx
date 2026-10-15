import React from 'react';

/**
 * ShieldLogo — Unified vector SVG brand logo.
 * Ensures 100% pixel-perfect, identical brand rendering across
 * Desktop, Mobile, Tablet, and all OS platforms (iOS, Android, Windows, Mac).
 */
export default function ShieldLogo({ size = 26, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`brand-shield-svg ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="shieldGrad" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="0.5" stopColor="#0284c7" />
          <stop offset="1" stopColor="#1e1b4b" />
        </linearGradient>
        <linearGradient id="shieldStroke" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>
        <filter id="shieldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#38bdf8" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Outer Shield Path */}
      <path
        d="M16 3L6 7V15C6 21.6 10.3 27.7 16 29C21.7 27.7 26 21.6 26 15V7L16 3Z"
        fill="url(#shieldGrad)"
        stroke="url(#shieldStroke)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        filter="url(#shieldGlow)"
      />

      {/* Inner Cyber Keyhole / Core Emblem */}
      <circle cx="16" cy="13.5" r="2.8" fill="#ffffff" />
      <path
        d="M14.5 15.5L13.8 21H18.2L17.5 15.5H14.5Z"
        fill="#ffffff"
      />
    </svg>
  );
}

