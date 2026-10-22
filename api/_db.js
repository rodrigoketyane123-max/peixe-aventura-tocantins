/**
 * Peixe Aventura Tocantins – Cliente e Helpers do Supabase para Serverless Functions
 * Centralizado dentro de /api para auto-contenção e compatibilidade 100% com Vercel
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || '').trim();

let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });
  } catch (err) {
    console.warn('[Supabase DB] Erro ao instanciar cliente:', err.message);
  }
} else {
  console.warn('[Supabase DB] SUPABASE_URL ou SUPABASE_ANON_KEY não encontradas no ambiente.');
}

// ============================================================
// HELPERS DE DADOS
// ============================================================

/** Lista todas as experiências ativas, ordenadas pelo campo "ordem" */
async function getExperiencias(categoria = null) {
  if (!supabase) throw new Error('Supabase não conectado. Configure SUPABASE_URL e SUPABASE_ANON_KEY nas variáveis de ambiente.');
  let query = supabase
    .from('experiencias')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true });

  if (categoria && categoria !== 'all') {
    query = query.eq('categoria', categoria);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/** Busca uma experiência pelo slug */
async function getExperienciaBySlug(slug) {
  if (!supabase) throw new Error('Supabase não conectado. Configure SUPABASE_URL e SUPABASE_ANON_KEY nas variáveis de ambiente.');
  const { data, error } = await supabase
    .from('experiencias')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data;
}

/** Lista espécies de peixes, ordenadas */
async function getEspeciesPeixes() {
  if (!supabase) throw new Error('Supabase não conectado. Configure SUPABASE_URL e SUPABASE_ANON_KEY nas variáveis de ambiente.');
  const { data, error } = await supabase
    .from('especies_peixes')
    .select('*')
    .order('ordem', { ascending: true });
  if (error) throw error;
  return data;
}

/** Busca o registro mais recente das condições do Rio Tocantins */
async function getCondicoesRio() {
  if (!supabase) throw new Error('Supabase não conectado. Configure SUPABASE_URL e SUPABASE_ANON_KEY nas variáveis de ambiente.');
  const { data, error } = await supabase
    .from('condicoes_rio')
    .select('*')
    .order('atualizado_em', { ascending: false })
    .limit(1)
    .single();
  if (error) throw error;
  return data;
}

/** Cria uma nova reserva no banco */
async function criarReserva(reservaData) {
  if (!supabase) throw new Error('Supabase não conectado. Configure SUPABASE_URL e SUPABASE_ANON_KEY nas variáveis de ambiente.');
  const codigoVoucher = 'PAT-' + Date.now().toString(36).toUpperCase();

  const payload = {
    codigo_voucher: codigoVoucher,
    servico_chave: reservaData.servicoChave,
    servico_nome: reservaData.servicoNome,
    data_prevista: reservaData.data || null,
    quantidade_dias: reservaData.dias,
    quantidade_pessoas: reservaData.pessoas,
    adicionais: reservaData.adicionais || {},
    valor_adicionais: reservaData.valorAdicionais || 0,
    valor_total: reservaData.total,
    valor_sinal: reservaData.sinal,
    cliente_nome: reservaData.clienteNome || null,
    cliente_whatsapp: reservaData.clienteWhatsapp || null,
    status: 'aguardando_confirmacao'
  };

  const { data, error } = await supabase
    .from('reservas')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Busca uma reserva pelo código do voucher */
async function getReservaByVoucher(codigoVoucher) {
  if (!supabase) throw new Error('Supabase não conectado. Configure SUPABASE_URL e SUPABASE_ANON_KEY nas variáveis de ambiente.');
  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .eq('codigo_voucher', codigoVoucher)
    .single();
  if (error) throw error;
  return data;
}

module.exports = {
  supabase,
  getExperiencias,
  getExperienciaBySlug,
  getEspeciesPeixes,
  getCondicoesRio,
  criarReserva,
  getReservaByVoucher,
  SUPABASE_URL: supabaseUrl,
  SUPABASE_ANON_KEY: supabaseAnonKey
};
