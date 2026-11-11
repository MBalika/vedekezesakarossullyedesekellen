# A magyar forrás (src/) előkészítése az angol változathoz – a magyar oldal szövege és működése nem változik:
# EN jelző, nyelvfüggő számformátum, a formázás-őr angol szabályai, en-gb elválasztás, HU | EN nyelvváltó, angol videók útvonala.
# Idempotens (a már előkészített fájlokat kihagyja). Használat: python3 i18n/prep_hu.py
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); SRC = os.path.join(ROOT, 'src')
def load(f): return open(os.path.join(SRC, f), encoding='utf-8').read()
def save(f, t): open(os.path.join(SRC, f), 'w', encoding='utf-8').write(t)
def rep(t, a, b, n=1):
    c = t.count(a); assert c == n, (a[:90], c); return t.replace(a, b)

# --- app.js: EN jelző, számformátum, videók, nyelvváltó ---
t = load('app.js')
if 'const EN =' not in t:
    t = rep(t, "const $ = (s, r = document) => r.querySelector(s);",
            "const EN = (document.documentElement.lang || '').toLowerCase().startsWith('en');   // angol oldal (en.html)\nconst $ = (s, r = document) => r.querySelector(s);")
    t = rep(t, "const fmt = (v, d = 0) => (Math.round(v * 10 ** d) / 10 ** d).toLocaleString('hu-HU', { minimumFractionDigits: d, maximumFractionDigits: d });",
            "const fmt = (v, d = 0) => { const s = (Math.round(v * 10 ** d) / 10 ** d).toLocaleString(EN ? 'en-GB' : 'hu-HU', { minimumFractionDigits: d, maximumFractionDigits: d }); return EN ? s.replace(/,/g, '\\u202f') : s; };   // angolul: tizedespont, ezres tagolás keskeny szóközzel")
    t = rep(t, "src: `video/${k}.html`", "src: `video/${EN ? 'en/' : ''}${k}.html`")
    t = rep(t, "window.U = { $, $$, clamp, lerp, fmt, S, H, css };", "window.U = { $, $$, clamp, lerp, fmt, S, H, css, EN };")
    t += """
// --- nyelvváltó: a választás megmarad (alap-lang), a másik nyelvű oldal ugyanott nyílik meg (alap-pos) ---
(function langSwitch() {
  const sw = $('#langSw'), KEY = 'alap-pos'; const hh = () => { const t = $('.topbar'); return t ? t.offsetHeight : 0; };
  if (sw) sw.addEventListener('click', () => {
    try { localStorage.setItem('alap-lang', EN ? 'hu' : 'en'); } catch (e) { }
    const H0 = hh(); let best = null; document.querySelectorAll('main [id], section[id]').forEach((n) => { if (n.closest('svg')) return; const r = n.getBoundingClientRect(); if (r.height && r.top <= H0 + 1 && r.bottom > H0) best = n; });
    try { sessionStorage.setItem(KEY, JSON.stringify({ id: best ? best.id : '', off: best ? H0 - best.getBoundingClientRect().top : 0, y: scrollY, t: Date.now() })); } catch (e) { }
    sw.setAttribute('href', (EN ? './' : 'en') + (best ? '#' + best.id : ''));
  });
  let p = null; try { p = JSON.parse(sessionStorage.getItem(KEY) || 'null'); sessionStorage.removeItem(KEY); } catch (e) { }
  if (p && Date.now() - p.t < 20000) { if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const go = () => { const n = p.id && document.getElementById(p.id); const y = n ? n.getBoundingClientRect().top + scrollY - hh() + p.off : p.y; scrollTo({ top: Math.max(0, y), behavior: 'instant' }); };
    requestAnimationFrame(go); addEventListener('load', () => { go(); setTimeout(go, 600); }, { once: true }); }
})();
"""
    save('app.js', t)

