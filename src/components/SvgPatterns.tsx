import React from 'react';

/**
 * Reusable SVG pattern definitions for color-blind accessibility mode
 */
export const SvgPatterns: React.FC = () => {
  return (
    <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
      <defs>
        {/* Dots */}
        <pattern id="pattern-dots" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="1.8" fill="rgba(255,255,255,0.7)" />
        </pattern>

        {/* Stripes */}
        <pattern id="pattern-stripes" width="10" height="10" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(255,255,255,0.7)" strokeWidth="3" />
        </pattern>

        {/* Grid */}
        <pattern id="pattern-grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
        </pattern>

        {/* Waves */}
        <pattern id="pattern-waves" width="14" height="10" patternUnits="userSpaceOnUse">
          <path d="M 0 5 Q 3.5 0 7 5 T 14 5" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2.2" />
        </pattern>

        {/* Chevrons */}
        <pattern id="pattern-chevrons" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M 0 4 L 6 9 L 12 4" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.2" />
        </pattern>

        {/* Diamonds */}
        <pattern id="pattern-diamonds" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M 6 0 L 12 6 L 6 12 L 0 6 Z" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
        </pattern>

        {/* Cross */}
        <pattern id="pattern-cross" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M 6 2 L 6 10 M 2 6 L 10 6" stroke="rgba(255,255,255,0.75)" strokeWidth="2" />
        </pattern>

        {/* Diagonal */}
        <pattern id="pattern-diagonal" width="8" height="8" patternUnits="userSpaceOnUse">
          <line x1="0" y1="8" x2="8" y2="0" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
        </pattern>

        {/* Rings */}
        <pattern id="pattern-rings" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="3.5" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
        </pattern>

        {/* Zigzag */}
        <pattern id="pattern-zigzag" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 0 0 L 5 5 L 10 0" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
        </pattern>

        {/* Stars */}
        <pattern id="pattern-stars" width="14" height="14" patternUnits="userSpaceOnUse">
          <polygon points="7,1 9,5 13,5 10,8 11,12 7,9 3,12 4,8 1,5 5,5" fill="rgba(255,255,255,0.65)" />
        </pattern>

        {/* Honeycomb */}
        <pattern id="pattern-honeycomb" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M 7 1 L 13 4 L 13 10 L 7 13 L 1 10 L 1 4 Z" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" />
        </pattern>
      </defs>
    </svg>
  );
};
