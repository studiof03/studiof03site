/**
 * STUDIO F03 — Back-end do formulário de contato (Cloudflare Worker)
 * ------------------------------------------------------------------
 * Endpoint:  POST /api/contact
 * Faz: validação server-side, anti-spam (honeypot + Turnstile opcional),
 *      rate-limit por IP (opcional, via KV), e dispara 2 e-mails pelo Resend
 *      (notificação para o estúdio + auto-reply para o lead, em PT ou EN).
 *
 * Variáveis (wrangler.toml [vars] + secrets):
 *   TO_EMAIL          (vars)   e-mail que recebe os leads
 *   FROM_EMAIL        (vars)   remetente (domínio verificado no Resend)
 *   ALLOWED_ORIGIN    (vars)   origens liberadas no CORS, separadas por vírgula
 *   RESEND_API_KEY    (secret) chave da API do Resend
 *   TURNSTILE_SECRET  (secret, opcional) ativa o captcha Turnstile se presente
 *   RATE_LIMIT        (KV binding, opcional) ativa rate-limit por IP
 *
 * Spec completa: ../Backend - Handoff Claude Code.md
 */

// Serviços aceitos (têm que bater exatamente com content.jsx — PT e EN).
const ALLOWED_SERVICES = new Set([
  'Imagens 3D', 'Animação', 'Tour 360°', 'Pacote completo', // PT
  '3D Stills', 'Animation', '360° Tour', 'Full package',     // EN
]);

const MAX_BODY_BYTES = 16 * 1024;   // rejeita payloads > ~16 KB
const RATE_MAX = 5;                 // nº de envios permitidos
const RATE_WINDOW_S = 600;          // por janela de 10 min

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin, env);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // Só aceitamos POST em /api/contact
    const url = new URL(request.url);
    if (request.method !== 'POST' || !url.pathname.endsWith('/api/contact')) {
      return json({ ok: false, error: 'not_found' }, 404, cors);
    }

    // CORS: bloqueia origem não autorizada (quando há Origin definido).
    if (origin && !isAllowedOrigin(origin, env)) {
      return json({ ok: false, error: 'forbidden_origin' }, 403, cors);
    }

    // Tamanho do corpo
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json({ ok: false, error: 'too_large' }, 413, cors);
    }

    let data;
    try {
      data = JSON.parse(raw || '{}');
    } catch {
      return json({ ok: false, error: 'validation', fields: ['_body'] }, 400, cors);
    }

    // ---- Honeypot: se preenchido, é bot → descarta silenciosamente ----
    if (data.company_site && String(data.company_site).trim() !== '') {
      // Resposta de sucesso "fake" para não dar pista ao bot, sem enviar e-mail.
      return json({ ok: true }, 200, cors);
    }

    // ---- Validação ----
    const fields = [];
    const name = clean(data.name);
    const company = clean(data.company);
    const email = clean(data.email);
    const service = clean(data.service);
    const message = clean(data.message);
    const lang = data.lang === 'en' ? 'en' : 'pt';

    if (name.length < 2 || name.length > 120) fields.push('name');
    if (!isEmail(email) || email.length > 200) fields.push('email');
    if (company.length > 160) fields.push('company');
    if (!ALLOWED_SERVICES.has(service)) fields.push('service');
    if (message.length < 5 || message.length > 4000) fields.push('message');

    if (fields.length) {
      return json({ ok: false, error: 'validation', fields }, 400, cors);
    }

    // ---- Turnstile (opcional) ----
    if (env.TURNSTILE_SECRET) {
      const ok = await verifyTurnstile(env.TURNSTILE_SECRET, data.turnstile_token, request);
      if (!ok) return json({ ok: false, error: 'spam' }, 403, cors);
    }

    // ---- Rate-limit por IP (opcional, requer KV binding RATE_LIMIT) ----
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (env.RATE_LIMIT) {
      const key = `rl:${ip}`;
      const count = parseInt((await env.RATE_LIMIT.get(key)) || '0', 10);
      if (count >= RATE_MAX) {
        return json({ ok: false, error: 'rate_limited' }, 429, cors);
      }
      // incrementa com expiração da janela
      await env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: RATE_WINDOW_S });
    }

    // ---- Envio dos e-mails ----
    if (!env.RESEND_API_KEY) {
      return json({ ok: false, error: 'server', detail: 'missing RESEND_API_KEY' }, 500, cors);
    }

    const when = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const lead = { name, company, email, service, message, lang, ip, when };

    try {
      // (a) Notificação para o estúdio
      await sendEmail(env, {
        to: env.TO_EMAIL,
        replyTo: email,
        subject: `Novo orçamento — ${name}${company ? ' / ' + company : ''}`,
        html: studioEmailHtml(lead),
        text: studioEmailText(lead),
      });

      // (b) Auto-reply para o lead (no idioma escolhido)
      const ar = autoReply(lang, name);
      await sendEmail(env, {
        to: email,
        replyTo: env.TO_EMAIL,
        subject: ar.subject,
        html: ar.html,
        text: ar.text,
      });
    } catch (e) {
      return json({ ok: false, error: 'server', detail: String(e && e.message || e) }, 500, cors);
    }

    return json({ ok: true }, 200, cors);
  },
};

/* ----------------------- helpers ----------------------- */

function clean(v) {
  return (v == null ? '' : String(v)).trim();
}

function isEmail(s) {
  // Regex pragmática (não exaustiva, mas segura para validação de form).
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}

