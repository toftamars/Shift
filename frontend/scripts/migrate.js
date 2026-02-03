const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://postgres.ttkefeagnivgxejmwhjr:Mars2017Mars@aws-1-eu-central-1.pooler.supabase.com:5432/postgres";

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    try {
        await client.connect();
        console.log('Connected to database...');

        const sqlPath = path.join(__dirname, '../../database/supabase-full-schema.sql');
        if (!fs.existsSync(sqlPath)) {
            console.error('SQL file not found:', sqlPath);
            process.exit(1);
        }

        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Running migration...');

        await client.query(sql);

        console.log('Migration completed successfully!');

        // Default kullanıcı (sizi admin yapalım)
        const adminEmail = 'alper.tofta@zuhalmuzik.com';
        await client.query(`
      INSERT INTO public.users (email, full_name, role)
      VALUES ($1, 'Alper Tofta', 'ADMIN')
      ON CONFLICT (email) DO UPDATE SET role = 'ADMIN'
    `, [adminEmail]);
        console.log(`Admin user ensured: ${adminEmail}`);

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
