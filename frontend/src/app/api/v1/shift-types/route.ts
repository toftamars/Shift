import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const result = await query(
            `SELECT id, name, start_time, end_time, duration_hours, color_code, is_overnight
       FROM shift_types ORDER BY start_time`
        );
        const rows = result.rows.map((row: any) => ({
            ...row,
            start_time: row.start_time?.toString?.()?.slice(0, 5) ?? row.start_time,
            end_time: row.end_time?.toString?.()?.slice(0, 5) ?? row.end_time,
        }));
        return NextResponse.json(rows);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Vardiya türleri listelenemedi' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, start_time: startTime, end_time: endTime, color_code: colorCode } = body;
        const nameStr = name != null ? String(name).trim() : '';
        if (!nameStr || !startTime || !endTime) {
            return NextResponse.json({ error: 'Ad, başlangıç ve bitiş saati gerekli' }, { status: 400 });
        }
        const startStr = String(startTime).trim().slice(0, 5);
        const endStr = String(endTime).trim().slice(0, 5);
        const color = colorCode && String(colorCode).trim() !== '' ? String(colorCode).trim() : null;
        const result = await query(
            `INSERT INTO shift_types (name, start_time, end_time, duration_hours, color_code)
       VALUES ($1, $2, $3, EXTRACT(EPOCH FROM (($3::time - $2::time + interval '24 hours') % interval '24 hours'))/3600, $4)
       RETURNING id, name, start_time, end_time, duration_hours, color_code`,
            [nameStr, startStr, endStr, color]
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
        return NextResponse.json({ error: 'Vardiya türü eklenemedi' }, { status: 500 });
    }
}
