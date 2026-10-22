/**
 * Endpoint Vercel Serverless: GET /api/config
 * Retorna as chaves públicas necessárias para inicialização do SDK Supabase no frontend
 */
const { sendJson } = require('./_utils');
const db = require('./_db');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  if (req.method !== 'GET') {
    return sendJson(res, 405, { ok: false, error: 'Método não permitido' });
  }

  return sendJson(res, 200, {
    supabase_url: db.SUPABASE_URL || null,
    supabase_anon_key: db.SUPABASE_ANON_KEY || null,
    configured: Boolean(db.SUPABASE_URL && db.SUPABASE_ANON_KEY)
  });
};
