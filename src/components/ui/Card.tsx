import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'raised' | 'inset' | 'flat';
  glow?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', variant = 'raised', glow = false, onClick }: CardProps) {
  const base = 'p-[var(--spacing-card)] transition-all duration-300';

  const variants = {
    raised: 'bg-[var(--color-neu-surface)] shadow-[var(--shadow-neu-raised)] rounded-[var(--radius-lg)]',
    inset: 'bg-[var(--color-neu-inset)] shadow-[var(--shadow-neu-inset)] rounded-[var(--radius-md)]',
    flat: 'bg-[var(--color-neu-surface)]/60 border border-[var(--color-neu-border)]/30 rounded-[var(--radius-lg)]',
  };

  const glowClass = glow ? 'hover:shadow-[var(--shadow-glow-accent)]' : 'hover:translate-y-[-2px]';

  return (
    <div
      className={`${base} ${variants[variant]} ${glowClass} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
