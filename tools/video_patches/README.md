# Videójavító szkriptek

A `video/*.html` lejátszók egyfájlos, minifikált csomagok (three.js + feliratok + zene). Forrásuk nincs a repóban, ezért a
javítások a kész HTML-ben, pontos karakterlánc-cserékkel készülnek (minden cserénél ellenőrzött találatszámmal).

- `tj1_javitas_2026-11-21.py` – talajcsere-videó: „kompresszibilis altalaj (laza feltöltés, puha iszap, agyag…)” a „puha agyag”
  helyett; nincs geotextília a gödör alján (a lépéssáv három lépés: kiemelés, rétegenként tömörítve, alaptest; zárócím
  „kiemelés · beépítés · tömörítés”); a lábazatnál vibráló, a terep fölé nyúló alaptest-dobozok a terepszint alá kerültek.
  Futtatás: `python3 tj1_javitas_2026-11-21.py video/tj1.html hu` és `… video/en/tj1.html en` (az eredeti fájlokon).
- `tj7_mexikovaros_2026-11-21.py` – előterhelés-videó: a mexikóvárosi rész az El Moro (Lotería Nacional) épület dokumentált
  tehercseréje szerint (lásd a szkript fejlécét).

Ellenőrzés: állóképek a módosított jelenetekből (`renderAt(t)` a `?render=1` módban), vibrálásmérés egymást követő képkockákon.
