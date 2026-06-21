import { Handler } from '@netlify/functions';
import { sql } from './db';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Truncate clears everything
    await sql`TRUNCATE TABLE uploads, hr_zones, workouts CASCADE;`;
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'All data cleared' }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
