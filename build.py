#!/usr/bin/env python3
"""Összeállítja a dist/index.html-t: a CSS és JS forrásokat beágyazza."""
import pathlib, re
R = pathlib.Path(__file__).parent
src = R / 'src'
dist = R  # a repó gyökere a kiszolgált mappa

css = (src / 'style.css').read_text()
body = (src / 'index.src.html').read_text()
classic = ''.join(f"<script>\n{(src / f).read_text()}\n</script>\n" for f in ['app.js', 'widgets1.js', 'widgets2.js', 'data.js'])
module = f"<script type=\"module\">\n{(src / 'sim3d.js').read_text()}\n</script>\n"

head = """<title>Védekezés a káros süllyedések ellen</title>
<meta name="description" content="Interaktív tananyag: kisebb talpnyomás, mélyebb alapsík, talajcsere, tömörítés, injektálás, tömegstabilizáció, előterhelés – 3D szimulátorral, videókkal, kvízekkel.">
<meta name="theme-color" content="#0b2420">
<meta property="og:title" content="Védekezés a káros süllyedések ellen">
<meta property="og:description" content="BME Alapozás · interaktív tananyag 3D süllyedés-szimulátorral, animációs videókkal és kvízekkel.">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230d7a68'/%3E%3Cpath d='M7 25h18M10 25V14l6-5 6 5v11' fill='none' stroke='white' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap">
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>
"""

full_body = body.replace('<!--HEAD-->', '').replace('<!--SCRIPTS-->', classic + module)
html = f"""<!doctype html>
<html lang="hu">
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
(dist / 'index.html').write_text(html)
print('index.html', len(html) // 1024, 'KB')
