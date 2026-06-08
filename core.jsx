/* STUDIO F03 website — core primitives + i18n (exported to window) */
const { useState, useEffect, useRef, useContext, createContext } = React;

/* ---------- language context ---------- */
const LangCtx = createContext({ lang: 'pt', t: {}, setLang: () => {} });
const useLang = () => useContext(LangCtx);

/* ---------- icon (Lucide) ---------- */
function Icon({ name, size = 20, stroke = 2, color, style, className }) {
  const ref = useRef(null);
  useEffect(() => {
    const pascal = String(name).split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
    const def = window.lucide && (window.lucide.icons[pascal] || window.lucide.icons[name]);
    if (!ref.current || !def) return;
    const node = window.lucide.createElement(def);
    node.setAttribute('width', size);node.setAttribute('height', size);
    node.setAttribute('stroke-width', stroke);
    if (color) node.setAttribute('stroke', color);
    ref.current.innerHTML = '';ref.current.appendChild(node);
  });
  return <span ref={ref} className={className} style={{ display: 'inline-flex', lineHeight: 0, ...style }} />;
}

/* ---------- brand dot-field ---------- */
/* Event-driven reactive renderer: dots push away from the pointer and swell,
   redrawn synchronously on pointermove (no requestAnimationFrame dependency,
   so it works even where rAF is throttled). */
function reactiveDots(el, o) {
  const ctx = el.getContext('2d');
  const lerp = (a, b, t) => {
    const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
    const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
    return `rgb(${pa.map((c, i) => Math.round(c + (pb[i] - c) * t)).join(',')})`;
  };
  const fillFor = (fy) => fy < 0.5 ? lerp('#432985', '#4C4196', fy * 2) : lerp('#4C4196', '#B0234D', (fy - 0.5) * 2);
  const alpha = o.opacity != null ? +o.opacity : 1;
  let w = 0,h = 0,dots = [],cell = 0,influence = 160,push = 26;
  const mouse = { x: -1e5, y: -1e5, active: false };

  function build() {
    w = el.clientWidth;h = el.clientHeight;
    if (!w || !h) return false;
    const dpr = window.devicePixelRatio || 1;
    el.width = w * dpr;el.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = +o.cols || 14;
    cell = w / cols;
    const rows = Math.ceil(h / cell);
    const cx = o.center === 'right' ? cols : o.center === 'mid' ? cols / 2 : 0;
    const cy = rows / 2;
    const maxD = Math.hypot(Math.max(cx, cols - cx), rows);
    const minR = o.min != null ? +o.min : 0.08,maxR = o.max != null ? +o.max : 0.46;
    dots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const d = Math.hypot(c - cx, r - cy) / maxD;
        const wave = 0.5 + 0.5 * Math.sin(d * Math.PI * 3.2 - 0.6);
        const rad = (minR + (maxR - minR) * wave) * cell;
        const fy = r / (rows - 1 || 1);
        dots.push({ bx: c * cell + cell / 2, by: r * cell + cell / 2, br: rad, fill: fillFor(fy) });
      }
    }
    influence = Math.max(150, cell * 2.8);
    push = cell * 1.05;
    return true;
  }
  function draw() {
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = alpha;
    for (const dt of dots) {
      let ox = 0,oy = 0,rx = 0;
      if (mouse.active) {
        const dx = dt.bx - mouse.x,dy = dt.by - mouse.y,dist = Math.hypot(dx, dy);
        if (dist < influence) {
          const f = 1 - dist / influence,ff = f * f,inv = dist > 0.01 ? 1 / dist : 0;
          ox = dx * inv * push * ff;oy = dy * inv * push * ff;rx = dt.br * 0.9 * ff;
        }
      }
      ctx.fillStyle = dt.fill;
      ctx.beginPath();
      ctx.arc(dt.bx + ox, dt.by + oy, Math.max(0.5, dt.br + rx), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const host = el.parentElement || el;
  const onMove = (e) => {
    const rect = el.getBoundingClientRect();
    const sx = rect.width ? el.clientWidth / rect.width : 1;
    const sy = rect.height ? el.clientHeight / rect.height : 1;
    mouse.x = (e.clientX - rect.left) * sx;mouse.y = (e.clientY - rect.top) * sy;mouse.active = true;
    draw();
  };
  const onLeave = () => {mouse.active = false;draw();};
  const tryBuild = () => {if (build()) draw();};
  tryBuild();
  const t1 = setTimeout(tryBuild, 80),t2 = setTimeout(tryBuild, 360);
  let rt;const onResize = () => {clearTimeout(rt);rt = setTimeout(tryBuild, 120);};
  window.addEventListener('resize', onResize);
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerleave', onLeave);
  return () => {
    clearTimeout(t1);clearTimeout(t2);clearTimeout(rt);
    window.removeEventListener('resize', onResize);
    host.removeEventListener('pointermove', onMove);
    host.removeEventListener('pointerleave', onLeave);
  };
}

function DotField({ cols = 14, color = 'brand', center = 'left', min = 0.08, max = 0.46, opacity = 1, interactive = false, reactive = false, className, style }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.F03Dots) return;
    if (reactive) {
      return reactiveDots(el, { cols, color, center, min, max, opacity });
    }
    el.dataset.cols = cols;el.dataset.color = color;el.dataset.center = center;
    el.dataset.min = min;el.dataset.max = max;el.dataset.opacity = opacity;
    el.setAttribute('data-f03-dots', '');
    const draw = () => window.F03Dots.draw(el);
    draw();
    const tm = setTimeout(draw, 60);
    return () => clearTimeout(tm);
  }, [cols, color, center, min, max, opacity, interactive, reactive]);
  return <canvas ref={ref} className={className} style={style} />;
}

