import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

export const sql = neon(process.env.DATABASE_URL);

// Function to initialize the database schema if it doesn't exist
export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      calories INTEGER NOT NULL,
      avg_hr INTEGER NOT NULL,
      peak_hr INTEGER NOT NULL,
      duration_seconds INTEGER NOT NULL,
      mets REAL NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS hr_zones (
      id SERIAL PRIMARY KEY,
      workout_id TEXT REFERENCES workouts(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      minutes INTEGER NOT NULL,
      color TEXT NOT NULL,
      percentage INTEGER NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS uploads (
      id TEXT PRIMARY KEY,
      workout_id TEXT REFERENCES workouts(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      uploaded_at TEXT NOT NULL
    );
  `;
}
