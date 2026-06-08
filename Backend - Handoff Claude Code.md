# STUDIO F03 — Handoff de Back-end (para Claude Code)

> Documento de especificação para construir o back-end do site **studiof03.com**.
> O site (front-end) é **estático** e está hospedado no **GitHub Pages**. Este doc descreve
> tudo o que precisa ser construído **fora** do Pages e como ligar uma coisa na outra.
>
> **Como usar:** abra este arquivo no Claude Code e peça para implementar fase por fase,
> começando pela **Fase 1 (formulário de contato)** — é a única parte realmente necessária
> para o site sair do ar "100% funcional". O resto é melhoria.

---

## 0. Contexto e restrição fundamental

- **Front-end:** site estático (HTML + React via Babel no navegador), hospedado no **GitHub Pages**.
  Páginas no Pages **não executam back-end** — não dá pra rodar Node/PHP/banco lá.
- **Consequência:** o back-end é um **serviço separado** (função serverless ou pequena API)
  hospedado em outro lugar, e o site chama esse serviço por `fetch()` HTTPS.
- **O front-end e o back-end ficam em domínios diferentes** → é obrigatório configurar **CORS**
  no back-end para liberar a origem do site.

### Stack recomendada (gratuita, simples, escalável)

| Camada | Recomendação | Alternativas |
|---|---|---|
| Função serverless | **Cloudflare Workers** (free, global, rápido) | Vercel Functions, Netlify Functions, AWS Lambda |
| Envio de e-mail | **Resend** (API simples, free tier 3k/mês) | Postmark, SendGrid, SMTP próprio |
| Anti-spam | **Cloudflare Turnstile** (free) + honeypot + rate-limit | hCaptcha, reCAPTCHA |
| Armazenar leads (opcional) | **Cloudflare D1** (SQLite) ou **KV** | Google Sheets API, Airtable, Postgres (Supabase) |

> Se você já decidiu por outro provedor, mantenha — o contrato de API abaixo é agnóstico.

---

## FASE 1 — Formulário de contato (NECESSÁRIO)

Hoje o formulário é **fake**: ao enviar, ele só mostra a tela de "Recebido!" e **não manda e-mail**.
Esta fase faz ele funcionar de verdade.

### 1.1 O que o formulário coleta (já existe no front-end)

Campos atuais (arquivo `sections.jsx`, componente `Contact`):

| Campo | Obrigatório | Observação |
|---|---|---|
| `name` (Nome) | sim | texto curto |
| `company` (Empresa) | não | texto curto |
| `email` (E-mail) | sim | validar formato |
| `service` (Serviço) | sim (select) | um de: `Imagens 3D`, `Animação`, `Tour 360°`, `Pacote completo` (PT) / `3D Stills`, `Animation`, `360° Tour`, `Full package` (EN) |
| `message` (Mensagem) | sim | texto longo |
| `lang` | — | `pt` ou `en` (mandar junto, p/ escolher idioma do auto-reply) |

### 1.2 Contrato da API

**Endpoint:** `POST https://<seu-backend>/api/contact`
**Content-Type:** `application/json`

**Request body:**
```json
{
  "name": "Maria Silva",
  "company": "Incorporadora Exemplo",
  "email": "maria@exemplo.com",
  "service": "Pacote completo",
  "message": "Lançamento de 2 torres em Curitiba...",
  "lang": "pt",
  "company_site": "",          // honeypot: tem que vir VAZIO (campo escondido)
  "turnstile_token": "0.ABC..." // token do Cloudflare Turnstile (se usar)
}
```

**Respostas:**
| Status | Quando | Body |
|---|---|---|
| `200` | sucesso | `{ "ok": true }` |
| `400` | validação falhou | `{ "ok": false, "error": "validation", "fields": ["email"] }` |
| `429` | rate-limit estourado | `{ "ok": false, "error": "rate_limited" }` |
| `403` | honeypot/captcha reprovado | `{ "ok": false, "error": "spam" }` |
| `500` | erro ao enviar e-mail | `{ "ok": false, "error": "server" }` |

### 1.3 Regras de validação (no back-end — nunca confie só no front)

- `name`: 2–120 chars, obrigatório.
- `email`: regex de e-mail válido, ≤ 200 chars, obrigatório.
- `company`: ≤ 160 chars.
- `service`: deve estar na lista permitida (PT ou EN).
- `message`: 5–4000 chars, obrigatório.
- `company_site` (honeypot): se vier **preenchido**, responder `403` e **descartar** (é bot).
- Rejeitar payloads > ~16 KB.

### 1.4 O que o back-end faz ao receber

