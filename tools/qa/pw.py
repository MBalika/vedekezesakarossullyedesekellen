import asyncio, sys, json, os
from playwright.async_api import async_playwright
ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
BASE='http://localhost:8851/'
CH=['bevezetes','menete','drenezes','keplet','mintapeldak','kalkulator']
async def open_page(p, w=1440, h=900, page='index.html', dpr=1):
    b=await p.chromium.launch(args=ARGS)
    ctx=await b.new_context(viewport={'width':w,'height':h}, device_scale_factor=dpr)
    pg=await ctx.new_page()
    errs=[]
    pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)[:300]))
    pg.on('console', lambda m: errs.append('CONSOLE '+m.text[:300]) if m.type=='error' else None)
    await pg.goto(BASE+page+'?hu', wait_until='networkidle')
    await pg.wait_for_timeout(1500)
    return b, pg, errs
