"""A widgetek alapértékeinek független újraszámolása (nem az app kódja) – a kiírt számoknak ezekkel kell egyezniük."""
from math import tan, radians, sqrt, log10
print('talajcsere: σ1 =', 260 / 1.0, 'kPa; B+2v·tgϑ =', round(1 + 2 * .6 * tan(radians(35)), 2), 'm; σ2 =', round(260 / (1 + 2 * .6 * tan(radians(35))) + 20 * .6), 'kPa; kiszélesítés =', round(.6 * tan(radians(35)), 2), 'm')
a = .907 * (.8 / 2) ** 2; print('kavicscölöp: a_s =', round(a * 100, 1), '%; s/s0 =', round(100 / (1 + a * 2.5)), '%; De =', 1.05 * 2, 'm')
print('dinamikus tömörítés: d =', round(.5 * sqrt(15 * 12), 1), 'm; E =', round(15 * 9.81 * 12 / 1000, 1), 'MJ; 40 t, 40 m: d =', .5 * sqrt(1600), 'm')
print('pince (6 szint + 1 pince): q =', 12 * 7 + 15, 'kPa; γ·D =', round(19 * 3.8), 'kPa; kompenzáltság =', round(19 * 3.8 / 99 * 100), '%')
f = 6 / 2.2 * 1000; print('előterhelés: s =', round(f * .45 * log10(140 / 60)), 'mm; előterhelés alatt', round(f * .45 * log10(160 / 60)), 'mm; utána', round(f * .06 * log10(140 / 60)), 'mm')
print('tömegstabilizáció: V =', 1500 * 3, 'm³;', round(4500 / .65 / 60), 'óra ≈', round(4500 / .65 / 60 / 8, 1), 'műszak; kötőanyag', 4500 * 100 / 1000, 't')
W = 2 * 2 * (.6 * 25 + .4 * 20); q = (1200 + W) / 4; qn = q - 18; print('3D szimulátor (A profil, Jáky): W =', W, 'kN; q =', q, 'kPa; q0 =', qn, 'kPa; s =', round(qn * 2 / 2 / 3.0, 1), 'mm')
