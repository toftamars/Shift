import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const departmentId = searchParams.get('department_id');

        let sql = 'SELECT e.id, e.employee_code, e.hire_date, e.department_id, u.full_name as name, d.name as department_name FROM employees e LEFT JOIN users u ON e.user_id = u.id LEFT JOIN departments d ON e.department_id = d.id WHERE u.id IS NOT NULL';
        const params: string[] = [];

        if (departmentId) {
            sql += ' AND e.department_id = $1';
            params.push(departmentId);
        }
        sql += ' ORDER BY u.full_name';

        const result = await query(sql, params.length ? params : undefined);
        return NextResponse.json(result.rows);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Personel listelenemedi' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, department_id: departmentId, hire_date: hireDate } = body;
        const fullName = name != null ? String(name).trim() : '';
        if (!fullName || !hireDate) {
            return NextResponse.json({ error: 'Ad soyad ve işe giriş tarihi gerekli' }, { status: 400 });
        }
        const deptId = departmentId && String(departmentId).trim() !== '' ? departmentId : null;

        const client = await getClient();
        try {
            await client.query('BEGIN');
            const userRes = await client.query(
                `INSERT INTO users (email, full_name, role) VALUES (NULL, $1, 'EMPLOYEE') RETURNING id`,
                [fullName]
            );
            const userId = userRes.rows[0].id;
            const empRes = await client.query(
                `INSERT INTO employees (user_id, department_id, employee_code, hire_date)
         VALUES ($1, $2, NULL, $3)
         RETURNING id, user_id, department_id, employee_code, hire_date`,
                [userId, deptId, hireDate]
            );
            await client.query('COMMIT');
            const row = empRes.rows[0];
            return NextResponse.json({ ...row, name: fullName }, { status: 201 });
        } catch (txErr: any) {
            await client.query('ROLLBACK').catch(() => { });
            throw txErr;
        } finally {
            client.release();
        }
    } catch (err: any) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('unique') || msg.includes('duplicate')) {
            return NextResponse.json({ error: 'Kayıt oluşturulamadı, tekrar deneyin' }, { status: 409 });
        }
        console.error(err);
        return NextResponse.json({ error: 'Çalışan eklenemedi' }, { status: 500 });
    }
}
