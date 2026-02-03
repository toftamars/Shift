'use client';
import { Sidebar } from '@/components/Sidebar';

export function AyarlarPage() {
  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">İçeriğe atla</a>
      <Sidebar />
      <main id="main-content" className="main-stage" tabIndex={-1}>
        <header>
          <div>
            <div className="mono" style={{ marginBottom: '8px' }}>Ayarlar</div>
            <h1 className="studio-title">AYARLAR</h1>
          </div>
        </header>
        <div className="content-grid-wrapper" style={{ padding: '40px 60px' }}>
          <div style={{ maxWidth: 480 }}>
            <p style={{ color: 'var(--text-dim)', marginBottom: 24 }}>
              Vardiya Planlama uygulaması. Personel, vardiya türleri ve planlama ekranlarından yönetim yapabilirsiniz.
            </p>
            <p className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              data-rev: skills-v1
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
