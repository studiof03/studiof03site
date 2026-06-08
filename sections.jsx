/* STUDIO F03 website — sections */
const { useState: useS, useEffect: useE, useRef: useR } = React;

/* ---------------- HERO ---------------- */
function Hero({ onNav }) {
  const { lang, t } = useLang();
  const h = t.hero;
  return (
    <section className="hero" id="top">
      <DotField className="hero__dots" cols={26} center="left" min={0.05} max={0.42} opacity={0.95} reactive />
      <div className="hero__veil" />
      <div className="wrap hero__inner">
        <h1>{h.title}</h1>
        <p className="hero__sub">{h.sub}</p>
        <div className="hero__cta">
          <Button variant="brand" size="lg" icon="arrow-right" onClick={() => onNav('work')}>{h.ctaWork}</Button>
          <div className="on-dark"><Button variant="ghost" size="lg" onClick={() => onNav('contact')}>{h.ctaQuote}</Button></div>
        </div>
      </div>
      <div className="hero__meta">
        <div className="wrap">
          {h.meta.map(([n, l]) =>
          <div className="hero__metaItem" key={l}>
              <div className="hero__metaNum">{n}</div>
              <div className="hero__metaLbl">{l}</div>
            </div>
          )}
          <div className="hero__scroll">{h.scroll}<i /></div>
        </div>
      </div>
    </section>);

}

/* ---------------- CLIENTS ---------------- */
function ClientStrip() {
  const { t } = useLang();
  const names = ['VILAURBE', 'TERRE URBANISMO', 'LAJE ARQUITETURA', 'ESTUDIO FAGULHA', 'TELESIL', 'TETO ARQUITETURA'];
  return (
    <section className="clients">
      <div className="wrap clients__row">
        <span className="clients__lbl">{t.clients.label}</span>
        {names.map((n) => <span key={n} className="clients__name">{n}</span>)}
      </div>
    </section>);

}

/* ---------------- SERVICES ---------------- */
function Services() {
  const { t } = useLang();
  const s = t.services;
  return (
    <section className="services" id="services">
      <div className="wrap">
        <div className="shead reveal">
          <span className="eyebrow">{s.eyebrow}</span>
          <h2>{s.title}</h2>
          <p>{s.desc}</p>
        </div>
        <div className="svc-grid">
          {s.items.map((it, i) =>
          <div className="svc reveal" key={it.title} style={{ transitionDelay: i * 90 + 'ms' }}>
              <div className="svc__icn"><Icon name={it.icon} size={26} stroke={2} color="#fff" /></div>
              <h3>{it.title}</h3>
              <p>{it.desc}</p>
              <ul className="svc__list">{it.list.map((l) => <li key={l}>{l}</li>)}</ul>
            </div>
          )}
        </div>
      </div>
    </section>);

}

/* ---------------- WORK ---------------- */
function FeedItem({ item, idx, onOpen }) {
  const { t } = useLang();
  return (
    <button className={`feed__item reveal${item.light ? ' feed__item--light' : ''}`} onClick={() => onOpen(idx)} aria-label={t.work.open}>
      <img src={item.src} alt={item.name} loading="lazy" style={{ aspectRatio: item.r }} />
      <span className="feed__scrim">
        <span className="feed__tag">{t.work.tags[item.cat]}</span>
        <span className="feed__name">{item.name}</span>
      </span>
      <span className="feed__open"><Icon name="maximize-2" size={17} color="#fff" /></span>
    </button>);

}

