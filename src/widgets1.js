/* ===== Interaktív ábrák – 1. rész (áttekintés, alapozás átalakítása) ===== */
(function () {
const { $, $$, clamp, lerp, fmt, H, pct } = window.U;
const NS = 'http://www.w3.org/2000/svg';
let FSK = 1;   // betűnagyító: keskeny helyen a kicsinyített ábra feliratai olvashatók maradnak
const SV = (tag, a = {}, p) => { const e = document.createElementNS(NS, tag); let st = a.style || ''; if (tag === 'text' && a['font-size'] && FSK !== 1) a = { ...a, 'font-size': +(a['font-size'] * FSK).toFixed(2) }; for (const k in a) { if (k === 'style' || k === 'text') continue; const v = a[k]; if (typeof v === 'string' && v.includes('var(') && ['fill', 'stroke', 'stop-color', 'color'].includes(k)) st += `;${k}:${v}`; else e.setAttribute(k, v); } if (st) e.setAttribute('style', st); if (a.text != null) { if (String(a.text).includes('_{')) window.U.rich(e, a.text, a['font-size']); else e.textContent = a.text; } if (p) p.appendChild(e); return e; };
const svg = (host, w, h) => { const cw = host.clientWidth || Math.min(innerWidth - 56, w); FSK = clamp(w / cw / 1.3, 1, 1.4); const s = SV('svg', { viewBox: `0 0 ${w} ${h}`, class: 'svgbox', role: 'img' }); host.innerHTML = ''; host.appendChild(s); return s; };
/* átméretezéskor és fülváltáskor az ábrák újrarajzolódnak (a betűnagyító a tényleges szélességhez igazodik) */
{ let lw = innerWidth, tm = 0; const redraw = (root = document) => { $$('input[type=range]', root).forEach(r => r.dispatchEvent(new Event('input'))); $$('.stepper button.on, .seg button.on', root).forEach(b => { if (b.closest('#ktSteps, #injM')) b.click(); }); };
  addEventListener('resize', () => { if (Math.abs(innerWidth - lw) < 24) return; lw = innerWidth; clearTimeout(tm); tm = setTimeout(() => redraw(), 180); });
  addEventListener('tabchange', (e) => { const pane = document.querySelector(`.tabpane[data-group="${e.detail.group}"][data-tab="${e.detail.tab}"]`); if (pane) redraw(pane); }); }
window.SV = SV; window.mkSvg = svg;
const pat = (s) => { const d = SV('defs', {}, s);
  const mk = (id, bg, dots, r = 1.4, n = 26) => { const p = SV('pattern', { id, width: 16, height: 16, patternUnits: 'userSpaceOnUse' }, d); SV('rect', { width: 16, height: 16, fill: bg }, p); for (let i = 0; i < n / 6; i++) SV('circle', { cx: (i * 37) % 16, cy: (i * 23 + 5) % 16, r, fill: dots }, p); return p; };
  mk('pSand', '#dcbc78', '#b8934c', 1.2, 30); mk('pClay', '#8c735f', '#6f5949', 1.6, 18); mk('pGrav', '#bfae95', '#8c7a63', 2.6, 14); mk('pSoft', '#7e7464', '#625a4c', 1.5, 18); mk('pFill', '#a59682', '#7b6d5c', 2, 18);
  const g = SV('pattern', { id: 'pHatch', width: 8, height: 8, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, d); SV('rect', { width: 8, height: 8, fill: '#c9cdd0' }, g); SV('line', { x1: 0, y1: 0, x2: 0, y2: 8, stroke: '#9aa1a6', 'stroke-width': 2 }, g);
  return d; };
window.SVpat = pat;

/* ---------- módszerválasztó ---------- */
(function selector() {
  const root = $('#selector'); if (!root) return;
  const M = [
    { id: 'a', n: 'a) Kisebb talpnyomás', d: 'szélesebb alap – ha lejjebb kedvezőbb réteg van', href: '#alapozas', c: 'var(--teal)' },
    { id: 'b', n: 'b) Mélyebb alapsík', d: 'pár méteren belül teherbíró réteg, pince', href: '#alapozas', c: 'var(--teal)' },
    { id: 'c', n: 'c) Talajcsere', d: 'sekély probléma, talajvíz felett, 50–80 cm', href: '#talajcsere', c: 'var(--teal)' },
    { id: 'd1', n: 'Mélytömörítés (vibroflotáció)', d: 'laza szemcsés talaj, feltöltés', href: '#tomorites', c: 'var(--amber)' },
    { id: 'd2', n: 'Dinamikus tömörítés', d: 'nagy felület, laza-puha talaj, max. 5–7 m', href: '#tomorites', c: 'var(--amber)' },
    { id: 'd3', n: 'Kőtömzs', d: 'nagyon laza-puha talaj', href: '#tomorites', c: 'var(--amber)' },
    { id: 'd4', n: 'Kavicscölöp', d: 'lazább-puhább talaj, kötött talaj is', href: '#tomorites', c: 'var(--amber)' },
    { id: 'd5', n: 'Itatásos injektálás', d: 'szemcsés talaj, durva iszap; cementtel csak > 0,8–1 mm', href: '#szilarditas', c: 'var(--violet)' },
    { id: 'd6', n: 'Talajtömörítő injektálás', d: 'laza talaj, iszap és agyag is; meglévő épület alatt is', href: '#szilarditas', c: 'var(--violet)' },
    { id: 'd8', n: 'Repesztő/kompenzáló injektálás', d: 'süllyedéskompenzálás, épület visszaemelése', href: '#szilarditas', c: 'var(--violet)' },
    { id: 'd7', n: 'Tömegstabilizáció', d: 'tőzeg, puha agyag, max. ~7 m', href: '#szilarditas', c: 'var(--violet)' },
    { id: 'e', n: 'e) Előterhelés', d: 'telített, összenyomható kötött talaj, van idő', href: '#eloterheles', c: 'var(--coral)' },
    { id: 'f', n: 'f–g) Szerkezeti megoldás, építési sorrend', d: 'mindig kiegészítő eszköz', href: '#szerkezet', c: 'var(--coral)' },
    { id: 'h', n: 'h) Mélyalapozás', d: 'a jó teherbíró réteg mélyen van', href: '#szerkezet', c: 'var(--coral)' },
  ];
  const st = { soil: 'kotott', gw: 'felett', depth: 'kozepes', sit: 'uj', better: 'igen' };
  const score = (m) => {
    const { soil, gw, depth, sit, better } = st; let s = 0, why = [];
    const add = (v, w) => { s += v; if (w) why.push(w); };
    switch (m.id) {
      case 'a': add(better === 'igen' ? 2 : -3, better === 'igen' ? 'mélyebben jobb réteg van' : 'mélyebben rosszabb réteg → ronthat'); if (sit === 'meglevo') add(-3, 'meglévő épületnél nem'); break;
      case 'b': add(better === 'igen' && depth !== 'mely' ? 3 : -2, better === 'igen' ? 'pár méteren belül jobb réteg' : ''); if (sit === 'meglevo') add(-3); break;
      case 'c': add(depth === 'sekely' ? 3 : -2, depth === 'sekely' ? 'sekély probléma' : 'mély rétegnél drága'); add(gw === 'felett' ? 1 : -4, gw === 'felett' ? '' : 'talajvíz alatt nem tömöríthető'); if (sit === 'meglevo') add(-4); break;
      case 'd1': add(soil === 'szemcses' || soil === 'feltoltes' ? 3 : -3, soil === 'szemcses' ? 'laza szemcsés talaj' : soil === 'feltoltes' ? 'feltöltés' : 'kötött talajban hatástalan'); if (sit === 'meglevo') add(-3, 'rezgés a meglévő épület mellett'); break;
      case 'd2': add(['szemcses', 'feltoltes'].includes(soil) ? 2 : soil === 'kotott' ? 0 : -1); add(depth === 'mely' ? -2 : 1, depth === 'mely' ? 'max. 5–7 m' : ''); if (sit === 'meglevo') add(-4, 'erős rezgés – épület mellett nem'); break;
      case 'd3': add(soil === 'kotott' || soil === 'feltoltes' ? 2 : 0); if (sit === 'meglevo') add(-4); break;
      case 'd4': add(soil === 'kotott' ? 3 : soil === 'szerves' ? -1 : 1, soil === 'kotott' ? 'puha kötött talajhoz is' : ''); if (sit === 'meglevo') add(-2); break;
      case 'd5': add(soil === 'szemcses' ? 3 : soil === 'feltoltes' ? 1 : -2, soil === 'szemcses' ? 'a hézagokat tölti ki' : soil === 'feltoltes' ? '' : 'finom talajba nem jut be'); if (sit === 'meglevo') add(1, 'utólagos beavatkozás is'); break;
      case 'd6': add(soil === 'szerves' ? -2 : 1, soil === 'kotott' ? 'iszapban, agyagban is tömörít' : soil === 'szerves' ? '' : 'laza talajt tömörít'); if (sit === 'meglevo') add(3, 'meglévő épület alatt is'); break;
      case 'd8': add(sit === 'meglevo' ? 3 : -2, sit === 'meglevo' ? 'süllyedéskompenzálás, visszaemelés' : 'új építésnél ritka'); if (soil === 'szerves') add(-2); break;
      case 'd7': add(soil === 'szerves' ? 4 : soil === 'kotott' ? 1 : -1, soil === 'szerves' ? 'tőzeg, szerves talaj' : ''); add(depth === 'mely' ? -3 : 1, depth === 'mely' ? 'max. ~7 m' : ''); if (sit === 'meglevo') add(-4); break;
      case 'e': add(soil === 'kotott' || soil === 'szerves' ? 3 : 0, soil === 'kotott' || soil === 'szerves' ? 'összenyomható kötött talaj' : ''); if (sit === 'meglevo') add(-4); break;
      case 'f': add(2, 'mindig érdemes'); break;
      case 'h': add(depth === 'mely' ? 4 : better === 'nem' ? 2 : 0, depth === 'mely' ? 'mélyen van a jó réteg' : ''); if (sit === 'meglevo') add(0); break;
    }
    return { s, why };
  };
  const list = $('#selList');
  const draw = () => { const sc = M.map(m => ({ m, ...score(m) })).sort((a, b) => b.s - a.s); list.innerHTML = ''; sc.forEach(({ m, s, why }) => { const c = s >= 3 ? 'good' : s <= -1 ? 'bad' : ''; list.appendChild(H('div', { class: 'mi ' + c }, `<i class="d" style="background:${m.c}"></i><div><h5>${m.n}</h5><p>${why.filter(Boolean).join(' · ') || m.d}</p></div><a href="${m.href}">→</a>`)); }); };
  $$('[data-q]', root).forEach(g => window.U.seg(g, (v) => { st[g.dataset.q] = v; draw(); }));
  draw();
})();

/* ---------- A/B rétegződés: a feszültségbura eléri-e a mélyebb réteget? ---------- */
(function abFig() {
  const host = $('#abSvg'); if (!host) return; const r = $('#abB');
  const draw = () => {
    const B = +r.value; window.U.fillRange(r); $(`[data-for="abB"]`).textContent = fmt(B, 1) + ' m';
    const s = svg(host, 640, 300); pat(s);
    [['A', 0, 'url(#pClay)', 'url(#pSand)', 'puha agyag', 'homok', true], ['B', 330, 'url(#pSand)', 'url(#pClay)', 'homok', 'puha agyag', false]].forEach(([nm, ox, c1, c2, n1, n2, good]) => {
      const g = SV('g', { transform: `translate(${ox},0)` }, s); const k = 34, Y = 92, yB = Y + 2.2 * k, Hh = 300;
      SV('rect', { x: 0, y: Y, width: 310, height: 2.2 * k, fill: c1 }, g); SV('rect', { x: 0, y: yB, width: 310, height: Hh - yB, fill: c2 }, g);
      SV('text', { x: 8, y: Y + 18, text: n1, 'font-size': 12.5, 'font-weight': 700, class: 'hl' }, g); SV('text', { x: 8, y: Hh - 10, text: n2, 'font-size': 12.5, 'font-weight': 700, class: 'hl' }, g);
      const cx = 155, w = B * k; const depth = 1.25 * B * k; // a 0,2·q-s izobár kb. 1,2–1,3·B mélyre ér (négyzetes alap)
      const bulb = `M${cx - w / 2},${Y + 8} C${cx - w * 0.95},${Y + depth * 0.35} ${cx - w * 0.55},${Y + depth} ${cx},${Y + 8 + depth} C${cx + w * 0.55},${Y + depth} ${cx + w * 0.95},${Y + depth * 0.35} ${cx + w / 2},${Y + 8} Z`;
      const reach = Y + 8 + depth > yB; SV('path', { d: bulb, fill: reach ? (good ? '#39c2a5' : '#d4553a') : '#e5ae47', opacity: .5, stroke: reach ? (good ? '#0d7a68' : '#a63a23') : '#c2830c', 'stroke-width': 2 }, g);
      SV('rect', { x: cx - w / 2, y: Y, width: w, height: 8, fill: '#c3c7ca', stroke: '#4b5458' }, g); SV('rect', { x: cx - 7, y: Y - 26, width: 14, height: 26, fill: '#c3c7ca', stroke: '#4b5458' }, g);
      SV('text', { x: 0, y: 22, text: EN ? 'Case ' + nm : nm + ' eset', 'font-size': 17, 'font-weight': 800, fill: 'var(--ink)' }, g);
      SV('text', { x: 0, y: 44, text: reach ? (good ? '✓ a teher egy része a homokra jut' : '✗ a puha agyag is terhelést kap') : 'a bura még a felső rétegben van', 'font-size': 12.5, 'font-weight': 700, fill: reach ? (good ? 'var(--ok)' : 'var(--bad)') : 'var(--amber-ink)' }, g);
    });
  };
  r.addEventListener('input', draw); draw();
})();

/* ---------- pince, földkiemelés, kompenzáció ---------- */
(function basement() {
  const host = $('#bsSvg'); if (!host) return; const rN = $('#bsN'), rP = $('#bsP'), rT = $('#bsT');
  const draw = () => {
    const n = +rN.value, p = +rP.value, prog = +rT.value / 100; [rN, rP, rT].forEach(window.U.fillRange);
    $(`[data-for="bsN"]`).textContent = n + (EN ? (n === 1 ? ' storey' : ' storeys') : ' szint'); $(`[data-for="bsP"]`).textContent = p ? p + (EN ? (p === 1 ? ' basement level' : ' basement levels') : ' pinceszint') : 'nincs pince'; $(`[data-for="bsT"]`).textContent = pct(prog * 100);
    const g0 = 19, qf = 12, plate = 15; const D = p ? p * 3.2 + 0.6 : 0.8; const qB = qf * (n + p) + plate; const relief = g0 * D; const net = qB - relief; const ratio = relief / qB;
    const narrow = (host.clientWidth || 600) < 430; const W = 640, Hh = narrow ? 590 : 400, GB = 400, gy = 206, bw = 190, bx = 120; const fl = Math.min(12.5, (gy - 34) / (n * 2.88 + 0.4)); const s = svg(host, W, Hh); pat(s);
    // ég, talaj
    const df = s.querySelector('defs'); const sk = SV('linearGradient', { id: 'bsSky', x1: 0, y1: 0, x2: 0, y2: 1 }, df); SV('stop', { offset: 0, 'stop-color': 'var(--sky-soft, #dfeaf0)' }, sk); SV('stop', { offset: 1, 'stop-color': 'var(--card2)' }, sk);
    SV('rect', { x: 0, y: 0, width: W, height: gy, fill: 'url(#bsSky)' }, s); SV('rect', { x: 0, y: gy, width: W, height: GB - gy, fill: 'url(#pClay)' }, s); SV('rect', { x: 0, y: gy - 3, width: W, height: 4, fill: '#7d9a5b' }, s);
    const fh = 2.88 * fl, yb = gy + D * fl;
    // munkagödör (a kiemelt föld helye) és a kiemelt földkupac
    SV('rect', { x: bx - 8, y: gy - 3, width: bw + 16, height: D * fl + 3, fill: 'var(--bg)', stroke: '#5b524a' }, s);
    const hh = Math.min(118, 24 + D * 9.5), hx = 505; SV('path', { d: `M${hx - 78},${gy} Q${hx - 40},${gy - hh * .95} ${hx},${gy - hh} Q${hx + 44},${gy - hh * .9} ${hx + 84},${gy} Z`, fill: 'url(#pClay)', stroke: '#5b4636', 'stroke-width': 1.5 }, s);
    SV('text', { x: hx, y: gy - hh - 9, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, class: 'hl', text: `kiemelt föld: γ·D = ${Math.round(relief)} kPa` }, s);
    // épület: alaplemez, pinceszintek, emeletek, tető
    const built = prog >= 1 ? n + p : Math.round((n + p) * prog);
    SV('rect', { x: bx - 6, y: yb - 9, width: bw + 12, height: 9, fill: '#bfc3c6', stroke: '#5b524a' }, s);
    for (let i = 0; i < built; i++) { const y = yb - 9 - (i + 1) * fh, base = i < p;
      SV('rect', { x: bx, y, width: bw, height: fh, fill: base ? '#cfc9bb' : '#f5efe2', stroke: '#5b524a', 'stroke-width': fh < 18 ? .8 : 1.2 }, s);
      if (!base) { const ground = i === p; for (let k = 0; k < 6; k++) { if (ground && k === 2) { SV('rect', { x: bx + 16 + k * 28, y: y + fh * .22, width: 14, height: fh * .78, fill: '#7a5a3c' }, s); continue; } SV('rect', { x: bx + 16 + k * 28, y: y + fh * 0.26, width: 14, height: fh * 0.46, fill: '#9fc3d6', stroke: '#5b524a', 'stroke-width': .6 }, s); } }
      else SV('line', { x1: bx + 10, x2: bx + bw - 10, y1: y + fh * .5, y2: y + fh * .5, stroke: '#a39c8c', 'stroke-dasharray': '3 4' }, s); }
    if (built === n + p) SV('rect', { x: bx - 5, y: yb - 9 - built * fh - 6, width: bw + 10, height: 6, fill: '#8f4a3a', stroke: '#5b524a' }, s);
    // D mérete
    const dx = bx - 22; SV('line', { x1: dx, x2: dx, y1: gy, y2: yb, stroke: 'var(--ink)', 'stroke-width': 1.4 }, s); [gy, yb].forEach(y => SV('line', { x1: dx - 5, x2: dx + 5, y1: y, y2: y, stroke: 'var(--ink)', 'stroke-width': 1.4 }, s));
    SV('text', { x: dx - 8, y: (gy + yb) / 2 + 4, 'text-anchor': 'end', 'font-size': 12, 'font-weight': 700, class: 'hl', text: `D = ${fmt(D, 1)} m` }, s);
    // mérleg: épület ↔ kiemelt föld
    const qNow = qB * prog; const mx = 46, my = 34, mh = 96; const sc = mh / Math.max(qB, relief, 1);
    SV('text', { x: mx, y: my - 12, 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, fill: 'var(--ink2)', text: 'épület / föld' }, s);
    SV('rect', { x: mx - 28, y: my + mh - qNow * sc, width: 24, height: qNow * sc, fill: 'var(--coral)', rx: 3 }, s); SV('rect', { x: mx + 4, y: my + mh - relief * sc, width: 24, height: relief * sc, fill: '#8c735f', rx: 3 }, s);
    SV('text', { x: mx - 16, y: my + mh + 14, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: 'var(--ink2)', text: Math.round(qNow) }, s); SV('text', { x: mx + 16, y: my + mh + 14, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: 'var(--ink2)', text: Math.round(relief) }, s);
    SV('text', { x: mx, y: my + mh + 28, 'text-anchor': 'middle', 'font-size': 10.5, fill: 'var(--mute)', text: 'kPa' }, s);
    // teher és süllyedés az építés során
    const cx0 = narrow ? 34 : 352, cy0 = narrow ? 446 : 258, cw = narrow ? 572 : 264, ch = 112; const G = SV('g', {}, s);
    SV('rect', { x: cx0 - 12, y: cy0 - 24, width: cw + 24, height: ch + 44, rx: 10, fill: 'var(--card)', stroke: 'var(--line)' }, G);
    SV('text', { x: cx0 + cw / 2, y: cy0 - 7, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: 'var(--ink)', text: 'teher és süllyedés az építés során' }, G);
    const tx = (u) => cx0 + u * cw, qy = (v) => cy0 + 50 - v / Math.max(qB, relief) * 40, sy = (v) => cy0 + 62 + v * 0.85;
    SV('line', { x1: tx(0), x2: tx(1), y1: qy(relief), y2: qy(relief), stroke: '#8c735f', 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, G);
    const pts = [], sp = []; for (let u = 0; u <= 1.0001; u += 0.02) { const q = qB * u; pts.push(`${tx(u)},${qy(q)}`); const ds = q <= relief ? q / Math.max(relief, 1) * 3 : 3 + (q - relief) * 0.55; sp.push(`${tx(u)},${sy(Math.min(52, ds))}`); }
    SV('polyline', { points: pts.join(' '), fill: 'none', stroke: 'var(--coral)', 'stroke-width': 2.4 }, G); SV('polyline', { points: sp.join(' '), fill: 'none', stroke: 'var(--teal)', 'stroke-width': 2.6 }, G);
    SV('line', { x1: tx(prog), x2: tx(prog), y1: cy0 + 4, y2: cy0 + ch + 2, stroke: 'var(--ink2)', 'stroke-dasharray': '2 3' }, G);
    SV('text', { x: tx(0) + 2, y: qy(relief) - 5, 'font-size': 11, 'font-weight': 700, class: 'hl', style: 'fill:#6f5949', text: 'tehermentesítés (γ·D)' }, G);
    SV('text', { x: tx(1) - 2, y: qy(qB) + 14, 'text-anchor': 'end', 'font-size': 11, 'font-weight': 700, class: 'hl', style: 'fill:var(--coral-ink)', text: 'összes teher' }, G);
    SV('text', { x: tx(0) + 2, y: cy0 + ch + 12, 'font-size': 11, 'font-weight': 700, class: 'hl', style: 'fill:var(--teal-ink)', text: 'süllyedés ↓' }, G);
    SV('text', { x: tx(1) - 2, y: cy0 + ch + 12, 'text-anchor': 'end', 'font-size': 10.5, fill: 'var(--mute)', text: 'építés →' }, G);
    const out = $('#bsOut'); const pc = Math.round(ratio * 100);
    out.innerHTML = `<div class="r"><span>épületteher (q)</span><b>${Math.round(qB)} kPa</b></div><div class="r"><span>kiemelt föld (γ·D)</span><b>${Math.round(relief)} kPa</b></div><div class="r"><span>többletfeszültség q − γ·D</span><b style="color:${net <= 0 ? 'var(--ok)' : 'var(--ink)'}">${Math.round(net)} kPa</b></div><div class="r"><span>kompenzáltság</span><b>${pc > 100 ? '> ' + pct(100) : pct(pc)}</b></div>`;
    $('#bsMsg').innerHTML = net <= 0 ? `<b>Teljesen kompenzált alapozás:</b> a kiemelt talaj súlya nagyobb az épületénél, az altalajra hárított többletfeszültség „negatív” – kellően merev vb. lemezalappal az építmény gyakorlatilag mozdulatlan. <span class="muted">(Túlkompenzálásnál a talaj megemelkedhet, talajvíz alatt a felúszást is ellenőrizni kell.)</span>` : ratio > 0.6 ? `<b>Részben kompenzált:</b> a terhelés ${pct(pc)}-át a kiemelt föld „ellensúlyozza” – a süllyedés csak a többletből keletkezik, és csak akkor indul meg, amikor az építés túllépi a tehermentesítést.` : `<b>Gyenge kompenzáció:</b> a kiemelt föld a teher kis részét ellensúlyozza. Próbálj több pinceszintet!`;
  };
  [rN, rP, rT].forEach(r => r.addEventListener('input', draw)); draw();
  const pl = $('#bsPlay'); if (pl) pl.addEventListener('click', () => { const t0 = performance.now(); const step = (t) => { const u = clamp((t - t0) / 4000, 0, 1); rT.value = Math.round(u * 100); draw(); if (u < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); });
})();

/* ---------- 3 eset: teher / szélesség hatása a feszültségre ---------- */
(function threeCases() {
  const host = $('#tcSvg'); if (!host) return; const draw = () => { const narrow = (host.clientWidth || 600) < 520; const s = svg(host, narrow ? 300 : 660, narrow ? 3 * 232 : 238);
  const cases = [['Kétszeres teher', 'b, 2q', 'feszültség mindenhol kétszeres, a mélység ugyanaz', 1, 2], ['Kétszeres szélesség', '2b, q', 'ugyanaz a feszültség kétszer mélyebben', 2, 1], ['Fele felület', 'b/2, 2q', 'nagy feszültség felül, de sekély hatás', 0.5, 2]];
  cases.forEach(([t, lab, d, wk, qk], i) => {
    const g = SV('g', { transform: narrow ? `translate(46,${i * 232})` : `translate(${i * 220 + 10},0)` }, s); const cx = 100, Y = 64, w0 = 44;
    SV('text', { x: 0, y: 18, text: `${i + 1}. ${t}`, 'font-size': 13, 'font-weight': 800, fill: 'var(--ink)' }, g);
    const bulb = (w, dep, col, op, dash) => SV('path', { d: `M${cx - w / 2},${Y} C${cx - w},${Y + dep * .4} ${cx - w * .5},${Y + dep} ${cx},${Y + dep} C${cx + w * .5},${Y + dep} ${cx + w},${Y + dep * .4} ${cx + w / 2},${Y} Z`, fill: col, 'fill-opacity': op, stroke: col, 'stroke-width': 1.6, 'stroke-dasharray': dash || '' }, g);
    bulb(w0, 70, 'var(--mute)', 0, '4 4'); bulb(w0 * wk, 70 * wk, qk > 1 ? 'var(--coral)' : 'var(--teal)', .28 + (qk - 1) * .2);
    SV('rect', { x: cx - w0 * wk / 2, y: Y - 7, width: w0 * wk, height: 7, fill: '#c3c7ca', stroke: '#4b5458' }, g);
    for (let k = 0; k < Math.max(2, Math.round(3 * qk)); k++) { const x = cx - w0 * wk / 2 + (k + .5) * (w0 * wk) / Math.max(2, Math.round(3 * qk)); SV('line', { x1: x, x2: x, y1: Y - 26, y2: Y - 10, stroke: 'var(--coral)', 'stroke-width': 1.6 }, g); SV('path', { d: `M${x - 3},${Y - 13} L${x},${Y - 8} L${x + 3},${Y - 13}`, fill: 'var(--coral)' }, g); }
    SV('text', { x: cx + w0 * wk / 2 + 6, y: Y - 12, text: lab, 'font-size': 11, 'font-weight': 700, fill: 'var(--coral-ink)' }, g);
        const tx = SV('text', { x: 0, y: 214, 'font-size': 12, fill: 'var(--ink2)' }, g); const words = d.split(' '); let line = '', yy = 212; words.forEach(wd => { if ((line + wd).length > 30) { SV('tspan', { x: 0, y: yy, text: line }, tx); line = ''; yy += 15; } line += wd + ' '; }); SV('tspan', { x: 0, y: yy, text: line }, tx);
  }); }; draw(); let lw = host.clientWidth; addEventListener('resize', () => { if (Math.abs(host.clientWidth - lw) > 20) { lw = host.clientWidth; draw(); } });
})();
})();
