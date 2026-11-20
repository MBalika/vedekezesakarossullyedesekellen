"""Az interaktív ábrák állapotainak végigfényképezése (Védekezés app).
használat: states.py <url> <kimeneti mappa> [szélesség=1440] [téma=light|dark]
Minden képet a widget paneljéről készít; a csúszkák két végét, a füleket és a kapcsolókat is bejárja."""
import asyncio, sys, os
from playwright.async_api import async_playwright
url, out = sys.argv[1], sys.argv[2]
W = int(sys.argv[3]) if len(sys.argv) > 3 else 1440
theme = sys.argv[4] if len(sys.argv) > 4 else 'light'
os.makedirs(out, exist_ok=True)
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS)
        pg = await b.new_page(viewport={'width': W, 'height': 1000}, device_scale_factor=1)
        errs = []
        pg.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)[:300]))
        pg.on('console', lambda m: errs.append('CONSOLE ' + m.text[:300]) if m.type == 'error' else None)
        await pg.emulate_media(reduced_motion='reduce')
        await pg.goto(url, wait_until='networkidle'); await pg.wait_for_timeout(1500)
        await pg.evaluate(f"document.documentElement.setAttribute('data-theme','{theme}'); dispatchEvent(new Event('themechange'))")
        n = 0
        async def shot(name, sel, wait=350):
            nonlocal n
            el = pg.locator(sel).first
            try:
                await el.evaluate("e => e.scrollIntoView({block:'center'})"); await pg.wait_for_timeout(wait)
                n += 1; await el.screenshot(path=f'{out}/{n:02d}_{name}.png', timeout=10000, animations='disabled')
            except Exception as e: errs.append(f'SHOT {name}: {str(e)[:120]}')
        async def rng(id, v):
            await pg.evaluate("(a) => { const r = document.getElementById(a[0]); r.value = a[1]; r.dispatchEvent(new Event('input', {bubbles:true})); }", [id, v])
        async def click(sel, i=0):
            await pg.evaluate("(a) => { const e = document.querySelectorAll(a[0])[a[1]]; if (e) e.click(); }", [sel, i])
        async def chk(id, on):
            await pg.evaluate("(a) => { const e = document.getElementById(a[0]); if (e.checked !== a[1]) e.click(); }", [id, on])
        P = lambda s: f'xpath=//*[@id="{s}"]/ancestor::div[contains(@class,"panel")][1]'
        # 1. áttekintés
        await shot('dirs', '.dirs'); await shot('selector', '#selector')
        await click('#selector [data-q="sit"] button', 1); await click('#selector [data-q="soil"] button', 2); await shot('selector_meglevo_szerves', '#selector')
        await shot('sumt', '.tscroll')
        # 2. 3D szimulátor
        for pk in range(4):
            await click('#simProf button', pk); await pg.wait_for_timeout(900); await shot(f'sim3d_{"ABCD"[pk]}_J', '.simmain', 900)
        await click('#simProf button', 1); await click('#simMeth button', 1); await rng('simB', 4.5); await pg.wait_for_timeout(900); await shot('sim3d_B_E_B45', '.simmain', 900); await shot('sim_charts_B_E', '.charts')
        await click('#simCurveSel button', 1); await shot('sim_charts_sD', '.charts')
        await click('#simViewSel button', 1); await pg.wait_for_timeout(500); await shot('sim2d_B_E', '.simmain', 500)
        await rng('simD', 4.0); await rng('simN', 2000); await shot('sim2d_D4_N2000', '.simmain', 500)
        await click('#simViewSel button', 0); await click('#simProf button', 0); await click('#simMeth button', 0)
        # a/b ábrák
        await shot('ab_14', P('abSvg')); await rng('abB', 4.2); await shot('ab_42', P('abSvg')); await shot('threecases', '#tcSvg')
        await shot('bs_def', P('bsSvg')); await rng('bsN', 14); await rng('bsP', 3); await shot('bs_14_3', P('bsSvg')); await rng('bsN', 2); await rng('bsP', 3); await shot('bs_2_3', P('bsSvg')); await rng('bsP', 0); await rng('bsT', 40); await shot('bs_2_0_t40', P('bsSvg'))
        # 3. talajcsere
        await shot('tcs_def', '#talajcsere .sim'); await rng('tcsV', 1.5); await rng('tcsB', 2.0); await chk('tcsGw', True); await shot('tcs_v15_gw', '#talajcsere .sim'); await rng('tcsV', 0.3); await rng('tcsB', 0.6); await rng('tcsP', 500); await shot('tcs_min', '#talajcsere .sim')
        await shot('tcs_cards', '#talajcsere .grid.g4')
        # 4. tömörítés
        for k in range(4):
            await click('#vibSteps button', k); await pg.wait_for_timeout(2600); await shot(f'vib_{k}', '.tabpane[data-tab="m1"] .twocol', 100)
        await rng('vibFines', 30)
        await click('.tabs[data-group="mech"] button', 1); await shot('dyn_def', '.tabpane[data-tab="m2"] .twocol')
        for _ in range(3): await click('#dynDrop'); await pg.wait_for_timeout(2100)
        await rng('dynW', 40); await rng('dynH', 40); await shot('dyn_40_40', '.tabpane[data-tab="m2"] .twocol')
        await click('.tabs[data-group="mech"] button', 2)
        for k in range(5):
            await click('#ktSteps button', k); await shot(f'kt_{k}', '.tabpane[data-tab="m3"] .twocol')
        await click('.tabs[data-group="mech"] button', 3); await shot('kc_tri', '.tabpane[data-tab="m4"] .twocol'); await click('#kcPat button', 1); await rng('kcD', 1.1); await rng('kcS', 1.4); await click('#kcSteps button', 3); await shot('kc_sq_dense', '.tabpane[data-tab="m4"] .twocol')
        # 5. injektálás
        for k in range(5):
            await click('#injM button', k); await rng('injT', 55); await shot(f'inj_{k}_55', '.injsim'); await rng('injT', 100); await shot(f'inj_{k}_100', '.injsim')
        await shot('injt', '.injt')
        for i, k in enumerate(['kavics', 'durva', 'kozep', 'finom', 'iszap', 'agyag', 'repedt']):
            await click('#grSoil button', i); await shot(f'gr_{k}', P('grSvg'))
        for k in range(4):
            await click('#injBar button', k); await pg.wait_for_timeout(500); await shot(f'injphoto_{k}', '#injPhotos', 500)
        await click('.tabs[data-group="inj"] button', 1); await shot('ms_def', '.tabpane[data-tab="i2"] .twocol'); await rng('msT', 100); await rng('msD', 7); await rng('msA', 6000); await shot('ms_max', '.tabpane[data-tab="i2"] .twocol')
        await click('.tabs[data-group="inj"] button', 0)
        # 6. előterhelés
        await shot('pl_def', '#eloterheles .charts'); await shot('pl_panel', P('plB'))
        await rng('plP', 0); await shot('pl_p0', '#eloterheles .charts'); await rng('plP', 40); await rng('plB', 160); await shot('pl_p40_b160', '#eloterheles .charts'); await shot('pl_panel2', P('plB'))
        for v in (0, 50, 100):
            await rng('mxT', v); await shot(f'mx_{v}', P('mxSvg'))
        # 7. szerkezet
        await shot('fr_rigid_18', P('frSvg')); await rng('frD', 40); await shot('fr_rigid_40', P('frSvg')); await click('#frType button', 1); await shot('fr_hinge_40', P('frSvg')); await rng('frD', 0); await shot('fr_hinge_0', P('frSvg'))
        await shot('jt_off_80', P('jtSvg')); await rng('jtS', 100); await shot('jt_off_100', P('jtSvg')); await chk('jtTgl', True); await shot('jt_on_100', P('jtSvg'))
        await shot('pa_4', P('paSvg')); await rng('paT', 1); await shot('pa_1', P('paSvg')); await rng('paT', 24); await shot('pa_24', P('paSvg'))
        await shot('videok', '#videok'); await shot('foot', 'footer')
        # kvíz: válasz és eredmény
        await click('#q3 .opt', 1); await shot('quiz_answered', '#q3')
        await click('#tfGrid .tf button', 0); await click('#tfGrid .tf:nth-child(4) button', 0); await shot('tf_answered', '#igazhamis .wrap', 300)
        print('shots', n); print('\n'.join(errs[:30]))
        await b.close()
asyncio.run(main())
