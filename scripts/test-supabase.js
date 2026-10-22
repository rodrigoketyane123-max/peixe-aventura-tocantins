require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('--- Testando Conexão com Supabase ---');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 15) + '...' : 'NÃO DEFINIDA');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro: Variáveis SUPABASE_URL ou SUPABASE_ANON_KEY não encontradas no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Tentar listar tabelas ou testar a API REST
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    
    console.log('Status HTTP da API REST do Supabase:', response.status, response.statusText);
    
    // Testar tabelas do projeto
    const tabelas = [
      { nome: 'experiencias', label: 'Experiências e Passeios' },
      { nome: 'especies_peixes', label: 'Espécies de Peixes' },
      { nome: 'condicoes_rio', label: 'Condições do Rio Tocantins' },
      { nome: 'reservas', label: 'Reservas e Vouchers' }
    ];

    console.log('\n--- Verificação das Tabelas no Supabase ---');
    for (const item of tabelas) {
      const { data, count, error } = await supabase
        .from(item.nome)
        .select('*', { count: 'exact' });

      if (error) {
        console.log(`❌ Tabela "${item.nome}" (${item.label}): Erro - ${error.message}`);
      } else {
        console.log(`✅ Tabela "${item.nome}" (${item.label}): Conectada! (${data ? data.length : 0} registros)`);
      }
    }
  } catch (err) {
    console.error('Falha de conexão com o Supabase:', err.message);
  }
}

testConnection();
