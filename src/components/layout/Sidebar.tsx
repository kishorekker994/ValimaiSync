import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Upload, Activity, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
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
    if (confirm("WARNING: This will permanently delete ALL workouts, screenshots, and HR zones from the database. Are you absolutely sure?")) {
      await clearAllData();
      alert("All data has been cleared.");
    }
  };

  return (
    <aside
      className={`
        flex flex-col h-screen sticky top-0
        bg-[var(--color-neu-surface)] shadow-[var(--shadow-neu-raised)]
        transition-all duration-300 ease-in-out z-50 border-r border-[var(--color-neu-border)]
        ${collapsed ? 'w-[72px]' : 'w-[240px]'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 border-b border-[var(--color-neu-border)]/50">
        <div className="flex-shrink-0 w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--color-accent)] flex items-center justify-center shadow-[var(--shadow-glow-accent)]">
          <Activity size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-[var(--color-text-primary)] whitespace-nowrap font-[var(--font-heading)]">
              ValimaiSync
            </h1>
            <p className="text-[10px] text-[var(--color-text-muted)] tracking-wider uppercase">
              Fitness Tracker
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]
              transition-all duration-200 group relative
              ${isActive
                ? 'bg-[var(--color-neu-inset)] text-[var(--color-accent)] shadow-[var(--shadow-neu-inset)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-neu-raised)]'
              }
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--color-accent)] rounded-r-full" />
                )}
                <Icon size={20} className="flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">{label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-[var(--color-neu-border)]/50 space-y-2">
        <button
          onClick={handleClearData}
          title="Clear All Data"
          className="
            w-full flex items-center justify-center gap-2 px-3 py-2
            rounded-[var(--radius-sm)] text-[var(--color-error)]
            bg-[var(--color-neu-surface)] hover:bg-[var(--color-error)] hover:text-white
            shadow-[var(--shadow-neu-button)] hover:shadow-none
            transition-all duration-200 cursor-pointer border-none text-sm font-medium
          "
        >
          <Trash2 size={16} />
          {!collapsed && <span>Clear All Data</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="
            w-full flex items-center justify-center gap-2 px-3 py-2
            rounded-[var(--radius-sm)] text-[var(--color-text-muted)]
            bg-[var(--color-neu-inset)] shadow-[var(--shadow-neu-inset)]
            hover:text-[var(--color-text-primary)] transition-all duration-200
            cursor-pointer border-none text-sm
          "
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> <span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
