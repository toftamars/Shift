import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { startOfWeek, addDays, format } from 'date-fns';

interface EmployeeRow {
    id: string;
    user_id: string;
    name: string;
    department_name: string | null;
}

interface ShiftTypeRow {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
    color_code: string | null;
}

export async function POST(request: Request) {
    try {
        const { date } = await request.json();
        const targetDate = date ? new Date(date) : new Date();

        // Pazartesiden pazara
        const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 });
        const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

        // 1. Verileri Çek
        const empRes = await query(`
            SELECT e.id, e.user_id, u.full_name as name, d.name as department_name 
            FROM employees e
            JOIN users u ON e.user_id = u.id
            LEFT JOIN departments d ON e.department_id = d.id
        `);
        const employees = empRes.rows as EmployeeRow[];

        const typeRes = await query('SELECT * FROM shift_types');
        const shiftTypes = typeRes.rows as ShiftTypeRow[];
        // Name -> Type mapping
        const typeMap = new Map<string, ShiftTypeRow>(shiftTypes.map(t => [t.name, t]));

        if (!typeMap.has('OFF') || !typeMap.has('1')) {
            return NextResponse.json({ error: 'Gerekli vardiya türleri (1, OFF) bulunamadı. Lütfen sistem yöneticisine başvurun.' }, { status: 500 });
        }

        // Bu hafta için mevcut vardiyaları sil
        const startDateStr = format(weekDays[0], 'yyyy-MM-dd');
        const endDateStr = format(weekDays[6], 'yyyy-MM-dd');
        await query('DELETE FROM shifts WHERE shift_date >= $1 AND shift_date <= $2', [startDateStr, endDateStr]);

        const schedule = [];
        const employeeOffCounts = new Map<string, number>(); // id -> count
        employees.forEach(e => employeeOffCounts.set(e.id, 0));

        // Her gün için planla
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const currentDayStr = format(weekDays[dayIndex], 'yyyy-MM-dd');

            // Departman bazlı sayaçlar (O gün için)
            const deptOffs: Record<string, number> = {};
            const deptEvening: Record<string, number> = {};

            // Personel listesini karıştır (randomness)
            const shuffledEmps = [...employees].sort(() => Math.random() - 0.5);

            for (const emp of shuffledEmps) {
                const dept = emp.department_name || 'Diğer';
                const offCountTotal = employeeOffCounts.get(emp.id) || 0;

                // Varsayılan: Sabahçı (1)
                let assignedType = typeMap.get('1')!;

                // OFF Kararı
                // Max 2 OFF haftalık + Departman Kuralları
                let canBeOff = offCountTotal < 2;

                // Departman Kuralı: Aynı gün max X OFF
                const currentDeptOffs = deptOffs[dept] || 0;

                if (dept === 'GİTAR') {
                    // Hafta sonu (Cmt=5, Paz=6) max 1, Hafta içi max 2
                    if (dayIndex >= 5) { if (currentDeptOffs >= 1) canBeOff = false; }
                    else { if (currentDeptOffs >= 2) canBeOff = false; }
                } else if (dept === 'LIFESTYLE') {
                    if (dayIndex >= 5) { if (currentDeptOffs >= 1) canBeOff = false; }
                    else { if (currentDeptOffs >= 2) canBeOff = false; }
                } else if (['PİYANO', 'DAVUL', 'KASA', 'STÜDYO'].includes(dept)) {
                    // Asla aynı gün 2 kişi OFF olamaz (Max 1)
                    if (currentDeptOffs >= 1) canBeOff = false;
                }

                // Rastgelelik (eğer OFF olabiliyorsa %30 ihtimalle ver, veya haftanın sonlarına yaklaştıysa zorla)
                // Eğer Pazar günü ve hala hiç OFF kullanmadıysa kesin ver.
                const daysLeft = 6 - dayIndex;
                const offsNeeded = 2 - offCountTotal;
                let forceOff = false;
                if (daysLeft < offsNeeded) forceOff = true;

                if ((canBeOff && Math.random() < 0.3) || (canBeOff && forceOff)) {
                    assignedType = typeMap.get('OFF')!;
                    deptOffs[dept] = (deptOffs[dept] || 0) + 1;
                    employeeOffCounts.set(emp.id, offCountTotal + 1);
                } else {
                    // Çalışıyor. Hangi vardiya? (1, 2, 3)
                    // Kural: Eğer o departmanda biri OFF ise, o gün akşamcı (2 veya 3) olmalı.
                    const hasOff = (deptOffs[dept] || 0) > 0;
                    const hasEve = (deptEvening[dept] || 0) > 0;

                    if (hasOff && !hasEve && ['PİYANO', 'DAVUL', 'KASA', 'STÜDYO'].includes(dept)) {
                        // Zorunlu Akşam
                        assignedType = typeMap.get('2') || typeMap.get('3') || typeMap.get('1')!;
                    } else {
                        // Rastgele
                        const rnd = Math.random();
                        if (rnd < 0.6) assignedType = typeMap.get('1')!; // %60 1 (Sabah)
                        else if (rnd < 0.8) assignedType = typeMap.get('2') || typeMap.get('1')!; // %20 2
                        else if (rnd < 0.9) assignedType = typeMap.get('3') || typeMap.get('1')!; // %10 3
                        else assignedType = typeMap.get('1')!;
                    }

                    if (['2', '3', '4'].includes(assignedType.name)) {
                        deptEvening[dept] = (deptEvening[dept] || 0) + 1;
                    }
                }

                schedule.push({
                    employee_id: emp.id,
                    shift_type_id: assignedType.id,
                    shift_date: currentDayStr,
                    start_time: assignedType.start_time,
                    end_time: assignedType.end_time
                });
            }
        }

        // Toplu Kayıt
        for (const item of schedule) {
            await query(
                `INSERT INTO shifts (employee_id, shift_type_id, shift_date, start_time, end_time, status)
                 VALUES ($1, $2, $3, $4, $5, 'APPROVED')`,
                [item.employee_id, item.shift_type_id, item.shift_date, item.start_time, item.end_time]
            );
        }

        return NextResponse.json({ success: true, count: schedule.length });

    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
