/* ===== Interaktív ábrák – 2. rész (talajcsere, talajjavítás, előterhelés, szerkezet) ===== */
(function () {
const { $, $$, clamp, lerp, fmt, H } = window.U; const SV = window.SV, svg = window.mkSvg, pat = window.SVpat;
const bindR = (ids, fn) => ids.forEach(id => { const r = $('#' + id); if (r) r.addEventListener('input', fn); });
const out = (id, txt) => { const e = $(`[data-for="${id}"]`); if (e) e.textContent = txt; };
const rv = (id) => { const r = $('#' + id); window.U.fillRange(r); return +r.value; };
const animate = (dur, fn, done) => { const t0 = performance.now(); const st = (t) => { const u = clamp((t - t0) / dur, 0, 1); fn(u); if (u < 1) requestAnimationFrame(st); else if (done) done(); }; requestAnimationFrame(st); };

/* ---------- c) talajcsere ---------- */
(function replacement() {
  const host = $('#tcsSvg'); if (!host) return; let build = 1;
  const draw = () => {
    const P = rv('tcsP'), B = rv('tcsB'), v = rv('tcsV'), th = rv('tcsT'), qa = rv('tcsQ'); const gw = $('#tcsGw').checked;
    out('tcsP', P + ' kN/m'); out('tcsB', fmt(B, 1) + ' m'); out('tcsV', fmt(v, 2) + ' m'); out('tcsT', th + '°'); out('tcsQ', qa + ' kPa');
    const tg = Math.tan(th * Math.PI / 180), Bv = B + 2 * v * tg; const s1 = P / B, s2 = P / Bv + 20 * v; const ok2 = s2 <= qa; const nl = Math.ceil(v / 0.3 - 1e-9);
    const W = 640, Hh = 300, k = 90, cx = 320, yb = 120; const s = svg(host, W, Hh); pat(s);
    SV('rect', { x: 0, y: 40, width: W, height: yb - 40, fill: 'url(#pFill)' }, s); SV('rect', { x: 0, y: yb, width: W, height: Hh - yb, fill: 'url(#pClay)' }, s);
    SV('text', { x: 10, y: 58, text: 'takaróréteg (γ₀)', 'font-size': 12, 'font-weight': 700, fill: '#fff' }, s); SV('text', { x: 10, y: Hh - 12, text: 'alapréteg – összenyomható (γ₂)', 'font-size': 12, 'font-weight': 700, fill: '#fff' }, s);
    if (gw) { SV('line', { x1: 0, x2: W, y1: yb + v * k * 0.55, y2: yb + v * k * 0.55, stroke: '#2b78ad', 'stroke-width': 2.5 }, s); SV('path', { d: `M560,${yb + v * k * .55 - 12} l8,10 l8,-10 z`, fill: '#2b78ad' }, s); SV('text', { x: 580, y: yb + v * k * .55 - 4, text: 'tv.', 'font-size': 12, 'font-weight': 700, fill: '#2b78ad' }, s); }
    const xL = cx - Bv * k / 2, xR = cx + Bv * k / 2; const pts = `${cx - B * k / 2},${yb} ${cx + B * k / 2},${yb} ${xR},${yb + v * k} ${xL},${yb + v * k}`;
    const fillH = v * k * build; SV('clipPath', { id: 'tcsClip' }, s); const cp = s.lastChild; SV('rect', { x: 0, y: yb + v * k - fillH, width: W, height: fillH }, cp);
    SV('rect', { x: xL - 8, y: yb, width: (xR - xL) + 16, height: v * k, fill: '#3a2e25', opacity: .25 }, s);
    const gfill = SV('g', { 'clip-path': 'url(#tcsClip)' }, s); SV('rect', { x: xL - 8, y: yb, width: xR - xL + 16, height: v * k, fill: 'url(#pGrav)' }, gfill);
    for (let i = 1; i < nl; i++) { const y = yb + v * k - i * 0.3 * k; SV('line', { x1: xL - 8, x2: xR + 8, y1: y, y2: y, stroke: '#5b4c3c', 'stroke-dasharray': '6 4', 'stroke-width': 1.2 }, gfill); }
    SV('polygon', { points: pts, fill: 'none', stroke: '#e5ae47', 'stroke-width': 2.5, 'stroke-dasharray': '7 5' }, s);
    SV('line', { x1: xL - 8, x2: xR + 8, y1: yb + v * k, y2: yb + v * k, stroke: '#2a6b56', 'stroke-width': 3 }, s);
    SV('text', { x: xR + 12, y: yb + v * k + 4, text: 'geotextília', 'font-size': 11, fill: '#fff', 'font-weight': 700 }, s);
    // alaptest + teher
    SV('rect', { x: cx - B * k / 2, y: yb - 26, width: B * k, height: 26, fill: '#c3c7ca', stroke: '#4b5458' }, s); SV('rect', { x: cx - 12, y: 40, width: 24, height: yb - 66, fill: '#c3c7ca', stroke: '#4b5458' }, s);
    SV('line', { x1: cx, x2: cx, y1: 4, y2: 34, stroke: '#d4553a', 'stroke-width': 3 }, s); SV('path', { d: `M${cx - 7},28 L${cx},40 L${cx + 7},28 Z`, fill: '#d4553a' }, s); SV('text', { x: cx + 12, y: 22, text: `P = ${P} kN/m`, 'font-size': 13, 'font-weight': 800, fill: '#d4553a' }, s);
    // feszültség-diagramok
    SV('rect', { x: cx - B * k / 2, y: yb + 2, width: B * k, height: Math.min(40, s1 / 12), fill: '#d4553a', opacity: .55 }, s);
    SV('rect', { x: xL, y: yb + v * k + 2, width: xR - xL, height: Math.min(40, s2 / 4), fill: ok2 ? '#39c2a5' : '#d4553a', opacity: .7 }, s);
    SV('text', { x: cx, y: yb + 16, 'text-anchor': 'middle', text: `σ¹ = ${Math.round(s1)} kPa`, 'font-size': 12, 'font-weight': 800, fill: '#fff' }, s);
    SV('text', { x: cx, y: yb + v * k + 20, 'text-anchor': 'middle', text: `σ² = ${Math.round(s2)} kPa`, 'font-size': 12.5, 'font-weight': 800, fill: '#fff' }, s);
    // méretvonal
    const yd = Math.min(Hh - 34, yb + v * k + 58); SV('line', { x1: xL, x2: xR, y1: yd, y2: yd, stroke: '#fff', 'stroke-width': 1.5 }, s); [xL, xR].forEach(x => SV('line', { x1: x, x2: x, y1: yd - 6, y2: yd + 6, stroke: '#fff', 'stroke-width': 1.5 }, s));
    SV('text', { x: cx, y: yd - 6, 'text-anchor': 'middle', text: `B + 2·v·tgϑ = ${fmt(Bv, 2)} m`, 'font-size': 12, 'font-weight': 800, fill: '#fff' }, s);
    SV('text', { x: xR + 6, y: yb + v * k / 2 + 4, text: `v = ${fmt(v, 2)} m`, 'font-size': 12, 'font-weight': 700, fill: '#fff' }, s);
    $('#tcsOut').innerHTML = `<div class="r"><span>σ¹ az alapsíkon (P/B)</span><b>${Math.round(s1)} kPa</b></div><div class="r"><span>σ² a csereréteg alján</span><b style="color:${ok2 ? 'var(--ok)' : 'var(--bad)'}">${Math.round(s2)} kPa</b></div><div class="r"><span>kiszélesítés oldalanként (v·tgϑ)</span><b>${fmt(v * tg, 2)} m</b></div><div class="r"><span>tömörítendő rétegek (≤ 30 cm)</span><b>${nl} db</b></div>`;
    const msgs = []; if (!ok2) msgs.push('✗ Az alapréteg terhelése nagyobb a megengedettnél – vastagabb csereréteg vagy szélesebb alap kell.'); else msgs.push('✓ A csereréteg alatti alapréteg terhelése megfelel.');
    if (gw) msgs.push('⚠ A talajvíz a cserezónában van – talajvíz alatt a cseretalaj nem tömöríthető! (víztelenítés vagy más módszer)');
    if (v < 0.5) msgs.push('A szokásos csereréteg-vastagság 50–80 cm.'); if (v > 0.8) msgs.push('Vastag csereréteg: nagy földmunka és elszállítás – költséges.');
    const mEl = $('#tcsMsg'); mEl.innerHTML = msgs.join('<br>'); const bad = !ok2 || gw; mEl.style.setProperty('--c', bad ? 'var(--coral)' : 'var(--ok)'); mEl.style.setProperty('--cs', bad ? 'var(--coral-soft)' : 'var(--ok-soft)');
  };
  bindR(['tcsP', 'tcsB', 'tcsV', 'tcsT', 'tcsQ'], draw); $('#tcsGw').addEventListener('change', draw);
  $('#tcsPlay').addEventListener('click', () => animate(3200, u => { build = Math.floor(u * 12) / 12; draw(); }, () => { build = 1; draw(); }));
  draw();
})();

/* ---------- vibroflotáció lépései ---------- */
(function vibro() {
  const host = $('#vibSvg'); if (!host) return; let step = 0, t = 0; const txt = ['A darura függesztett mélyvibrátor (Ø 25–40 cm) <b>önsúlyával és rezgéssel</b> hatol le; a lefelé haladást <b>vízbesajtolás (öblítés)</b> segíti.', 'A tervezett mélységben a rezgés a laza szemcséket <b>tömörebb elrendeződésbe</b> rázza – a lyuk körül tömörödött zóna alakul ki.', 'A vibrátort <b>fokozatosan felhúzzák</b>, közben a lyukba kavicsot, murvát, bányameddőt vagy homokot juttatnak, és a felfelé haladó vibrátorral tömörítik.', 'Kész a tömörített oszlop és környezete. A felszínen a <b>térfogatcsökkenés</b> miatt tölcsér képződik, ezt feltöltik. A pontokat raszterben ismétlik.'];
  const draw = () => {
    const W = 560, Hh = 300, gy = 70, cx = 280; const s = svg(host, W, Hh); pat(s);
    SV('rect', { x: 0, y: 0, width: W, height: gy, fill: 'var(--card2)' }, s); SV('rect', { x: 0, y: gy, width: W, height: Hh - gy, fill: 'url(#pSand)' }, s);
    const depth = step === 0 ? 40 + 170 * clamp(t, 0, 1) : step === 1 ? 210 : step === 2 ? 210 - 170 * clamp(t, 0, 1) : 40;
    if (step >= 1) { const r = step === 1 ? 30 + 30 * t : 60; const top = step >= 2 ? gy + (step === 3 ? 0 : 210 - 170 * t - 20) : gy + 170; SV('ellipse', { cx, cy: (top + gy + 230) / 2, rx: r + 10, ry: (gy + 230 - top) / 2 + 10, fill: '#a3874f', opacity: .5 }, s); }
    if (step >= 2) { const top = step === 3 ? gy : gy + depth; SV('rect', { x: cx - 16, y: top, width: 32, height: gy + 230 - top, fill: 'url(#pGrav)', stroke: '#6d5c47' }, s); }
    if (step === 3) { SV('path', { d: `M${cx - 70},${gy} Q${cx},${gy + 26} ${cx + 70},${gy}`, fill: '#cdb27a', stroke: '#8a6f40' }, s); SV('text', { x: cx + 76, y: gy + 18, text: 'tölcsér → feltöltik', 'font-size': 12, 'font-weight': 700, fill: '#5d4a2b' }, s); }
    if (step < 3) {
      const y0 = gy + depth; SV('line', { x1: cx, x2: cx, y1: 6, y2: y0 - 60, stroke: '#4b5458', 'stroke-width': 3 }, s);
      const jit = Math.sin(performance.now() / 30) * 1.5; SV('rect', { x: cx - 12 + jit, y: y0 - 60, width: 24, height: 60, rx: 4, fill: '#e5ae47', stroke: '#8a5c05' }, s); SV('path', { d: `M${cx - 12 + jit},${y0} L${cx + jit},${y0 + 14} L${cx + 12 + jit},${y0} Z`, fill: '#8a5c05' }, s);
      if (step === 0) for (let i = 0; i < 6; i++) { const yy = y0 - 10 - ((performance.now() / 8 + i * 40) % 150); if (yy > gy) SV('circle', { cx: cx + (i % 2 ? 20 : -20) + Math.sin(yy / 10) * 4, cy: yy, r: 3, fill: '#7fc6e8', opacity: .9 }, s); }
      if (step === 1) for (let i = 1; i <= 3; i++) SV('circle', { cx, cy: y0, r: 12 + i * 14 + ((performance.now() / 20) % 14), fill: 'none', stroke: '#fff', opacity: .5 / i }, s);
      if (step === 2) for (let i = 0; i < 8; i++) { const yy = gy + ((performance.now() / 6 + i * 24) % (depth)); SV('circle', { cx: cx + (i % 2 ? 18 : -18), cy: yy, r: 3.5, fill: '#8f7c66' }, s); }
    }
    SV('text', { x: 14, y: 26, text: ['1. Lehatolás öblítéssel', '2. Tömörítés a talpon', '3. Felhúzás + anyagadagolás', '4. Kész tömörített zóna'][step], 'font-size': 15, 'font-weight': 800, fill: 'var(--ink)' }, s);
    $('#vibTxt').innerHTML = txt[step];
  };
  let raf = null; const loop = () => { t = Math.min(1, t + 0.008); draw(); raf = requestAnimationFrame(loop); };
  const go = (k) => { step = k; t = 0; $$('#vibSteps button').forEach((b, i) => b.classList.toggle('on', i === k)); };
  $('#vibSteps').addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(+b.dataset.v); });
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { if (!raf) loop(); } else { cancelAnimationFrame(raf); raf = null; } })); io.observe(host);
  go(0);
  // finomszem-tartalom
  const fr = $('#vibFines'); const upd = () => { const f = rv('vibFines'); out('vibFines', f + '%'); const m = $('#vibFinesMsg'); const ptr = $('#vibPtr'); ptr.style.left = clamp(f / 40 * 100, 0, 100) + '%';
    m.innerHTML = f < 10 ? '<span class="status">jól tömöríthető – vibroflotáció ✓</span>' : f <= 15 ? '<span class="status w">határeset – próbatömörítés, raszter sűrítése</span>' : '<span class="status b">túl sok finom szem: a rezgés „elnyelődik” → kavicscölöp</span>'; };
  fr.addEventListener('input', upd); upd();
})();

