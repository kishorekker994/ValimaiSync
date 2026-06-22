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

export interface UploadFile {
  id: string;
  name: string;
  status: 'queued' | 'processing' | 'verified' | 'committed' | 'error';
  uploadedAt: string;
  parsedData?: Partial<WorkoutRecord>;
}

export interface WeeklyData {
  week: string;
  avgHR: number;
  peakHR: number;
  calories: number;
  durationMinutes: number;
  zones: Record<string, number>;
  mets: number;
  efficiency: number;
}
