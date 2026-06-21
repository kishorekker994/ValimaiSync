import { Flame, Heart, Timer, Zap, TrendingUp, Calendar } from 'lucide-react';
import Card from '../components/ui/Card';
import { todayWorkout, mockWorkouts, HR_ZONES } from '../data/mockData';
import { formatDuration, formatCalories, formatHeartRate, formatDate } from '../utils/formatters';

function MetricCard({ icon: Icon, label, value, unit, color, trend }: {
  icon: any;
  label: string;
  value: string | number;
  unit: string;
  color: string;
  trend?: string;
}) {
  return (
    <Card variant="raised" glow>
      <div className="flex items-start justify-between">
        <div
          className="p-3 rounded-[var(--radius-md)]"
          style={{ backgroundColor: `${color}18`, color }}
        >
          <Icon size={22} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs font-medium text-[var(--color-success)]">
            <TrendingUp size={12} /> {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-3xl font-bold text-[var(--color-text-primary)] font-[var(--font-heading)]">{value}</span>
          <span className="text-sm text-[var(--color-text-secondary)]">{unit}</span>
        </div>
      </div>
    </Card>
  );
}

function HRZoneBar({ zones }: { zones: typeof todayWorkout.hrZones }) {
  const totalMinutes = zones.reduce((s, z) => s + z.minutes, 0);
  return (
    <Card variant="raised">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 font-[var(--font-heading)]">
        Heart Rate Zones
      </h3>
      {/* Stacked Bar */}
      <div className="flex h-5 rounded-full overflow-hidden mb-5 shadow-[var(--shadow-neu-inset)]">
        {zones.map((zone, i) => (
          <div
            key={i}
            style={{ width: `${zone.percentage}%`, backgroundColor: zone.color }}
            className="transition-all duration-500 first:rounded-l-full last:rounded-r-full"
            title={`${zone.name}: ${zone.minutes} min`}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {zones.map((zone, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: zone.color }} />
            <div>
              <p className="text-xs text-[var(--color-text-secondary)]">{zone.name}</p>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                {zone.minutes} <span className="text-xs font-normal text-[var(--color-text-muted)]">min</span>
                <span className="text-xs text-[var(--color-text-muted)] ml-1">({zone.percentage}%)</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RecentWorkouts() {
  const recent = mockWorkouts.slice(-7).reverse();
  return (
    <Card variant="raised">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] font-[var(--font-heading)]">
          Recent Workouts
        </h3>
        <span className="text-xs text-[var(--color-text-muted)]">Last 7 sessions</span>
      </div>
      <div className="space-y-2.5">
        {recent.map((w) => (
          <div
            key={w.id}
            className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--color-neu-inset)] shadow-[var(--shadow-neu-inset)] transition-all duration-200 hover:bg-[var(--color-neu-surface)]/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--color-accent-glow)] flex items-center justify-center text-[var(--color-accent)]">
                <Zap size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{w.type}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{formatDate(w.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{w.calories}</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">kcal</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{w.avgHR}</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">bpm</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{formatDuration(w.durationSeconds)}</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">time</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const w = todayWorkout;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm mb-1">
          <Calendar size={14} />
          <span>{formatDate(new Date())}</span>
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] font-[var(--font-heading)]">
          Today's Overview
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">
          Latest workout: <span className="text-[var(--color-accent)] font-medium">{w.type}</span>
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        <MetricCard icon={Flame} label="Calories Burned" value={w.calories} unit="kcal" color="#EF4444" trend="+12%" />
        <MetricCard icon={Heart} label="Avg Heart Rate" value={w.avgHR} unit="bpm" color="#F97316" trend="+3%" />
        <MetricCard icon={Timer} label="Duration" value={formatDuration(w.durationSeconds)} unit="" color="#3B82F6" />
        <MetricCard icon={Zap} label="METs" value={w.mets} unit="MET" color="#22C55E" />
      </div>

      {/* HR Zones + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <HRZoneBar zones={w.hrZones} />
        <RecentWorkouts />
      </div>
    </div>
  );
}
