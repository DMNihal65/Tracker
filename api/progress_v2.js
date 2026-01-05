import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_OF2qiwlJ9DpQ@ep-flat-wind-ahvtupex-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

// Initialize table if it doesn't exist
async function initTable(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS progress_v2 (
            id SERIAL PRIMARY KEY,
            question_id TEXT UNIQUE NOT NULL,
            completed BOOLEAN DEFAULT FALSE,
            notes TEXT,
            code TEXT,
            completed_at TIMESTAMP,
            updated_at TIMESTAMP DEFAULT NOW()
        )
    `);
}

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
        
        // Ensure table exists
        await initTable(client);

        if (req.method === 'GET') {
            const result = await client.query('SELECT * FROM progress_v2');
            res.status(200).json(result.rows);
        } else if (req.method === 'POST') {
            const { question_id, completed, notes, code, completed_at } = req.body;

            // Upsert query
            const query = `
                INSERT INTO progress_v2 (question_id, completed, notes, code, completed_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, NOW())
                ON CONFLICT (question_id)
                DO UPDATE SET 
                    completed = EXCLUDED.completed,
                    notes = EXCLUDED.notes,
                    code = EXCLUDED.code,
                    completed_at = COALESCE(EXCLUDED.completed_at, progress_v2.completed_at),
                    updated_at = NOW();
            `;

            await client.query(query, [question_id, completed, notes, code, completed_at]);
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
