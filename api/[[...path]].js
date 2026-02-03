// Vercel Serverless: tüm /api/* istekleri Express uygulamasına gider
let app;
function getApp() {
  if (!app) app = require('../backend/dist/app').default;
  return app;
}

module.exports = (req, res) => {
  // Vercel bazen path'i /api olmadan veriyor; Express /api/v1 bekliyor
  const path = (req.url || '').split('?')[0];
  if (path && !path.startsWith('/api')) {
    req.url = '/api' + (path.startsWith('/') ? path : '/' + path) + (req.url?.includes('?') ? '?' + req.url.split('?')[1] : '');
  }
  return getApp()(req, res);
};
