/* ===== Interaktív ábrák – 2. rész (talajcsere, talajjavítás, előterhelés, szerkezet) ===== */
(function () {
const { $, $$, clamp, lerp, fmt, H, pct } = window.U; const SV = window.SV, svg = window.mkSvg, pat = window.SVpat;
const bindR = (ids, fn) => ids.forEach(id => { const r = $('#' + id); if (r) r.addEventListener('input', fn); });
const out = (id, txt) => { const e = $(`[data-for="${id}"]`); if (e && e.textContent !== String(txt)) e.textContent = txt; };   // csak változáskor ír
const rv = (id) => { const r = $('#' + id); window.U.fillRange(r); return +r.value; };
const animate = (dur, fn, done) => { const t0 = performance.now(); const st = (t) => { const u = clamp((t - t0) / dur, 0, 1); fn(u); if (u < 1) requestAnimationFrame(st); else if (done) done(); }; requestAnimationFrame(st); };

/* ---------- 1/C talajcsere: a módszer ábrája (kiemelés, kiszélesítés, rétegenkénti tömörítés, teherterjedés, két ellenőrzés) ---------- */
(function replacementFig() {
  const host = $('#tcsFig'); if (!host) return;
  const arrow = (x, y1, y2, c, w, s, hw = 6) => { SV('line', { x1: x, y1, x2: x, y2: y2 - hw * 1.2, stroke: c, 'stroke-width': w }, s); SV('path', { d: `M${x - hw} ${y2 - hw * 1.6}L${x} ${y2}L${x + hw} ${y2 - hw * 1.6}Z`, fill: c }, s); };
  const dimH = (x1, x2, y, txt, s, up = true) => { SV('line', { x1, y1: y, x2, y2: y, stroke: 'var(--ink)', 'stroke-width': 1.2 }, s); [x1, x2].forEach(x => SV('line', { x1: x, y1: y - 6, x2: x, y2: y + 6, stroke: 'var(--ink)', 'stroke-width': 1.2 }, s)); SV('text', { x: (x1 + x2) / 2, y: up ? y - 6 : y + 17, 'text-anchor': 'middle', text: txt, 'font-size': 13.5 * FS, 'font-weight': 800, class: 'hl' }, s); };
  const dimV = (x, y1, y2, txt, s) => { SV('line', { x1: x, y1, x2: x, y2, stroke: 'var(--ink)', 'stroke-width': 1.2 }, s); [y1, y2].forEach(y => SV('line', { x1: x - 6, y1: y, x2: x + 6, y2: y, stroke: 'var(--ink)', 'stroke-width': 1.2 }, s)); SV('text', { x: x - 9, y: (y1 + y2) / 2 + 5, 'text-anchor': 'end', text: txt, 'font-size': 14 * FS, 'font-weight': 800, class: 'hl' }, s); };
  /* felirat kis kártyán: a mintás talajon is jól olvasható */
  let FS = 1;   // keskeny nézetben nagyobb feliratok
  const lab = (x, y, lines, s, c = 'var(--ink)') => { const g = SV('g', {}, s); lines.forEach((t, i) => SV('text', { x, y: y + i * 17 * FS, text: t, 'font-size': (i ? 13 : 14) * FS, 'font-weight': i ? 600 : 800, style: `fill:${i ? 'var(--ink2)' : c}` }, g)); try { const b = g.getBBox(); const r = SV('rect', { x: b.x - 7, y: b.y - 4, width: b.width + 14, height: b.height + 8, rx: 7, fill: 'var(--card)', opacity: .93, stroke: c, 'stroke-opacity': .35 }); g.insertBefore(r, g.firstChild); } catch (e) { } };
  const MEG = EN ? 'allow' : 'meg';   // a megengedett feszültség indexe
  const draw = () => {
    /* keskeny helyen a feliratok a metszet alá, egy oszlopba kerülnek */
    const nar = (host.clientWidth || 720) < 560; FS = nar ? 1.35 : 1;
    const W = nar ? 460 : 720, ys = nar ? 374 : 404, Hh = nar ? ys + 400 : ys; const s = svg(host, W, Hh); pat(s);
    const y0 = 96, yb = 176, v = 120, yv = yb + v, cx = nar ? 244 : 268, B = 150, th = 35, tg = Math.tan(th * Math.PI / 180), Bv = B + 2 * v * tg;
    const xl = cx - Bv / 2, xr = cx + Bv / 2, bl = cx - B / 2, br = cx + B / 2, sl = 30, xt = 482;
    // talajok
    SV('rect', { x: 0, y: 0, width: W, height: y0, fill: 'var(--card2)' }, s);
    SV('rect', { x: 0, y: y0, width: W, height: yb - y0, fill: 'url(#pClay)' }, s);
    SV('rect', { x: 0, y: yb, width: W, height: ys - yb, fill: 'url(#pSoft)' }, s);
    // munkagödör a terepig, visszatöltve
    SV('path', { d: `M${xl - sl} ${y0}L${xl} ${yb}L${xr} ${yb}L${xr + sl} ${y0}Z`, fill: 'url(#pFill)' }, s);
    SV('path', { d: `M${xl - sl} ${y0}L${xl} ${yb}M${xr} ${yb}L${xr + sl} ${y0}`, fill: 'none', stroke: '#4a3a2c', 'stroke-width': 1.4, 'stroke-dasharray': '6 4' }, s);
    SV('rect', { x: 0, y: y0 - 4, width: W, height: 5, fill: '#7d9a5b' }, s);
    // csereréteg: 30 cm-es rétegekben tömörítve
    SV('rect', { x: xl, y: yb, width: Bv, height: v, fill: 'url(#pGrav)', stroke: '#4a3a2c', 'stroke-width': 1.8 }, s);
    for (let i = 1; i < 4; i++) SV('line', { x1: xl, y1: yb + v * i / 4, x2: xr, y2: yb + v * i / 4, stroke: '#4a3a2c', 'stroke-width': 1, 'stroke-dasharray': '4 4', opacity: .75 }, s);
    // teherterjedés ϑ szögben
    SV('path', { d: `M${bl} ${yb}L${br} ${yb}L${xr} ${yv}L${xl} ${yv}Z`, fill: 'var(--coral)', opacity: .2 }, s);
    [[bl, xl], [br, xr]].forEach(([a, b]) => SV('line', { x1: a, y1: yb, x2: b, y2: yv, stroke: 'var(--coral-ink)', 'stroke-width': 2.2, 'stroke-dasharray': '8 5' }, s));
    const r = 46, sa = Math.sin(th * Math.PI / 180), ca = Math.cos(th * Math.PI / 180);
    SV('line', { x1: bl, y1: yb, x2: bl, y2: yb + r + 8, stroke: 'var(--ink)', 'stroke-width': 1, 'stroke-dasharray': '3 3' }, s);
    SV('path', { d: `M${bl} ${yb + r}A${r} ${r} 0 0 1 ${bl - r * sa} ${yb + r * ca}`, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.4 }, s);
    const am = (90 + th / 2) * Math.PI / 180; SV('text', { x: bl + Math.cos(am) * (r + 12) - 4, y: yb + Math.sin(am) * (r + 12) + 6, text: 'ϑ', 'font-size': 15 * FS, 'font-weight': 800, class: 'hl', 'text-anchor': 'middle' }, s);
    // σ1 az alapsíkon, σ2 a csereréteg alján
    SV('rect', { x: bl, y: yb, width: B, height: 22, fill: 'var(--coral)', opacity: .75 }, s);
    for (let i = 0; i < 6; i++) arrow(bl + 12 + i * (B - 24) / 5, yb + 2, yb + 20, '#fff', 1.6, s, 4);
    const h2 = 22 * B / Bv + 4; SV('rect', { x: xl, y: yv, width: Bv, height: h2, fill: 'var(--amber)', opacity: .85 }, s);
    for (let i = 0; i < 9; i++) arrow(xl + 10 + i * (Bv - 20) / 8, yv + 1, yv + h2 - 1, '#fff', 1.3, s, 3);
    // alaptest és teher
    SV('rect', { x: bl, y: yb - 26, width: B, height: 26, fill: '#c3c7ca', stroke: '#4b5458', 'stroke-width': 1.6 }, s);
    SV('rect', { x: cx - 22, y: y0 - 42, width: 44, height: yb - 26 - (y0 - 42), fill: '#c3c7ca', stroke: '#4b5458', 'stroke-width': 1.6 }, s);
    arrow(cx, 6, y0 - 46, 'var(--ink)', 3.2, s, 8); SV('text', { x: cx + 14, y: 28, text: 'P', 'font-size': 17 * FS, 'font-weight': 800, class: 'hl' }, s);
    // talajvíz a csere alatt
    const yw = yv + 60; SV('line', { x1: 0, y1: yw, x2: W, y2: yw, stroke: 'var(--sky)', 'stroke-width': 2, 'stroke-dasharray': '10 6' }, s);
    SV('path', { d: `M24 ${yw - 14}L40 ${yw - 14}L32 ${yw - 3}Z`, fill: 'var(--sky)' }, s); SV('text', { x: 46, y: yw - 5, text: 'talajvíz', 'font-size': 12.5 * FS, 'font-weight': 700, class: 'hl', style: 'fill:var(--sky-ink)' }, s);
    // méretek
    dimH(bl, br, yb + 50, 'B', s); dimH(xl, xr, yv + h2 + 12, 'B + 2·v·tg ϑ', s, false);
    dimV(xl - 16, yb, yv, 'v', s); dimV(xl - sl - 26, y0, yb, 't', s);
    // feliratok: széles nézetben jobbra, vezetővonallal; keskenyben a metszet alatt, egy oszlopban
    const L1 = ['takaróréteg (γ_{0})', 'a gödör visszatöltve'], L2 = ['σ_{1} = P/B ≤ σ_{1,' + MEG + '}', 'a csererétegen'], L3 = ['csereréteg (γ_{1})', 'homokos kavics, zúzottkő', '≤ 30 cm-es rétegek, tömörítve'], L4 = ['σ_{2} ≤ σ_{2,' + MEG + '}', 'az alaprétegen'], L5 = ['gyenge, összenyomható', 'alapréteg (γ_{2})'];
    if (!nar) {
      lab(xt, 126, L1, s);
      SV('line', { x1: br + 4, y1: yb + 11, x2: xt - 6, y2: yb + 11, stroke: 'var(--coral-ink)', 'stroke-width': 1.2 }, s);
      lab(xt, yb + 16, L2, s, 'var(--coral-ink)');
      lab(xt, yb + 72, L3, s);
      SV('line', { x1: xr - 6, y1: yv + h2 / 2, x2: xt - 6, y2: yv + h2 / 2, stroke: 'var(--amber-ink)', 'stroke-width': 1.2 }, s);
      lab(xt, yv + 18, L4, s, 'var(--amber-ink)');
      lab(xt, yw + 26, L5, s);
    } else {
      let y = ys + 30; [[L1], [L2, 'var(--coral-ink)'], [L3], [L4, 'var(--amber-ink)'], [L5]].forEach(([Ls, c]) => { lab(16, y, Ls, s, c); y += Ls.length * 17 * FS + 16; });
    }
  };
  draw(); let lw = innerWidth; addEventListener('resize', () => { if (Math.abs(innerWidth - lw) < 24) return; lw = innerWidth; draw(); });
})();

/* ---------- c) talajcsere ---------- */
(function replacement() {
  const host = $('#tcsSvg'); if (!host) return; let build = 1;
  const draw = () => {
    const P = rv('tcsP'), B = rv('tcsB'), v = rv('tcsV'), th = rv('tcsT'), qa = rv('tcsQ'); const gw = $('#tcsGw').checked;
    out('tcsP', P + ' kN/m'); out('tcsB', fmt(B, 1) + ' m'); out('tcsV', fmt(v, 2) + ' m'); out('tcsT', th + '°'); out('tcsQ', qa + ' kPa');
    const tg = Math.tan(th * Math.PI / 180), Bv = B + 2 * v * tg; const s1 = P / B, s2 = P / Bv + 20 * v; const ok2 = s2 <= qa; const nl = Math.ceil(v / 0.3 - 1e-9);
    const W = 640, Hh = 340, k = 80, cx = 320, yb = 122; const s = svg(host, W, Hh); pat(s);
    SV('rect', { x: 0, y: 0, width: W, height: 44, fill: 'var(--card2)' }, s);
    SV('rect', { x: 0, y: 44, width: W, height: yb - 44, fill: 'url(#pFill)' }, s); SV('rect', { x: 0, y: yb, width: W, height: Hh - yb, fill: 'url(#pClay)' }, s); SV('rect', { x: 0, y: 42, width: W, height: 4, fill: '#7d9a5b' }, s);
    SV('text', { x: 10, y: 64, text: 'takaróréteg (γ_{0})', 'font-size': 12.5, 'font-weight': 700, class: 'hl' }, s); SV('text', { x: 10, y: Hh - 12, text: 'alapréteg – összenyomható (γ_{2})', 'font-size': 12.5, 'font-weight': 700, class: 'hl' }, s);
    const xL = cx - Bv * k / 2, xR = cx + Bv * k / 2, yv = yb + v * k; const pts = `${cx - B * k / 2},${yb} ${cx + B * k / 2},${yb} ${xR},${yv} ${xL},${yv}`;
    const fillH = v * k * build; SV('clipPath', { id: 'tcsClip' }, s); const cp = s.lastChild; SV('rect', { x: 0, y: yv - fillH, width: W, height: fillH }, cp);
    SV('rect', { x: xL - 8, y: yb, width: (xR - xL) + 16, height: v * k, fill: '#3a2e25', opacity: .3 }, s);
    const gfill = SV('g', { 'clip-path': 'url(#tcsClip)' }, s); SV('rect', { x: xL - 8, y: yb, width: xR - xL + 16, height: v * k, fill: 'url(#pGrav)' }, gfill);
    for (let i = 1; i < nl; i++) { const y = yv - i * 0.3 * k; SV('line', { x1: xL - 8, x2: xR + 8, y1: y, y2: y, stroke: '#5b4c3c', 'stroke-dasharray': '6 4', 'stroke-width': 1.2 }, gfill); }
    SV('polygon', { points: pts, fill: 'none', stroke: '#e5ae47', 'stroke-width': 2.5, 'stroke-dasharray': '7 5' }, s);
    SV('line', { x1: xL - 8, x2: xR + 8, y1: yv, y2: yv, stroke: '#2a6b56', 'stroke-width': 3 }, s);
    if (gw) { const yw = yb + v * k * 0.55; SV('line', { x1: 0, x2: W, y1: yw, y2: yw, stroke: '#2b78ad', 'stroke-width': 2.5 }, s); SV('path', { d: `M${W - 96},${yw - 12} l8,10 l8,-10 z`, fill: '#2b78ad' }, s); SV('text', { x: W - 74, y: yw - 5, text: 'talajvíz', 'font-size': 12, 'font-weight': 700, class: 'hl', style: 'fill:var(--sky-ink)' }, s); }
    // alaptest + teher
    SV('rect', { x: cx - B * k / 2, y: yb - 26, width: B * k, height: 26, fill: '#c3c7ca', stroke: '#4b5458' }, s); SV('rect', { x: cx - 12, y: 30, width: 24, height: yb - 56, fill: '#c3c7ca', stroke: '#4b5458' }, s);
    SV('line', { x1: cx, x2: cx, y1: 2, y2: 22, stroke: '#d4553a', 'stroke-width': 3 }, s); SV('path', { d: `M${cx - 7},18 L${cx},30 L${cx + 7},18 Z`, fill: '#d4553a' }, s); SV('text', { x: cx + 14, y: 20, text: `P = ${P} kN/m`, 'font-size': 13, 'font-weight': 800, fill: 'var(--coral-ink)' }, s);
    // feszültségek: az alapsíkon és a csereréteg alján
    SV('rect', { x: cx - B * k / 2, y: yb + 1, width: B * k, height: Math.min(14, v * k * .4), fill: '#d4553a', opacity: .6 }, s);
    SV('rect', { x: xL, y: yv + 2, width: xR - xL, height: 8, fill: ok2 ? '#39c2a5' : '#d4553a', opacity: .85 }, s);
    SV('text', { x: cx + B * k / 2 + 10, y: yb - 8, text: `σ_{1} = ${Math.round(s1)} kPa`, 'font-size': 13, 'font-weight': 800, class: 'hl', style: 'fill:var(--coral-ink)' }, s);
    SV('text', { x: cx, y: yv + 28, 'text-anchor': 'middle', text: `σ_{2} = ${Math.round(s2)} kPa`, 'font-size': 13.5, 'font-weight': 800, class: 'hl', style: `fill:${ok2 ? 'var(--ok)' : 'var(--bad)'}` }, s);
    // méretvonalak
    const yd = yv + 48; SV('line', { x1: xL, x2: xR, y1: yd, y2: yd, stroke: 'var(--ink)', 'stroke-width': 1.5 }, s); [xL, xR].forEach(x => SV('line', { x1: x, x2: x, y1: yd - 6, y2: yd + 6, stroke: 'var(--ink)', 'stroke-width': 1.5 }, s));
    SV('text', { x: cx, y: yd + 17, 'text-anchor': 'middle', text: `B + 2·v·tgϑ = ${fmt(Bv, 2)} m`, 'font-size': 12.5, 'font-weight': 800, class: 'hl' }, s);
    const xv = xL - 20; SV('line', { x1: xv, x2: xv, y1: yb, y2: yv, stroke: 'var(--ink)', 'stroke-width': 1.5 }, s); [yb, yv].forEach(y => SV('line', { x1: xv - 5, x2: xv + 5, y1: y, y2: y, stroke: 'var(--ink)', 'stroke-width': 1.5 }, s));
    SV('text', { x: xv - 8, y: (yb + yv) / 2 + 4, 'text-anchor': 'end', text: `v = ${fmt(v, 2)} m`, 'font-size': 12.5, 'font-weight': 700, class: 'hl' }, s);
    SV('text', { x: xR + 14, y: yv + 4, text: 'geotextília', 'font-size': 11.5, 'font-weight': 700, class: 'hl', style: 'fill:var(--teal-ink)' }, s);
    $('#tcsOut').innerHTML = `<div class="r"><span>σ<sub>1</sub> az alapsíkon (P/B)</span><b>${Math.round(s1)} kPa</b></div><div class="r"><span>σ<sub>2</sub> a csereréteg alján</span><b style="color:${ok2 ? 'var(--ok)' : 'var(--bad)'}">${Math.round(s2)} kPa</b></div><div class="r"><span>kiszélesítés oldalanként (v·tgϑ)</span><b>${fmt(v * tg, 2)} m</b></div><div class="r"><span>tömörítendő rétegek (≤ 30 cm)</span><b>${nl} db</b></div>`;
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
  const host = $('#vibSvg'); if (!host) return; let step = 0, t = 0, shown = -1; const txt = ['A darura függesztett mélyvibrátor <span class="nw">(Ø 25–40 cm)</span> <b>önsúlyával és rezgéssel</b> hatol le; a lefelé haladást <b>vízbesajtolás (öblítés)</b> segíti.', 'A tervezett mélységben a rezgés a laza szemcséket <b>tömörebb elrendeződésbe</b> rázza – a lyuk körül tömörödött zóna alakul ki.', 'A vibrátort <b>fokozatosan felhúzzák</b>, közben a lyukba kavicsot, murvát, bányameddőt vagy homokot juttatnak, és a felfelé haladó vibrátorral tömörítik.', 'Kész a tömörített oszlop és környezete. A felszínen a <b>térfogatcsökkenés</b> miatt tölcsér képződik, ezt feltöltik. A pontokat raszterben ismétlik.'];
  const draw = () => {
    const W = 440, Hh = 300, gy = 70, cx = 262; const s = svg(host, W, Hh); pat(s);
    SV('rect', { x: 0, y: 0, width: W, height: gy, fill: 'var(--card2)' }, s); SV('rect', { x: 0, y: gy, width: W, height: Hh - gy, fill: 'url(#pSand)' }, s);
    const depth = step === 0 ? 40 + 170 * clamp(t, 0, 1) : step === 1 ? 210 : step === 2 ? 210 - 170 * clamp(t, 0, 1) : 40;
    if (step >= 1) { const r = step === 1 ? 30 + 30 * t : 60; const top = step >= 2 ? gy + (step === 3 ? 0 : 210 - 170 * t - 20) : gy + 170; SV('ellipse', { cx, cy: (top + gy + 230) / 2, rx: r + 10, ry: (gy + 230 - top) / 2 + 10, fill: '#a3874f', opacity: .5 }, s); }
    if (step >= 2) { const top = step === 3 ? gy : gy + depth; SV('rect', { x: cx - 16, y: top, width: 32, height: gy + 230 - top, fill: 'url(#pGrav)', stroke: '#6d5c47' }, s); }
    if (step >= 1) SV('text', { x: cx - 74, y: gy + 150, 'text-anchor': 'end', text: 'tömörödött zóna', 'font-size': 12.5, 'font-weight': 700, class: 'hl' }, s);
    SV('text', { x: 14, y: Hh - 12, text: 'laza homok', 'font-size': 12.5, 'font-weight': 700, class: 'hl' }, s);
    if (step === 3) { SV('path', { d: `M${cx - 70},${gy} Q${cx},${gy + 26} ${cx + 70},${gy}`, fill: '#cdb27a', stroke: '#8a6f40' }, s); SV('text', { x: cx, y: gy - 12, 'text-anchor': 'middle', text: 'tölcsér → feltöltik', 'font-size': 12.5, 'font-weight': 700, fill: 'var(--ink2)' }, s); }
    if (step < 3) {
      const y0 = gy + depth; SV('line', { x1: cx, x2: cx, y1: 0, y2: y0 - 60, stroke: '#4b5458', 'stroke-width': 3 }, s); SV('rect', { x: cx - 5, y: y0 - 70, width: 10, height: 12, rx: 2, fill: '#4b5458' }, s);
      const jit = Math.sin(performance.now() / 30) * 1.5; SV('rect', { x: cx - 12 + jit, y: y0 - 60, width: 24, height: 60, rx: 4, fill: '#e5ae47', stroke: '#8a5c05' }, s); SV('path', { d: `M${cx - 12 + jit},${y0} L${cx + jit},${y0 + 14} L${cx + 12 + jit},${y0} Z`, fill: '#8a5c05' }, s);
      if (step === 0) for (let i = 0; i < 6; i++) { const yy = y0 - 10 - ((performance.now() / 8 + i * 40) % 150); if (yy > gy) SV('circle', { cx: cx + (i % 2 ? 20 : -20) + Math.sin(yy / 10) * 4, cy: yy, r: 3, fill: '#7fc6e8', opacity: .9 }, s); }
      if (step === 1) for (let i = 1; i <= 3; i++) SV('circle', { cx, cy: y0, r: 12 + i * 14 + ((performance.now() / 20) % 14), fill: 'none', stroke: '#fff', opacity: .5 / i }, s);
      if (step === 2) for (let i = 0; i < 8; i++) { const yy = gy + ((performance.now() / 6 + i * 24) % (depth)); SV('circle', { cx: cx + (i % 2 ? 18 : -18), cy: yy, r: 3.5, fill: '#8f7c66' }, s); }
    }
    SV('text', { x: 14, y: 26, text: ['1. Lehatolás öblítéssel', '2. Tömörítés a talpon', '3. Felhúzás + anyagadagolás', '4. Kész tömörített zóna'][step], 'font-size': 15, 'font-weight': 800, fill: 'var(--ink)' }, s);
    if (shown !== step) { shown = step; $('#vibTxt').innerHTML = txt[step]; }   // csak változáskor ír a DOM-ba
  };
  let raf = null; const loop = () => { t = Math.min(1, t + 0.008); draw(); raf = requestAnimationFrame(loop); };
  const go = (k) => { step = k; t = 0; $$('#vibSteps button').forEach((b, i) => b.classList.toggle('on', i === k)); };
  $('#vibSteps').addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(+b.dataset.v); });
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { if (!raf) loop(); } else { cancelAnimationFrame(raf); raf = null; } })); io.observe(host);
  go(0);
  // finomszem-tartalom
  const fr = $('#vibFines'); const upd = () => { const f = rv('vibFines'); out('vibFines', pct(f)); const m = $('#vibFinesMsg'); const ptr = $('#vibPtr'); ptr.style.left = clamp(f / 40 * 100, 0, 100) + '%';
    m.innerHTML = f < 10 ? '<span class="status">jól tömöríthető – vibroflotáció ✓</span>' : f <= 15 ? '<span class="status w">határeset – próbatömörítés, raszter sűrítése</span>' : '<span class="status b">túl sok finom szem: a rezgés „elnyelődik” → kavicscölöp</span>'; };
  fr.addEventListener('input', upd); upd();
})();