/* ---------- dinamikus tömörítés ---------- */
(function dyn() {
  const host = $('#dynSvg'); if (!host) return; let drops = 0, anim = null; let soilN = 0.5;
  const draw = (fall = 0, ring = 0) => {
    const Wt = rv('dynW'), Hm = rv('dynH'); out('dynW', Wt + ' t'); out('dynH', Hm + ' m'); const d = soilN * Math.sqrt(Wt * Hm); const E = Wt * 9.81 * Hm / 1000;
    const W = 600, Hh = 330, gy = 170, k = 13; const s = svg(host, W, Hh); pat(s);
    SV('rect', { x: 0, y: 0, width: W, height: gy, fill: 'var(--card2)' }, s); SV('rect', { x: 0, y: gy, width: W, height: Hh - gy, fill: soilN < 0.45 ? 'url(#pSoft)' : 'url(#pFill)' }, s);
    const cx = 300; const crater = Math.min(40, drops * 5);
    SV('path', { d: `M${cx - 50},${gy} Q${cx},${gy + crater * 1.6} ${cx + 50},${gy} Z`, fill: '#5b4b3d' }, s);
    // tömörödött zóna
    const dz = Math.min(d, 12) * k; const zop = Math.min(.55, drops * .08);
    if (drops) SV('path', { d: `M${cx - 40},${gy} C${cx - 110},${gy + dz * .5} ${cx - 50},${gy + dz} ${cx},${gy + dz} C${cx + 50},${gy + dz} ${cx + 110},${gy + dz * .5} ${cx + 40},${gy} Z`, fill: '#e5ae47', opacity: zop, stroke: '#c2830c', 'stroke-dasharray': '5 4' }, s);
    // 5–7 m sáv
    SV('rect', { x: W - 60, y: gy + 5 * k, width: 46, height: 2 * k, fill: 'var(--coral)', opacity: .3 }, s); SV('text', { x: W - 37, y: gy + 5 * k - 4, 'text-anchor': 'middle', text: '5–7 m', 'font-size': 10.5, 'font-weight': 700, fill: '#fff' }, s);
    for (let m = 0; m <= 12; m += 2) { SV('line', { x1: W - 12, x2: W - 4, y1: gy + m * k, y2: gy + m * k, stroke: '#fff' }, s); SV('text', { x: W - 66, y: gy + m * k + 4, 'text-anchor': 'end', text: m + ' m', 'font-size': 10, fill: '#fff' }, s); }
    SV('line', { x1: cx + 70, x2: W - 70, y1: gy + Math.min(d, 12) * k, y2: gy + Math.min(d, 12) * k, stroke: '#fff', 'stroke-dasharray': '4 4' }, s);
    SV('text', { x: cx + 74, y: gy + Math.min(d, 12) * k - 6, text: `hatásmélység ≈ ${fmt(d, 1)} m`, 'font-size': 12.5, 'font-weight': 800, fill: '#fff' }, s);
    // daru
    SV('rect', { x: 60, y: gy - 30, width: 120, height: 30, fill: '#e5ae47', stroke: '#8a5c05' }, s); SV('rect', { x: 120, y: gy - 56, width: 50, height: 26, fill: '#e5ae47', stroke: '#8a5c05' }, s); SV('rect', { x: 60, y: gy - 8, width: 120, height: 10, fill: '#3b3b3b' }, s);
    const tipY = 10; SV('line', { x1: 140, y1: gy - 40, x2: cx + 30, y2: tipY, stroke: '#c2830c', 'stroke-width': 6 }, s);
    const hTop = gy - 20 - Math.min(140, Hm * 3.6); const wy = lerp(hTop, gy - 18 + crater * .8, fall * fall);
    SV('line', { x1: cx + 30, y1: tipY, x2: cx, y2: fall > 0 ? hTop - 10 : wy - 2, stroke: '#4b5458', 'stroke-width': 1.5 }, s);
    const ws = 18 + Wt * 0.35; SV('rect', { x: cx - ws, y: wy - 18, width: ws * 2, height: 18, rx: 3, fill: '#4b5458', stroke: '#222' }, s); SV('text', { x: cx, y: wy - 5, 'text-anchor': 'middle', text: Wt + ' t', 'font-size': 11, 'font-weight': 800, fill: '#fff' }, s);
    SV('line', { x1: cx - ws - 14, x2: cx - ws - 14, y1: hTop, y2: gy, stroke: 'var(--ink2)', 'stroke-dasharray': '3 3' }, s); SV('text', { x: cx - ws - 18, y: (hTop + gy) / 2, 'text-anchor': 'end', text: `H = ${Hm} m`, 'font-size': 12, 'font-weight': 700, fill: 'var(--ink2)' }, s);
    if (ring > 0) for (let i = 0; i < 3; i++) SV('ellipse', { cx, cy: gy + 4, rx: 20 + (ring + i * .2) * 160, ry: 6 + (ring + i * .2) * 60, fill: 'none', stroke: '#fff', 'stroke-width': 2, opacity: (1 - ring) * (1 - i * .3) }, s);
    $('#dynOut').innerHTML = `<div class="r"><span>ejtésenkénti energia W·g·H</span><b>${fmt(E, 1)} MJ</b></div><div class="r"><span>becsült hatásmélység n·√(W·H)</span><b>${fmt(d, 1)} m</b></div><div class="r"><span>ejtések ezen a ponton</span><b>${drops}</b></div><div class="r"><span>gödör (szemléltetés)</span><b>${fmt(crater / 40 * 1.5, 1)} m</b></div>${d > 7 ? '<div class="r" style="grid-column:1/-1"><span class="status w">⚠ A képlet nagy energiánál túlbecsül; a jegyzet szerint a gyakorlatban max. 5–7 m.</span></div>' : ''}`;
  };
  window.U.seg('dynSoil', v => { soilN = +v; draw(); });
  bindR(['dynW', 'dynH'], () => draw());
  $('#dynDrop').addEventListener('click', () => { if (anim) return; anim = 1; animate(900, u => draw(u, 0), () => { drops = Math.min(8, drops + 1); animate(900, u => draw(0, u), () => { anim = null; draw(); }); }); });
  $('#dynReset').addEventListener('click', () => { drops = 0; draw(); });
  draw();
})();