/* ---------- user-fillable image (image-slot web component) ---------- */
function Slot({ id, placeholder, shape = 'rect', radius, fit = 'cover', src, style, className }) {
  const props = { id, shape, fit, class: className, style };
  if (radius != null) props.radius = String(radius);
  if (placeholder) props.placeholder = placeholder;
  if (src) props.src = src;
  return React.createElement('image-slot', props);
}

const ASSET = 'assets/';

/* ---------- button ---------- */
function Button({ variant = 'brand', size, children, icon, onClick, href, type, disabled }) {
  const cls = `f03-btn f03-btn--${variant}${size ? ' f03-btn--' + size : ''}`;
  const inner = <>{children}{icon && <Icon name={icon} size={16} stroke={2.4} />}</>;
  return href ?
  <a className={cls} href={href} onClick={onClick} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{inner}</a> :
  <button className={cls} onClick={onClick} type={type || 'button'} disabled={disabled} style={disabled ? { opacity: .6, pointerEvents: 'none' } : undefined}>{inner}</button>;
}

/* ---------- language toggle ---------- */
function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang">
      <button className={lang === 'pt' ? 'on' : ''} onClick={() => setLang('pt')}>PT</button>
      <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
    </div>);

}

/* ---------- nav ---------- */
function Nav({ solid, onNav }) {
  const { t } = useLang();
  const n = t.nav;
  const [open, setOpen] = useState(false);
  const go = (k) => {setOpen(false);onNav(k);};
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {document.body.style.overflow = '';};
  }, [open]);
  const onLight = solid && !open;
  return (
    <nav className={`nav${solid ? ' nav--solid' : ''}${open ? ' nav--open' : ''}`}>
      <div className="wrap nav__inner">
        <img className="nav__logo"
        src={ASSET + (onLight ? 'logo-symbol-color.png' : 'logo-symbol-white.png')}
        alt="STUDIO F03" onClick={() => go('top')} />
        <div className="nav__links">
          <button className="nav__link" onClick={() => onNav('work')}>{n.work}</button>
          <button className="nav__link" onClick={() => onNav('services')}>{n.services}</button>
          <button className="nav__link" onClick={() => onNav('process')}>{n.process}</button>
          <button className="nav__link" onClick={() => onNav('about')}>{n.studio}</button>
          <button className="nav__link" onClick={() => onNav('contact')}>{n.contact}</button>
          <LangToggle />
          <Button variant="brand" size="sm" icon="arrow-right" onClick={() => onNav('contact')}>{n.quote}</Button>
        </div>
        <div className="nav__mobileCtrls">
          <LangToggle />
          <button className="nav__burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <Icon name={open ? 'x' : 'menu'} size={26} color={onLight ? 'var(--fg1)' : '#fff'} />
          </button>
        </div>
      </div>
      <div className="nav__sheet" onClick={() => setOpen(false)}>
        <div className="nav__sheetInner" onClick={(e) => e.stopPropagation()}>
          <button className="nav__sheetLink" onClick={() => go('work')}>{n.work}</button>
          <button className="nav__sheetLink" onClick={() => go('services')}>{n.services}</button>
          <button className="nav__sheetLink" onClick={() => go('process')}>{n.process}</button>
          <button className="nav__sheetLink" onClick={() => go('about')}>{n.studio}</button>
          <button className="nav__sheetLink" onClick={() => go('contact')}>{n.contact}</button>
          <div className="nav__sheetCta on-dark"><Button variant="brand" size="lg" icon="arrow-right" onClick={() => go('contact')}>{n.quote}</Button></div>
        </div>
      </div>
    </nav>);

}

