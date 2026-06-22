import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import { useWorkouts } from '../hooks/useWorkouts';
import { getDailyData, getMonthlyData, getDayOfWeekData } from '../utils/dataAggregation';
import { HR_ZONES } from '../utils/constants';

const periodTabs = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'yearly', label: 'Yearly' },
];

const tooltipStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  boxShadow: '0 10px 30px rgba(26, 32, 44, 0.1)',
  color: '#0d1c2e',
  fontSize: '14px',
  fontFamily: 'Manrope, sans-serif',
  padding: '12px 16px',
};

const axisStyle = { fill: '#6a707e', fontSize: 12, fontFamily: 'Space Grotesk, sans-serif' };

export default function Analytics() {
  const [period, setPeriod] = useState('weekly');
  const { workouts, loading } = useWorkouts();

  const data = useMemo(() => {
    if (!workouts || workouts.length === 0) return [];
    if (period === 'weekly') return getDailyData(workouts).slice(-7);
    if (period === 'monthly') return getDailyData(workouts).slice(-30);
    const monthly = getMonthlyData(workouts);
    if (period === 'quarterly') return monthly.slice(-3);
    return monthly;
  }, [period, workouts]);

  const dayOfWeekData = useMemo(() => {
    if (!workouts || workouts.length === 0) return [];
    return getDayOfWeekData(workouts);
  }, [workouts]);

  const overallHrZones = useMemo(() => {
    if (!workouts || workouts.length === 0) return [];
    const totals: Record<string, number> = {};
    HR_ZONES.forEach(z => totals[z.key] = 0);
    
    // Calculate totals for the selected period
    data.forEach(d => {
      Object.keys(d.zones).forEach(k => {
        if (totals[k] !== undefined) totals[k] += d.zones[k];
      });
    });
    
    return HR_ZONES.map(z => ({
      name: z.name,
      value: totals[z.key],
      color: z.color
    })).filter(z => z.value > 0);
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 skeleton" />
        <div className="h-72 skeleton" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-72 skeleton" />
          <div className="h-72 skeleton" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
          <span className="text-[var(--color-primary)] text-2xl material-symbols-outlined">analytics</span>
        </div>
        <h3 className="text-title-md text-[var(--color-on-surface)] mb-2">No Analytics Data Yet</h3>
        <p className="text-body-sm text-[var(--color-on-surface-variant)] max-w-xs">Add workouts first to see your performance trends here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-headline-lg-mobile text-[var(--color-primary)]">
            Analytics & Trends
          </h1>
          <p className="text-[var(--color-on-surface-variant)]/80 text-body-sm mt-1">
            Deep dive into your fitness performance
          </p>
        </div>
        <Tabs tabs={periodTabs} activeTab={period} onChange={setPeriod} />
      </div>

      {/* Hero Chart: Heart Rate Trends (Area Chart) */}
      <Card variant="stat">
        <h3 className="text-title-md text-[var(--color-on-surface)] mb-5">
          Heart Rate Trends
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="gradAvgHR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2E7D5E" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#2E7D5E" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPeakHR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F0A030" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#F0A030" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#bec9c1" opacity={0.5} />
            <XAxis dataKey="week" tick={axisStyle} axisLine={{ stroke: '#bec9c1' }} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: '#6a707e', fontSize: 13, paddingTop: 12, fontFamily: 'Manrope, sans-serif' }} />
            <Area
              type="monotone" dataKey="avgHR" name="Avg Heart Rate"
              stroke="#2E7D5E" strokeWidth={2.5} fill="url(#gradAvgHR)"
              dot={{ r: 3, fill: '#2E7D5E', strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: '#2E7D5E', strokeWidth: 2, fill: '#ffffff' }}
            />
            <Area
              type="monotone" dataKey="peakHR" name="Peak Heart Rate"
              stroke="#F0A030" strokeWidth={2} fill="url(#gradPeakHR)"
              dot={{ r: 3, fill: '#F0A030', strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: '#F0A030', strokeWidth: 2, fill: '#ffffff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Intensity: METs & Efficiency (Line Chart) */}
        <Card variant="stat">
          <h3 className="text-title-md text-[var(--color-on-surface)] mb-1">
            Workout Intensity
          </h3>
          <p className="text-body-sm text-[var(--color-on-surface-variant)] mb-4">METs and Calories per Minute</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#bec9c1" opacity={0.5} />
              <XAxis dataKey="week" tick={axisStyle} axisLine={{ stroke: '#bec9c1' }} tickLine={false} />
              <YAxis yAxisId="left" tick={axisStyle} axisLine={false} tickLine={false}
                label={{ value: 'METs', angle: -90, position: 'insideLeft', fill: '#6a707e', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={axisStyle} axisLine={false} tickLine={false}
                label={{ value: 'Cal/Min', angle: 90, position: 'insideRight', fill: '#6a707e', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: '#6a707e', fontSize: 12, paddingTop: 12, fontFamily: 'Manrope, sans-serif' }} />
              <Line yAxisId="left" type="monotone" dataKey="mets" name="Avg METs" stroke="#8A2BE2" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line yAxisId="right" type="monotone" dataKey="efficiency" name="Efficiency (Cal/min)" stroke="#FF6B6B" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Consistency: Radar Chart for Days of Week */}
        <Card variant="stat">
          <h3 className="text-title-md text-[var(--color-on-surface)] mb-1">
            Consistency Heatmap
          </h3>
          <p className="text-body-sm text-[var(--color-on-surface-variant)] mb-4">Workouts by Day of Week (All Time)</p>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dayOfWeekData}>
              <PolarGrid stroke="#bec9c1" />
              <PolarAngleAxis dataKey="day" tick={{ fill: '#6a707e', fontSize: 12, fontFamily: 'Space Grotesk' }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#6a707e', fontSize: 10 }} />
              <Radar name="Workouts" dataKey="count" stroke="#2E7D5E" fill="#2E7D5E" fillOpacity={0.5} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* HR Zone Distribution: Overall Pie Chart */}
        <Card variant="stat">
          <h3 className="text-title-md text-[var(--color-on-surface)] mb-1">
            Overall Heart Rate Zones
          </h3>
          <p className="text-body-sm text-[var(--color-on-surface-variant)] mb-4">Time spent in zones for selected period</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={overallHrZones}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
              >
                {overallHrZones.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={tooltipStyle} 
                formatter={(value: any) => [`${value} minutes`, 'Time Spent']} 
              />
              <Legend wrapperStyle={{ color: '#6a707e', fontSize: 12, fontFamily: 'Manrope, sans-serif' }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* HR Zone Timeline (Stacked Bar) */}
        <Card variant="stat">
          <h3 className="text-title-md text-[var(--color-on-surface)] mb-1">
            Heart Rate Zones Timeline
          </h3>
          <p className="text-body-sm text-[var(--color-on-surface-variant)] mb-4">Weekly/Monthly zone distribution</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#bec9c1" opacity={0.5} />
              <XAxis dataKey="week" tick={axisStyle} axisLine={{ stroke: '#bec9c1' }} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#6a707e', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: '#6a707e', fontSize: 12, paddingTop: 12, fontFamily: 'Manrope, sans-serif' }} />
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

      </div>
    </div>
  );
}
