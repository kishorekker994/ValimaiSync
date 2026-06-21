// ── Types ──
export interface HRZone {
  name: string;
  minutes: number;
  color: string;
  percentage: number;
}

export interface WorkoutRecord {
  id: string;
  date: string;
  type: string;
  calories: number;
  avgHR: number;
  peakHR: number;
  durationSeconds: number;
  mets: number;
  hrZones: HRZone[];
}

export interface WeeklyData {
  week: string;
  avgHR: number;
  peakHR: number;
  calories: number;
  durationMinutes: number;
  zones: Record<string, number>;
}

export interface UploadFile {
  id: string;
  name: string;
  status: 'queued' | 'processing' | 'verified' | 'committed' | 'error';
  thumbnail?: string;
  parsedData?: Partial<WorkoutRecord>;
  uploadedAt: string;
}

// ── HR Zone Config ──
export const HR_ZONES = [
  { key: 'normal', name: 'Normal', color: '#6B7280' },
  { key: 'warmup', name: 'Warm Up', color: '#3B82F6' },
  { key: 'fatburn', name: 'Fat Burning', color: '#22C55E' },
  { key: 'aerobic', name: 'Aerobic', color: '#EAB308' },
  { key: 'anaerobic', name: 'Anaerobic', color: '#F97316' },
  { key: 'extreme', name: 'Extreme', color: '#EF4444' },
];

// ── Generator helpers ──
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateHRZones(durationMinutes: number): HRZone[] {
  const total = durationMinutes;
  const raw = [
    randomBetween(2, 8),
    randomBetween(5, 12),
    randomBetween(15, 30),
    randomBetween(20, 35),
    randomBetween(5, 15),
    randomBetween(1, 5),
  ];
  const rawSum = raw.reduce((a, b) => a + b, 0);
  return HR_ZONES.map((zone, i) => {
    const minutes = Math.round((raw[i] / rawSum) * total);
    return {
      name: zone.name,
      minutes,
      color: zone.color,
      percentage: Math.round((raw[i] / rawSum) * 100),
    };
  });
}

// ── Mock Workouts (90 days) ──
const workoutTypes = ['Running', 'Cycling', 'HIIT', 'Swimming', 'Walking', 'Strength'];

export const mockWorkouts: WorkoutRecord[] = Array.from({ length: 90 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (89 - i));
  const durationSeconds = randomBetween(1800, 5400);
  const durationMinutes = Math.round(durationSeconds / 60);
  return {
    id: `w-${i}`,
    date: date.toISOString().split('T')[0],
    type: workoutTypes[i % workoutTypes.length],
    calories: randomBetween(250, 850),
    avgHR: randomBetween(110, 155),
    peakHR: randomBetween(160, 195),
    durationSeconds,
    mets: parseFloat((randomBetween(40, 120) / 10).toFixed(1)),
    hrZones: generateHRZones(durationMinutes),
  };
});

// ── Weekly Aggregates ──
export function getWeeklyData(): WeeklyData[] {
  const weeks: WeeklyData[] = [];
  for (let i = 0; i < mockWorkouts.length; i += 7) {
    const chunk = mockWorkouts.slice(i, i + 7);
    const startDate = new Date(chunk[0].date);
    const weekLabel = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    weeks.push({
      week: weekLabel,
      avgHR: Math.round(chunk.reduce((s, w) => s + w.avgHR, 0) / chunk.length),
      peakHR: Math.max(...chunk.map((w) => w.peakHR)),
      calories: chunk.reduce((s, w) => s + w.calories, 0),
      durationMinutes: Math.round(chunk.reduce((s, w) => s + w.durationSeconds, 0) / 60),
      zones: HR_ZONES.reduce((acc, zone, idx) => {
        acc[zone.key] = chunk.reduce((s, w) => s + (w.hrZones[idx]?.minutes ?? 0), 0);
        return acc;
      }, {} as Record<string, number>),
    });
  }
  return weeks;
}

// ── Monthly Aggregates ──
export function getMonthlyData(): WeeklyData[] {
  const months: Map<string, WorkoutRecord[]> = new Map();
  mockWorkouts.forEach((w) => {
    const d = new Date(w.date);
    const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!months.has(key)) months.set(key, []);
    months.get(key)!.push(w);
  });
  return Array.from(months.entries()).map(([month, chunk]) => ({
    week: month,
    avgHR: Math.round(chunk.reduce((s, w) => s + w.avgHR, 0) / chunk.length),
    peakHR: Math.max(...chunk.map((w) => w.peakHR)),
    calories: chunk.reduce((s, w) => s + w.calories, 0),
    durationMinutes: Math.round(chunk.reduce((s, w) => s + w.durationSeconds, 0) / 60),
    zones: HR_ZONES.reduce((acc, zone, idx) => {
      acc[zone.key] = chunk.reduce((s, w) => s + (w.hrZones[idx]?.minutes ?? 0), 0);
      return acc;
    }, {} as Record<string, number>),
  }));
}

// ── Mock Upload Files ──
export const mockUploads: UploadFile[] = [
  { id: 'u1', name: 'workout_jun15.png', status: 'committed', uploadedAt: '2026-06-15T10:30:00Z', parsedData: { calories: 698, avgHR: 131, durationSeconds: 3240, mets: 7.2 } },
  { id: 'u2', name: 'workout_jun16.png', status: 'verified', uploadedAt: '2026-06-16T09:15:00Z', parsedData: { calories: 523, avgHR: 118, durationSeconds: 2700, mets: 5.8 } },
  { id: 'u3', name: 'workout_jun17.png', status: 'processing', uploadedAt: '2026-06-17T08:00:00Z' },
  { id: 'u4', name: 'workout_jun18.png', status: 'queued', uploadedAt: '2026-06-18T07:45:00Z' },
  { id: 'u5', name: 'hiit_session.png', status: 'error', uploadedAt: '2026-06-19T11:20:00Z' },
];

// Today's workout (latest)
export const todayWorkout: WorkoutRecord = mockWorkouts[mockWorkouts.length - 1];
