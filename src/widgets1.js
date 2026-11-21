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
    { id: 'a', n: '1/A Kisebb talpnyomás', d: 'szélesebb alap – ha lejjebb kedvezőbb réteg van', href: '#talpnyomas', c: 'var(--teal)' },
    { id: 'b', n: '1/B Mélyebb alapsík', d: 'pár méteren belül teherbíró réteg, pince', href: '#alapsik', c: 'var(--teal)' },
    { id: 'c', n: '1/C Talajcsere', d: 'sekély probléma, talajvíz felett, 50–80 cm', href: '#talajcsere', c: 'var(--teal)' },
    { id: 'd1', n: '2/A Mélytömörítés (vibroflotáció)', d: 'laza szemcsés talaj, feltöltés', href: '#t-mech', open: 'mech:m1', c: 'var(--amber)' },
    { id: 'd2', n: '2/B Dinamikus tömörítés', d: 'nagy felület, laza szemcsés talaj, feltöltés; max. 6–8 m', href: '#t-mech', open: 'mech:m2', c: 'var(--amber)' },
    { id: 'd3', n: '2/C Kőtömzs', d: 'nagyon puha, kötött és szerves talaj', href: '#t-mech', open: 'mech:m3', c: 'var(--amber)' },
    { id: 'd4', n: '2/D Kavicscölöp', d: 'sokféle talajhoz igazítható, kötött talajban is', href: '#t-mech', open: 'mech:m4', c: 'var(--amber)' },
    { id: 'd5', n: '3/A Itatásos injektálás', d: 'szemcsés talaj, durva iszap; cementtel csak > 0,8–1 mm', href: '#injmod', open: 'inj:i1', inj: 0, c: 'var(--violet)' },
    { id: 'd6', n: '3/B Talajtömörítő injektálás', d: 'laza talaj, iszap és agyag is; meglévő épület alatt is', href: '#injmod', open: 'inj:i1', inj: 1, c: 'var(--violet)' },
    { id: 'd8', n: '3/D Repesztő/kompenzáló injektálás', d: 'süllyedéskompenzálás, épület visszaemelése', href: '#injmod', open: 'inj:i1', inj: 3, c: 'var(--violet)' },
    { id: 'd7', n: '3/F Tömegstabilizáció', d: 'tőzeg, puha agyag; rendszerint ≤ 5 m', href: '#t-inj', open: 'inj:i2', c: 'var(--violet)' },
    { id: 'e', n: '4/A Előterhelés', d: 'telített, összenyomható kötött talaj, van idő', href: '#eloterheles', c: 'var(--coral)' },
    { id: 'f', n: '4/B–C Szerkezeti megoldás, építési sorrend', d: 'mindig kiegészítő eszköz', href: '#szerkezet', c: 'var(--coral)' },
    { id: 'h', n: '4/D Mélyalapozás', d: 'a jó teherbíró réteg mélyen van', href: '#melyalap', c: 'var(--coral)' },
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
      case 'd2': add(['szemcses', 'feltoltes'].includes(soil) ? 2 : soil === 'kotott' ? 0 : -1); add(depth === 'mely' ? -2 : 1, depth === 'mely' ? 'max. 6–8 m' : ''); if (sit === 'meglevo') add(-4, 'erős rezgés – épület mellett nem'); break;
      case 'd3': add(soil === 'kotott' || soil === 'feltoltes' ? 2 : 0); if (sit === 'meglevo') add(-4); break;
      case 'd4': add(soil === 'kotott' ? 3 : soil === 'szerves' ? -1 : 1, soil === 'kotott' ? 'puha kötött talajhoz is' : ''); if (sit === 'meglevo') add(-2); break;
      case 'd5': add(soil === 'szemcses' ? 3 : soil === 'feltoltes' ? 1 : -2, soil === 'szemcses' ? 'a hézagokat tölti ki' : soil === 'feltoltes' ? '' : 'finom talajba nem jut be'); if (sit === 'meglevo') add(1, 'utólagos beavatkozás is'); break;
      case 'd6': add(soil === 'szerves' ? -2 : 1, soil === 'kotott' ? 'iszapban, agyagban is tömörít' : soil === 'szerves' ? '' : 'laza talajt tömörít'); if (sit === 'meglevo') add(3, 'meglévő épület alatt is'); break;
      case 'd8': add(sit === 'meglevo' ? 3 : -2, sit === 'meglevo' ? 'süllyedéskompenzálás, visszaemelés' : 'új építésnél ritka'); if (soil === 'szerves') add(-2); break;
      case 'd7': add(soil === 'szerves' ? 4 : soil === 'kotott' ? 1 : -1, soil === 'szerves' ? 'tőzeg, szerves talaj' : ''); add(depth === 'mely' ? -3 : 1, depth === 'mely' ? 'rendszerint ≤ 5 m' : ''); if (sit === 'meglevo') add(-4); break;
      case 'e': add(soil === 'kotott' || soil === 'szerves' ? 3 : 0, soil === 'kotott' || soil === 'szerves' ? 'összenyomható kötött talaj' : ''); if (sit === 'meglevo') add(-4); break;
      case 'f': add(2, 'mindig érdemes'); break;
      case 'h': add(depth === 'mely' ? 4 : better === 'nem' ? 2 : 0, depth === 'mely' ? 'mélyen van a jó réteg' : ''); if (sit === 'meglevo') add(0); break;
    }
    return { s, why };
  };
  const list = $('#selList');
  const draw = () => { const sc = M.map(m => ({ m, ...score(m) })).sort((a, b) => b.s - a.s); list.innerHTML = ''; sc.forEach(({ m, s, why }) => { const c = s >= 3 ? 'good' : s <= -1 ? 'bad' : ''; list.appendChild(H('div', { class: 'mi ' + c }, `<i class="d" style="background:${m.c}"></i><div><h5>${m.n}</h5><p>${why.filter(Boolean).join(' · ') || m.d}</p></div><a href="${m.href}"${m.open ? ` data-open="${m.open}"` : ''}${m.inj != null ? ` data-inj="${m.inj}"` : ''}>→</a>`)); }); };
  $$('[data-q]', root).forEach(g => window.U.seg(g, (v) => { st[g.dataset.q] = v; draw(); }));
  draw();
})();

