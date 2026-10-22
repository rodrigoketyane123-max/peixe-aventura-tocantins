# 🌊 Peixe Aventura Tocantins
### Portal Oficial de Pesca Esportiva, Ecoturismo & Acampamentos no Rio Tocantins

<p align="center">
  <img src="assets/images/praia-tartaruga-acampamento.jpg" alt="Praia da Tartaruga e Camping em Peixe - Tocantins" width="100%" style="border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Destino-Peixe%2C%20Tocantins-0077b6?style=for-the-badge&logo=google-maps&logoColor=white" alt="Destino Peixe TO" />
  <img src="https://img.shields.io/badge/Rio-Tocantins%20%26%20Lago%20Angical-0096c7?style=for-the-badge&logo=water&logoColor=white" alt="Rio Tocantins" />
  <img src="https://img.shields.io/badge/Atividades-Pesca%20%7C%20Turismo%20%7C%20Camping-e76f51?style=for-the-badge" alt="Atividades" />
  <img src="https://img.shields.io/badge/Status-Documentado%20via%20PRD-2a9d8f?style=for-the-badge" alt="Status" />
</p>

---

## 📖 Sobre o Projeto

**Peixe Aventura Tocantins** é uma plataforma digital concebida para conectar viajantes, famílias e pescadores esportivos de todo o Brasil às maravilhas naturais de **Peixe – Tocantins**, carinhosamente conhecida como a *Capital do Ecoturismo e da Pesca Esportiva do Tocantins*.

Banhada pelas águas translúcidas do **Rio Tocantins** e pelo lago da UHE Peixe Angical, a região oferece uma das experiências mais completas do ecoturismo brasileiro: a adrenalina da captura do valente **Tucunaré Azul**, o descanso nas areias brancas da **Praia da Tartaruga** e a imersão de acampar sob o céu estrelado do cerrado tocantinense.

O projeto foi totalmente especificado no documento de requisitos [prd.md](prd.md).

---

## 📸 Galeria do Destino

Abaixo você encontra registros fotográficos dos três pilares fundamentais da plataforma:

### 1. Pesca Esportiva de Troféus (Tucunaré Azul)
Conhecida internacionalmente pelos gigantes do Rio Tocantins, a cidade atrai pescadores esportivos com embarcações equipadas e guias nativos experientes.

<p align="center">
  <img src="assets/images/pesca-esportiva-peixe-to.jpg" alt="Pesca Esportiva de Tucunaré Azul no Rio Tocantins" width="90%" style="border-radius: 10px;" />
</p>

### 2. Acolhimento Histórico & Orla Fluvial
Centro histórico com casarios coloniais, culinária ribeirinha autêntica e o cais de onde partem os barcos e voadeiras para as ilhas.

<p align="center">
  <img src="assets/images/cidade-peixe-orla-tocantins.jpg" alt="Orla e Centro Histórico de Peixe - Tocantins" width="90%" style="border-radius: 10px;" />
</p>

### 3. Praia da Tartaruga & Acampamentos em Ilhas Fluviais
Durante a estiagem (junho a setembro), emergem praias de água doce com águas mornas, areias claras e infraestrutura completa para banhistas e amantes de camping.

<p align="center">
  <img src="assets/images/praia-tartaruga-acampamento.jpg" alt="Praia da Tartaruga e Camping Fluvial" width="90%" style="border-radius: 10px;" />
</p>

---

## ✨ Principais Módulos do Sistema

Baseado no [prd.md](prd.md), a plataforma é organizada em quatro eixos centrais:

| Eixo | O que oferece | Destaques |
| :--- | :--- | :--- |
| **🎣 Pesca Esportiva** | Reserva de piloteiros credenciados e barcos rápidos (Bass Boats / Voadeiras). | Tucunaré Azul, Jaú, Pintado, Apapá, motor elétrico, sonar e almoço na ilha. |
| **🏖️ Turismo & Praias** | Travessias, passeios de chalana e visitas ecológicas. | Praia da Tartaruga, Cachoeira da Chupé, passeios de pôr do sol e centro histórico. |
| **⛺ Camping & Acampamento** | Mapa de áreas autorizadas e aluguel de equipamentos náuticos e terrestres. | Kits de barracas completas, gazebos, caiaques e protocolos "Não Deixe Rastro". |
| **💳 Motor de Reservas** | Agendamento online simples com confirmação via WhatsApp e Pix/Cartão. | Sem burocracia, com garantia de reserva e suporte em tempo real. |

