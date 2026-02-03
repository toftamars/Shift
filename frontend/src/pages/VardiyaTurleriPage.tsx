import React, { useEffect, useState } from 'react';
import { shiftTypesApi } from '../services/api';
import { Sidebar } from '../components/Sidebar';

interface ShiftTypeRow {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  color_code: string | null;
}

export function VardiyaTurleriPage() {
  const [list, setList] = useState<ShiftTypeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    shiftTypesApi
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

  const timeStr = (t: string) => (typeof t === 'string' ? t.slice(0, 5) : '—');

  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">İçeriğe atla</a>
      <Sidebar />
      <main id="main-content" className="main-stage" tabIndex={-1}>
        <header>
          <div>
            <div className="mono" style={{ marginBottom: '8px' }}>Vardiya Türleri</div>
            <h1 className="studio-title">VARDİYA <span>TÜRLERİ</span></h1>
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
            <p style={{ color: 'var(--text-dim)' }}>Henüz vardiya türü tanımlı değil.</p>
          )}
          {list.length > 0 && (
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border)' }}>
                <thead>
                  <tr style={{ background: 'var(--panel)' }}>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Ad</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Başlangıç</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Bitiş</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Renk</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: 12 }}>{row.name}</td>
                      <td style={{ padding: 12 }} className="mono">{timeStr(row.start_time)}</td>
                      <td style={{ padding: 12 }} className="mono">{timeStr(row.end_time)}</td>
                      <td style={{ padding: 12 }}>
                        {row.color_code ? (
                          <span style={{ display: 'inline-block', width: 24, height: 24, borderRadius: 4, background: row.color_code }} title={row.color_code} />
                        ) : '—'}
                      </td>
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
