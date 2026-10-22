-- ==============================================================================
-- PEIXE AVENTURA TOCANTINS - ESQUEMA DO BANCO DE DADOS SUPABASE (POSTGRESQL)
-- Localidade: Peixe - TO (Rio Tocantins / UHE Peixe Angical)
-- ==============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. Tabela: experiencias (Passeios, Pesca Esportiva e Acampamentos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.experiencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    titulo TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('pesca', 'passeio', 'camping')),
    tag_destaque TEXT,
    descricao TEXT NOT NULL,
    preco_base NUMERIC(10,2) NOT NULL,
    preco_unidade TEXT NOT NULL DEFAULT 'dia', -- 'dia', 'pessoa', 'noite'
    preco_detalhe TEXT,
    nota NUMERIC(2,1) DEFAULT 5.0,
    avaliacoes_count INT DEFAULT 0,
    imagem_url TEXT NOT NULL,
    caracteristicas JSONB DEFAULT '[]'::jsonb,
    ativo BOOLEAN DEFAULT true,
    ordem INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 3. Tabela: especies_peixes (Guia da Fauna Ictiológica do Rio Tocantins)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.especies_peixes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_popular TEXT NOT NULL,
    nome_cientifico TEXT NOT NULL,
    porte_info TEXT NOT NULL,
    habitat_dica TEXT,
    icone TEXT DEFAULT 'fa-fish',
    ordem INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 4. Tabela: condicoes_rio (Monitoramento em tempo real do Rio Tocantins)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.condicoes_rio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    temperatura_agua TEXT NOT NULL DEFAULT '28.0°C',
    nivel_status TEXT NOT NULL DEFAULT 'Estável (Ideal p/ Pesca)',
    clima TEXT NOT NULL DEFAULT 'Ensolarado (32°C)',
    transparencia TEXT DEFAULT 'Excelente (3 metros)',
    atualizado_em TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 5. Tabela: reservas (Agendamentos e Vouchers do Simulador)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reservas (
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
);

-- ------------------------------------------------------------------------------
-- 6. Habilitação de RLS (Row Level Security) e Políticas de Acesso
-- ------------------------------------------------------------------------------
ALTER TABLE public.experiencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.especies_peixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condicoes_rio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública (Visitantes do site podem consultar dados)
DROP POLICY IF EXISTS "Leitura pública de experiências" ON public.experiencias;
CREATE POLICY "Leitura pública de experiências" 
    ON public.experiencias FOR SELECT USING (ativo = true);

DROP POLICY IF EXISTS "Leitura pública de espécies" ON public.especies_peixes;
CREATE POLICY "Leitura pública de espécies" 
    ON public.especies_peixes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura pública de condições do rio" ON public.condicoes_rio;
CREATE POLICY "Leitura pública de condições do rio" 
    ON public.condicoes_rio FOR SELECT USING (true);

-- Política de Reservas: Qualquer visitante pode criar reservas e consultar seu voucher
DROP POLICY IF EXISTS "Inserção pública de reservas" ON public.reservas;
CREATE POLICY "Inserção pública de reservas" 
    ON public.reservas FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Leitura de voucher de reservas" ON public.reservas;
CREATE POLICY "Leitura de voucher de reservas" 
    ON public.reservas FOR SELECT USING (true);

-- ------------------------------------------------------------------------------
-- 7. Dados Iniciais de Seed (Carga Inicial)
-- ------------------------------------------------------------------------------