1. Valida (acima). Se falhar → resposta de erro apropriada.
2. Verifica anti-spam: honeypot vazio **e** token Turnstile válido (valida server-side com `TURNSTILE_SECRET`).
3. Aplica **rate-limit** por IP (ex.: 5 envios / 10 min).
4. **Envia e-mail para o estúdio** (notificação do lead).
5. **Envia auto-reply** para o e-mail do lead (no idioma `lang`).
6. *(opcional)* Grava o lead no banco/planilha.
7. Responde `200 { ok: true }`.

### 1.5 E-mails

**(a) Notificação para o estúdio** — para `TO_EMAIL` (ex.: `contato@studiof03.com`):
- **Assunto:** `Novo orçamento — {name}{company ? " / "+company : ""}`
- **Reply-To:** o e-mail do lead (pra responder direto).
- **Corpo:** nome, empresa, e-mail, serviço, mensagem, idioma, data/hora (America/Sao_Paulo), IP.

**(b) Auto-reply para o lead** — para o `email` informado:
- **PT** — Assunto: `Recebemos seu contato — STUDIO F03`
  Corpo (tom da marca, formal e acolhedor): confirma o recebimento, diz que respondem
  em **até 1 dia útil** com orçamento e prazo, assina "STUDIO F03".
- **EN** — Assunto: `We got your message — STUDIO F03`
  Equivalente em inglês.
- Use HTML simples + versão texto. Pode usar a paleta da marca (roxo→magenta) e o logo
  (`assets/logo-full-white.png` sobre fundo escuro `#14101C`).

### 1.6 Variáveis de ambiente (secrets — nunca no front-end)

```
RESEND_API_KEY=...           # chave do provedor de e-mail
TO_EMAIL=contato@studiof03.com
FROM_EMAIL=no-reply@studiof03.com   # precisa de domínio verificado no provedor
TURNSTILE_SECRET=...         # se usar Cloudflare Turnstile
ALLOWED_ORIGIN=https://www.studiof03.com   # origem liberada no CORS
```

> ⚠️ Para o `FROM_EMAIL` funcionar sem cair em spam, é preciso **verificar o domínio**
> `studiof03.com` no provedor (configurar registros **SPF / DKIM / DMARC** no DNS).
> Isso é parte do trabalho — incluir no checklist.

### 1.7 CORS (obrigatório)

O back-end deve responder com:
```
Access-Control-Allow-Origin: https://www.studiof03.com
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```
E tratar o **preflight `OPTIONS`** com `204`.
Durante o desenvolvimento, liberar também `http://localhost:*` e a URL de preview
`https://<seu-usuario>.github.io`.

### 1.8 Mudança necessária no FRONT-END

No arquivo **`sections.jsx`**, componente **`Contact`**, hoje existe:

```jsx
<form onSubmit={(e) => {e.preventDefault();setSent(true);}} ...>
```

Trocar por uma submissão real. Esqueleto sugerido (adaptar nomes de estado):

```jsx
// estados: const [sent, setSent] = useState(false);
//          const [sending, setSending] = useState(false);
//          const [err, setErr] = useState(null);

const API = "https://SEU-BACKEND/api/contact"; // colocar a URL final aqui

async function handleSubmit(e) {
  e.preventDefault();
  setErr(null); setSending(true);
  const f = e.target;
  const payload = {
    name:    f.name.value.trim(),
    company: f.company.value.trim(),
    email:   f.email.value.trim(),
    service: f.service.value,
    message: f.message.value.trim(),
    lang:    lang,                          // 'pt' | 'en' do contexto de idioma
    company_site: f.company_site.value,     // honeypot (deve vir vazio)
    turnstile_token: window.turnstileToken || "",
  };
  try {
    const r = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error((await r.json()).error || "server");
    setSent(true);
  } catch (e) {
    setErr(e.message);
  } finally {
    setSending(false);
  }
}
```

Ajustes no JSX do form:
- `onSubmit={handleSubmit}`.
- Dar `name=` a cada campo (`name`, `company`, `email`, `service`, `message`).
- Adicionar o **honeypot escondido** (invisível ao usuário, fora do fluxo de tab):
  ```jsx
  <input type="text" name="company_site" tabIndex="-1" autoComplete="off"
         style={{ position:'absolute', left:'-9999px', width:1, height:1, opacity:0 }} aria-hidden="true" />
  ```
- Desabilitar o botão enquanto `sending` e mostrar estado de erro se `err`.
- *(se usar Turnstile)* incluir o widget e o script do Turnstile.

> Posso fazer essa edição no front-end pra você assim que a URL do back-end existir — é rápido.

