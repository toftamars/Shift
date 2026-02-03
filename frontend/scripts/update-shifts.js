const { Client } = require('pg');
const connectionString = "postgresql://postgres.ttkefeagnivgxejmwhjr:Mars2017Mars@aws-1-eu-central-1.pooler.supabase.com:5432/postgres";
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function updateShifts() {
    try {
        await client.connect();

        // Kodlara göre vardiyalar (Türkçe açıklamalar UI'da olacak)
        const shifts = [
            { name: '1', start: '09:00', end: '18:00', color: '#FFFFFF' },
            { name: '2', start: '11:00', end: '20:00', color: '#4CAF50' },
            { name: '3', start: '13:00', end: '22:00', color: '#FF9800' },
            { name: '4', start: '22:00', end: '06:00', color: '#3F51B5' },
            { name: 'A', start: '10:00', end: '19:00', color: '#9C27B0' },
            { name: 'OFF', start: '00:00', end: '00:00', color: '#F44336' }
        ];

        for (const s of shifts) {
            const duration = s.name === 'OFF' ? 0 : 9;

            const check = await client.query('SELECT id FROM shift_types WHERE name = $1', [s.name]);

            if (check.rows.length === 0) {
                await client.query(
                    `INSERT INTO shift_types (name, start_time, end_time, color_code, duration_hours)
             VALUES ($1, $2, $3, $4, $5)`,
                    [s.name, s.start, s.end, s.color, duration]
                );
                console.log(`Included: ${s.name}`);
            } else {
                await client.query(
                    `UPDATE shift_types SET start_time = $2, end_time = $3, color_code = $4, duration_hours = $5
             WHERE name = $1`,
                    [s.name, s.start, s.end, s.color, duration]
                );
                console.log(`Updated: ${s.name}`);
            }
        }
    } catch (e) { console.error(e); }
    finally { await client.end(); }
}

updateShifts();
