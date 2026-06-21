import { NavLink } from 'react-router-dom';
import { Home, BarChart3, Upload, Settings } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center pt-3 pb-safe px-4 bg-[var(--color-surface-glass)] backdrop-blur-xl z-50 shadow-[0px_-4px_20px_rgba(26,32,44,0.08)] rounded-t-xl h-[70px]">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `
          flex flex-col items-center justify-center transition-transform active:scale-90 duration-150
          ${isActive ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-on-surface-variant)]/60 hover:text-[var(--color-primary)]'}
        `}
      >
        <Home size={24} strokeWidth={2.5} />
        <span className="text-label-caps text-[10px] mt-1">Home</span>
      </NavLink>

      <NavLink
        to="/analytics"
        className={({ isActive }) => `
          flex flex-col items-center justify-center transition-transform active:scale-90 duration-150
          ${isActive ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-on-surface-variant)]/60 hover:text-[var(--color-primary)]'}
        `}
      >
        <BarChart3 size={24} strokeWidth={2.5} />
        <span className="text-label-caps text-[10px] mt-1">Analytics</span>
      </NavLink>

      <NavLink
        to="/uploads"
        className={({ isActive }) => `
          flex flex-col items-center justify-center transition-transform active:scale-90 duration-150
          ${isActive ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-on-surface-variant)]/60 hover:text-[var(--color-primary)]'}
        `}
      >
        <Upload size={24} strokeWidth={2.5} />
        <span className="text-label-caps text-[10px] mt-1">Uploads</span>
      </NavLink>

      <div
        className="flex flex-col items-center justify-center text-[var(--color-on-surface-variant)]/60 hover:text-[var(--color-primary)] transition-transform active:scale-90 duration-150 cursor-pointer"
        onClick={() => alert("Settings coming soon")}
      >
        <Settings size={24} strokeWidth={2.5} />
        <span className="text-label-caps text-[10px] mt-1">Settings</span>
      </div>
    </nav>
  );
}
