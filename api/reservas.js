/**
 * Endpoint Vercel Serverless: POST /api/reservas e GET /api/reservas/:voucher
 */
const { sendJson, parseBody } = require('./_utils');
const db = require('../js/supabase-config');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  // POST: Criação de nova reserva
  if (req.method === 'POST') {
    try {
      const payload = await parseBody(req);
      const data = await db.criarReserva(payload);
      return sendJson(res, 201, { ok: true, data });
    } catch (err) {
      console.error('[API Reservas POST Error]', err.message);
      return sendJson(res, 400, { ok: false, error: err.message });
    }
  }

  // GET: Consulta de reserva por voucher
  if (req.method === 'GET') {
    const voucher = req.query?.voucher;
    if (!voucher) {
      return sendJson(res, 400, { ok: false, error: 'Código de voucher não informado' });
    }

    try {
      const data = await db.getReservaByVoucher(voucher);
      if (!data) {
        return sendJson(res, 404, { ok: false, error: 'Voucher não encontrado' });
      }
      return sendJson(res, 200, { ok: true, data });
    } catch (err) {
      return sendJson(res, 404, { ok: false, error: err.message });
    }
  }

  return sendJson(res, 405, { ok: false, error: 'Método não permitido' });
};
