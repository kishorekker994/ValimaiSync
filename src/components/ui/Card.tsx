import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'raised' | 'inset' | 'flat' | 'hero' | 'accent' | 'stat';
  glow?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', variant = 'raised', glow = false, onClick }: CardProps) {
  const variantClasses = {
    raised: `glass-card rounded-2xl p-5`,
    inset: `bg-[var(--color-surface-dim)] rounded-xl p-4 border border-[var(--color-outline-variant)]/30`,
    flat: `bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-outline-variant)]`,
    hero: `glass-card premium-gradient rounded-3xl p-6 text-white`,
    accent: `gold-accent rounded-2xl p-5 text-white shadow-lg`,
    stat: `glass-card rounded-2xl p-6`,
  };

  const glowClass = glow ? 'hover:shadow-[0px_10px_30px_rgba(46,125,94,0.15)] hover:border-[var(--color-success-emerald)]/30 transition-all cursor-pointer' : '';

  return (
    <div
      className={`${variantClasses[variant]} ${glowClass} ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
