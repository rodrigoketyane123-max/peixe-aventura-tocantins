/**
 * Aplica o esquema SQL no Supabase usando a API de Management.
 * Execute via: node scripts/apply-schema.js
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[ERRO] Variáveis SUPABASE_URL ou SUPABASE_ANON_KEY não encontradas no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================
// SQL inline para criação do schema e seed de dados
// ============================================================
const SQL_STATEMENTS = [
  // 1. Tabela experiencias
  `CREATE TABLE IF NOT EXISTS public.experiencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    titulo TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('pesca', 'passeio', 'camping')),
    tag_destaque TEXT,
    descricao TEXT NOT NULL,
    preco_base NUMERIC(10,2) NOT NULL,
    preco_unidade TEXT NOT NULL DEFAULT 'dia',
    preco_detalhe TEXT,
    nota NUMERIC(2,1) DEFAULT 5.0,
    avaliacoes_count INT DEFAULT 0,
    imagem_url TEXT NOT NULL,
    caracteristicas JSONB DEFAULT '[]'::jsonb,
    ativo BOOLEAN DEFAULT true,
    ordem INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
  )`,

  // 2. Tabela especies_peixes
  `CREATE TABLE IF NOT EXISTS public.especies_peixes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_popular TEXT NOT NULL,
    nome_cientifico TEXT NOT NULL,
    porte_info TEXT NOT NULL,
    habitat_dica TEXT,
    icone TEXT DEFAULT 'fa-fish',
    ordem INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
  )`,

  // 3. Tabela condicoes_rio
  `CREATE TABLE IF NOT EXISTS public.condicoes_rio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    temperatura_agua TEXT NOT NULL DEFAULT '28.0°C',
    nivel_status TEXT NOT NULL DEFAULT 'Estável (Ideal p/ Pesca)',
    clima TEXT NOT NULL DEFAULT 'Ensolarado (32°C)',
    transparencia TEXT DEFAULT 'Excelente (3 metros)',
    atualizado_em TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
  )`,

  // 4. Tabela reservas
  `CREATE TABLE IF NOT EXISTS public.reservas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_voucher TEXT UNIQUE NOT NULL,
    servico_chave TEXT NOT NULL,
    servico_nome TEXT NOT NULL,
    data_prevista DATE,
    quantidade_dias INT NOT NULL DEFAULT 1,
    quantidade_pessoas INT NOT NULL DEFAULT 1,
    adicionais JSONB DEFAULT '{}'::jsonb,
    valor_adicionais NUMERIC(10,2) DEFAULT 0,
    valor_total NUMERIC(10,2) NOT NULL,
    valor_sinal NUMERIC(10,2) NOT NULL,
    cliente_nome TEXT,
    cliente_whatsapp TEXT,
    status TEXT DEFAULT 'aguardando_confirmacao' CHECK (status IN ('aguardando_confirmacao', 'confirmado', 'cancelado')),
    created_at TIMESTAMPTZ DEFAULT now()
  )`,

  // 5. RLS experiencias
  `ALTER TABLE public.experiencias ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename='experiencias' AND policyname='Leitura pública de experiências'
    ) THEN
      CREATE POLICY "Leitura pública de experiências" ON public.experiencias FOR SELECT USING (ativo = true);
    END IF;
  END $$`,

  // 6. RLS especies_peixes
  `ALTER TABLE public.especies_peixes ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename='especies_peixes' AND policyname='Leitura pública de espécies'
    ) THEN
      CREATE POLICY "Leitura pública de espécies" ON public.especies_peixes FOR SELECT USING (true);
    END IF;
  END $$`,

  // 7. RLS condicoes_rio
  `ALTER TABLE public.condicoes_rio ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename='condicoes_rio' AND policyname='Leitura pública de condições do rio'
    ) THEN
      CREATE POLICY "Leitura pública de condições do rio" ON public.condicoes_rio FOR SELECT USING (true);
    END IF;
  END $$`,

  // 8. RLS reservas
  `ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename='reservas' AND policyname='Inserção pública de reservas'
    ) THEN
      CREATE POLICY "Inserção pública de reservas" ON public.reservas FOR INSERT WITH CHECK (true);
    END IF;
  END $$`,
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename='reservas' AND policyname='Leitura de voucher de reservas'
    ) THEN
      CREATE POLICY "Leitura de voucher de reservas" ON public.reservas FOR SELECT USING (true);
    END IF;
  END $$`,
];

// Seed de dados iniciais
const SEED_EXPERIENCIAS = [
  {
    slug: 'bass-boat-tucunare',
    titulo: 'Expedição Bass Boat: Tucunaré Azul',
    categoria: 'pesca',
    tag_destaque: 'Alta Performance',
    descricao: 'Diária completa com guia de pesca nativo, motor elétrico de pedal, sonar de última geração e navegação pelos melhores pontos do Rio Tocantins e lago Angical.',
    preco_base: 1200.00,
    preco_unidade: 'dia',
    preco_detalhe: '/dia (até 2 pescadores)',
    nota: 4.9,
    avaliacoes_count: 84,
    imagem_url: 'assets/images/pesca-esportiva-peixe-to.jpg',
    caracteristicas: ['Barco Bass Boat 90HP c/ cadeiras giratórias', 'Caixa térmica com gelo e água mineral', 'Almoço ribeirinho no barranco incluso'],
    ordem: 1
  },
  {
    slug: 'praia-da-tartaruga',
    titulo: 'Day Use na Ilha da Praia da Tartaruga',
    categoria: 'passeio',
    tag_destaque: 'Família & Lazer',
    descricao: 'Travessia em voadeira homologada para a praia mais famosa do Tocantins. Areias alvas, quiosques com água de coco, peixe frito na brasa e águas calmas para crianças.',
    preco_base: 80.00,
    preco_unidade: 'pessoa',
    preco_detalhe: '/pessoa',
    nota: 5.0,
    avaliacoes_count: 132,
    imagem_url: 'assets/images/praia-tartaruga-acampamento.jpg',
    caracteristicas: ['Travessia ida e volta com coletes homologados', 'Guarda-sol de palha e cadeiras de praia', 'Área com salva-vidas e banho seguro'],
    ordem: 2
  },
  {
    slug: 'camping-ilha-fluvial',
    titulo: 'Pernoite Camping em Ilha Fluvial',
    categoria: 'camping',
    tag_destaque: 'Ecoturismo',
    descricao: 'Acampe sob o céu mais estrelado do Brasil em um banco de areia privado no meio do Rio Tocantins. Experiência de fogueira, churrasco ribeirinho e segurança total.',
    preco_base: 120.00,
    preco_unidade: 'noite',
    preco_detalhe: '/noite por pessoa',
    nota: 4.8,
    avaliacoes_count: 67,
    imagem_url: 'assets/images/praia-tartaruga-acampamento.jpg',
    caracteristicas: ['Traslado náutico exclusivo para a ilha', 'Aluguel de barraca impermeável e isolante térmico', 'Apoio de rádio e suporte do piloteiro'],
    ordem: 3
  },
  {
    slug: 'chalana-por-do-sol',
    titulo: 'Passeio de Chalana ao Pôr do Sol',
    categoria: 'passeio',
    tag_destaque: 'Romântico & Grupos',
    descricao: 'Navegação contemplativa pelas ilhas do arquipélago fluvial de Peixe durante o entardecer tocantinense. Deck de madeira com música ambiente e degustação de petiscos.',
    preco_base: 150.00,
    preco_unidade: 'pessoa',
    preco_detalhe: '/pessoa',
    nota: 4.9,
    avaliacoes_count: 95,
    imagem_url: 'assets/images/passeio-barco-por-do-sol.jpg',
    caracteristicas: ['2h30 de navegação pelo canal principal', 'Parada para banho refrescante no rio', 'Petiscos e bebidas geladas a bordo'],
    ordem: 4
  },
  {
    slug: 'cachoeira-da-chupe',
    titulo: 'Expedição Cachoeira da Chupé',
    categoria: 'passeio',
    tag_destaque: 'Aventura & Trilha',
    descricao: "Trilha ecológica em meio à vegetação nativa do cerrado com chegada a piscinas naturais de águas esmeralda e quedas d'água revigorantes nas serras de Peixe.",
    preco_base: 160.00,
    preco_unidade: 'pessoa',
    preco_detalhe: '/pessoa',
    nota: 4.9,
    avaliacoes_count: 53,
    imagem_url: 'assets/images/cachoeira-chupe-peixe.jpg',
    caracteristicas: ['Guia condutor ambiental credenciado', 'Banho em poços naturais de água pura', 'Seguro aventura e lanche de trilha incluso'],
    ordem: 5
  },
  {
    slug: 'pesca-noturna-couro',
    titulo: 'Pesca Noturna de Couro (Jaú & Surubim)',
    categoria: 'pesca',
    tag_destaque: 'Pesca Pesada',
    descricao: 'Aventura noturna nos poços profundos do Rio Tocantins em busca dos gigantes do fundo, acompanhado de piloteiros com décadas de tradição ribeirinha.',
    preco_base: 850.00,
    preco_unidade: 'noite',
    preco_detalhe: '/noite',
    nota: 4.8,
    avaliacoes_count: 41,
    imagem_url: 'assets/images/cidade-peixe-orla-tocantins.jpg',
    caracteristicas: ['Barco reforçado com holofotes subaquáticos', 'Iscas vivas (tuviras e minhocuçu) inclusas', 'Equipamento de suporte pesado a bordo'],
    ordem: 6
  }
];

const SEED_ESPECIES = [
  { nome_popular: 'Tucunaré Azul', nome_cientifico: 'Cichla piquiti', porte_info: 'Até 65cm+ • Iscas de Superfície', habitat_dica: 'Estruturas de paus e pedrais', imagem_url: 'assets/images/peixe-tucunare-azul.jpg', icone: 'fa-fish', ordem: 1 },
  { nome_popular: 'Jaú Gigante', nome_cientifico: 'Zungaro zungaro', porte_info: 'Até 60kg+ • Poços Profundos', habitat_dica: 'Fundo de corredeiras e poços', imagem_url: 'assets/images/peixe-jau-gigante.jpg', icone: 'fa-shield-halved', ordem: 2 },
  { nome_popular: 'Surubim Pintado', nome_cientifico: 'Pseudoplatystoma corruscans', porte_info: 'Corredeiras e Gargantas', habitat_dica: 'Águas correntes e canais', imagem_url: 'assets/images/peixe-surubim-pintado.jpg', icone: 'fa-water', ordem: 3 },
  { nome_popular: 'Bicuda Real', nome_cientifico: 'Boulengerella cuvieri', porte_info: 'Veloz • Saltos Acrobáticos', habitat_dica: 'Remansos e superfícies', imagem_url: 'assets/images/peixe-bicuda-real.jpg', icone: 'fa-bolt', ordem: 4 },
  { nome_popular: 'Apapá Amarelo', nome_cientifico: 'Pellona castelnaeana', porte_info: 'Dourado do Tocantins • Fly', habitat_dica: 'Superfície de canais abertos', imagem_url: 'assets/images/peixe-apapa-amarelo.jpg', icone: 'fa-sun', ordem: 5 }
];

async function executeSql(sql, description) {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_text: sql });
    if (error) throw error;
    console.log(`  ✅ ${description}`);
    return true;
  } catch (err) {
    // Tentar via API REST /rest/v1/rpc
    console.log(`  ⚠️  RPC não disponível para: ${description}`);
    return false;
  }
}

async function applySchema() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  Peixe Aventura – Configuração do Banco Supabase     ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // Verificar se as tabelas já existem tentando consultar
  console.log('🔍 Verificando estado atual das tabelas...');

  const tables = ['experiencias', 'especies_peixes', 'condicoes_rio', 'reservas'];
  const tableStatus = {};

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error && (error.code === 'PGRST205' || error.message.includes('does not exist') || error.message.includes('schema cache'))) {
      tableStatus[table] = 'missing';
      console.log(`  ❌ Tabela "${table}" NÃO encontrada – precisa ser criada`);
    } else if (error) {
      tableStatus[table] = 'error';
      console.log(`  ⚠️  Tabela "${table}" – erro: ${error.message}`);
    } else {
      tableStatus[table] = 'exists';
      console.log(`  ✅ Tabela "${table}" já existe (${data ? data.length : 0} registro(s) verificado(s))`);
    }
  }

  const allExist = Object.values(tableStatus).every(s => s === 'exists');

  if (!allExist) {
    console.log('\n⚠️  AÇÃO NECESSÁRIA: Algumas tabelas não existem no Supabase.');
    console.log('\nPara criar as tabelas, siga um dos caminhos abaixo:');
    console.log('\n🔵 OPÇÃO 1 – SQL Editor do Supabase Dashboard (RECOMENDADO):');
    console.log('   1. Acesse https://supabase.com/dashboard/project/lufbtkrrhutoikfsbgnl/sql/new');
    console.log('   2. Abra o arquivo "supabase_schema.sql" neste projeto');
    console.log('   3. Cole o conteúdo no editor SQL e clique em "Run"');
    console.log('\n📋 O arquivo supabase_schema.sql está pronto em: ./supabase_schema.sql\n');
  }

  // Mesmo sem as tabelas criadas via SQL direto, tentar inserir seed via REST API
  console.log('\n📦 Tentando inserir dados via API REST do Supabase...\n');

  // Seed Experiências
  const { data: expData, error: expError } = await supabase
    .from('experiencias')
    .upsert(SEED_EXPERIENCIAS, { onConflict: 'slug', ignoreDuplicates: true });

  if (expError) {
    if (expError.code === 'PGRST205' || expError.message.includes('does not exist') || expError.message.includes('schema cache')) {
      console.log('  ❌ Tabela "experiencias" não existe ainda – crie via SQL Editor primeiro');
    } else {
      console.log(`  ❌ Erro ao inserir experiências: ${expError.message}`);
    }
  } else {
    console.log('  ✅ Experiências inseridas/atualizadas com sucesso!');
  }

  // Seed Espécies
  const { data: espData, error: espError } = await supabase
    .from('especies_peixes')
    .upsert(SEED_ESPECIES, { onConflict: 'id', ignoreDuplicates: false });

  if (espError) {
    if (espError.code === 'PGRST205' || espError.message.includes('does not exist') || espError.message.includes('schema cache')) {
      console.log('  ❌ Tabela "especies_peixes" não existe ainda – crie via SQL Editor primeiro');
    } else {
      console.log(`  ❌ Erro ao inserir espécies: ${espError.message}`);
    }
  } else {
    console.log('  ✅ Espécies de peixes inseridas/atualizadas com sucesso!');
  }

  // Seed Condições do Rio
  const { error: rioError } = await supabase
    .from('condicoes_rio')
    .upsert({
      temperatura_agua: '28.0°C',
      nivel_status: 'Estável (Ideal p/ Pesca)',
      clima: 'Ensolarado (32°C)',
      transparencia: 'Excelente (3 metros)'
    }, { ignoreDuplicates: false });

  if (rioError) {
    if (rioError.code === 'PGRST205' || rioError.message.includes('does not exist') || rioError.message.includes('schema cache')) {
      console.log('  ❌ Tabela "condicoes_rio" não existe ainda – crie via SQL Editor primeiro');
    } else {
      console.log(`  ❌ Erro ao inserir condições do rio: ${rioError.message}`);
    }
  } else {
    console.log('  ✅ Condições do rio inseridas/atualizadas com sucesso!');
  }

  console.log('\n══════════════════════════════════════════════════════\n');
}

applySchema().catch(console.error);
