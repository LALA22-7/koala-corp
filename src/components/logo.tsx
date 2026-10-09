'use client';

import React from 'react';
import Image from 'next/image';

/**
 * Koala Corp. Brand Logo Components
 * Uses the authentic Friendly Koala Corp. artwork uploaded by the user,
 * with mathematically centered ambient glow and proportional typography.
 */

export function KoalaLogo({
  size = 48,
  className = '',
  animate = true,
  withGlow = false,
}: {
  size?: number;
  className?: string;
  animate?: boolean;
  withGlow?: boolean;
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${animate ? 'hover:scale-105 transition-all duration-300' : ''} ${className}`}
      style={{ height: `${size}px` }}
    >
      {withGlow && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-koala-lime/25 dark:bg-koala-lime/20 rounded-full blur-lg pointer-events-none transition-all duration-300"
          style={{ width: `${size * 1.25}px`, height: `${size * 1.25}px` }}
        />
      )}
      <Image
        src="/koala-mascot.png"
        alt="Koala Corp. Mascot"
        width={Math.round(size * 1.82)}
        height={size}
        priority
        className={`object-contain drop-shadow-md select-none transition-transform duration-300 relative z-10 ${animate ? 'animate-float' : ''}`}
        style={{
          height: `${size}px`,
          width: `${Math.round(size * 1.82)}px`,
        }}
      />
    </div>
  );
}

export function KoalaWordmark({
  className = '',
  showLogo = false,
  size = 40,
}: {
  className?: string;
  showLogo?: boolean;
  size?: number;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {showLogo && <KoalaLogo size={size} />}
      <span className="font-[family-name:var(--font-display)] font-bold text-base tracking-tight select-none flex items-center leading-none">
        <span>koala</span>
        <span className="ml-1 text-white/95">corp</span>
        <span className="text-koala-lime font-black text-lg leading-none ml-0.5">.</span>
      </span>
    </div>
  );
}

export function KoalaFullBrand({
  width = 200,
  className = '',
}: {
  width?: number;
  className?: string;
}) {
  return (
    <div className={`relative inline-block ${className}`} style={{ width }}>
      <Image
        src="/koala-brand-full.png"
        alt="Koala Corp."
        width={width}
        height={Math.round(width * 0.71)}
        className="object-contain w-full h-auto drop-shadow-lg"
      />
    </div>
  );
}

export function KoalaBadge({
  size = 52,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden shadow-lg border border-white/20 dark:border-white/10 flex items-center justify-center bg-[#A6F33C] p-1.5 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/koala-mascot.png"
        alt="Koala Badge"
        width={size * 1.4}
        height={size * 1.1}
        className="object-contain h-full w-auto drop-shadow-sm"
      />
    </div>
  );
}