/* ---------- kőtömzs ---------- */
(function stonePier() {
  const host = $('#ktSvg'); if (!host) return; let step = 0; const T = ['Az ejtősúly gödröt üt a puha talajba.', 'A gödröt szemcsés anyaggal (homokos kavics, zúzottkő) töltik fel.', 'Újabb ejtés: a súly a kavicsot „bedolgozza” a puha altalajba – kiszorítja és tömöríti.', 'Töltés–ejtés ciklusok: a tömzs lefelé és oldalra épül.', 'Kész kőtömzs: nagy átmérőjű, nagy teherbírású szemcsés oszlop + tömörödött környezet.'];
  const draw = () => {
    const W = 560, Hh = 260, gy = 80, cx = 280; const s = svg(host, W, Hh); pat(s);
    SV('rect', { x: 0, y: 0, width: W, height: gy, fill: 'var(--card2)' }, s); SV('rect', { x: 0, y: gy, width: W, height: Hh - gy, fill: 'url(#pSoft)' }, s);
    const depth = [40, 40, 80, 120, 140][step], wid = [60, 60, 80, 96, 104][step];
    if (step >= 2) SV('ellipse', { cx, cy: gy + depth / 2, rx: wid / 2 + 30, ry: depth / 2 + 24, fill: '#a3874f', opacity: .4 }, s);
    if (step >= 1) SV('path', { d: `M${cx - wid / 2},${gy} C${cx - wid / 2 - 10},${gy + depth * .7} ${cx - wid / 3},${gy + depth} ${cx},${gy + depth} C${cx + wid / 3},${gy + depth} ${cx + wid / 2 + 10},${gy + depth * .7} ${cx + wid / 2},${gy} Z`, fill: 'url(#pGrav)', stroke: '#6d5c47' }, s);
    else SV('path', { d: `M${cx - 30},${gy} Q${cx},${gy + 70} ${cx + 30},${gy} Z`, fill: '#3a2f27' }, s);
    if (step === 0 || step === 2 || step === 3) { SV('rect', { x: cx - 24, y: gy - (step === 0 ? 8 : 4) - 22, width: 48, height: 22, rx: 3, fill: '#4b5458' }, s); SV('line', { x1: cx, x2: cx, y1: 0, y2: gy - 30, stroke: '#4b5458', 'stroke-width': 1.5 }, s); }
    if (step === 1) for (let i = 0; i < 10; i++) SV('circle', { cx: cx - 20 + (i * 13) % 40, cy: 20 + (i * 17) % 50, r: 5, fill: '#8f7c66' }, s);
    SV('text', { x: 14, y: 26, text: `${step + 1}. lépés`, 'font-size': 15, 'font-weight': 800, fill: 'var(--ink)' }, s);
    $('#ktTxt').textContent = T[step];
  };
  $('#ktSteps').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; step = +b.dataset.v; $$('#ktSteps button').forEach((x, i) => x.classList.toggle('on', i === step)); draw(); });
  draw();
})();

