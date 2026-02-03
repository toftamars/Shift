import React, { useEffect, useMemo, useState } from 'react';
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { employeesApi, shiftsApi } from '../services/api';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { ShiftCard } from '../components/ShiftCard';
import type { Employee, Shift } from '../types';

/** Skill: js-set-map-lookups — Map for O(1) shift lookup by employee+day */
function buildShiftsByKey(shifts: Shift[], weekDays: Date[], employeeIds: string[]): Map<string, Shift[]> {
  const map = new Map<string, Shift[]>();
  for (const empId of employeeIds) {
    for (const day of weekDays) {
      const key = `${empId}-${format(day, 'yyyy-MM-dd')}`;
      const list = shifts.filter((s) => s.employeeId === empId && isSameDay(s.day, day));
      if (list.length > 0) map.set(key, list);
    }
  }
  return map;
}

function PlannerPage() {
  const [currentDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekEnd = useMemo(() => endOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const shiftsByKey = useMemo(
    () => buildShiftsByKey(shifts, weekDays, employees.map((e) => String(e.id))),
    [shifts, weekDays, employees]
  );

  const getShiftsForDay = useMemo(
    () => (employeeId: string | number, day: Date) =>
      shiftsByKey.get(`${employeeId}-${format(day, 'yyyy-MM-dd')}`) ?? [],
    [shiftsByKey]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fromDate = format(weekStart, 'yyyy-MM-dd');
    const toDate = format(weekEnd, 'yyyy-MM-dd');

    Promise.all([employeesApi.list(), shiftsApi.listByDateRange(fromDate, toDate)])
      .then(([empRes, shiftsRes]) => {
        if (cancelled) return;
        const empData = Array.isArray(empRes.data) ? empRes.data : [];
        const shiftData = Array.isArray(shiftsRes.data) ? shiftsRes.data : [];
        const empList = empData.map((e: { id: string; name?: string; employee_code: string; department_id?: string | null }) => ({
          id: e.id,
          name: e.name || e.employee_code || '—',
          role: e.department_id || 'Personel',
        }));
        const shiftList: Shift[] = shiftData.map((s: { id: string; employee_id: string; shift_date: string; start_time: string; end_time: string }) => ({
          id: s.id,
          employeeId: s.employee_id,
          day: new Date(s.shift_date),
          startTime: typeof s.start_time === 'string' ? s.start_time.slice(0, 5) : '00:00',
          endTime: typeof s.end_time === 'string' ? s.end_time.slice(0, 5) : '00:00',
        }));
        setEmployees(empList);
        setShifts(shiftList);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err.response?.data?.error ?? err.message ?? 'Veri yüklenemedi';
        const status = err.response?.status;
        setError(status ? `${msg} (${status})` : msg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [weekStart, weekEnd, retryKey]);

  if (loading && employees.length === 0) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>Yükleniyor…</p>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ ['--emp-count' as string]: Math.max(employees.length, 1) }}>
      <a href="#main-content" className="skip-link">İçeriğe atla</a>
      <Sidebar />
      <main id="main-content" className="main-stage" tabIndex={-1}>
        <div className="bg-glow" style={{ top: '-100px', left: '-100px' }} />
        <Header startDate={weekStart} endDate={weekEnd} />
        {error ? (
          <div
            role="alert"
            aria-live="polite"
            className="error-banner"
            style={{ padding: 12, margin: 16, background: 'rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => { setError(null); setLoading(true); setRetryKey((k) => k + 1); }}
              className="btn-retry"
              aria-label="Veriyi tekrar yükle"
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: '#fca5a5', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              Tekrar dene
            </button>
          </div>
        ) : null}
        <div className="content-grid-wrapper">
          <div className="shift-grid" role="grid" aria-label="Haftalık vardiya planı">
            <div className="grid-cell header-cell">
              <div className="mono">Takvim</div>
            </div>
            {employees.map((emp) => (
              <div key={emp.id} className="grid-cell header-cell">
                <div style={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.05em' }}>{emp.name}</div>
                <div className="mono" style={{ fontSize: '8px', opacity: 0.5 }}>{emp.role}</div>
              </div>
            ))}

            {weekDays.map((day) => (
              <React.Fragment key={day.toString()}>
                <div className="grid-cell date-cell">
                  <div className="mono" style={{ opacity: 0.6 }}>{format(day, 'EEE', { locale: tr })}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1 }}>{format(day, 'dd')}</div>
                </div>
                {employees.map((emp) => (
                  <div key={emp.id} className="grid-cell grid-cell-shift">
                    {getShiftsForDay(emp.id, day).map((shift) => (
                      <ShiftCard key={shift.id} shift={shift} />
                    ))}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default PlannerPage;
