const { Client } = require('pg');

const connectionString = "postgresql://postgres.ttkefeagnivgxejmwhjr:Mars2017Mars@aws-1-eu-central-1.pooler.supabase.com:5432/postgres";

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

const DATA = {
    'LIFESTYLE': ['SERHAT', 'SEVİL', 'TUĞBA', 'EGE NAZ', 'NURAY'],
    'KASA': ['EMRAH', 'ÇAĞLA'],
    'DAVUL': ['CİHAN', 'MİTHAT'],
    'STÜDYO': ['ENES', 'KORAY', 'GÖRKEM'],
    'GİTAR': ['SADIK', 'ALİ', 'MUSTAFA', 'HARUN', 'ÖMER', 'EKREM'],
    'PİYANO': ['KAAN B.', 'AZRA', 'KAAN P.']
};

async function seed() {
    try {
        await client.connect();
        console.log('Connected...');

        for (const [deptName, employees] of Object.entries(DATA)) {
            console.log(`\nProcessing Department: ${deptName}`);

            // 1. Departmanı Ekle
            let deptRes = await client.query('SELECT id FROM departments WHERE name = $1', [deptName]);
            let deptId;
            if (deptRes.rows.length === 0) {
                deptRes = await client.query(
                    'INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING id',
                    [deptName, `${deptName} Departmanı`]
                );
                console.log(`-> Created Department: ${deptName}`);
            } else {
                console.log(`-> Department exists: ${deptName}`);
            }
            deptId = deptRes.rows[0].id;

            // 2. Personelleri Ekle
            for (const name of employees) {
                const slug = name.toLocaleLowerCase('tr-TR')
                    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
                    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
                    .replace(/\s+/g, '.');
                const email = `${slug}@zuhalmuzik.com.dummy`;

                let userRes = await client.query(
                    `INSERT INTO users (email, full_name, role) 
           VALUES ($1, $2, 'EMPLOYEE') 
           ON CONFLICT (email) DO UPDATE SET full_name = $2
           RETURNING id`,
                    [email, name]
                );
                const userId = userRes.rows[0].id;

                const empCheck = await client.query('SELECT id FROM employees WHERE user_id = $1', [userId]);

                if (empCheck.rows.length === 0) {
                    await client.query(
                        `INSERT INTO employees (user_id, department_id, hire_date)
               VALUES ($1, $2, CURRENT_DATE)`,
                        [userId, deptId]
                    );
                    console.log(`  -> Added Employee: ${name}`);
                } else {
                    await client.query(
                        'UPDATE employees SET department_id = $1 WHERE user_id = $2',
                        [deptId, userId]
                    );
                    console.log(`  -> Updated Employee Department: ${name}`);
                }
            }
        }

        console.log('\nAll data imported successfully!');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

seed();
