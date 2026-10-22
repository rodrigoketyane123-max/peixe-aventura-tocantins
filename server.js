/**
 * Peixe Aventura Tocantins – Servidor HTTP com API REST Integrada ao Supabase
 * Serve arquivos estáticos + endpoints /api/* que consomem o Supabase com segurança,
 * mantendo as credenciais no lado do servidor (nunca expostas ao browser diretamente).
 */
require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require('./js/supabase-config');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css':  'text/css; charset=UTF-8',
  '.js':   'text/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp'
};

const configHandler = require('./api/config');
const experienciasHandler = require('./api/experiencias');
const especiesHandler = require('./api/especies');
const rioHandler = require('./api/rio');
const reservasHandler = require('./api/reservas');
const indexApiHandler = require('./api/index');

// ============================================================
// ROTEADOR DE APIs (Compatível com Vercel Serverless Functions)
// ============================================================
async function handleApiRequest(req, res, urlPath) {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  req.query = Object.fromEntries(urlObj.searchParams.entries());

  try {
    if (urlPath === '/api/config') return await configHandler(req, res);
    if (urlPath === '/api/especies') return await especiesHandler(req, res);
    if (urlPath === '/api/rio') return await rioHandler(req, res);

    const expMatch = urlPath.match(/^\/api\/experiencias(?:\/(.+))?$/);
    if (expMatch) {
      if (expMatch[1]) req.query.slug = expMatch[1];
      return await experienciasHandler(req, res);
    }

    const resMatch = urlPath.match(/^\/api\/reservas(?:\/(.+))?$/);
    if (resMatch) {
      if (resMatch[1]) req.query.voucher = resMatch[1];
      return await reservasHandler(req, res);
    }

    if (urlPath === '/api' || urlPath === '/api/') {
      return await indexApiHandler(req, res);
    }

    res.writeHead(404, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify({ ok: false, error: 'Endpoint não encontrado' }));
  } catch (err) {
    console.error('[API Router Error]', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify({ ok: false, error: err.message }));
  }
}

// ============================================================
// SERVIDOR HTTP PRINCIPAL
// ============================================================
const server = http.createServer(async (req, res) => {
  const urlPath = decodeURI(req.url.split('?')[0]);

  // Rotear requisições da API
  if (urlPath.startsWith('/api/') || urlPath === '/api') {
    return handleApiRequest(req, res, urlPath);
  }

  // Servir arquivos estáticos (excluir node_modules e scripts do servidor)
  let filePath = path.join(__dirname, urlPath === '/' ? 'index.html' : urlPath);

  // Bloquear acesso direto a arquivos sensíveis
  const blocked = ['.env', '.env.example', 'server.js', 'package.json', 'package-lock.json'];
  const fileName = path.basename(filePath);
  if (blocked.includes(fileName) || filePath.includes('node_modules') || filePath.includes('scripts')) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Acesso negado');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
        return res.end('404 Not Found');
      }
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
      return res.end('500 Internal Server Error');
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  🎣 Peixe Aventura Tocantins – Servidor Iniciado      ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`\n  🌐 Site:       http://localhost:${PORT}`);
  console.log(`  📡 API Config: http://localhost:${PORT}/api/config`);
  console.log(`  🐟 API Dados:  http://localhost:${PORT}/api/experiencias`);
  console.log(`  🏞️ API Rio:    http://localhost:${PORT}/api/rio`);
  console.log(`\n  Supabase:     ${process.env.SUPABASE_URL}`);
  console.log('\n  Pressione Ctrl+C para encerrar\n');
});
