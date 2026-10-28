/* ===== Formázás (sorkizárás + magyar elválasztás + nem törő egységek) – a /formazas szabályai szerint ===== */
const GUARD = (() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NB = '\u00A0', WJ = '\u2060', NNB = '\u202F', NBH = '\u2011', SHY = '\u00AD';
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'svg', 'SVG', 'CANVAS', 'SELECT', 'OPTION']);
  const BLOCK = 'main p, main li, main dd, main figcaption, main h2, main h3, main h4, main td, main th, main .insight, main .expl, main .qt, main .opt span, main .tf .st, main .tf .fb, main label, main .res, main .lead, main .card h4, .hero .lead, .hero .sub, footer p, footer li, .ytc-bar small';
  const HYPH = 'main p, main li, main dd, main figcaption, main .insight, main .expl, main .tf .fb, main .lead, .hero .lead, footer p';
  const NOHY = 'sub, sup, code, button, label, output, td, th, .nw, .mono, h1, h2, h3, h4, h5, .kicker, .stat, .chip, .seg, .fact, .val, .v, .k';
  const TERMS = ['káros süllyedés', 'egyenlőtlen süllyedés', 'használhatósági határállapot', 'teherbírási határállapot', 'kisebb talpnyomás', 'mélyebb alapsík', 'mélytömörítés', 'dinamikus tömörítés', 'vibrált kőoszlop', 'kőoszlop-raszter', 'kétkomponensű injektálás', 'műanyag bázisú injektálás', 'utólagos alapmegerősítés', 'függőleges drén', 'konszolidációs idő', 'hatékony feszültség', 'normálisan konszolidált', 'süllyedési hézag', 'statikailag határozott', 'építési sorrend', 'teherterjedési szög', 'feszültségkoncentráció', 'rugalmas féltér', 'relatív elfordulás', 'szögtorzulás', 'finomszem-tartalom', 'ejtési magasság', 'Ménard–Mayne-féle becslés', 'Jáky-féle', 'e–log σ′', 'talajtörés', 'merev csomópontok', 'csuklós csomópontok', 'térszíni lemezalap', 'cement+homok habarcs', 'vízüveg alapú', 'Torre Latinoamericana'];
  const termRx = new RegExp('(' + TERMS.sort((a, b) => b.length - a.length).map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '[ \\u00A0]')).join('|') + ')', 'giu');
  const MULT_SYM = /^(tg|ctg|sin|cos|tan|exp|ln|log)\b/;
  const NUMW = /(^|[\s(\u00A0\u2060„])((?:[Kk]ét|[Hh]árom|[Nn]égy|[Öö]t|[Hh]at|[Hh]ét|[Nn]yolc|[Kk]ilenc|[Tt]íz|[Hh]úsz|[Ss]záz|[Ee]zer|[Ee]lső|[Mm]ásodik|[Hh]armadik|[Nn]egyedik|[Öö]tödik|[Hh]atodik|[Hh]etedik|[Nn]yolcadik|[Kk]ilencedik|[Tt]izedik|[Mm]indkét|[Mm]indhárom|[Nn]éhány|[Ee]gyik|[Kk]ettő|[Hh]armincnyolc|[Nn]egyven|[Hh]etven))(?=\s\S)\s/g;
  function textPass(s) {
    if (!/[ \-–·]/.test(s)) return s;
    // ezres tagolás
    s = s.replace(/(^|[^\d,.])(\d{1,3}) (\d{3})(?!\d)/g, '$1$2' + NNB + '$3');
    // operátorok
    s = s.replace(/ ([=≤≥≈→←×±<>⇒]) /g, NB + '$1' + NB);
    s = s.replace(/([\p{N}\p{L})\]′″]) ([+−]) (?=[\p{N}\p{L}(])/gu, '$1' + NB + '$2' + NB);
    s = s.replace(/ \/ /g, NB + '/' + NB);
    // a · kettős szerepe
    s = s.replace(/ · (?=(\S+))/g, (m, nxt) => {
      const w = nxt.replace(/^[(„"]/, '');
      if (/^\p{L}{3,}/u.test(w) && !MULT_SYM.test(w)) return m;
      return NB + '·' + NB;
    });
    // azonosítók
    s = s.replace(/(\d)-(\d)/g, '$1' + NBH + '$2');
    s = s.replace(/\b([A-Z]{2,5})-(\d)/g, '$1' + NBH + '$2');
    s = s.replace(/\b(MSZ|EN|ISO|DIN|ASCE|IRC|FprEN|prEN) (?=[A-Z\d])/g, '$1' + NB);
    s = s.replace(/(\S)–(\S)/g, '$1' + WJ + '–' + WJ + '$2');
    // függvénynév + argumentum
    s = s.replace(/\b(tg|ctg|sin|cos|tan|ln|log|exp) /g, '$1' + NB);
    // rövidítések
    s = s.replace(/(^|[\s(\u00A0])(pl\.|kb\.|ill\.|ún\.|max\.|min\.|ld\.|vö\.|cca\.|átl\.|ill|ún|kb) (?=\S)/g, '$1$2' + NB);
    // szám + mértékegység / szó; magában álló szám
    s = s.replace(/(^|[\s(\u00A0\u2060~≈≤≥=<>−+])(\d+(?:[,.]\d+)?\.?%?) (?=\S)/g, '$1$2' + NB);
    s = s.replace(/(^|[\s(\u00A0\u2060~≈≤≥=<>−+])(\d+(?:[,.]\d+)?\.?%?) (?=\S)/g, '$1$2' + NB);
    // névelők, rövid kötőszavak
    for (let i = 0; i < 2; i++) s = s.replace(/(^|[\s(\u00A0\u2060„])(a|az|A|Az|s|e|egy|Egy|és|És) (?=\S)/g, '$1$2' + NB);
    // betűvel írt számnév + amit számlál
    s = s.replace(NUMW, '$1$2' + NB);
    // utótagos kötőjel (30°-nál, RFA-n, 1173-ban)
    s = s.replace(/([\d°′″%)\]\p{Lu}\u2080-\u2089])-(\p{Ll}{1,6})(?=$|[\s.,;:!?)”\u00A0\u2060])/gu, '$1' + NBH + '$2');
    return s;
  }
  // szövegcsomópontok határán: a névelő / rövid szó / szám ne maradjon a sor végén, ha a következő szó egy másik elemben (pl. <b>) kezdődik
  const SHORTEND = new RegExp('(^|[\\s(\u00A0\u2060„])(a|az|A|Az|s|e|egy|Egy|és|És|pl\\.|kb\\.|ill\\.|ún\\.|\\d+(?:[,.]\\d+)?\\.?%?) $');
  function crossPass(nodes) {
    for (let i = 0; i < nodes.length - 1; i++) { const a = nodes[i], b = nodes[i + 1]; const av = a.nodeValue, bv = b.nodeValue; if (!av || !bv) continue;
      if (av.endsWith(' ') && /^\S/.test(bv) && SHORTEND.test(av)) a.nodeValue = av.slice(0, -1) + NB;
      const ms = /^ ([=≤≥≈→←×±<>⇒+−/]) /.exec(b.nodeValue); if (ms && /\S$/.test(a.nodeValue)) b.nodeValue = NB + ms[1] + NB + b.nodeValue.slice(3);
      const me = / ([=≤≥≈→←×±<>⇒+−/]) $/.exec(a.nodeValue); if (me && /^\S/.test(b.nodeValue)) a.nodeValue = a.nodeValue.slice(0, -3) + NB + me[1] + NB; }
  }
  function bindPositions(full, cpl = 70) {
    const bind = new Set();
    const segMax = Math.max(14, Math.min(38, 0.42 * cpl)), parMax = Math.max(10, Math.min(24, 0.30 * cpl));
    const mark = (a, b) => { for (let i = a; i < b; i++) if (full[i] === ' ') bind.add(i); };
    // tagolás · ; – mentén
    const sepRx = / · |; | – /g;
    let last = 0, m, lastSep = '';
    const segs = [];
    while ((m = sepRx.exec(full))) { segs.push([last, m.index, lastSep, m[0]]); last = m.index + m[0].length; lastSep = m[0]; }
    segs.push([last, full.length, lastSep, '']);
    if (segs.length > 1) {
      for (const [a, b, before, after] of segs) {
        const t = full.slice(a, b).trim();
        // felsorolás-tag (· ;) ~38 karakterig; gondolatjel mellett csak rövid címke vagy verdikt
        const dashOnly = (before === ' – ' || before === '') && (after === ' – ' || after === '') && (before || after);
        const lim = dashOnly ? Math.min(22, segMax) : segMax;
        if (t.length > 0 && t.length < lim) mark(a, b);
      }
    }
    // rövid zárójeles rész
    const pr = /\(([^()]{1,30})\)/g;
    while ((m = pr.exec(full))) { if (m[0].length <= parMax) mark(m.index, m.index + m[0].length); }
    // szakkifejezések
    termRx.lastIndex = 0;
    while ((m = termRx.exec(full))) mark(m.index, m.index + m[0].length);
    // címke: érték
    const lv = /(\p{L}[\p{L}\p{N}′_]{1,22}): ([\d−+±≤≥=<>~≈α-ωΑ-Ω]\S{0,9}(?:[ \u00A0][^\s;·]{1,7})?)(?=$|[;,.·)\s])/gu;
    while ((m = lv.exec(full))) { if (m[0].length <= 34) mark(m.index, m.index + m[0].length); }
    return bind;
  }
  function textNodes(root) {
    const out = [];
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        let p = n.parentNode;
        while (p && p !== root) { if (SKIP.has(p.nodeName) || (p.dataset && p.dataset.noguard !== undefined)) return NodeFilter.FILTER_REJECT; p = p.parentNode; }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n; while ((n = w.nextNode())) out.push(n);
    return out;
  }
  let hyph = null;
  const done = new WeakMap();
  function processBlock(el) {
    if (!el.isConnected) return;
    if (el.closest('[data-noguard]')) return;
    const cur = el.textContent;
    if (done.get(el) === cur) return;
    const nodes = textNodes(el);
    for (const n of nodes) { const v = textPass(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; }
    crossPass(nodes);
    // blokk-szintű kötés
    const full = nodes.map(n => n.nodeValue).join('');
    // sorhossz karakterben: a doboz szélességéhez igazodó „rövid” határ
    const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
    const cpl = el.clientWidth > 40 ? el.clientWidth / (fs * 0.52) : 70;
    const bind = bindPositions(full, cpl);
    if (bind.size) {
      let off = 0;
      for (const n of nodes) {
        const v = n.nodeValue; let o = '', ch = false;
        for (let i = 0; i < v.length; i++) {
          if (v[i] === ' ' && bind.has(off + i)) { o += NB + WJ; ch = true; } else o += v[i];
        }
        off += v.length;
        if (ch) n.nodeValue = o;
      }
    }
    if (hyph && el.matches(HYPH)) {
      for (const n of textNodes(el)) {
        if (n.parentElement && n.parentElement.closest(NOHY) && n.parentElement.closest(NOHY) !== el) continue;
        const parts = n.nodeValue.split(/( )/);
        let ch = false;
        for (let i = 0; i < parts.length; i += 2) {
          const t = parts[i];
          if (!t || !/\p{L}{6,}/u.test(t)) continue;
          const clean = t.replace(/\u00AD/g, '');
          let h;
          if (t.includes(WJ)) {
            // 16 karakternél hosszabb kötött csoport: csak az utolsó szava választható el
            const vis = clean.replace(/[\u2060]/g, '');
            if (vis.length <= 16) continue;
            const k = Math.max(clean.lastIndexOf('\u00A0'), clean.lastIndexOf(WJ));
            const tail = clean.slice(k + 1);
            if (!/\p{L}{6,}/u.test(tail)) continue;
            h = clean.slice(0, k + 1) + hyph(tail);
          } else h = hyph(clean);
          if (h !== t) { parts[i] = h; ch = true; }
        }
        if (ch) n.nodeValue = parts.join('');
      }
    }
    done.set(el, el.textContent);
  }
  let obs = null, pend = new Set(), sched = false;
  function run(root = document.body) {
    const set = new Set();
    if (root.matches && root.matches(BLOCK)) set.add(root);
    $$(BLOCK, root).forEach(e => set.add(e));
    if (obs) obs.disconnect();
    set.forEach(processBlock);
    if (obs) { obs.takeRecords(); observe(); }
  }
  function observe() { obs.observe(document.body, { childList: true, subtree: true, characterData: true }); }
  function flush() {
    sched = false;
    const roots = Array.from(pend); pend.clear();
    if (obs) obs.disconnect();
    for (const r of roots) {
      if (!r.isConnected) continue;
      const blk = r.closest ? r.closest(BLOCK) : null;
      if (blk) processBlock(blk);
      if (r.querySelectorAll) $$(BLOCK, r).forEach(processBlock);
    }
    if (obs) { obs.takeRecords(); observe(); }
  }
  function start() {
    run();
    obs = new MutationObserver(recs => {
      for (const r of recs) {
        const t = r.type === 'characterData' ? r.target.parentElement : r.target;
        if (t) pend.add(t);
      }
      if (!sched) { sched = true; requestAnimationFrame(flush); }
    });
    observe();
    // Hyphenopoly
    const H = window.Hyphenopoly;
    if (H && H.hyphenators && H.hyphenators.hu) {
      H.hyphenators.hu.then(fn => { hyph = s => fn(s); const all = $$(HYPH); all.forEach(e => done.delete(e)); run(); }).catch(() => {});
    }
  }
  // vászonra szánt szöveg őrzése
  function text(s, cpl = 60) {
    let v = textPass(s);
    const bind = bindPositions(v, cpl);
    if (bind.size) v = Array.from(v).map((c, i) => (c === ' ' && bind.has(i)) ? NB + WJ : c).join('');
    return v;
  }
  return { start, run, text, textPass };
})();

window.GUARD = GUARD;
try { GUARD.start(); } catch (e) { console.error('Formázás-őr hiba', e); }

/* Balra zárt tartalék: ha egy sorkizárt dobozban (keskeny kártya) feltűnő lyuk marad, a blokk balra zárt lesz. */
const RAG = (() => {
  const SEL = 'main p, main li, main dd, main figcaption, main .insight, main .expl, main .tf .fb, footer.foot p, .hero p.lead';
  function check(el) {
    el.classList.remove('rag'); const cs = getComputedStyle(el); if (cs.textAlign !== 'justify' || cs.display === 'none') return;
    const fs = parseFloat(cs.fontSize); const all = document.createRange(); all.selectNodeContents(el); const rs = all.getClientRects(); if (rs.length < 2) return;
    const lastTop = Math.max(...Array.from(rs).map(r => r.top)); let big = 0, mid = 0;
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { const t = n.nodeValue; for (let i = 0; i < t.length; i++) { if (t[i] !== ' ') continue; const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1); const b = r.getBoundingClientRect(); if (!b.width || b.top >= lastTop - 2) continue; if (b.width > fs * 1.15) big++; else if (b.width > fs * 0.9) mid++; } }
    if (big || mid >= 2) el.classList.add('rag');
  }
  const run = () => document.querySelectorAll(SEL).forEach(e => { if (e.offsetParent) check(e); });
  let tm = 0; const later = (d) => { clearTimeout(tm); tm = setTimeout(run, d); };
  addEventListener('resize', () => later(250)); document.addEventListener('click', () => later(150)); document.addEventListener('input', () => later(300));
  return { run, later };
})();
window.RAG = RAG;
setTimeout(() => RAG.run(), 600);
if (window.Hyphenopoly && Hyphenopoly.hyphenators && Hyphenopoly.hyphenators.hu) Hyphenopoly.hyphenators.hu.then(() => setTimeout(() => RAG.run(), 300)).catch(() => {});
