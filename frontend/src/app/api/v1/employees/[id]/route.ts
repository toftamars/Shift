import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const result = await query(
            `SELECT e.id, e.employee_code, e.hire_date, e.max_weekly_hours, e.min_rest_hours, e.is_part_time, e.department_id, e.skills, e.preferences, u.full_name as name, u.email
       FROM employees e LEFT JOIN users u ON e.user_id = u.id WHERE e.id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Personel bulunamadı' }, { status: 404 });
        }
        return NextResponse.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Personel getirilemedi' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const getRes = await query('SELECT user_id FROM employees WHERE id = $1', [id]);
        if (getRes.rows.length === 0) {
            return NextResponse.json({ error: 'Personel bulunamadı' }, { status: 404 });
        }
        const userId = getRes.rows[0].user_id;
        await query('DELETE FROM users WHERE id = $1', [userId]);
        return new NextResponse(null, { status: 204 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Personel silinemedi' }, { status: 500 });
    }
}
