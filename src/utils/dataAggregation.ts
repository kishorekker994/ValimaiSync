import { WorkoutRecord, WeeklyData } from '../types';
import { HR_ZONES } from '../utils/constants';

export function getWeeklyData(workouts: WorkoutRecord[]): WeeklyData[] {
  const sorted = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const weeks: WeeklyData[] = [];
  
  for (let i = 0; i < sorted.length; i += 7) {
    const chunk = sorted.slice(i, i + 7);
    const startDate = new Date(chunk[0].date);
    const weekLabel = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    weeks.push({
      week: weekLabel,
      avgHR: Math.round(chunk.reduce((s, w) => s + w.avgHR, 0) / chunk.length) || 0,
      peakHR: Math.max(...chunk.map((w) => w.peakHR), 0),
      calories: chunk.reduce((s, w) => s + w.calories, 0),
      durationMinutes: Math.round(chunk.reduce((s, w) => s + w.durationSeconds, 0) / 60),
      zones: HR_ZONES.reduce((acc, zone, idx) => {
        // Find matching zone name from workout hrZones
        acc[zone.key] = chunk.reduce((s, w) => {
          const z = w.hrZones?.find(hz => hz.name === zone.name);
          return s + (z ? z.minutes : 0);
        }, 0);
        return acc;
      }, {} as Record<string, number>),
    });
  }
  return weeks;
}

export function getMonthlyData(workouts: WorkoutRecord[]): WeeklyData[] {
  const sorted = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const months: Map<string, WorkoutRecord[]> = new Map();
  sorted.forEach((w) => {
    const d = new Date(w.date);
    const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!months.has(key)) months.set(key, []);
    months.get(key)!.push(w);
  });
  return Array.from(months.entries()).map(([month, chunk]) => ({
    week: month,
    avgHR: Math.round(chunk.reduce((s, w) => s + w.avgHR, 0) / chunk.length) || 0,
    peakHR: Math.max(...chunk.map((w) => w.peakHR), 0),
    calories: chunk.reduce((s, w) => s + w.calories, 0),
    durationMinutes: Math.round(chunk.reduce((s, w) => s + w.durationSeconds, 0) / 60),
    zones: HR_ZONES.reduce((acc, zone, idx) => {
      acc[zone.key] = chunk.reduce((s, w) => {
        const z = w.hrZones?.find(hz => hz.name === zone.name);
        return s + (z ? z.minutes : 0);
      }, 0);
      return acc;
    }, {} as Record<string, number>),
  }));
}
