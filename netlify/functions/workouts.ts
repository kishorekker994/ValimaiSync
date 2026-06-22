import { Handler } from '@netlify/functions';
import { sql, initDb } from './db';

export const handler: Handler = async (event) => {
  // Ensure DB is initialized (this is safe to call repeatedly, but ideally should be done once)
  try {
    await initDb();
  } catch (error) {
    console.error('Error initializing DB', error);
  }

  const pathSegments = event.path.split('/').filter(Boolean);
  const id = pathSegments[pathSegments.length - 1];
  const isSpecificItem = pathSegments.length > 2 && id !== 'workouts';

  if (event.httpMethod === 'GET') {
    try {
      // Fetch all workouts
      const workoutsRows = await sql`SELECT * FROM workouts ORDER BY created_at ASC`;
      const hrZonesRows = await sql`SELECT * FROM hr_zones`;
      const uploadsRows = await sql`SELECT * FROM uploads ORDER BY uploaded_at DESC`;

      // Group HR zones by workout
      const hrZonesMap: Record<string, any[]> = {};
      hrZonesRows.forEach(zone => {
        if (!hrZonesMap[zone.workout_id]) hrZonesMap[zone.workout_id] = [];
        hrZonesMap[zone.workout_id].push({
          name: zone.name,
          minutes: zone.minutes,
          color: zone.color,
          percentage: zone.percentage
        });
      });

      // Format workouts
      const workouts = workoutsRows.map(w => ({
        id: w.id,
        date: w.date,
        type: w.type,
        calories: w.calories,
        avgHR: w.avg_hr,
        peakHR: w.peak_hr,
        durationSeconds: w.duration_seconds,
        mets: w.mets,
        hrZones: hrZonesMap[w.id] || []
      }));

      // Format uploads and attach parsed data
      const uploads = uploadsRows.map(u => {
        const workout = workouts.find(w => w.id === u.workout_id);
        return {
          id: u.id,
          name: u.name,
          status: u.status,
          uploadedAt: u.uploaded_at,
          parsedData: workout ? {
            calories: workout.calories,
            avgHR: workout.avgHR,
            durationSeconds: workout.durationSeconds,
            mets: workout.mets
          } : undefined
        };
      });

      return {
        statusCode: 200,
        body: JSON.stringify({ workouts, uploads }),
      };
    } catch (error: any) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const { type, upload } = body;

      if (type === 'new_upload') {
        const uploadId = `u-${Date.now()}`;
        await sql`
          INSERT INTO uploads (id, name, status, uploaded_at)
          VALUES (${uploadId}, ${upload.name}, ${upload.status}, ${upload.uploadedAt})
        `;
        return { statusCode: 200, body: JSON.stringify({ success: true, id: uploadId }) };
      }

      if (type === 'commit_workout') {
        const { uploadId, workoutData } = body;
        const workoutId = `w-${Date.now()}`;
        const totalMinutes = (workoutData.durationSeconds || 0) / 60;

        // Use parsed hrZones from OCR if available; otherwise generate reasonable defaults
        const hrZones = (workoutData.hrZones && workoutData.hrZones.length > 0)
          ? workoutData.hrZones.map((z: any) => ({
              name: z.name,
              color: z.color,
              percentage: z.percentage || 0,
              minutes: z.minutes ?? Math.round((z.percentage / 100) * totalMinutes),
            }))
          : [
              { name: 'Normal', color: '#8E8E93', percentage: 10, minutes: Math.round(totalMinutes * 0.1) },
              { name: 'Warm Up', color: '#5AC8FA', percentage: 20, minutes: Math.round(totalMinutes * 0.2) },
              { name: 'Fat Burning', color: '#34C759', percentage: 40, minutes: Math.round(totalMinutes * 0.4) },
              { name: 'Aerobic', color: '#FFCC00', percentage: 20, minutes: Math.round(totalMinutes * 0.2) },
              { name: 'Anaerobic', color: '#FF9500', percentage: 8, minutes: Math.round(totalMinutes * 0.08) },
              { name: 'Extreme', color: '#FF3B30', percentage: 2, minutes: Math.round(totalMinutes * 0.02) },
            ];

        const workoutDate = workoutData.date || new Date().toISOString().split('T')[0];

        // Insert workout
        await sql`
          INSERT INTO workouts (id, date, type, calories, avg_hr, peak_hr, duration_seconds, mets)
          VALUES (${workoutId}, ${workoutDate}, 'Mixed', ${workoutData.calories}, ${workoutData.avgHR}, ${workoutData.avgHR + 20}, ${workoutData.durationSeconds}, ${workoutData.mets})
        `;

        // Insert HR zones
        for (const zone of hrZones) {
          await sql`
            INSERT INTO hr_zones (workout_id, name, minutes, color, percentage)
            VALUES (${workoutId}, ${zone.name}, ${zone.minutes}, ${zone.color}, ${zone.percentage})
          `;
        }

        // Update upload to committed and link workout
        await sql`
          UPDATE uploads SET status = 'committed', workout_id = ${workoutId} WHERE id = ${uploadId}
        `;

        return { statusCode: 200, body: JSON.stringify({ success: true, workoutId }) };
      }
      
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action' }) };
    } catch (error: any) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
  }

  if (event.httpMethod === 'DELETE') {
    try {
      if (!isSpecificItem) {
        return { statusCode: 400, body: JSON.stringify({ error: 'ID required' }) };
      }
      
      // Delete from uploads. Due to ON DELETE CASCADE, if we delete workout, it drops zones. 
      // But here we might be deleting an upload, which should delete its workout.
      const upload = await sql`SELECT workout_id FROM uploads WHERE id = ${id}`;
      
      if (upload.length > 0 && upload[0].workout_id) {
        await sql`DELETE FROM workouts WHERE id = ${upload[0].workout_id}`;
        // Cascade will delete hr_zones and uploads associated with it
      } else {
        await sql`DELETE FROM uploads WHERE id = ${id}`;
      }

      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (error: any) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};
