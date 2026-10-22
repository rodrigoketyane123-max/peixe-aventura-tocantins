/**
 * Endpoint Vercel Serverless: GET /api/especies
 */
const { sendJson } = require('./_utils');
const db = require('../js/supabase-config');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  if (req.method !== 'GET') {
    return sendJson(res, 405, { ok: false, error: 'Método não permitido' });
  }

  try {
    const data = await db.getEspeciesPeixes();
    return sendJson(res, 200, { ok: true, data: data || [] });
  } catch (err) {
    console.error('[API Especies Error]', err.message);
    return sendJson(res, 200, { ok: false, data: [], error: err.message });
  }
};
