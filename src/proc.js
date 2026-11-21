/* ===== Folyamatábrák a talajjavítási módszerekhez (a BME-videók ábrái és szövegei alapján) =====
   Minden ábra lépésenkénti metszetsor: számozott panel, cím, rajz, rövid magyarázat.
   Széles nézetben egy sorban, keskenyben két oszlopban. Az útvonalak szóközzel írva (az angol build tizedesvessző-cseréje miatt). */
(function () {
const { $, $$ } = window.U; const SV = window.SV, svg = window.mkSvg, pat = window.SVpat;
const PW = 260, PH = 330, GY = 150, GB = 250;           // panel szélessége/magassága, terep- és talajalj-szint a panelen belül
const C = { yel: '#f2b705', yelD: '#b88700', steel: '#7c848c', steelD: '#4b5258', dark: '#2f3439', water: '#3b8fd0', halo: '#ef8a2a', grout: '#d8d4c8', groutD: '#9c968a', conc: '#c3c7ca' };

/* --- alapelemek --- */
const P = (d, a, g) => SV('path', { d, ...a }, g);
const R = (x, y, w, h, a, g) => SV('rect', { x, y, width: w, height: h, ...a }, g);
const L = (x1, y1, x2, y2, a, g) => SV('line', { x1, y1, x2, y2, ...a }, g);
const T = (x, y, text, a, g) => SV('text', { x, y, text, ...a }, g);
const arrowDown = (g, x, y1, y2, c = 'var(--ink)', w = 2, hw = 5) => { L(x, y1, x, y2 - hw * 1.3, { stroke: c, 'stroke-width': w }, g); P(`M${x - hw} ${y2 - hw * 1.6}L${x} ${y2}L${x + hw} ${y2 - hw * 1.6}Z`, { fill: c }, g); };
const arrowH = (g, x1, x2, y, c = 'var(--ink)', w = 1.8, hw = 5) => { const s = Math.sign(x2 - x1); L(x1, y, x2 - s * hw * 1.3, y, { stroke: c, 'stroke-width': w }, g); P(`M${x2 - s * hw * 1.6} ${y - hw}L${x2} ${y}L${x2 - s * hw * 1.6} ${y + hw}Z`, { fill: c }, g); };
const arrowUp = (g, x, y1, y2, c = 'var(--ink)', w = 2, hw = 5) => { L(x, y1, x, y2 + hw * 1.3, { stroke: c, 'stroke-width': w }, g); P(`M${x - hw} ${y2 + hw * 1.6}L${x} ${y2}L${x + hw} ${y2 + hw * 1.6}Z`, { fill: c }, g); };
/* felirat kis kártyán (mintás talajon is olvasható) */
const tag = (g, x, y, text, o = {}) => { const gg = SV('g', {}, g); const t = T(x, y, text, { 'font-size': o.fs || 11.5, 'font-weight': o.fw || 700, 'text-anchor': o.a || 'middle', style: `fill:${o.c || 'var(--ink)'}` }, gg); try { const b = t.getBBox(); const r = R(b.x - 5, b.y - 2.5, b.width + 10, b.height + 5, { rx: 5, fill: 'var(--card)', opacity: .92, stroke: o.c || 'var(--line)', 'stroke-opacity': .5 }); gg.insertBefore(r, t); } catch (e) { } return gg; };
let uid = 0;
const defs = (s) => { let d = s.querySelector('defs'); if (!d) d = SV('defs', {}, s); return d; };
const radial = (s, c, op) => { const id = 'prh' + (++uid); const rg = SV('radialGradient', { id }, defs(s)); SV('stop', { offset: '0', 'stop-color': c, 'stop-opacity': op }, rg); SV('stop', { offset: '.7', 'stop-color': c, 'stop-opacity': op * .45 }, rg); SV('stop', { offset: '1', 'stop-color': c, 'stop-opacity': 0 }, rg); return `url(#${id})`; };
const halo = (g, s, cx, cy, rx, ry, c = C.halo, op = .62) => SV('ellipse', { cx, cy, rx, ry, fill: radial(s, c, op) }, g);

/* terep: ég, rétegek, fű; a rétegek: [{to, fill, name}] felülről lefelé */
const ground = (g, layers = [{ to: GB, fill: 'url(#pSand)' }]) => {
  R(0, 40, PW, GY - 40, { fill: 'var(--prsky)' }, g);
  let y = GY; layers.forEach(l => { R(0, y, PW, l.to - y, { fill: l.fill }, g); y = l.to; });
  R(0, GY - 3, PW, 4, { fill: '#7d9a5b' }, g);
};
const layerName = (g, x, y, text, a = 'start') => T(x, y, text, { 'font-size': 10.5, 'font-weight': 700, 'text-anchor': a, class: 'hl', style: 'fill:var(--ink2)' }, g);

/* gépek */
const tracks = (g, x, w, y) => { R(x, y - 12, w, 12, { rx: 6, fill: C.dark }, g); for (let i = 0; i < 5; i++) SV('circle', { cx: x + 7 + i * (w - 14) / 4, cy: y - 6, r: 3.2, fill: '#6b7178' }, g); };
/* lánctalpas rácsos gémű daru: x a lánctalp közepe, a gémcsúcs (tx, ty) */
const crane = (g, x, tx, ty, flip = 1) => {
  tracks(g, x - 34, 68, GY);
  R(x - 26, GY - 36, 50, 24, { rx: 3, fill: C.yel, stroke: C.yelD, 'stroke-width': 1.2 }, g);
  R(x - 22 * flip - (flip < 0 ? 14 : 0), GY - 33, 14, 12, { rx: 2, fill: '#cfe6f2', stroke: C.yelD }, g);
  R(flip > 0 ? x + 14 : x - 30, GY - 34, 14, 20, { fill: C.yelD }, g);
  const px = x - 10 * flip, py = GY - 34; const dx = tx - px, dy = ty - py, len = Math.hypot(dx, dy), nx = -dy / len * 3.2, ny = dx / len * 3.2;
  P(`M${px + nx} ${py + ny}L${tx + nx * .4} ${ty + ny * .4}M${px - nx} ${py - ny}L${tx - nx * .4} ${ty - ny * .4}`, { stroke: C.yelD, 'stroke-width': 1.6, fill: 'none' }, g);
  let zz = ''; const n = Math.max(6, Math.round(len / 9)); for (let i = 0; i <= n; i++) { const u = i / n, s = (i % 2 ? 1 : -1) * (1 - .6 * u); zz += (i ? 'L' : 'M') + (px + dx * u + nx * s).toFixed(1) + ' ' + (py + dy * u + ny * s).toFixed(1); }
  P(zz, { stroke: C.yel, 'stroke-width': 1, fill: 'none' }, g);
  L(x + 18 * flip, GY - 36, tx, ty, { stroke: '#555', 'stroke-width': .8 }, g);
  return { tx, ty };
};
/* rakodógép (homlokrakodó): x a gép közepe, dir = 1 jobbra néz; bucketY: a kanál magassága */
const loader = (g, x, dir = 1, bucketY = GY - 18, spill = false) => {
  const b = (v) => x + v * dir;
  SV('circle', { cx: b(-14), cy: GY - 8, r: 8, fill: C.dark }, g); SV('circle', { cx: b(14), cy: GY - 8, r: 8, fill: C.dark }, g);
  P(`M${b(-24)} ${GY - 12}L${b(24)} ${GY - 12}L${b(24)} ${GY - 24}L${b(6)} ${GY - 24}L${b(2)} ${GY - 40}L${b(-12)} ${GY - 40}L${b(-14)} ${GY - 24}L${b(-24)} ${GY - 24}Z`, { fill: C.yel, stroke: C.yelD, 'stroke-width': 1 }, g);
  R(Math.min(b(-10), b(0)), GY - 37, 10, 11, { fill: '#cfe6f2', stroke: C.yelD, 'stroke-width': .8 }, g);
  L(b(18), GY - 22, b(34), bucketY + 4, { stroke: C.yelD, 'stroke-width': 3 }, g);
  P(`M${b(30)} ${bucketY - 4}L${b(44)} ${bucketY - 4}L${b(42)} ${bucketY + 8}L${b(30)} ${bucketY + 8}Z`, { fill: '#8e969d', stroke: C.steelD, 'stroke-width': 1 }, g);
  if (spill) for (let i = 0; i < 10; i++) SV('circle', { cx: b(40 + (i % 3) * 2.5), cy: bucketY + 12 + i * 3.2, r: 1.6, fill: '#9a8a70' }, g);
};
/* mélyvibrátor (vibroflot): függesztett cső + vibrátortest + kúpos orr */
const vibro = (g, x, top, nose, w = 12) => {
  R(x - w * .35, top, w * .7, nose - 46 - top, { fill: C.steel, stroke: C.steelD, 'stroke-width': .8 }, g);
  R(x - w / 2, nose - 48, w, 40, { rx: 2, fill: '#5d646b', stroke: C.steelD, 'stroke-width': 1 }, g);
  for (let i = 0; i < 4; i++) L(x - w / 2 + 1, nose - 42 + i * 9, x + w / 2 - 1, nose - 42 + i * 9, { stroke: '#8d959c', 'stroke-width': .8 }, g);
  P(`M${x - w / 2} ${nose - 8}L${x} ${nose}L${x + w / 2} ${nose - 8}Z`, { fill: C.steelD }, g);
};
const jets = (g, x, y, up = false) => { for (const s of [-1, 1]) for (let k = 0; k < 3; k++) P(`M${x + s * 7} ${y - 4 - k * 9}q${s * 10} ${up ? -6 : 4} ${s * 18} ${up ? -2 : 8}`, { stroke: C.water, 'stroke-width': 1.4, fill: 'none', 'stroke-dasharray': '3 2' }, g); };
/* vibrációs hullámjel */
const shake = (g, x, y) => { for (const s of [-1, 1]) P(`M${x + s * 10} ${y - 8}q${s * 4} 4 0 8q${s * -4} 4 0 8`, { stroke: 'var(--ink2)', 'stroke-width': 1.1, fill: 'none' }, g); };
/* kavics/zúzottkő foltokkal */
const gravel = (g, d, op = 1) => P(d, { fill: 'url(#pGrav)', stroke: '#6b5a44', 'stroke-width': 1, opacity: op }, g);

/* a panelnél szélesebb felirat betűméretét arányosan csökkenti (keskeny nézetben a betűnagyító miatt) */
const fit = (t, max) => { try { const w = t.getBBox().width; if (w > max) t.setAttribute('font-size', (parseFloat(t.getAttribute('font-size')) * max / w).toFixed(2)); } catch (e) { } return t; };
/* --- panelsor --- */
const strip = (host, steps, opt = {}) => {
  const draw = () => {
    const cw = host.clientWidth || 1000, n = steps.length, cols = cw < 640 ? 2 : n, rows = Math.ceil(n / cols), gap = 22;
    const W = cols * PW + (cols - 1) * gap, H = rows * PH + (rows - 1) * 14; const s = svg(host, W, H); pat(s);
    steps.forEach((st, i) => {
      const lone = cols < n && n % cols && i === n - 1, cx = lone ? (W - PW) / 2 : (i % cols) * (PW + gap), cy = Math.floor(i / cols) * (PH + 14);
      const id = 'prc' + (++uid); const cp = SV('clipPath', { id }, defs(s)); R(0, 0, PW, PH, { rx: 12 }, cp);
      const g = SV('g', { transform: `translate(${cx} ${cy})` }, s);
      R(0, 0, PW, PH, { rx: 12, fill: 'var(--card)', stroke: 'var(--line)' }, g);
      const inner = SV('g', { 'clip-path': `url(#${id})` }, g);
      st.d(inner, s);
      R(0, 0, PW, 40, { fill: 'var(--card)' }, inner); L(0, 40, PW, 40, { stroke: 'var(--line2)' }, inner);
      R(0, GB, PW, PH - GB, { fill: 'var(--card)' }, inner); L(0, GB, PW, GB, { stroke: 'var(--line2)' }, inner);
      SV('circle', { cx: 22, cy: 20, r: 12, fill: 'var(--c)' }, g); T(22, 24.5, String(i + 1), { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, style: 'fill:#fff' }, g);
      fit(T(42, 25, st.t, { 'font-size': 13.5, 'font-weight': 800, style: 'fill:var(--ink)' }, g), PW - 50);
      (st.c || []).forEach((ln, k) => fit(T(PW / 2, GB + 22 + k * 17, ln, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': k ? 500 : 600, style: 'fill:var(--ink2)' }, g), PW - 14));
      if ((i % cols) < cols - 1 && i < n - 1) { const ax = cx + PW + gap / 2, ay = cy + 150; SV('circle', { cx: ax, cy: ay, r: 10, fill: 'var(--c)' }, s); P(`M${ax - 3} ${ay - 5}L${ax + 3} ${ay}L${ax - 3} ${ay + 5}`, { stroke: '#fff', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }, s); }
    });
  };
  draw(); let lw = innerWidth; addEventListener('resize', () => { if (Math.abs(innerWidth - lw) < 24) return; lw = innerWidth; draw(); });
  addEventListener('tabchange', () => { if (host.offsetParent && Math.abs((host.clientWidth || 0) - (host._w || 0)) > 20) { host._w = host.clientWidth; draw(); } });
};

/* ========== 2/A mélytömörítés – vibroflotáció ========== */
(function vibroFig() {
  const host = $('#vfFig'); if (!host) return;
  const soil = [{ to: 228, fill: 'url(#pSand)' }, { to: GB, fill: 'url(#pClay)' }];
  const zone = (g, nm = true) => { R(0, GY, PW, 228 - GY, { fill: '#f6c96b', opacity: .16 }, g); if (nm) layerName(g, PW - 8, 222, 'laza homok, feltöltés', 'end'); };
  const rig = (g, nose, tip = 150) => { crane(g, 205, tip, 56); L(tip, 56, tip, nose - 120, { stroke: '#444', 'stroke-width': 1 }, g); };
  strip(host, [
    { t: 'Lehajtás öblítéssel', c: ['a vibrátor önsúlyánál fogva hatol le', 'a javítandó zóna aljáig'], d: (g, s) => { ground(g, soil); zone(g); rig(g, 218); vibro(g, 150, 98, 218); jets(g, 150, 214); shake(g, 150, 196); tag(g, 92, 176, 'Ø 25–40 cm'); } },
    { t: 'Tömörödés a lyuk körül', c: ['a rezgés a lyuk környezetében', 'tömöríti a talajt'], d: (g, s) => { ground(g, soil); zone(g); halo(g, s, 150, 200, 46, 34); rig(g, 222); vibro(g, 150, 98, 222); shake(g, 150, 200); } },
    { t: 'Felhúzás, anyagadagolás', c: ['felhúzás közben kavicsot, murvát,', 'bányameddőt vagy homokot adnak'], d: (g, s) => { ground(g, soil); zone(g); halo(g, s, 150, 212, 42, 26); P(`M128 ${GY}L141 ${GY + 12}L141 222L159 222L159 ${GY + 12}L172 ${GY}Z`, { fill: 'url(#pGrav)', stroke: '#6b5a44', 'stroke-width': .8 }, g); rig(g, 196); vibro(g, 150, 98, 196); arrowUp(g, 172, 192, 168, 'var(--ink)', 1.6, 4); loader(g, 74, 1, GY - 40, true); } },
    { t: 'Tömörítés felfelé', c: ['a felfelé haladó vibrátorral', 'tömörítik a feltöltött lyukat'], d: (g, s) => { ground(g, soil); zone(g); for (let k = 0; k < 4; k++) halo(g, s, 150, 214 - k * 18, 40, 20, C.halo, .4); gravel(g, `M140 ${GY + 4}L160 ${GY + 4}L163 222L137 222Z`); rig(g, 168); vibro(g, 150, 98, 168); shake(g, 150, 160); arrowUp(g, 178, 200, 166, 'var(--ink)', 1.6, 4); } },
    { t: 'Áttömörítés raszterben', c: ['megfelelő sűrűségű raszterben;', 'pl. nagy terhelésű csarnokpadozat alá'], d: (g, s) => { ground(g, soil); zone(g, false); [40, 95, 150, 205].forEach(x => halo(g, s, x, 190, 40, 44, C.halo, .42)); [40, 95, 150, 205].forEach(x => gravel(g, `M${x - 9} ${GY + 4}L${x + 9} ${GY + 4}L${x + 12} 222L${x - 12} 222Z`)); [40, 95, 150, 205].forEach((x, k) => k < 3 && L(x, 166, x + 55, 166, { stroke: 'var(--ink2)', 'stroke-width': .8, 'stroke-dasharray': '3 3' }, g)); tag(g, 128, 240, 'tömörödött összlet', { c: '#a35a0e' }); } },
  ]);
})();

/* ========== 2/B dinamikus tömörítés ========== */
(function dynFig() {
  const host = $('#dcFig'); if (!host) return;
  const soil = [{ to: GB, fill: 'url(#pSand)' }];
  const weight = (g, x, y, w = 34, h = 16) => { R(x - w / 2, y, w, h, { rx: 3, fill: '#6a7076', stroke: C.dark, 'stroke-width': 1.2 }, g); L(x - w / 2 + 3, y + 5, x + w / 2 - 3, y + 5, { stroke: '#8d959c' }, g); };
  strip(host, [
    { t: 'Ejtés', c: ['ejtősúly 6–30 t,', 'ejtési magasság 10–30 m'], d: (g, s) => { ground(g, soil); crane(g, 200, 118, 50); L(118, 50, 118, 64, { stroke: '#444' }, g); weight(g, 118, 64); L(84, 80, 84, GY - 2, { stroke: 'var(--ink)', 'stroke-width': 1.2 }, g); [80, GY - 2].forEach(y => L(79, y, 89, y, { stroke: 'var(--ink)', 'stroke-width': 1.2 }, g)); tag(g, 58, 118, 'H = 10–30 m'); arrowDown(g, 140, 86, 120, 'var(--coral)', 1.8, 4); } },
    { t: 'Becsapódás', c: ['gödör keletkezik, a talaj', 'max. 6–8 m mélységig tömörödik'], d: (g, s) => { ground(g, soil); halo(g, s, 118, GY + 6, 72, 92); P(`M96 ${GY}Q118 ${GY + 20} 140 ${GY}Z`, { fill: '#8a7350' }, g); weight(g, 118, GY - 4); for (const r of [26, 40, 54]) P(`M${118 - r} ${GY + 2}A${r} ${r * .8} 0 0 0 ${118 + r} ${GY + 2}`, { stroke: 'var(--coral)', 'stroke-width': 1.2, fill: 'none', 'stroke-dasharray': '4 3', opacity: .8 }, g); crane(g, 205, 140, 60); L(212, GY + 4, 212, GY + 92, { stroke: 'var(--ink)', 'stroke-width': 1.2 }, g); [GY + 4, GY + 92].forEach(y => L(207, y, 217, y, { stroke: 'var(--ink)', 'stroke-width': 1.2 }, g)); tag(g, 214, GY + 52, '6–8 m', { a: 'end' }); } },
    { t: 'Raszterben, fázisonként', c: ['tömörítési raszter és fázisonkénti', 'ejtésszám a talaj alapján'], d: (g, s) => { ground(g, soil); [30, 78, 126, 174, 222].forEach((x, k) => { halo(g, s, x, GY + 30, 30, 64, C.halo, .38); P(`M${x - 13} ${GY}Q${x} ${GY + 14} ${x + 13} ${GY}Z`, { fill: '#8a7350' }, g); }); [30, 78, 126, 174, 222].forEach(x => T(x, GY - 10, 'I.', { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, class: 'hl', style: 'fill:var(--coral-ink)' }, g)); tag(g, 130, 74, 'raszter, ejtésszám', { c: 'var(--coral-ink)' }); } },
    { t: 'Pihentetés, II. fázis', c: ['pihentetés: a pórusvíznyomás leépül;', 'a köztes pontok, végül elegyengetés'], d: (g, s) => { ground(g, soil); [30, 78, 126, 174, 222].forEach(x => halo(g, s, x, GY + 30, 30, 64, C.halo, .38)); [54, 102, 150, 198].forEach(x => { halo(g, s, x, GY + 24, 26, 54, C.halo, .34); P(`M${x - 12} ${GY}Q${x} ${GY + 13} ${x + 12} ${GY}Z`, { fill: '#8a7350' }, g); T(x, GY - 10, 'II.', { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, class: 'hl', style: 'fill:var(--coral-ink)' }, g); }); for (let k = 0; k < 5; k++) arrowUp(g, 24 + k * 50, GY + 80, GY + 58, C.water, 1.4, 3.5); tag(g, 130, 74, 'pórusvíz távozik', { c: C.water }); } },
  ]);
})();

/* ========== 2/C kőtömzs ========== */
(function stoneFig() {
  const host = $('#ktFig'); if (!host) return;
  const soil = [{ to: GB, fill: 'url(#pSoft)' }];
  const weight = (g, x, y) => { R(x - 17, y, 34, 26, { rx: 6, fill: C.conc, stroke: C.dark, 'stroke-width': 1.2 }, g); L(x - 12, y + 8, x + 12, y + 8, { stroke: '#9aa1a6' }, g); };
  const name = (g) => layerName(g, PW - 8, 242, 'nagyon puha kötött/szerves talaj', 'end');
  strip(host, [
    { t: 'Kráter döngöléssel', c: ['az ejtősúly gödröt üt', 'a puha talajba'], d: (g, s) => { ground(g, soil); name(g); P(`M98 ${GY}L104 ${GY + 30}L132 ${GY + 30}L138 ${GY}Z`, { fill: '#5d5546' }, g); crane(g, 205, 118, 52); L(118, 52, 118, 70, { stroke: '#444' }, g); weight(g, 118, 70); arrowDown(g, 146, 80, 118, 'var(--coral)', 1.8, 4); } },
    { t: 'Szemcsés anyag', c: ['homokos kavics, zúzottkő vagy', 'bányameddő kerül a gödörbe'], d: (g, s) => { ground(g, soil); name(g); P(`M98 ${GY}L104 ${GY + 30}L132 ${GY + 30}L138 ${GY}Z`, { fill: '#5d5546' }, g); gravel(g, `M100 ${GY - 4}Q118 ${GY - 16} 136 ${GY - 4}L132 ${GY + 30}L104 ${GY + 30}Z`); loader(g, 52, 1, GY - 46, true); } },
    { t: 'Bedöngölés', c: ['a döngölőgép a szemcsés anyagot', 'a puha altalajba „bedolgozza”'], d: (g, s) => { ground(g, soil); name(g); halo(g, s, 118, GY + 46, 58, 40, C.halo, .45); gravel(g, `M102 ${GY}L98 ${GY + 30}Q96 ${GY + 66} 118 ${GY + 70}Q140 ${GY + 66} 138 ${GY + 30}L134 ${GY}Z`); weight(g, 118, GY - 22); for (const sx of [-1, 1]) arrowH(g, 118 + sx * 26, 118 + sx * 56, GY + 46, 'var(--ink2)', 1.5, 4); crane(g, 205, 140, 60); } },
    { t: 'Ismétlés', c: ['töltés és döngölés ciklusokban:', 'a tömzs lefelé és oldalra épül'], d: (g, s) => { ground(g, soil); name(g); halo(g, s, 118, GY + 50, 70, 50, C.halo, .5); gravel(g, `M100 ${GY}L90 ${GY + 30}Q84 ${GY + 80} 118 ${GY + 88}Q152 ${GY + 80} 146 ${GY + 30}L136 ${GY}Z`); for (let k = 0; k < 3; k++) L(94, GY + 22 + k * 20, 142, GY + 22 + k * 20, { stroke: '#6b5a44', 'stroke-dasharray': '3 3', 'stroke-width': .8 }, g); weight(g, 118, GY - 26); crane(g, 205, 140, 60); } },
    { t: 'Kész kőtömzs', c: ['nagy teherbírású, nagy átmérőjű', 'tömzs, Ø 2,0–3,5 m'], d: (g, s) => { ground(g, soil); name(g); halo(g, s, 130, GY + 50, 78, 54, C.halo, .42); gravel(g, `M108 ${GY}L98 ${GY + 30}Q92 ${GY + 80} 130 ${GY + 88}Q168 ${GY + 80} 162 ${GY + 30}L152 ${GY}Z`); L(96, GY - 10, 164, GY - 10, { stroke: 'var(--ink)', 'stroke-width': 1.2 }, g); [96, 164].forEach(x => L(x, GY - 15, x, GY - 5, { stroke: 'var(--ink)', 'stroke-width': 1.2 }, g)); tag(g, 130, GY - 22, 'Ø 2,0–3,5 m'); tag(g, 214, GY + 24, 'tömörödött', { c: '#a35a0e' }); } },
  ]);
})();

/* ========== 2/D kavicscölöp – vibrált kőoszlop ========== */
(function columnFig() {
  const host = $('#kcFig'); if (!host) return;
  const soil = [{ to: 206, fill: 'url(#pSoft)' }, { to: GB, fill: 'url(#pSand)' }];
  const names = (g) => { layerName(g, 8, 200, 'puha talaj'); layerName(g, 8, 242, 'teherbíró réteg'); };
  /* vezetőoszlopos alapgép zsilipes, alsó adagolású vibrátorral; skip: az anyagtartály helye az árbocon */
  const rig = (g, x, nose, skipY = 120, support = true) => {
    tracks(g, x + 8, 64, GY);
    R(x + 14, GY - 34, 52, 22, { rx: 3, fill: C.yel, stroke: C.yelD, 'stroke-width': 1.2 }, g); R(x + 40, GY - 31, 14, 12, { rx: 2, fill: '#cfe6f2', stroke: C.yelD }, g);
    R(x - 4, 50, 7, GY - 50 - 10, { fill: C.yel, stroke: C.yelD, 'stroke-width': .8 }, g); for (let y = 56; y < GY - 14; y += 10) L(x - 4, y, x + 3, y + 10, { stroke: C.yelD, 'stroke-width': .7 }, g);
    L(x + 3, 92, x + 18, GY - 34, { stroke: C.yelD, 'stroke-width': 2 }, g);
    if (support) P(`M${x + 70} ${GY - 16}L${x + 80} ${GY}M${x + 76} ${GY}L${x + 84} ${GY}`, { stroke: C.steelD, 'stroke-width': 2.2 }, g);
    R(x - 18, 50, 12, nose - 50 - 40, { fill: C.steel, stroke: C.steelD, 'stroke-width': .8 }, g);
    P(`M${x - 22} 52L${x - 2} 52L${x - 6} 66L${x - 18} 66Z`, { fill: '#8e969d', stroke: C.steelD }, g);
    R(x - 19, nose - 42, 14, 34, { rx: 2, fill: '#5d646b', stroke: C.steelD }, g); P(`M${x - 19} ${nose - 8}L${x - 12} ${nose}L${x - 5} ${nose - 8}Z`, { fill: C.steelD }, g);
    R(x + 4, skipY, 18, 14, { rx: 2, fill: '#8e969d', stroke: C.steelD }, g);
    return x - 12;
  };
  strip(host, [
    { t: 'Előkészítés', c: ['a hordozógép a vibrátort a kitűzött', 'pont fölé állítja, támaszokra áll'], d: (g, s) => { ground(g, soil); names(g); rig(g, 150, GY - 4); P(`M131 ${GY + 2}L138 ${GY + 12}L145 ${GY + 2}`, { stroke: 'var(--coral)', 'stroke-width': 2, fill: 'none' }, g); } },
    { t: 'Töltés', c: ['a rakodógép tölti az anyagtartályt,', 'az árboc mentén a zsilipbe ürít'], d: (g, s) => { ground(g, soil); names(g); rig(g, 150, GY - 4, 62); R(96, GY - 16, 24, 15, { rx: 2, fill: '#8e969d', stroke: C.steelD }, g); gravel(g, `M98 ${GY - 16}Q108 ${GY - 24} 118 ${GY - 16}Z`); P(`M108 ${GY - 22}C108 100 120 70 150 64`, { stroke: 'var(--ink2)', 'stroke-width': 1.6, fill: 'none', 'stroke-dasharray': '4 3' }, g); P('M144 60L152 64L145 69', { stroke: 'var(--ink2)', 'stroke-width': 1.6, fill: 'none' }, g); gravel(g, `M128 52L144 52L140 64L132 64Z`); loader(g, 52, 1, GY - 40, true); } },
    { t: 'Lehajtás', c: ['rezgés, lenyomás és sűrített levegő:', 'tervezett mélységig, oldalra kiszorít'], d: (g, s) => { ground(g, soil); names(g); const ax = rig(g, 150, 232); for (const sx of [-1, 1]) arrowH(g, ax + sx * 12, ax + sx * 34, 190, 'var(--ink2)', 1.5, 4); shake(g, ax, 214); } },
    { t: 'Tömörítés', c: ['a kavicsot a mélyponton kiengedik; föl-le', 'mozgással oldalra nyomja, tömöríti'], d: (g, s) => { ground(g, soil); names(g); halo(g, s, 138, 214, 34, 26, C.halo, .5); gravel(g, `M126 ${GY + 46}Q116 ${GY + 70} 124 236Q138 244 152 236Q160 ${GY + 70} 150 ${GY + 46}Z`); const ax = rig(g, 150, 196); arrowUp(g, ax + 20, 208, 186, 'var(--ink)', 1.5, 4); arrowDown(g, ax + 30, 186, 208, 'var(--ink)', 1.5, 4); } },
    { t: 'Lezárás', c: ['kész kőoszlop Ø ≈ 0,6–1,0 m; pl. töltés-,', 'ipari padló alapozására'], d: (g, s) => { ground(g, soil); names(g); [124, 178, 232].forEach(x => { halo(g, s, x, 196, 26, 54, C.halo, .32); gravel(g, `M${x - 10} ${GY}Q${x - 14} 196 ${x - 12} 238Q${x} 246 ${x + 12} 238Q${x + 14} 196 ${x + 10} ${GY}Z`); }); R(104, GY - 10, 148, 10, { fill: 'url(#pGrav)', stroke: '#6b5a44' }, g); tag(g, 178, 96, 'teherelosztó réteg', { c: 'var(--ink2)' }); } },
  ]);
})();

/* ========== 3/A–E injektálás: a munkafolyamat ========== */
(function groutFig() {
  const host = $('#ijFig'); if (!host) return;
  const soil = [{ to: GB, fill: 'url(#pSand)' }];
  const drill = (g, x, toolY) => { tracks(g, x - 6, 56, GY); R(x - 4, GY - 32, 40, 20, { rx: 3, fill: C.yel, stroke: C.yelD }, g); R(x - 12, 62, 6, GY - 72, { fill: C.yel, stroke: C.yelD, 'stroke-width': .8 }, g); L(x - 6, 96, x + 6, GY - 32, { stroke: C.yelD, 'stroke-width': 2 }, g); R(x - 13, 62, 8, 12, { fill: '#5d646b' }, g); L(x - 9, 74, x - 9, toolY, { stroke: C.steelD, 'stroke-width': 3 }, g); };
  const house = (g) => { R(160, 86, 84, GY - 86, { fill: '#efe6d8', stroke: '#8a7f70' }, g); P('M154 88L202 60L250 88Z', { fill: '#b5543c' }, g); R(176, 102, 16, 16, { fill: '#cfe6f2', stroke: '#8a7f70' }, g); R(208, 112, 16, 38, { fill: '#9b7350' }, g); R(156, GY, 92, 14, { fill: C.conc, stroke: '#7c848c' }, g); };
  strip(host, [
    { t: 'Furatkészítés', c: ['ütve-, rotary vagy vésős fúrás,', 'csőleverés – az első lépés mindig'], d: (g, s) => { ground(g, soil); house(g); drill(g, 70, 226); shake(g, 61, 216); } },
    { t: 'Injektálócső', c: ['perforált (szelepes) cső a furatban;', 'jellemzően 50–100 cm-enként'], d: (g, s) => { ground(g, soil); house(g); [100, 132].forEach(x => { R(x - 3, GY - 8, 6, 236 - GY + 8, { fill: '#9aa1a6', stroke: C.steelD, 'stroke-width': .8 }, g); for (let y = GY + 16; y < 232; y += 14) L(x - 5, y, x + 5, y, { stroke: C.steelD, 'stroke-width': 1.2 }, g); }); tag(g, 116, 78, '50–100 cm', { c: 'var(--ink2)' }); } },
    { t: 'Besajtolás', c: ['cementszuszpenzió, -habarcs vagy', 'vegyi oldat – alulról felfelé'], d: (g, s) => { ground(g, soil); house(g); R(16, GY - 30, 36, 24, { rx: 3, fill: '#6a7076' }, g); SV('circle', { cx: 34, cy: GY - 18, r: 7, fill: '#cfd3d6', stroke: C.dark }, g); P(`M52 ${GY - 18}Q86 ${GY - 30} 100 ${GY - 8}`, { stroke: '#333', 'stroke-width': 2, fill: 'none' }, g); R(97, GY - 8, 6, 84, { fill: '#9aa1a6', stroke: C.steelD, 'stroke-width': .8 }, g); [218, 196, 174].forEach((y, k) => SV('ellipse', { cx: 100, cy: y, rx: 22 - k * 3, ry: 12, fill: 'var(--violet)', opacity: .32 + k * .08 }, g)); arrowUp(g, 120, 226, 176, 'var(--violet-ink)', 1.6, 4); } },
    { t: 'Hatás', c: ['kisebb hézagtérfogat: jobb szilárdsági', 'és alakváltozási tulajdonságok'], d: (g, s) => { ground(g, soil); house(g); SV('ellipse', { cx: 200, cy: GY + 40, rx: 70, ry: 40, fill: 'var(--violet)', opacity: .35 }, g); SV('ellipse', { cx: 200, cy: GY + 40, rx: 70, ry: 40, fill: 'url(#pGrav)', opacity: .35 }, g); tag(g, 200, GY + 44, 'injektált zóna', { c: 'var(--violet-ink)' }); } },
  ]);
})();

/* ========== 3/F tömegstabilizáció ========== */
(function massFig() {
  const host = $('#msFig'); if (!host) return;
  const soil = [{ to: 214, fill: 'url(#pSoft)' }, { to: GB, fill: 'url(#pSand)' }];
  const names = (g) => { layerName(g, 8, 208, 'tőzeg, puha agyag'); };
  /* forgó felsővázas kotró keverőszárral; a keverőfej (hx, hy) */
  const exc = (g, x, hx, hy) => {
    tracks(g, x - 30, 64, GY); R(x - 26, GY - 34, 54, 22, { rx: 3, fill: C.yel, stroke: C.yelD, 'stroke-width': 1.2 }, g); R(x - 22, GY - 31, 14, 13, { rx: 2, fill: '#cfe6f2', stroke: C.yelD }, g);
    const bx = x - 4, by = GY - 34, ex = (bx + hx) / 2 - 10, ey = Math.min(by, hy) - 40;
    P(`M${bx} ${by}L${ex} ${ey}L${hx} ${ey + 14}`, { stroke: C.yel, 'stroke-width': 7, fill: 'none', 'stroke-linejoin': 'round' }, g);
    P(`M${bx} ${by}L${ex} ${ey}L${hx} ${ey + 14}`, { stroke: C.yelD, 'stroke-width': 1, fill: 'none', 'stroke-linejoin': 'round' }, g);
    R(hx - 3, ey + 14, 6, hy - ey - 14 - 14, { fill: C.steel, stroke: C.steelD, 'stroke-width': .8 }, g);
    R(hx - 12, hy - 16, 24, 16, { rx: 3, fill: '#5d646b', stroke: C.steelD }, g); for (let k = 0; k < 3; k++) L(hx - 14, hy - 12 + k * 5, hx + 14, hy - 12 + k * 5, { stroke: '#9aa1a6', 'stroke-width': 1.4 }, g);
  };
  const silo = (g, x) => { R(x, 70, 26, 56, { rx: 4, fill: '#d9dcdf', stroke: '#7c848c' }, g); P(`M${x} 126L${x + 13} 140L${x + 26} 126Z`, { fill: '#c6cacd', stroke: '#7c848c' }, g); tracks(g, x - 6, 38, GY); T(x + 13, EN ? 103 : 98, 'kötő-', { 'text-anchor': 'middle', 'font-size': EN ? 8.5 : 9.5, 'font-weight': 700, style: 'fill:#4b5258' }, g); if (!EN) T(x + 13, 109, 'anyag', { 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 700, style: 'fill:#4b5258' }, g); };
  const hose = (g, x0, hx) => P(`M${x0} 138Q${(x0 + hx) / 2} 60 ${hx + 4} 92`, { stroke: '#333', 'stroke-width': 1.3, fill: 'none', 'stroke-dasharray': '5 3' }, g);
  strip(host, [
    { t: 'Lehatolás', c: ['a keverőfej a kotró keverőszárán', 'hatol le, rendszerint ≤ 5 m-ig'], d: (g, s) => { ground(g, soil); names(g); silo(g, 214); exc(g, 150, 70, 204); hose(g, 220, 70); arrowDown(g, 92, 168, 198, 'var(--ink)', 1.6, 4); } },
    { t: 'Keverés', c: ['le-fel mozgatva keverik, a fejen át', 'nagy nyomással érkezik a kötőanyag'], d: (g, s) => { ground(g, soil); names(g); R(46, GY, 48, 214 - GY, { fill: 'var(--violet)', opacity: .38 }, g); silo(g, 214); exc(g, 150, 70, 186); hose(g, 220, 70); arrowUp(g, 100, 200, 176, 'var(--ink)', 1.5, 4); arrowDown(g, 108, 176, 200, 'var(--ink)', 1.5, 4); for (const sx of [-1, 1]) P(`M${70 + sx * 14} 180q${sx * 8} 4 ${sx * 12} 12`, { stroke: 'var(--violet-ink)', 'stroke-width': 1.4, fill: 'none' }, g); } },
    { t: 'Haladás blokkonként', c: ['állékony területről indul, a géplánc', 'maga előtt stabilizálja a talajt'], d: (g, s) => { ground(g, soil); names(g); R(118, GY, 140, 214 - GY, { fill: 'var(--violet)', opacity: .38 }, g); for (let x = 118; x < 258; x += 28) L(x, GY, x, 214, { stroke: 'var(--violet-ink)', 'stroke-width': .8, 'stroke-dasharray': '3 3', opacity: .6 }, g); exc(g, 200, 96, 200); arrowH(g, 60, 26, 120, 'var(--ink)', 1.8, 5); tag(g, 192, 232, 'stabilizált', { c: 'var(--violet-ink)' }); } },
    { t: 'Teherelosztó réteg', c: ['szükség esetén geotextília, georács', 'és szemcsés teherelosztó réteg'], d: (g, s) => { ground(g, soil); names(g); R(0, GY, PW, 214 - GY, { fill: 'var(--violet)', opacity: .38 }, g); R(0, GY - 14, PW, 12, { fill: 'url(#pGrav)', stroke: '#6b5a44' }, g); L(0, GY - 2, PW, GY - 2, { stroke: '#2f6f8f', 'stroke-width': 2, 'stroke-dasharray': '6 3' }, g); tag(g, 130, 112, 'geotextília + szemcsés réteg', { c: 'var(--ink2)' }); } },
  ]);
})();
})();
