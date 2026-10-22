/**
 * Endpoint Vercel Serverless: GET /api (Health Check e Catálogo de Rotas)
 */
const { sendJson } = require('./_utils');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  return sendJson(res, 200, {
    status: 'online',
    app: 'Peixe Aventura Tocantins API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      { path: '/api/config', method: 'GET', description: 'Credenciais públicas do Supabase' },
      { path: '/api/experiencias', method: 'GET', description: 'Listagem de passeios e pesca esportiva' },
      { path: '/api/experiencias/:slug', method: 'GET', description: 'Detalhes de uma experiência específica' },
      { path: '/api/especies', method: 'GET', description: 'Catálogo de peixes do Rio Tocantins' },
      { path: '/api/rio', method: 'GET', description: 'Condições do Rio Tocantins (temperatura, nível, clima)' },
      { path: '/api/reservas', method: 'POST', description: 'Criar reserva e emitir voucher' },
      { path: '/api/reservas/:voucher', method: 'GET', description: 'Consultar status do voucher' }
    ]
  });
};
