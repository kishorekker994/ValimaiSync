import { useWorkouts } from '../hooks/useWorkouts';
import { RefreshCw, Activity, Flame, Timer, TrendingUp, Heart } from 'lucide-react';
import { useMemo } from 'react';

export default function Dashboard() {
  const { workouts, loading, error, refreshData } = useWorkouts();

  const stats = useMemo(() => {
    if (!workouts || workouts.length === 0) return null;
    
    const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
    const totalSeconds = workouts.reduce((sum, w) => sum + w.durationSeconds, 0);
    const totalHours = Math.floor(totalSeconds / 3600);
    
    // Average HR across all workouts
    const avgHR = Math.round(workouts.reduce((sum, w) => sum + w.avgHR, 0) / workouts.length);
    
    // Max Peak HR
    const maxPeakHR = Math.max(...workouts.map(w => w.peakHR));

    // Aggregate HR zones
    const zoneMinutes = {
      'Zone 1 (Light)': 0,
      'Zone 2 (Fat Burn)': 0,
      'Zone 3 (Cardio)': 0,
      'Zone 4 (Hard)': 0,
      'Zone 5 (Peak)': 0,
    };
    
    workouts.forEach(w => {
      w.hrZones?.forEach(z => {
        if (zoneMinutes[z.name as keyof typeof zoneMinutes] !== undefined) {
          zoneMinutes[z.name as keyof typeof zoneMinutes] += z.minutes;
        }
      });
    });

    const totalZoneMinutes = Object.values(zoneMinutes).reduce((a, b) => a + b, 0);

    return { totalCalories, totalHours, avgHR, maxPeakHR, zoneMinutes, totalZoneMinutes };
  }, [workouts]);

  if (error) {
    return (
      <div className="glass-card rounded-3xl p-6 mt-10 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[var(--color-error-container)] text-[var(--color-on-error-container)] flex items-center justify-center mb-4">
          <Activity size={32} />
        </div>
        <h2 className="text-title-md mb-2">Connection Error</h2>
        <p className="text-body-sm text-[var(--color-on-surface-variant)] mb-6">
          Could not connect to the database. Make sure you are running with `netlify dev`.
        </p>
        <button 
          onClick={refreshData}
          className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-xl font-label-caps flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
        >
          <RefreshCw size={16} /> RETRY CONNECTION
        </button>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="space-y-6 mt-6 animate-pulse">
        <div className="skeleton h-32 w-full"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="skeleton h-24 col-span-2 rounded-2xl"></div>
          <div className="skeleton h-32 rounded-2xl"></div>
          <div className="skeleton h-32 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Total Active Calories Hero Section (Replaces Net Worth) */}
      <section className="mb-stack-lg mt-2">
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
          <p className="text-label-caps text-[var(--color-on-surface-variant)] mb-1">TOTAL CALORIES BURNED</p>
          <h2 className="text-display-lg text-[var(--color-primary)] mb-2">
            {stats.totalCalories.toLocaleString()} <span className="text-title-md text-[var(--color-on-surface-variant)]/60">kcal</span>
          </h2>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[var(--color-success-emerald)] bg-[var(--color-success-emerald)]/10 px-2 py-0.5 rounded-full text-numeric-data text-sm">
              <TrendingUp size={16} />
              +{workouts.length} workouts
            </span>
            <span className="text-[var(--color-on-surface-variant)]/60 text-body-sm">recorded</span>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-stack-lg grid grid-cols-4 gap-4">
        <div className="flex flex-col items-center gap-2">
          <button className="w-14 h-14 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer">
            <Activity size={24} />
          </button>
          <span className="text-label-caps text-[10px] text-center">ACTIVITY</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button className="w-14 h-14 rounded-2xl bg-white text-[var(--color-primary)] border border-[var(--color-primary)]/20 flex items-center justify-center shadow-sm transition-transform active:scale-90 cursor-pointer">
            <RefreshCw size={24} />
          </button>
          <span className="text-label-caps text-[10px] text-center">SYNC DATA</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button className="w-14 h-14 rounded-2xl bg-white text-[var(--color-primary)] border border-[var(--color-primary)]/20 flex items-center justify-center shadow-sm transition-transform active:scale-90 cursor-pointer">
            <Flame size={24} />
          </button>
          <span className="text-label-caps text-[10px] text-center">GOALS</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button className="w-14 h-14 rounded-2xl gold-accent text-white flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer">
            <TrendingUp size={24} />
          </button>
          <span className="text-label-caps text-[10px] text-center">TRENDS</span>
        </div>
      </section>

      {/* Stats Bento Grid (Replaces Asset Classes) */}
      <section className="mb-stack-lg">
        <div className="flex justify-between items-center mb-stack-sm">
          <h3 className="text-title-md text-[var(--color-on-surface)]">Overview</h3>
          <button className="text-[var(--color-primary)] text-label-caps cursor-pointer hover:underline">VIEW ALL</button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Total Duration Card */}
          <div className="glass-card rounded-2xl p-4 col-span-2 flex items-center justify-between border-l-4 border-l-[var(--color-success-emerald)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-success-emerald)]/10 flex items-center justify-center text-[var(--color-success-emerald)]">
                <Timer size={24} />
              </div>
              <div>
                <p className="text-body-lg font-bold">Total Duration</p>
                <p className="text-body-sm text-[var(--color-on-surface-variant)]">{workouts.length} Sessions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-numeric-data">{stats.totalHours} <span className="text-sm text-[var(--color-on-surface-variant)]/80">hrs</span></p>
            </div>
          </div>
          
          {/* Avg HR Card */}
          <div className="glass-card rounded-2xl p-4 flex flex-col justify-between aspect-square">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] mb-stack-sm">
              <Heart size={20} />
            </div>
            <div>
              <p className="text-body-lg font-bold">Average HR</p>
              <p className="text-numeric-data">{stats.avgHR} <span className="text-xs text-[var(--color-on-surface-variant)]">bpm</span></p>
            </div>
          </div>
          
          {/* Peak HR Card */}
          <div className="glass-card rounded-2xl p-4 flex flex-col justify-between aspect-square">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-wealth-gold)]/10 flex items-center justify-center text-[var(--color-wealth-gold)] mb-stack-sm">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-body-lg font-bold">Peak HR</p>
              <p className="text-numeric-data">{stats.maxPeakHR} <span className="text-xs text-[var(--color-on-surface-variant)]">bpm</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* HR Zones Visual Breakdown (Replaces Debts Visual Breakdown) */}
      <section className="mb-stack-lg">
        <div className="flex justify-between items-center mb-stack-sm">
          <h3 className="text-title-md text-[var(--color-on-surface)]">Heart Rate Zones</h3>
          <span className="text-numeric-data text-[var(--color-error)] font-bold">Intensity</span>
        </div>
        
        <div className="glass-card rounded-3xl p-6">
          {/* Stacked Progress Bar */}
          <div className="h-4 w-full bg-[var(--color-surface-variant)] rounded-full overflow-hidden flex mb-6">
            {stats.totalZoneMinutes > 0 ? (
              <>
                <div className="h-full bg-[var(--color-surface-dim)]" style={{ width: `${(stats.zoneMinutes['Zone 1 (Light)'] / stats.totalZoneMinutes) * 100}%` }} title="Zone 1"></div>
                <div className="h-full bg-[var(--color-success-emerald)]" style={{ width: `${(stats.zoneMinutes['Zone 2 (Fat Burn)'] / stats.totalZoneMinutes) * 100}%` }} title="Zone 2"></div>
                <div className="h-full bg-[var(--color-wealth-gold)]" style={{ width: `${(stats.zoneMinutes['Zone 3 (Cardio)'] / stats.totalZoneMinutes) * 100}%` }} title="Zone 3"></div>
                <div className="h-full bg-[var(--color-secondary-container)]" style={{ width: `${(stats.zoneMinutes['Zone 4 (Hard)'] / stats.totalZoneMinutes) * 100}%` }} title="Zone 4"></div>
                <div className="h-full bg-[var(--color-error)]" style={{ width: `${(stats.zoneMinutes['Zone 5 (Peak)'] / stats.totalZoneMinutes) * 100}%` }} title="Zone 5"></div>
              </>
            ) : (
              <div className="h-full bg-[var(--color-surface-variant)] w-full"></div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--color-error)]"></div>
                <span className="text-body-lg">Zone 5 (Peak)</span>
              </div>
              <span className="text-numeric-data">{Math.round(stats.zoneMinutes['Zone 5 (Peak)'])} min</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--color-secondary-container)]"></div>
                <span className="text-body-lg">Zone 4 (Hard)</span>
              </div>
              <span className="text-numeric-data">{Math.round(stats.zoneMinutes['Zone 4 (Hard)'])} min</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--color-wealth-gold)]"></div>
                <span className="text-body-lg">Zone 3 (Cardio)</span>
              </div>
              <span className="text-numeric-data">{Math.round(stats.zoneMinutes['Zone 3 (Cardio)'])} min</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--color-success-emerald)]"></div>
                <span className="text-body-lg">Zone 2 (Fat Burn)</span>
              </div>
              <span className="text-numeric-data">{Math.round(stats.zoneMinutes['Zone 2 (Fat Burn)'])} min</span>
            </div>
          </div>
          
          <button className="w-full mt-6 py-3 border border-[var(--color-outline-variant)] rounded-xl text-label-caps text-[var(--color-primary)] hover:bg-[var(--color-surface-variant)]/30 transition-colors cursor-pointer">
            VIEW FULL BREAKDOWN
          </button>
        </div>
      </section>

      {/* Market Insight Feature -> Fitness Insight */}
      <section className="mb-8">
        <div className="relative rounded-3xl overflow-hidden h-40 group cursor-pointer border border-[var(--color-outline-variant)]/50">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-80" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1000')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink-slate)]/90 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <span className="bg-[var(--color-wealth-gold)] text-[var(--color-on-secondary)] text-[10px] px-2 py-0.5 rounded font-bold mb-2 inline-block">INSIGHT</span>
            <h4 className="text-white text-title-md leading-tight">Fitness Peak: You've burned more calories this week.</h4>
          </div>
        </div>
      </section>
    </div>
  );
}
