/* ===== Kvízek és igaz/hamis állítások ===== */
(function () {
const Q = {
  q1: [
    { q: 'Hazai talajviszonyok mellett a síkalapok tervezésében gyakran mi a mértékadó?', o: ['A teherbírási határállapot', 'A használhatósági határállapot (süllyedések)', 'A talajvízszint', 'Az alaptest betonminősége'], a: 1, e: 'Sok esetben nem a teherbírási, hanem a <b>használhatósági határállapot</b> – a süllyedés és a süllyedéskülönbség – dönt.' },
    { q: 'Mi károsítja elsősorban az épületet?', o: ['Az abszolút süllyedés', 'Az egyenlőtlen süllyedés', 'A talaj önsúlya', 'A hőtágulás'], a: 1, e: '„Nem az abszolút süllyedés, hanem az <b>egyenlőtlen süllyedés</b> károsítja az épületet” – elferdülést, áthajlást, többlet-igénybevételt és repedést okoz.' },
    { q: 'Kb. mekkora az a relatív elfordulás, amely már nagy valószínűséggel teherbírási határállapotot (tönkremenetelt) okoz?', o: ['1/1000', '1/500', '1/300', '1/150'], a: 3, e: 'Az <b>1/150</b> relatív elfordulás már tönkremenetelt okoz(hat); az 1/500 szerkezetileg általában megengedhető.' },
    { q: 'Melyik épület érzékenyebb a süllyedéskülönbségekre?', o: ['A nagy, merev irodaház', 'A kisebb, 1–3 szintes, kis merevségű ház', 'A cölöpökön álló híd', 'Mindegyik egyformán'], a: 1, e: 'A kisebb, alacsonyabb épületek merevsége kisebb – a károsodott hazai épületek nagy része <b>1–3 szintes</b>.' },
    { q: 'Merre emelkednek a falrepedések?', o: ['A kisebb süllyedésű rész felé', 'A nagyobb süllyedésű (lejjebb kerülő) rész felé', 'Mindig vízszintesen', 'Mindig függőlegesen'], a: 1, e: 'A repedések a <b>nagyobb süllyedésű hely felé</b> (a mozgás után lejjebb lévő rész felé) emelkednek – ez segít kideríteni az okot.' },
  ],
  q3: [
    { q: 'Miért nem csökkenti a talpnyomás csökkentése arányosan a süllyedést?', o: ['Mert a beton összenyomódik', 'Mert a szélesebb alap nehezebb, és alatta mélyebbre jut a feszültség', 'Mert a talajvíz megemelkedik', 'Mert a határmélység csökken'], a: 1, e: 'Két ok: a szélesebb alaptest <b>nagyobb súly</b>, főként pedig a szélesebb alap alatt <b>nagyobb mélységig</b> jutnak le a feszültségek – nő a határmélység.' },
    { q: 'Mikor hatásos a szélesebb alap?', o: ['Ha mélyebben puhább réteg van', 'Ha mélyebben kevésbé összenyomódó réteg van', 'Mindig', 'Soha'], a: 1, e: 'Akkor hatásos, ha <b>mélyebben kevésbé összenyomódó rétegek</b> vannak (A eset) – a feszültség egy részét a homokra „közvetítjük”.' },
    { q: 'Milyen alapozási mélységnél mélyebb sávalapot már nem gazdaságos készíteni?', o: ['0,8 m', '1,2 m', '2–2,5 m', '6 m'], a: 2, e: '<b>2–2,5 m</b>-nél mélyebb sávalap nem gazdaságos – ilyenkor pontalap gerendaráccsal vagy kútalapozás jön szóba.' },
    { q: 'Mi a pince kettős hatása?', o: ['Hőszigetel és vízzár', 'Teherbíró rétegre kerülhet az alapsík, és nő a kiemelt földtömeg súlya', 'Növeli a talpnyomást és a határmélységet', 'Csökkenti a talajvízszintet és a súlyt'], a: 1, e: 'Mélyebben fekvő teherbíró rétegre kerül(het) az alapsík, és <b>nő a kiemelt földtömeg súlya</b> – ez tehermentesíti az altalajt.' },
    { q: 'Mikor kezdődik a süllyedés egy kétpinceszintes épületnél?', o: ['Az első szint építésekor', 'Amikor az építés eléri a tehermentesítésnek megfelelő terhelést', 'Csak a használatbavételkor', 'A földkiemelés pillanatában'], a: 1, e: 'A konszolidációs görbe szerint a süllyedés csak akkor kezdődött, amikor elérték a <b>tehermentesítésnek (kiemelt föld súlyának) megfelelő terhelést</b>.' },
  ],
  q4: [
    { q: 'Miért csak talajvíz felett végezhető általában a talajcsere?', o: ['Mert a víz kimossa a cementet', 'Mert talajvíz alatt nem lehet tömöríteni', 'Mert a geotextília elázik', 'Mert túl drága a szivattyú'], a: 1, e: 'Talajvíz alatt a cseretalajt <b>nem lehet megfelelően tömöríteni</b>.' },
    { q: 'Mekkora a talajcsere szokásos vastagsága?', o: ['10–20 cm', '50–80 cm', '2–3 m', '5 m felett'], a: 1, e: 'Általában részleges talajcsere is elegendő, szokásos vastagsága <b>50–80 cm</b>.' },
    { q: 'Milyen vastag laza rétegenként kell tömöríteni?', o: ['max. 10 cm', 'max. 30 cm', 'max. 80 cm', 'egy rétegben'], a: 1, e: 'A talajcserét <b>max. 30 cm-es laza rétegenként</b> kell tömöríteni.' },
    { q: 'Hol kell a talajtöréssel szembeni biztonságot igazolni?', o: ['Csak az alapsík alatt', 'Az alapsík alatti talajcserén és a talajcsere alsó síkja alatti talajon is', 'Csak a terepszinten', 'Nem kell igazolni'], a: 1, e: 'Igazolni kell az alapsík alatti talajcserén, és a <b>talajcsere alsó síkja alatti</b> talajon is.' },
  ],
  q5: [
    { q: 'Mi segíti a vibroflotációs mélyvibrátor lefelé haladását?', o: ['Fúrófej', 'Vízbesajtolás (öblítés)', 'Robbantás', 'Sűrített cement'], a: 1, e: 'A vibrátor önsúlyánál fogva halad lefelé, ezt a <b>vízbesajtolás (öblítés)</b> segíti.' },
    { q: 'Milyen ejtősúllyal és magasságból dolgozik a dinamikus tömörítés?', o: ['1–2 t, 2–5 m', '15–40 t, 10–40 m', '100 t, 100 m', '5 kg, 1 m'], a: 1, e: 'Ejtősúly <b>15–40 t</b>, ejtési magasság <b>H = 10–40 m</b>; max. 5–7 m mélységig hatásos.' },
    { q: 'Mi a kőtömzs kettős hatása?', o: ['Szigetel és vízzár', 'Tömöríti a puha altalajt és nagy teherbírású tömzsök alakulnak ki', 'Csökkenti a talajvízszintet és emeli az épületet', 'Gyorsítja a konszolidációt és hűt'], a: 1, e: 'A szemcsés anyag kiszorítása <b>tömöríti a puha talajt</b>, és <b>nagy átmérőjű, nagy teherbírású tömzsök</b> alakulnak ki.' },
    { q: 'Miben különbözik a kavicscölöp a kőtömzstől?', o: ['Kisebb átmérőjű szemcsés oszlopok', 'Betonból készül', 'Csak szemcsés talajba', 'Nagyobb átmérőjű'], a: 0, e: 'Elve hasonló, de <b>kisebb átmérőjű</b> szemcsés anyagú oszlopok – cölöpök – alakulnak ki.' },
  ],
  q6: [
    { q: 'Milyen talaj injektálható cementtejjel?', o: ['Agyag', 'Finom homok', '0,8–1 mm-nél durvább homok-kavics, repedezett kötött talaj', 'Iszap'], a: 2, e: 'A hézagoknak nagyobbnak kell lenniük a cementszemcsénél: <b>0,8–1 mm-nél durvább</b> homok-kavics, illetve üreges, repedezett kötött talaj.' },
    { q: 'Milyen irányban injektálnak cementbesajtolásnál?', o: ['Felülről lefelé', 'Alulról felfelé, csőfelhúzás közben', 'Vízszintesen', 'Mindegy'], a: 1, e: '<b>Alulról felfelé</b>, csőfelhúzás közben kell injektálni.' },
    { q: 'Melyik talajban NEM hatékony a kétkomponensű műanyag injektálás?', o: ['Homok', 'Iszapos homok', 'Agyag', 'Durva homok'], a: 2, e: 'Homokos és iszapos talajban alkalmazzák – <b>agyag esetén nem alkalmazható hatékonyan</b>.' },
    { q: 'Milyen mélységig érhető el a tömegstabilizáció toldószárral?', o: ['2 m', 'kb. 7 m', '20 m', '50 m'], a: 1, e: 'A keverőszár 3–5 m, toldószárral további 2 m – így <b>akár 7 m</b> mélységig.' },
  ],
  q7: [
    { q: 'Mi az előterhelés lényege?', o: ['A talajt cementtel keverjük', 'Előzetes terheléssel „kikényszerítjük” az összenyomódás egy részét', 'Robbantással tömörítünk', 'Cölöpöket verünk'], a: 1, e: 'Előzetesen felhordott terheléssel <b>„kikényszerítjük” az altalaj összenyomódásának legalább egy részét</b> – a réteg úgy viselkedik, mint egy geológiailag előterhelt réteg.' },
    { q: 'Mexikóvárosban mekkora kavicstömeggel terhelik az alaplemezt?', o: ['A kész épület súlyának felével', 'A kész épület súlyának megfelelővel', 'Tetszőleges mennyiséggel', 'A kiemelt föld kétszeresével'], a: 1, e: 'A vb. vázas épületek alaplemezeit <b>a kész épület súlyának megfelelő</b> kavicstömeggel terhelik meg.' },
    { q: 'Hogyan távolítják el Mexikóvárosban a kavicsot?', o: ['Egyszerre, az építés előtt', 'Olyan ütemben, ahogyan az építmény súlya nő', 'Soha nem távolítják el', 'Az építés befejezése után'], a: 1, e: 'A kavicsot <b>olyan ütemben</b> távolítják el, ahogyan az építmény súlya nő – az altalaj terhelése közel állandó marad.' },
  ],
  q8: [
    { q: 'Süllyedésre gyanús területen milyen szerkezetet tervezzünk lehetőleg?', o: ['Statikailag határozatlant', 'Statikailag határozottat', 'Ívtartót', 'Merev keretet'], a: 1, e: 'Lehetőleg <b>statikailag határozott</b> szerkezetet – a csuklós kapcsolatok elfordulhatnak, nem alakulnak ki többlet-igénybevételek.' },
    { q: 'Mit érdemes tenni hosszú, különbözőképpen terhelt épületrészeknél?', o: ['Összeépíteni', 'Süllyedési hézaggal elválasztani', 'Mindet cölöpözni', 'Előfeszíteni'], a: 1, e: '<b>Süllyedési hézaggal</b> célszerű elválasztani őket (a hődilatáció miatt eleve szükséges).' },
    { q: 'Mikor építsük meg a süllyedésre érzékeny szerkezeti részeket?', o: ['Minél korábban', 'Minél később', 'Mindegy', 'Az alapozással együtt'], a: 1, e: 'A süllyedésre érzékeny részeket lehetőleg <b>minél később</b> építjük meg.' },
    { q: 'Mi indokolja telített agyagon az építési ütem lassítását?', o: ['A beton kötése', 'A pórusvíznyomás növekedése', 'A daru teljesítménye', 'A fagy'], a: 1, e: 'Telített agyagon a <b>pórusvíznyomás növekedése</b> az ütem lassítását diktálja.' },
  ],
};
const TFI = [
  { s: 'Hazai talajviszonyok mellett gyakran a használhatósági határállapot (süllyedés) a mértékadó.', t: true, e: 'Sokszor nem a teherbírás, hanem a süllyedés(különbség) „dönt”.' },
  { s: 'Az épületet elsősorban az abszolút süllyedés károsítja.', t: false, e: 'Az egyenlőtlen süllyedés okoz elferdülést, többlet-igénybevételt és repedést.' },
  { s: 'Szokványos, különálló alapokon álló szerkezeteknél a szomszédos oszlopok közötti kb. 20 mm-es süllyedéskülönbség általában megengedhető.', t: true, e: 'Ez az ajánlott érték – de a mértékadó a relatív elfordulás (δs/L): kis oszloptávolságnál 20 mm már 1/500-nál nagyobb elfordulást jelent.' },
  { s: 'Kötött talajon kisebb süllyedéskülönbség engedhető meg, mint szemcsés talajon.', t: false, e: 'Fordítva: agyagon kb. másfélszer nagyobb engedhető meg – a lassú konszolidációt jobban bírja az építőanyag.' },
  { s: 'Az 1/150 relatív elfordulás már tönkremenetelt okozhat.', t: true, e: 'Az 1/500 szerkezetileg általában megengedhető, az 1/150 már kritikus.' },
  { s: 'A talpnyomás csökkentése mindig arányosan csökkenti a süllyedést.', t: false, e: 'A szélesebb alap nehezebb, és alatta mélyebbre jutnak a feszültségek – nő a határmélység.' },
  { s: 'Ha a puha agyag alatt homok van, a szélesebb alap a feszültség egy részét a homokra közvetíti.', t: true, e: 'Ez az A eset – itt a talpnyomás csökkentése hatásos.' },
  { s: 'Ha a homok alatt puha agyag van, a szélesítés akár növelheti is a süllyedést.', t: true, e: 'B eset: a lejjebb fekvő puha agyagréteg kap nagyobb feszültséget – „pont ellenkező hatást érünk el”.' },
  { s: 'A szélesebb alap alatt kisebb a határmélység.', t: false, e: 'Nagyobb: a hatás mélységét az alap szélessége szabja meg.' },
  { s: '2–2,5 m-nél mélyebb sávalapot már nem gazdaságos készíteni.', t: true, e: 'Ilyenkor pontalap gerendaráccsal vagy kútalapozás célszerű.' },
  { s: 'Az alapsík mélyítésével nő a takarás, így nő a talajtöréssel szembeni biztonság.', t: true, e: 'Ezért az alapszélesség is csökkenthető.' },
  { s: 'Ha a kiemelt talaj súlya nagyobb az építményénél, merev lemezalappal az építmény gyakorlatilag mozdulatlan lehet.', t: true, e: 'Az altalajra hárított hatékony feszültségek eredője „negatív” – ez a kompenzált alapozás elve.' },
  { s: 'Talajvíz alatt a cseretalaj jól tömöríthető.', t: false, e: 'A talajcsere általában csak talajvíz felett végezhető.' },
  { s: 'A talajcsere szokásos vastagsága 50–80 cm.', t: true, e: 'Általában részleges talajcsere is elegendő.' },
  { s: 'A talajcserét oldalirányban nem kell kiszélesíteni.', t: false, e: 'A csereréteg vastagságának megfelelően (v·tgϑ) mindkét oldalon ki kell szélesíteni.' },
  { s: 'Talajcserénél elég az alapsík alatti talajtörési biztonságot igazolni.', t: false, e: 'A talajcsere alsó síkja alatti talajon is igazolni kell.' },
  { s: 'A talajcsere ma jellemzően térszíni lemezalapoknál alkalmazott, költséges megoldás.', t: true, e: 'Jelentős földmunka- és szállításigénye van.' },
  { s: 'A vibroflotációnál a lefelé haladást vízbesajtolás (öblítés) segíti.', t: true, e: 'Darura szerelt, 25–40 cm átmérőjű mélyvibrátor.' },
  { s: 'A mélytömörítés kötött, agyagos talajokban a leghatékonyabb.', t: false, e: 'Laza szemcsés talajok, feltöltések tömörítésére való – kötött talajban kavicscölöp jöhet szóba.' },
  { s: 'A dinamikus tömörítésnél 15–40 t-s ejtősúlyt 10–40 m magasból ejtenek.', t: true, e: 'Az ejtősúly 15–40 t, az ejtési magasság H = 10–40 m; a hatás max. 5–7 m mélységig terjed.' },
  { s: 'A dinamikus tömörítés 20–30 m mélységig hatásos.', t: false, e: 'Max. 5–7 m mélységig hatásos.' },
  { s: 'A dinamikus tömörítésnél a fázisok között pihentetést alkalmaznak.', t: true, e: 'A tervezett paraméterek között szerepel a pihentetés időtartama is.' },
  { s: 'A kőtömzs csak nagyon laza-puha talajokban alkalmazható.', t: true, e: 'A szemcsés anyagot a döngölő a puha altalajba „bedolgozza”.' },
  { s: 'A kavicscölöp a kőtömzsnél nagyobb átmérőjű.', t: false, e: 'Kisebb átmérőjű szemcsés anyagú oszlopok alakulnak ki.' },
  { s: 'Cementbesajtolással a finom homok és az iszap is jól injektálható.', t: false, e: 'Csak 0,8–1 mm-nél durvább homok-kavics, illetve repedezett kötött talaj.' },
  { s: 'Cementbesajtolásnál a perforált csöveket 50–100 cm-enként helyezik el, 7–10 atm nyomással.', t: true, e: 'Ezeken át juttatják le a cementtejet vagy a cement+homok habarcsot, csőfelhúzás közben alulról felfelé.' },
  { s: 'Cementbesajtolásnál felülről lefelé haladva injektálnak.', t: false, e: 'Csőfelhúzás közben alulról felfelé.' },
  { s: 'A kétkomponensű műanyag injektálás agyagban is hatékony.', t: false, e: 'Homokos és iszapos talajban – agyagban nem alkalmazható hatékonyan.' },
  { s: 'A kétkomponensű injektálóanyag duzzad, és a talajjal kemény geokompozitot alkot.', t: true, e: 'Növeli a kohéziót és csökkenti a pórustérfogatot.' },
  { s: 'Utólagos injektálásnál az épület mozgását lézeres méréssel figyelik.', t: true, e: 'A 7–10 bar-os besajtolás közben lézeres szintezővel követik az épület mozgását – emelkedésnél leállnak.' },
  { s: 'A tömegstabilizáció keverőfeje egy lépésben kb. 1,2 m² felületet fog át.', t: true, e: 'Az 1,5 m széles, Ø 0,95 m-es keverőfej egy lépésben ~1,2 m²-t fog át.' },
  { s: 'Toldószárral a tömegstabilizáció akár 7 m mélységig is elérhet.', t: true, e: '3–5 m-es keverőszár + 2 m toldás.' },
  { s: 'A stabilizált felület azonnal eléri végleges teherbírását.', t: false, e: 'Nem rögtön – szükség esetén teherelosztó réteget (geotextília, georács, szemcsés anyag) készítenek.' },
  { s: 'Az előterheléssel a süllyedés egy részét az építés előtt „kikényszerítjük”.', t: true, e: 'Utána egy előzetesen komprimált réteg jóval kisebb fajlagos összenyomódásával kell számolni.' },
  { s: 'Mexikóvárosban a kavicsot egyszerre távolítják el, mielőtt az építés folytatódna.', t: false, e: 'Olyan ütemben, ahogyan az építmény súlya nő.' },
  { s: 'Süllyedésre gyanús területen lehetőleg statikailag határozatlan szerkezetet tervezzünk.', t: false, e: 'Határozottat – csuklós kapcsolatokkal nem alakul ki többlet-igénybevétel.' },
  { s: 'Hosszú, eltérően terhelt épületrészeket süllyedési hézaggal célszerű elválasztani.', t: true, e: 'A hődilatáció miatt eleve szükséges.' },
  { s: 'Nagy süllyedésű építményeknél a közművek bekötését ovális nyílással, hajlékony vezetékkel és védőcsővel oldják meg.', t: true, e: 'Így a vezeték követheti a mozgást.' },
  { s: 'A süllyedésre érzékeny szerkezeti részeket lehetőleg minél korábban építjük meg.', t: false, e: 'Minél később.' },
  { s: 'A mélyalapozás sok esetben a legegyszerűbb, leggyorsabb és legolcsóbb megoldás.', t: true, e: 'Ha a síkalapozás mellett meg nem engedhető süllyedések adódnak.' },
];
window.addEventListener('DOMContentLoaded', () => {
  Object.keys(Q).forEach(k => window.QUIZ(document.getElementById(k), Q[k]));
  window.TF(document.getElementById('tfGrid'), TFI, document.getElementById('tfScore'));
});
})();
