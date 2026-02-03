'use client';
import { useEffect, useState } from 'react';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { departmentsApi, getErrorMessage } from '@/services/api';
import { Sidebar } from '@/components/Sidebar';

interface DepartmentRow {
  id: string;
  name: string;
  description: string | null;
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
};

export function DepartmanlarPage() {
  const [list, setList] = useState<DepartmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const fetchList = () => {
    setLoading(true);
    setError(null);
    departmentsApi
      .list()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setList(data);
      })
      .catch((err) => setError(getErrorMessage(err, 'Liste yüklenemedi')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  const openCreate = () => {
    setForm({ name: '', description: '' });
    setEditingId(null);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (row: DepartmentRow) => {
    setForm({ name: row.name, description: row.description || '' });
    setEditingId(row.id);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setFormError('Departman adı gerekli');
      return;
    }
    setFormError(null);
    setSubmitLoading(true);
    const body = { name, description: form.description.trim() || null };
    (editingId ? departmentsApi.update(editingId, body) : departmentsApi.create(body))
      .then(() => {
        setModalOpen(false);
        fetchList();
      })
      .catch((err) => setFormError(getErrorMessage(err, editingId ? 'Güncellenemedi' : 'Eklenemedi')))
      .finally(() => setSubmitLoading(false));
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`"${name}" departmanını silmek istediğinize emin misiniz?`)) return;
    setDeletingId(id);
    departmentsApi
      .delete(id)
      .then(() => fetchList())
      .catch((err) => setError(getErrorMessage(err, 'Silinemedi')))
      .finally(() => setDeletingId(null));
  };

  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">İçeriğe atla</a>
      <Sidebar />
      <main id="main-content" className="main-stage" tabIndex={-1}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="mono" style={{ marginBottom: '8px' }}>Departmanlar</div>
            <h1 className="studio-title">DEPARTMAN <span>LİSTESİ</span></h1>
          </div>
          <button type="button" className="btn-premium" onClick={openCreate} aria-label="Departman oluştur">
            <Plus size={18} aria-hidden="true" /> Oluştur
          </button>
        </header>
        <div className="content-grid-wrapper" style={{ padding: '40px 60px' }}>
          {loading && list.length === 0 && <p style={{ color: 'var(--text-dim)' }}>Yükleniyor…</p>}
          {error && (
            <div role="alert" style={{ padding: 12, marginBottom: 16, background: 'rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: 8 }}>
              {error}
            </div>
          )}
          {!loading && list.length === 0 && !error && (
            <div role="status" style={{ padding: 32, textAlign: 'center', background: 'var(--panel)', borderRadius: 12, border: '1px dashed var(--border)', color: 'var(--text-dim)' }}>
              <p style={{ margin: 0 }}>Henüz departman yok. &quot;Oluştur&quot; ile ekleyin.</p>
            </div>
          )}
          {list.length > 0 && (
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border)' }}>
                <thead>
                  <tr style={{ background: 'var(--panel)' }}>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Ad</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Açıklama</th>
                    <th style={{ padding: 12, width: 100, borderBottom: '1px solid var(--border)' }} aria-label="İşlemler" />
                  </tr>
                </thead>
                <tbody>
                  {list.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: 12 }}>{row.name}</td>
                      <td style={{ padding: 12, color: 'var(--text-dim)' }}>{row.description || '—'}</td>
                      <td style={{ padding: 8, display: 'flex', gap: 4 }}>
                        <button type="button" aria-label="Düzenle" onClick={() => openEdit(row)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 6 }}><Pencil size={18} /></button>
                        <button type="button" aria-label="Sil" onClick={() => handleDelete(row.id, row.name)} disabled={deletingId === row.id} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: deletingId === row.id ? 'wait' : 'pointer', padding: 6 }}><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {modalOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="dept-modal-title" style={overlayStyle} onClick={() => setModalOpen(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 id="dept-modal-title" className="studio-title" style={{ margin: 0, fontSize: '1.1rem' }}>{editingId ? 'DEPARTMAN DÜZENLE' : 'DEPARTMAN OLUŞTUR'}</h2>
              <button type="button" aria-label="Kapat" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}>
                <X size={20} />
              </button>
            </div>
            {formError && (
              <div role="alert" style={{ padding: 10, marginBottom: 16, background: 'rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: 8, fontSize: '0.875rem' }}>{formError}</div>
            )}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="dept-name" style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', color: 'var(--text-dim)' }}>Departman adı *</label>
                <input
                  id="dept-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Örn. Üretim"
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'inherit' }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label htmlFor="dept-desc" style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', color: 'var(--text-dim)' }}>Açıklama (opsiyonel)</label>
                <input
                  id="dept-desc"
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Kısa açıklama"
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'inherit' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'inherit', cursor: 'pointer' }}>İptal</button>
                <button type="submit" className="btn-premium" disabled={submitLoading} style={{ padding: '10px 18px' }}>{submitLoading ? 'Kaydediliyor…' : 'Kaydet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
