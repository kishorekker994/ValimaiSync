import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import { WorkoutsProvider, useWorkouts } from '../../hooks/useWorkouts';
import { RefreshCw, Bell } from 'lucide-react';

function TopAppBar() {
  const { refreshData, loading } = useWorkouts();

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[var(--color-surface-glass)] shadow-sm flex justify-between items-center px-5 h-16">
      <div className="flex items-center gap-3">
        <img alt="ValimaiSync Logo" className="w-10 h-10 object-contain" src="/logo.svg" />
        <h1 className="text-headline-lg-mobile font-extrabold text-[var(--color-primary)]">ValimaiSync</h1>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={refreshData}
          disabled={loading}
          className="w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 duration-200 hover:bg-[var(--color-surface-variant)]/20 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={22} className={`text-[var(--color-primary)] ${loading ? 'animate-spin' : ''}`} />
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 duration-200 hover:bg-[var(--color-surface-variant)]/20 cursor-pointer">
          <Bell size={22} className="text-[var(--color-primary)]" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center text-white font-bold overflow-hidden">
          <span className="text-sm">V</span>
        </div>
      </div>
    </header>
  );
}

function AppLayoutInner() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface-background)] font-body-lg text-[var(--color-on-surface)]">
      <TopAppBar />
      <main className="flex-1 pt-20 pb-24 px-5 max-w-md mx-auto w-full">
        <Outlet />
      </main>
      <BottomNav />
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
