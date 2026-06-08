/* STUDIO F03 — dot-field motif renderer
   Draws the brand's signature grid of size-varying circles ("ripples
   from a center"). Reusable across site hero, deck backgrounds, cards.

   Usage: <canvas data-f03-dots data-cols="14" data-color="brand"></canvas>
   Options (data-*):
     cols      number of columns (rows derived from aspect)   default 14
     color     "brand" | "warm" | "ink" | "white" | css color  default brand
     min,max   dot radius fraction of cell (0..0.5)  default .08 / .46
     center    "left"|"mid"|"right" focus of the ripple        default left
     opacity   0..1 global alpha                                default 1
*/
(function () {
  function hexLerp(a, b, t) {
    const pa = [parseInt(a.slice(1,3),16),parseInt(a.slice(3,5),16),parseInt(a.slice(5,7),16)];
    const pb = [parseInt(b.slice(1,3),16),parseInt(b.slice(3,5),16),parseInt(b.slice(5,7),16)];
    return `rgb(${pa.map((c,i)=>Math.round(c+(pb[i]-c)*t)).join(',')})`;
  }
  function fillFor(kind, fy) {
    // fy: 0 (top) .. 1 (bottom) -> follow brand gradient
    if (kind === 'warm')  return hexLerp(hexLerp('#C03B17','#E65D0E',Math.min(1,fy*2)), '#F6DD00', Math.max(0,fy*2-1));
    if (kind === 'ink')   return '#14101C';
    if (kind === 'white') return '#FFFFFF';
    if (kind && kind[0] === '#') return kind;
    // brand: roxo -> violeta -> magenta
    return fy < 0.5 ? hexLerp('#432985','#4C4196',fy*2) : hexLerp('#4C4196','#B0234D',(fy-0.5)*2);
  }
  function draw(cv) {
    const dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    cv.width = w * dpr; cv.height = h * dpr;
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0,0,w,h);
    const cols = +(cv.dataset.cols || 14);
    const cell = w / cols;
    const rows = Math.ceil(h / cell);
    const kind = cv.dataset.color || 'brand';
    const minR = parseFloat(cv.dataset.min || 0.08);
    const maxR = parseFloat(cv.dataset.max || 0.46);
    ctx.globalAlpha = parseFloat(cv.dataset.opacity || 1);
    const cx = cv.dataset.center === 'right' ? cols : cv.dataset.center === 'mid' ? cols/2 : 0;
    const cy = rows/2;
    const maxD = Math.hypot(Math.max(cx,cols-cx), rows);
    for (let r=0; r<rows; r++) {
      for (let c=0; c<cols; c++) {
        const d = Math.hypot(c-cx, r-cy) / maxD;      // 0 at center .. 1 far
        // ripple: concentric size waves growing outward
        const wave = 0.5 + 0.5*Math.sin(d*Math.PI*3.2 - 0.6);
        const rad = (minR + (maxR-minR)*wave) * cell;
        const fy = r/(rows-1||1);
        ctx.fillStyle = fillFor(kind, fy);
        ctx.beginPath();
        ctx.arc(c*cell + cell/2, r*cell + cell/2, rad, 0, Math.PI*2);
        ctx.fill();
      }
    }
  }
  function init() {
    document.querySelectorAll('canvas[data-f03-dots]').forEach(draw);
  }

  /* ---- interactive (mouse-reactive) field ----
     Dots near the pointer push away from it and swell, then spring back.
     Returns a cleanup() fn. Pointer is tracked on the canvas's parent so
     hovering over content layered above the canvas still registers. */
  function buildDots(w, h, o) {
    const cols = +(o.cols || 14);
    const cell = w / cols;
    const rows = Math.ceil(h / cell);
    const kind = o.color || 'brand';
    const minR = o.min != null ? +o.min : 0.08;
    const maxR = o.max != null ? +o.max : 0.46;
    const cx = o.center === 'right' ? cols : o.center === 'mid' ? cols / 2 : 0;
    const cy = rows / 2;
    const maxD = Math.hypot(Math.max(cx, cols - cx), rows);
    const dots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const d = Math.hypot(c - cx, r - cy) / maxD;
        const wave = 0.5 + 0.5 * Math.sin(d * Math.PI * 3.2 - 0.6);
        const rad = (minR + (maxR - minR) * wave) * cell;
        const fy = r / (rows - 1 || 1);
        dots.push({ bx: c * cell + cell / 2, by: r * cell + cell / 2, br: rad, fill: fillFor(kind, fy), ox: 0, oy: 0, rx: 0 });
      }
    }
    return { dots, cell };
  }

  function interactive(cv, o) {
    o = o || {};
    const ctx = cv.getContext('2d');
    const alpha = o.opacity != null ? +o.opacity : 1;
    const mouse = { x: -1e5, y: -1e5, active: false };
    let w = 0, h = 0, dots = [], cell = 0, influence = 160, push = 26, raf = 0;
    function resize() {
      w = cv.clientWidth; h = cv.clientHeight;
      if (!w || !h) return;
      const dpr = window.devicePixelRatio || 1;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const built = buildDots(w, h, o); dots = built.dots; cell = built.cell;
      influence = o.influence || Math.max(130, cell * 2.6);
      push = o.push || cell * 0.95;
    }
    function frame() {
      raf = requestAnimationFrame(frame);
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = alpha;
      for (const dt of dots) {
        let tox = 0, toy = 0, trx = 0;
        if (mouse.active) {
          const dx = dt.bx - mouse.x, dy = dt.by - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < influence) {
            const f = 1 - dist / influence, ff = f * f, inv = dist > 0.01 ? 1 / dist : 0;
            tox = dx * inv * push * ff; toy = dy * inv * push * ff; trx = dt.br * 0.85 * ff;
          }
        }
        dt.ox += (tox - dt.ox) * 0.16;
        dt.oy += (toy - dt.oy) * 0.16;
        dt.rx += (trx - dt.rx) * 0.16;
        ctx.fillStyle = dt.fill;
        ctx.beginPath();
        ctx.arc(dt.bx + dt.ox, dt.by + dt.oy, Math.max(0.5, dt.br + dt.rx), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    function onMove(e) {
      const rect = cv.getBoundingClientRect();
      const sx = rect.width ? cv.clientWidth / rect.width : 1;
      const sy = rect.height ? cv.clientHeight / rect.height : 1;
      mouse.x = (e.clientX - rect.left) * sx;
      mouse.y = (e.clientY - rect.top) * sy;
      mouse.active = true;
    }
    function onLeave() { mouse.active = false; }
    resize();
    raf = requestAnimationFrame(frame);
    const host = o.pointerTarget || cv.parentElement || cv;
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    let rt; const onResize = () => { clearTimeout(rt); rt = setTimeout(resize, 120); };
    window.addEventListener('resize', onResize);
    let io;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((es) => es.forEach((en) => {
        if (en.isIntersecting) { if (!raf) raf = requestAnimationFrame(frame); }
        else if (raf) { cancelAnimationFrame(raf); raf = 0; }
      }), { threshold: 0 });
      io.observe(cv);
    }
    return function cleanup() {
      if (raf) cancelAnimationFrame(raf);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', onResize);
      if (io) io.disconnect();
    };
  }

  window.F03Dots = { draw, init, interactive };
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
  let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(init, 120); });
})();
