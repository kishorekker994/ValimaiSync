import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', size = 'md', icon, children, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 cursor-pointer outline-none border-none';

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-[var(--radius-sm)]',
    md: 'px-5 py-2.5 text-sm rounded-[var(--radius-md)]',
    lg: 'px-7 py-3.5 text-base rounded-[var(--radius-md)]',
  };

  const variants = {
    primary: `
      bg-[var(--color-accent)] text-white font-semibold
      shadow-[var(--shadow-neu-button)]
      hover:shadow-[var(--shadow-glow-accent)] hover:brightness-110
      active:shadow-[var(--shadow-neu-button-active)] active:scale-[0.97]
    `,
    secondary: `
      bg-[var(--color-neu-surface)] text-[var(--color-text-primary)]
      shadow-[var(--shadow-neu-button)]
      hover:shadow-[var(--shadow-neu-raised)] hover:text-[var(--color-accent)]
      active:shadow-[var(--shadow-neu-button-active)]
    `,
    ghost: `
      bg-transparent text-[var(--color-text-secondary)]
      hover:bg-[var(--color-neu-surface)]/50 hover:text-[var(--color-text-primary)]
    `,
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
