# Védekezés a káros süllyedések ellen

Interaktív tananyag a BME Építőmérnöki Kar *Alapozás* tárgyához – a *Síkalapok süllyedésszámítása* jegyzet 5. fejezete (védekezés a káros süllyedések ellen) és az előadás diái alapján, webes kitekintő forrásokkal kiegészítve.

**Élő oldal:** https://vedekezesakarossullyedesekellen.vercel.app

## Tartalom
- 3D süllyedés-szimulátor (three.js): kisebb talpnyomás, mélyebb alapsík, 4 talajprofil, Jáky- és rugalmas féltér-módszer, határmélység, feszültségbura, deformálódó talaj
- interaktív ábrák: alapmozgások (EN 1997-1 H melléklet), módszerválasztó, A/B rétegződés, pince és kompenzáció, talajcsere-kalkulátor, vibroflotáció, dinamikus tömörítés, kőtömzs, kavicscölöp-raszter, injektálhatóság, tömegstabilizáció, előterhelés (e–log σ′), Mexikóváros, keretek, süllyedési hézag, építési ütem
- 7 animációs videó (`video/tj1–tj7.html`, önálló HTML-lejátszók)
- fejezetenkénti kvízek és 40 igaz/hamis állítás

## Felépítés
- `src/` – források: `index.src.html`, `style.css`, `app.js`, `widgets1.js`, `widgets2.js`, `data.js`, `sim3d.js`
- `build.py` – a forrásokból összeállítja az egyfájlos `index.html`-t (`python3 build.py`)
- `img/`, `video/` – képek, bélyegképek, videólejátszók

A `main` ágra történő push után a Vercel automatikusan frissíti az oldalt.
