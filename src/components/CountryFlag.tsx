import React from 'react';
import type { TargetCountry } from '../engine/types';

interface CountryFlagProps {
  code: TargetCountry;
  size?: number;
  style?: React.CSSProperties;
}

/**
 * Crisp inline SVG flags for Canada (CA), Germany (DE), and United States (US).
 * Windows 10/11 does not render Unicode regional flag emojis (🇩🇪, 🇺🇸, 🇨🇦) as flags
 * (it renders plain letters "DE", "US", "CA" instead). Using inline SVG guarantees
 * real, sharp flags on Windows, macOS, iOS, and Android.
 */
export const CountryFlag: React.FC<CountryFlagProps> = ({ code, size = 22, style }) => {
  const width = Math.round(size * 1.4);
  const height = size;

  const wrapperStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width,
    height,
    borderRadius: Math.max(3, Math.round(size * 0.18)),
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.08)',
    flexShrink: 0,
    verticalAlign: 'middle',
    ...style,
  };

  if (code === 'DE') {
    // Germany Flag: Black, Red, Gold horizontal stripes
    return (
      <span style={wrapperStyle} role="img" aria-label="Germany flag">
        <svg viewBox="0 0 30 20" width="100%" height="100%" preserveAspectRatio="none">
          <rect width="30" height="6.67" y="0" fill="#111111" />
          <rect width="30" height="6.67" y="6.67" fill="#DD0000" />
          <rect width="30" height="6.67" y="13.33" fill="#FFCE00" />
        </svg>
      </span>
    );
  }

  if (code === 'US') {
    // USA Flag: 13 red & white stripes + blue canton with stars
    return (
      <span style={wrapperStyle} role="img" aria-label="United States flag">
        <svg viewBox="0 0 38 26" width="100%" height="100%" preserveAspectRatio="none">
          <rect width="38" height="26" fill="#FFFFFF" />
          {/* 7 Red Stripes */}
          <rect width="38" height="2" y="0" fill="#B22234" />
          <rect width="38" height="2" y="4" fill="#B22234" />
          <rect width="38" height="2" y="8" y2="10" fill="#B22234" />
          <rect width="38" height="2" y="12" fill="#B22234" />
          <rect width="38" height="2" y="16" fill="#B22234" />
          <rect width="38" height="2" y="20" fill="#B22234" />
          <rect width="38" height="2" y="24" fill="#B22234" />
          {/* Blue Canton */}
          <rect width="16" height="14" x="0" y="0" fill="#3C3B6E" />
          {/* Crisp Star Grid in Canton */}
          <g fill="#FFFFFF">
            <circle cx="2.7" cy="2.5" r="0.85" />
            <circle cx="6.2" cy="2.5" r="0.85" />
            <circle cx="9.7" cy="2.5" r="0.85" />
            <circle cx="13.2" cy="2.5" r="0.85" />

            <circle cx="4.4" cy="4.8" r="0.85" />
            <circle cx="8.0" cy="4.8" r="0.85" />
            <circle cx="11.5" cy="4.8" r="0.85" />

            <circle cx="2.7" cy="7.0" r="0.85" />
            <circle cx="6.2" cy="7.0" r="0.85" />
            <circle cx="9.7" cy="7.0" r="0.85" />
            <circle cx="13.2" cy="7.0" r="0.85" />

            <circle cx="4.4" cy="9.2" r="0.85" />
            <circle cx="8.0" cy="9.2" r="0.85" />
            <circle cx="11.5" cy="9.2" r="0.85" />

            <circle cx="2.7" cy="11.5" r="0.85" />
            <circle cx="6.2" cy="11.5" r="0.85" />
            <circle cx="9.7" cy="11.5" r="0.85" />
            <circle cx="13.2" cy="11.5" r="0.85" />
          </g>
        </svg>
      </span>
    );
  }

  // Canada Flag (CA): Red-White-Red with iconic Red Maple Leaf
  return (
    <span style={wrapperStyle} role="img" aria-label="Canada flag">
      <svg viewBox="0 0 36 24" width="100%" height="100%" preserveAspectRatio="none">
        <rect width="36" height="24" fill="#FFFFFF" />
        <rect width="9" height="24" x="0" y="0" fill="#D80621" />
        <rect width="9" height="24" x="27" y="0" fill="#D80621" />
        <path
          fill="#D80621"
          d="M18 3.5 L19.4 7.2 L21.2 6.4 L20.4 10.2 L23.5 8.8 L22.8 10.6 L25 11.4 L21.8 14.2 L22.4 15.8 L18.7 15.3 L18.9 19.8 L17.1 19.8 L17.3 15.3 L13.6 15.8 L14.2 14.2 L11 11.4 L13.2 10.6 L12.5 8.8 L15.6 10.2 L14.8 6.4 L16.6 7.2 Z"
        />
      </svg>
    </span>
  );
};
