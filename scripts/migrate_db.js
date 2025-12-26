import pg from 'pg';

const { Pool } = pg;
const connectionString = 'postgresql://neondb_owner:npg_OF2qiwlJ9DpQ@ep-flat-wind-ahvtupex-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration...');

        // Add completed_at column
        await client.query(`
            ALTER TABLE progress 
            ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
        `);
        console.log('Added completed_at column');

        // Add last_reviewed column
        await client.query(`
            ALTER TABLE progress 
            ADD COLUMN IF NOT EXISTS last_reviewed TIMESTAMP;
        `);
        console.log('Added last_reviewed column');

        // Add review_interval column
        await client.query(`
            ALTER TABLE progress 
            ADD COLUMN IF NOT EXISTS review_interval INTEGER DEFAULT 0;
        `);
        console.log('Added review_interval column');

        // Add review_count column
        await client.query(`
            ALTER TABLE progress 
            ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
        `);
        console.log('Added review_count column');

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