---

## 🗂️ Estrutura do Projeto

```text
meu projeto 2/
├── api/                                     # Serverless Functions (Vercel & Node.js)
│   ├── _utils.js                            # Helpers HTTP e parse de requisições
│   ├── config.js                            # Endpoint público de credenciais
│   ├── experiencias.js                      # GET /api/experiencias e /:slug
│   ├── especies.js                          # GET /api/especies
│   ├── rio.js                               # GET /api/rio (métricas em tempo real)
│   ├── reservas.js                          # POST /api/reservas e GET /:voucher
│   └── index.js                             # Catálogo e health check da API
├── assets/
│   └── images/                              # Fotos do destino em alta definição
├── css/
│   └── style.css                            # Folha de estilo e Design System moderno
├── js/
│   ├── main.js                              # Lógica interativa, simulador e consumo da API
│   └── supabase-config.js                   # Módulo central de consultas ao Supabase
├── scripts/
│   ├── apply-schema.js                      # Script de inicialização e seed no Supabase
│   └── test-supabase.js                     # Testador de conexão e contagem de tabelas
├── supabase_schema.sql                      # DDL do PostgreSQL + RLS + Dados iniciais
├── vercel.json                              # Configuração de rotas e headers para Vercel
├── index.html                               # Aplicação web completa do portal
├── server.js                                # Servidor web nativo Node.js com roteador de API
├── prd.md                                   # Documento de Requisitos do Produto (PRD)
└── readme.md                                # Documentação e apresentação do projeto
```

---

## 🚀 Como Executar o Projeto Localmente

### 1. Instalar Dependências e Configurar Ambiente
```bash
npm install
```
Certifique-se de que o arquivo `.env` contenha as variáveis do Supabase:
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key-aqui
PORT=3000
```

### 2. Testar Conexão com o Supabase
```bash
npm run db:test
```

### 3. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
# ou
node server.js
```
Acesse no navegador:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## ☁️ Deploy na Vercel (Produção)

O projeto está 100% pronto para deploy na **Vercel** com Serverless Functions nativas:
1. Conecte este repositório no dashboard da [Vercel](https://vercel.com).
2. Adicione as variáveis de ambiente em **Settings → Environment Variables**:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. Clique em **Deploy**. A Vercel servirá tanto o frontend estático otimizado quanto os endpoints `/api/*` automaticamente.

---

## 📍 Como Chegar a Peixe – TO

- **Via Aérea (Palmas - PMW):**
  - Desembarque no Aeroporto de Palmas (Brigadeiro Lysias Rodrigues).
  - Trajeto rodoviário: aprox. **300 km** via TO-070 / BR-010 em rodovias asfaltadas com belas paisagens do cerrado.
- **Via Gurupi - TO:**
  - Importante polo regional localizado a apenas **75 km** de Peixe via TO-181 e BR-242.
- **Coordenadas Geográficas:** `12°00'48"S 48°32'31"W`

---

## 🌿 Sustentabilidade e Boas Práticas

A plataforma apoia ativamente a conservação da biodiversidade do Rio Tocantins:
- **Pesque e Solte (Cota Zero):** Incentivo ao respeito às espécies nativas e reprodução dos quelônios.
- **Licença de Pesca:** Obrigatoriedade de carteira de pesca amadora do Naturatins / Ministério da Pesca.
- **Turismo Consciente:** Recolhimento total de resíduos gerados nos acampamentos em ilhas fluviais.

---

## 📄 Documentação Relacionada

Para conferir o escopo funcional completo, personas, paleta de cores e arquitetura técnica, consulte o documento:
👉 **[Documento de Requisitos do Produto (PRD)](prd.md)**

