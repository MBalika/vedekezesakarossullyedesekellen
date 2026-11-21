# Talajcsere-videó (tj1) javítása, 2026-11-21 – a felhasználó kérései:
#  1. „puha agyag” helyett „kompresszibilis altalaj (laza feltöltés, puha iszap, agyag…)” – a nyitócímkén és a metszet rétegnevében;
#  2. nincs geotextília a gödör alján: a lap és a tekercs nem jelenik meg, a címke és a felirat törölve, a lépéssáv
#     „Elválasztó réteg” lépése kimarad (a kiemelés 26. ütemig tart), a zárócím alcíme „kiemelés · beépítés · tömörítés”;
#  3. vibrálás a lábazatnál: az összehasonlító alaptestek (coldFoot, leftDone) 0,4 m-rel a terep fölé és 20 cm-rel a fal
#     síkja elé nyúltak; a mozgó (süllyedő, rezgő) testen a zúzottkő-textúra szikrázott. Most a terepszint alatt 1,2 cm-rel
#     végződnek, a ház lábazata ül rajtuk.
# Használat: python3 tj1_javitas_2026-11-21.py <tj1.html> hu|en   (helyben ír; ismételt futtatás hibát jelez)
import sys
f, lang = sys.argv[1], sys.argv[2]
s = open(f, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    c = s.count(a); assert c == n, (a[:80], c); s = s.replace(a, b)
# --- közös kód
rep('MA.hF+.6', '-MA.base-.012', 4)
rep('N.geo.visible=i>=Hr[0]', 'N.geo.visible=!1')
rep('N.geoRoll.visible=i>=Hr[0]&&o<.999', 'N.geoRoll.visible=!1')
T = {
 'hu': dict(
   label_old='"PUHA AGYAG",Fe(A,tA(1.5),tA(3.9),.3,.2),{dx:160,dy:40,color:vA.red,sub:"\\xF6sszenyom\\xF3dik"}',
   label_new='"KOMPRESSZIBILIS ALTALAJ",Fe(A,tA(1.5),tA(3.9),.3,.2),{dx:160,dy:40,color:vA.red,sub:"laza felt\\xF6lt\\xE9s, puha iszap, agyag\\u2026"}',
   layer_old='{key:"softclay",name:"Puha agyag",', layer_new='{key:"softclay",name:"Kompresszibilis altalaj",',
   geo_label='if(A>tA(24)&&A<tA(26)){let a=t(.5,Pt+.02,-3);a.ok&&i.label(a.x,a.y,"GEOTEXT\\xCDLIA",Fe(A,tA(24,1),tA(26),.3,.3),{dx:160,dy:-60})}',
   cap_old='[tA(20,.5),tA(24),"",["Oldalt *kisz\\xE9les\\xEDtj\\xFCk*, elsz\\xE1ll\\xEDtjuk","Csak *talajv\\xEDz felett*!"]],[tA(24,.3),tA(26),"",["Sz\\xFCks\\xE9g eset\\xE9n *geotext\\xEDlia*"]],',
   cap_new='[tA(20,.5),tA(26),"",["Oldalt *kisz\\xE9les\\xEDtj\\xFCk*, elsz\\xE1ll\\xEDtjuk","Csak *talajv\\xEDz felett*!"]],',
   steps_old='_0=[{n:1,name:"Kiemel\\xE9s",t0:fA(16),t1:fA(24)},{n:2,name:"Elv\\xE1laszt\\xF3 r\\xE9teg",t0:fA(24),t1:fA(26)},{n:3,name:"R\\xE9tegenk\\xE9nt t\\xF6m\\xF6r\\xEDtve",t0:fA(26),t1:fA(35)},{n:4,name:"Alaptest",t0:fA(35),t1:fA(41)}]',
   steps_new='_0=[{n:1,name:"Kiemel\\xE9s",t0:fA(16),t1:fA(26)},{n:2,name:"R\\xE9tegenk\\xE9nt t\\xF6m\\xF6r\\xEDtve",t0:fA(26),t1:fA(35)},{n:3,name:"Alaptest",t0:fA(35),t1:fA(41)}]',
   slam_old='sub:"kiemel\\xE9s \\xB7 elv\\xE1laszt\\xE1s \\xB7 t\\xF6m\\xF6r\\xEDt\\xE9s"', slam_new='sub:"kiemel\\xE9s \\xB7 be\\xE9p\\xEDt\\xE9s \\xB7 t\\xF6m\\xF6r\\xEDt\\xE9s"'),
 'en': dict(
   label_old='"SOFT CLAY",Fe(A,tA(1.5),tA(3.9),.3,.2),{dx:160,dy:40,color:vA.red,sub:"compresses"}',
   label_new='"COMPRESSIBLE SUBSOIL",Fe(A,tA(1.5),tA(3.9),.3,.2),{dx:160,dy:40,color:vA.red,sub:"loose fill, soft silt, clay\\u2026"}',
   layer_old=None, layer_new=None,
   geo_label='if(A>tA(24)&&A<tA(26)){let a=t(.5,Pt+.02,-3);a.ok&&i.label(a.x,a.y,"GEOTEXTILE",Fe(A,tA(24,1),tA(26),.3,.3),{dx:160,dy:-60})}',
   cap_old=None, cap_new=None,
   steps_old='_0=[{n:1,name:"Excavation",t0:fA(16),t1:fA(24)},{n:2,name:"Separation layer",t0:fA(24),t1:fA(26)},{n:3,name:"Compacted in layers",t0:fA(26),t1:fA(35)},{n:4,name:"Footing",t0:fA(35),t1:fA(41)}]',
   steps_new='_0=[{n:1,name:"Excavation",t0:fA(16),t1:fA(26)},{n:2,name:"Compacted in layers",t0:fA(26),t1:fA(35)},{n:3,name:"Footing",t0:fA(35),t1:fA(41)}]',
   slam_old='sub:"excavation \\xB7 separation \\xB7 compaction"', slam_new='sub:"excavation \\xB7 placement \\xB7 compaction"'),
}[lang]
if lang == 'en':   # az angol fájlban a karakterláncok egy része valódi Unicode-dal van
    import re
    m = re.search(r'\{key:"softclay",name:"([^"]*)",', s); T['layer_old'] = m.group(0); T['layer_new'] = '{key:"softclay",name:"Compressible subsoil",'
    m = re.search(r'\[tA\(20,\.5\),tA\(24\),"",\[[^\]]*\]\],\[tA\(24,\.3\),tA\(26\),"",\[[^\]]*\]\],', s); T['cap_old'] = m.group(0)
    T['cap_new'] = re.sub(r'^\[tA\(20,\.5\),tA\(24\)', '[tA(20,.5),tA(26)', m.group(0)[:m.group(0).index('],[tA(24,.3)') + 2])
    for k in ('slam_old', 'slam_new'):
        if T[k] not in s and k == 'slam_old': T['slam_old'] = T['slam_old'].replace('\\xB7', '·'); T['slam_new'] = T['slam_new'].replace('\\xB7', '·')
rep(T['label_old'], T['label_new'])
rep(T['layer_old'], T['layer_new'])
rep(T['geo_label'], '')
rep(T['cap_old'], T['cap_new'])
rep(T['steps_old'], T['steps_new'])
rep(T['slam_old'], T['slam_new'])
open(f, 'w', encoding='utf-8').write(s)
print('kész:', f)
