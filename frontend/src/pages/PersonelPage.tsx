import { useEffect, useState } from 'react';
import { employeesApi } from '../services/api';
import { Sidebar } from '../components/Sidebar';

interface EmployeeRow {
  id: string;
  name: string;
  employee_code: string;
  department_id: string | null;
}

export function PersonelPage() {
  const [list, setList] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    employeesApi
      .list()
      .then((res) => {
        if (cancelled) return;
        const data = Array.isArray(res.data) ? res.data : [];
        setList(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.error ?? 'Liste yüklenemedi');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">İçeriğe atla</a>
      <Sidebar />
      <main id="main-content" className="main-stage" tabIndex={-1}>
        <header>
          <div>
            <div className="mono" style={{ marginBottom: '8px' }}>Personel</div>
            <h1 className="studio-title">ÇALIŞAN <span>LİSTESİ</span></h1>
          </div>
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
                1) Supabase Dashboard → Authentication → Users → kullanıcı ekle.
                <br />
                2) SQL Editor ile <code style={{ fontSize: '0.8em' }}>employees</code> tablosuna <code style={{ fontSize: '0.8em' }}>user_id</code> + sicil no ekle. Detay: <code style={{ fontSize: '0.8em' }}>docs/CALISAN_EKLEME.md</code>
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
                  </tr>
                </thead>
                <tbody>
                  {list.map((e) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: 12 }} className="mono">{e.employee_code}</td>
                      <td style={{ padding: 12 }}>{e.name || '—'}</td>
                      <td style={{ padding: 12 }}>{e.department_id ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