-- Inserir Experiências
INSERT INTO public.experiencias 
(slug, titulo, categoria, tag_destaque, descricao, preco_base, preco_unidade, preco_detalhe, nota, avaliacoes_count, imagem_url, caracteristicas, ordem)
VALUES
(
    'bass-boat-tucunare',
    'Expedição Bass Boat: Tucunaré Azul',
    'pesca',
    'Alta Performance',
    'Diária completa com guia de pesca nativo, motor elétrico de pedal, sonar de última geração e navegação pelos melhores pontos do Rio Tocantins e lago Angical.',
    1200.00,
    'dia',
    '/dia (até 2 pescadores)',
    4.9,
    84,
    'assets/images/pesca-esportiva-peixe-to.jpg',
    '["Barco Bass Boat 90HP c/ cadeiras giratórias", "Caixa térmica com gelo e água mineral", "Almoço ribeirinho no barranco incluso"]'::jsonb,
    1
),
(
    'praia-da-tartaruga',
    'Day Use na Ilha da Praia da Tartaruga',
    'passeio',
    'Família & Lazer',
    'Travessia em voadeira homologada para a praia mais famosa do Tocantins. Areias alvas, quiosques com água de coco, peixe frito na brasa e águas calmas para crianças.',
    80.00,
    'pessoa',
    '/pessoa',
    5.0,
    132,
    'assets/images/praia-tartaruga-acampamento.jpg',
    '["Travessia ida e volta com coletes homologados", "Guarda-sol de palha e cadeiras de praia", "Área com salva-vidas e banho seguro"]'::jsonb,
    2
),
(
    'camping-ilha-fluvial',
    'Pernoite Camping em Ilha Fluvial',
    'camping',
    'Ecoturismo',
    'Acampe sob o céu mais estrelado do Brasil em um banco de areia privado no meio do Rio Tocantins. Experiência de fogueira, churrasco ribeirinho e segurança total.',
    120.00,
    'noite',
    '/noite por pessoa',
    4.8,
    67,
    'assets/images/praia-tartaruga-acampamento.jpg',
    '["Traslado náutico exclusivo para a ilha", "Aluguel de barraca impermeável e isolante térmico", "Apoio de rádio e suporte do piloteiro"]'::jsonb,
    3
),
(
    'chalana-por-do-sol',
    'Passeio de Chalana ao Pôr do Sol',
    'passeio',
    'Romântico & Grupos',
    'Navegação contemplativa pelas ilhas do arquipélago fluvial de Peixe durante o entardecer tocantinense. Deck de madeira com música ambiente e degustação de petiscos.',
    150.00,
    'pessoa',
    '/pessoa',
    4.9,
    95,
    'assets/images/passeio-barco-por-do-sol.jpg',
    '["2h30 de navegação pelo canal principal", "Parada para banho refrescante no rio", "Petiscos e bebidas geladas a bordo"]'::jsonb,
    4
),
(
    'cachoeira-da-chupe',
    'Expedição Cachoeira da Chupé',
    'passeio',
    'Aventura & Trilha',
    'Trilha ecológica em meio à vegetação nativa do cerrado com chegada a piscinas naturais de águas esmeralda e quedas d''água revigorantes nas serras de Peixe.',
    160.00,
    'pessoa',
    '/pessoa',
    4.9,
    53,
    'assets/images/cachoeira-chupe-peixe.jpg',
    '["Guia condutor ambiental credenciado", "Banho em poços naturais de água pura", "Seguro aventura e lanche de trilha incluso"]'::jsonb,
    5
),
(
    'pesca-noturna-couro',
    'Pesca Noturna de Couro (Jaú & Surubim)',
    'pesca',
    'Pesca Pesada',
    'Aventura noturna nos poços profundos do Rio Tocantins em busca dos gigantes do fundo, acompanhado de piloteiros com décadas de tradição ribeirinha.',
    850.00,
    'noite',
    '/noite',
    4.8,
    41,
    'assets/images/cidade-peixe-orla-tocantins.jpg',
    '["Barco reforçado com holofotes subaquáticos", "Iscas vivas (tuviras e minhocuçu) inclusas", "Equipamento de suporte pesado a bordo"]'::jsonb,
    6
)
ON CONFLICT (slug) DO NOTHING;

-- Inserir Espécies de Peixes
INSERT INTO public.especies_peixes (nome_popular, nome_cientifico, porte_info, habitat_dica, icone, ordem)
VALUES
('Tucunaré Azul', 'Cichla piquiti', 'Até 65cm+ • Iscas de Superfície', 'Estruturas de paus e pedrais', 'fa-fish', 1),
('Jaú Gigante', 'Zungaro zungaro', 'Até 60kg+ • Poços Profundos', 'Fundo de corredeiras e poços', 'fa-shield-halved', 2),
('Surubim Pintado', 'Pseudoplatystoma corruscans', 'Corredeiras e Gargantas', 'Águas correntes e canais', 'fa-water', 3),
('Bicuda Real', 'Boulengerella cuvieri', 'Veloz • Saltos Acrobáticos', 'Remansos e superfícies', 'fa-bolt', 4),
('Apapá Amarelo', 'Pellona castelnaeana', 'Dourado do Tocantins • Fly', 'Superfície de canais abertos', 'fa-sun', 5)
ON CONFLICT DO NOTHING;

-- Inserir Condição Inicial do Rio
INSERT INTO public.condicoes_rio (temperatura_agua, nivel_status, clima, transparencia)
VALUES ('28.0°C', 'Estável (Ideal p/ Pesca)', 'Ensolarado (32°C)', 'Excelente (3 metros)')
ON CONFLICT DO NOTHING;
