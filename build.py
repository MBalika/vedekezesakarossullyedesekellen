#!/usr/bin/env python3
"""Összeállítja a magyar (index.html) és az angol (en.html → /en) oldalt: a CSS és JS forrásokat beágyazza.

Használat:  (cd i18n && npm install) && python3 build.py
            python3 build.py catalog   → a fordítandó szövegek munkalapja (i18n/ws.tsv)
Az angol változat a magyar forrásból (src/) készül: az i18n/apply.mjs a fordítási egységeket (HTML-szövegek, attribútumok,
JS-karakterláncok) az i18n/en_*.tsv párjai szerint cseréli (i18n/.en/), és abból épül az en.html. Ha a magyar szöveg
változik és nincs hozzá fordítás, az angol build leáll (a hiányzók: i18n/missing.tsv). A magyar forrásba az angolhoz
szükséges kapcsokat (EN jelző, nyelvváltó, angol tördelési szabályok) az i18n/prep_hu.py teszi bele.
"""
import os, re, sys, glob, shutil, subprocess, pathlib
R = pathlib.Path(__file__).parent
I18N = R / 'i18n'
SITE = 'https://vedekezesakarossullyedesekellen.vercel.app'
CLASSIC = ['app.js', 'widgets1.js', 'widgets2.js', 'data.js', 'yt.js', 'guard.js']
FILES = ['index.src.html', *CLASSIC, 'sim3d.js']
META = {
  'hu': ('Védekezés a káros süllyedések ellen',
         'Interaktív tananyag: kisebb talpnyomás, mélyebb alapsík, talajcsere, tömörítés, injektálás, tömegstabilizáció, előterhelés – 3D szimulátorral, valós felvételekkel, kvízekkel.',
         'BME Alapozás · interaktív tananyag 3D süllyedés-szimulátorral, videókkal és kvízekkel.', 'hu'),
  'en-GB': ('Protection against harmful settlement',
            'Interactive learning module: lower contact pressure, deeper foundation level, soil replacement, compaction, grouting, mass stabilisation, preloading – with a 3D simulator, real footage and quizzes.',
            'BME Foundation Engineering · interactive module with a 3D settlement simulator, videos and quizzes.', 'en-gb'),
}
ALT = f'<link rel="alternate" hreflang="hu" href="{SITE}/">\n<link rel="alternate" hreflang="en" href="{SITE}/en">\n<link rel="alternate" hreflang="x-default" href="{SITE}/">\n'
REDIR = "<script>/*nyelv*/try{if(localStorage.getItem('alap-lang')==='en'&&!/[?&]hu\\b/.test(location.search))location.replace('en'+location.hash)}catch(e){}</script>\n"
# az angolul is elérhető tananyagok: az angol oldal ezek /en változatára mutat
EN_SITES = ['bme-alapozas', 'talajfelderites', 'sikalapoktervezese', 'sikalapok-teherbirasszamitasa', 'sikalapokallekonysagvizsgalata',
            'sikalapok-sullyedesszamitasa', 'kedvezotlen-altalaj', 'sikalapokaterohatasok', 'melyalapozasok']

# POST: a fordítókészlet által nem kezelt helyek (egyedi data-* attribútum) az angol HTML-ben
POST = [('data-tech="Döngölés és kőtömzs"', 'data-tech="Pounding and stone pillars"'),
        # angol feliratú ábrák és videó-indexképek (img/en/)
        *[(f'src="img/{f}.jpg"', f'src="img/en/{f}.jpg"') for f in ['pince-abra', 'foldkiemeles-abra', 'talajcsere-abra', 'kavicscolop-abra']],
        ('<img src="img/${i}.jpg"', '<img src="img/${i === \'inj-4\' ? \'en/\' : \'\'}${i}.jpg"'),
        ('<img src="img/thumb-${c.dataset.video}.jpg"', '<img src="img/en/thumb-${c.dataset.video}.jpg"')]


