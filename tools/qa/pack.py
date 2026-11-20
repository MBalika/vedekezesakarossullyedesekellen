"""Eltérő méretű képek áttekintő lapokra: pack.py <mappa> <kimeneti előtag> [oszlopszélesség=780] [oszlop=2] [lapmagasság=1500]"""
import sys, glob, os
from PIL import Image
src, pref = sys.argv[1], sys.argv[2]
CW = int(sys.argv[3]) if len(sys.argv) > 3 else 780
COLS = int(sys.argv[4]) if len(sys.argv) > 4 else 2
MAXH = int(sys.argv[5]) if len(sys.argv) > 5 else 1500
fs = sorted(glob.glob(src + '/*.png') + glob.glob(src + '/*.jpg'))
sheets = []; cur = [[] for _ in range(COLS)]; hs = [0] * COLS
def flush():
    global cur, hs
    if not any(cur): return
    o = Image.new('RGB', (CW * COLS + 8 * (COLS - 1), max(hs)), '#777')
    for c in range(COLS):
        y = 0
        for im in cur[c]: o.paste(im, (c * (CW + 8), y)); y += im.height + 8
    p = f'{pref}_{len(sheets):02d}.jpg'; o.save(p, quality=84); sheets.append(p)
    cur = [[] for _ in range(COLS)]; hs = [0] * COLS
for f in fs:
    im = Image.open(f).convert('RGB'); sc = min(1, CW / im.width); im = im.resize((int(im.width * sc), int(im.height * sc)))
    if im.width < CW: bg = Image.new('RGB', (CW, im.height), '#fff'); bg.paste(im, (0, 0)); im = bg
    c = hs.index(min(hs))
    if hs[c] + im.height > MAXH and any(cur): flush(); c = 0
    cur[c].append(im); hs[c] += im.height + 8
flush(); print('\n'.join(sheets))
