import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fromDate = searchParams.get('from_date');
        const toDate = searchParams.get('to_date');

        if (fromDate && toDate) {
            const result = await query(
                `SELECT s.id, s.employee_id, s.shift_type_id, s.shift_date, s.start_time, s.end_time,
                u.full_name as employee_name, st.name as shift_type_name, st.color_code
         FROM shifts s
         JOIN employees e ON s.employee_id = e.id
         JOIN users u ON e.user_id = u.id
         JOIN shift_types st ON s.shift_type_id = st.id
         WHERE s.shift_date BETWEEN $1 AND $2
         ORDER BY s.shift_date, s.start_time`,
                [fromDate, toDate]
            );

            const rows = result.rows.map((row: any) => ({
                ...row,
                start_time: row.start_time?.toString?.()?.slice(0, 5) ?? row.start_time,
                end_time: row.end_time?.toString?.()?.slice(0, 5) ?? row.end_time,
            }));

            return NextResponse.json(rows);
        }

        return NextResponse.json([]);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Vardiyalar listelenemedi' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { employee_id: empId, shift_type_id: typeId, shift_date: date, start_time: start, end_time: end } = body;

        if (!empId || !typeId || !date || !start || !end) {
            return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });
        }

        const result = await query(
            `INSERT INTO shifts (employee_id, shift_type_id, shift_date, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, employee_id, shift_type_id, shift_date, start_time, end_time`,
            [empId, typeId, date, start, end]
        );

        const row = result.rows[0];
        const newShift = {
            ...row,
            start_time: row.start_time?.toString?.()?.slice(0, 5) ?? row.start_time,
            end_time: row.end_time?.toString?.()?.slice(0, 5) ?? row.end_time,
        };

        return NextResponse.json(newShift, { status: 201 });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: 'Vardiya oluşturulamadı' }, { status: 500 });
    }
}