function Lightbox({ items, index, onClose, onNav }) {
  const { t } = useLang();
  const item = items[index];
  useE(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();else
      if (e.key === 'ArrowRight') onNav(1);else
      if (e.key === 'ArrowLeft') onNav(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {document.removeEventListener('keydown', onKey);document.body.style.overflow = '';};
  }, [index]);
  return (
    <div className="lb" onClick={onClose}>
      <button className="lb__close" onClick={onClose} aria-label="Fechar"><Icon name="x" size={24} color="#fff" /></button>
      <button className="lb__nav lb__nav--l" onClick={(e) => {e.stopPropagation();onNav(-1);}} aria-label="←"><Icon name="chevron-left" size={28} color="#fff" /></button>
      <figure className="lb__stage" onClick={(e) => e.stopPropagation()}>
        <img src={item.src} alt={item.name} />
        <figcaption className="lb__cap">
          <span className="feed__tag">{t.work.tags[item.cat]}</span>
          <span className="lb__name">{item.name}</span>
          <span className="lb__count">{String(index + 1).padStart(2, '0')} {t.work.counter} {String(items.length).padStart(2, '0')}</span>
        </figcaption>
      </figure>
      <button className="lb__nav lb__nav--r" onClick={(e) => {e.stopPropagation();onNav(1);}} aria-label="→"><Icon name="chevron-right" size={28} color="#fff" /></button>
    </div>);

}

function Work() {
  const { t } = useLang();
  const [cat, setCat] = useS('all');
  const [lb, setLb] = useS(-1);
  const shown = FEED.filter((it) => cat === 'all' || it.cat === cat);
  const navLb = (d) => setLb((i) => (i + d + shown.length) % shown.length);
  return (
    <section className="work" id="work">
      <div className="wrap">
        <div className="work__head">
          <div className="reveal">
            <span className="eyebrow">{t.work.eyebrow}</span>
            <h2 style={{ fontFamily: 'var(--font-title)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.03em', lineHeight: 1.04, fontSize: 'clamp(30px,3.8vw,52px)', color: 'var(--fg1)', margin: '20px 0 0', maxWidth: '16ch' }}>{t.work.title}</h2>
          </div>
          <div className="filters reveal">
            {t.work.cats.map(([k, label]) =>
            <button key={k} className={`filter${k === cat ? ' filter--active' : ''}`} onClick={() => setCat(k)}>{label}</button>
            )}
          </div>
        </div>
        <div className="feed">
          {shown.map((it, i) => <FeedItem key={it.src} item={it} idx={i} onOpen={setLb} />)}
        </div>
      </div>
      {lb >= 0 && <Lightbox items={shown} index={lb} onClose={() => setLb(-1)} onNav={navLb} />}
    </section>);

}

/* ---------------- PROCESS ---------------- */
function Process() {
  const { t } = useLang();
  const p = t.process;
  return (
    <section className="process" id="process">
      <div className="wrap">
        <div className="shead reveal">
          <span className="eyebrow">{p.eyebrow}</span>
          <h2>{p.title}</h2>
        </div>
        <div className="steps">
          {p.steps.map((s, i) =>
          <div className="step reveal" key={s.t} style={{ transitionDelay: i * 90 + 'ms' }}>
              <div className="step__n">{i + 1}</div>
              <h4>{s.t}</h4>
              <p>{s.d}</p>
            </div>
          )}
        </div>
      </div>
    </section>);

}

/* ---------------- ABOUT / FOUNDER ---------------- */
function About() {
  const { lang, t } = useLang();
  const a = t.about;
  return (
    <section className="about" id="about">
      <div className="wrap about__grid">
        <div className="about__media reveal">
          <DotField className="hero__dots" cols={12} center="mid" opacity={0.55} />
          <img className="about__photo" src="renders/vitor.jpg" alt={a.name} />
          <div className="about__badge">
            <div className="n">{a.name}</div>
            <div className="r">{a.role}</div>
          </div>
        </div>
        <div className="about__body reveal">
          <span className="eyebrow">{a.eyebrow}</span>
          <h2>{a.title}</h2>
          <p>{a.p1}</p>
          <p>{a.p2}</p>
          <div className="about__quote">{a.quote}</div>
        </div>
      </div>
    </section>);

}

