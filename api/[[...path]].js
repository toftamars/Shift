// Vercel Serverless: tüm /api/* istekleri Express uygulamasına gider
let app;
function getApp() {
  if (!app) app = require('../backend/dist/app').default;
  return app;
}
module.exports = (req, res) => getApp()(req, res);