function allowedOrigins(env) {
  return (env.ALLOWED_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function isAllowedOrigin(origin, env) {
  const list = allowedOrigins(env);
  if (list.includes(origin)) return true;
  // Libera previews do GitHub Pages e localhost durante o desenvolvimento.
  if (/^https:\/\/[a-z0-9-]+\.github\.io$/i.test(origin)) return true;
  if (/^http:\/\/localhost(:\d+)?$/i.test(origin)) return true;
  if (/^http:\/\/127\.0\.0\.1(:\d+)?$/i.test(origin)) return true;
  return false;
}

function corsHeaders(origin, env) {
  const allow = origin && isAllowedOrigin(origin, env)
    ? origin
    : (allowedOrigins(env)[0] || '*');
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors },
  });
}

async function verifyTurnstile(secret, token, request) {
  if (!token) return false;
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });
    const out = await r.json();
    return !!out.success;
  } catch {
    return false;
  }
}

async function sendEmail(env, { to, replyTo, subject, html, text }) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: [to],
      reply_to: replyTo,
      subject,
      html,
      text,
    }),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    throw new Error(`resend ${r.status}: ${detail}`);
  }
  return r.json().catch(() => ({}));
}

/* ----------------------- e-mails ----------------------- */

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const BRAND_BG = '#14101C';
const BRAND_GRAD = 'linear-gradient(90deg,#7C3AED,#DB2777)';

function studioEmailHtml(l) {
  const row = (k, v) => `
    <tr>
      <td style="padding:6px 0;color:#9aa;vertical-align:top;width:120px;font-size:13px;">${esc(k)}</td>
      <td style="padding:6px 0;color:#fff;font-size:14px;">${v}</td>
    </tr>`;
  return `<!doctype html><html><body style="margin:0;background:${BRAND_BG};font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <div style="height:4px;border-radius:4px;background:${BRAND_GRAD};margin-bottom:24px;"></div>
      <h1 style="color:#fff;font-size:18px;letter-spacing:.04em;text-transform:uppercase;margin:0 0 4px;">Novo orçamento</h1>
      <p style="color:#9aa;font-size:13px;margin:0 0 24px;">STUDIO F03 — formulário do site</p>
      <table style="width:100%;border-collapse:collapse;">
        ${row('Nome', esc(l.name))}
        ${l.company ? row('Empresa', esc(l.company)) : ''}
        ${row('E-mail', `<a href="mailto:${esc(l.email)}" style="color:#DB2777;">${esc(l.email)}</a>`)}
        ${row('Serviço', esc(l.service))}
        ${row('Mensagem', esc(l.message).replace(/\n/g, '<br>'))}
        ${row('Idioma', l.lang === 'en' ? 'EN' : 'PT')}
        ${row('Quando', esc(l.when) + ' (BRT)')}
        ${row('IP', esc(l.ip))}
      </table>
      <p style="color:#667;font-size:12px;margin-top:28px;">Responda este e-mail para falar direto com o lead (Reply-To configurado).</p>
    </div>
  </body></html>`;
}

function studioEmailText(l) {
  return [
    'NOVO ORÇAMENTO — STUDIO F03',
    '',
    `Nome:     ${l.name}`,
    l.company ? `Empresa:  ${l.company}` : null,
    `E-mail:   ${l.email}`,
    `Serviço:  ${l.service}`,
    `Idioma:   ${l.lang === 'en' ? 'EN' : 'PT'}`,
    `Quando:   ${l.when} (BRT)`,
    `IP:       ${l.ip}`,
    '',
    'Mensagem:',
    l.message,
  ].filter(Boolean).join('\n');
}

function autoReply(lang, name) {
  const wrap = (title, body) => `<!doctype html><html><body style="margin:0;background:${BRAND_BG};font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:36px 24px;">
      <div style="height:4px;border-radius:4px;background:${BRAND_GRAD};margin-bottom:28px;"></div>
      <h1 style="color:#fff;font-size:20px;letter-spacing:.04em;text-transform:uppercase;margin:0 0 16px;">${esc(title)}</h1>
      <div style="color:#cfc9d8;font-size:15px;line-height:1.6;">${body}</div>
      <p style="color:#fff;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;font-size:13px;margin-top:32px;">STUDIO F03</p>
      <p style="color:#667;font-size:12px;margin-top:4px;">Archviz para Real Estate · studiof03.com</p>
    </div>
  </body></html>`;

  if (lang === 'en') {
    const body = `<p>Hi ${esc(name)},</p>
      <p>Thank you for reaching out to STUDIO F03. We've received your message and will get back to you within <strong>one business day</strong> with a quote and timeline.</p>
      <p>In the meantime, feel free to reply to this email with any extra details about your development.</p>`;
    return {
      subject: 'We got your message — STUDIO F03',
      html: wrap('We got your message', body),
      text: `Hi ${name},\n\nThank you for reaching out to STUDIO F03. We've received your message and will get back to you within one business day with a quote and timeline.\n\nFeel free to reply with any extra details.\n\nSTUDIO F03\nArchviz for Real Estate · studiof03.com`,
    };
  }
  const body = `<p>Olá ${esc(name)},</p>
    <p>Obrigado por entrar em contato com o STUDIO F03. Recebemos a sua mensagem e retornaremos em <strong>até 1 dia útil</strong> com orçamento e prazo.</p>
    <p>Se quiser, responda este e-mail com mais detalhes sobre o empreendimento.</p>`;
  return {
    subject: 'Recebemos seu contato — STUDIO F03',
    html: wrap('Recebemos seu contato', body),
    text: `Olá ${name},\n\nObrigado por entrar em contato com o STUDIO F03. Recebemos a sua mensagem e retornaremos em até 1 dia útil com orçamento e prazo.\n\nSe quiser, responda este e-mail com mais detalhes sobre o empreendimento.\n\nSTUDIO F03\nArchviz para Real Estate · studiof03.com`,
  };
}
