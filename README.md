# Védekezés a káros süllyedések ellen

Interaktív tananyag a BME Építőmérnöki Kar *Alapozás* tárgyához – a *Síkalapok süllyedésszámítása* jegyzet 5. fejezete (védekezés a káros süllyedések ellen) és az előadás diái alapján, webes kitekintő forrásokkal kiegészítve.

**Élő oldal:** https://vedekezesakarossullyedesekellen.vercel.app

## Tartalom
- 3D süllyedés-szimulátor (three.js): kisebb talpnyomás, mélyebb alapsík, 4 talajprofil, Jáky- és rugalmas féltér-módszer, határmélység, feszültségbura, deformálódó talaj
- interaktív ábrák: alapmozgások (EN 1997-1 H melléklet), módszerválasztó, A/B rétegződés, pince és kompenzáció, talajcsere-kalkulátor, vibroflotáció, dinamikus tömörítés, kőtömzs, kavicscölöp-raszter, injektálhatóság, tömegstabilizáció, előterhelés (e–log σ′), Mexikóváros, keretek, süllyedési hézag, építési ütem
- 2 animációs videó (`video/tj1.html` talajcsere, `video/tj7.html` előterhelés – önálló HTML-lejátszók)
- 8 valós felvétel a BME Építőmérnöki Kar YouTube-csatornájáról „Nézd meg élőben is!” kártyákon (talajjavítások áttekintése, vibroflotáció, döngölés/kőtömzs, vibrált kőoszlop, injektálás, mélykeverés/tömegstabilizáció, jet-grouting, cölöpalapozások); lejátszás youtube-nocookie beágyazással
- formázás: sorkizárás, magyar elválasztás (Hyphenopoly, `vendor/hyphenopoly/`), nem törő egységek (`src/guard.js`)
- fejezetenkénti kvízek és 40 igaz/hamis állítás

## Felépítés
- `src/` – források: `index.src.html`, `style.css`, `app.js`, `widgets1.js`, `widgets2.js`, `data.js`, `yt.js` (BME-videókártyák), `guard.js` (formázás-őr), `sim3d.js`
- `build.py` – a forrásokból összeállítja az egyfájlos `index.html`-t (`python3 build.py`)
- `img/`, `img/yt/<id>/`, `video/` – képek, bélyegképek, YouTube-képkockák és QR-kódok, videólejátszók (a tj2–tj6 lejátszókra az oldal már nem hivatkozik)

## Angol változat (/en)
- `python3 build.py` a magyar `index.html` mellett az angol `en.html`-t is elkészíti (Vercel cleanUrls → `/en`; előfeltétel: `cd i18n && npm install`). Fordítás: `i18n/apply.mjs` + `i18n/en_*.tsv` (azonosító = a magyar szöveg sha1-ének első 7 jegye; brit angol, EC7-szakszavak). Ha a magyar szöveg változik és nincs hozzá fordítás, a build leáll (`i18n/missing.tsv`); munkalap: `python3 build.py catalog` → `i18n/ws.tsv`.
- A magyar forrásba az angolhoz szükséges kapcsokat (EN jelző, nyelvfüggő számformátum, HU | EN nyelvváltó, angol tördelési szabályok, angol videók útvonala) az `i18n/prep_hu.py` teszi bele (idempotens).
- Angol feliratú ábrák és videó-indexképek: `img/en/`; angol videók: `video/en/tj1.html`, `video/en/tj7.html` (a magyar videók szövegcseréjével).

A `main` ágra történő push után a Vercel automatikusan frissíti az oldalt.


## Videók zenéje

A videók zenéje (2026-11) valódi hangszerek felvett mintáiból készült – zongora, vonósok, akusztikus és elektromos gitár, basszusgitár, fúvósok, akusztikus dob –, ütemre igazítva a képhez; a gép- és effekthangok a korábbi hangkönyvtárból vannak. Hangminták: Salamander Grand Piano (Alexander Holm, CC BY 3.0); tonejs-instruments (nbrosowsky; VSCO2, Karoryfer, Iowa, Freesound – CC BY 3.0); Tone.js dobminták.
