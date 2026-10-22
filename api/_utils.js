/**
 * Utilitários compartilhados para Serverless Functions da Vercel e Servidor Local Node.js
 */

function sendJson(res, statusCode, data) {
  res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }

  res.writeHead(statusCode);
  return res.end(JSON.stringify(data));
}

async function parseBody(req) {
  if (req.body) {
    if (typeof req.body === 'string') {
      try { return JSON.parse(req.body); } catch (_) { return {}; }
    }
    return req.body;
  }

  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Corpo da requisição JSON inválido'));
      }
    });
    req.on('error', err => reject(err));
  });
}

module.exports = {
  sendJson,
  parseBody
};
