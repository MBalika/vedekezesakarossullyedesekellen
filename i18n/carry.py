#!/usr/bin/env python3
"""Fordítás-átvitel: a hiányzó (megváltozott) magyar egységekhez megkeresi a korábbi változat leghasonlóbb
egységét és annak angol párját, így a módosított mondatot a régi angolból kiindulva lehet átírni.
használat: python3 build.py (→ i18n/missing.tsv), majd python3 i18n/carry.py [ág=origin/main] → i18n/carry_todo.txt"""
import subprocess, sys, pathlib, difflib, glob, tempfile
R = pathlib.Path(__file__).resolve().parent; ROOT = R.parent
ref = sys.argv[1] if len(sys.argv) > 1 else 'origin/main'
FILES = ['index.src.html', 'app.js', 'widgets1.js', 'widgets2.js', 'data.js', 'yt.js', 'guard.js', 'sim3d.js']
tmp = pathlib.Path(tempfile.mkdtemp())
for f in FILES: (tmp / f).write_bytes(subprocess.run(['git', 'show', f'{ref}:src/{f}'], capture_output=True, cwd=ROOT).stdout)
old = {}
for ln in subprocess.run(['node', str(R / 'worksheet.mjs'), str(tmp), *FILES], capture_output=True, text=True, cwd=R).stdout.split('\n'):
    if '\t' in ln: i, t = ln.split('\t', 1); old[i] = t.lstrip('~')
en = {}
for f in sorted(glob.glob(str(R / 'en_*.tsv'))):
    for ln in open(f, encoding='utf-8'):
        if ln.strip() and not ln.startswith('#') and '\t' in ln: k, v = ln.rstrip('\n').split('\t', 1); en[k.split('@')[0].rstrip('!')] = v
out = []
for ln in open(R / 'missing.tsv', encoding='utf-8'):
    if not ln.strip(): continue
    i, hu = ln.rstrip('\n').split('\t')[:2]
    best = max(old.items(), key=lambda kv: difflib.SequenceMatcher(None, kv[1], hu, autojunk=False).ratio() if abs(len(kv[1]) - len(hu)) < max(40, len(hu) * .6) else 0, default=(None, ''))
    sim = difflib.SequenceMatcher(None, best[1], hu, autojunk=False).ratio() if best[0] else 0
    out.append(f"### {i} sim {sim:.2f}\nÚJ : {hu}\n" + (f"RÉGI: {best[1]}\nEN  : {en.get(best[0], '?')}\n" if sim >= .55 else ''))
(R / 'carry_todo.txt').write_text('\n'.join(out), encoding='utf-8'); print(len(out), 'egység →', R / 'carry_todo.txt')
