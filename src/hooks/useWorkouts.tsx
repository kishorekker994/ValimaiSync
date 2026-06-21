import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { WorkoutRecord, UploadFile } from '../types';

interface WorkoutsContextType {
  workouts: WorkoutRecord[];
  uploads: UploadFile[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  addUpload: (upload: Partial<UploadFile>) => Promise<void>;
  commitWorkout: (uploadId: string, workoutData: any) => Promise<void>;
  deleteUpload: (id: string) => Promise<void>;
  clearAllData: () => Promise<void>;
}

const WorkoutsContext = createContext<WorkoutsContextType | undefined>(undefined);

export function WorkoutsProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/.netlify/functions/workouts');
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setWorkouts(data.workouts || []);
      setUploads(data.uploads || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addUpload = async (upload: Partial<UploadFile>) => {
    try {
      const res = await fetch('/.netlify/functions/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'new_upload', upload }),
      });
      if (res.ok) await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const commitWorkout = async (uploadId: string, workoutData: any) => {
    try {
      const res = await fetch('/.netlify/functions/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'commit_workout', uploadId, workoutData }),
      });
      if (res.ok) await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUpload = async (id: string) => {
    try {
      const res = await fetch(`/.netlify/functions/workouts/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const clearAllData = async () => {
    try {
      const res = await fetch('/.netlify/functions/clear', {
        method: 'POST',
      });
      if (res.ok) await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <WorkoutsContext.Provider
      value={{
        workouts,
        uploads,
        loading,
        error,
        refreshData,
        addUpload,
        commitWorkout,
        deleteUpload,
        clearAllData,
      }}
    >
      {children}
    </WorkoutsContext.Provider>
  );
}

export function useWorkouts() {
  const context = useContext(WorkoutsContext);
  if (context === undefined) {
    throw new Error('useWorkouts must be used within a WorkoutsProvider');
  }
  return context;
}
