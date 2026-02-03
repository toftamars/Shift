import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is missing');
}

const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }, // Supabase SSL gerektirir
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle client', err);
});

export const query = async (text: string, params?: any[]) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        // console.log('Executed query', { text, duration, rows: res.rowCount }); // Log kirliliği olmaması için kapattım
        return res;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
};

export const getClient = () => pool.connect();

export default pool;
