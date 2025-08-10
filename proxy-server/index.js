const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(cors({  origin: '*'}))
app.use(express.urlencoded({ extended: true }));

// Comprehensive CORS handling
app.use((req, res, next) => {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:1420');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key, X-Signature, X-Timestamp');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Proxy middleware
const proxy = createProxyMiddleware({
  target: 'https://api.backpack.exchange',
  changeOrigin: true,
  secure: true,
  pathRewrite: { '^/backpack-api': '' },
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    // Log the request for debugging
    console.log(`Proxying ${req.method} ${req.url} to ${proxyReq.path}`);
    
    // Handle request body for POST/PUT requests
    if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // Ensure CORS headers are set on the response
    proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:1420';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key, X-Signature, X-Timestamp';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    
    console.log(`Received response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
});

// Apply proxy to /api routes
app.use('/', proxy);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Proxy server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Check if SSL certificates exist
const sslKeyPath = path.join(__dirname, 'ssl', 'key.pem');
const sslCertPath = path.join(__dirname, 'ssl', 'cert.pem');

const hasSSLCertificates = fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath);

if (hasSSLCertificates) {
  // SSL certificate options
  const sslOptions = {
    key: fs.readFileSync(sslKeyPath),
    cert: fs.readFileSync(sslCertPath)
  };

  // Create HTTPS server
  const httpsServer = https.createServer(sslOptions, app);

  // Start HTTPS server
  httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTPS Proxy server running on https://localhost:${HTTPS_PORT}`);
    console.log('CORS enabled for http://localhost:1420');
  });
} else {
  console.log('SSL certificates not found. Running HTTP only.');
  console.log('Run "npm run generate-ssl" to create self-signed certificates for HTTPS.');
}

// Start HTTP server (always available)
const http = require('http');
const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
  console.log(`HTTP Proxy server running on http://localhost:${PORT}`);
  console.log('CORS enabled for http://localhost:1420');
});