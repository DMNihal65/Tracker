import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_OF2qiwlJ9DpQ@ep-flat-wind-ahvtupex-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const client = await pool.connect();

        if (req.method === 'GET') {
            const result = await client.query('SELECT * FROM progress');
            res.status(200).json(result.rows);
        } else if (req.method === 'POST') {
            const { question_id, completed, notes, code, completed_at, last_reviewed, review_interval, review_count } = req.body;

            // Upsert query
            const query = `
        INSERT INTO progress (question_id, completed, notes, code, completed_at, last_reviewed, review_interval, review_count, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (question_id)
        DO UPDATE SET 
          completed = EXCLUDED.completed,
          notes = EXCLUDED.notes,
          code = EXCLUDED.code,
          completed_at = COALESCE(EXCLUDED.completed_at, progress.completed_at),
          last_reviewed = COALESCE(EXCLUDED.last_reviewed, progress.last_reviewed),
          review_interval = COALESCE(EXCLUDED.review_interval, progress.review_interval),
          review_count = COALESCE(EXCLUDED.review_count, progress.review_count),
          updated_at = NOW();
      `;

            await client.query(query, [question_id, completed, notes, code, completed_at, last_reviewed, review_interval, review_count]);
            res.status(200).json({ success: true });
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }

        client.release();
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
