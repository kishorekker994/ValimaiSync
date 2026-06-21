import { useState } from 'react';

interface Tab {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
}

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="inline-flex bg-[var(--color-neu-inset)] shadow-[var(--shadow-neu-inset)] rounded-[var(--radius-md)] p-1 gap-1">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`
              relative px-5 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium
              transition-all duration-300 cursor-pointer outline-none
              ${
                isActive
                  ? 'bg-[var(--color-neu-surface)] shadow-[var(--shadow-neu-button)] text-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }
            `}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[var(--color-accent)] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