/* ---------- dinamikus tömörítés ---------- */
(function dyn() {
  const host = $('#dynSvg'); if (!host) return; let drops = 0, anim = null; let soilN = 0.5;
  const draw = (fall = 0, ring = 0) => {
    const Wt = rv('dynW'), Hm = rv('dynH'); out('dynW', Wt + ' t'); out('dynH', Hm + ' m'); const d = soilN * Math.sqrt(Wt * Hm); const E = Wt * 9.81 * Hm / 1000;
    const W = 600, Hh = 380, gy = 206, k = 13; const s = svg(host, W, Hh); pat(s);
    SV('rect', { x: 0, y: 0, width: W, height: gy, fill: 'var(--card2)' }, s); SV('rect', { x: 0, y: gy, width: W, height: Hh - gy, fill: soilN < 0.45 ? 'url(#pSoft)' : 'url(#pFill)' }, s); SV('rect', { x: 0, y: gy - 3, width: W, height: 4, fill: '#8a8f6a' }, s);
    const cx = 330; const crater = Math.min(40, drops * 5);
    SV('path', { d: `M${cx - 50},${gy - 2} Q${cx},${gy + crater * 1.6} ${cx + 50},${gy - 2} Z`, fill: '#4a3d32' }, s);
    // tömörödött zóna
    const dz = Math.min(d, 12) * k; const zop = Math.min(.55, drops * .08);
    if (drops) SV('path', { d: `M${cx - 40},${gy} C${cx - 110},${gy + dz * .5} ${cx - 50},${gy + dz} ${cx},${gy + dz} C${cx + 50},${gy + dz} ${cx + 110},${gy + dz * .5} ${cx + 40},${gy} Z`, fill: '#e5ae47', opacity: zop, stroke: '#c2830c', 'stroke-dasharray': '5 4' }, s);
    // mélységskála a jobb szélen, az 5–7 m-es sávval
    SV('rect', { x: W - 52, y: gy, width: 52, height: Hh - gy, fill: 'var(--card)', opacity: .86 }, s);
    SV('rect', { x: W - 52, y: gy + 5 * k, width: 52, height: 2 * k, fill: 'var(--coral)', opacity: .32 }, s);
    for (let m = 0; m <= 12; m += 2) { SV('line', { x1: W - 52, x2: W - 44, y1: gy + m * k, y2: gy + m * k, stroke: 'var(--ink2)' }, s); if (m) SV('text', { x: W - 8, y: gy + m * k + 4, 'text-anchor': 'end', text: m + ' m', 'font-size': 11, 'font-weight': 600, fill: 'var(--ink2)' }, s); }
    SV('text', { x: W - 58, y: gy + 6 * k + 4, 'text-anchor': 'end', text: 'max. 6–8 m', 'font-size': 11.5, 'font-weight': 700, class: 'hl', style: 'fill:var(--coral-ink)' }, s);
    const yd = gy + Math.min(d, 12.6) * k; SV('line', { x1: cx - 120, x2: W - 52, y1: yd, y2: yd, stroke: 'var(--ink)', 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }, s);
    SV('text', { x: cx - 124, y: Math.min(yd + 4, Hh - 10), 'text-anchor': 'end', text: `hatásmélység ≈ ${fmt(d, 1)} m`, 'font-size': 12.5, 'font-weight': 800, class: 'hl' }, s);
    // lánctalpas daru rácsos gémmel
    const bx = 34; SV('rect', { x: bx, y: gy - 16, width: 150, height: 14, rx: 7, fill: '#2f3337' }, s); for (let i = 0; i < 6; i++) SV('circle', { cx: bx + 12 + i * 25.2, cy: gy - 9, r: 5, fill: '#6b7176' }, s);
    SV('rect', { x: bx + 16, y: gy - 50, width: 112, height: 34, rx: 4, fill: '#e5ae47', stroke: '#8a5c05', 'stroke-width': 1.5 }, s); SV('rect', { x: bx + 4, y: gy - 44, width: 26, height: 28, rx: 3, fill: '#c9912c', stroke: '#8a5c05' }, s);
    SV('rect', { x: bx + 98, y: gy - 76, width: 36, height: 28, rx: 3, fill: '#e5ae47', stroke: '#8a5c05', 'stroke-width': 1.5 }, s); SV('rect', { x: bx + 104, y: gy - 70, width: 24, height: 14, fill: '#9fc3d6', stroke: '#5b524a' }, s);
    const px = bx + 122, py = gy - 46, tipX = cx + 2, tipY = 10; const dxb = tipX - px, dyb = tipY - py, L = Math.hypot(dxb, dyb), nx = -dyb / L * 6, ny = dxb / L * 6;
    SV('line', { x1: px + nx, y1: py + ny, x2: tipX, y2: tipY, stroke: '#c2830c', 'stroke-width': 2.2 }, s); SV('line', { x1: px - nx, y1: py - ny, x2: tipX, y2: tipY, stroke: '#c2830c', 'stroke-width': 2.2 }, s);
    for (let i = 0; i < 9; i++) { const a = i / 10, b2 = (i + 1) / 10, sg = i % 2 ? 1 : -1, w1 = 1 - a, w2 = 1 - b2; SV('line', { x1: px + dxb * a + nx * sg * w1, y1: py + dyb * a + ny * sg * w1, x2: px + dxb * b2 - nx * sg * w2, y2: py + dyb * b2 - ny * sg * w2, stroke: '#c2830c', 'stroke-width': 1.2 }, s); }
    SV('line', { x1: bx + 30, y1: gy - 44, x2: tipX, y2: tipY, stroke: '#4b5458', 'stroke-width': 1 }, s);
    // ejtősúly
    const hTop = gy - 22 - Hm * 3.9; const wy = lerp(hTop, gy - 4 + crater * .8, fall * fall);
    SV('line', { x1: tipX, y1: tipY, x2: cx, y2: fall > 0 ? Math.max(tipY, hTop - 20) : wy - 20, stroke: '#4b5458', 'stroke-width': 1.5 }, s);
    const ws = 18 + Wt * 0.35; SV('rect', { x: cx - ws, y: wy - 20, width: ws * 2, height: 20, rx: 3, fill: '#4b5458', stroke: '#222' }, s); SV('text', { x: cx, y: wy - 6, 'text-anchor': 'middle', text: Wt + ' t', 'font-size': 11.5, 'font-weight': 800, fill: '#fff' }, s);
    const hx = cx + ws + 16; SV('line', { x1: hx, x2: hx, y1: hTop, y2: gy - 3, stroke: 'var(--ink2)', 'stroke-width': 1.3 }, s); [hTop, gy - 3].forEach(y => SV('line', { x1: hx - 5, x2: hx + 5, y1: y, y2: y, stroke: 'var(--ink2)', 'stroke-width': 1.3 }, s));
    SV('text', { x: hx + 8, y: (hTop + gy) / 2 + 4, text: `H = ${Hm} m`, 'font-size': 12.5, 'font-weight': 700, fill: 'var(--ink2)' }, s);
    if (ring > 0) for (let i = 0; i < 3; i++) SV('ellipse', { cx, cy: gy + 4, rx: 20 + (ring + i * .2) * 160, ry: 6 + (ring + i * .2) * 60, fill: 'none', stroke: '#fff', 'stroke-width': 2, opacity: (1 - ring) * (1 - i * .3) }, s);
    SV('text', { x: 12, y: gy + 20, text: soilN < 0.45 ? 'telített finomszemcsés talaj' : soilN > 0.52 ? 'laza homok' : 'laza, vegyes feltöltés', 'font-size': 12.5, 'font-weight': 700, class: 'hl' }, s);
    $('#dynOut').innerHTML = `<div class="r"><span>ejtésenkénti energia W·g·H</span><b>${fmt(E, 1)} MJ</b></div><div class="r"><span>becsült hatásmélység n·√(W·H)</span><b>${fmt(d, 1)} m</b></div><div class="r"><span>ejtések ezen a ponton</span><b>${drops}</b></div><div class="r"><span>gödör (szemléltetés)</span><b>${fmt(crater / 40 * 1.5, 1)} m</b></div>${d > 7 ? '<div class="r" style="grid-column:1/-1"><span class="status w">⚠ A képlet nagy energiánál túlbecsül; a gyakorlatban max. 5⁠–⁠7 m.</span></div>' : ''}`;
  };
  window.U.seg('dynSoil', v => { soilN = +v; draw(); });
  bindR(['dynW', 'dynH'], () => draw());
  $('#dynDrop').addEventListener('click', () => { if (anim) return; anim = 1; animate(900, u => draw(u, 0), () => { drops = Math.min(8, drops + 1); animate(900, u => draw(0, u), () => { anim = null; draw(); }); }); });
  $('#dynReset').addEventListener('click', () => { drops = 0; draw(); });
  draw();
})();

