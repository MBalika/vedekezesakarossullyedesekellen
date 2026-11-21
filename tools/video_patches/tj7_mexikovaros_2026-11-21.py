# Előterhelés-videó (tj7), mexikóvárosi rész – 2026-11-21, a felhasználó által adott leírás alapján:
#   José A. Cuevas, Lotería Nacional („El Moro”), Mexikóváros, 1930-as évek.
#   - kompenzált alapozás: annyi talajt emeltek ki, amennyinek a súlyát a kész épület nagyjából visszapótolja;
#   - a kiemelés után a fenék megemelkedett (max. 127 cm mért emelkedés);
#   - a merev alapszerkezetre ballasztot (a kivitelezésről szóló beszámoló szerint betontömböket, az eredeti terv szerint
#     kavicsot) raktak, a tervezett épületsúlynak megfelelő terhelésig – ez visszaterhelte a talajt;
#   - a felszerkezet építése közben a ballasztot napról napra a beépített súllyal egyezően csökkentették: az összsúly közel
#     állandó (G_alap + G_felszerkezet(t) + G_ballaszt(t) ≈ G_cél);
#   - NEM emeleti födémek kavicsfeltöltése; és nem állítható, hogy utána semmilyen süllyedés nincs.
# Változások: feliratok, lépéssáv, grafikonfeliratok; a kavicshalom helyett betontömbökből rakott ballaszt, amely rétegenként
# épül fel és rétegenként fogy (felülről) az épület növekedésével.
# Használat: python3 tj7_mexikovaros_2026-11-21.py <tj7.html> hu|en   (helyben ír)
import sys, re
f, lang = sys.argv[1], sys.argv[2]
s = open(f, encoding='utf-8').read()

def esc(t):   # a magyar fájl a nem ASCII karaktereket \xHH / \uhhhh alakban tárolja
    out = []
    for ch in t:
        o = ord(ch)
        out.append(ch if o < 128 else ('\\x%02X' % o if o < 256 else '\\u%04x' % o))
    return ''.join(out)

def rep(a, b, n=1):
    global s
    for A, B in ((a, b), (esc(a), esc(b))):
        c = s.count(A)
        if c:
            assert c == n, (a[:70], c); s = s.replace(A, B); return
    raise AssertionError('nincs találat: ' + a[:90])

# --- ballaszt: betontömbök a kavicshalom helyett (közös kód)
old_cx = ('function Cx(i){let A=new Dt;A.moveTo(-4.6,0),A.lineTo(4.6,0),A.lineTo(2.6,1),A.lineTo(-2.6,1),A.lineTo(-4.6,0);'
          'let e=new yi(A,{depth:9,bevelEnabled:!1});e.translate(0,0,-9.5);let t=new fA(e,Mr(i.grav,1.4,14209218));'
          'return t.castShadow=!0,t.receiveShadow=!0,t}')
new_cx = ('function Cx(i){let A=new Ae,e=ne(9407364,{roughness:.92}),t=[],x=[-3.55,-2.35,-.6,.6,2.35,3.55],z=[-8.55,-7.2,-5.85,-4.15,-2.8,-1.45];'
          'for(let y=0;y<4;y++)for(let a of x)for(let o of z){let r=ae(1.14,.68,1.29,e,a,y*.72+.34,o);t.push(r),A.add(r)}'
          'return A.userData.set=a=>{let o=Math.round(Math.max(0,Math.min(1,a))*t.length);t.forEach((r,c)=>{r.visible=c<o})},A}')
rep(old_cx, new_cx)
rep('BA.heap.visible=r>.02,BA.heap.scale.y=Math.max(.001,r),', 'BA.heap.visible=r>.02,BA.heap.userData.set(A.L.grav),')

