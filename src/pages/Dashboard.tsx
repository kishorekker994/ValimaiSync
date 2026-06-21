import {
  Flame, Heart, Timer, Zap, TrendingUp, Calendar, AlertCircle,
  RefreshCw, UploadCloud, BarChart3, Plus, ArrowRight, Activity,
  ChevronRight, Clock,
} from 'lucide-react';
import Card from '../components/ui/Card';
import { useWorkouts } from '../hooks/useWorkouts';
import { HR_ZONES } from '../utils/constants';
import { formatDuration, formatCalories, formatHeartRate, formatDate } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

/* ── Error State ── */
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in-up">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-error-light)] flex items-center justify-center mb-5 shadow-[0_4px_16px_rgba(255,59,48,0.15)]">
        <AlertCircle size={32} className="text-[var(--color-error)]" />
      </div>
      <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
        Failed to load data
      </h2>
      <p className="text-[var(--color-text-secondary)] text-sm max-w-sm leading-relaxed mb-1">
        Could not connect to the database. Make sure you're running with{' '}
        <code className="bg-[var(--color-bg-muted)] px-1.5 py-0.5 rounded text-[var(--color-accent)] font-mono text-xs">
          netlify dev
        </code>
        {' '}and your <code className="bg-[var(--color-bg-muted)] px-1.5 py-0.5 rounded text-[var(--color-accent)] font-mono text-xs">DATABASE_URL</code> is set in{' '}
        <code className="bg-[var(--color-bg-muted)] px-1.5 py-0.5 rounded font-mono text-xs text-[var(--color-text-muted)]">.env</code>.
      </p>
      <p className="text-[var(--color-text-muted)] text-xs mb-6">
        Error: {error}
      </p>
      <button
        onClick={onRetry}
        className="
          flex items-center gap-2 px-6 py-2.5 rounded-[var(--radius-md)]
          bg-[var(--color-accent)] text-white text-sm font-semibold
          shadow-[0_4px_16px_rgba(0,122,255,0.3)]
          hover:bg-[var(--color-accent-hover)] hover:shadow-[0_6px_20px_rgba(0,122,255,0.4)]
          transition-all duration-150 cursor-pointer border-none
        "
      >
        <RefreshCw size={15} />
        Retry Connection
      </button>
    </div>
  );
}

/* ── Skeleton Loader ── */
function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-64 skeleton" />
        <div className="h-64 skeleton" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[0,1,2,3].map(i => <div key={i} className="h-32 skeleton" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="h-48 skeleton" />
        <div className="h-48 skeleton" />
      </div>
    </div>
  );
}

/* ── Metric Stat Card ── */
function MetricCard({
  icon: Icon, label, value, unit, color, colorLight, trend
}: {
  icon: any; label: string; value: string | number;
  unit: string; color: string; colorLight: string; trend?: string;
}) {
  return (
    <Card variant="stat" glow>
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center"
          style={{ backgroundColor: colorLight, color }}
        >
          <Icon size={20} />
        </div>
        {trend && (
          <span
            className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: colorLight, color }}
          >
            <TrendingUp size={10} /> {trend}
          </span>
        )}
      </div>
      <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[28px] font-bold text-[var(--color-text-primary)] leading-none">{value}</span>
        {unit && <span className="text-sm text-[var(--color-text-muted)] font-medium">{unit}</span>}
      </div>
    </Card>
  );
}

/* ── Quick Action Button ── */
function QuickAction({
  icon: Icon, title, desc, onClick, accentColor = 'var(--color-accent)'
}: {
  icon: any; title: string; desc: string; onClick?: () => void; accentColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="
        w-full flex items-center gap-4 p-4 rounded-[var(--radius-md)]
        bg-[var(--color-card-bg)] border border-[var(--color-card-border)]
        hover:border-[var(--color-accent)]/25 hover:shadow-[var(--shadow-card-hover)]
        hover:-translate-y-[1px] transition-all duration-150
        cursor-pointer text-left group
      "
    >
      <div
        className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0 transition-transform duration-150 group-hover:scale-110"
        style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
      >
        <Icon size={17} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{title}</p>
        <p className="text-xs text-[var(--color-text-muted)] truncate">{desc}</p>
      </div>
      <ArrowRight size={15} className="text-[var(--color-text-muted)] flex-shrink-0 transition-transform duration-150 group-hover:translate-x-1" />
    </button>
  );
}

