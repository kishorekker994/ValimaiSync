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
      bg-[var(--color-primary)] text-[var(--color-on-primary)] font-semibold
      shadow-md
      hover:shadow-lg hover:brightness-110
      active:shadow-sm active:scale-[0.97]
    `,
    secondary: `
      bg-[var(--color-surface-dim)] text-[var(--color-on-surface)]
      shadow-sm border border-[var(--color-outline-variant)]/50
      hover:shadow-md hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-variant)]
      active:shadow-none active:scale-[0.97]
    `,
    ghost: `
      bg-transparent text-[var(--color-on-surface-variant)]
      hover:bg-[var(--color-surface-dim)] hover:text-[var(--color-on-surface)]
      active:scale-[0.97]
    `,
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
