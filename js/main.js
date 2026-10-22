/**
 * Peixe Aventura Tocantins – Cliente de API para o Browser
 * Consome os endpoints /api/* do servidor local, que por sua vez
 * se comunicam com o Supabase de forma segura (credenciais no servidor).
 *
 * Também integra o Supabase JS SDK diretamente via CDN para operações
 * de leitura em tempo real (realtime) e para o simulador de reservas.
 */

const API_BASE = window.location.origin; // http://localhost:3000

// ── Utilitário de fetch com tratamento de erro ─────────────────────────────
async function apiFetch(endpoint) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Falha em ${endpoint}:`, err.message);
    return null;
  }
}

// ── Estado global da aplicação ─────────────────────────────────────────────
const AppState = {
  experiencias: [],
  especies: [],
  condicoesRio: null,
  supabase: null,
  initialized: false
};

// ── Inicialização Supabase JS via CDN (para Realtime e Reservas) ──────────
async function initSupabase() {
  try {
    const resp = await apiFetch('/api/config');
    if (!resp) return null;

    // O Supabase JS está carregado via CDN no index.html
    if (typeof window.supabase === 'undefined') {
      console.warn('[Supabase] SDK não encontrado. Realtime desativado.');
      return null;
    }

    const client = window.supabase.createClient(resp.supabase_url, resp.supabase_anon_key, {
      auth: { persistSession: false }
    });

    AppState.supabase = client;
    return client;
  } catch (err) {
    console.warn('[Supabase] Erro ao inicializar cliente:', err.message);
    return null;
  }
}

// ===========================================================================
// DADOS ESTÁTICOS DE FALLBACK (usados quando o Supabase não está configurado)
// ===========================================================================
const FALLBACK_EXPERIENCIAS = [
  {
    slug: 'bass-boat-tucunare',
    titulo: 'Expedição Bass Boat: Tucunaré Azul',
    categoria: 'pesca',
    tag_destaque: 'Alta Performance',
    descricao: 'Diária completa com guia de pesca nativo, motor elétrico de pedal, sonar de última geração e navegação pelos melhores pontos do Rio Tocantins.',
    preco_base: 1200,
    preco_unidade: 'dia',
    preco_detalhe: '/dia (até 2 pescadores)',
    nota: 4.9,
    avaliacoes_count: 84,
    imagem_url: 'assets/images/pesca-esportiva-peixe-to.jpg',
    caracteristicas: ['Barco Bass Boat 90HP c/ cadeiras giratórias', 'Caixa térmica com gelo e água mineral', 'Almoço ribeirinho no barranco incluso']
  },
  {
    slug: 'praia-da-tartaruga',
    titulo: 'Day Use na Ilha da Praia da Tartaruga',
    categoria: 'passeio',
    tag_destaque: 'Família & Lazer',
    descricao: 'Travessia em voadeira homologada para a praia mais famosa do Tocantins. Areias alvas, quiosques com água de coco e águas calmas.',
    preco_base: 80,
    preco_unidade: 'pessoa',
    preco_detalhe: '/pessoa',
    nota: 5.0,
    avaliacoes_count: 132,
    imagem_url: 'assets/images/praia-tartaruga-acampamento.jpg',
    caracteristicas: ['Travessia ida e volta com coletes homologados', 'Guarda-sol de palha e cadeiras de praia', 'Área com salva-vidas e banho seguro']
  },
  {
    slug: 'camping-ilha-fluvial',
    titulo: 'Pernoite Camping em Ilha Fluvial',
    categoria: 'camping',
    tag_destaque: 'Ecoturismo',
    descricao: 'Acampe sob o céu mais estrelado do Brasil em um banco de areia privado no meio do Rio Tocantins.',
    preco_base: 120,
    preco_unidade: 'noite',
    preco_detalhe: '/noite por pessoa',
    nota: 4.8,
    avaliacoes_count: 67,
    imagem_url: 'assets/images/praia-tartaruga-acampamento.jpg',
    caracteristicas: ['Traslado náutico exclusivo para a ilha', 'Aluguel de barraca impermeável e isolante térmico', 'Apoio de rádio e suporte do piloteiro']
  },
  {
    slug: 'chalana-por-do-sol',
    titulo: 'Passeio de Chalana ao Pôr do Sol',
    categoria: 'passeio',
    tag_destaque: 'Romântico & Grupos',
    descricao: 'Navegação contemplativa pelas ilhas do arquipélago fluvial de Peixe durante o entardecer tocantinense.',
    preco_base: 150,
    preco_unidade: 'pessoa',
    preco_detalhe: '/pessoa',
    nota: 4.9,
    avaliacoes_count: 95,
    imagem_url: 'assets/images/passeio-barco-por-do-sol.jpg',
    caracteristicas: ['2h30 de navegação pelo canal principal', 'Parada para banho refrescante no rio', 'Petiscos e bebidas geladas a bordo']
  },
  {
    slug: 'cachoeira-da-chupe',
    titulo: 'Expedição Cachoeira da Chupé',
    categoria: 'passeio',
    tag_destaque: 'Aventura & Trilha',
    descricao: "Trilha ecológica em meio à vegetação nativa do cerrado com chegada a piscinas naturais de águas esmeralda.",
    preco_base: 160,
    preco_unidade: 'pessoa',
    preco_detalhe: '/pessoa',
    nota: 4.9,
    avaliacoes_count: 53,
    imagem_url: 'assets/images/cachoeira-chupe-peixe.jpg',
    caracteristicas: ['Guia condutor ambiental credenciado', 'Banho em poços naturais de água pura', 'Seguro aventura e lanche de trilha incluso']
  },
  {
    slug: 'pesca-noturna-couro',
    titulo: 'Pesca Noturna de Couro (Jaú & Surubim)',
    categoria: 'pesca',
    tag_destaque: 'Pesca Pesada',
    descricao: 'Aventura noturna nos poços profundos do Rio Tocantins em busca dos gigantes do fundo.',
    preco_base: 850,
    preco_unidade: 'noite',
    preco_detalhe: '/noite',
    nota: 4.8,
    avaliacoes_count: 41,
    imagem_url: 'assets/images/cidade-peixe-orla-tocantins.jpg',
    caracteristicas: ['Barco reforçado com holofotes subaquáticos', 'Iscas vivas (tuviras e minhocuçu) inclusas', 'Equipamento de suporte pesado a bordo']
  }
];

const FALLBACK_ESPECIES = [
  { nome_popular: 'Tucunaré Azul', nome_cientifico: 'Cichla piquiti', porte_info: 'Até 65cm+ • Iscas de Superfície', icone: 'fa-fish' },
  { nome_popular: 'Jaú Gigante', nome_cientifico: 'Zungaro zungaro', porte_info: 'Até 60kg+ • Poços Profundos', icone: 'fa-shield-halved' },
  { nome_popular: 'Surubim Pintado', nome_cientifico: 'Pseudoplatystoma corruscans', porte_info: 'Corredeiras e Gargantas', icone: 'fa-water' },
  { nome_popular: 'Bicuda Real', nome_cientifico: 'Boulengerella cuvieri', porte_info: 'Veloz • Saltos Acrobáticos', icone: 'fa-bolt' },
  { nome_popular: 'Apapá Amarelo', nome_cientifico: 'Pellona castelnaeana', porte_info: 'Dourado do Tocantins • Fly', icone: 'fa-sun' }
];

const FALLBACK_RIO = {
  temperatura_agua: '28.0°C',
  nivel_status: 'Estável (Ideal p/ Pesca)',
  clima: 'Ensolarado (32°C)',
  transparencia: 'Excelente (3 metros)'
};

// ===========================================================================
// RENDERIZADORES DE COMPONENTES DINÂMICOS
// ===========================================================================

/** Formata preço em BRL */
function formatBRL(valor) {
  return `R$ ${Number(valor).toLocaleString('pt-BR')}`;
}

/** Renderiza os cards de experiências no grid */
function renderExperiencias(lista) {
  const grid = document.querySelector('.cards-grid');
  if (!grid || !lista || lista.length === 0) return;

  grid.innerHTML = lista.map(exp => {
    const caracteristicas = Array.isArray(exp.caracteristicas)
      ? exp.caracteristicas
      : (typeof exp.caracteristicas === 'string' ? JSON.parse(exp.caracteristicas) : []);

    return `
    <div class="experience-card" data-category="${exp.categoria}" data-slug="${exp.slug}">
      <div class="card-image-wrap">
        <img src="${exp.imagem_url}" alt="${exp.titulo}" loading="lazy">
        <span class="card-badge">${exp.tag_destaque || ''}</span>
        <span class="card-rating">
          <i class="fa-solid fa-star" style="color: #f59e0b;"></i>
          ${exp.nota} (${exp.avaliacoes_count})
        </span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${exp.titulo}</h3>
        <p class="card-text">${exp.descricao}</p>
        <ul class="card-features-list">
          ${caracteristicas.map(c => `
            <li><i class="fa-solid fa-circle-check"></i> ${c}</li>
          `).join('')}
        </ul>
        <div class="card-footer">
          <div class="price-tag">
            <span class="label">A partir de</span>
            <span class="value">${formatBRL(exp.preco_base)} <small style="font-size: 0.75rem; color: var(--text-muted);">${exp.preco_detalhe || ''}</small></span>
          </div>
          <a href="#simulador" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Cotar</a>
        </div>
      </div>
    </div>`;
  }).join('');

  // Re-inicializar filtros de categoria após renderizar
  initCategoryFilters();
}

/** Renderiza as espécies de peixes */
function renderEspecies(lista) {
  const container = document.querySelector('.species-scroll-container');
  if (!container || !lista || lista.length === 0) return;

  container.innerHTML = lista.map(esp => `
    <div class="species-box">
      <div class="species-icon-wrap">
        <i class="fa-solid ${esp.icone || 'fa-fish'}"></i>
      </div>
      <h3 class="species-name">${esp.nome_popular}</h3>
      <p class="species-tech-name">${esp.nome_cientifico}</p>
      <span class="species-badge">${esp.porte_info}</span>
    </div>
  `).join('');
}

/** Atualiza o widget de condições do Rio Tocantins */
function renderCondicoesRio(condicoes) {
  if (!condicoes) return;
  const tempEl = document.getElementById('live-river-temp');
  const levelEl = document.getElementById('live-river-level');
  const climaEl = document.getElementById('live-river-clima');

  if (tempEl) tempEl.textContent = condicoes.temperatura_agua || '28.0°C';
  if (levelEl) levelEl.textContent = condicoes.nivel_status || 'Estável';
  if (climaEl) climaEl.textContent = condicoes.clima || 'Ensolarado';
}

// ===========================================================================
// INICIALIZAÇÃO PRINCIPAL
// ===========================================================================
async function initApp() {
  console.log('[App] 🎣 Iniciando Peixe Aventura Tocantins...');

  // Inicializar Supabase SDK no browser
  await initSupabase();

  // 1. Carregar experiências
  let expResp = await apiFetch('/api/experiencias');
  AppState.experiencias = (expResp && expResp.ok && expResp.data && expResp.data.length > 0)
    ? expResp.data
    : FALLBACK_EXPERIENCIAS;

  renderExperiencias(AppState.experiencias);
  console.log(`[App] ✅ ${AppState.experiencias.length} experiências carregadas`);

  // 2. Carregar espécies de peixes
  let espResp = await apiFetch('/api/especies');
  AppState.especies = (espResp && espResp.ok && espResp.data && espResp.data.length > 0)
    ? espResp.data
    : FALLBACK_ESPECIES;

  renderEspecies(AppState.especies);
  console.log(`[App] ✅ ${AppState.especies.length} espécies carregadas`);

  // 3. Carregar condições do Rio
  let rioResp = await apiFetch('/api/rio');
  AppState.condicoesRio = (rioResp && rioResp.ok && rioResp.data)
    ? rioResp.data
    : FALLBACK_RIO;

  renderCondicoesRio(AppState.condicoesRio);
  console.log('[App] ✅ Condições do Rio Tocantins atualizadas');

  AppState.initialized = true;
  console.log('[App] 🚀 Peixe Aventura inicializado com sucesso!');
}

// ===========================================================================
// SIMULADOR DE PACOTES INTEGRADO AO SUPABASE
// ===========================================================================
const PRICING_TABLE = {
  'bass-boat': { name: 'Diária Bass Boat + Piloteiro', basePrice: 1200, unit: 'dia' },
  'voadeira': { name: 'Diária Voadeira 40HP + Piloteiro', basePrice: 850, unit: 'dia' },
  'chalana-sunset': { name: 'Passeio Chalana Pôr do Sol', basePrice: 150, unit: 'pessoa' },
  'praia-tartaruga': { name: 'Day Use + Travessia Praia da Tartaruga', basePrice: 80, unit: 'pessoa' },
  'camping-ilha': { name: 'Pernoite Camping em Ilha do Tocantins', basePrice: 120, unit: 'pessoa' },
  'chupe-tour': { name: 'Expedição Cachoeira da Chupé', basePrice: 160, unit: 'pessoa' }
};

function initPackageCalculator() {
  const serviceSelect = document.getElementById('calc-service');
  const daysInput = document.getElementById('calc-days');
  const guestsInput = document.getElementById('calc-guests');
  const addLunchCheck = document.getElementById('addon-lunch');
  const addTackleCheck = document.getElementById('addon-tackle');
  const addCampingCheck = document.getElementById('addon-camping');
  const addTransferCheck = document.getElementById('addon-transfer');
  const summaryServiceName = document.getElementById('summary-service-name');
  const summaryDaysText = document.getElementById('summary-days-text');
  const summaryGuestsText = document.getElementById('summary-guests-text');
  const summaryAddonsPrice = document.getElementById('summary-addons-price');
  const summaryTotalPrice = document.getElementById('summary-total-price');
  const summaryDepositPrice = document.getElementById('summary-deposit-price');
  const whatsappCtaBtn = document.getElementById('calc-whatsapp-btn');

  function calculate() {
    if (!serviceSelect) return;
    const serviceKey = serviceSelect.value;
    const selectedService = PRICING_TABLE[serviceKey] || PRICING_TABLE['bass-boat'];
    const days = Math.max(1, parseInt(daysInput.value) || 1);
    const guests = Math.max(1, parseInt(guestsInput.value) || 1);

    let baseCost = selectedService.unit === 'dia'
      ? selectedService.basePrice * days
      : selectedService.basePrice * guests * days;

    let addonsTotal = 0;
    const adicionaisDesc = [];

    if (addLunchCheck && addLunchCheck.checked) {
      addonsTotal += (90 * guests * days);
      adicionaisDesc.push('Almoço Ribeirinho');
    }
    if (addTackleCheck && addTackleCheck.checked) {
      addonsTotal += (150 * days);
      adicionaisDesc.push('Tralha de Pesca');
    }
    if (addCampingCheck && addCampingCheck.checked) {
      addonsTotal += (80 * days);
      adicionaisDesc.push('Kit Camping');
    }
    if (addTransferCheck && addTransferCheck.checked) {
      addonsTotal += (60 * guests);
      adicionaisDesc.push('Traslado Náutico Privativo');
    }

    const total = baseCost + addonsTotal;
    const deposit = Math.round(total * 0.3);

    if (summaryServiceName) summaryServiceName.textContent = selectedService.name;
    if (summaryDaysText) summaryDaysText.textContent = `${days} dia(s)`;
    if (summaryGuestsText) summaryGuestsText.textContent = `${guests} pessoa(s)`;
    if (summaryAddonsPrice) summaryAddonsPrice.textContent = `R$ ${addonsTotal.toLocaleString('pt-BR')}`;
    if (summaryTotalPrice) summaryTotalPrice.textContent = `R$ ${total.toLocaleString('pt-BR')}`;
    if (summaryDepositPrice) summaryDepositPrice.textContent = `R$ ${deposit.toLocaleString('pt-BR')}`;

    // Link WhatsApp dinâmico
    const message = encodeURIComponent(
      `Olá, Peixe Aventura! Gostaria de cotar:\n` +
      `📌 *Serviço:* ${selectedService.name}\n` +
      `🗓️ *Duração:* ${days} dia(s)\n` +
      `👥 *Pessoas:* ${guests} pessoa(s)\n` +
      `📦 *Adicionais:* ${adicionaisDesc.join(', ') || 'Nenhum'} (R$ ${addonsTotal.toLocaleString('pt-BR')})\n` +
      `💰 *Total Estimado:* R$ ${total.toLocaleString('pt-BR')} (Sinal 30%: R$ ${deposit.toLocaleString('pt-BR')})\n` +
      `Poderiam confirmar a disponibilidade?`
    );

    if (whatsappCtaBtn) {
      whatsappCtaBtn.href = `https://wa.me/5563999999999?text=${message}`;
    }

    // Salvar no estado global para o modal de voucher
    window.currentPackageQuote = {
      service: selectedService.name,
      serviceKey,
      days, guests,
      adicionais: adicionaisDesc,
      addonsTotal, total, deposit
    };
  }

  [serviceSelect, daysInput, guestsInput, addLunchCheck, addTackleCheck, addCampingCheck, addTransferCheck]
    .filter(Boolean)
    .forEach(el => {
      el.addEventListener('change', calculate);
      el.addEventListener('input', calculate);
    });

  calculate();
}