/* ---------- kavicscölöp raszter ---------- */
(function stoneCol() {
  const host = $('#kcSvg'); if (!host) return; let tri = true;
  const draw = () => {
    const d = rv('kcD'), sp = rv('kcS'), n = rv('kcN'); out('kcD', fmt(d, 2) + ' m'); out('kcS', fmt(sp, 1) + ' m'); out('kcN', fmt(n, 1));
    const C1 = tri ? 0.907 : 0.785; const as = C1 * (d / sp) ** 2; const ratio = 1 / (1 + as * (n - 1)); const De = (tri ? 1.05 : 1.13) * sp;
    const W = 600, Hh = 300, k = 60; const s = svg(host, W, Hh); pat(s); SV('rect', { x: 0, y: 0, width: W, height: Hh, fill: 'url(#pClay)' }, s);
    const cols = []; const dy = tri ? sp * Math.sqrt(3) / 2 : sp; for (let j = -1; j * dy * k < Hh + 60; j++) for (let i = -1; i * sp * k < W + 60; i++) { const x = (i * sp + (tri && j % 2 ? sp / 2 : 0)) * k + 40, y = j * dy * k + 40; cols.push([x, y]); }
    const mid = cols.reduce((b, c) => Math.hypot(c[0] - W / 2, c[1] - Hh / 2) < Math.hypot(b[0] - W / 2, b[1] - Hh / 2) ? c : b, cols[0]);
    SV('circle', { cx: mid[0], cy: mid[1], r: De / 2 * k, fill: '#39c2a5', opacity: .25, stroke: '#0d7a68', 'stroke-dasharray': '6 4', 'stroke-width': 2 }, s);
    cols.forEach(([x, y]) => SV('circle', { cx: x, cy: y, r: d / 2 * k, fill: 'url(#pGrav)', stroke: '#5b4c3c', 'stroke-width': 1.5 }, s));
    SV('text', { x: mid[0], y: mid[1] + De / 2 * k + 16, 'text-anchor': 'middle', text: `egységcella De = ${fmt(De, 2)} m`, 'font-size': 12, 'font-weight': 800, fill: '#fff' }, s);
    $('#kcOut').innerHTML = `<div class="r"><span>területi helyettesítési arány aₛ</span><b>${fmt(as * 100, 1)}%</b></div><div class="r"><span>süllyedés javult kezelés után</span><b style="color:var(--ok)">${fmt(ratio * 100, 0)}% (−${fmt((1 - ratio) * 100, 0)}%)</b></div>`;
    const bar = $('#kcBar'); bar.style.width = (ratio * 100) + '%';
  };
  window.U.seg('kcPat', v => { tri = v === 'tri'; draw(); }); bindR(['kcD', 'kcS', 'kcN'], draw); draw();
  // lépések
  const T = ['<b>Előkészítés:</b> a lánctalpas hordozógép a zsilipes (alsó adagolású) mélyvibrátort a kitűzött pont fölé állítja.', '<b>Töltés:</b> a skip (anyagtartály) feltölti a vibrátor tetején lévő zsilipet kaviccsal; a zsilipet sűrített levegővel zárják.', '<b>Lehajtás:</b> a vibrátor rezgéssel és a gép lenyomó erejével a tervezett mélységig hatol – oldalra szorítja a talajt.', '<b>Tömörítés:</b> kb. 1 m felhúzás → a kavics kifolyik a csúcsnál → visszanyomás. A kiszorított kavics kiszélesedik (Ø ≈ 0,6–1,0 m), a környezet tömörödik.', '<b>Lezárás:</b> a ciklusokat a felszínig ismétlik; a kész oszlopokra teherelosztó réteg kerül.'];
  const sb = $('#kcSteps'); if (sb) sb.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('button', sb).forEach(x => x.classList.toggle('on', x === b)); $('#kcStepTxt').innerHTML = T[+b.dataset.v]; });
})();

