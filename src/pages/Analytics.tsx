import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import { getWeeklyData, getMonthlyData, HR_ZONES } from '../data/mockData';

const periodTabs = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'yearly', label: 'Yearly' },
];

// Custom tooltip style for neumorphic look
const tooltipStyle = {
  backgroundColor: '#32324a',
  border: '1px solid #44446a',
  borderRadius: '12px',
  boxShadow: '6px 6px 14px #1e1e2e, -6px -6px 14px #3e3e58',
  color: '#e8e8f0',
  fontSize: '13px',
  padding: '12px 16px',
};

const axisStyle = { fill: '#9d9db8', fontSize: 12 };

export default function Analytics() {
  const [period, setPeriod] = useState('weekly');

  const data = useMemo(() => {
    if (period === 'weekly') return getWeeklyData();
    if (period === 'monthly') return getMonthlyData();
    // quarterly = last 3 months, yearly = all
    const monthly = getMonthlyData();
    if (period === 'quarterly') return monthly.slice(-3);
    return monthly;
  }, [period]);

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
                <stop offset="0%" stopColor="#39FF14" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#39FF14" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPeakHR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#44446a30" />
            <XAxis dataKey="week" tick={axisStyle} axisLine={{ stroke: '#44446a50' }} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: '#9d9db8', fontSize: 13, paddingTop: 12 }} />
            <Area
              type="monotone" dataKey="avgHR" name="Avg Heart Rate"
              stroke="#39FF14" strokeWidth={2.5} fill="url(#gradAvgHR)"
              dot={{ r: 3, fill: '#39FF14', strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: '#39FF14', strokeWidth: 2, fill: '#32324a' }}
            />
            <Area
              type="monotone" dataKey="peakHR" name="Peak Heart Rate"
              stroke="#EF4444" strokeWidth={2} fill="url(#gradPeakHR)"
              dot={{ r: 3, fill: '#EF4444', strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: '#EF4444', strokeWidth: 2, fill: '#32324a' }}
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
              <CartesianGrid strokeDasharray="3 3" stroke="#44446a30" />
              <XAxis dataKey="week" tick={axisStyle} axisLine={{ stroke: '#44446a50' }} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#6b6b8a', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: '#9d9db8', fontSize: 12, paddingTop: 12 }} />
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
              <CartesianGrid strokeDasharray="3 3" stroke="#44446a30" />
              <XAxis dataKey="week" tick={axisStyle} axisLine={{ stroke: '#44446a50' }} tickLine={false} />
              <YAxis yAxisId="left" tick={axisStyle} axisLine={false} tickLine={false}
                label={{ value: 'Calories', angle: -90, position: 'insideLeft', fill: '#6b6b8a', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={axisStyle} axisLine={false} tickLine={false}
                label={{ value: 'Minutes', angle: 90, position: 'insideRight', fill: '#6b6b8a', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: '#9d9db8', fontSize: 12, paddingTop: 12 }} />
              <Bar yAxisId="left" dataKey="calories" name="Calories" fill="#39FF14" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.85} />
              <Bar yAxisId="right" dataKey="durationMinutes" name="Duration (min)" fill="#CCFF00" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.65} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