/* ---------- footer ---------- */
function Footer({ onNav }) {
  const { t } = useLang();
  const f = t.footer;
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <div style={{ maxWidth: 340 }}>
            <img className="footer__logo" src={ASSET + 'logo-full-white.png'} alt="STUDIO F03" />
            <p className="footer__intro">{f.intro}</p>
          </div>
          <div className="footer__col">
            <h5>{t.nav.services}</h5>
            <a onClick={() => onNav('services')}>{t.services.items[0].title}</a>
            <a onClick={() => onNav('services')}>{t.services.items[1].title}</a>
            <a onClick={() => onNav('services')}>{t.services.items[2].title}</a>
          </div>
          <div className="footer__col">
            <h5>{f.studio}</h5>
            <a onClick={() => onNav('work')}>{t.nav.work}</a>
            <a onClick={() => onNav('process')}>{t.nav.process}</a>
            <a onClick={() => onNav('about')}>{t.nav.studio}</a>
          </div>
          <div className="footer__col">
            <h5>{t.nav.contact}</h5>
            <a href="mailto:contato@studiof03.com">contato@studiof03.com</a>
            <a href="https://www.studiof03.com" target="_blank" rel="noreferrer">www.studiof03.com</a>
            <a href="https://instagram.com/studio_f03" target="_blank" rel="noreferrer">@studio_f03</a>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© 2026 STUDIO F03 — {f.rights}</span>
          <span>{f.tagline}</span>
        </div>
      </div>
    </footer>);

}

/* ---------- scroll reveal ---------- */
function useReveal(dep) {
  useEffect(() => {
    document.body.classList.add('js-ready');
    const els = [...document.querySelectorAll('.reveal:not(.in)')];
    if (!('IntersectionObserver' in window)) {els.forEach((e) => e.classList.add('in'));return;}
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {if (e.isIntersecting) {e.target.classList.add('in');io.unobserve(e.target);}});
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach((el) => io.observe(el));
    const safety = setTimeout(() => els.forEach((e) => e.classList.add('in')), 2600);
    return () => {io.disconnect();clearTimeout(safety);};
  }, [dep]);
}

Object.assign(window, { LangCtx, useLang, Icon, DotField, Slot, Button, LangToggle, Nav, Footer, useReveal, ASSET });