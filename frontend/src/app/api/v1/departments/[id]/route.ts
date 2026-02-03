import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const { name, description } = await request.json();
        const result = await query(
            'UPDATE departments SET name = $1, description = $2 WHERE id = $3 RETURNING id, name, description',
            [name, description, id]
        );
        if (result.rows.length === 0) return NextResponse.json({ error: 'Departman bulunamadı' }, { status: 404 });
        return NextResponse.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Güncellenemedi' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const check = await query('SELECT 1 FROM employees WHERE department_id = $1 LIMIT 1', [id]);
        if (check.rows.length > 0) return NextResponse.json({ error: 'Bu departmanda çalışanlar var, önce onları taşıyın veya silin' }, { status: 409 });

        const result = await query('DELETE FROM departments WHERE id = $1', [id]);
        if (result.rowCount === 0) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
        return new NextResponse(null, { status: 204 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Silinemedi' }, { status: 500 });
    }
}
