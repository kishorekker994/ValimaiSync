import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Upload, ChevronLeft, ChevronRight, Trash2, Zap, Activity } from 'lucide-react';
import { useState } from 'react';
import { useWorkouts } from '../../hooks/useWorkouts';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/uploads', icon: Upload, label: 'Upload History' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { clearAllData } = useWorkouts();

  const handleClearData = async () => {
    if (confirm('WARNING: This will permanently delete ALL workouts, screenshots, and HR zones from the database. Are you absolutely sure?')) {
      await clearAllData();
      alert('All data has been cleared.');
    }
  };

  return (
    <aside
      className={`
        flex flex-col h-screen sticky top-0 z-50
        bg-[var(--color-sidebar-bg)]
        border-r border-[var(--color-sidebar-border)]
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[240px]'}
      `}
    >
      {/* ── Logo ── */}
      <div className={`
        flex items-center gap-3 border-b border-[var(--color-sidebar-border)]
        ${collapsed ? 'px-4 py-5 justify-center' : 'px-5 py-5'}
      `}>
        {/* Icon mark */}
        <div className="flex-shrink-0 w-9 h-9 rounded-[10px] bg-[var(--color-accent)] flex items-center justify-center shadow-[0_4px_12px_rgba(0,122,255,0.3)]">
          <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
            <polygon points="12,3 19,3 14.5,14 20,14 9,29 13.5,18 8,18" fill="white" />
            <polyline points="15,20 17,20 18.5,16 20,22 21.5,12 23,22 24.5,18 27,18"
              stroke="rgba(255,255,255,0.65)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>

        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-[15px] font-bold text-[var(--color-text-primary)] whitespace-nowrap leading-tight">
              ValimaiSync
            </h1>
            <p className="text-[10px] text-[var(--color-text-muted)] tracking-[1.2px] uppercase mt-0.5">
              Fitness Tracker
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-[1.2px] px-3 pb-2 pt-1">
            Menu
          </p>
        )}
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={collapsed ? label : undefined}
            className={({ isActive }) => `
              flex items-center gap-3 rounded-[var(--radius-md)]
              transition-all duration-150 group relative
              ${collapsed ? 'px-0 py-3 justify-center' : 'px-3 py-2.5'}
              ${isActive
                ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-sidebar-hover-bg)]'
              }
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--color-accent)] rounded-r-full" />
                )}
                <Icon
                  size={18}
                  className={`flex-shrink-0 transition-colors ${isActive ? 'text-[var(--color-accent)]' : ''}`}
                />
                {!collapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">{label}</span>
                )}
                {/* Active dot for collapsed */}
                {collapsed && isActive && (
                  <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--color-accent)]" />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* ── Divider + Tools ── */}
        <div className="my-3 border-t border-[var(--color-sidebar-border)]" />

        {!collapsed && (
          <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-[1.2px] px-3 pb-2">
            Tools
          </p>
        )}

        {/* Sync pulse indicator */}
        <div className={`
          flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5
          ${collapsed ? 'px-0 justify-center' : 'px-3'}
        `}>
          <div className="relative flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
            <div className="absolute inset-0 rounded-full bg-[var(--color-success)] animate-pulse-dot opacity-50" />
          </div>
          {!collapsed && (
            <span className="text-sm text-[var(--color-text-muted)]">DB Connected</span>
          )}
        </div>
      </nav>

      {/* ── Footer ── */}
      <div className={`border-t border-[var(--color-sidebar-border)] p-3 space-y-1`}>
        {/* User avatar row */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-[var(--radius-md)] hover:bg-[var(--color-sidebar-hover-bg)] transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              V
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">ValimaiSync</p>
              <p className="text-[11px] text-[var(--color-text-muted)]">Personal</p>
            </div>
          </div>
        )}

        <button
          onClick={handleClearData}
          title="Clear All Data"
          className={`
            w-full flex items-center gap-2 rounded-[var(--radius-sm)]
            text-[var(--color-error)] text-sm font-medium
            hover:bg-[var(--color-error-light)] transition-all duration-150
            cursor-pointer border-none bg-transparent py-2
            ${collapsed ? 'justify-center px-0' : 'px-3'}
          `}
        >
          <Trash2 size={15} />
          {!collapsed && <span>Clear All Data</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`
            w-full flex items-center gap-2 rounded-[var(--radius-sm)]
            text-[var(--color-text-muted)] text-sm
            hover:text-[var(--color-text-primary)] hover:bg-[var(--color-sidebar-hover-bg)]
            transition-all duration-150 cursor-pointer border-none bg-transparent py-2
            ${collapsed ? 'justify-center px-0' : 'px-3'}
          `}
        >
          {collapsed ? <ChevronRight size={15} /> : <><ChevronLeft size={15} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
