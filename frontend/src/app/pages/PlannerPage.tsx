'use client';
import { useEffect, useMemo, useState } from 'react';
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { X } from 'lucide-react';
import { employeesApi, shiftsApi, shiftTypesApi, getErrorMessage } from '@/services/api';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { ShiftCard } from '@/components/ShiftCard';
import type { Employee, Shift } from '@/types';

interface ShiftTypeOption {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
}

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
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [assignCell, setAssignCell] = useState<{ employeeId: string; day: Date } | null>(null);
  const [shiftTypes, setShiftTypes] = useState<ShiftTypeOption[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSubmitLoading, setAssignSubmitLoading] = useState(false);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [selectedShiftTypeId, setSelectedShiftTypeId] = useState<string>('');

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const weekStart = useMemo(() => currentDate ? startOfWeek(currentDate, { weekStartsOn: 1 }) : new Date(), [currentDate]);
  const weekEnd = useMemo(() => currentDate ? endOfWeek(currentDate, { weekStartsOn: 1 }) : new Date(), [currentDate]);
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
    if (!currentDate) return;
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
        const empList = empData.map((e: { id: string; name?: string; department_id?: string | null; department_name?: string | null }) => ({
          id: e.id,
          name: e.name || '—',
          role: e.department_name || '—',
        }));
        const shiftList: Shift[] = shiftData.map((s: {
          id: string;
          employee_id: string;
          shift_date: string;
          start_time: string;
          end_time: string;
          shift_type_name?: string;
          color_code?: string;
        }) => ({
          id: s.id,
          employeeId: s.employee_id,
          day: new Date(s.shift_date),
          startTime: typeof s.start_time === 'string' ? s.start_time.slice(0, 5) : '00:00',
          endTime: typeof s.end_time === 'string' ? s.end_time.slice(0, 5) : '00:00',
          name: s.shift_type_name,
          color_code: s.color_code
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

  const handleAutoSchedule = () => {
    if (!currentDate) return;
    if (!window.confirm('Bu haftanın mevcut tüm vardiyaları silinecek ve kurallara göre yeniden oluşturulacak. Emin misiniz?')) return;

    setAutoGenerating(true);
    setError(null);
    const dateStr = format(weekStart, 'yyyy-MM-dd');

    shiftsApi.autoSchedule(dateStr)
      .then(() => {
        setRetryKey(k => k + 1);
      })
      .catch(err => {
        setError(getErrorMessage(err, 'Otomatik planlama başarısız oldu'));
      })
      .finally(() => {
        setAutoGenerating(false);
      });
  };

  useEffect(() => {
    if (!assignCell) return;
    setAssignError(null);
    setSelectedShiftTypeId('');
    setAssignLoading(true);
    shiftTypesApi
      .list()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const types = data.map((t: { id: string; name: string; start_time: string; end_time: string }) => ({
          id: t.id,
          name: t.name,
          start_time: typeof t.start_time === 'string' ? t.start_time.slice(0, 5) : '08:00',
          end_time: typeof t.end_time === 'string' ? t.end_time.slice(0, 5) : '16:00',
        }));
        setShiftTypes(types);
        if (types.length > 0) setSelectedShiftTypeId(types[0].id);
      })
      .catch((err) => setAssignError(getErrorMessage(err, 'Vardiya türleri yüklenemedi')))
      .finally(() => setAssignLoading(false));
  }, [assignCell]);

  const openAssignModal = (employeeId: string, day: Date) => {
    setAssignCell({ employeeId, day });
  };

  const handleAssignSubmit = () => {
    if (!assignCell || !selectedShiftTypeId) return;
    const st = shiftTypes.find((t) => t.id === selectedShiftTypeId);
    if (!st) return;
    setAssignError(null);
    setAssignSubmitLoading(true);
    shiftsApi
      .create({
        employee_id: assignCell.employeeId,
        shift_type_id: selectedShiftTypeId,
        shift_date: format(assignCell.day, 'yyyy-MM-dd'),
        start_time: st.start_time,
        end_time: st.end_time,
      })
      .then(() => {
        setAssignCell(null);
        setRetryKey((k) => k + 1);
      })
      .catch((err) => setAssignError(getErrorMessage(err, 'Vardiya atanamadı')))
      .finally(() => setAssignSubmitLoading(false));
  };

  if (!currentDate) {
    return null;
  }

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
        <Header startDate={weekStart} endDate={weekEnd}>
          <button
            type="button"
            className="btn-premium"
            disabled={autoGenerating}
            onClick={handleAutoSchedule}
            style={{
              padding: '10px 20px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {autoGenerating ? 'Oluşturuluyor...' : 'Vardiya Oluştur'}
          </button>
        </Header>
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
            {/* Sol sütun: tarih – hep solda, günler alt alta */}
            <div className="shift-grid-date-col">
              <div className="grid-cell header-cell date-col-cell">
                <div className="mono">Takvim</div>
              </div>
              {weekDays.map((day) => (
                <div key={day.toString()} className="grid-cell date-cell date-col-cell">
                  <div className="mono" style={{ opacity: 0.6 }}>{format(day, 'EEE', { locale: tr })}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1 }}>{format(day, 'dd')}</div>
                </div>
              ))}
            </div>
            {/* Sağ: personel ve departman isimleri yatay sütunlarda */}
            <div className="shift-grid-body" style={{ ['--emp-count' as string]: Math.max(employees.length, 1) }}>
              {employees.length === 0 ? (
                <div className="grid-cell header-cell" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120, color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                  Personel ekleyin. Personel sayfasından çalışan oluşturduğunuzda burada yatay sütun olarak görünecek.
                </div>
              ) : (
                <>
                  {employees.map((emp) => (
                    <div key={emp.id} className="grid-cell header-cell">
                      <div style={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.05em' }}>{emp.name}</div>
                      <div className="mono" style={{ fontSize: '0.7rem', opacity: 0.7 }}>{emp.role}</div>
                    </div>
                  ))}
                  {weekDays.map((day) =>
                    employees.map((emp) => (
                      <div
                        key={`${emp.id}-${day.toString()}`}
                        className="grid-cell grid-cell-shift"
                        role="button"
                        tabIndex={0}
                        onClick={() => openAssignModal(String(emp.id), day)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAssignModal(String(emp.id), day); } }}
                        aria-label={`${emp.name}, ${format(day, 'd MMMM')} – vardiya ata`}
                        style={{ cursor: 'pointer', minHeight: 100 }}
                      >
                        {getShiftsForDay(emp.id, day).map((shift) => (
                          <ShiftCard key={shift.id} shift={shift} />
                        ))}
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {assignCell && (
          <div role="dialog" aria-modal="true" aria-labelledby="assign-shift-title" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setAssignCell(null)}>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, minWidth: 320, maxWidth: '90vw' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 id="assign-shift-title" className="studio-title" style={{ margin: 0, fontSize: '1rem' }}>VARDİYA ATA</h2>
                <button type="button" aria-label="Kapat" onClick={() => setAssignCell(null)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '0.875rem', color: 'var(--text-dim)' }}>{format(assignCell.day, 'd MMMM yyyy', { locale: tr })}</p>
              {assignError && <div role="alert" style={{ padding: 10, marginBottom: 12, background: 'rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: 8, fontSize: '0.875rem' }}>{assignError}</div>}
              {assignLoading ? (
                <p style={{ color: 'var(--text-dim)' }}>Vardiya türleri yükleniyor…</p>
              ) : (
                <>
                  <label htmlFor="assign-shift-type" style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', color: 'var(--text-dim)' }}>Vardiya türü seçin</label>
                  <select
                    id="assign-shift-type"
                    value={selectedShiftTypeId}
                    onChange={(e) => setSelectedShiftTypeId(e.target.value)}
                    style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'inherit', marginBottom: 16 }}
                  >
                    {shiftTypes.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.start_time} – {t.end_time})</option>
                    ))}
                  </select>
                  {shiftTypes.length === 0 && <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>Önce Vardiya Türleri sayfasından vardiya türü oluşturun.</p>}
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setAssignCell(null)} style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'inherit', cursor: 'pointer' }}>İptal</button>
                    <button type="button" className="btn-premium" disabled={assignSubmitLoading || shiftTypes.length === 0} onClick={handleAssignSubmit} style={{ padding: '10px 18px' }}>{assignSubmitLoading ? 'Atanıyor…' : 'Kaydet'}</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default PlannerPage;
