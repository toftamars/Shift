const { Client } = require('pg');

const connectionString = "postgresql://postgres.ttkefeagnivgxejmwhjr:Mars2017Mars@aws-1-eu-central-1.pooler.supabase.com:5432/postgres";

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

const DEPARTMENT_NAME = 'LIFESTYLE';
const EMPLOYEES = ['SERHAT', 'SEVİL', 'TUĞBA', 'EGE NAZ', 'NURAY'];

async function seed() {
    try {
        await client.connect();
        console.log('Connected...');

        // 1. Departmanı Ekle
        let deptRes = await client.query('SELECT id FROM departments WHERE name = $1', [DEPARTMENT_NAME]);
        let deptId;
        if (deptRes.rows.length === 0) {
            deptRes = await client.query(
                'INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING id',
                [DEPARTMENT_NAME, 'Lifestyle Departmanı']
            );
            console.log(`Departman oluşturuldu: ${DEPARTMENT_NAME}`);
        } else {
            console.log(`Departman zaten mevcut: ${DEPARTMENT_NAME}`);
        }
        deptId = deptRes.rows[0].id;

        // 2. Personelleri Ekle
        for (const name of EMPLOYEES) {
            // Email oluştur (türkçe karakterleri temizle)
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

            // Employee tablosuna ekle - user_id unique constraint bekleniyor
            // Önce var mı kontrol et (çünkü user_id constraint employee tablosunda olmayabilir ama logic gereği 1-1)
            const empCheck = await client.query('SELECT id FROM employees WHERE user_id = $1', [userId]);

            if (empCheck.rows.length === 0) {
                await client.query(
                    `INSERT INTO employees (user_id, department_id, hire_date)
             VALUES ($1, $2, CURRENT_DATE)`,
                    [userId, deptId]
                );
                console.log(`Personel eklendi: ${name}`);
            } else {
                await client.query(
                    'UPDATE employees SET department_id = $1 WHERE user_id = $2',
                    [deptId, userId]
                );
                console.log(`Personel güncellendi: ${name}`);
            }
        }

        console.log('Tüm veriler başarıyla eklendi!');

    } catch (err) {
        console.error('Hata:', err);
    } finally {
        await client.end();
    }
}

seed();
