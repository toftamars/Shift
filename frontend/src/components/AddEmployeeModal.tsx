import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { employeesApi, departmentsApi, getErrorMessage } from '../services/api';

interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface DepartmentOption {
  id: string;
  name: string;
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

export function AddEmployeeModal({ open, onClose, onSuccess }: AddEmployeeModalProps) {
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    employee_code: '',
    department_id: '',
    hire_date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm((p) => ({ ...p, hire_date: format(new Date(), 'yyyy-MM-dd') }));
    setLoading(true);
    departmentsApi
      .list()
      .then((res) => {
        const deptData = Array.isArray(res.data) ? res.data : [];
        setDepartments(deptData.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name })));
      })
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false));
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const code = form.employee_code.trim();
    if (!name || !email || !code || !form.hire_date) {
      setError('Ad soyad, e-posta, sicil no ve işe giriş tarihi gerekli.');
      return;
    }
    setError(null);
    setSubmitLoading(true);
    employeesApi
      .create({
        name,
        email,
        employee_code: code,
        department_id: form.department_id || null,
        hire_date: form.hire_date,
      })
      .then(() => {
        onSuccess();
        onClose();
      })
      .catch((err) => setError(getErrorMessage(err, 'Çalışan eklenemedi')))
      .finally(() => setSubmitLoading(false));
  };

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="add-employee-title" style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 id="add-employee-title" className="studio-title" style={{ margin: 0, fontSize: '1.1rem' }}>ÇALIŞAN EKLE</h2>
          <button type="button" aria-label="Kapat" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>
        {loading && <p style={{ color: 'var(--text-dim)' }}>Departman listesi yükleniyor…</p>}
        {error && (
          <div role="alert" style={{ padding: 10, marginBottom: 16, background: 'rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: 8, fontSize: '0.875rem' }}>{error}</div>
        )}
        {!loading && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="emp-name" style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', color: 'var(--text-dim)' }}>Ad soyad *</label>
              <input
                id="emp-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Örn. Ahmet Yılmaz"
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'inherit' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="emp-email" style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', color: 'var(--text-dim)' }}>E-posta *</label>
              <input
                id="emp-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="ornek@sirket.com"
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'inherit' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="emp-code" style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', color: 'var(--text-dim)' }}>Sicil no *</label>
              <input
                id="emp-code"
                type="text"
                required
                value={form.employee_code}
                onChange={(e) => setForm((p) => ({ ...p, employee_code: e.target.value }))}
                placeholder="Örn. SICIL001"
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'inherit' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="emp-dept" style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', color: 'var(--text-dim)' }}>Departman (opsiyonel)</label>
              <select
                id="emp-dept"
                value={form.department_id}
                onChange={(e) => setForm((p) => ({ ...p, department_id: e.target.value }))}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'inherit' }}
              >
                <option value="">Seçin</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label htmlFor="emp-hire" style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', color: 'var(--text-dim)' }}>İşe giriş tarihi *</label>
              <input
                id="emp-hire"
                type="date"
                required
                value={form.hire_date}
                onChange={(e) => setForm((p) => ({ ...p, hire_date: e.target.value }))}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'inherit', cursor: 'pointer' }}>İptal</button>
              <button type="submit" className="btn-premium" disabled={submitLoading} style={{ padding: '10px 18px' }}>{submitLoading ? 'Ekleniyor…' : 'Kaydet'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