# --- guard.js: angol tördelési szabályok, en-gb elválasztás ---
t = load('guard.js')
if 'EN ?' not in t:
    t = rep(t, "  const TERMS = ['káros süllyedés',", "  const TERMS = EN ? ['harmful settlement', 'differential settlement', 'serviceability limit state', 'ultimate limit state', 'contact pressure', 'foundation level', 'deep compaction', 'dynamic compaction', 'vibro stone column', 'stone column', 'two-component grouting', 'resin grouting', 'vertical drain', 'consolidation time', 'effective stress', 'normally consolidated', 'settlement joint', 'statically determinate', 'construction sequence', 'load spread angle', 'stress concentration', 'elastic half-space', 'relative rotation', 'angular distortion', 'fines content', 'drop height', 'Ménard–Mayne', 'e–log σ′', 'rigid joints', 'pinned joints', 'raft foundation', 'Torre Latinoamericana'] : ['káros süllyedés',")
    a = "  const NUMW = /(^|[\\s(\\u00A0\\u2060„])((?:[Kk]ét|"
    t = rep(t, a, "  const NUMW = EN ? /(^|[\\s(\\u00A0\\u2060“])((?:[Tt]wo|[Tt]hree|[Ff]our|[Ff]ive|[Ss]ix|[Ss]even|[Ee]ight|[Nn]ine|[Tt]en|[Ff]irst|[Ss]econd|[Tt]hird|[Ff]ourth|[Ff]ifth|[Bb]oth|[Aa]ll|[Ss]everal))(?=\\s\\S)\\s/g : /(^|[\\s(\\u00A0\\u2060„])((?:[Kk]ét|")
    t = rep(t, "(pl\\.|kb\\.|ill\\.|ún\\.|max\\.|min\\.|ld\\.|vö\\.|cca\\.|átl\\.|ill|ún|kb) (?=\\S)", "(pl\\.|kb\\.|ill\\.|ún\\.|max\\.|min\\.|ld\\.|vö\\.|cca\\.|átl\\.|ill|ún|kb|e\\.g\\.|i\\.e\\.|approx\\.|cf\\.|No\\.|Fig\\.) (?=\\S)")
    t = rep(t, "for (let i = 0; i < 2; i++) s = s.replace(/(^|[\\s(\\u00A0\\u2060„])(a|az|A|Az|s|e|egy|Egy|és|És) (?=\\S)/g, '$1$2' + NB);",
            "for (let i = 0; i < 2; i++) s = s.replace(EN ? /(^|[\\s(\\u00A0\\u2060“‘])(a|an|the|A|An|The|&) (?=\\S)/g : /(^|[\\s(\\u00A0\\u2060„])(a|az|A|Az|s|e|egy|Egy|és|És) (?=\\S)/g, '$1$2' + NB);")
    t = rep(t, "  const SHORTEND = new RegExp(", "  const SHORTEND = EN ? new RegExp('(^|[\\\\s(\\u00A0\\u2060“‘])(a|an|the|A|An|The|e\\\\.g\\\\.|i\\\\.e\\\\.|approx\\\\.|\\\\d+(?:[,.]\\\\d+)?\\\\.?%?) $') : new RegExp(")
    t = rep(t, "if (H && H.hyphenators && H.hyphenators.hu) {\n      H.hyphenators.hu.then(", "if (H && H.hyphenators && H.hyphenators[EN ? 'en-gb' : 'hu']) {\n      H.hyphenators[EN ? 'en-gb' : 'hu'].then(")
    t = rep(t, "if (window.Hyphenopoly && Hyphenopoly.hyphenators && Hyphenopoly.hyphenators.hu) Hyphenopoly.hyphenators.hu.then(",
            "if (window.Hyphenopoly && Hyphenopoly.hyphenators && Hyphenopoly.hyphenators[EN ? 'en-gb' : 'hu']) Hyphenopoly.hyphenators[EN ? 'en-gb' : 'hu'].then(")
    save('guard.js', t)

# --- yt.js: a lejátszási lista adatsora angolul más szórendű ---
t = load('yt.js')
a = "$('.ytinfo', modal).textContent = `BME Építőmérnöki Kar · YouTube · ${y.playlist} lejátszási lista · ${y.dur}`;"
if a in t:
    t = rep(t, a, "$('.ytinfo', modal).textContent = EN ? `BME Faculty of Civil Engineering · YouTube · ${y.playlist} playlist · ${y.dur} · in Hungarian` : `BME Építőmérnöki Kar · YouTube · ${y.playlist} lejátszási lista · ${y.dur}`;")
    save('yt.js', t)

# --- index.src.html: nyelvváltó a fejlécben ---
t = load('index.src.html')
if 'id="langSw"' not in t:
    t = rep(t, '      <button class="tbtn" id="themeBtn">☾ Sötét</button>\n',
            '      <button class="tbtn" id="themeBtn">☾ Sötét</button>\n      <a class="langbtn" id="langSw" href="en" hreflang="en" lang="en" aria-label="English version"><b>HU</b><span>EN</span></a>\n')
    save('index.src.html', t)