/* ---------- kőtömzs ---------- */
/* (a kőtömzs régi lépésábrája helyett: proc.js – ktFig) */

/* ---------- kavicscölöp raszter ---------- */
(function stoneCol() {
  const host = $('#kcSvg'); if (!host) return; let tri = true;
  const draw = () => {
    const d = rv('kcD'), sp = rv('kcS'), n = rv('kcN'); out('kcD', fmt(d, 2) + ' m'); out('kcS', fmt(sp, 1) + ' m'); out('kcN', fmt(n, 1));
    const C1 = tri ? 0.907 : 0.785; const as = C1 * (d / sp) ** 2; const ratio = 1 / (1 + as * (n - 1)); const De = (tri ? 1.05 : 1.13) * sp;
    const W = 460, Hh = 270, k = 52; const s = svg(host, W, Hh); pat(s); SV('rect', { x: 0, y: 0, width: W, height: Hh, fill: 'url(#pClay)' }, s);
    const cols = []; const dy = tri ? sp * Math.sqrt(3) / 2 : sp; for (let j = -1; j * dy * k < Hh + 60; j++) for (let i = -1; i * sp * k < W + 60; i++) { const x = (i * sp + (tri && j % 2 ? sp / 2 : 0)) * k + 40, y = j * dy * k + 40; cols.push([x, y]); }
    const mid = cols.reduce((b, c) => Math.hypot(c[0] - W / 2, c[1] - Hh / 2) < Math.hypot(b[0] - W / 2, b[1] - Hh / 2) ? c : b, cols[0]);
    SV('circle', { cx: mid[0], cy: mid[1], r: De / 2 * k, fill: '#39c2a5', opacity: .25, stroke: '#0d7a68', 'stroke-dasharray': '6 4', 'stroke-width': 2 }, s);
    cols.forEach(([x, y]) => SV('circle', { cx: x, cy: y, r: d / 2 * k, fill: 'url(#pGrav)', stroke: '#5b4c3c', 'stroke-width': 1.5 }, s));
    SV('text', { x: mid[0], y: Math.min(Hh - 8, mid[1] + De / 2 * k + 18), 'text-anchor': 'middle', text: `egységcella: D_{e} = ${fmt(De, 2)} m`, 'font-size': 13, 'font-weight': 800, class: 'hl' }, s);
    $('#kcOut').innerHTML = `<div class="r"><span>területi helyettesítési arány a<sub>s</sub></span><b>${pct(as * 100, 1)}</b></div><div class="r"><span>süllyedés a kezelés után (s/s<sub>0</sub>)</span><b style="color:var(--ok)">${pct(ratio * 100)} (−${pct((1 - ratio) * 100)})</b></div>`;
    const bar = $('#kcBar'); bar.style.width = (ratio * 100) + '%';
  };
  window.U.seg('kcPat', v => { tri = v === 'tri'; draw(); }); bindR(['kcD', 'kcS', 'kcN'], draw); draw();
})();

