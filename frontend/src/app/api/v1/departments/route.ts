import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const result = await query('SELECT id, name, description FROM departments ORDER BY name');
        return NextResponse.json(result.rows);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Departmanlar listelenemedi' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description } = body;
        if (!name) return NextResponse.json({ error: 'İsim gerekli' }, { status: 400 });

        const result = await query(
            'INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING id, name, description',
            [name, description]
        );
        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Departman eklenemedi' }, { status: 500 });
    }
}
