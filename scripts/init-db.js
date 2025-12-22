import pg from 'pg';
const { Pool } = pg;

const connectionString = 'postgresql://neondb_owner:npg_OF2qiwlJ9DpQ@ep-flat-wind-ahvtupex-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS progress (
    question_id VARCHAR(255) PRIMARY KEY,
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    code TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

async function initDb() {
    try {
        const client = await pool.connect();
        console.log('Connected to database');

        await client.query(createTableQuery);
        console.log('Table "progress" created or already exists');

        client.release();
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        await pool.end();
    }
}

initDb();
