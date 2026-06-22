import { WorkoutRecord, WeeklyData } from '../types';
import { HR_ZONES } from '../utils/constants';

export function getDailyData(workouts: WorkoutRecord[]): WeeklyData[] {
  const sorted = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const days: Map<string, WorkoutRecord[]> = new Map();
  sorted.forEach((w) => {
    const d = new Date(w.date);
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!days.has(key)) days.set(key, []);
    days.get(key)!.push(w);
  });
  
  return Array.from(days.entries()).map(([day, chunk]) => {
    const totalDurationMins = Math.round(chunk.reduce((s, w) => s + w.durationSeconds, 0) / 60);
    const totalCalories = chunk.reduce((s, w) => s + w.calories, 0);
    return {
      week: day, // Keeping 'week' as key for Recharts compatibility
      avgHR: Math.round(chunk.reduce((s, w) => s + w.avgHR, 0) / chunk.length) || 0,
      peakHR: Math.max(...chunk.map((w) => w.peakHR), 0),
      calories: totalCalories,
      durationMinutes: totalDurationMins,
      mets: Number((chunk.reduce((s, w) => s + (w.mets || 6), 0) / chunk.length).toFixed(1)) || 0,
      efficiency: totalDurationMins > 0 ? Number((totalCalories / totalDurationMins).toFixed(1)) : 0,
      zones: HR_ZONES.reduce((acc, zone, idx) => {
        // Find matching zone name from workout hrZones
        acc[zone.key] = chunk.reduce((s, w) => {
          const z = w.hrZones?.find(hz => hz.name === zone.name);
          return s + (z ? z.minutes : 0);
        }, 0);
        return acc;
      }, {} as Record<string, number>),
    };
  });
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
  return Array.from(months.entries()).map(([month, chunk]) => {
    const totalDurationMins = Math.round(chunk.reduce((s, w) => s + w.durationSeconds, 0) / 60);
    const totalCalories = chunk.reduce((s, w) => s + w.calories, 0);
    return {
      week: month,
      avgHR: Math.round(chunk.reduce((s, w) => s + w.avgHR, 0) / chunk.length) || 0,
      peakHR: Math.max(...chunk.map((w) => w.peakHR), 0),
      calories: totalCalories,
      durationMinutes: totalDurationMins,
      mets: Number((chunk.reduce((s, w) => s + (w.mets || 6), 0) / chunk.length).toFixed(1)) || 0,
      efficiency: totalDurationMins > 0 ? Number((totalCalories / totalDurationMins).toFixed(1)) : 0,
      zones: HR_ZONES.reduce((acc, zone, idx) => {
        acc[zone.key] = chunk.reduce((s, w) => {
          const z = w.hrZones?.find(hz => hz.name === zone.name);
          return s + (z ? z.minutes : 0);
        }, 0);
        return acc;
      }, {} as Record<string, number>),
    };
  });
}

export function getDayOfWeekData(workouts: WorkoutRecord[]) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayCounts = new Array(7).fill(0);
  const dayCalories = new Array(7).fill(0);

  workouts.forEach((w) => {
    const date = new Date(w.date);
    const dayIdx = date.getDay();
    dayCounts[dayIdx]++;
    dayCalories[dayIdx] += w.calories;
  });

  return days.map((day, i) => ({
    day,
    count: dayCounts[i],
    calories: dayCalories[i]
  }));
}