def build(src, out, lang):
    css = (src / 'style.css').read_text()
    body = (src / 'index.src.html').read_text()
    classic = ''.join(f"<script>\n{(src / f).read_text()}\n</script>\n" for f in CLASSIC)
    module = f"<script type=\"module\">\n{(src / 'sim3d.js').read_text()}\n</script>\n"
    TITLE, DESC, OGD, HY = META[lang]
    if lang != 'hu':   # a nyelvváltó a magyar oldalra mutat
        a = 'id="langSw" href="en" hreflang="en" lang="en"'; assert body.count(a) == 1
        body = body.replace(a, 'id="langSw" href="./" hreflang="hu" lang="hu"')
    head = f"""<title>{TITLE}</title>
<meta name="description" content="{DESC}">
<meta name="theme-color" content="#0b2420">
<meta property="og:title" content="{TITLE}">
<meta property="og:description" content="{OGD}">
{ALT}{REDIR if lang == 'hu' else ''}<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230d7a68'/%3E%3Cpath d='M7 25h18M10 25V14l6-5 6 5v11' fill='none' stroke='white' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap">
<script src="vendor/hyphenopoly/Hyphenopoly_Loader.js"></script>
<script>Hyphenopoly.config({{ require: {{ "{HY}": "FORCEHYPHENOPOLY" }}, setup: {{ hide: "none", selectors: {{ ".hyphenate": {{ minWordLength: 6, compound: "auto" }} }} }} }});</script>
<script type="importmap">{{"imports":{{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}}}</script>
"""
    full_body = body.replace('<!--HEAD-->', '').replace('<!--SCRIPTS-->', classic + module)
    html = f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
{head}<style>
{css}
</style>
</head>
<body>
{full_body}
</body>
</html>
"""
    if lang != 'hu':
        for x, y in POST: assert html.count(x) == 1, x; html = html.replace(x, y)
        for s in EN_SITES: html = re.sub(rf'https://{s}\.vercel\.app/?(#[\w-]+)?(?=["\'])', lambda m, s=s: f'https://{s}.vercel.app/en' + (m.group(1) or ''), html)
    (R / out).write_text(html)
    print(out, len(html) // 1024, 'KB')


if sys.argv[1:2] == ['catalog']:
    r = subprocess.run(['node', str(I18N / 'worksheet.mjs'), str(R / 'src'), *FILES], capture_output=True, text=True)
    (I18N / 'ws.tsv').write_text(r.stdout); print(r.stdout.count('\n'), 'egység → i18n/ws.tsv', r.stderr[-500:]); sys.exit(0)

build(R / 'src', 'index.html', 'hu')

# ---- angol változat ----
EN = I18N / '.en'; shutil.rmtree(EN, ignore_errors=True); EN.mkdir()
shutil.copy(R / 'src' / 'style.css', EN / 'style.css')
tsv = ','.join(sorted(glob.glob(str(I18N / 'en_*.tsv'))))
if not tsv: sys.exit('nincs fordítás (i18n/en_*.tsv)')
r = subprocess.run(['node', str(I18N / 'apply.mjs'), str(R / 'src'), str(EN), tsv, *FILES], capture_output=True, text=True, cwd=I18N,
                   env={**os.environ, 'STRICT': '1', 'NUMFIX': '1'})
print(r.stdout.strip())
if r.returncode:
    print(r.stderr[-2500:]); sys.exit('Az angol változat nem készült el (a hiányzók: i18n/missing.tsv).')
if (I18N / 'missing.tsv').exists(): (I18N / 'missing.tsv').unlink()
# tizedesvessző → pont: a HTML-szövegben (címkék között) és a JS-literálokban (acorn); tg → tan
p = EN / 'index.src.html'; t = p.read_text()
p.write_text(re.sub(r'>([^<]*)<', lambda m: '>' + re.sub(r'(?<=\d),(?=\d)', '.', re.sub(r'\btg(?=[  ][αδφ\d(]|²)', 'tan', m.group(1))) + '<', t))
r = subprocess.run(['node', str(I18N / 'numfix_js.mjs'), *[str(EN / f) for f in FILES if f.endswith('.js')]], capture_output=True, text=True)
print(r.stdout.strip().replace('\n', ' · '))
if r.returncode: print(r.stderr); sys.exit(1)
for f in FILES:
    if f.endswith('.js'):
        p = EN / f; t = p.read_text(); t = re.sub(r'\btg(?=[  ][αδφ$\d(]|²)', 'tan', t); t = re.sub(r'\bctg(?=[  ][αδφ$\d(]|²)', 'cot', t); p.write_text(t)
build(EN, 'en.html', 'en-GB')