T = {
 'hu': [
  ('{n:1,name:"Alaplemez",', '{n:1,name:"Alapszerkezet",'),
  ('{n:2,name:"Kavicsterhelés",', '{n:2,name:"Ballaszt",'),
  ('{n:4,name:"Építés ↔ kavics el",', '{n:4,name:"Építés ↔ ballaszt el",'),
  ('[eA(14,.5),eA(16),"Az elv",["A süllyedés *előre*, terheléssel"]]',
   '[eA(14,.5),eA(16),"Lotería Nacional (El Moro)",["*Kompenzált* alapozás: a kiemelt talaj","súlya ≈ a kész épület súlya"]]'),
  ('[eA(16,.3),eA(19),"",["Az *alaplemezt* kavics terheli,","a kész épület *súlyával*"]]',
   '[eA(16,.3),eA(19),"",["Kiemelés után a fenék *127 cm-ig* emelkedett:","*ballaszt* terheli vissza az épület súlyáig"]]'),
  ('[eA(19,.3),eA(23),"",["Lezajlik a süllyedés *nagy része*"]]',
   '[eA(19,.3),eA(23),"",["A talaj *visszakapja* korábbi terhét,","az alakváltozás *az építés előtt* zajlik"]]'),
  ('[eA(23,.3),eA(27),"",["A kavicsot az épület *növekedésével*","arányosan hordják el"]]',
   '[eA(23,.3),eA(27),"",["Ahogy az épület *nő*, a ballasztot","*napról napra* ugyanannyival csökkentik"]]'),
  ('[eA(27,.3),eA(30),"",["A teher *nem változik*: nincs új süllyedés"]]',
   '[eA(27,.3),eA(30),"",["Az összsúly *közel állandó*:","az építés *nem ad* új terhet a talajra"]]'),
  ('[eA(30,1),eA(36),"Összevetés",["Nélküle: süllyedés a *kész épület* alatt,","vele: *az építés előtt*"]]',
   '[eA(30,1),eA(36),"Összevetés",["Nélküle: alakváltozás a *készülő épület* alatt,","vele: *az építés előtt*"]]'),
  ('[eA(36,.5),eA(42),"Miért működik?",["Mint egy *geológiai előterhelés*:","újraterheléskor *kicsi* összenyomódás"]]',
   '[eA(36,.5),eA(42),"Miért működik?",["A kiemelés *tehermentesít*, a ballaszt *újraterhel*:","újraterheléskor *kicsi* az összenyomódás"]]'),
  ('"TEHER AZ ALAPLEMEZEN"', '"TEHER AZ ALAPSZERKEZETEN"'),
  ('fillText("KAVICS",', 'fillText("BALLASZT",'),
  ('{k:"Kavics",', '{k:"Ballaszt",'),
  ('"ELŐTERHELÉS NÉLKÜL"', '"BALLASZT NÉLKÜL"'),
  ('"ELŐTERHELÉSSEL"', '"BALLASZTTAL"'),
  ('"ELŐTERHELÉS – nagy összenyomódás",B(.2),E(.28)', '"KORÁBBI TEHER – nagy összenyomódás",B(.38),E(.22)'),
  ('"tehermentesítés",B(.28),E(.58)', '"kiemelés",B(.28),E(.58)'),
 ],
 'en': [
  ('{n:1,name:"Base slab",', '{n:1,name:"Substructure",'),
  ('{n:2,name:"Gravel surcharge",', '{n:2,name:"Ballast",'),
  ('{n:4,name:"Building ↔ gravel off",', '{n:4,name:"Building ↔ ballast off",'),
  ('[eA(14,.5),eA(16),"The principle",["Settlement *in advance*, by loading"]]',
   '[eA(14,.5),eA(16),"Lotería Nacional (El Moro)",["*Compensated* foundation: the excavated soil","weighs about as much as the building"]]'),
  ('[eA(16,.3),eA(19),"",["Gravel loads the *base slab*,","as *heavy* as the finished building"]]',
   '[eA(16,.3),eA(19),"",["After excavation the base *rose up to 127 cm*:","*ballast* reloads it to the building\'s weight"]]'),
  ('[eA(19,.3),eA(23),"",["*Most* of the settlement occurs"]]',
   '[eA(19,.3),eA(23),"",["The soil *gets its former load back*,","deformation happens *before construction*"]]'),
  ('[eA(23,.3),eA(27),"",["Gravel comes off as the building *grows*,","at the same rate"]]',
   '[eA(23,.3),eA(27),"",["As the building *grows*, the ballast is cut","*day by day* by the same weight"]]'),
  ('[eA(27,.3),eA(30),"",["The load *does not change*: no new settlement"]]',
   '[eA(27,.3),eA(30),"",["The total weight stays *nearly constant*:","construction adds *no new load*"]]'),
  ('[eA(30,1),eA(36),"Comparison",["Without it: settling *after completion*,","with it: *before construction*"]]',
   '[eA(30,1),eA(36),"Comparison",["Without it: deformation *under the rising building*,","with it: *before construction*"]]'),
  ('[eA(36,.5),eA(42),"Why does it work?",["Like *geological preloading*:","on reloading, *little* compression"]]',
   '[eA(36,.5),eA(42),"Why does it work?",["Excavation *unloads*, the ballast *reloads*:","on reloading, *little* compression"]]'),
  ('"LOAD ON THE BASE SLAB"', '"LOAD ON THE SUBSTRUCTURE"'),
  ('fillText("GRAVEL",', 'fillText("BALLAST",'),
  ('{k:"Gravel",', '{k:"Ballast",'),
  ('"WITHOUT PRELOADING"', '"WITHOUT BALLAST"'),
  ('"WITH PRELOADING"', '"WITH BALLAST"'),
  ('"PRELOADING – large compression",B(.2),E(.28)', '"EARLIER LOAD – large compression",B(.38),E(.22)'),
  ('"unloading",B(.28),E(.58)', '"excavation",B(.28),E(.58)'),
 ]}[lang]
for a, b in T:
    rep(a, b)
open(f, 'w', encoding='utf-8').write(s)
print('kész:', f)
