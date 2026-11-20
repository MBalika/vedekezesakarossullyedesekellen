import asyncio, sys, os
from playwright.async_api import async_playwright
from pw import open_page
# használat: cvshots.py <page> <outdir> <width> [dpr]
page,out,w=sys.argv[1],sys.argv[2],int(sys.argv[3]); dpr=float(sys.argv[4]) if len(sys.argv)>4 else 1
os.makedirs(out,exist_ok=True)
async def main():
    async with async_playwright() as p:
        b,pg,errs=await open_page(p,w,900,page,dpr)
        for ch,ids in (('drenezes',['df-cv','df-ch']),('keplet',['kp-cv1','kp-cv2','kp-cv3','kp-cv4','kp-svg5','kp-cv6'])):
            await pg.evaluate(f"setChapter('{ch}')"); await pg.wait_for_timeout(600)
            for i in ids:
                el=pg.locator('#'+i); await el.scroll_into_view_if_needed(); await pg.wait_for_timeout(900)
                box=await el.bounding_box()
                await el.screenshot(path=f'{out}/{i}.png'); print(i, box and (round(box['width']),round(box['height'])))
        print('errors',errs)
        await b.close()
asyncio.run(main())
