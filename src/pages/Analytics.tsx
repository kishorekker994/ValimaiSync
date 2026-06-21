import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import { useWorkouts } from '../hooks/useWorkouts';
import { getWeeklyData, getMonthlyData } from '../utils/dataAggregation';
import { HR_ZONES } from '../utils/constants';

const periodTabs = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'yearly', label: 'Yearly' },
];

// Custom tooltip style for Light Neumorphic look
const tooltipStyle = {
  backgroundColor: '#f5f8fc',
  border: '1px solid #d1d8e0',
  borderRadius: '12px',
  boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
  color: '#1c1c1e',
  fontSize: '13px',
  padding: '12px 16px',
};

const axisStyle = { fill: '#8e8e93', fontSize: 12 };

export default function Analytics() {
  const [period, setPeriod] = useState('weekly');
  const { workouts, loading } = useWorkouts();

  const data = useMemo(() => {
    if (!workouts || workouts.length === 0) return [];
    if (period === 'weekly') return getWeeklyData(workouts);
    if (period === 'monthly') return getMonthlyData(workouts);
    // quarterly = last 3 months, yearly = all
    const monthly = getMonthlyData(workouts);
    if (period === 'quarterly') return monthly.slice(-3);
    return monthly;
  }, [period, workouts]);

  if (loading) {
    return <div className="p-8 text-center text-[var(--color-text-muted)]">Loading analytics data...</div>;
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-[var(--color-text-muted)]">
        No data available for analytics yet. Add workouts first.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] font-[var(--font-heading)]">
            Analytics
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">
            Track your fitness trends over time
          </p>
        </div>
        <Tabs tabs={periodTabs} activeTab={period} onChange={setPeriod} />
      </div>

      {/* Chart 1: Heart Rate Trends (Area Chart) */}
      <Card variant="raised">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-5 font-[var(--font-heading)]">
          Heart Rate Trends
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="gradAvgHR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPeakHR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-tertiary)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-tertiary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neu-border)" opacity={0.5} />
            <XAxis dataKey="week" tick={axisStyle} axisLine={{ stroke: 'var(--color-neu-border)' }} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: 'var(--color-text-muted)', fontSize: 13, paddingTop: 12 }} />
            <Area
              type="monotone" dataKey="avgHR" name="Avg Heart Rate"
              stroke="var(--color-accent)" strokeWidth={2.5} fill="url(#gradAvgHR)"
              dot={{ r: 3, fill: 'var(--color-accent)', strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: 'var(--color-accent)', strokeWidth: 2, fill: 'var(--color-neu-surface)' }}
            />
            <Area
              type="monotone" dataKey="peakHR" name="Peak Heart Rate"
              stroke="var(--color-tertiary)" strokeWidth={2} fill="url(#gradPeakHR)"
              dot={{ r: 3, fill: 'var(--color-tertiary)', strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: 'var(--color-tertiary)', strokeWidth: 2, fill: 'var(--color-neu-surface)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Two-column chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 2: HR Zone Distribution (Stacked Bar) */}
        <Card variant="raised">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-5 font-[var(--font-heading)]">
            HR Zone Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neu-border)" opacity={0.5} />
              <XAxis dataKey="week" tick={axisStyle} axisLine={{ stroke: 'var(--color-neu-border)' }} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: 'var(--color-text-muted)', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: 'var(--color-text-muted)', fontSize: 12, paddingTop: 12 }} />
              {HR_ZONES.map((zone) => (
                <Bar
                  key={zone.key}
                  dataKey={`zones.${zone.key}`}
                  name={zone.name}
                  stackId="zones"
                  fill={zone.color}
                  radius={zone.key === 'extreme' ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Chart 3: Calories vs Duration (Dual Axis Bar) */}
        <Card variant="raised">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-5 font-[var(--font-heading)]">
            Calories vs Duration
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neu-border)" opacity={0.5} />
              <XAxis dataKey="week" tick={axisStyle} axisLine={{ stroke: 'var(--color-neu-border)' }} tickLine={false} />
              <YAxis yAxisId="left" tick={axisStyle} axisLine={false} tickLine={false}
                label={{ value: 'Calories', angle: -90, position: 'insideLeft', fill: 'var(--color-text-muted)', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={axisStyle} axisLine={false} tickLine={false}
                label={{ value: 'Minutes', angle: 90, position: 'insideRight', fill: 'var(--color-text-muted)', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: 'var(--color-text-muted)', fontSize: 12, paddingTop: 12 }} />
              <Bar yAxisId="left" dataKey="calories" name="Calories" fill="var(--color-accent)" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.85} />
              <Bar yAxisId="right" dataKey="durationMinutes" name="Duration (min)" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.65} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
