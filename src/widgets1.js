/* ===== Interaktív ábrák – 1. rész (süllyedéstűrés, áttekintés, alapozás átalakítása) ===== */
(function () {
const { $, $$, clamp, lerp, fmt, H } = window.U;
const NS = 'http://www.w3.org/2000/svg';
const SV = (tag, a = {}, p) => { const e = document.createElementNS(NS, tag); let st = a.style || ''; for (const k in a) { if (k === 'style' || k === 'text') continue; const v = a[k]; if (typeof v === 'string' && v.includes('var(') && ['fill', 'stroke', 'stop-color', 'color'].includes(k)) st += `;${k}:${v}`; else e.setAttribute(k, v); } if (st) e.setAttribute('style', st); if (a.text != null) e.textContent = a.text; if (p) p.appendChild(e); return e; };
const svg = (host, w, h) => { const s = SV('svg', { viewBox: `0 0 ${w} ${h}`, class: 'svgbox', role: 'img' }); host.innerHTML = ''; host.appendChild(s); return s; };
window.SV = SV; window.mkSvg = svg;
const pat = (s) => { const d = SV('defs', {}, s);
  const mk = (id, bg, dots, r = 1.4, n = 26) => { const p = SV('pattern', { id, width: 16, height: 16, patternUnits: 'userSpaceOnUse' }, d); SV('rect', { width: 16, height: 16, fill: bg }, p); for (let i = 0; i < n / 6; i++) SV('circle', { cx: (i * 37) % 16, cy: (i * 23 + 5) % 16, r, fill: dots }, p); return p; };
  mk('pSand', '#dcbc78', '#b8934c', 1.2, 30); mk('pClay', '#8c735f', '#6f5949', 1.6, 18); mk('pGrav', '#bfae95', '#8c7a63', 2.6, 14); mk('pSoft', '#7e7464', '#625a4c', 1.5, 18); mk('pFill', '#a59682', '#7b6d5c', 2, 18);
  const g = SV('pattern', { id: 'pHatch', width: 8, height: 8, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, d); SV('rect', { width: 8, height: 8, fill: '#c9cdd0' }, g); SV('line', { x1: 0, y1: 0, x2: 0, y2: 8, stroke: '#9aa1a6', 'stroke-width': 2 }, g);
  return d; };
window.SVpat = pat;

/* ---------- HERO: egyenlőtlen süllyedés ---------- */
(function hero() {
  const host = $('#heroSvg'); if (!host) return; const W = 520, Hh = 300; const s = svg(host, W, Hh); pat(s);
  SV('rect', { x: 0, y: 0, width: W, height: 196, fill: '#e8efe9' }, s);
  SV('rect', { x: 0, y: 196, width: W, height: 104, fill: 'url(#pSand)' }, s);
  SV('path', { d: 'M300,196 C330,240 470,250 520,232 L520,300 L270,300 C280,260 290,230 300,196 Z', fill: 'url(#pClay)' }, s);
  SV('text', { x: 14, y: 288, text: 'tömör homok', 'font-size': 12, fill: '#6b5430', 'font-weight': 700 }, s);
  SV('text', { x: 430, y: 288, text: 'puha agyag', 'font-size': 12, fill: '#fff', 'font-weight': 700 }, s);
  const house = SV('g', {}, s); const X0 = 110, X1 = 410, Y0 = 196, Y1 = 70;
  SV('rect', { x: X0, y: Y1, width: X1 - X0, height: Y0 - Y1, fill: '#f5efe2', stroke: '#5b524a', 'stroke-width': 2 }, house);
  SV('path', { d: `M${X0 - 14},${Y1} L${(X0 + X1) / 2},${Y1 - 52} L${X1 + 14},${Y1} Z`, fill: '#b8553d', stroke: '#5b524a', 'stroke-width': 2 }, house);
  const wins = [[140, 92], [215, 92], [290, 92], [355, 92], [140, 140], [290, 140], [355, 140]]; wins.forEach(([x, y]) => SV('rect', { x, y, width: 34, height: 30, fill: '#9fc3d6', stroke: '#5b524a', 'stroke-width': 1.5 }, house));
  SV('rect', { x: 218, y: 140, width: 34, height: 56, fill: '#7a5a3c', stroke: '#5b524a', 'stroke-width': 1.5 }, house);
  SV('rect', { x: X0 - 6, y: Y0, width: X1 - X0 + 12, height: 12, fill: '#bfc3c6', stroke: '#5b524a' }, house);
  const cracks = SV('g', { fill: 'none', stroke: '#3b2f28', 'stroke-linecap': 'round' }, house);
  const C = [`M290,122 l14,-10 l-4,-6 l12,-12`, `M324,140 l10,-8 l-2,-7 l12,-9`, `M355,170 l-10,-14 l10,-6 l-6,-12`, `M389,140 l14,-12 l-3,-8 l12,-10`, `M252,160 l18,-14 l-3,-9 l14,-10`, `M369,122 l12,-10 l-3,-7`];
  const cr = C.map(d => SV('path', { d, 'stroke-width': 1.5, opacity: 0 }, cracks));
  const arrow = SV('g', {}, s); SV('line', { x1: X1 + 22, y1: Y0, x2: X1 + 22, y2: Y0, stroke: '#d4553a', 'stroke-width': 2.5 }, arrow);
  const lab = SV('text', { x: X1 + 30, y: Y0 + 14, 'font-size': 13, 'font-weight': 800, fill: '#d4553a' }, s);
  const r = $('#heroDs'), val = $('#heroVal'), pill = $('#heroPill'), beta = $('#heroBeta');
  const upd = () => {
    const ds = +r.value; window.U.fillRange(r); const L = 10000; const b = ds / L; const drop = ds * 0.55; const ang = Math.atan2(drop, X1 - X0) * 180 / Math.PI;
    house.setAttribute('transform', `rotate(${ang} ${X0} ${Y0})`);
    const lv = b < 1 / 1000 ? 0 : b < 1 / 500 ? 1 : b < 1 / 300 ? 2 : b < 1 / 150 ? 3 : 4;
    cr.forEach((p, i) => { const on = i < [0, 1, 3, 5, 6][lv]; p.setAttribute('opacity', on ? 1 : 0); p.setAttribute('stroke-width', [1, 1.2, 1.8, 2.6, 3.6][lv]); p.setAttribute('stroke', lv >= 4 ? '#b5302a' : '#3b2f28'); });
    arrow.firstChild.setAttribute('y2', Y0 + drop); lab.setAttribute('y', Y0 + drop + 16); lab.textContent = `Δs = ${ds} mm`;
    val.textContent = ds + ' mm'; beta.textContent = ds ? `β ≈ 1/${Math.round(L / ds)}` : 'β = 0';
    const T = [['nincs károsodás', ''], ['hajszálrepedés (< 0,1 mm)', ''], ['látható repedések – szerkezetileg még elviselhető', 'w'], ['repedések, nyílászárók befeszülnek', 'w'], ['szerkezeti kár (≈ 1/150)', 'b']][lv];
    pill.textContent = T[0]; pill.className = 'status' + (T[1] ? ' ' + T[1] : '');
  };
  r.addEventListener('input', upd); upd();
  // kis automatikus bemutató, amíg a felhasználó nem nyúl hozzá
  let touched = false; r.addEventListener('pointerdown', () => touched = true); let t0 = performance.now();
  const demo = (t) => { if (touched) return; if (document.hidden || scrollY > innerHeight * 1.2) { requestAnimationFrame(demo); return; } const u = ((t - t0) / 6000) % 1; const v = Math.round(40 * (1 - Math.cos(u * Math.PI * 2)) / 2 * 1.5); r.value = Math.min(60, v); upd(); requestAnimationFrame(demo); };
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(demo);
})();

/* ---------- Alapmozgások (MSZ EN 1997-1 H melléklet) ---------- */
(function moves() {
  const host = $('#movSvg'); if (!host) return; const ids = ['movA', 'movB', 'movC', 'movD']; const Lm = 12; const xsM = [0, 4, 8, 12];
  const presets = { egyenletes: [30, 30, 30, 30], billenes: [10, 20, 30, 40], behajlas: [10, 34, 34, 10], felhajlas: [34, 12, 12, 34], egy: [12, 12, 40, 12] };
  const W = 640, Hh = 270, X0 = 60, X1 = 580, Y0 = 90, K = 2.6; const sx = (m) => X0 + m / Lm * (X1 - X0);
  const draw = () => {
    const s = ids.map(id => +$('#' + id).value); ids.forEach((id, i) => { window.U.fillRange($('#' + id)); $(`[data-for="${id}"]`).textContent = s[i] + ' mm'; });
    const svgE = svg(host, W, Hh);
    SV('rect', { x: 0, y: Y0 + 8, width: W, height: Hh - Y0 - 8, fill: 'var(--bg2)' }, svgE);
    SV('line', { x1: X0 - 20, x2: X1 + 20, y1: Y0, y2: Y0, stroke: 'var(--mute)', 'stroke-dasharray': '5 5' }, svgE);
    SV('text', { x: X1 - 14, y: Y0 - 8, 'text-anchor': 'end', 'font-size': 11, fill: 'var(--mute)', text: 'eredeti helyzet' }, svgE);
    const yS = (v) => Y0 + v * K;
    const omega = (s[3] - s[0]) / (Lm * 1000); // dőlés
    SV('line', { x1: sx(0), y1: yS(s[0]), x2: sx(12), y2: yS(s[3]), stroke: 'var(--sky)', 'stroke-width': 1.5, 'stroke-dasharray': '6 4' }, svgE);
    SV('polyline', { points: xsM.map((m, i) => `${sx(m)},${yS(s[i])}`).join(' '), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 5, 'stroke-linejoin': 'round' }, svgE);
    // pillérek / falak
    xsM.forEach((m, i) => { SV('line', { x1: sx(m), x2: sx(m), y1: yS(s[i]) - 60, y2: yS(s[i]), stroke: 'var(--ink2)', 'stroke-width': 3 }, svgE); SV('circle', { cx: sx(m), cy: yS(s[i]), r: 6, fill: 'var(--teal)' }, svgE); SV('text', { x: sx(m), y: yS(s[i]) + 24, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: 'var(--ink2)', text: 'ABCD'[i] + ' · ' + s[i] + ' mm' }, svgE); SV('line', { x1: sx(m), x2: sx(m), y1: Y0, y2: yS(s[i]), stroke: 'var(--coral)', 'stroke-width': 1.5 }, svgE); });
    // relatív lehajlás
    let Dmax = 0, Dx = 0; for (const i of [1, 2]) { const lin = s[0] + (s[3] - s[0]) * xsM[i] / Lm; const d = s[i] - lin; if (Math.abs(d) > Math.abs(Dmax)) { Dmax = d; Dx = i; } }
    if (Math.abs(Dmax) > 0.5) { const lin = s[0] + (s[3] - s[0]) * xsM[Dx] / Lm; SV('line', { x1: sx(xsM[Dx]) + 10, x2: sx(xsM[Dx]) + 10, y1: yS(lin), y2: yS(s[Dx]), stroke: 'var(--violet)', 'stroke-width': 3 }, svgE); SV('text', { x: sx(xsM[Dx]) + 16, y: (yS(lin) + yS(s[Dx])) / 2 + 4, 'font-size': 12, 'font-weight': 800, fill: 'var(--violet)', text: 'Δ' }, svgE); }
    const theta = [0, 1, 2].map(i => (s[i + 1] - s[i]) / 4000); const beta = theta.map(t => t - omega); const bmax = Math.max(...beta.map(Math.abs));
    const smax = Math.max(...s), dsmax = Math.max(...[0, 1, 2].map(i => Math.abs(s[i + 1] - s[i]))); const ratio = Math.abs(Dmax) / (Lm * 1000);
    const lvl = (v, a, b) => v <= a ? '' : v <= b ? ' w' : ' b'; const bl = (v) => v === 0 ? '0' : `1/${Math.round(1 / v)}`;
    $('#movRes').innerHTML = `
      <div class="r"><span>max. süllyedés s</span><b>${smax} mm</b> <span class="status${lvl(smax, 50, 75)}">${smax <= 50 ? '≤ 50 mm ✓' : 'nagy'}</span></div>
      <div class="r"><span>max. süllyedéskülönbség δs (szomszédos)</span><b>${dsmax} mm</b> <span class="status${lvl(dsmax, 20, 30)}">${dsmax <= 20 ? '≤ 20 mm ✓' : '> 20 mm'}</span></div>
      <div class="r"><span>merev billenés ω (A–D)</span><b>${bl(Math.abs(omega))}</b> <span class="status${lvl(Math.abs(omega), 1 / 500, 1 / 300)}">${Math.abs(omega) <= 1 / 300 ? 'nem feltűnő' : 'szemmel látható (≈ 1/300)'}</span></div>
      <div class="r"><span>relatív elfordulás β (max.)</span><b>${bl(bmax)}</b> <span class="status${lvl(bmax, 1 / 500, 1 / 150)}">${bmax <= 1 / 500 ? '≤ 1/500 ✓' : bmax <= 1 / 300 ? 'repedés lehet' : bmax <= 1 / 150 ? 'repedések' : 'tönkremenetel!'}</span></div>
      <div class="r" style="grid-column:1/-1"><span>relatív lehajlás Δ és lehajlási viszonyszám Δ/L</span><b>${fmt(Math.abs(Dmax), 1)} mm · ${ratio ? '1/' + Math.round(1 / ratio) : '0'}</b> <span class="muted" style="display:inline;font-size:12px">${Dmax > 0.5 ? 'homorú (sagging)' : Dmax < -0.5 ? 'domború (hogging)' : ''}</span></div>`;
  };
  ids.forEach(id => $('#' + id).addEventListener('input', draw));
  window.U.seg('movPre', v => { presets[v].forEach((x, i) => { $('#' + ids[i]).value = x; }); draw(); });
  draw();
})();

/* ---------- egyenlőtlen süllyedés hat oka (mini ábrák) ---------- */
(function causes() {
  $$('[data-cause]').forEach(host => {
    const k = +host.dataset.cause; const s = svg(host, 220, 120); pat(s); const g = SV('g', {}, s);
    const ground = (c = 'url(#pSand)') => SV('rect', { x: 0, y: 62, width: 220, height: 58, fill: c }, g);
    const bld = (x, w, h, rot = 0, cx = x) => { const b = SV('g', { transform: `rotate(${rot} ${cx} 62)` }, g); SV('rect', { x, y: 62 - h, width: w, height: h, fill: '#f5efe2', stroke: '#5b524a', 'stroke-width': 1.5 }, b); for (let i = 0; i < Math.floor(w / 18); i++) SV('rect', { x: x + 6 + i * 18, y: 62 - h + 8, width: 9, height: 9, fill: '#9fc3d6' }, b); return b; };
    if (k === 1) { ground(); SV('rect', { x: 110, y: 62, width: 110, height: 58, fill: 'url(#pClay)' }, g); bld(50, 120, 40, 4, 50); SV('text', { x: 8, y: 114, text: 'tömör', 'font-size': 10, fill: '#5d4a2b' }, g); SV('text', { x: 172, y: 114, text: 'puha', 'font-size': 10, fill: '#fff' }, g); }
    if (k === 2) { ground(); bld(60, 100, 40, 3.5, 60); SV('path', { d: 'M150,4 L150,18', stroke: '#d4553a', 'stroke-width': 3 }, g); SV('path', { d: 'M144,14 L150,22 L156,14 Z', fill: '#d4553a' }, g); SV('text', { x: 158, y: 14, text: 'N, e ≠ 0', 'font-size': 10, fill: '#d4553a', 'font-weight': 700 }, g); }
    if (k === 3) { ground(); bld(30, 160, 36, 0); SV('rect', { x: 34, y: 62, width: 6, height: 50, fill: '#9aa1a6' }, g); SV('rect', { x: 52, y: 62, width: 6, height: 50, fill: '#9aa1a6' }, g); SV('text', { x: 30, y: 116, text: 'cölöp', 'font-size': 10, fill: '#5d4a2b' }, g); SV('text', { x: 150, y: 80, text: 'síkalap', 'font-size': 10, fill: '#5d4a2b' }, g); SV('path', { d: 'M118,40 l8,8 l-4,4 l8,8', stroke: '#3b2f28', fill: 'none', 'stroke-width': 1.6 }, g); }
    if (k === 4) { ground(); bld(30, 70, 46, 2.5, 30); bld(120, 70, 46, -2.5, 190); SV('ellipse', { cx: 110, cy: 86, rx: 44, ry: 22, fill: '#d4553a', opacity: .25 }, g); SV('text', { x: 92, y: 112, text: 'Δσ +', 'font-size': 10, fill: '#a63a23', 'font-weight': 700 }, g); }
    if (k === 5) { ground(); SV('circle', { cx: 110, cy: 98, r: 14, fill: '#333' }, g); SV('path', { d: 'M20,62 Q110,80 200,62', fill: 'none', stroke: '#d4553a', 'stroke-width': 2, 'stroke-dasharray': '4 3' }, g); bld(120, 70, 40, -3, 190); SV('text', { x: 130, y: 104, text: 'alagút', 'font-size': 10, fill: '#3b2f28', 'font-weight': 700 }, g); }
    if (k === 6) { ground('url(#pClay)'); SV('rect', { x: 150, y: 62, width: 40, height: 58, fill: '#2a3a40', opacity: .5 }, g); SV('line', { x1: 0, y1: 78, x2: 150, y2: 78, stroke: '#2b78ad', 'stroke-width': 2 }, g); SV('path', { d: 'M150,78 Q170,100 190,104', fill: 'none', stroke: '#2b78ad', 'stroke-width': 2 }, g); bld(40, 90, 40, 3, 40); SV('text', { x: 150, y: 58, text: 'gödör', 'font-size': 10, fill: '#5d4a2b' }, g); }
  });
})();

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
    { id: 'd5', n: 'Cementbesajtolás', d: 'durva szemcsés (> 0,8–1 mm), repedezett talaj', href: '#szilarditas', c: 'var(--violet)' },
    { id: 'd6', n: 'Kétkomponensű műanyag injektálás', d: 'homokos, iszapos talaj, utólagos megerősítés', href: '#szilarditas', c: 'var(--violet)' },
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
      case 'd5': add(soil === 'szemcses' ? 2 : soil === 'kotott' ? -1 : 0, soil === 'szemcses' ? 'durva szemcséknél' : 'finom talajba nem jut be a cement'); if (sit === 'meglevo') add(1, 'utólagos beavatkozás is'); break;
      case 'd6': add(soil === 'szemcses' || soil === 'feltoltes' ? 2 : soil === 'kotott' ? -3 : -1, soil === 'kotott' ? 'agyagban nem hatékony' : 'homokos-iszapos talaj'); if (sit === 'meglevo') add(3, 'meglévő alap utólagos megerősítése'); break;
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
      SV('text', { x: 8, y: Y + 18, text: n1, 'font-size': 12, 'font-weight': 700, fill: good ? '#fff' : '#5d4a2b' }, g); SV('text', { x: 8, y: Hh - 10, text: n2, 'font-size': 12, 'font-weight': 700, fill: good ? '#5d4a2b' : '#fff' }, g);
      const cx = 155, w = B * k; const depth = 1.25 * B * k; // a 0,2·q-s izobár kb. 1,2–1,3·B mélyre ér (négyzetes alap)
      const bulb = `M${cx - w / 2},${Y + 8} C${cx - w * 0.95},${Y + depth * 0.35} ${cx - w * 0.55},${Y + depth} ${cx},${Y + 8 + depth} C${cx + w * 0.55},${Y + depth} ${cx + w * 0.95},${Y + depth * 0.35} ${cx + w / 2},${Y + 8} Z`;
      const reach = Y + 8 + depth > yB; SV('path', { d: bulb, fill: reach ? (good ? '#39c2a5' : '#d4553a') : '#e5ae47', opacity: .5, stroke: reach ? (good ? '#0d7a68' : '#a63a23') : '#c2830c', 'stroke-width': 2 }, g);
      SV('rect', { x: cx - w / 2, y: Y, width: w, height: 8, fill: '#c3c7ca', stroke: '#4b5458' }, g); SV('rect', { x: cx - 7, y: Y - 26, width: 14, height: 26, fill: '#c3c7ca', stroke: '#4b5458' }, g);
      SV('text', { x: 0, y: 22, text: nm + ' eset', 'font-size': 17, 'font-weight': 800, fill: 'var(--ink)' }, g);
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
    $(`[data-for="bsN"]`).textContent = n + ' szint'; $(`[data-for="bsP"]`).textContent = p ? p + ' pinceszint' : 'nincs pince'; $(`[data-for="bsT"]`).textContent = Math.round(prog * 100) + '%';
    const g0 = 19, qf = 12, plate = 15; const D = p ? p * 3.2 + 0.6 : 0.8; const qB = qf * (n + p) + plate; const relief = g0 * D; const net = qB - relief; const ratio = relief / qB;
    const W = 640, Hh = 370, gy = 196, bw = 180, bx = 150; const fl = Math.min(13, (gy - 18) / (n * 2.88 + 0.5)); const s = svg(host, W, Hh); pat(s);
    SV('rect', { x: 0, y: 0, width: W, height: gy, fill: 'var(--card2)' }, s); SV('rect', { x: 0, y: gy, width: W, height: Hh - gy, fill: 'url(#pClay)' }, s);
    // kiemelt földtömeg (oldalt kupac)
    SV('path', { d: `M${450},${gy} L${525},${gy - Math.min(120, 26 + D * 9)} L${610},${gy} Z`, fill: 'url(#pClay)', stroke: '#5b4636' }, s);
    SV('text', { x: 530, y: gy + 18, 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, fill: '#fff', text: `kiemelt föld: γ·D = ${Math.round(relief)} kPa` }, s);
    // épület
    const built = Math.round((n + p) * prog); const fh = 2.88 * fl;
    const yb = gy + D * fl; SV('rect', { x: bx - 6, y: gy, width: bw + 12, height: D * fl, fill: 'var(--bg)', stroke: '#5b524a' }, s);
    for (let i = 0; i < n + p; i++) { if (i >= built && prog < 1) break; const y = yb - 9 - (i + 1) * fh; SV('rect', { x: bx, y, width: bw, height: fh, fill: i < p ? '#d9d4c7' : '#f5efe2', stroke: '#5b524a', 'stroke-width': fh < 18 ? .8 : 1.2 }, s); if (i >= p) for (let k = 0; k < 6; k++) SV('rect', { x: bx + 11 + k * 28, y: y + fh * 0.28, width: 13, height: fh * 0.42, fill: '#9fc3d6' }, s); }
    SV('rect', { x: bx - 6, y: yb - 9, width: bw + 12, height: 9, fill: '#bfc3c6', stroke: '#5b524a' }, s);
    SV('text', { x: bx - 12, y: yb + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#fff', 'font-weight': 700, text: `D = ${fmt(D, 1)} m` }, s);
    // mérleg
    const qNow = qB * prog; const mx = 70, my = 40, mh = 90; SV('text', { x: mx, y: my - 10, 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, fill: 'var(--ink2)', text: 'épület / föld' }, s);
    const sc = mh / Math.max(qB, relief, 1); SV('rect', { x: mx - 30, y: my + mh - qNow * sc, width: 24, height: qNow * sc, fill: 'var(--coral)', rx: 3 }, s); SV('rect', { x: mx + 6, y: my + mh - relief * sc, width: 24, height: relief * sc, fill: '#8c735f', rx: 3 }, s);
    SV('text', { x: mx - 18, y: my + mh + 14, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--mute)', text: Math.round(qNow) }, s); SV('text', { x: mx + 18, y: my + mh + 14, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--mute)', text: Math.round(relief) }, s);
    // konszolidációs görbe
    const cx0 = 372, cy0 = 248, cw = 248, ch = 96; const G = SV('g', {}, s);
    SV('rect', { x: cx0 - 10, y: cy0 - 20, width: cw + 20, height: ch + 34, rx: 10, fill: 'var(--card)', opacity: .94 }, G);
    SV('text', { x: cx0, y: cy0 - 4, 'font-size': 11.5, 'font-weight': 800, fill: 'var(--ink)', text: 'teher és süllyedés az építés során' }, G);
    const tx = (u) => cx0 + u * cw, qy = (v) => cy0 + 46 - v / Math.max(qB, relief) * 36, sy = (v) => cy0 + 54 + v * 0.8;
    SV('line', { x1: tx(0), x2: tx(1), y1: qy(relief), y2: qy(relief), stroke: '#8c735f', 'stroke-dasharray': '5 4' }, G); SV('text', { x: tx(0.38), y: qy(relief) - 4, 'font-size': 9.5, fill: 'var(--mute)', text: 'tehermentesítés' }, G);
    const pts = [], sp = []; for (let u = 0; u <= 1.0001; u += 0.02) { const q = qB * u; pts.push(`${tx(u)},${qy(q)}`); const ds = q <= relief ? q / Math.max(relief, 1) * 3 : 3 + (q - relief) * 0.55; sp.push(`${tx(u)},${sy(Math.min(52, ds))}`); }
    SV('polyline', { points: pts.join(' '), fill: 'none', stroke: 'var(--coral)', 'stroke-width': 2 }, G); SV('polyline', { points: sp.join(' '), fill: 'none', stroke: 'var(--teal)', 'stroke-width': 2.5 }, G);
    SV('line', { x1: tx(prog), x2: tx(prog), y1: cy0 + 4, y2: cy0 + ch + 6, stroke: 'var(--ink2)', 'stroke-dasharray': '2 3' }, G);
    SV('text', { x: tx(0) + 2, y: cy0 + 14, 'font-size': 9.5, fill: 'var(--coral-ink)', 'font-weight': 700, text: 'összes teher' }, G); SV('text', { x: tx(0) + 2, y: cy0 + ch + 8, 'font-size': 9.5, fill: 'var(--teal-ink)', 'font-weight': 700, text: 'süllyedés ↓' }, G);
    const out = $('#bsOut'); const pct = Math.round(ratio * 100);
    out.innerHTML = `<div class="r"><span>épületteher (q)</span><b>${Math.round(qB)} kPa</b></div><div class="r"><span>kiemelt föld (γ·D)</span><b>${Math.round(relief)} kPa</b></div><div class="r"><span>többletfeszültség q − γ·D</span><b style="color:${net <= 0 ? 'var(--ok)' : 'var(--ink)'}">${Math.round(net)} kPa</b></div><div class="r"><span>kompenzáltság</span><b>${pct}%</b></div>`;
    $('#bsMsg').innerHTML = net <= 0 ? `<b>Teljesen kompenzált alapozás:</b> a kiemelt talaj súlya nagyobb az épületénél, az altalajra hárított többletfeszültség „negatív” – kellően merev vb. lemezalappal az építmény gyakorlatilag mozdulatlan. <span class="muted">(Túlkompenzálásnál a talaj megemelkedhet, talajvíz alatt a felúszást is ellenőrizni kell.)</span>` : ratio > 0.6 ? `<b>Részben kompenzált:</b> a terhelés ${pct}%-át a kiemelt föld „ellensúlyozza” – a süllyedés csak a többletből keletkezik, és csak akkor indul meg, amikor az építés túllépi a tehermentesítést.` : `<b>Gyenge kompenzáció:</b> a kiemelt föld a teher kis részét ellensúlyozza. Próbálj több pinceszintet!`;
  };
  [rN, rP, rT].forEach(r => r.addEventListener('input', draw)); draw();
  const pl = $('#bsPlay'); if (pl) pl.addEventListener('click', () => { const t0 = performance.now(); const step = (t) => { const u = clamp((t - t0) / 4000, 0, 1); rT.value = Math.round(u * 100); draw(); if (u < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); });
})();

/* ---------- 3 eset: teher / szélesség hatása a feszültségre ---------- */
(function threeCases() {
  const host = $('#tcSvg'); if (!host) return; const s = svg(host, 660, 220);
  const cases = [['Kétszeres teher', 'b, 2q', 'feszültség mindenhol kétszeres, a mélység ugyanaz', 1, 2], ['Kétszeres szélesség', '2b, q', 'ugyanaz a feszültség kétszer mélyebben', 2, 1], ['Fele felület', 'b/2, 2q', 'nagy feszültség felül, de sekély hatás', 0.5, 2]];
  cases.forEach(([t, lab, d, wk, qk], i) => {
    const g = SV('g', { transform: `translate(${i * 220 + 10},0)` }, s); const cx = 100, Y = 46, w0 = 44;
    SV('text', { x: 0, y: 18, text: `${i + 1}. ${t}`, 'font-size': 13, 'font-weight': 800, fill: 'var(--ink)' }, g);
    const bulb = (w, dep, col, op, dash) => SV('path', { d: `M${cx - w / 2},${Y} C${cx - w},${Y + dep * .4} ${cx - w * .5},${Y + dep} ${cx},${Y + dep} C${cx + w * .5},${Y + dep} ${cx + w},${Y + dep * .4} ${cx + w / 2},${Y} Z`, fill: col, 'fill-opacity': op, stroke: col, 'stroke-width': 1.6, 'stroke-dasharray': dash || '' }, g);
    bulb(w0, 70, 'var(--mute)', 0, '4 4'); bulb(w0 * wk, 70 * wk, qk > 1 ? 'var(--coral)' : 'var(--teal)', .28 + (qk - 1) * .2);
    SV('rect', { x: cx - w0 * wk / 2, y: Y - 7, width: w0 * wk, height: 7, fill: '#c3c7ca', stroke: '#4b5458' }, g);
    for (let k = 0; k < Math.max(2, Math.round(3 * qk)); k++) { const x = cx - w0 * wk / 2 + (k + .5) * (w0 * wk) / Math.max(2, Math.round(3 * qk)); SV('line', { x1: x, x2: x, y1: Y - 26, y2: Y - 10, stroke: 'var(--coral)', 'stroke-width': 1.6 }, g); SV('path', { d: `M${x - 3},${Y - 13} L${x},${Y - 8} L${x + 3},${Y - 13}`, fill: 'var(--coral)' }, g); }
    SV('text', { x: cx + w0 * wk / 2 + 6, y: Y - 12, text: lab, 'font-size': 11, 'font-weight': 700, fill: 'var(--coral-ink)' }, g);
    const tx = SV('text', { x: 0, y: 200, 'font-size': 11.5, fill: 'var(--ink2)' }, g); const words = d.split(' '); let line = '', yy = 196; words.forEach(wd => { if ((line + wd).length > 30) { SV('tspan', { x: 0, y: yy, text: line }, tx); line = ''; yy += 15; } line += wd + ' '; }); SV('tspan', { x: 0, y: yy, text: line }, tx);
  });
})();
})();
