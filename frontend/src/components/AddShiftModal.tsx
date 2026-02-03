import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { employeesApi, shiftTypesApi, shiftsApi } from '../services/api';

interface AddShiftModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultDate?: Date;
}

interface EmployeeOption {
  id: string;
  name: string;
  employee_code: string;
}

interface ShiftTypeOption {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 24,
  minWidth: 360,
  maxWidth: '90vw',
  maxHeight: '90vh',
  overflow: 'auto',
};

export function AddShiftModal({ open, onClose, onSuccess, defaultDate }: AddShiftModalProps) {
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftTypeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    employee_id: '',
    shift_type_id: '',
    shift_date: format(defaultDate ?? new Date(), 'yyyy-MM-dd'),
    start_time: '08:00',
    end_time: '16:00',
  });

  useEffect(() => {
    if (!open) return;
    setError(null);
    const defaultDateStr = format(defaultDate ?? new Date(), 'yyyy-MM-dd');
    setForm({ employee_id: '', shift_type_id: '', shift_date: defaultDateStr, start_time: '08:00', end_time: '16:00' });
    setLoading(true);
    Promise.all([employeesApi.list(), shiftTypesApi.list()])
      .then(([empRes, typeRes]) => {
        const empData = Array.isArray(empRes.data) ? empRes.data : [];
        const typeData = Array.isArray(typeRes.data) ? typeRes.data : [];
        setEmployees(
          empData.map((e: { id: string; name?: string; employee_code: string }) => ({
            id: e.id,
            name: e.name || e.employee_code || '—',
            employee_code: e.employee_code,
          }))
        );
        const types: ShiftTypeOption[] = typeData.map((t: { id: string; name: string; start_time: string; end_time: string }) => ({
          id: t.id,
          name: t.name,
          start_time: typeof t.start_time === 'string' ? t.start_time.slice(0, 5) : '08:00',
          end_time: typeof t.end_time === 'string' ? t.end_time.slice(0, 5) : '16:00',
        }));
        setShiftTypes(types);
        if (types.length > 0) {
          setForm((prev) => ({
            ...prev,
            shift_type_id: types[0].id,
            start_time: types[0].start_time,
            end_time: types[0].end_time,
          }));
        }
      })
      .catch((err) => setError(err.response?.data?.error ?? 'Liste yüklenemedi'))
      .finally(() => setLoading(false));
  }, [open, defaultDate]);

  const handleShiftTypeChange = (shiftTypeId: string) => {
    const st = shiftTypes.find((t) => t.id === shiftTypeId);
    setForm((prev) => ({
      ...prev,
      shift_type_id: shiftTypeId,
      start_time: st ? st.start_time : prev.start_time,
      end_time: st ? st.end_time : prev.end_time,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_id || !form.shift_type_id || !form.shift_date || !form.start_time || !form.end_time) {
      setError('Tüm alanları doldurun.');
      return;
    }
    setError(null);
    setSubmitLoading(true);
    shiftsApi
      .create({
        employee_id: form.employee_id,
        shift_type_id: form.shift_type_id,
        shift_date: form.shift_date,
        start_time: form.start_time,
        end_time: form.end_time,
      })
      .then(() => {
        onSuccess();
        onClose();
      })
      .catch((err) => {
        setError(err.response?.data?.error ?? 'Vardiya eklenemedi');
      })
      .finally(() => setSubmitLoading(false));
  };

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="add-shift-title" style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 id="add-shift-title" className="studio-title" style={{ margin: 0, fontSize: '1.1rem' }}>
            VARDİYA EKLE
          </h2>
          <button
            type="button"
            aria-label="Kapat"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {loading && (
          <p style={{ color: 'var(--text-dim)' }}>Personel ve vardiya türleri yükleniyor…</p>
        )}

        {error && (
          <div role="alert" style={{ padding: 10, marginBottom: 16, background: 'rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: 8, fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {!loading && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="add-shift-employee" style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', color: 'var(--text-dim)' }}>
                Personel
              </label>
              <select
                id="add-shift-employee"
                required
                value={form.employee_id}
                onChange={(e) => setForm((prev) => ({ ...prev, employee_id: e.target.value }))}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'inherit' }}
              >
                <option value="">Seçin</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employee_code})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label htmlFor="add-shift-type" style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', color: 'var(--text-dim)' }}>
                Vardiya türü
              </label>
              <select
                id="add-shift-type"
                required
                value={form.shift_type_id}
                onChange={(e) => handleShiftTypeChange(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'inherit' }}
              >
                <option value="">Seçin</option>
                {shiftTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.start_time}–{t.end_time})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label htmlFor="add-shift-date" style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', color: 'var(--text-dim)' }}>
                Tarih
              </label>
              <input
                id="add-shift-date"
                type="date"
                required
                value={form.shift_date}
                onChange={(e) => setForm((prev) => ({ ...prev, shift_date: e.target.value }))}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'inherit' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label htmlFor="add-shift-start" style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', color: 'var(--text-dim)' }}>
                  Başlangıç
                </label>
                <input
                  id="add-shift-start"
                  type="time"
                  required
                  value={form.start_time}
                  onChange={(e) => setForm((prev) => ({ ...prev, start_time: e.target.value }))}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'inherit' }}
                />
              </div>
              <div>
                <label htmlFor="add-shift-end" style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', color: 'var(--text-dim)' }}>
                  Bitiş
                </label>
                <input
                  id="add-shift-end"
                  type="time"
                  required
                  value={form.end_time}
                  onChange={(e) => setForm((prev) => ({ ...prev, end_time: e.target.value }))}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'inherit' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'inherit', cursor: 'pointer' }}
              >
                İptal
              </button>
              <button
                type="submit"
                className="btn-premium"
                disabled={submitLoading}
                style={{ padding: '10px 18px' }}
              >
                {submitLoading ? 'Ekleniyor…' : 'Ekle'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