# --- style.css: a nyelvváltó gomb ---
t = load('style.css')
if '.langbtn' not in t:
    t += """
/* ---- nyelvváltó (HU | EN): a kitöltött az aktuális nyelv; mobilon csak a másik nyelv kódja ---- */
.langbtn{flex:none;display:inline-flex;align-items:center;gap:2px;padding:3px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);border-radius:999px;text-decoration:none;color:var(--hero-ink);font:500 12px/1 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.04em}
.langbtn b,.langbtn span{display:inline-grid;place-items:center;min-width:30px;padding:5px 8px;border-radius:999px}
.langbtn b{background:var(--hero-ink);color:var(--hero1);font-weight:700}
.langbtn span{opacity:.8}
.langbtn:hover span{opacity:1;background:rgba(255,255,255,.14)}
@media (max-width:560px){.langbtn b{display:none}.langbtn span{min-width:0;padding:6px 9px;opacity:1}}
"""
    save('style.css', t)
# --- widgets1.js: szórend és többes szám angolul ---
t = load('widgets1.js')
if "EN ? 'Case ' + nm" not in t:
    t = rep(t, "text: nm + ' eset',", "text: EN ? 'Case ' + nm : nm + ' eset',")
    t = rep(t, "$(`[data-for=\"bsN\"]`).textContent = n + ' szint'; $(`[data-for=\"bsP\"]`).textContent = p ? p + ' pinceszint' : 'nincs pince';",
            "$(`[data-for=\"bsN\"]`).textContent = n + (EN ? (n === 1 ? ' storey' : ' storeys') : ' szint'); $(`[data-for=\"bsP\"]`).textContent = p ? p + (EN ? (p === 1 ? ' basement level' : ' basement levels') : ' pinceszint') : 'nincs pince';")
    save('widgets1.js', t)

t = load('widgets2.js')
if "' month'" not in t:
    t = rep(t, "out('paT', tb + ' hónap');", "out('paT', tb + (EN ? (tb === 1 ? ' month' : ' months') : ' hónap'));")
    save('widgets2.js', t)

# --- a fejléc a nyelvváltóval sem lóg ki: 560 px alatt a „▶ Videók” gomb rejtve (a fejezetsávban ott a Videótár), angolul a hosszabb alcím 860 px alatt
t = load('style.css')
if '/* fejléc a nyelvváltóval */' not in t:
    t += "/* fejléc a nyelvváltóval */\n@media (max-width:560px){.topbar .row1>a.tbtn[href=\"#videok\"]{display:none}}\n@media (max-width:860px){html[lang^=en] .brand small{display:none}}\n"
    save('style.css', t)

# --- guard.js: a gondolatjel (–, —) nem kezdhet sort: az előtte álló szóköz nem törő ---
t = load('guard.js')
if "/* gondolatjel */" not in t:
    t = rep(t, "    // rövidítések\n", "    // rövidítések\n    s = s.replace(/(\\S) ([–—]) /g, '$1' + NB + '$2 ');   /* gondolatjel */\n")
    save('guard.js', t)

t = load('guard.js')
if "/* gondolatjel a csomóponthatáron */" not in t:
    t = rep(t, "      const ms = /^ ([=≤≥≈→←×±<>⇒+−/]) /.exec(b.nodeValue);", "      if (/^ [–—] /.test(b.nodeValue) && /\\S$/.test(a.nodeValue)) b.nodeValue = NB + b.nodeValue.slice(1);   /* gondolatjel a csomóponthatáron */\n      const ms = /^ ([=≤≥≈→←×±<>⇒+−/]) /.exec(b.nodeValue);")
    save('guard.js', t)

t = load('style.css')
if '.hero .rag' not in t:   # a balra zárt tartalék a fejléc bevezetőjére is vonatkozzon (eddig csak a main-ben és a láblécben)
    t = rep(t, "main .rag, footer .rag{text-align:left!important}", "main .rag, footer .rag, .hero .rag{text-align:left!important}"); save('style.css', t)

# --- apró javítás (mindkét nyelven): elírás – „cserrétegben” (a σ¹, σ² jelölés a tankönyvi ábráé, marad) ---
for f in ['index.src.html']:
    t = load(f); t2 = t.replace('Teherterjedés a cserrétegben', 'Teherterjedés a csererétegben')
    if t2 != t: save(f, t2)
print('kész')
