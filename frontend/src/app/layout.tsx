import type { Metadata } from 'next';
import { Providers } from '@/lib/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shift Planlama - Modern Vardiya Yönetim Sistemi',
  description: 'AI destekli, modern vardiya planlama ve yönetim sistemi. Otomatik optimizasyon, çakışma kontrolü ve detaylı raporlama.',
  keywords: ['vardiya', 'planlama', 'shift', 'yönetim', 'AI', 'optimizasyon'],
  authors: [{ name: 'Zuhal' }],
  openGraph: {
    title: 'Shift Planlama - Modern Vardiya Yönetim Sistemi',
    description: 'AI destekli, modern vardiya planlama ve yönetim sistemi',
    type: 'website',
    url: 'https://shiftzuhal.vercel.app',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'auto' }}>
            <div className="grain-overlay" aria-hidden="true" />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