/* ---------------- TOUR 360 (embedded virtual tours) ---------------- */
function Pano() {
  const { t } = useLang();
  const tr = t.tour;
  const [scene, setScene] = useS(0);
  const [loaded, setLoaded] = useS(() => ({ 0: true }));

  // lazily mount an iframe the first time its scene is shown, then keep it
  // mounted (display toggle) so switching back doesn't reload the tour.
  const show = (i) => {setScene(i);setLoaded((l) => l[i] ? l : { ...l, [i]: true });};

  return (
    <div>
      <div className="pano">
        <DotField className="pano__bg" cols={20} center="mid" opacity={0.42} />
        {TOURS.map((url, i) =>
        loaded[i] ?
        <iframe key={i} className="pano__frame" src={url} title={tr.scenes[i]}
        style={{ display: i === scene ? 'block' : 'none' }}
        referrerPolicy="origin"
        allow="fullscreen *; autoplay *; screen-wake-lock *; geolocation *; accelerometer *; gyroscope *; xr-spatial-tracking *; vr *; web-share *;"
        allowFullScreen /> :
        null
        )}
        <div className="pano__hint"><Icon name="move-3d" size={15} color="#fff" />{tr.hint}</div>
      </div>
      <div className="tour__scenes">
        {tr.scenes.map((sc, i) =>
        <button key={sc} className={`scene${i === scene ? ' on' : ''}`} onClick={() => show(i)}>{sc}</button>
        )}
      </div>
    </div>);

}

function Tour() {
  const { t } = useLang();
  const tr = t.tour;
  return (
    <section className="tour" id="tour">
      <div className="wrap">
        <div className="tour__head reveal">
          <span className="eyebrow">{tr.eyebrow}</span>
          <h2>{tr.title}</h2>
          <p>{tr.desc}</p>
        </div>
        <div className="reveal"><Pano /></div>
      </div>
    </section>);

}

/* ---------------- CTA ---------------- */
function CTA({ onNav }) {
  const { t } = useLang();
  return (
    <section className="cta">
      <DotField className="cta__dots" cols={22} center="right" opacity={0.5} />
      <div className="cta__veil" />
      <div className="wrap cta__inner">
        <h2>{t.cta.title}</h2>
        <div className="on-dark" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Button variant="brand" size="lg" icon="arrow-right" onClick={() => onNav('contact')}>{t.cta.quote}</Button>
          <Button variant="ghost" size="lg" href="https://instagram.com/studio_f03">@studio_f03</Button>
        </div>
      </div>
    </section>);

}

