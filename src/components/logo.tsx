import React from 'react';

/**
 * Koala Corp. logo — SVG rendition of the brand koala mascot.
 * Uses grey tones matching the original logo on lime background.
 */
export function KoalaLogo({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Koala Corp. logo">
      {/* Ears */}
      <circle cx="28" cy="28" r="16" fill="#A0A49B" />
      <circle cx="72" cy="28" r="16" fill="#A0A49B" />
      <circle cx="28" cy="28" r="9" fill="#C8CAC4" />
      <circle cx="72" cy="28" r="9" fill="#C8CAC4" />
      {/* Head */}
      <ellipse cx="50" cy="50" rx="30" ry="28" fill="#A0A49B" />
      {/* Face */}
      <ellipse cx="50" cy="52" rx="22" ry="20" fill="#C8CAC4" />
      {/* Eyes */}
      <circle cx="40" cy="46" r="4" fill="#3A3D38" />
      <circle cx="60" cy="46" r="4" fill="#3A3D38" />
      <circle cx="41.5" cy="44.5" r="1.5" fill="white" />
      <circle cx="61.5" cy="44.5" r="1.5" fill="white" />
      {/* Nose */}
      <ellipse cx="50" cy="55" rx="5" ry="3.5" fill="#3A3D38" />
      <ellipse cx="50" cy="54.5" rx="2" ry="1" fill="#5A5D58" />
      {/* Mouth */}
      <path d="M47 58 Q50 61 53 58" stroke="#3A3D38" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Branch hint */}
      <path d="M72 65 Q78 72 76 85" stroke="#8B7355" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M74 75 Q79 73 82 76" stroke="#8B7355" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Paw on branch */}
      <ellipse cx="73" cy="66" rx="5" ry="4" fill="#A0A49B" />
    </svg>
  );
}

export function KoalaWordmark({ className }: { className?: string }) {
  return (
    <span className={`font-[family-name:var(--font-display)] font-semibold text-lg tracking-tight ${className || ''}`}>
      koala corp<span className="text-koala-lime">.</span>
    </span>
  );
}
