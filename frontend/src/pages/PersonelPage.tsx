import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { employeesApi, getErrorMessage } from '../services/api';
import { Sidebar } from '../components/Sidebar';
import { AddEmployeeModal } from '../components/AddEmployeeModal';

interface EmployeeRow {
  id: string;
  name: string;
  employee_code: string;
  department_id: string | null;
  department_name?: string | null;
}

export function PersonelPage() {
  const [list, setList] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchList = () => {
    setLoading(true);
    setError(null);
    employeesApi
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

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`"${name}" kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;
    setDeletingId(id);
    employeesApi
      .delete(id)
      .then(() => fetchList())
      .catch((err) => setError(getErrorMessage(err, 'Personel silinemedi')))
      .finally(() => setDeletingId(null));
  };

  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">İçeriğe atla</a>
      <Sidebar />
      <main id="main-content" className="main-stage" tabIndex={-1}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="mono" style={{ marginBottom: '8px' }}>Personel</div>
            <h1 className="studio-title">ÇALIŞAN <span>LİSTESİ</span></h1>
          </div>
          <button type="button" className="btn-premium" onClick={() => setAddModalOpen(true)} aria-label="Çalışan ekle">
            <Plus size={18} aria-hidden="true" /> Ekle
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
            <div
              role="status"
              style={{
                padding: 32,
                textAlign: 'center',
                background: 'var(--panel)',
                borderRadius: 12,
                border: '1px dashed var(--border)',
                color: 'var(--text-dim)',
              }}
            >
              <p style={{ margin: 0, fontSize: '1rem' }}>Henüz personel kaydı yok.</p>
              <p style={{ margin: '8px 0 0', fontSize: '0.875rem', opacity: 0.8 }}>
                &quot;Ekle&quot; ile doğrudan sayfadan çalışan ekleyebilirsiniz.
              </p>
            </div>
          )}
          {list.length > 0 && (
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border)' }}>
                <thead>
                  <tr style={{ background: 'var(--panel)' }}>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Sicil</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Ad Soyad</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Departman</th>
                    <th style={{ padding: 12, width: 56, borderBottom: '1px solid var(--border)' }} aria-label="İşlemler" />
                  </tr>
                </thead>
                <tbody>
                  {list.map((e) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: 12 }} className="mono">{e.employee_code}</td>
                      <td style={{ padding: 12 }}>{e.name || '—'}</td>
                      <td style={{ padding: 12 }}>{e.department_name ?? e.department_id ?? '—'}</td>
                      <td style={{ padding: 8 }}>
                        <button
                          type="button"
                          aria-label={`${e.name || e.employee_code} kaydını sil`}
                          onClick={() => handleDelete(e.id, e.name || e.employee_code)}
                          disabled={deletingId === e.id}
                          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: deletingId === e.id ? 'wait' : 'pointer', padding: 6 }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <AddEmployeeModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSuccess={fetchList} />
    </div>
  );
}