### 1.9 Critérios de aceite (Fase 1)
- [ ] Enviar o form com dados válidos → estúdio recebe e-mail **e** lead recebe auto-reply.
- [ ] Campos inválidos → `400` e o front mostra erro, sem "Recebido!".
- [ ] Honeypot preenchido → descartado silenciosamente, sem e-mail.
- [ ] Mais de N envios rápidos do mesmo IP → `429`.
- [ ] Requisição de outra origem (não a do site) → bloqueada por CORS.
- [ ] Secrets só no back-end; nada de chave de API no código do front.
- [ ] Domínio verificado (SPF/DKIM/DMARC) — e-mails não caem em spam.

---

## FASE 2 — Painel/CMS de portfólio (OPCIONAL, recomendado)

Hoje os projetos e as imagens do portfólio são **fixos no código** (`content.jsx`, arrays
`PROJECTS` e `FEED`, com imagens na pasta `renders/`). Para o estúdio **adicionar/editar
projetos sem mexer em código**, há duas abordagens:

**Opção A — CMS git-based (mais simples, combina com GitHub Pages):**
- **Decap CMS** (ex-Netlify CMS): edita arquivos Markdown/JSON no próprio repositório via
  um painel `/admin`. Sem servidor; commits vão direto pro GitHub.
- O front-end passa a ler os projetos de um JSON versionado em vez de array fixo.

**Opção B — Headless CMS hospedado:**
- **Sanity** ou **Contentful**: o estúdio edita num painel; o site busca via API.
- Mais poderoso (mídia, papéis de usuário), porém mais peças.

**Modelo de dados de um projeto** (independente da opção):
```
project: {
  id, title, location, client, year,
  category: 'facade' | 'interior' | 'commons' | 'plan' | 't360' | 'anim',
  cover (imagem), gallery (lista de imagens), tour360_url?, description?
}
```

> Se o volume de projetos novos for baixo, talvez **não valha** um CMS — basta me pedir
> pra adicionar projetos no `content.jsx`. Decidir conforme a frequência de atualização.

---

## FASE 3 — Extras (OPCIONAIS)

- **Analytics:** snippet de **Plausible** (privacy-friendly, sem cookies) ou GA4 no `index.html`.
  Não é back-end, mas é decisão de produto. Recomendo Plausible.
- **Newsletter / captura de lead:** se quiserem nutrir leads, integrar com
  Mailchimp/Brevo/Resend Audiences (mesma função serverless pode ter um `POST /api/subscribe`).
- **Otimização de imagens:** os renders são PNG/JPG pesados. Vale um passo de build que
  gere **WebP/AVIF** + tamanhos responsivos (`srcset`) — acelera muito o carregamento.
  Pode ser um script local rodado antes do deploy (não precisa de servidor).
- **WhatsApp:** se preferirem atendimento por WhatsApp, dá pra adicionar um botão
  `https://wa.me/55XXXXXXXXXXX?text=...` em vez de/junto com o formulário.

---

## 4. Topologia final e deploy

```
[ Navegador ]
      │  HTML/CSS/JS estático
      ▼
[ GitHub Pages ]  www.studiof03.com         ← front-end (já existe)
      │  fetch POST /api/contact  (CORS)
      ▼
[ Cloudflare Worker ]  api.studiof03.com     ← back-end (esta entrega)
      ├──► Resend  → e-mail p/ estúdio + auto-reply
      └──► D1/KV   → (opcional) registro do lead
```

### Passos de deploy do back-end
1. Criar o projeto do Worker/Function e implementar `POST /api/contact` conforme o contrato.
2. Configurar os **secrets** (seção 1.6) no painel do provedor.
3. Verificar o **domínio de e-mail** no Resend (SPF/DKIM/DMARC no DNS).
4. *(opcional)* Apontar um subdomínio `api.studiof03.com` para o Worker (CNAME/registro do provedor).
5. Definir `ALLOWED_ORIGIN` com a origem real do site.
6. Pegar a URL final e colocá-la na constante `API` do front-end (seção 1.8).
7. Testar todos os critérios de aceite da Fase 1.

---

## 5. Resumo do que é obrigatório vs. opcional

| Item | Status | Esforço |
|---|---|---|
| **Endpoint `/api/contact` + e-mail + anti-spam** | **Obrigatório** | Baixo–médio |
| Verificação de domínio de e-mail (SPF/DKIM/DMARC) | **Obrigatório** | Baixo |
| Edição do front-end (form real + honeypot) | **Obrigatório** | Baixo |
| CMS de portfólio | Opcional | Médio |
| Analytics | Opcional | Muito baixo |
| Otimização de imagens | Recomendado | Baixo |
| Newsletter / WhatsApp | Opcional | Baixo |

---

*Sem o back-end da Fase 1, o site funciona e fica bonito no ar — mas o formulário não envia
nada. A Fase 1 é o mínimo para captar contatos de verdade. As demais fases são evolução.*
