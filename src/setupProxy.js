// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.quran.com/api/v4',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
    })
  );
};