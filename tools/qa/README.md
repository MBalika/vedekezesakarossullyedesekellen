# Átnéző eszközök (Playwright + Chromium, szoftveres WebGL)

Helyi szerver a repó gyökerében (`python3 -m http.server 8860`), majd:

| Eszköz | Mire való |
|---|---|
| `audit.py url hu\|en [szélességek]` | 390/768/1440/1920 px-en: vízszintes túlcsordulás, lyukas sorkizárt sor, tiltott sorvég, nem középre zárt dobozcím, U+200B, konzolhiba, tétlen oldal DOM-módosításai; angol oldalon a bent maradt magyar szavak és tizedesvesszők |
| `states.py url mappa [szélesség] [light\|dark]` | az interaktív ábrák állapotainak végigfényképezése: fülek, kapcsolók, a csúszkák két vége, az öt injektálási módszer, a 3D-szimulátor profiljai |
| `scan.py url mappa szélesség [magasság] [téma]` | az egész oldal végigfényképezése képernyőnként |
| `pack.py mappa előtag [oszlopszélesség] [oszlop] [lapmagasság]` | eltérő méretű képek áttekintő lapokra |
| `els.py`, `sheet.py` | egy-egy elem fényképe, azonos méretű képek rácsa |

Fordítás: `i18n/carry.py` (a megváltozott magyar egységekhez a régi angol pár), `i18n/prune.py` (a fel nem használt kulcsok törlése);
a build 0 hiányzó, 0 hibás, 0 fel nem használt kulccsal fusson. A „maybe” osztályú (ékezet nélküli, rövid) szövegeket a build nem
jelzi hiányzónak: `node i18n/worksheet.mjs src <fájlok> | grep -P "\t~"` listázza őket.
