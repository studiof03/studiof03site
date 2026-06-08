# STUDIO F03 — Guia de deploy (cola e roda)

O código já está pronto. Falta só você rodar os comandos abaixo **no seu terminal**
(precisam da sua conta e do seu navegador — eu não consigo rodar daqui).
Faça na ordem. Tempo total: ~30–40 min, a maior parte é esperar DNS.

> Pré-requisitos: **Node 18+** instalado, conta na **Cloudflare** (free) e na **Resend** (free).

---

## PASSO 1 — Verificar o domínio no Resend (faça primeiro, demora a propagar)

1. Crie conta em https://resend.com
2. **Domains → Add Domain** → digite `studiof03.com`.
3. O Resend mostra registros **SPF, DKIM e DMARC**. Adicione-os no DNS do seu domínio
   (no provedor onde o `studiof03.com` está registrado).
4. Volte ao Resend e clique **Verify**. Pode levar de minutos a algumas horas.
5. **API Keys → Create API Key** → copie a chave (`re_...`). Guarde — usa no passo 2.

> Sem o domínio verificado, os e-mails ou não saem ou caem em spam. É o item mais lento,
> por isso vai primeiro.

---

## PASSO 2 — Publicar o back-end (Cloudflare Worker)

No terminal, dentro desta pasta:

```bash
npm install

# autentica na sua conta Cloudflare (abre o navegador)
npx wrangler login

# cola a chave do Resend (fica só na Cloudflare, nunca no Git)
npx wrangler secret put RESEND_API_KEY
#   → cole o re_... quando pedir

# publica
npm run deploy
```

No fim o Wrangler imprime a URL do Worker, algo como:
`https://studiof03-contact.SEU-SUBDOMINIO.workers.dev`

**Teste rápido** (troque a URL pela sua):

```bash
curl -X POST https://studiof03-contact.SEU-SUBDOMINIO.workers.dev/api/contact \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.studiof03.com" \
  -d '{"name":"Teste","email":"voce@gmail.com","service":"Pacote completo","message":"mensagem de teste","lang":"pt","company_site":""}'
```

Esperado: `{"ok":true}` — e os 2 e-mails chegam (estúdio + auto-reply).

---

## PASSO 3 — Ligar o site no back-end

Edite **`index.html`** e cole a URL do Worker (com `/api/contact` no fim):

```html
<script>
  window.F03_CONFIG = {
    apiUrl: "https://studiof03-contact.SEU-SUBDOMINIO.workers.dev/api/contact"
  };
</script>
```

Pronto — o formulário sai do "modo demo" e passa a enviar de verdade.

---

## PASSO 4 — Publicar o site (GitHub Pages)

1. Crie um repositório em github.com (ex.: `site-studiof03`, público).
2. Suba **todos os arquivos desta pasta** — o `index.html` tem que ficar na **raiz**.
3. **Settings → Pages** → Source: *Deploy from a branch* → `main` / `/ (root)` → Save.
4. Em ~1 min sai em `https://SEU-USUARIO.github.io/site-studiof03/`.

### Apontar o domínio `www.studiof03.com` (tirar do Google Sites)
- **Settings → Pages → Custom domain** → digite `www.studiof03.com` → Save.
- No DNS do domínio:
  - **Remova** os registros antigos do Google Sites (`CNAME www → ghs.googlehosted.com`
    e quaisquer `A` apontando para o Google).
  - **Adicione** `CNAME www → SEU-USUARIO.github.io`.
  - (Opcional, domínio raiz) os 4 `A` do GitHub:
    `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
- De volta ao GitHub, marque **Enforce HTTPS**.

---

## OPCIONAIS (depois, se quiser)

**API em domínio próprio** (`api.studiof03.com` em vez da URL `.workers.dev`):
adicione `studiof03.com` à sua conta Cloudflare, descomente o bloco `routes` no
`wrangler.toml`, rode `npm run deploy` de novo e atualize o `apiUrl` do site.

**Rate-limit por IP** (5 envios / 10 min):
```bash
npx wrangler kv namespace create RATE_LIMIT
```
Cole o `id` que ele mostrar no bloco `[[kv_namespaces]]` do `wrangler.toml` (descomente)
e rode `npm run deploy`. O código já usa o binding `RATE_LIMIT` automaticamente se existir.

**Captcha Turnstile** (anti-bot mais forte) — *o site já está pronto para isso*:
1. No painel Cloudflare → **Turnstile** → crie um widget para o domínio `studiof03.com`.
   Ele te dá um par de chaves: uma **Site Key** (pública) e uma **Secret Key**.
2. Cole a **Site Key** no `index.html`, em `F03_CONFIG.turnstileSiteKey`:
   ```js
   turnstileSiteKey: "0x4AAAAAAA..."   // a SITE KEY pública
   ```
   O widget aparece sozinho no formulário (tema escuro, combinando com o site).
3. Cole a **Secret Key** no back-end:
   ```bash
   npx wrangler secret put TURNSTILE_SECRET
   npm run deploy
   ```
Com o secret presente, o Worker passa a **exigir** o token válido em todo envio.
Sem configurar nada disso, o formulário segue funcionando normalmente (sem captcha),
protegido pelo honeypot + rate-limit.

---

## Checklist de aceite
- [ ] Domínio verificado no Resend (SPF/DKIM/DMARC) → e-mails não caem em spam.
- [ ] `npm run deploy` concluído, URL do Worker em mãos.
- [ ] `curl` de teste retorna `{"ok":true}` e os 2 e-mails chegam.
- [ ] `apiUrl` colado no `index.html`.
- [ ] Site no ar pelo GitHub Pages, domínio apontado, HTTPS forçado.
- [ ] Form do site enviando de verdade (testar pelo navegador).
```
