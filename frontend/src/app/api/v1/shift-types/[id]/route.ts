import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const result = await query(
            'SELECT id, name, start_time, end_time, duration_hours, color_code, is_overnight FROM shift_types WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Vardiya türü bulunamadı' }, { status: 404 });
        }
        const row = result.rows[0];
        const data = {
            ...row,
            start_time: row.start_time?.toString?.()?.slice(0, 5) ?? row.start_time,
            end_time: row.end_time?.toString?.()?.slice(0, 5) ?? row.end_time,
        };
        return NextResponse.json(data);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Vardiya türü getirilemedi' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
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
            `UPDATE shift_types SET name = $1, start_time = $2, end_time = $3, duration_hours = EXTRACT(EPOCH FROM (($3::time - $2::time + interval '24 hours') % interval '24 hours'))/3600, color_code = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, name, start_time, end_time, duration_hours, color_code`,
            [nameStr, startStr, endStr, color, id]
        );
        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Vardiya türü bulunamadı' }, { status: 404 });
        }
        const row = result.rows[0];
        const data = {
            ...row,
            start_time: row.start_time?.toString?.()?.slice(0, 5) ?? row.start_time,
            end_time: row.end_time?.toString?.()?.slice(0, 5) ?? row.end_time,
        };
        return NextResponse.json(data);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Vardiya türü güncellenemedi' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const check = await query('SELECT 1 FROM shifts WHERE shift_type_id = $1 LIMIT 1', [id]);
        if (check.rows.length > 0) {
            return NextResponse.json({ error: 'Bu vardiya türü kullanılıyor, önce vardiyaları kaldırın' }, { status: 409 });
        }
        const result = await query('DELETE FROM shift_types WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Vardiya türü bulunamadı' }, { status: 404 });
        }
        return new NextResponse(null, { status: 204 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Vardiya türü silinemedi' }, { status: 500 });
    }
}
