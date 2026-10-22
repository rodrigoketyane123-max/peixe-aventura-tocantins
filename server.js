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

// ============================================================
// ROTEADOR DE APIs
// ============================================================
async function handleApiRequest(req, res, urlPath) {
  res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // GET /api/config → retorna URL e anon_key para o Supabase JS do browser
    if (urlPath === '/api/config' && req.method === 'GET') {
      res.writeHead(200);
      return res.end(JSON.stringify({
        supabase_url: db.SUPABASE_URL,
        supabase_anon_key: db.SUPABASE_ANON_KEY
      }));
    }

    // GET /api/experiencias?categoria=pesca|passeio|camping|all
    if (urlPath === '/api/experiencias' && req.method === 'GET') {
      const params = new URL(`http://localhost${req.url}`).searchParams;
      const categoria = params.get('categoria') || 'all';
      try {
        const data = await db.getExperiencias(categoria);
        res.writeHead(200);
        return res.end(JSON.stringify({ ok: true, data: data || [] }));
      } catch (e) {
        res.writeHead(200);
        return res.end(JSON.stringify({ ok: false, data: [], error: e.message }));
      }
    }

    // GET /api/experiencias/:slug
    const slugMatch = urlPath.match(/^\/api\/experiencias\/(.+)$/);
    if (slugMatch && req.method === 'GET') {
      try {
        const data = await db.getExperienciaBySlug(slugMatch[1]);
        res.writeHead(200);
        return res.end(JSON.stringify({ ok: true, data }));
      } catch (e) {
        res.writeHead(200);
        return res.end(JSON.stringify({ ok: false, data: null, error: e.message }));
      }
    }

    // GET /api/especies
    if (urlPath === '/api/especies' && req.method === 'GET') {
      try {
        const data = await db.getEspeciesPeixes();
        res.writeHead(200);
        return res.end(JSON.stringify({ ok: true, data: data || [] }));
      } catch (e) {
        res.writeHead(200);
        return res.end(JSON.stringify({ ok: false, data: [], error: e.message }));
      }
    }

    // GET /api/rio
    if (urlPath === '/api/rio' && req.method === 'GET') {
      try {
        const data = await db.getCondicoesRio();
        res.writeHead(200);
        return res.end(JSON.stringify({ ok: true, data }));
      } catch (e) {
        res.writeHead(200);
        return res.end(JSON.stringify({ ok: false, data: null, error: e.message }));
      }
    }

    // POST /api/reservas
    if (urlPath === '/api/reservas' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', async () => {
        try {
          const reservaData = JSON.parse(body);
          const data = await db.criarReserva(reservaData);
          res.writeHead(201);
          return res.end(JSON.stringify({ ok: true, data }));
        } catch (err) {
          res.writeHead(400);
          return res.end(JSON.stringify({ ok: false, error: err.message }));
        }
      });
      return;
    }

    // GET /api/reservas/:voucher
    const voucherMatch = urlPath.match(/^\/api\/reservas\/(.+)$/);
    if (voucherMatch && req.method === 'GET') {
      const data = await db.getReservaByVoucher(voucherMatch[1]);
      res.writeHead(200);
      return res.end(JSON.stringify({ ok: true, data }));
    }

    // Rota não encontrada
    res.writeHead(404);
    return res.end(JSON.stringify({ ok: false, error: 'Endpoint não encontrado' }));

  } catch (err) {
    console.error('[API Error]', err.message);
    res.writeHead(500);
    return res.end(JSON.stringify({ ok: false, error: err.message }));
  }
}

// ============================================================
// SERVIDOR HTTP PRINCIPAL
// ============================================================
const server = http.createServer(async (req, res) => {
  const urlPath = decodeURI(req.url.split('?')[0]);

  // Rotear requisições da API
  if (urlPath.startsWith('/api/')) {
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