// ===========================================================================
// MODAL DE VOUCHER COM CRIAÇÃO DE RESERVA NO SUPABASE
// ===========================================================================
function initModalActions() {
  const voucherModal = document.getElementById('voucher-modal');
  const openVoucherBtn = document.getElementById('calc-voucher-btn');
  const closeModalBtn = document.getElementById('voucher-modal-close');
  const copyPixBtn = document.getElementById('copy-pix-btn');
  const pixFeedback = document.getElementById('pix-copy-feedback');

  if (openVoucherBtn && voucherModal) {
    openVoucherBtn.addEventListener('click', async () => {
      const quote = window.currentPackageQuote;
      if (!quote) return;

      // Tentar criar a reserva no Supabase via API
      try {
        const resp = await fetch(`${API_BASE}/api/reservas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            servicoChave: quote.serviceKey,
            servicoNome: quote.service,
            dias: quote.days,
            pessoas: quote.guests,
            adicionais: quote.adicionais,
            valorAdicionais: quote.addonsTotal,
            total: quote.total,
            sinal: quote.deposit
          })
        });

        const result = await resp.json();

        if (result.ok && result.data) {
          // Atualizar modal com dados reais da reserva
          document.getElementById('modal-service-name').textContent = result.data.servico_nome;
          document.getElementById('modal-duration').textContent = `${result.data.quantidade_dias} dia(s) / ${result.data.quantidade_pessoas} pessoa(s)`;
          document.getElementById('modal-total').textContent = `R$ ${Number(result.data.valor_total).toLocaleString('pt-BR')}`;
          document.getElementById('modal-deposit').textContent = `R$ ${Number(result.data.valor_sinal).toLocaleString('pt-BR')}`;

          // Atualizar código do voucher gerado
          const codigoEl = document.getElementById('modal-voucher-code');
          if (codigoEl) codigoEl.textContent = result.data.codigo_voucher;

          console.log('[Reserva] ✅ Reserva criada no Supabase:', result.data.codigo_voucher);
        } else {
          throw new Error(result.error || 'Falha ao criar reserva');
        }
      } catch (err) {
        // Fallback com dados locais se o banco não estiver configurado
        console.warn('[Reserva] Usando fallback local:', err.message);
        document.getElementById('modal-service-name').textContent = quote.service;
        document.getElementById('modal-duration').textContent = `${quote.days} dia(s) / ${quote.guests} pessoa(s)`;
        document.getElementById('modal-total').textContent = `R$ ${quote.total.toLocaleString('pt-BR')}`;
        document.getElementById('modal-deposit').textContent = `R$ ${quote.deposit.toLocaleString('pt-BR')}`;
      }

      voucherModal.classList.add('active');
    });
  }

  if (closeModalBtn && voucherModal) {
    closeModalBtn.addEventListener('click', () => voucherModal.classList.remove('active'));
  }

  if (voucherModal) {
    voucherModal.addEventListener('click', (e) => {
      if (e.target === voucherModal) voucherModal.classList.remove('active');
    });
  }

  if (copyPixBtn && pixFeedback) {
    copyPixBtn.addEventListener('click', () => {
      const pixKey = '00020126580014br.gov.bcb.pix0136peixeaventura@ecotur.to5204000053039865405100.005802BR5925PEIXE AVENTURA TOCANTINS6005PEIXE62070503***6304E2D1';
      navigator.clipboard.writeText(pixKey).then(() => {
        pixFeedback.style.display = 'block';
        setTimeout(() => { pixFeedback.style.display = 'none'; }, 3000);
      }).catch(() => {
        alert('Chave Pix: peixeaventura@ecotur.to');
      });
    });
  }
}

// ===========================================================================
// DEMAIS FUNÇÕES DE UI (mantidas do original)
// ===========================================================================
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const savedTheme = localStorage.getItem('peixe_theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeIcon) themeIcon.className = 'fa-solid fa-sun';
  }
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('peixe_theme', isDark ? 'dark' : 'light');
      if (themeIcon) themeIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    });
  }
}

function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-active');
      const icon = menuBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-active');
        const icon = menuBtn.querySelector('i');
        if (icon) { icon.classList.add('fa-bars'); icon.classList.remove('fa-xmark'); }
      });
    });
  }
}

function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  });
}

function initCategoryFilters() {
  const tabButtons = document.querySelectorAll('.category-filter-tabs .tab-btn');
  const cards = document.querySelectorAll('.cards-grid .experience-card');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.getAttribute('data-category');
      cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        const show = category === 'all' || cardCategory === category;
        card.style.display = show ? 'flex' : 'none';
        if (show) card.style.animation = 'none';
      });
    });
  });
}

function initLightboxGallery() {
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close-btn');
  if (!lightboxModal) return;

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const caption = item.querySelector('.gallery-caption');
      if (img) {
        lightboxImg.src = img.src;
        if (lightboxCaption) lightboxCaption.textContent = caption ? caption.textContent : '';
        lightboxModal.classList.add('active');
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', () => lightboxModal.classList.remove('active'));
  lightboxModal.addEventListener('click', e => {
    if (e.target === lightboxModal) lightboxModal.classList.remove('active');
  });
}

function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (btn) {
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    }
  });
}

function initBookingSearchQuick() {
  const searchForm = document.getElementById('hero-quick-search');
  if (!searchForm) return;
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = document.getElementById('quick-type').value;
    const people = document.getElementById('quick-people').value;
    const calcSection = document.getElementById('simulador');
    if (calcSection) {
      calcSection.scrollIntoView({ behavior: 'smooth' });
      const guestsInput = document.getElementById('calc-guests');
      const serviceSelect = document.getElementById('calc-service');
      if (guestsInput) guestsInput.value = people;
      if (serviceSelect && type) {
        serviceSelect.value = type;
        serviceSelect.dispatchEvent(new Event('change'));
      }
    }
  });
}

function initRiverMetricsTicker() {
  // Atualiza o widget a cada 5 min buscando dados frescos da API
  setInterval(async () => {
    const rioResp = await apiFetch('/api/rio');
    if (rioResp && rioResp.ok && rioResp.data) {
      renderCondicoesRio(rioResp.data);
    }
  }, 5 * 60 * 1000); // 5 minutos
}

// ===========================================================================
// PONTO DE ENTRADA
// ===========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar UI estática imediatamente
  initThemeToggle();
  initMobileMenu();
  initHeaderScroll();
  initFaqAccordion();
  initBookingSearchQuick();
  initLightboxGallery();
  initPackageCalculator();
  initModalActions();

  // Carregar dados do Supabase (async, com fallback)
  await initApp();

  // Polling de atualização das condições do rio
  initRiverMetricsTicker();
});
