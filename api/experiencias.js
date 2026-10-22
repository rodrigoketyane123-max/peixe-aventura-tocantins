/**
 * Endpoint Vercel Serverless: GET /api/experiencias e GET /api/experiencias/:slug
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
    const slug = req.query?.slug;
    const categoria = req.query?.categoria || 'all';

    if (slug) {
      const data = await db.getExperienciaBySlug(slug);
      return sendJson(res, 200, { ok: true, data });
    }

    const data = await db.getExperiencias(categoria);
    return sendJson(res, 200, { ok: true, data: data || [] });
  } catch (err) {
    console.error('[API Experiencias Error]', err.message);
    return sendJson(res, 200, { ok: false, data: [], error: err.message });
  }
};