/* ── HR Zone Bar ── */
function HRZoneBar({ zones }: { zones: any[] }) {
  if (!zones || zones.length === 0) return null;
  return (
    <Card variant="raised">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Heart Rate Zones</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Latest workout distribution</p>
        </div>
        <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--color-error-light)] flex items-center justify-center">
          <Heart size={15} className="text-[var(--color-error)]" />
        </div>
      </div>

      {/* Stacked bar */}
      <div className="flex h-4 rounded-full overflow-hidden mb-5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]">
        {zones.map((zone, i) => (
          <div
            key={i}
            style={{ width: `${zone.percentage}%`, backgroundColor: zone.color }}
            className="transition-all duration-700 first:rounded-l-full last:rounded-r-full"
            title={`${zone.name}: ${zone.minutes} min`}
          />
        ))}
      </div>

      {/* Legend grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {zones.map((zone, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: zone.color }} />
            <div>
              <p className="text-[11px] text-[var(--color-text-muted)] leading-none mb-0.5">{zone.name}</p>
              <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                {zone.minutes}<span className="text-[10px] font-normal text-[var(--color-text-muted)] ml-0.5">min</span>
                <span className="text-[10px] text-[var(--color-text-muted)] ml-1">({zone.percentage}%)</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── Recent Workouts ── */
function RecentWorkouts({ workouts }: { workouts: any[] }) {
  const recent = workouts.slice(-7).reverse();
  if (recent.length === 0) return null;

  return (
    <Card variant="raised">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Recent Workouts</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Last {recent.length} sessions</p>
        </div>
        <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--color-accent-light)] flex items-center justify-center">
          <Activity size={15} className="text-[var(--color-accent)]" />
        </div>
      </div>

      <div className="space-y-2">
        {recent.map((w) => (
          <div
            key={w.id}
            className="
              flex items-center justify-between p-3 rounded-[var(--radius-md)]
              bg-[var(--color-bg-subtle)] border border-[var(--color-card-border)]
              hover:border-[var(--color-accent)]/20 hover:bg-[var(--color-accent-light)]/30
              transition-all duration-150
            "
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--color-accent-light)] flex items-center justify-center">
                <Zap size={14} className="text-[var(--color-accent)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{w.type}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{formatDate(w.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-5 text-right">
              <div>
                <p className="text-sm font-bold text-[var(--color-text-primary)]">{w.calories}</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">kcal</p>
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--color-text-primary)]">{w.avgHR}</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">bpm</p>
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--color-text-primary)]">{formatDuration(w.durationSeconds)}</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">time</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── Empty State ── */
function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in-up">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-light)] flex items-center justify-center mb-5">
        <Activity size={32} className="text-[var(--color-accent)]" />
      </div>
      <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">No Workouts Yet</h2>
      <p className="text-[var(--color-text-secondary)] text-sm max-w-xs leading-relaxed mb-6">
        Upload your first smartwatch screenshot to start tracking your fitness journey.
      </p>
      <button
        onClick={() => navigate('/uploads')}
        className="
          flex items-center gap-2 px-6 py-2.5 rounded-[var(--radius-md)]
          bg-[var(--color-accent)] text-white text-sm font-semibold
          shadow-[0_4px_16px_rgba(0,122,255,0.3)]
          hover:bg-[var(--color-accent-hover)]
          transition-all duration-150 cursor-pointer border-none
        "
      >
        <UploadCloud size={15} />
        Upload First Workout
      </button>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function Dashboard() {
  const { workouts, loading, error, refreshData } = useWorkouts();
  const navigate = useNavigate();

  if (loading) return <SkeletonDashboard />;
  if (error) return <ErrorState error={error} onRetry={refreshData} />;
  if (!workouts || workouts.length === 0) return <EmptyState />;

  const w = workouts[workouts.length - 1];

  /* Summary badges */
  const totalWorkouts = workouts.length;
  const avgCalories = Math.round(workouts.reduce((s, x) => s + x.calories, 0) / totalWorkouts);
  const avgHRAll = Math.round(workouts.reduce((s, x) => s + x.avgHR, 0) / totalWorkouts);

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* ── Hero + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Hero card (left, 2/3) */}
        <Card variant="hero" className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="tag tag-blue text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse-dot" />
              OVERVIEW
            </span>
          </div>

          <h1 className="text-[36px] sm:text-[42px] font-extrabold text-[var(--color-text-primary)] leading-[1.1] mb-2">
            Everything you{' '}
            <span className="text-[var(--color-accent)]">train, track,</span>
            <br className="hidden sm:block" />
            {' '}and achieve
          </h1>
          <p className="text-[var(--color-text-secondary)] text-[14px] leading-relaxed max-w-md mb-6">
            Review your latest performance, heart rate zones, burn stats, and the next milestone worth chasing.
          </p>

          {/* Summary badges */}
          <div className="flex flex-wrap gap-2.5">
            <span className="tag tag-muted">
              <Activity size={11} />
              {totalWorkouts} workout{totalWorkouts !== 1 ? 's' : ''} tracked
            </span>
            <span className="tag tag-orange">
              <Flame size={11} />
              {avgCalories} avg kcal
            </span>
            <span className="tag tag-blue">
              <Heart size={11} />
              {avgHRAll} avg bpm
            </span>
            <span className="tag tag-muted">
              <Calendar size={11} />
              Latest: {formatDate(w.date)}
            </span>
          </div>
        </Card>

        {/* Quick Actions (right, 1/3) */}
        <Card variant="raised" className="flex flex-col">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Quick Actions</h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Common flows at a glance</p>
          </div>
          <div className="space-y-2 flex-1">
            <QuickAction
              icon={UploadCloud}
              title="Upload Screenshot"
              desc="Add a new workout from smartwatch"
              onClick={() => navigate('/uploads')}
              accentColor="var(--color-accent)"
            />
            <QuickAction
              icon={BarChart3}
              title="View Analytics"
              desc="Heart rate & calorie trends"
              onClick={() => navigate('/analytics')}
              accentColor="var(--color-secondary)"
            />
            <QuickAction
              icon={Activity}
              title="Latest Workout"
              desc={`${w.type} · ${formatDate(w.date)}`}
              accentColor="var(--color-success)"
            />
          </div>
        </Card>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        <MetricCard
          icon={Flame}
          label="Calories Burned"
          value={w.calories}
          unit="kcal"
          color="var(--color-error)"
          colorLight="var(--color-error-light)"
          trend="+12%"
        />
        <MetricCard
          icon={Heart}
          label="Avg Heart Rate"
          value={w.avgHR}
          unit="bpm"
          color="var(--color-secondary)"
          colorLight="var(--color-secondary-light)"
          trend="+3%"
        />
        <MetricCard
          icon={Timer}
          label="Duration"
          value={formatDuration(w.durationSeconds)}
          unit=""
          color="var(--color-accent)"
          colorLight="var(--color-accent-light)"
        />
        <MetricCard
          icon={Zap}
          label="METs"
          value={w.mets}
          unit="MET"
          color="var(--color-success)"
          colorLight="var(--color-success-light)"
        />
      </div>

      {/* ── HR Zones + Recent Workouts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <HRZoneBar zones={w.hrZones} />
        <RecentWorkouts workouts={workouts} />
      </div>

    </div>
  );
}
