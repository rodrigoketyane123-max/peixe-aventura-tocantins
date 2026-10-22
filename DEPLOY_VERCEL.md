# 🚀 Guia de Deploy na Vercel – Peixe Aventura Tocantins

Este projeto foi configurado e otimizado com **Serverless Functions** nativas da Vercel (`/api/*`), cache de alta performance para imagens e assets estáticos, e integração segura com o **Supabase**.

---

## 📋 Pré-requisitos

1. Uma conta na [Vercel](https://vercel.com/) (gratuita).
2. Suas credenciais do Supabase:
   - `SUPABASE_URL` (Ex: `https://lufbtkrrhutoikfsbgnl.supabase.co`)
   - `SUPABASE_ANON_KEY` (Sua chave pública `anon` / `publishable`)

---

## 🛠️ Método 1: Deploy via GitHub (Recomendado)

Esta é a forma mais simples, pois toda alteração futura que você enviar para o GitHub atualizará o site na Vercel automaticamente.

### Passo 1: Subir seu código para o GitHub
Se você ainda não enviou o repositório para o seu GitHub, execute no terminal:
```bash
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git branch -M main
git push -u origin main
```

### Passo 2: Importar na Vercel
1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard).
2. Clique no botão **"Add New..."** → **"Project"**.
3. Localize e selecione o seu repositório do GitHub e clique em **"Import"**.

### Passo 3: Configurar as Variáveis de Ambiente
Na tela de configuração do projeto antes de clicar em Deploy, expanda a seção **"Environment Variables"** e adicione:

| Nome da Variável | Valor |
| :--- | :--- |
| `SUPABASE_URL` | Sua URL do Supabase (ex: `https://lufbtkrrhutoikfsbgnl.supabase.co`) |
| `SUPABASE_ANON_KEY` | Sua chave pública anon do Supabase |

> 💡 **Nota:** Não é necessário alterar a pasta raiz (*Root Directory*) nem comandos de build. O arquivo `vercel.json` e o `package.json` já possuem as instruções automáticas.

### Passo 4: Concluir o Deploy
Clique em **"Deploy"**. Em cerca de 30 a 60 segundos, seu site estará no ar com link HTTPS e CDN global!

---

## ⚡ Método 2: Deploy Direto via Vercel CLI (Sem GitHub)

Se preferir publicar diretamente do seu terminal sem passar pelo GitHub:

1. No terminal do projeto, execute:
```bash
npx vercel
```
2. Siga os passos interativos no terminal:
   - Faça login na sua conta Vercel (se solicitado no navegador).
   - Confirme as configurações padrão pressionando **Enter**.
3. Adicione as variáveis de ambiente:
```bash
npx vercel env add SUPABASE_URL production
npx vercel env add SUPABASE_ANON_KEY production
```
4. Faça o deploy de produção:
```bash
npx vercel --prod
```

---

## ✅ Como Validar o Deploy em Produção

Após o deploy, a Vercel gerará uma URL como `https://peixe-aventura-tocantins.vercel.app`.

Você pode testar rapidamente acessando no navegador:

1. **Página Principal:**  
   `https://seu-projeto.vercel.app`  
   *(Verifique se os cards de experiências carregam dinamicamente do Supabase e se o widget de temperatura do Rio Tocantins marca 28.0°C)*

2. **Health Check da API:**  
   `https://seu-projeto.vercel.app/api`  
   *(Deve retornar `status: "online"`, `environment: "vercel-serverless"` e `supabase_configured: true`)*

3. **Catálogo de Experiências:**  
   `https://seu-projeto.vercel.app/api/experiencias`

4. **Simulador de Vouchers:**  
   Acesse a seção de simulação na página, faça uma cotação e clique em **"Gerar Voucher Oficial & Pix"**. O voucher será gravado diretamente na tabela `reservas` do Supabase!

---

## 🔒 Segurança

- O arquivo `.env` com suas chaves locais está listado no `.gitignore` e no `.vercelignore`, garantindo que senhas e chaves nunca sejam expostas publicamente.
- O `vercel.json` já implementa cabeçalhos de segurança HTTP modernos (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`).