/* ---------- A/B rétegződés: a határmélység eléri-e a mélyebb réteget? (Kany, négyzetes alap, n = 5) ---------- */
(function abFig() {
  const host = $('#abSvg'); if (!host) return; const r = $('#abB');
  const KZB = [0, .05, .1, .2, .3, .4, .5, .6, .8, 1, 1.5, 2, 3, 4, 5, 10, 20], KK = [1, .981, .898, .694, .557, .47, .409, .362, .289, .234, .144, .094, .047, .028, .018, .005, .001];   // B/L = 1
  const kany = (x) => { if (x >= 20) return KK[16]; let i = 0; while (KZB[i + 1] < x) i++; return KK[i] + (KK[i + 1] - KK[i]) * (x - KZB[i]) / (KZB[i + 1] - KZB[i]); };
  const m0 = (B) => { let z = 0; while (z < 20 && 150 * kany(z / B) > 20 * (1 + z) / 5) z += .01; return z; };   // p0 = 150 kPa, γ = 20 kN/m³, D = 1 m
  const draw = () => {
    const B = +r.value; window.U.fillRange(r); $(`[data-for="abB"]`).textContent = fmt(B, 1) + ' m';
    const s = svg(host, 640, 316); pat(s); const M = m0(B);
    [['A', 0, 'url(#pClay)', 'url(#pSand)', 'puha agyag', 'homok', true], ['B', 330, 'url(#pSand)', 'url(#pClay)', 'homok', 'puha agyag', false]].forEach(([nm, ox, c1, c2, n1, n2, good]) => {
      const g = SV('g', { transform: `translate(${ox},0)` }, s); const k = 34, Y = 92, yB = Y + 3 * k, Hh = 316;
      SV('rect', { x: 0, y: Y, width: 310, height: 3 * k, fill: c1 }, g); SV('rect', { x: 0, y: yB, width: 310, height: Hh - yB, fill: c2 }, g);
      SV('text', { x: 8, y: Y + 18, text: n1, 'font-size': 12.5, 'font-weight': 700, class: 'hl' }, g); SV('text', { x: 8, y: Hh - 10, text: n2, 'font-size': 12.5, 'font-weight': 700, class: 'hl' }, g);
      const cx = 155, w = B * k, ym = Y + M * k, reach = M > 3;
      const col = reach ? (good ? '#39c2a5' : '#d4553a') : '#e5ae47', ink = reach ? (good ? '#0d7a68' : '#a63a23') : '#c2830c';
      // az alap alatti, a határmélységig összenyomódó talajtömb
      SV('rect', { x: cx - w / 2, y: Y + 8, width: w, height: Math.min(ym, Hh) - Y - 8, fill: col, opacity: .45, stroke: ink, 'stroke-width': 1.6 }, g);
      if (ym < Hh) { SV('line', { x1: 40, y1: ym, x2: 300, y2: ym, stroke: ink, 'stroke-width': 2, 'stroke-dasharray': '7 4' }, g); SV('text', { x: 300, y: ym - 6, 'text-anchor': 'end', text: 'm_{0} = ' + fmt(M, 1) + ' m', 'font-size': 13, 'font-weight': 800, class: 'hl', style: `fill:${ink}` }, g); }
      SV('rect', { x: cx - w / 2, y: Y, width: w, height: 8, fill: '#c3c7ca', stroke: '#4b5458' }, g); SV('rect', { x: cx - 7, y: Y - 26, width: 14, height: 26, fill: '#c3c7ca', stroke: '#4b5458' }, g);
      SV('text', { x: 0, y: 22, text: EN ? 'Case ' + nm : nm + ' eset', 'font-size': 17, 'font-weight': 800, fill: 'var(--ink)' }, g);
      SV('text', { x: 0, y: 44, text: reach ? (good ? '✓ a teher egy része a homokra jut' : '✗ a puha agyag is terhelést kap') : 'a határmélység még a felső rétegben van', 'font-size': 12.5, 'font-weight': 700, fill: reach ? (good ? 'var(--ok)' : 'var(--bad)') : 'var(--amber-ink)' }, g);
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
    SV('text', { x: tx(0) + 2, y: qy(relief) - 5, 'font-size': 11, 'font-weight': 700, class: 'hl', style: 'fill:var(--ink2)', text: 'tehermentesítés (γ·D)' }, G);
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

/* ---------- 3 eset: teher / szélesség hatása a többletfeszültségre és a határmélységre (Kany-féle számítás) ---------- */
(function threeCases() {
  /* Kany-táblázat, sávalap (B/L = 0): σz/p0 a karakterisztikus pont alatt, z/B szerint (a Síkalapok süllyedésszámítása táblázata) */
  const KZB = [0, .05, .1, .2, .3, .4, .5, .6, .8, 1, 1.5, 2, 3, 4, 5, 10, 20], KK = [1, .99, .945, .826, .739, .677, .63, .59, .524, .467, .36, .288, .203, .155, .125, .063, .032];
  /* a táblázati értékek között lineáris interpoláció – ahogy a Kany-táblázatot a gyakorlatban használjuk */
  const kany = (x) => { if (x >= 20) return KK[16]; let i = 0; while (KZB[i + 1] < x) i++; return KK[i] + (KK[i + 1] - KK[i]) * (x - KZB[i]) / (KZB[i + 1] - KZB[i]); };
  const GAM = 20, DD = 1, NN = 5, P0 = 100, B0 = 2;   // γ (kN/m³), alapozási mélység D (m), n-szabály, p0 (kPa), B (m)
  const ds = (p, b, z) => p * kany(z / b);              // többletfeszültség a karakterisztikus pont alatt
  const crit = (z) => GAM * (DD + z) / NN;              // σg/5
  const m0 = (p, b) => { let z = 0; while (z < 40 && ds(p, b, z) > crit(z)) z += .01; return z; };
  const host = $('#tcSvg'); if (!host) return;
  const cases = [
    { t: '1. Kétszeres teher', ch: 'B, 2p_{0}', bk: 1, qk: 2, c: 'var(--coral)', ci: 'var(--coral-ink)', d: 'Minden mélységben kétszeres Δσ_{z}' },
    { t: '2. Kétszeres szélesség', ch: '2B, p_{0}', bk: 2, qk: 1, c: 'var(--teal)', ci: 'var(--teal-ink)', d: 'Felül ugyanakkora, de lassabban csökken' },
    { t: '3. Fele felület', ch: 'B/2, 2p_{0}', bk: .5, qk: 2, c: 'var(--violet)', ci: 'var(--violet-ink)', d: 'Felül kétszeres, de gyorsan leépül' },
  ];
  const draw = () => {
    const nar = (host.clientWidth || 1000) < 680, PW = 340, PH = 540, W = nar ? PW + 20 : PW * 3, Hh = nar ? PH * 3 : PH;
    const s = svg(host, W, Hh);
    const KZ = 36, ZM = 8.5, KQ = .92, yb = 150, cx = 140, yE = yb + ZM * KZ;   // 1 m = 36 px (mélység és szélesség), 1 kPa = 0,92 px; cx: a karakterisztikus pont függőlegese
    const r0 = m0(P0, B0);
    cases.forEach((C, i) => {
      const g = SV('g', { transform: nar ? `translate(10,${i * PH})` : `translate(${i * PW},0)` }, s);
      if (!nar && i) SV('line', { x1: 0, y1: 20, x2: 0, y2: PH - 20, stroke: 'var(--line)', 'stroke-width': 1 }, g);
      if (nar && i) SV('line', { x1: 10, y1: 0, x2: PW - 10, y2: 0, stroke: 'var(--line)', 'stroke-width': 1 }, g);
      SV('text', { x: PW / 2, y: 30, 'text-anchor': 'middle', text: C.t, 'font-size': 16, 'font-weight': 800, fill: 'var(--ink)' }, g);
      // előtte → utána
      SV('rect', { x: 46, y: 44, width: 14, height: 10, fill: 'none', stroke: 'var(--mute)', 'stroke-width': 1.5, 'stroke-dasharray': '3 2' }, g);
      SV('text', { x: 65, y: 54, text: 'előtte: B, p_{0}', 'font-size': 12.5, 'font-weight': 700, style: 'fill:var(--ink2)' }, g);
      SV('text', { x: 172, y: 54, 'text-anchor': 'middle', text: '→', 'font-size': 14, 'font-weight': 800, style: 'fill:var(--ink2)' }, g);
      SV('rect', { x: 186, y: 44, width: 14, height: 10, fill: C.c, 'fill-opacity': .45, stroke: C.c, 'stroke-width': 1.5 }, g);
      SV('text', { x: 205, y: 54, text: 'utána: ' + C.ch, 'font-size': 12.5, 'font-weight': 800, style: `fill:${C.ci}` }, g);
      // mélységrács (m, az alapsík alatt)
      for (let k = 1; k <= 8; k++) { const y = yb + k * KZ; SV('line', { x1: 34, y1: y, x2: PW - 14, y2: y, stroke: 'var(--line2)', 'stroke-width': 1 }, g); SV('text', { x: 30, y: y + 4, 'text-anchor': 'end', text: k + ' m', 'font-size': 10.5, style: 'fill:var(--mute)' }, g); }
      // Δσz a karakterisztikus pont alatt: utána kitöltve (a határmélységig erősebben), előtte szaggatott
      const r1 = m0(C.qk * P0, C.bk * B0), y0 = yb + r0 * KZ, y1 = yb + r1 * KZ;
      const prof = (p, b, zt) => { const P = []; for (let k = 0; k <= 120; k++) { const z = zt * k / 120; P.push([cx + ds(p, b, z) * KQ, yb + z * KZ]); } return P; };
      const area = (P, zt) => 'M' + cx + ' ' + yb + 'L' + P.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L') + 'L' + cx + ' ' + (yb + zt * KZ).toFixed(1) + 'Z';
      SV('path', { d: area(prof(C.qk * P0, C.bk * B0, ZM), ZM), fill: C.c, 'fill-opacity': .14 }, g);
      SV('path', { d: area(prof(C.qk * P0, C.bk * B0, r1), r1), fill: C.c, 'fill-opacity': .42 }, g);
      SV('path', { d: 'M' + prof(C.qk * P0, C.bk * B0, ZM).map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L'), fill: 'none', stroke: C.c, 'stroke-width': 2.2 }, g);
      SV('path', { d: 'M' + prof(P0, B0, ZM).map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L'), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.8, 'stroke-dasharray': '6 4' }, g);
      // σg/5 határ (n = 5)
      SV('line', { x1: cx + crit(0) * KQ, y1: yb, x2: cx + crit(ZM) * KQ, y2: yE, stroke: '#d4553a', 'stroke-width': 2, 'stroke-dasharray': '7 4' }, g);
      SV('text', { x: cx + crit(ZM) * KQ + 6, y: yE - 6, text: 'σ_{g}/5', 'font-size': 12.5, 'font-weight': 800, class: 'hl', style: 'fill:#c2412f' }, g);
      // határmélység: előtte szaggatott, utána tömör vonal; metszéspontok
      SV('line', { x1: 34, y1: y0, x2: PW - 14, y2: y0, stroke: 'var(--ink2)', 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }, g);
      SV('line', { x1: 34, y1: y1, x2: PW - 14, y2: y1, stroke: C.ci, 'stroke-width': 2 }, g);
      SV('circle', { cx: cx + crit(r0) * KQ, cy: y0, r: 3.6, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 1.6 }, g);
      SV('circle', { cx: cx + crit(r1) * KQ, cy: y1, r: 4.2, fill: C.c, stroke: C.ci, 'stroke-width': 1.6 }, g);
      const dz = Math.abs(r1 - r0) > .35;
      if (dz) { const xa = 46; SV('line', { x1: xa, y1: y0 + 3, x2: xa, y2: y1 - 8, stroke: C.ci, 'stroke-width': 2 }, g); SV('path', { d: `M${xa - 5} ${y1 - 10}L${xa} ${y1 - 1}L${xa + 5} ${y1 - 10}Z`, fill: C.ci }, g); }
      SV('text', { x: 56, y: y0 - 5, text: 'm_{0} = ' + fmt(r0, 1) + ' m', 'font-size': 12, 'font-weight': 700, class: 'hl', style: 'fill:var(--ink2)' }, g);
      SV('text', { x: 56, y: dz ? y1 - 6 : y1 + 16, text: 'm_{0} = ' + fmt(r1, 1) + ' m', 'font-size': 13, 'font-weight': 800, class: 'hl', style: `fill:${C.ci}` }, g);
      // Δσz-tengely: 100 és 200 kPa
      [100, 200].forEach(v => { const x = cx + v * KQ; SV('line', { x1: x, y1: yb + 2, x2: x, y2: yE, stroke: 'var(--line)', 'stroke-width': 1, 'stroke-dasharray': '2 4' }, g); SV('text', { x: v === 100 ? x : x + 12, y: yE + 16, 'text-anchor': v === 100 ? 'middle' : 'end', text: v === 100 ? '100' : '200 kPa', 'font-size': 11.5, 'font-weight': 700, style: 'fill:var(--mute)' }, g); });
      SV('text', { x: cx + 6, y: yE + 16, text: 'Δσ_{z}', 'font-size': 12.5, 'font-weight': 800, style: 'fill:var(--ink)' }, g);
      // tengely (a karakterisztikus pont függőlegese)
      SV('line', { x1: cx, y1: yb - 12, x2: cx, y2: yE + 4, stroke: 'var(--ink)', 'stroke-width': 1.2, 'stroke-dasharray': '10 3 2 3' }, g);
      // terep/alapsík, alaptest (előtte szaggatott, utána tömör), teherblokk (magasság ∝ p0)
      SV('line', { x1: 34, y1: yb, x2: PW - 14, y2: yb, stroke: '#7d9a5b', 'stroke-width': 3 }, g);
      const b1 = C.bk * B0 * KZ, bb = B0 * KZ, q1 = C.qk * 26, ft = 12;
      const fx = cx - .37 * b1, fx0 = cx - .37 * bb;   // az alap közepe: a karakterisztikus pont a középvonaltól 0,37·B-re van
      SV('rect', { x: fx - b1 / 2, y: yb - ft - q1, width: b1, height: q1, fill: C.c, 'fill-opacity': .35, stroke: C.c, 'stroke-width': 1.6 }, g);
      const na = Math.max(3, Math.round(b1 / 11)); for (let k = 0; k < na; k++) { const x = fx - b1 / 2 + (k + .5) * b1 / na; SV('line', { x1: x, y1: yb - ft - q1 + 3, x2: x, y2: yb - ft - 7, stroke: C.ci, 'stroke-width': 1.5 }, g); SV('path', { d: `M${x - 3.5} ${yb - ft - 9}L${x} ${yb - ft - 2}L${x + 3.5} ${yb - ft - 9}Z`, fill: C.ci }, g); }
      SV('rect', { x: fx - b1 / 2, y: yb - ft, width: b1, height: ft, fill: '#c3c7ca', stroke: '#4b5458', 'stroke-width': 1.6 }, g);
      SV('rect', { x: fx0 - bb / 2, y: yb - ft - 26, width: bb, height: 26 + ft, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.6, 'stroke-dasharray': '5 3' }, g);
      SV('text', { x: Math.max(fx + b1 / 2, fx0 + bb / 2) + 8, y: yb - ft - q1 + 12, text: C.qk === 2 ? '2p_{0}' : 'p_{0}', 'font-size': 14, 'font-weight': 800, style: `fill:${C.ci}` }, g);
      const yt = yb - ft - Math.max(q1, 26) - 10; SV('line', { x1: fx - b1 / 2, y1: yt, x2: fx + b1 / 2, y2: yt, stroke: C.ci, 'stroke-width': 1.3 }, g); [fx - b1 / 2, fx + b1 / 2].forEach(x => SV('line', { x1: x, y1: yt - 5, x2: x, y2: yt + 5, stroke: C.ci, 'stroke-width': 1.3 }, g));
      SV('text', { x: fx, y: yt - 6, 'text-anchor': 'middle', text: C.bk === 1 ? 'B' : C.bk === 2 ? '2B' : 'B/2', 'font-size': 13, 'font-weight': 800, class: 'hl', style: `fill:${C.ci}` }, g);
      SV('circle', { cx, cy: yb, r: 3.4, fill: 'var(--ink)' }, g);   // karakterisztikus pont
      // tanulság: mi történik a többletfeszültséggel és a határmélységgel
      SV('text', { x: PW / 2, y: yE + 44, 'text-anchor': 'middle', text: C.d, 'font-size': 13.5, 'font-weight': 700, style: 'fill:var(--ink)' }, g);
      SV('text', { x: PW / 2, y: yE + 63, 'text-anchor': 'middle', text: `határmélység: ${fmt(r0, 1)} m → ${fmt(r1, 1)} m`, 'font-size': 13.5, 'font-weight': 700, style: `fill:${C.ci}` }, g);
    });
  };
  draw(); let lw = host.clientWidth; addEventListener('resize', () => { if (Math.abs(host.clientWidth - lw) > 20) { lw = host.clientWidth; draw(); } });
})();
})();
