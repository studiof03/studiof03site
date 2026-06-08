# STUDIO F03 — Back-end de contato (Cloudflare Worker)

API que recebe o formulário do site e dispara os e-mails (notificação para o estúdio +
auto-reply para o lead). Gratuito no plano free da Cloudflare + Resend.

**Endpoint:** `POST /api/contact` — contrato em `../Backend — Handoff Claude Code.md`, seção 1.2.

---

## Pré-requisitos (contas)
1. **Cloudflare** (free) — https://dash.cloudflare.com
2. **Resend** (free) — https://resend.com — e **domínio `studiof03.com` verificado** lá
   (adicionar os registros **SPF/DKIM** que o Resend mostrar no DNS do domínio).
3. **Node.js 18+** instalado na sua máquina.

## Passo a passo

```bash
cd backend
npm install

# 1) Autenticar na Cloudflare
npx wrangler login

# 2) Configurar os secrets (valores reais ficam só na Cloudflare, nunca no Git)
npx wrangler secret put RESEND_API_KEY
#   (opcional) npx wrangler secret put TURNSTILE_SECRET

# 3) (opcional) rate-limit por IP — cria um KV e descomenta o bloco no wrangler.toml
#   npx wrangler kv namespace create RATE_LIMIT

# 4) Ajustar TO_EMAIL / FROM_EMAIL / ALLOWED_ORIGIN no wrangler.toml [vars]

# 5) Testar local
cp .dev.vars.example .dev.vars   # preencher os valores
npm run dev                      # sobe em http://localhost:8787

# 6) Publicar
npm run deploy
```

Ao publicar, o Wrangler mostra a URL do Worker, algo como:
`https://studiof03-contact.SEU-SUBDOMINIO.workers.dev`

## Ligar no site (front-end)
No site, edite **`index.html`** e cole essa URL (com `/api/contact` no fim) em `F03_CONFIG.apiUrl`:

```html
<script>
  window.F03_CONFIG = {
    apiUrl: "https://studiof03-contact.SEU-SUBDOMINIO.workers.dev/api/contact"
  };
</script>
```

> Enquanto `apiUrl` estiver vazio, o formulário fica em **modo demo** (mostra "Recebido!"
> mas não envia nada). Assim o site já pode ir ao ar antes do back-end existir.

### Domínio próprio para a API (opcional, recomendado)
Para usar `https://api.studiof03.com/api/contact`, descomente o bloco `routes` no
`wrangler.toml` (precisa do domínio `studiof03.com` na sua conta Cloudflare) e ajuste o
`apiUrl` do site para esse endereço.

## Variáveis de ambiente
| Nome | Onde | Obrigatório | Descrição |
|---|---|---|---|
| `RESEND_API_KEY` | secret | sim | chave da API do Resend |
| `TO_EMAIL` | vars | sim | e-mail que recebe os leads |
| `FROM_EMAIL` | vars | sim | remetente (domínio verificado no Resend) |
| `ALLOWED_ORIGIN` | vars | sim | origem(ns) liberada(s) no CORS, separadas por vírgula |
| `TURNSTILE_SECRET` | secret | não | ativa o captcha Turnstile se presente |
| `RATE_LIMIT` | KV binding | não | ativa rate-limit por IP (5/10min) |

## Checklist de aceite
- [ ] `POST` com dados válidos → estúdio recebe e-mail **e** lead recebe auto-reply.
- [ ] Dados inválidos → `400 {error:"validation"}`.
- [ ] Honeypot preenchido → `200` mas nenhum e-mail enviado.
- [ ] Origem não autorizada → bloqueada pelo CORS.
- [ ] `FROM_EMAIL` com domínio verificado (SPF/DKIM) → e-mails não caem em spam.