/* ---------- injektálás: öt módszer egy metszeten ---------- */
(function injMethods() {
  const host = $('#injSvg'); if (!host) return;
  const M = [
    { n: 'Itatásos injektálás', e: 'Kis nyomással, a talaj szerkezetének megbontása nélkül töltjük ki a szemcsék közötti hézagokat. A hézagtérfogat közben nem változik meg, csak a hézagok kerülnek kitöltésre. Az injektálás csőfelhúzás közben, alulról felfelé, szakaszonként halad; a besajtolt mennyiséget és a nyomást folyamatosan mérik.',
      soil: 'szemcsés talajok és durva iszapok', mat: 'kis viszkozitású anyag: cementtej, mikrocement, vízüveg alapú vagy műgyanta oldat', pr: 'kicsi – a talaj nem reped meg',
      use: ['meglévő alapok utólagos megerősítése', 'tömítő függöny munkagödör vagy gát alatt', 'laza homok szilárdítása alagút- és munkagödör-építés előtt'],
      lab: 'a szemcsék helyben maradnak, csak a hézagok telnek ki' },
    { n: 'Talajtömörítő injektálás', e: 'Nagyobb nyomáson, szakaszosan kisebb üregeket képeznek, és ezeket a besajtolt, sűrű injektálóanyag tölti ki. Az anyag nem hatol be a pórusokba: kiszorítja és tömöríti a környező lazább talajt. Az egymás fölött kialakuló gömbökből teherviselő oszlopok jönnek létre.',
      soil: 'laza szemcsés talajok, iszapok és agyagok is', mat: 'sűrű, kis roskadású cementhabarcs', pr: 'nagyobb, szakaszonként alulról felfelé',
      use: ['laza talaj tömörítése meglévő épületek alatt', 'teherviselő oszlopok kialakítása', 'megsüllyedt kisebb építmények, padozatok visszaemelése'],
      lab: 'a habarcsgömbök kiszorítják és tömörítik a talajt' },
    { n: 'Kőzet hézagkitöltő injektálás', e: 'Olyan, mint az itatásos injektálás, csak a kőzettestek repedéshálózatát injektáljuk. Az anyag a fúrásból kiindulva a repedések mentén terjed, és kitölti azokat.',
      soil: 'repedezett, mállott kőzet', mat: 'cementtej, cementhabarcs, szükség esetén műgyanta', pr: 'a repedések nyitottságához igazítva',
      use: ['sziklarézsűk stabilizálása', 'alagutak főtéjének és homlokfalának stabilizálása', 'alapok alatti lazább kőzetek stabilizálása', 'kőzetösszletek vízzáróságának javítása'],
      lab: 'csak a kőzet repedéshálózata telik ki' },
    { n: 'Repesztő/kompenzáló injektálás', e: 'A talajok és kőzetek „kierőszakolt” repedésein keresztül, nagy nyomáson kis viszkozitású, gyorsan kötő injektálóanyagot sajtolnak be. A megnyíló repedésekben injektálóanyag-lemezek keletkeznek, és a talaj a felette lévő építménnyel együtt megemelkedik. A besajtolás szelepes csöveken keresztül többször megismételhető, így a mozgás pontosan adagolható.',
      soil: 'talajok és kőzetek, finom szemcsés talaj is', mat: 'kis viszkozitású, gyorsan kötő injektálóanyag', pr: 'nagy – a talaj megreped',
      use: ['leggyakrabban alagútépítés során', 'süllyedéskompenzálás', 'építmények visszaemelése'],
      lab: 'a repedésekben keletkező lemezek megemelik az épületet' },
    { n: 'Üregkitöltő injektálás', e: 'Kisebb-nagyobb üregek kitöltésére használják, gravitációsan vagy kisebb nyomással. Az üreg alulról felfelé telik meg; a nehezen elérhető részeket duzzadó habbal zárják le.',
      soil: 'természetes és mesterséges üregek', mat: 'döntően javított cementhabarcs, kiegészítve duzzadó poliuretán habokkal', pr: 'gravitációs vagy kicsi',
      use: ['kőzetek természetes üregeinek feltöltése', 'padozatok alatti üregek kiinjektálása', 'felhagyott pincék, bányajáratok, aknák, közművezetékek kitöltése'],
      lab: 'az üreg alulról felfelé telik meg' }];
  const KK = ['1. módszer', '2. módszer', '3. módszer', '4. módszer', '5. módszer'];
  const W = 560, Hh = 320, GY = 64, GROUT = '#e6eff3', GRS = '#7fa2b5';
  let k = 0, u = 1, raf = 0, D = null;
  const r = $('#injT');
  const surface = (s) => { SV('rect', { x: 0, y: 0, width: W, height: GY, fill: '#e8efe9' }, s); };
  const pump = (s, x) => { SV('rect', { x: x - 58, y: GY - 30, width: 48, height: 30, rx: 4, fill: '#d9a441', stroke: '#5b524a', 'stroke-width': 1.5 }, s); SV('circle', { cx: x - 48, cy: GY - 2, r: 5, fill: '#3b3b3b' }, s); SV('circle', { cx: x - 20, cy: GY - 2, r: 5, fill: '#3b3b3b' }, s); SV('path', { d: `M${x - 10},${GY - 16} Q${x},${GY - 26} ${x},${GY - 4}`, fill: 'none', stroke: '#3b3b3b', 'stroke-width': 3 }, s); };
  function build() {
    const s = svg(host, W, Hh); pat(s); D = { s }; surface(s);
    if (k === 0) {
      SV('rect', { x: 0, y: GY, width: W, height: Hh - GY, fill: '#3e3027' }, s);
      D.g = [290, 240, 190, 140].map(y => SV('ellipse', { cx: 300, cy: y, rx: 0, ry: 0, fill: GROUT, stroke: GRS, 'stroke-width': 1.5 }, s));
      let seed = 11; const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647; const gr = SV('g', {}, s);
      for (let y = GY + 7; y < Hh + 8; y += 12.5) for (let x = ((y / 12.5) % 2) * 7; x < W + 8; x += 15) SV('circle', { cx: x + (rnd() - .5) * 3, cy: y + (rnd() - .5) * 2, r: 4.3 + rnd() * .9, fill: ['#c9a96b', '#b8955a', '#d6b97f'][Math.floor(rnd() * 3)], stroke: '#8a6d3e', 'stroke-width': .8 }, gr);
      pump(s, 300); D.p = SV('line', { x1: 300, x2: 300, y1: GY - 4, y2: 290, stroke: '#4a4f54', 'stroke-width': 5 }, s);
    }
    if (k === 1) {
      SV('rect', { x: 0, y: GY, width: W, height: Hh - GY, fill: 'url(#pSoft)' }, s);
      D.h = [], D.b = [];
      [292, 246, 200, 154].forEach(y => { D.h.push(SV('circle', { cx: 300, cy: y, r: 0, fill: 'rgba(40,28,18,.32)' }, s)); });
      [292, 246, 200, 154].forEach(y => { D.b.push(SV('circle', { cx: 300, cy: y, r: 0, fill: GROUT, stroke: GRS, 'stroke-width': 2 }, s)); });
      D.ar = SV('g', { stroke: '#fff', 'stroke-width': 2, 'stroke-linecap': 'round' }, s);
      pump(s, 300); D.p = SV('line', { x1: 300, x2: 300, y1: GY - 4, y2: 292, stroke: '#4a4f54', 'stroke-width': 5 }, s);
    }
    if (k === 2) {
      SV('rect', { x: 0, y: GY, width: W, height: 26, fill: 'url(#pFill)' }, s);
      SV('rect', { x: 0, y: GY + 26, width: W, height: Hh - GY - 26, fill: '#8d9196' }, s);
      const F = ['M300,120 L250,132 L196,124 L130,140 L60,128', 'M300,120 L352,110 L420,124 L500,112', 'M300,170 L240,186 L170,176 L96,196', 'M300,170 L368,184 L440,172 L530,190', 'M300,224 L246,214 L180,232 L110,224', 'M300,224 L360,236 L436,222 L520,240', 'M300,276 L232,268 L150,284', 'M300,276 L374,288 L470,276', 'M250,132 L232,170 L240,186', 'M420,124 L432,160 L440,172', 'M180,232 L170,270 L150,284', 'M368,184 L380,215 L360,236'];
      D.f = F.map((d, i) => { SV('path', { d, fill: 'none', stroke: '#3a3d40', 'stroke-width': 5, 'stroke-linejoin': 'round' }, s); return { el: SV('path', { d, fill: 'none', stroke: GROUT, 'stroke-width': 3.2, 'stroke-linejoin': 'round' }, s), del: i < 8 ? (i % 2 ? .04 : 0) + Math.floor(i / 2) * .08 : .45 + (i - 8) * .06 }; });
      D.f.forEach(f => { f.L = f.el.getTotalLength ? f.el.getTotalLength() : 200; f.el.setAttribute('stroke-dasharray', f.L); f.el.setAttribute('stroke-dashoffset', f.L); });
      pump(s, 300); D.p = SV('line', { x1: 300, x2: 300, y1: GY - 4, y2: 290, stroke: '#4a4f54', 'stroke-width': 5 }, s);
    }
    if (k === 3) {
      const G = 150, PY = 238; D.G = G; D.PY = PY;
      SV('rect', { x: 0, y: GY, width: W, height: G - GY, fill: '#e8efe9' }, s);
      SV('rect', { x: 0, y: G, width: W, height: Hh - G, fill: 'url(#pClay)' }, s);
      SV('rect', { x: 40, y: G, width: 70, height: PY - G + 8, fill: '#d9d4c7', stroke: '#5b524a', 'stroke-width': 1.5 }, s);
      SV('circle', { cx: 440, cy: 290, r: 22, fill: '#2f3337', stroke: '#1d2023', 'stroke-width': 2 }, s);
      SV('text', { x: 440, y: 294, text: 'alagút', 'font-size': 11, class: 'injl2', fill: '#fff', 'text-anchor': 'middle', 'font-weight': 700 }, s);
      SV('line', { x1: 110, x2: 540, y1: PY, y2: PY, stroke: '#4a4f54', 'stroke-width': 5 }, s);
      D.l = []; for (let i = 0; i < 9; i++) { const x = 150 + i * 44; SV('rect', { x: x - 3, y: PY - 5, width: 6, height: 10, fill: '#c76e3d' }, s); D.l.push(SV('path', { d: '', fill: GROUT, stroke: GRS, 'stroke-width': 1.2 }, s)); D.l[i].x = x; }
      D.bd = SV('g', {}, s); const b = D.bd;
      SV('rect', { x: 290, y: G - 104, width: 210, height: 104, fill: '#f5efe2', stroke: '#5b524a', 'stroke-width': 2 }, b);
      SV('path', { d: `M282,${G - 104} L395,${G - 134} L508,${G - 104} Z`, fill: '#b8553d', stroke: '#5b524a', 'stroke-width': 2 }, b);
      for (let r2 = 0; r2 < 2; r2++) for (let i = 0; i < 5; i++) SV('rect', { x: 304 + i * 40, y: G - 90 + r2 * 44, width: 22, height: 24, fill: '#9fc3d6', stroke: '#5b524a', 'stroke-width': 1.2 }, b);
      SV('rect', { x: 284, y: G, width: 222, height: 14, fill: '#bfc3c6', stroke: '#5b524a' }, b);
      D.ref = SV('line', { x1: 270, x2: 520, y1: G + 14, y2: G + 14, stroke: '#17201e', 'stroke-width': 1.2, 'stroke-dasharray': '5 4' }, s);
      D.st = SV('text', { x: 548, y: G + 36, class: 'injl', 'font-size': 13, 'font-weight': 800, fill: '#c0392b', 'text-anchor': 'end', stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke' }, s);
      SV('rect', { x: 52, y: G - 30, width: 46, height: 30, rx: 4, fill: '#d9a441', stroke: '#5b524a', 'stroke-width': 1.5 }, s);
    }
    if (k === 4) {
      SV('rect', { x: 0, y: GY, width: W, height: Hh - GY, fill: 'url(#pFill)' }, s);
      SV('rect', { x: 120, y: GY, width: 340, height: 14, fill: '#bfc3c6', stroke: '#5b524a' }, s);
      const cav = 'M160,150 C150,110 220,96 300,104 C380,100 450,112 446,160 C452,214 420,252 330,250 C250,256 168,246 160,206 Z';
      const cp = SV('clipPath', { id: 'injCav' }, s.querySelector('defs') || SV('defs', {}, s)); SV('path', { d: cav }, cp);
      SV('path', { d: cav, fill: '#2a2420', stroke: '#1b1714', 'stroke-width': 2 }, s);
      D.m = SV('rect', { x: 140, y: 260, width: 320, height: 0, fill: GROUT, 'clip-path': 'url(#injCav)' }, s);
      D.pu = SV('rect', { x: 140, y: 100, width: 320, height: 0, fill: '#f2d27a', 'clip-path': 'url(#injCav)' }, s);
      SV('path', { d: cav, fill: 'none', stroke: '#1b1714', 'stroke-width': 2 }, s);
      SV('text', { x: 548, y: 300, text: 'felhagyott pince, bányajárat', class: 'injl', 'font-size': 12, 'font-weight': 700, fill: '#fff', stroke: '#3b2f28', 'stroke-width': 3, 'paint-order': 'stroke', 'text-anchor': 'end' }, s);
      pump(s, 300); SV('line', { x1: 300, x2: 300, y1: GY - 4, y2: 112, stroke: '#4a4f54', 'stroke-width': 5 }, s);
    }
    const cap = $('#injCap'); if (cap) cap.textContent = M[k].lab;
    D.tt = SV('text', { x: W - 12, y: 22, class: 'injl', 'font-size': 12.5, 'font-weight': 700, fill: '#45307f', 'text-anchor': 'end' }, s);
  }
  const ease = x => x * x * (3 - 2 * x);
  function frame() {
    if (!D) return; const c = (a, b) => clamp((u - a) / (b - a), 0, 1);
    if (k === 0) { D.g.forEach((e, i) => { const f = ease(c(i / 4, (i + 1) / 4)); e.setAttribute('rx', 74 * f); e.setAttribute('ry', 30 * f); }); const st = Math.min(3, Math.floor(u * 4 - 1e-6)); D.p.setAttribute('y2', [290, 240, 190, 140][Math.max(0, st)]); }
    if (k === 1) { D.b.forEach((e, i) => { const f = ease(c(i / 4, (i + 1) / 4)); e.setAttribute('r', 21 * f); D.h[i].setAttribute('r', 44 * f); }); const st = Math.max(0, Math.min(3, Math.floor(u * 4 - 1e-6))); D.p.setAttribute('y2', [292, 246, 200, 154][st]);
      D.ar.innerHTML = ''; const y = [292, 246, 200, 154][st], f = ease(c(st / 4, (st + 1) / 4)); if (f > .15 && u < 1) for (let a = 0; a < 8; a++) { const an = a * Math.PI / 4, r1 = 24 * f, r2 = 24 * f + 12; SV('line', { x1: 300 + Math.cos(an) * r1, y1: y + Math.sin(an) * r1, x2: 300 + Math.cos(an) * r2, y2: y + Math.sin(an) * r2 }, D.ar); } }
    if (k === 2) D.f.forEach(f => { const v = c(f.del, f.del + .4); f.el.setAttribute('stroke-dashoffset', f.L * (1 - v)); });
    if (k === 3) { D.l.forEach((e, i) => { const f = ease(c(i * .06, i * .06 + .45)); const L = 22 * f, t = 5 * f, x = e.x; const y = D.PY; e.setAttribute('d', f > 0 ? `M${x - L},${y} Q${x - L / 2},${y - t} ${x},${y - t * 1.3} Q${x + L / 2},${y - t} ${x + L},${y} Q${x + L / 2},${y + t * .6} ${x},${y + t * .8} Q${x - L / 2},${y + t * .6} ${x - L},${y} Z` : ''); });
      const sett = 14 * (1 - ease(c(.25, 1))); D.bd.setAttribute('transform', `translate(0,${sett.toFixed(1)}) rotate(${(-sett * .12).toFixed(2)} 290 ${D.G})`); D.st.textContent = `süllyedés: ${Math.round(sett)} mm`; }
    if (k === 4) { const f = c(0, .82), g = c(.82, 1); const top = 104, bot = 256, h = (bot - top); const hm = h * .86 * f; D.m.setAttribute('y', bot - hm); D.m.setAttribute('height', hm); const hp = h * .14 * g; D.pu.setAttribute('y', bot - hm - hp); D.pu.setAttribute('height', hp); }
    const tt = pct(Math.round(u * 100)); if (D.tt.textContent !== tt) D.tt.textContent = tt;
    if (r) { r.value = Math.round(u * 100); window.U.fillRange(r); const o = $('[data-for="injT"]'); if (o) { const v = pct(Math.round(u * 100)); if (o.textContent !== v) o.textContent = v; } }
  }
  function info() {
    const m = M[k]; $('#injH').textContent = m.n;
    $('#injInfo').innerHTML = `<div class="kicker">${KK[k]}</div><h4>${m.n}</h4><p>${m.e}</p><div class="injrows"><div><b>Talaj</b><span>${m.soil}</span></div><div><b>Anyag</b><span>${m.mat}</span></div><div><b>Nyomás</b><span>${m.pr}</span></div></div><h5>Jellemző alkalmazás</h5><ul class="injuse">${m.use.map(x => `<li>${x}</li>`).join('')}</ul>`;
  }
  function play() { cancelAnimationFrame(raf); const t0 = performance.now(), dur = 5200; const st = (t) => { u = clamp((t - t0) / dur, 0, 1); frame(); if (u < 1) raf = requestAnimationFrame(st); }; u = 0; frame(); raf = requestAnimationFrame(st); }
  window.U.seg('injM', v => { k = +v; build(); info(); play(); });
  const pb = $('#injPlay'); if (pb) pb.addEventListener('click', play);
  if (r) r.addEventListener('input', () => { cancelAnimationFrame(raf); u = +r.value / 100; frame(); });
  build(); info(); u = 1; frame();
  let seen = false; const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting && !seen) { seen = true; if (!matchMedia('(prefers-reduced-motion: reduce)').matches) play(); } })); io.observe(host);
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
    const lb = SV('text', { x: 18, y: Hh - 16, text: `${S0.n} · ⚪ cementszemcsék`, 'font-size': 12.5, 'font-weight': 700, fill: '#fff' }, s); const lw = (lb.getComputedTextLength ? lb.getComputedTextLength() : 220) + 20; s.insertBefore(SV('rect', { x: 8, y: Hh - 34, width: lw, height: 26, rx: 6, fill: 'rgba(0,0,0,.62)' }), lb);
  };
  const res = () => { const S0 = SOIL[key]; const L = ['✗ nem alkalmas', '◐ korlátozottan', '✓ alkalmas']; const C = ['b', 'w', '']; $('#grOut').innerHTML = `<div class="mi"><i class="d" style="background:var(--violet)"></i><div><h5>Cementbesajtolás</h5><p>csak 0,8–1 mm-nél durvább homok-kavics, ill. üreges, repedezett kötött talaj</p></div><span class="status ${C[S0.cem]}">${L[S0.cem]}</span></div><div class="mi"><i class="d" style="background:var(--violet)"></i><div><h5>Kétkomponensű műgyanta</h5><p>homokos és iszapos talaj – agyagban nem hatékony</p></div><span class="status ${C[S0.pu]}">${L[S0.pu]}</span></div><div class="mi"><i class="d" style="background:var(--violet)"></i><div><h5>Vegyi anyagok (pl. vízüveg alapú)</h5><p>kis viszkozitású oldatok – finomabb homokokba is bejutnak</p></div><span class="status ${C[S0.ch]}">${L[S0.ch]}</span></div>`; };
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
  const host = $('#msSvg'); if (!host) return; let last = '';
  const draw = () => {
    const A = rv('msA'), Dp = rv('msD'), q = rv('msQ'), bk = rv('msK'), prog = rv('msT') / 100; out('msA', fmt(A) + ' m²'); out('msD', fmt(Dp, 1) + ' m'); out('msQ', fmt(q, 2) + ' m³/perc'); out('msK', bk + ' kg/m³'); out('msT', pct(prog * 100));
    const V = A * Dp, tmin = V / q, hours = tmin / 60, days = hours / 8, binder = V * bk / 1000;
    const res = `<div class="r"><span>stabilizálandó térfogat</span><b>${fmt(V)} m³</b></div><div class="r"><span>keverési idő (tiszta)</span><b>${fmt(hours, 0)} óra ≈ ${fmt(days, 1)} műszak</b></div><div class="r"><span>kötőanyag</span><b>${fmt(binder, 0)} t</b></div><div class="r"><span>keverőfej egy lépésben</span><b>≈ 1,2 m²</b></div>`; if (res !== last) { last = res; $('#msOut').innerHTML = res; }   // csak változáskor ír a DOM-ba
    const W = 480, Hh = 240, gy = 86; const s = svg(host, W, Hh); pat(s);
    SV('rect', { x: 0, y: 0, width: W, height: gy, fill: 'var(--card2)' }, s); SV('rect', { x: 0, y: gy, width: W, height: Hh - gy, fill: 'url(#pSoft)' }, s);
    const dpx = Dp / 7 * 112; const front = 30 + prog * 330; SV('rect', { x: 30, y: gy, width: front - 30, height: dpx, fill: '#9aa0a4', opacity: .92 }, s);
    for (let x = 30; x < front; x += 24) SV('line', { x1: x, x2: x, y1: gy, y2: gy + dpx, stroke: '#7d8387', 'stroke-width': 1 }, s);
    SV('rect', { x: 30, y: gy - 7, width: front - 30, height: 7, fill: 'url(#pGrav)' }, s);
    // kotró a stabilizált részen, maga előtt keverve
    const ex = Math.max(86, front - 66); SV('rect', { x: ex - 52, y: gy - 16, width: 76, height: 9, rx: 4.5, fill: '#2f3337' }, s); SV('rect', { x: ex - 46, y: gy - 36, width: 62, height: 20, rx: 3, fill: '#e5ae47', stroke: '#8a5c05' }, s); SV('rect', { x: ex - 16, y: gy - 56, width: 28, height: 22, rx: 3, fill: '#e5ae47', stroke: '#8a5c05' }, s); SV('rect', { x: ex - 11, y: gy - 51, width: 18, height: 11, fill: '#9fc3d6', stroke: '#5b524a' }, s);
    const mz = gy + dpx * (0.5 + 0.45 * Math.sin(performance.now() / 600)); const hx = Math.max(front + 20, ex + 44);
    SV('path', { d: `M${ex + 10},${gy - 44} L${hx - 4},${gy - 64} L${hx},${mz}`, stroke: '#c2830c', 'stroke-width': 6, fill: 'none', 'stroke-linejoin': 'round' }, s); SV('circle', { cx: hx, cy: mz, r: 10, fill: '#4b5458', stroke: '#222' }, s); SV('path', { d: `M${hx - 7},${mz} h14 M${hx},${mz - 7} v14`, stroke: '#cfd3d6', 'stroke-width': 2 }, s);
    SV('rect', { x: W - 62, y: gy - 50, width: 48, height: 42, rx: 4, fill: '#c9412b' }, s); SV('text', { x: W - 38, y: gy - 24, 'text-anchor': 'middle', text: 'siló', 'font-size': 12, 'font-weight': 700, fill: '#fff' }, s); SV('path', { d: `M${W - 62},${gy - 20} C${W - 110},${gy - 8} ${ex + 34},${gy - 4} ${ex + 12},${gy - 22}`, stroke: '#222', 'stroke-width': 2, fill: 'none' }, s);
    if (prog > .12) SV('text', { x: 38, y: Hh - 12, text: 'stabilizált tömb', 'font-size': 13, 'font-weight': 700, class: 'hl' }, s); SV('text', { x: W - 10, y: Hh - 12, 'text-anchor': 'end', text: 'tőzeg, puha agyag', 'font-size': 13, 'font-weight': 700, class: 'hl' }, s);
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
    const W = 420, Hh = 300, L = 58, R = 14, T = 18, B = 40; const s = svg(host, W, Hh); const lx = (v) => L + (Math.log10(v) - Math.log10(30)) / (Math.log10(400) - Math.log10(30)) * (W - L - R), ey = (e) => T + (e0 + 0.02 - e) / 0.42 * (Hh - T - B);
    [30, 60, 100, 200, 400].forEach(v => { SV('line', { x1: lx(v), x2: lx(v), y1: T, y2: Hh - B, stroke: 'var(--line2)' }, s); SV('text', { x: lx(v), y: Hh - B + 14, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--mute)', text: v }, s); });
    SV('text', { x: (W + L) / 2, y: Hh - 6, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: 'var(--ink2)', text: 'hatékony feszültség σ′ [kPa] (log)' }, s); SV('text', { x: 14, y: Hh / 2, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: 'var(--ink2)', transform: `rotate(-90 14 ${Hh / 2})`, text: 'hézagtényező e' }, s);
    [0.8, 0.9, 1.0, 1.1, 1.2].forEach(e => { SV('line', { x1: L, x2: W - R, y1: ey(e), y2: ey(e), stroke: 'var(--line2)' }, s); SV('text', { x: L - 6, y: ey(e) + 3.5, 'text-anchor': 'end', 'font-size': 10, fill: 'var(--mute)', text: fmt(e, 1) }, s); });
    const eN = (v) => e0 - Cc * Math.log10(v / s0); const pts = (a, b, fn) => { const p = []; for (let i = 0; i <= 40; i++) { const v = a * Math.pow(b / a, i / 40); p.push(`${lx(v)},${ey(fn(v))}`); } return p.join(' '); };
    SV('polyline', { points: pts(s0, 400, eN), fill: 'none', stroke: 'var(--line)', 'stroke-width': 6, 'stroke-linecap': 'round' }, s);
    SV('text', { x: lx(300), y: ey(eN(300)) - 10, 'text-anchor': 'middle', 'font-size': 10.5, fill: 'var(--mute)', text: 'szűz görbe' }, s);
    // előterhelés nélkül
    SV('polyline', { points: pts(s0, s0 + ds, eN), fill: 'none', stroke: 'var(--coral)', 'stroke-width': 3 }, s); SV('circle', { cx: lx(s0 + ds), cy: ey(eN(s0 + ds)), r: 5, fill: 'var(--coral)' }, s);
    if (dp > 0) { const ep = eN(s0 + dp); SV('polyline', { points: pts(s0, s0 + dp, eN), fill: 'none', stroke: 'var(--amber)', 'stroke-width': 3, 'stroke-dasharray': '6 4' }, s); const eU = (v) => ep + Cr * Math.log10((s0 + dp) / v);
      SV('polyline', { points: pts(s0, s0 + dp, eU), fill: 'none', stroke: 'var(--amber)', 'stroke-width': 2, 'stroke-dasharray': '3 3' }, s);
      const eR = (v) => v <= s0 + dp ? eU(v) : eN(v); SV('polyline', { points: pts(s0, s0 + ds, eR), fill: 'none', stroke: 'var(--teal)', 'stroke-width': 3.5 }, s); SV('circle', { cx: lx(s0 + ds), cy: ey(eR(s0 + ds)), r: 5, fill: 'var(--teal)' }, s); SV('circle', { cx: lx(s0 + dp), cy: ey(ep), r: 4, fill: 'var(--amber)' }, s); }
    SV('circle', { cx: lx(s0), cy: ey(e0), r: 5, fill: 'var(--ink2)' }, s); SV('text', { x: lx(s0) + 9, y: ey(e0) + 2, 'font-size': 12, 'font-weight': 700, fill: 'var(--ink2)', text: 'σ′_{0}' }, s);
    // idő–süllyedés
    const W2 = 420, H2 = 300; const s2 = svg(host2, W2, H2); const smx = Math.max(sNo, sPre + sAfter, 50); const stp = [10, 20, 50, 100, 200, 250, 500].find(v => smx / v <= 5) || 500; const top = Math.ceil(smx / stp) * stp; const tx = (m) => 58 + m / 36 * (W2 - 72), sy = (v) => 30 + v / top * (H2 - 76);
    for (let v = 0; v <= top + 1e-6; v += stp) { SV('line', { x1: tx(0), x2: tx(36), y1: sy(v), y2: sy(v), stroke: 'var(--line2)' }, s2); SV('text', { x: tx(0) - 6, y: sy(v) + 3.5, 'text-anchor': 'end', 'font-size': 10, fill: 'var(--mute)', text: fmt(v) }, s2); }
    for (let m = 0; m <= 36; m += 6) { SV('line', { x1: tx(m), x2: tx(m), y1: 30, y2: H2 - 46, stroke: 'var(--line2)' }, s2); SV('text', { x: tx(m), y: H2 - 32, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--mute)', text: m }, s2); }
    SV('text', { x: (W2 + 54) / 2, y: H2 - 14, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: 'var(--ink2)', text: 'idő [hónap]' }, s2); SV('text', { x: 14, y: H2 / 2, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: 'var(--ink2)', transform: `rotate(-90 14 ${H2 / 2})`, text: 'süllyedés [mm] ↓' }, s2);
    const U = (t) => 1 - Math.exp(-t / 5); const a = [], b = [];
    for (let m = 0; m <= 36; m += .5) { a.push(`${tx(m)},${sy(m < 12 ? 0 : sNo * U(m - 12))}`); let v = 0; if (dp > 0) { if (m < 12) v = sPre * U(m); else v = sPre * U(12) + (m >= 12 ? (sAfter) * U(m - 12) : 0); } else v = m < 12 ? 0 : sNo * U(m - 12); b.push(`${tx(m)},${sy(v)}`); }
    SV('rect', { x: tx(0), y: 30, width: tx(12) - tx(0), height: H2 - 76, fill: 'var(--amber)', opacity: .12 }, s2); SV('text', { x: tx(6), y: 20, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--amber-ink)', 'font-weight': 700, text: dp > 0 ? 'előterhelés, kivárás' : 'tervezés, előkészítés' }, s2); SV('text', { x: tx(24), y: 20, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink2)', 'font-weight': 700, text: 'építés és használat' }, s2);
    SV('line', { x1: tx(12), x2: tx(12), y1: 30, y2: H2 - 46, stroke: 'var(--ink2)', 'stroke-dasharray': '3 3' }, s2);
    SV('polyline', { points: a.join(' '), fill: 'none', stroke: 'var(--coral)', 'stroke-width': 2.5, 'stroke-dasharray': dp > 0 ? '6 4' : '' }, s2); if (dp > 0) SV('polyline', { points: b.join(' '), fill: 'none', stroke: 'var(--teal)', 'stroke-width': 3 }, s2);
    $('#plOut').innerHTML = `<div class="r"><span>épület alatti süllyedés előterhelés nélkül</span><b style="color:var(--coral)">${fmt(sNo, 0)} mm</b></div><div class="r"><span>előterhelés alatt „kikényszerített”</span><b style="color:var(--amber-ink)">${fmt(sPre, 0)} mm</b></div><div class="r" style="grid-column:1/-1"><span>az épület alatti süllyedés előterhelés után</span><b style="color:var(--teal)">${fmt(sAfter, 0)} mm ${dp > 0 ? `(−${pct((1 - sAfter / sNo) * 100)})` : ''}</b></div>`;
  };
  bindR(['plB', 'plP'], draw); draw();
  // Mexikóváros (El Moro): ballaszt + épület = állandó; a merev alapszerkezet a talajba süllyesztve (kompenzált alapozás)
  const mx = $('#mxSvg'); if (!mx) return; const r = $('#mxT');
  const dm = () => { const u = rv('mxT') / 100; out('mxT', pct(u * 100)); const W = 600, Hh = 250, gy = 190; const s = svg(mx, W, Hh); pat(s);
    SV('rect', { x: 0, y: 0, width: W, height: gy, fill: 'var(--card2)' }, s); SV('rect', { x: 0, y: gy, width: W, height: Hh - gy, fill: 'url(#pSoft)' }, s);
    const x0 = 120, bw = 300, fl = Math.round(u * 6), fh = 23;
    SV('rect', { x: x0 - 12, y: gy - 10, width: bw + 24, height: 50, fill: '#bfc3c6', stroke: '#4b5458' }, s);   // merev alapszerkezet a kiemelt gödörben
    for (let c = 1; c < 4; c++) SV('line', { x1: x0 - 12 + c * (bw + 24) / 4, x2: x0 - 12 + c * (bw + 24) / 4, y1: gy - 10, y2: gy + 40, stroke: '#8d9196', 'stroke-width': 1.2 }, s);
    // ballaszt: betontömbök az alapszerkezeten; rétegenként rakják fel, és felülről fogynak, ahogy az épület súlya nő
    const nb = 30, vis = Math.round((1 - u) * nb); for (let k = 0; k < vis; k++) { const row = Math.floor(k / 6), col = k % 6; SV('rect', { x: x0 + 4 + col * 49, y: gy - 10 - (row + 1) * 19, width: 46, height: 17, rx: 1.5, fill: '#a9a59c', stroke: '#5f5b55', 'stroke-width': 1 }, s); }
    // vb. váz: pillérek és födémek szintenként
    for (let i = 0; i < fl; i++) { const y = gy - 10 - (i + 1) * fh; for (let c = 0; c < 5; c++) SV('rect', { x: x0 + c * (bw - 8) / 4, y, width: 8, height: fh, fill: '#8d9196', stroke: '#4b5458', 'stroke-width': .8 }, s); SV('rect', { x: x0 - 4, y: y - 2, width: bw + 8, height: 5, fill: '#bfc3c6', stroke: '#4b5458', 'stroke-width': .8 }, s); }
    // teher-oszlop: kavics + épület = állandó
    const bx = 490, bh = 130, by = gy - 10; SV('rect', { x: bx, y: by - bh * u, width: 30, height: bh * u, fill: '#d4553a' }, s); SV('rect', { x: bx, y: by - bh, width: 30, height: bh * (1 - u), fill: '#a9a59c' }, s); SV('rect', { x: bx, y: by - bh, width: 30, height: bh, fill: 'none', stroke: 'var(--ink2)', 'stroke-width': 1.2 }, s);
    if (u < .9) SV('text', { x: bx + 38, y: by - bh + 16, text: 'ballaszt', 'font-size': 12, 'font-weight': 700, fill: 'var(--ink2)' }, s); if (u > .1) SV('text', { x: bx + 38, y: by - 6, text: 'épület', 'font-size': 12, 'font-weight': 700, fill: 'var(--coral-ink)' }, s);
    SV('text', { x: bx + 15, y: by - bh - 8, 'text-anchor': 'middle', text: 'Σ = állandó', 'font-size': 12, 'font-weight': 800, fill: 'var(--ink)' }, s);
    SV('text', { x: W - 12, y: Hh - 12, 'text-anchor': 'end', text: 'puha vulkáni agyag', 'font-size': 12.5, 'font-weight': 700, class: 'hl' }, s);
    const cap = u < .02 ? 'Ballaszt a tervezett épületsúlyig → a talaj visszakapja korábbi terhét' : u > .98 ? 'Kész épület – a ballaszt elfogyott, az összsúly nem nőtt' : 'Építés: a ballasztot napról napra annyival csökkentik, amennyi súly beépül'; const ce = $('#mxCap'); if (ce && ce.textContent !== cap) ce.textContent = cap; };
  r.addEventListener('input', dm); dm();
})();

/* ---------- f) szerkezeti merevség: merev vs csuklós keret ---------- */
(function frame() {
  const host = $('#frSvg'); if (!host) return; let rigid = true;
  const draw = () => {
    const d = rv('frD'); out('frD', d + ' mm'); const W = 600, Hh = 330, X = [100, 300, 500], Y0 = 250, h = 62; const s = svg(host, W, Hh); pat(s);
    const sink = d * 1.2; const dy = [0, 0, sink]; const node = (i, j) => [X[i], Y0 - j * h + dy[i]];
    // kitöltő falak a jobb nyílásban
    for (let j = 0; j < 3; j++) { const a = node(1, j), b = node(2, j), c = node(2, j + 1), e = node(1, j + 1); SV('polygon', { points: [a, b, c, e].map(p => p.join(',')).join(' '), fill: '#f5efe2', stroke: '#cfc7b6', opacity: .9 }, s);
      if (!rigid && d > 6) { const k = Math.min(3, Math.floor(d / 8)); for (let q = 0; q < k; q++) SV('path', { d: `M${a[0] + 36 + q * 44},${(a[1] + b[1]) / 2 - 8} l14,-14 l-4,-6 l14,-12`, stroke: d > 24 ? '#b5302a' : '#3b2f28', 'stroke-width': 1 + d / 14, fill: 'none' }, s); } }
    // térszín: a jobb oldali (puha) altalaj a pillérrel együtt süllyed
    const gp = `M0,${Y0} L390,${Y0} Q440,${Y0} 474,${Y0 + sink} L${W},${Y0 + sink} L${W},${Hh} L0,${Hh} Z`;
    SV('path', { d: gp, fill: 'url(#pSand)' }, s); SV('clipPath', { id: 'frClip' }, s.querySelector('defs')).appendChild(SV('rect', { x: 400, y: 0, width: 200, height: Hh })); SV('path', { d: gp, fill: 'url(#pClay)', 'clip-path': 'url(#frClip)' }, s);
    SV('text', { x: 12, y: Hh - 12, text: 'tömör homok', 'font-size': 12.5, 'font-weight': 700, class: 'hl' }, s); SV('text', { x: W - 12, y: Hh - 12, 'text-anchor': 'end', text: 'puha agyag', 'font-size': 12.5, 'font-weight': 700, class: 'hl' }, s);
    // oszlopok
    for (let i = 0; i < 3; i++) SV('line', { x1: node(i, 0)[0], y1: node(i, 0)[1], x2: node(i, 3)[0], y2: node(i, 3)[1], stroke: 'var(--ink)', 'stroke-width': 6 }, s);
    // gerendák
    for (let j = 1; j <= 3; j++) for (let i = 0; i < 2; i++) { const a = node(i, j), b = node(i + 1, j); if (rigid && i === 1 && d > 0) { const c1 = [a[0] + 70, a[1]], c2 = [b[0] - 70, b[1]]; SV('path', { d: `M${a[0]},${a[1]} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${b[0]},${b[1]}`, stroke: 'var(--ink)', 'stroke-width': 6, fill: 'none' }, s); } else SV('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: 'var(--ink)', 'stroke-width': 6 }, s); }
    for (let i = 0; i < 3; i++) for (let j = 1; j <= 3; j++) { const p = node(i, j); if (rigid) { if (d > 2 && i >= 1) SV('circle', { cx: p[0], cy: p[1], r: 6 + d * 0.4, fill: '#d4553a', opacity: .35 }, s); SV('rect', { x: p[0] - 5, y: p[1] - 5, width: 10, height: 10, fill: 'var(--ink)' }, s); } else SV('circle', { cx: p[0], cy: p[1], r: 6, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 3 }, s); }
    for (let i = 0; i < 3; i++) { const p = node(i, 0); SV('rect', { x: p[0] - 26, y: p[1], width: 52, height: 12, fill: '#bfc3c6', stroke: '#4b5458' }, s); }
    // a süllyedés mérete
    if (d > 0) { const x = 556; SV('line', { x1: 474, x2: W, y1: Y0, y2: Y0, stroke: 'var(--ink2)', 'stroke-dasharray': '4 4' }, s); SV('line', { x1: x, x2: x, y1: Y0, y2: Y0 + sink, stroke: 'var(--coral)', 'stroke-width': 2.4 }, s); SV('path', { d: `M${x - 5},${Y0 + sink - 7} L${x},${Y0 + sink} L${x + 5},${Y0 + sink - 7}`, fill: 'none', stroke: 'var(--coral)', 'stroke-width': 2.4 }, s); }
    SV('text', { x: W - 12, y: Y0 - 10, 'text-anchor': 'end', text: `δ = ${d} mm`, 'font-size': 13.5, 'font-weight': 800, fill: 'var(--coral-ink)' }, s);
    $('#frMsg').innerHTML = rigid ? `<b>Merev csomópontok (határozatlan):</b> kisebb torzulás, de a támaszsüllyedés <b>kényszererőket</b> (M, V) okoz – a teher átrendeződik. ${d > 20 ? '<span class="status b">jelentős többlet-igénybevétel</span>' : ''}` : `<b>Csuklós csomópontok (határozott):</b> nincs kényszererő, a csuklók elfordulnak – de a <b>torzulás</b> a kitöltő falakban repedést, befeszülést okoz. ${d > 20 ? '<span class="status b">falrepedések</span>' : ''}`;
  };
  window.U.seg('frType', v => { rigid = v === 'rigid'; draw(); }); bindR(['frD'], draw); draw();
})();

/* ---------- süllyedési hézag ---------- */
(function joint() {
  const host = $('#jtSvg'); if (!host) return; let j = false;
  const draw = () => {
    const u = rv('jtS') / 100; out('jtS', pct(u * 100)); const W = 600, Hh = 270, gy = 210; const s = svg(host, W, Hh); pat(s); SV('rect', { x: 0, y: gy, width: W, height: Hh - gy, fill: 'url(#pClay)' }, s); SV('text', { x: 12, y: Hh - 10, text: 'összenyomható agyag', 'font-size': 12.5, 'font-weight': 700, class: 'hl' }, s);
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
    const tb = rv('paT'); out('paT', tb + (EN ? (tb === 1 ? ' month' : ' months') : ' hónap')); const tau = 6; const W = 600, Hh = 290, L = 56, R = 16, T = 44, B = 40; const s = svg(host, W, Hh);
    const tx = (m) => L + m / 30 * (W - L - R), uy = (v) => Hh - B - v * (Hh - T - B);
    for (let m = 0; m <= 30; m += 6) { SV('line', { x1: tx(m), x2: tx(m), y1: T, y2: Hh - B, stroke: 'var(--line2)' }, s); SV('text', { x: tx(m), y: Hh - B + 14, 'text-anchor': 'middle', 'font-size': 10.5, fill: 'var(--mute)', text: m }, s); }
    [0, .5, 1].forEach(v => { SV('line', { x1: L, x2: W - R, y1: uy(v), y2: uy(v), stroke: 'var(--line2)' }, s); SV('text', { x: L - 6, y: uy(v) + 3.5, 'text-anchor': 'end', 'font-size': 10.5, fill: 'var(--mute)', text: pct(v * 100) }, s); });
    SV('text', { x: (W + L) / 2, y: Hh - 8, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: 'var(--ink2)', text: 'idő [hónap]' }, s);
    SV('text', { x: 13, y: (T + Hh - B) / 2, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: 'var(--ink2)', transform: `rotate(-90 13 ${(T + Hh - B) / 2})`, text: 'a végső teher arányában' }, s);
    // pórusvíz-túlnyomás: lineáris teherfelhordás + exponenciális disszipáció
    const dt = 0.05; let u = 0; const pu = [], pq = []; let umax = 0, tmax = 0;
    for (let t = 0; t <= 30; t += dt) { const dq = t < tb ? dt / tb : 0; u += dq - u / tau * dt; if (u > umax) { umax = u; tmax = t; } pu.push(`${tx(t)},${uy(u)}`); pq.push(`${tx(t)},${uy(Math.min(1, t / tb))}`); }
    SV('rect', { x: L, y: uy(1), width: W - L - R, height: uy(0.55) - uy(1), fill: 'var(--coral)', opacity: .1 }, s); SV('text', { x: W - R - 6, y: uy(0.55) - 6, 'text-anchor': 'end', 'font-size': 11, fill: 'var(--coral-ink)', 'font-weight': 700, text: 'kockázatos tartomány (stabilitás!)' }, s);
    SV('polyline', { points: pq.join(' '), fill: 'none', stroke: 'var(--ink2)', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, s); SV('polyline', { points: pu.join(' '), fill: 'none', stroke: 'var(--sky)', 'stroke-width': 3 }, s);
    SV('circle', { cx: tx(tmax), cy: uy(umax), r: 5, fill: 'var(--sky)', stroke: 'var(--card)', 'stroke-width': 2 }, s);
    // jelmagyarázat a diagram fölött
    SV('line', { x1: L, x2: L + 26, y1: 18, y2: 18, stroke: 'var(--ink2)', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, s); SV('text', { x: L + 32, y: 22, 'font-size': 11.5, 'font-weight': 600, fill: 'var(--ink2)', text: 'teher' }, s);
    SV('line', { x1: L + 90, x2: L + 116, y1: 18, y2: 18, stroke: 'var(--sky)', 'stroke-width': 3 }, s); SV('text', { x: L + 122, y: 22, 'font-size': 11.5, 'font-weight': 600, fill: 'var(--ink2)', text: `pórusvíz-túlnyomás – csúcsa a teher ${pct(umax * 100)}-a` }, s);
    $('#paMsg').innerHTML = umax > 0.55 ? `<span class="status b">gyors építés</span> A telített agyagban a pórusvíz nem tud elég gyorsan kiszivárogni – a hatékony feszültség és ezzel a nyírószilárdság lassan nő: talajtörés, nagy süllyedéskülönbség veszélye.` : umax > 0.4 ? `<span class="status w">közepes ütem</span> A túlnyomás egy része még az építés alatt leépül.` : `<span class="status">lassú, kontrollált ütem</span> A teher növekedésével párhuzamosan konszolidálódik a talaj – biztonságosabb, de tovább tart és drágább.`;
  };
  bindR(['paT'], draw); draw();
})();
})();
