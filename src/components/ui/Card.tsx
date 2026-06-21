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
    raised: `
      bg-[var(--color-card-bg)] 
      border border-[var(--color-card-border)]
      rounded-[var(--radius-lg)]
      shadow-[var(--shadow-card)]
      p-[var(--spacing-card)]
      transition-all duration-200
      hover:shadow-[var(--shadow-card-hover)]
      hover:border-[var(--color-card-border-hover)]
      hover:-translate-y-[1px]
    `,
    inset: `
      bg-[var(--color-bg-muted)]
      border border-[rgba(0,0,0,0.05)]
      rounded-[var(--radius-md)]
      shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)]
      p-4
    `,
    flat: `
      bg-[var(--color-bg-subtle)]
      border border-[var(--color-card-border)]
      rounded-[var(--radius-lg)]
      p-[var(--spacing-card)]
    `,
    hero: `
      bg-gradient-to-br from-[#f0f7ff] via-[#e8f2ff] to-[#f5f0ff]
      border border-[rgba(0,122,255,0.12)]
      rounded-[var(--radius-xl)]
      shadow-[var(--shadow-card)]
      p-9
      transition-all duration-200
    `,
    accent: `
      bg-[var(--color-accent)]
      rounded-[var(--radius-lg)]
      shadow-[0_8px_24px_rgba(0,122,255,0.35)]
      p-[var(--spacing-card)]
      text-white
      transition-all duration-200
      hover:shadow-[0_12px_32px_rgba(0,122,255,0.45)]
      hover:-translate-y-[1px]
    `,
    stat: `
      bg-[var(--color-card-bg)]
      border border-[var(--color-card-border)]
      rounded-[var(--radius-lg)]
      shadow-[var(--shadow-card)]
      p-6
      transition-all duration-200
      hover:shadow-[var(--shadow-card-hover)]
      hover:border-[var(--color-card-border-hover)]
      hover:-translate-y-[2px]
    `,
  };

  const glowClass = glow ? 'hover:shadow-[var(--shadow-card-blue)] hover:border-[var(--color-accent)]/30' : '';

  return (
    <div
      className={`${variantClasses[variant]} ${glowClass} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
