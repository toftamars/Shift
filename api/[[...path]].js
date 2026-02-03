// Vercel Serverless: tüm /api/* istekleri Express uygulamasına gider
let app;
function getApp() {
  if (!app) app = require('../backend/dist/app').default;
  return app;
}

module.exports = (req, res) => {
  try {
    // Vercel catch-all'ta req.url bazen /v1/shift-types gelir; Express /api/v1 bekliyor
    const path = (req.url || req.originalUrl || '').split('?')[0];
    const query = (req.url || '').includes('?') ? '?' + (req.url || '').split('?')[1] : '';
    if (path && !path.startsWith('/api')) {
      req.url = '/api' + (path.startsWith('/') ? path : '/' + path) + query;
    }
    return getApp()(req, res);
  } catch (err) {
    console.error('API handler error:', err);
    res.status(500).json({ error: 'API başlatılamadı', detail: err.message });
  }
};
