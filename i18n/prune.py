#!/usr/bin/env python3
"""A fel nem használt fordítási kulcsok törlése az en_*.tsv fájlokból (a build után: i18n/unused.txt).
A fel nem használt kulcs elavult szöveg vagy elcsúszott, sorhoz kötött kulcs – a build 0 ilyennel fusson."""
import glob, pathlib
R = pathlib.Path(__file__).resolve().parent
un = set((R / 'unused.txt').read_text(encoding='utf-8').split('\n')) - {''}
n = 0
for f in sorted(glob.glob(str(R / 'en_*.tsv'))):
    keep = []
    for ln in open(f, encoding='utf-8'):
        k = ln.split('\t', 1)[0].strip()
        if '\t' in ln and not ln.startswith('#') and k in un: n += 1; continue
        keep.append(ln)
    pathlib.Path(f).write_text(''.join(keep), encoding='utf-8')
print('törölve:', n, '/', len(un))