/* ---------- injektálás: melyik anyag? ---------- */
(function grout() {
  const host = $('#grSvg'); if (!host) return;
  const SOIL = { kavics: { n: 'Kavics', d: 6, cem: 2, pu: 1, ch: 1 }, durva: { n: 'Durva homok (> 1 mm)', d: 1.5, cem: 2, pu: 2, ch: 1 }, kozep: { n: 'Középhomok', d: .5, cem: 0, pu: 2, ch: 2 }, finom: { n: 'Finom homok', d: .18, cem: 0, pu: 2, ch: 2 }, iszap: { n: 'Iszapos homok, iszap', d: .05, cem: 0, pu: 1, ch: 1 }, agyag: { n: 'Agyag', d: .004, cem: 0, pu: 0, ch: 0 }, repedt: { n: 'Repedezett kötött talaj', d: 0, cem: 2, pu: 1, ch: 0 } };
  let key = 'durva'; let raf = null;
  const draw = () => {
    const S0 = SOIL[key]; const W = 560, Hh = 260; const s = svg(host, W, Hh); SV('rect', { x: 0, y: 0, width: W, height: Hh, fill: '#3b2f27' }, s);
    const t = performance.now() / 1000;
    if (key === 'repedt') { SV('rect', { x: 0, y: 0, width: W, height: Hh, fill: '#7a6553' }, s); [['M60,0 L120,90 L100,160 L170,260', 1], ['M300,0 L270,120 L330,200 L310,260', 1], ['M460,0 L420,80 L470,170 L440,260', 1]].forEach(([d]) => SV('path', { d, stroke: '#2a211b', 'stroke-width': 10, fill: 'none' }, s)); }
    else { const r = clamp(S0.d / 6 * 70, 6, 70); const step = r * 2.05; let seed = 7; const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647; for (let y = r; y < Hh + r; y += step * .88) for (let x = (Math.round(y / step) % 2) * r; x < W + r; x += step) SV('circle', { cx: x + (rnd() - .5) * r * .2, cy: y, r: r * (.9 + rnd() * .15), fill: ['#c9a96b', '#b8955a', '#d6b97f'][Math.floor(rnd() * 3)], stroke: '#8a6d3e', 'stroke-width': 1 }, s); }
    // cementszemcsék (≈ 15 µm átlag, d85 néhány tized mm-ig – szemléltetés)
    const pass = S0.cem === 2; for (let i = 0; i < 30; i++) { const x = (i * 97) % W, ph = (t * (pass ? 60 : 20) + i * 37) % (pass ? Hh : 26); SV('circle', { cx: x + Math.sin(t + i) * 4, cy: ph, r: 3, fill: '#e8e8e8', opacity: .95 }, s); }
    if (!pass) SV('rect', { x: 0, y: 0, width: W, height: 10, fill: '#e8e8e8', opacity: .8 }, s);
    SV('rect', { x: 8, y: Hh - 34, width: 260, height: 26, rx: 6, fill: 'rgba(0,0,0,.55)' }, s); SV('text', { x: 18, y: Hh - 16, text: `${S0.n} · ⚪ cementszemcsék`, 'font-size': 12.5, 'font-weight': 700, fill: '#fff' }, s);
  };
  const res = () => { const S0 = SOIL[key]; const L = ['✗ nem alkalmas', '◐ korlátozottan', '✓ alkalmas']; const C = ['b', 'w', '']; $('#grOut').innerHTML = `<div class="mi"><i class="d" style="background:var(--violet)"></i><div><h5>Cementbesajtolás</h5><p>csak 0,8–1 mm-nél durvább homok-kavics, ill. üreges, repedezett kötött talaj</p></div><span class="status ${C[S0.cem]}">${L[S0.cem]}</span></div><div class="mi"><i class="d" style="background:var(--violet)"></i><div><h5>Kétkomponensű műanyag</h5><p>homokos és iszapos talaj – agyagban nem hatékony</p></div><span class="status ${C[S0.pu]}">${L[S0.pu]}</span></div><div class="mi"><i class="d" style="background:var(--violet)"></i><div><h5>Vegyi anyagok (pl. vízüveg alapú)</h5><p>kis viszkozitású oldatok – finomabb homokokba is bejutnak</p></div><span class="status ${C[S0.ch]}">${L[S0.ch]}</span></div>`; };
  window.U.seg('grSoil', v => { key = v; res(); });
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { const lp = () => { draw(); raf = requestAnimationFrame(lp); }; if (!raf) lp(); } else { cancelAnimationFrame(raf); raf = null; } })); io.observe(host);
  res(); draw();
})();

/* ---------- injektálás munkafázisai (fotók) ---------- */
(function injSteps() {
  const box = $('#injPhotos'); if (!box) return; const D = [
    { t: '1. Furatok', d: 'Injektáló furatok mélyítése 50–100 cm-enként, az erősítendő fal külső és belső oldalán.', img: ['inj-1a', 'inj-1b'] },
    { t: '2. Besajtoló csövek', d: 'Perforált besajtoló csövek (csonkok) elhelyezése a furatokban.', img: ['inj-2a', 'inj-2b'] },
    { t: '3. Besajtolás', d: 'Injektálás 7–10 bar nyomással; közben az épület mozgását lézeres szintezővel figyelik – emelkedésnél leállnak.', img: ['inj-3a', 'inj-3b'] },
    { t: '4. A hatás', d: 'A dinamikus szondázás ütésszámai injektálás előtt és után: a kezelt zónában jelentősen nőtt a talaj ellenállása.', img: ['inj-4'] }];
  const bar = $('#injBar'); const show = (k) => { $$('button', bar).forEach((b, i) => b.classList.toggle('on', i === k)); const d = D[k]; box.innerHTML = `<div class="grid ${d.img.length > 1 ? 'g2' : ''}">${d.img.map(i => `<figure class="photo ${i === 'inj-4' ? 'contain' : ''}"><img src="img/${i}.jpg" alt="${d.t}" loading="lazy" style="${i === 'inj-4' ? 'height:300px' : ''}"></figure>`).join('')}</div><p style="margin-top:10px"><b>${d.t}.</b> ${d.d}</p>`; };
  D.forEach((d, i) => { const b = H('button', {}, d.t); b.addEventListener('click', () => show(i)); bar.appendChild(b); }); show(0);
})();

/* ---------- tömegstabilizáció ---------- */
(function massStab() {
  const host = $('#msSvg'); if (!host) return;
  const draw = () => {
    const A = rv('msA'), Dp = rv('msD'), q = rv('msQ'), bk = rv('msK'), prog = rv('msT') / 100; out('msA', fmt(A) + ' m²'); out('msD', fmt(Dp, 1) + ' m'); out('msQ', fmt(q, 2) + ' m³/perc'); out('msK', bk + ' kg/m³'); out('msT', Math.round(prog * 100) + '%');
    const V = A * Dp, tmin = V / q, hours = tmin / 60, days = hours / 8, binder = V * bk / 1000;
    $('#msOut').innerHTML = `<div class="r"><span>stabilizálandó térfogat</span><b>${fmt(V)} m³</b></div><div class="r"><span>keverési idő (tiszta)</span><b>${fmt(hours, 0)} óra ≈ ${fmt(days, 1)} műszak</b></div><div class="r"><span>kötőanyag</span><b>${fmt(binder, 0)} t</b></div><div class="r"><span>keverőfej egy lépésben</span><b>≈ 1,2 m²</b></div>`;
    const W = 640, Hh = 250, gy = 90; const s = svg(host, W, Hh); pat(s);
    SV('rect', { x: 0, y: 0, width: W, height: gy, fill: 'var(--card2)' }, s); SV('rect', { x: 0, y: gy, width: W, height: Hh - gy, fill: 'url(#pSoft)' }, s);
    const dpx = Dp / 7 * 140; const front = 40 + prog * 520; SV('rect', { x: 40, y: gy, width: front - 40, height: dpx, fill: '#9aa0a4', opacity: .9 }, s);
    for (let x = 40; x < front; x += 26) SV('line', { x1: x, x2: x, y1: gy, y2: gy + dpx, stroke: '#7d8387', 'stroke-width': 1 }, s);
    SV('rect', { x: 40, y: gy - 8, width: front - 40, height: 8, fill: 'url(#pGrav)' }, s);
    SV('text', { x: 50, y: gy + 20, text: 'stabilizált tömb', 'font-size': 12, 'font-weight': 700, fill: '#fff' }, s); SV('text', { x: W - 150, y: gy + 20, text: 'tőzeg, puha agyag', 'font-size': 12, 'font-weight': 700, fill: '#fff' }, s);
    // kotró a stabilizált részen, maga előtt keverve
    const ex = front - 70; SV('rect', { x: ex - 50, y: gy - 30, width: 70, height: 22, fill: '#e5ae47', stroke: '#8a5c05' }, s); SV('rect', { x: ex - 50, y: gy - 10, width: 70, height: 6, fill: '#333' }, s); SV('rect', { x: ex - 18, y: gy - 50, width: 30, height: 20, fill: '#e5ae47', stroke: '#8a5c05' }, s);
    const mz = gy + dpx * (0.5 + 0.45 * Math.sin(performance.now() / 600)); SV('path', { d: `M${ex + 10},${gy - 40} L${front + 18},${gy - 60} L${front + 22},${mz}`, stroke: '#c2830c', 'stroke-width': 6, fill: 'none' }, s); SV('circle', { cx: front + 22, cy: mz, r: 10, fill: '#4b5458', stroke: '#222' }, s);
    SV('rect', { x: 560, y: gy - 46, width: 50, height: 38, rx: 4, fill: '#c9412b' }, s); SV('text', { x: 585, y: gy - 22, 'text-anchor': 'middle', text: 'siló', 'font-size': 11, 'font-weight': 700, fill: '#fff' }, s); SV('path', { d: `M560,${gy - 20} C520,${gy - 10} ${ex + 30},${gy - 6} ${ex + 10},${gy - 20}`, stroke: '#222', 'stroke-width': 2, fill: 'none' }, s);
    SV('text', { x: 40, y: 22, text: 'A géplánc állékony (már stabilizált) területről indul, és maga előtt keveri a talajt', 'font-size': 12.5, 'font-weight': 700, fill: 'var(--ink2)' }, s);
  };
  bindR(['msA', 'msD', 'msQ', 'msK', 'msT'], draw); let raf = null; const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { const lp = () => { draw(); raf = requestAnimationFrame(lp); }; if (!raf) lp(); } else { cancelAnimationFrame(raf); raf = null; } })); io.observe(host); draw();
})();