/* ---------------- CONTACT ---------------- */
function Contact() {
  const { t, lang } = useLang();
  const c = t.contact;
  const [sent, setSent] = useS(false);
  const [sending, setSending] = useS(false);
  const [err, setErr] = useS(false);

  // Turnstile (captcha anti-bot) — só ativa se window.F03_CONFIG.turnstileSiteKey existir.
  const tsRef = useR(null);
  const tsWidgetId = useR(null);
  const siteKey = (window.F03_CONFIG || {}).turnstileSiteKey || '';

  useE(() => {
    if (!siteKey) return;
    window.__f03_ts_token = '';
    // Carrega o script do Turnstile uma única vez.
    if (!document.querySelector('script[data-f03-turnstile]')) {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true; s.defer = true; s.setAttribute('data-f03-turnstile', '1');
      document.head.appendChild(s);
    }
    let tries = 0;
    const iv = setInterval(() => {
      tries++;
      if (window.turnstile && tsRef.current && tsWidgetId.current == null) {
        tsWidgetId.current = window.turnstile.render(tsRef.current, {
          sitekey: siteKey,
          theme: 'dark',
          callback: (tok) => { window.__f03_ts_token = tok; },
          'expired-callback': () => { window.__f03_ts_token = ''; },
          'error-callback': () => { window.__f03_ts_token = ''; },
        });
        clearInterval(iv);
      }
      if (tries > 100) clearInterval(iv); // ~20s de desistência
    }, 200);
    return () => clearInterval(iv);
  }, [siteKey]);

  async function handleSubmit(e) {
    e.preventDefault();
    const el = e.target.elements;
    const payload = {
      name: el['name'].value.trim(),
      company: el['company'].value.trim(),
      email: el['email'].value.trim(),
      service: el['service'].value,
      message: el['message'].value.trim(),
      lang,
      company_site: el['company_site'].value, // honeypot — deve vir vazio
      turnstile_token: window.__f03_ts_token || '',
    };
    const cfg = window.F03_CONFIG || {};
    // Sem back-end configurado ainda: modo demonstração (mostra sucesso, não envia).
    if (!cfg.apiUrl) {
      console.warn('[F03] window.F03_CONFIG.apiUrl não configurado — formulário em modo demo (nada foi enviado).');
      setSent(true);
      return;
    }
    setErr(false);
    setSending(true);
    try {
      const r = await fetch(cfg.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error('request_failed');
      setSent(true);
    } catch (_) {
      setErr(true);
      // token do Turnstile é de uso único: reseta para permitir nova tentativa
      if (window.turnstile && tsWidgetId.current != null) {
        try { window.turnstile.reset(tsWidgetId.current); } catch (e) {}
      }
      window.__f03_ts_token = '';
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="contact" id="contact">
      <div className="wrap contact__grid">
        <div className="reveal">
          <span className="eyebrow">{c.eyebrow}</span>
          <h2 className="contact__h">{c.title}</h2>
          <p className="contact__p">{c.desc}</p>
          <div className="contact__info">
            <a href="mailto:contato@studiof03.com"><Icon name="mail" size={18} color="var(--accent)" />contato@studiof03.com</a>
            <a href="https://www.linkedin.com/company/studio-f-zero3/?viewAsMember=true" target="_blank" rel="noreferrer"><Icon name="linkedin" size={18} color="var(--accent)" />Studio F03</a>
            <a href="https://instagram.com/studio_f03" target="_blank" rel="noreferrer"><Icon name="instagram" size={18} color="var(--accent)" />@studio_f03</a>
          </div>
        </div>
        <div className="reveal">
          {sent ?
          <div className="f03-card" style={{ padding: 48, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={30} color="#fff" stroke={2.6} /></div>
              <h3 style={{ fontFamily: 'var(--font-title)', textTransform: 'uppercase', letterSpacing: '.03em', fontSize: 22, margin: 0 }}>{c.okTitle}</h3>
              <p style={{ color: 'var(--fg2)', margin: 0 }}>{c.okText}</p>
            </div> :

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-row">
                <div className="f03-field"><label className="f03-label">{c.fields.name}</label><input name="name" className="f03-input" required placeholder={c.fields.namePh} /></div>
                <div className="f03-field"><label className="f03-label">{c.fields.company}</label><input name="company" className="f03-input" placeholder={c.fields.companyPh} /></div>
              </div>
              <div className="f03-field"><label className="f03-label">{c.fields.email}</label><input name="email" className="f03-input" type="email" required placeholder={c.fields.emailPh} /></div>
              <div className="f03-field"><label className="f03-label">{c.fields.service}</label>
                <select name="service" className="f03-select">{c.services.map((s) => <option key={s}>{s}</option>)}</select>
              </div>
              <div className="f03-field"><label className="f03-label">{c.fields.message}</label><textarea name="message" className="f03-textarea" rows="3" required placeholder={c.fields.messagePh} /></div>
              {/* honeypot anti-spam: invisível ao usuário, bots tendem a preencher */}
              <input type="text" name="company_site" tabIndex="-1" autoComplete="off" aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
              {/* Turnstile: container só visível quando há sitekey configurada */}
              {siteKey && <div ref={tsRef} style={{ minHeight: 65 }} />}
              {err && <p style={{ color: 'var(--error)', margin: 0, fontSize: 14 }}>{lang === 'pt' ? 'Não foi possível enviar agora. Tente novamente ou escreva para contato@studiof03.com.' : 'Could not send right now. Please try again or email contato@studiof03.com.'}</p>}
              <Button variant="brand" size="lg" icon="arrow-right" type="submit" disabled={sending}>{sending ? (lang === 'pt' ? 'Enviando…' : 'Sending…') : c.send}</Button>
            </form>
          }
        </div>
      </div>
    </section>);

}

Object.assign(window, { Hero, ClientStrip, Services, Work, Process, About, Tour, CTA, Contact });