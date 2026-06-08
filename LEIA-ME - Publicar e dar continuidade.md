# STUDIO F03 — Publicar o site e dar continuidade

Este pacote tem **duas partes**:

```
deploy/      → o SITE (estático, vai para o GitHub Pages)  ✅ já pronto
backend/     → o BACK-END do formulário (Cloudflare Worker) ⏳ você implanta
```

> O formulário do site já está **ligado por código**. Enquanto o back-end não existir,
> ele fica em **modo demo** (mostra "Recebido!" sem enviar). Assim você pode publicar o
> site **agora** e plugar o back-end depois — em 1 linha.

---

## PARTE A — Publicar o site (GitHub Pages)

1. Crie um repositório em **github.com** (ex.: `site-studiof03`, público).
2. **Suba o conteúdo da pasta `deploy/`** (arraste os arquivos para o repo; o `index.html`
   tem que ficar na **raiz**, não dentro de uma subpasta).
3. **Settings → Pages** → Source: *Deploy from a branch* → branch `main`, pasta `/ (root)` → Save.
4. Em ~1 min o site sai em `https://SEU-USUARIO.github.io/site-studiof03/`.

### Apontar seu domínio (e tirar do Google Sites)
- Em **Settings → Pages → Custom domain**, digite `www.seudominio.com` e Save.
- No painel do **seu provedor de domínio**:
  - **Remova** os registros antigos do Google Sites (o `CNAME www → ghs.googlehosted.com`
    e quaisquer `A` apontando para o Google).
  - **Adicione** `CNAME www → SEU-USUARIO.github.io`.
  - (Opcional, domínio raiz sem www) adicione os 4 `A` do GitHub:
    `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
- Volte ao GitHub e marque **Enforce HTTPS**. A propagação leva de minutos a horas.

---

## PARTE B — Implantar o back-end (formulário funcionando)

Tudo está em **`backend/`** com um README próprio. Resumo:

1. Crie contas em **Cloudflare** (free) e **Resend** (free).
2. No Resend, **verifique o domínio `studiof03.com`** (adicione os registros SPF/DKIM no DNS).
3. No terminal:
   ```bash
   cd backend
   npm install
   npx wrangler login
   npx wrangler secret put RESEND_API_KEY
   npm run deploy
   ```
4. Copie a URL que o deploy mostrar e cole no site, em **`deploy/index.html`**:
   ```html
   <script>
     window.F03_CONFIG = {
       apiUrl: "https://studiof03-contact.SEU-SUBDOMINIO.workers.dev/api/contact"
     };
   </script>
   ```
5. Suba o `index.html` atualizado no GitHub. Pronto — o formulário passa a enviar de verdade.

---

## Como dar continuidade no Claude Code / Claude chat

Abra a pasta `backend/` no **Claude Code** e diga, por exemplo:

> "Implemente/teste o back-end descrito em `Backend — Handoff Claude Code.md`. Comece pela
> Fase 1. O Worker já está em `backend/src/worker.js` — revise, rode `wrangler dev` e me
> ajude a configurar Resend, secrets e o deploy."

O documento **`Backend — Handoff Claude Code.md`** (na raiz deste pacote) é a especificação
completa: contrato da API, validação, anti-spam, e-mails, variáveis de ambiente, critérios
de aceite e as **fases opcionais** (CMS de portfólio, analytics, otimização de imagens).

### O que ainda depende de você (decisões/contas)
- **E-mail de destino** dos leads (hoje `contato@studiof03.com` — troque se quiser).
- **Verificar o domínio** no Resend (SPF/DKIM) — senão os e-mails caem em spam.
- (Opcional) Captcha **Turnstile** e **rate-limit** por KV — instruções no `backend/README.md`.

---

## Mapa dos arquivos

| Arquivo | O que é |
|---|---|
| `deploy/` | Site pronto para o GitHub Pages (com o formulário já ligado) |
| `deploy/index.html` | Aqui fica `F03_CONFIG.apiUrl` — cole a URL do back-end |
| `backend/src/worker.js` | Código do back-end (Cloudflare Worker) |
| `backend/wrangler.toml` | Config do Worker (vars, rotas, KV) |
| `backend/README.md` | Passo a passo de deploy do back-end |
| `Backend — Handoff Claude Code.md` | Especificação completa (todas as fases) |
| `LEIA-ME — Publicar e dar continuidade.md` | Este arquivo |