/* ---------- e) előterhelés: e – log σ' ---------- */
(function preload() {
  const host = $('#plSvg'); if (!host) return; const host2 = $('#plTime');
  const s0 = 60, Cc = 0.45, Cr = 0.06, e0 = 1.2, Hc = 6;
  const draw = () => {
    const ds = rv('plB'), dp = rv('plP'); out('plB', ds + ' kPa'); out('plP', dp ? dp + ' kPa' : 'nincs');
    const f = Hc / (1 + e0) * 1000; const sNo = f * Cc * Math.log10((s0 + ds) / s0);
    const sPre = dp > 0 ? f * Cc * Math.log10((s0 + dp) / s0) : 0;
    const sAfter = dp <= 0 ? sNo : ds <= dp ? f * Cr * Math.log10((s0 + ds) / s0) : f * Cr * Math.log10((s0 + dp) / s0) + f * Cc * Math.log10((s0 + ds) / (s0 + dp));
    // e - log σ' diagram
    const W = 420, Hh = 290, L = 54, R = 14, T = 16, B = 40; const s = svg(host, W, Hh); const lx = (v) => L + (Math.log10(v) - Math.log10(30)) / (Math.log10(400) - Math.log10(30)) * (W - L - R), ey = (e) => T + (e0 + 0.02 - e) / 0.42 * (Hh - T - B);
    [30, 60, 100, 200, 400].forEach(v => { SV('line', { x1: lx(v), x2: lx(v), y1: T, y2: Hh - B, stroke: 'var(--line2)' }, s); SV('text', { x: lx(v), y: Hh - B + 14, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--mute)', text: v }, s); });
    SV('text', { x: (W + L) / 2, y: Hh - 6, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: 'var(--ink2)', text: "hatékony feszültség σ' [kPa] (log)" }, s); SV('text', { x: 14, y: Hh / 2, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: 'var(--ink2)', transform: `rotate(-90 14 ${Hh / 2})`, text: 'hézagtényező e' }, s);
    const eN = (v) => e0 - Cc * Math.log10(v / s0); const pts = (a, b, fn) => { const p = []; for (let i = 0; i <= 40; i++) { const v = a * Math.pow(b / a, i / 40); p.push(`${lx(v)},${ey(fn(v))}`); } return p.join(' '); };
    SV('polyline', { points: pts(s0, 400, eN), fill: 'none', stroke: 'var(--line)', 'stroke-width': 6, 'stroke-linecap': 'round' }, s);
    SV('text', { x: lx(300), y: ey(eN(300)) - 10, 'text-anchor': 'middle', 'font-size': 10.5, fill: 'var(--mute)', text: 'szűz görbe' }, s);
    // előterhelés nélkül
    SV('polyline', { points: pts(s0, s0 + ds, eN), fill: 'none', stroke: 'var(--coral)', 'stroke-width': 3 }, s); SV('circle', { cx: lx(s0 + ds), cy: ey(eN(s0 + ds)), r: 5, fill: 'var(--coral)' }, s);
    if (dp > 0) { const ep = eN(s0 + dp); SV('polyline', { points: pts(s0, s0 + dp, eN), fill: 'none', stroke: 'var(--amber)', 'stroke-width': 3, 'stroke-dasharray': '6 4' }, s); const eU = (v) => ep + Cr * Math.log10((s0 + dp) / v);
      SV('polyline', { points: pts(s0, s0 + dp, eU), fill: 'none', stroke: 'var(--amber)', 'stroke-width': 2, 'stroke-dasharray': '3 3' }, s);
      const eR = (v) => v <= s0 + dp ? eU(v) : eN(v); SV('polyline', { points: pts(s0, s0 + ds, eR), fill: 'none', stroke: 'var(--teal)', 'stroke-width': 3.5 }, s); SV('circle', { cx: lx(s0 + ds), cy: ey(eR(s0 + ds)), r: 5, fill: 'var(--teal)' }, s); SV('circle', { cx: lx(s0 + dp), cy: ey(ep), r: 4, fill: 'var(--amber)' }, s); }
    SV('circle', { cx: lx(s0), cy: ey(e0), r: 5, fill: 'var(--ink2)' }, s); SV('text', { x: lx(s0) + 8, y: ey(e0) - 6, 'font-size': 10.5, fill: 'var(--ink2)', text: "σ'₀" }, s);
    // idő–süllyedés
    const W2 = 420, H2 = 290; const s2 = svg(host2, W2, H2); const tx = (m) => 54 + m / 36 * (W2 - 68), sy = (v) => 20 + v / Math.max(sNo, sPre + sAfter, 50) * (H2 - 66);
    for (let m = 0; m <= 36; m += 6) { SV('line', { x1: tx(m), x2: tx(m), y1: 20, y2: H2 - 46, stroke: 'var(--line2)' }, s2); SV('text', { x: tx(m), y: H2 - 32, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--mute)', text: m }, s2); }
    SV('text', { x: (W2 + 54) / 2, y: H2 - 14, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: 'var(--ink2)', text: 'idő [hónap]' }, s2); SV('text', { x: 14, y: H2 / 2, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: 'var(--ink2)', transform: `rotate(-90 14 ${H2 / 2})`, text: 'süllyedés [mm] ↓' }, s2);
    const U = (t) => 1 - Math.exp(-t / 5); const a = [], b = [];
    for (let m = 0; m <= 36; m += .5) { a.push(`${tx(m)},${sy(m < 12 ? 0 : sNo * U(m - 12))}`); let v = 0; if (dp > 0) { if (m < 12) v = sPre * U(m); else v = sPre * U(12) + (m >= 12 ? (sAfter) * U(m - 12) : 0); } else v = m < 12 ? 0 : sNo * U(m - 12); b.push(`${tx(m)},${sy(v)}`); }
    SV('rect', { x: tx(0), y: 20, width: tx(12) - tx(0), height: H2 - 66, fill: 'var(--amber)', opacity: .1 }, s2); SV('text', { x: tx(6), y: 34, 'text-anchor': 'middle', 'font-size': 10.5, fill: 'var(--amber-ink)', 'font-weight': 700, text: dp > 0 ? 'előterhelés, kivárás' : 'tervezés, előkészítés' }, s2);
    SV('line', { x1: tx(12), x2: tx(12), y1: 20, y2: H2 - 46, stroke: 'var(--ink2)', 'stroke-dasharray': '3 3' }, s2); SV('text', { x: tx(12) + 4, y: H2 - 52, 'font-size': 10, fill: 'var(--ink2)', text: 'építés kezdete' }, s2);
    SV('polyline', { points: a.join(' '), fill: 'none', stroke: 'var(--coral)', 'stroke-width': 2.5, 'stroke-dasharray': dp > 0 ? '6 4' : '' }, s2); if (dp > 0) SV('polyline', { points: b.join(' '), fill: 'none', stroke: 'var(--teal)', 'stroke-width': 3 }, s2);
    $('#plOut').innerHTML = `<div class="r"><span>épület alatti süllyedés előterhelés nélkül</span><b style="color:var(--coral)">${fmt(sNo, 0)} mm</b></div><div class="r"><span>előterhelés alatt „kikényszerített”</span><b style="color:var(--amber-ink)">${fmt(sPre, 0)} mm</b></div><div class="r" style="grid-column:1/-1"><span>az épület alatti süllyedés előterhelés után</span><b style="color:var(--teal)">${fmt(sAfter, 0)} mm ${dp > 0 ? `(−${fmt((1 - sAfter / sNo) * 100, 0)}%)` : ''}</b></div>`;
  };
  bindR(['plB', 'plP'], draw); draw();
  // Mexikóváros: kavics + épület = állandó
  const mx = $('#mxSvg'); if (!mx) return; const r = $('#mxT');
  const dm = () => { const u = rv('mxT') / 100; out('mxT', Math.round(u * 100) + '%'); const s = svg(mx, 600, 210); pat(s); SV('rect', { x: 0, y: 150, width: 600, height: 60, fill: 'url(#pSoft)' }, s);
    SV('rect', { x: 150, y: 140, width: 300, height: 10, fill: '#bfc3c6', stroke: '#4b5458' }, s); const fl = Math.round(u * 6); for (let i = 0; i < fl; i++) SV('rect', { x: 170, y: 140 - (i + 1) * 18, width: 260, height: 18, fill: '#f5efe2', stroke: '#5b524a' }, s);
    const g = (1 - u); if (g > 0.01) { SV('path', { d: `M${160 + 20 * u},140 L${300},${140 - 110 * g - fl * 0} L${440 - 20 * u},140 Z`, fill: 'url(#pGrav)', stroke: '#6d5c47', transform: `translate(${u * 120},0) scale(${1 - u * .5},1)`, 'transform-origin': '300px 140px' }, s); }
    const bx = 500; SV('rect', { x: bx, y: 140 - 120 * u, width: 26, height: 120 * u, fill: '#d4553a' }, s); SV('rect', { x: bx, y: 20, width: 26, height: 120 * (1 - u), fill: '#8f7c66' }, s); SV('text', { x: bx + 34, y: 60, text: 'kavics', 'font-size': 11, 'font-weight': 700, fill: 'var(--ink2)' }, s); SV('text', { x: bx + 34, y: 136, text: 'épület', 'font-size': 11, 'font-weight': 700, fill: 'var(--coral-ink)' }, s); SV('text', { x: bx + 13, y: 14, 'text-anchor': 'middle', text: 'Σ = állandó', 'font-size': 10.5, 'font-weight': 800, fill: 'var(--ink)' }, s);
    SV('text', { x: 10, y: 24, text: u < .02 ? 'Kavicsterhelés = a kész épület súlya → a süllyedés nagy része lezajlik' : u > .98 ? 'Kész épület – a kavics elfogyott, a terhelés nem nőtt' : 'Építés: a kavicsot olyan ütemben hordják el, ahogy az épület súlya nő', 'font-size': 12.5, 'font-weight': 700, fill: 'var(--ink2)' }, s); };
  r.addEventListener('input', dm); dm();
})();

/* ---------- f) szerkezeti merevség: merev vs csuklós keret ---------- */
(function frame() {
  const host = $('#frSvg'); if (!host) return; let rigid = true;
  const draw = () => {
    const d = rv('frD'); out('frD', d + ' mm'); const W = 600, Hh = 300, X = [100, 300, 500], Y0 = 250, h = 62; const s = svg(host, W, Hh); pat(s);
    SV('rect', { x: 0, y: Y0, width: W, height: Hh - Y0, fill: 'url(#pSand)' }, s); SV('rect', { x: 400, y: Y0, width: 200, height: Hh - Y0, fill: 'url(#pClay)' }, s);
    const dy = [0, 0, d * 1.6]; const node = (i, j) => [X[i] + (rigid ? 0 : (j / 3) * 0), Y0 - j * h + dy[i]];
    // kitöltő falak a jobb nyílásban
    for (let j = 0; j < 3; j++) { const a = node(1, j), b = node(2, j), c = node(2, j + 1), e = node(1, j + 1); SV('polygon', { points: [a, b, c, e].map(p => p.join(',')).join(' '), fill: '#f5efe2', stroke: 'none', opacity: .8 }, s);
      if (!rigid && d > 6) { const k = Math.min(3, Math.floor(d / 8)); for (let q = 0; q < k; q++) SV('path', { d: `M${a[0] + 30 + q * 40},${a[1] - 6} l14,-14 l-4,-6 l14,-12`, stroke: d > 24 ? '#b5302a' : '#3b2f28', 'stroke-width': 1 + d / 14, fill: 'none' }, s); } }
    // oszlopok
    for (let i = 0; i < 3; i++) SV('line', { x1: node(i, 0)[0], y1: node(i, 0)[1], x2: node(i, 3)[0], y2: node(i, 3)[1], stroke: 'var(--ink)', 'stroke-width': 6 }, s);
    // gerendák
    for (let j = 1; j <= 3; j++) for (let i = 0; i < 2; i++) { const a = node(i, j), b = node(i + 1, j); if (rigid && i === 1 && d > 0) { const c1 = [a[0] + 70, a[1]], c2 = [b[0] - 70, b[1]]; SV('path', { d: `M${a[0]},${a[1]} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${b[0]},${b[1]}`, stroke: 'var(--ink)', 'stroke-width': 6, fill: 'none' }, s); } else SV('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: 'var(--ink)', 'stroke-width': 6 }, s); }
    for (let i = 0; i < 3; i++) for (let j = 1; j <= 3; j++) { const p = node(i, j); if (rigid) { if (d > 2 && i >= 1) SV('circle', { cx: p[0], cy: p[1], r: 6 + d * 0.5, fill: '#d4553a', opacity: .35 }, s); SV('rect', { x: p[0] - 5, y: p[1] - 5, width: 10, height: 10, fill: 'var(--ink)' }, s); } else SV('circle', { cx: p[0], cy: p[1], r: 6, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 3 }, s); }
    for (let i = 0; i < 3; i++) { const p = node(i, 0); SV('rect', { x: p[0] - 26, y: p[1], width: 52, height: 12, fill: '#bfc3c6', stroke: '#4b5458' }, s); }
    SV('text', { x: 520, y: Y0 + d * 1.6 + 30, text: `δ = ${d} mm`, 'font-size': 13, 'font-weight': 800, fill: '#fff' }, s);
    $('#frMsg').innerHTML = rigid ? `<b>Merev csomópontok (határozatlan):</b> kisebb torzulás, de a támaszsüllyedés <b>kényszererőket</b> (M, V) okoz – a teher átrendeződik. ${d > 20 ? '<span class="status b">jelentős többlet-igénybevétel</span>' : ''}` : `<b>Csuklós csomópontok (határozott):</b> nincs kényszererő, a csuklók elfordulnak – de a <b>torzulás</b> a kitöltő falakban repedést, befeszülést okoz. ${d > 20 ? '<span class="status b">falrepedések</span>' : ''}`;
  };
  window.U.seg('frType', v => { rigid = v === 'rigid'; draw(); }); bindR(['frD'], draw); draw();
})();

/* ---------- süllyedési hézag ---------- */
(function joint() {
  const host = $('#jtSvg'); if (!host) return; let j = false;
  const draw = () => {
    const u = rv('jtS') / 100; out('jtS', Math.round(u * 100) + '%'); const W = 600, Hh = 260, gy = 210; const s = svg(host, W, Hh); pat(s); SV('rect', { x: 0, y: gy, width: W, height: Hh - gy, fill: 'url(#pClay)' }, s);
    const sT = 40 * u, sL = 10 * u; // magas rész többet süllyed
    if (j) { SV('rect', { x: 120, y: gy - 170 + sT, width: 180, height: 170, fill: '#f5efe2', stroke: '#5b524a', 'stroke-width': 2 }, s); SV('rect', { x: 306, y: gy - 70 + sL, width: 200, height: 70, fill: '#f5efe2', stroke: '#5b524a', 'stroke-width': 2 }, s); SV('line', { x1: 303, x2: 303, y1: gy - 175, y2: gy + 6, stroke: '#2b78ad', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, s); SV('text', { x: 310, y: gy - 150, text: 'süllyedési hézag', 'font-size': 12, 'font-weight': 700, fill: '#2b78ad' }, s); }
    else { const pts = `120,${gy - 170 + sT} 300,${gy - 170 + sT} 300,${gy - 70 + sT * .7} 506,${gy - 70 + sL} 506,${gy + sL} 300,${gy + sT * .7} 120,${gy + sT}`; SV('polygon', { points: pts, fill: '#f5efe2', stroke: '#5b524a', 'stroke-width': 2 }, s); if (u > .25) { SV('path', { d: `M300,${gy - 70 + sT * .7} l14,${10 + u * 6} l-6,${8} l16,${12 + u * 10} l-6,${10} l12,${12}`, stroke: u > .6 ? '#b5302a' : '#3b2f28', 'stroke-width': 1.5 + u * 3, fill: 'none' }, s); SV('text', { x: 330, y: gy - 92, text: 'repedés a csatlakozásnál', 'font-size': 12, 'font-weight': 700, fill: '#b5302a' }, s); } }
    for (let k = 0; k < 4; k++) for (let i = 0; i < 4; i++) SV('rect', { x: 140 + i * 40, y: gy - 155 + k * 40 + sT, width: 16, height: 18, fill: '#9fc3d6' }, s);
    for (let i = 0; i < 4; i++) SV('rect', { x: 330 + i * 44, y: gy - 52 + sL, width: 18, height: 18, fill: '#9fc3d6' }, s);
    SV('text', { x: 130, y: 22, text: 'magas, nehéz épületrész', 'font-size': 12, 'font-weight': 700, fill: 'var(--ink2)' }, s); SV('text', { x: 360, y: 22, text: 'alacsony, könnyű rész', 'font-size': 12, 'font-weight': 700, fill: 'var(--ink2)' }, s);
  };
  $('#jtTgl').addEventListener('change', e => { j = e.target.checked; draw(); }); bindR(['jtS'], draw); draw();
})();

/* ---------- g) építési ütem telített agyagon ---------- */
(function pace() {
  const host = $('#paSvg'); if (!host) return;
  const draw = () => {
    const tb = rv('paT'); out('paT', tb + ' hónap'); const tau = 6; const W = 600, Hh = 260, L = 50, R = 16, T = 20, B = 40; const s = svg(host, W, Hh);
    const tx = (m) => L + m / 30 * (W - L - R), uy = (v) => Hh - B - v * (Hh - T - B);
    for (let m = 0; m <= 30; m += 6) { SV('line', { x1: tx(m), x2: tx(m), y1: T, y2: Hh - B, stroke: 'var(--line2)' }, s); SV('text', { x: tx(m), y: Hh - B + 14, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--mute)', text: m }, s); }
    SV('text', { x: (W + L) / 2, y: Hh - 8, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: 'var(--ink2)', text: 'idő [hónap]' }, s);
    // pórusvíz-túlnyomás: lineáris teherfelhordás + exponenciális disszipáció
    const dt = 0.05; let u = 0; const pu = [], pq = []; let umax = 0;
    for (let t = 0; t <= 30; t += dt) { const dq = t < tb ? dt / tb : 0; u += dq - u / tau * dt; umax = Math.max(umax, u); pu.push(`${tx(t)},${uy(u)}`); pq.push(`${tx(t)},${uy(Math.min(1, t / tb))}`); }
    SV('rect', { x: L, y: uy(1), width: W - L - R, height: uy(0.55) - uy(1), fill: 'var(--coral)', opacity: .1 }, s); SV('text', { x: W - R - 4, y: uy(1) + 14, 'text-anchor': 'end', 'font-size': 10.5, fill: 'var(--coral-ink)', 'font-weight': 700, text: 'kockázatos tartomány (stabilitás!)' }, s);
    SV('polyline', { points: pq.join(' '), fill: 'none', stroke: 'var(--ink2)', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, s); SV('polyline', { points: pu.join(' '), fill: 'none', stroke: 'var(--sky)', 'stroke-width': 3 }, s);
    SV('text', { x: tx(Math.min(tb, 28)) + 4, y: uy(1) + 30, 'font-size': 10.5, fill: 'var(--ink2)', text: 'teher' }, s); SV('text', { x: 60, y: T + 10, 'font-size': 11, 'font-weight': 700, fill: 'var(--sky-ink)', text: `pórusvíz-túlnyomás csúcsa: ${Math.round(umax * 100)}% a teherből` }, s);
    $('#paMsg').innerHTML = umax > 0.55 ? `<span class="status b">gyors építés</span> A telített agyagban a pórusvíz nem tud elég gyorsan kiszivárogni – a hatékony feszültség és ezzel a nyírószilárdság lassan nő: talajtörés, nagy süllyedéskülönbség veszélye.` : umax > 0.4 ? `<span class="status w">közepes ütem</span> A túlnyomás egy része még az építés alatt leépül.` : `<span class="status">lassú, kontrollált ütem</span> A teher növekedésével párhuzamosan konszolidálódik a talaj – biztonságosabb, de tovább tart és drágább.`;
  };
  bindR(['paT'], draw); draw();
})();
})();
