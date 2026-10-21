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

A `main` ágra történő push után a Vercel automatikusan frissíti az oldalt.
