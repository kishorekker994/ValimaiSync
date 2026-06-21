import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { WorkoutsProvider, useWorkouts } from '../../hooks/useWorkouts';
import { RefreshCw } from 'lucide-react';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Your fitness command center' },
  '/analytics': { title: 'Analytics', subtitle: 'Deep dive into your performance trends' },
  '/uploads': { title: 'Upload History', subtitle: 'Manage your workout screenshots' },
};

function Topbar() {
  const location = useLocation();
  const { refreshData, loading } = useWorkouts();
  const meta = PAGE_TITLES[location.pathname] ?? { title: 'ValimaiSync', subtitle: '' };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 lg:px-8 py-4 bg-[var(--color-bg-base)]/80 backdrop-blur-[12px] border-b border-[rgba(0,0,0,0.06)]">
      {/* Left: page title */}
      <div>
        <h2 className="text-[17px] font-semibold text-[var(--color-text-primary)] leading-tight">
          {meta.title}
        </h2>
        <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">{meta.subtitle}</p>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {/* Refresh */}
        <button
          onClick={() => refreshData()}
          disabled={loading}
          title="Refresh data"
          className="
            flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)]
            text-sm font-medium text-[var(--color-text-secondary)]
            bg-[var(--color-card-bg)] border border-[var(--color-card-border)]
            shadow-[var(--shadow-card)] hover:border-[var(--color-accent)]/30
            hover:text-[var(--color-accent)] hover:shadow-[var(--shadow-card-blue)]
            transition-all duration-150 cursor-pointer disabled:opacity-50
          "
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* App badge */}
        <div className="
          flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)]
          bg-[var(--color-accent)] text-white text-sm font-semibold
          shadow-[0_4px_12px_rgba(0,122,255,0.3)]
        ">
          <span className="w-2 h-2 rounded-full bg-white/70 animate-pulse-dot" />
          <span>ValimaiSync</span>
        </div>
      </div>
    </header>
  );
}

function AppLayoutInner() {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg-base)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-7">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AppLayout() {
  return (
    <WorkoutsProvider>
      <AppLayoutInner />
    </WorkoutsProvider>
  );
}
