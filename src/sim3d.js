/* ===== 3D süllyedés-szimulátor: kisebb talpnyomás, mélyebb alapsík ===== */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const U = window.U; const { $, $$, clamp, lerp, fmt, S, H, css } = U;

// ---------------- talajprofilok ----------------
export const PROFILES = {
  A: { key: 'A', name: 'Puha agyag felül, homok alul', note: 'A jegyzet 22. ábrája, A eset', layers: [
    { n: 'Puha agyag', top: 0, bot: 3.5, g: 18, E: 3.0, tex: 'clay', c: '#8c735f' },
    { n: 'Tömör homok', top: 3.5, bot: 99, g: 20, E: 30, tex: 'sand', c: '#d8b56b' }] },
  B: { key: 'B', name: 'Homok felül, puha agyag alul', note: 'A jegyzet 22. ábrája, B eset', layers: [
    { n: 'Tömör homok', top: 0, bot: 3.0, g: 19, E: 30, tex: 'sand', c: '#d8b56b' },
    { n: 'Puha agyag', top: 3.0, bot: 99, g: 18, E: 3.0, tex: 'clay', c: '#8c735f' }] },
  C: { key: 'C', name: 'Homogén közepes agyag', note: 'összehasonlító eset', layers: [
    { n: 'Közepes agyag', top: 0, bot: 99, g: 18.5, E: 5.0, tex: 'clay2', c: '#9b8470' }] },
  D: { key: 'D', name: 'Puha réteg, 2,6 m-től kavics', note: 'mélyebb alapsík esete (23. ábra)', layers: [
    { n: 'Puha iszapos agyag', top: 0, bot: 2.6, g: 18, E: 2.5, tex: 'silt', c: '#8a7d6b' },
    { n: 'Homokos kavics', top: 2.6, bot: 99, g: 21, E: 60, tex: 'grav', c: '#b9a48a' }] },
};
const HF = 0.6, GC = 25, GB = 20; // alaptest vastagság, beton, visszatöltés
function Fc(a, b, z) { // előjeles sarokponti hatástényező (Steinbrenner/Newmark)
  if (a === 0 || b === 0) return 0; const sg = Math.sign(a) * Math.sign(b); a = Math.abs(a); b = Math.abs(b);
  const m = a / z, n = b / z, m2 = m * m, n2 = n * n, V = m2 + n2 + 1, V1 = m2 * n2, r = Math.sqrt(V);
  return sg * (2 * m * n * r / (V + V1) * (V + 1) / V + Math.atan2(2 * m * n * r, V - V1)) / (4 * Math.PI);
}
export function rectS(q, x1, x2, y1, y2, z) { if (z <= 1e-4) z = 1e-4; return q * (Fc(x2, y2, z) - Fc(x1, y2, z) - Fc(x2, y1, z) + Fc(x1, y1, z)); }
const layerAt = (P, d) => P.layers.find(l => d >= l.top && d < l.bot) || P.layers[P.layers.length - 1];
function sig0(P, d) { let s = 0; for (const l of P.layers) { if (d <= l.top) break; s += l.g * (Math.min(d, l.bot) - l.top); } return s; }
export function calc({ P, N, B, D, method }, detail = true) {
  const W = B * B * (HF * GC + Math.max(0, D - HF) * GB); const q = (N + W) / (B * B); const qn = q - sig0(P, D);
  const dz = 0.05; let s = 0, m0 = null; const contrib = {}; const prof = []; const cum = [];
  for (let z = 0; z < 30; z += dz) {
    const zm = z + dz / 2, d = D + zm; let ds;
    if (method === 'J') { const mj = B; if (z >= mj) { m0 = mj; break; } ds = qn * (1 - zm / mj); }
    else { ds = rectS(qn, -B / 2, B / 2, -B / 2, B / 2, zm); if (ds < 0.2 * sig0(P, d)) { m0 = z; break; } }
    const L = layerAt(P, d); const ss = ds * dz / L.E; s += ss; cum.push(s); contrib[L.n] = (contrib[L.n] || 0) + ss;
    if (detail && Math.round(z / dz) % 2 === 0) prof.push({ z, ds, crit: 0.2 * sig0(P, d), s0: sig0(P, d) });
  }
  if (m0 === null) m0 = 30;
  if (detail) for (let z = m0; z < Math.max(m0 + 2, B * 2.2); z += 0.1) prof.push({ z, ds: method === 'J' ? 0 : rectS(qn, -B / 2, B / 2, -B / 2, B / 2, z + 0.01), crit: 0.2 * sig0(P, D + z), s0: sig0(P, D + z), out: true });
  return { q, qn, W, m0, s, contrib, prof, cum, P, N, B, D, method };
}
const cost = (B, D) => 100 * (B * B * HF + (B + 1) * (B + 1) * D * 0.15) / (2 * 2 * HF + 9 * 1 * 0.15);

// ---------------- állapot ----------------
const st = { pk: 'A', N: 1200, B: 2.0, D: 1.0, method: 'J', ex: 10, bulb: true, view: '3d', curve: 'B' };
let base = null; const best = {};
const P = () => PROFILES[st.pk];
let R = null; // aktuális eredmény

// ---------------- procedurális textúrák ----------------
function noiseTex(kind) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const pal = { clay: ['#8c735f', '#7d6553', '#9a806b', '#6f5949'], clay2: ['#9b8470', '#8a7360', '#a8917c', '#7f6957'], sand: ['#d8b56b', '#cfa95c', '#e4c37e', '#c49d52'], silt: ['#8a7d6b', '#7c705f', '#968a77', '#6f6454'], grav: ['#b9a48a', '#a99377', '#cbb79d', '#8f7c66'] }[kind];
  g.fillStyle = pal[0]; g.fillRect(0, 0, 256, 256);
  let seed = kind.length * 977; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const n = kind === 'grav' ? 380 : kind === 'sand' ? 2600 : 1500;
  for (let i = 0; i < n; i++) { g.fillStyle = pal[1 + Math.floor(rnd() * 3)]; const r = kind === 'grav' ? 3 + rnd() * 9 : kind === 'sand' ? 0.8 + rnd() * 1.6 : 1 + rnd() * 2.5; g.globalAlpha = .7; const x0 = rnd() * 256, y0 = rnd() * 256, e = .6 + rnd() * .4, rot = rnd() * 3;
    for (const dx of [-256, 0, 256]) for (const dy of [-256, 0, 256]) { const x = x0 + dx, y = y0 + dy; if (x < -r - 1 || x > 256 + r + 1 || y < -r - 1 || y > 256 + r + 1) continue; g.beginPath(); if (kind === 'grav') g.ellipse(x, y, r, r * e, rot, 0, 7); else g.arc(x, y, r, 0, 7); g.fill(); } }
  if (kind.startsWith('clay') || kind === 'silt') { g.globalAlpha = .25; g.strokeStyle = '#4e3f33'; for (let i = 0; i < 14; i++) { g.beginPath(); const y = rnd() * 256; g.moveTo(0, y); for (let x = 0; x <= 256; x += 8) g.lineTo(x, y + Math.sin(x / 256 * Math.PI * 4 + i) * 3); g.stroke(); } }
  g.globalAlpha = 1; const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.userData = { canvas: c }; return t;
}

// ---------------- hőtérkép (metszet) ----------------
const HX0 = -7, HX1 = 7, HD = 10, HW = 224, HH = 160;
const CMAP = [[0, [43, 109, 143]], [.25, [57, 194, 165]], [.5, [229, 174, 71]], [.75, [240, 122, 92]], [1, [181, 48, 42]]];
function cm(u) { u = clamp(u, 0, 1); for (let i = 0; i < CMAP.length - 1; i++) if (u <= CMAP[i + 1][0]) { const k = (u - CMAP[i][0]) / (CMAP[i + 1][0] - CMAP[i][0]); return CMAP[i][1].map((v, j) => Math.round(lerp(v, CMAP[i + 1][1][j], k))); } return CMAP[4][1]; }
let FIELD = null;
function computeField() {
  const { B, D } = st; const f = new Float32Array(HW * HH);
  for (let j = 0; j < HH; j++) { const d = (j + .5) / HH * HD; const z = d - D; for (let i = 0; i < HW; i++) { const x = HX0 + (i + .5) / HW * (HX1 - HX0); f[j * HW + i] = z <= 0 ? -1 : rectS(1, -B / 2 - x, B / 2 - x, -B / 2, B / 2, z); } }
  FIELD = f; return f;
}
function drawHeat(canvas, alphaMode) {
  // színek kis felbontásban, simítva felnagyítva; izovonalak "marching squares"-szel, élsimítva
  const f = FIELD, g = canvas.getContext('2d'); const sx = canvas.width / HW, sy = canvas.height / HH;
  const tmp = drawHeat.tmp || (drawHeat.tmp = document.createElement('canvas')); tmp.width = HW; tmp.height = HH; const tg = tmp.getContext('2d'); const id = tg.createImageData(HW, HH);
  for (let k = 0; k < HW * HH; k++) { const v = f[k], o = k * 4; if (v < 0) { id.data[o + 3] = 0; continue; } const c = cm(Math.pow(v, 0.6)); const a = alphaMode ? clamp(0.1 + v * 1.7, 0, 0.88) : clamp(0.25 + v * 1.4, 0, 0.92); id.data[o] = c[0]; id.data[o + 1] = c[1]; id.data[o + 2] = c[2]; id.data[o + 3] = Math.round(a * 255); }
  tg.putImageData(id, 0, 0); g.clearRect(0, 0, canvas.width, canvas.height); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(tmp, 0, 0, canvas.width, canvas.height);
  g.lineWidth = Math.max(1.2, sx * 0.75); g.lineJoin = g.lineCap = 'round';
  for (const L of [0.1, 0.2, 0.4, 0.6, 0.8]) { g.beginPath(); g.strokeStyle = L === 0.2 ? 'rgba(255,240,200,.95)' : 'rgba(255,255,255,.72)';
    for (let j = 0; j < HH - 1; j++) for (let i = 0; i < HW - 1; i++) {
      const a = f[j * HW + i], b = f[j * HW + i + 1], c = f[(j + 1) * HW + i + 1], d = f[(j + 1) * HW + i]; if (a < 0 || b < 0 || c < 0 || d < 0) continue;
      const pts = []; const e = (v1, v2, x1, y1, x2, y2) => { if ((v1 - L) * (v2 - L) < 0) { const t = (L - v1) / (v2 - v1); pts.push([(x1 + (x2 - x1) * t + .5) * sx, (y1 + (y2 - y1) * t + .5) * sy]); } };
      e(a, b, i, j, i + 1, j); e(b, c, i + 1, j, i + 1, j + 1); e(c, d, i + 1, j + 1, i, j + 1); e(d, a, i, j + 1, i, j);
      if (pts.length >= 2) { g.moveTo(pts[0][0], pts[0][1]); g.lineTo(pts[1][0], pts[1][1]); if (pts.length === 4) { g.moveTo(pts[2][0], pts[2][1]); g.lineTo(pts[3][0], pts[3][1]); } } }
    g.stroke(); }
}
function isoProfile(level) { // [r, depth-alatt-alapsík] pontok a forgatott burához
  const { B } = st; const pts = []; const dz = 0.08;
  for (let z = 0.02; z < 14; z += dz) { if (rectS(1, -B / 2, B / 2, -B / 2, B / 2, z) < level) { pts.push([0, z]); break; } let lo = 0, hi = B * 3; for (let k = 0; k < 18; k++) { const m = (lo + hi) / 2; if (rectS(1, -B / 2 - m, B / 2 - m, -B / 2, B / 2, z) >= level) lo = m; else hi = m; } pts.push([lo, z]); }
  return pts;
}

// ---------------- 3D jelenet ----------------
let three = null;
const SEG = { x: 56, z: 28 };
function init3D(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.prepend(renderer.domElement);
  const scene = new THREE.Scene(); const cam = new THREE.PerspectiveCamera(36, 1.4, 0.1, 200); cam.position.set(4.6, 2.5, 13.4);
  const ctl = new OrbitControls(cam, renderer.domElement); ctl.target.set(0, -2.4, 0); ctl.enableDamping = true; ctl.dampingFactor = 0.09; ctl.minDistance = 7; ctl.maxDistance = 30; ctl.maxPolarAngle = Math.PI * 0.6; ctl.minAzimuthAngle = -Math.PI * 0.42; ctl.maxAzimuthAngle = Math.PI * 0.42; ctl.enablePan = false; ctl.update();
  scene.add(new THREE.HemisphereLight(0xf7f3ea, 0x5a4c40, 1.25)); const sun = new THREE.DirectionalLight(0xffffff, 1.35); sun.position.set(5, 12, 10); scene.add(sun);
  const grp = { soil: new THREE.Group(), ghost: new THREE.Group(), fnd: new THREE.Group(), bulb: new THREE.Group() }; Object.values(grp).forEach(g => scene.add(g));
  const texs = {}; ['clay', 'clay2', 'sand', 'silt', 'grav'].forEach(k => texs[k] = noiseTex(k));
  const grass = new THREE.MeshStandardMaterial({ color: 0x86a062, roughness: 1 });
  // hőtérkép a metszetsíkon (deformálódik a talajjal)
  const hc = document.createElement('canvas'); hc.width = HW * 4; hc.height = HH * 4; const htex = new THREE.CanvasTexture(hc); htex.colorSpace = THREE.SRGBColorSpace; htex.minFilter = THREE.LinearFilter;
  const hgeo = new THREE.PlaneGeometry(HX1 - HX0, HD, 70, 50); hgeo.translate(0, -HD / 2, 0.015); hgeo.userData.base = hgeo.attributes.position.array.slice();
  const heat = new THREE.Mesh(hgeo, new THREE.MeshBasicMaterial({ map: htex, transparent: true, depthWrite: false })); heat.renderOrder = 2; scene.add(heat);
  // alaptest
  const conc = new THREE.MeshStandardMaterial({ color: 0xc9cdd0, roughness: .7 });
  const foot = new THREE.Mesh(new THREE.BoxGeometry(1, HF, 1), conc); const col = new THREE.Mesh(new THREE.BoxGeometry(.45, 1, .45), conc);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xb8ab98, transparent: true, opacity: .55, depthWrite: false })); back.renderOrder = 3;
  const arrowM = new THREE.MeshStandardMaterial({ color: 0xd4553a, roughness: .5 }); const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 1, 12), arrowM); const head = new THREE.Mesh(new THREE.ConeGeometry(.22, .5, 18), arrowM); head.rotation.x = Math.PI;
  grp.fnd.add(foot, col, back, shaft, head);
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .28 });
  // a kivágott elülső tömb körvonala
  // határmélység: piros csík a metszetsíkon és az oldallapon + halvány sík elöl
  const redM = new THREE.MeshBasicMaterial({ color: 0xe0482e }); const m0 = new THREE.Group();
  const l1 = new THREE.Mesh(new THREE.BoxGeometry(14, .07, .07), redM); l1.position.set(0, 0, 0.04); const l2 = new THREE.Mesh(new THREE.BoxGeometry(.07, .07, 7), redM); l2.position.set(7.04, 0, -3.5);
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(14, 7), new THREE.MeshBasicMaterial({ color: 0xe0482e, transparent: true, opacity: .07, side: THREE.DoubleSide, depthWrite: false })); pl.rotation.x = -Math.PI / 2; pl.position.set(0, 0, 3.5);
  m0.add(l1, l2, pl); scene.add(m0);
  three = { renderer, scene, cam, ctl, grp, texs, grass, hc, htex, heat, foot, col, back, shaft, head, m0, edgeMat, host, need: true, sDisp: 0, sTarget: 0 };
  ctl.addEventListener('change', () => three.need = true);
  const ro = new ResizeObserver(() => { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = clamp(52 - 11 * cam.aspect, 33, 46); cam.updateProjectionMatrix(); three.need = true; }); ro.observe(host);
  const loop = () => { requestAnimationFrame(loop); if (st.view !== '3d') return; ctl.update(); const dS = three.sTarget - three.sDisp; if (Math.abs(dS) > 0.05) { three.sDisp += dS * 0.16; applySettle(); three.need = true; } else if (dS !== 0) { three.sDisp = three.sTarget; applySettle(); three.need = true; } if (three.need) { renderer.render(scene, cam); labels3D(); three.need = false; } };
  loop();
}
function buildSoil3D() {
  const T = three; while (T.grp.soil.children.length) { const c = T.grp.soil.children.pop(); c.geometry.dispose(); }
  P().layers.forEach((l, i) => { const top = l.top, bot = Math.min(l.bot, HD), h = bot - top; if (h <= 0) return;
    const tex = T.texs[l.tex].clone(); tex.needsUpdate = true; tex.repeat.set(2.4, Math.max(.6, h / 3)); const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 1 });
    const geo = new THREE.BoxGeometry(14, h, 7, SEG.x, Math.max(2, Math.ceil(h * 3)), SEG.z); geo.translate(0, -(top + bot) / 2, -3.5); geo.userData.base = geo.attributes.position.array.slice();
    const mats = [mat, mat, i === 0 ? T.grass : mat, mat, mat, mat];
    const b = new THREE.Mesh(geo, mats); T.grp.soil.add(b); });
  applySettle(); T.need = true;
}
function buildBulbs() {
  const T = three; while (T.grp.bulb.children.length) { const c = T.grp.bulb.children.pop(); c.geometry.dispose(); }
  if (!st.bulb) { T.need = true; return; }
  [[0.2, 0xe5ae47, .28], [0.5, 0xe0482e, .38]].forEach(([lv, colr, op]) => { const pr = isoProfile(lv); const pts = pr.map(([r, z]) => new THREE.Vector2(Math.max(0.001, r), -st.D - z)); if (pts.length < 3) return; pts.unshift(new THREE.Vector2(0.001, -st.D));
    const geo = new THREE.LatheGeometry(pts, 40, -Math.PI / 2, Math.PI); const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: colr, transparent: true, opacity: op, roughness: .35, depthWrite: false, side: THREE.DoubleSide })); m.renderOrder = 4; T.grp.bulb.add(m);
    const rim = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), new THREE.LineBasicMaterial({ color: colr, transparent: true, opacity: .5 })); rim.renderOrder = 4; T.grp.bulb.add(rim); });
  T.need = true;
}
function placeFoundation() {
  const T = three, { B, D, N } = st;
  T.foot.scale.set(B, 1, B); T.foot.position.set(0, -D + HF / 2, 0);
  const ch = D - HF + 1.15; T.col.scale.set(1, ch, 1); T.col.position.set(0, -D + HF + ch / 2, 0);
  const bh = Math.max(0.01, D - HF); T.back.scale.set(B + .5, bh, 1); T.back.position.set(0, -bh / 2, 0.03); T.back.visible = D - HF > 0.05;
  const al = 0.4 + N / 1500; T.shaft.scale.set(1, al, 1); T.shaft.position.set(0, 1.15 + 0.5 + al / 2, 0); T.head.position.set(0, 1.15 + 0.25, 0);
  T.m0.position.y = -(D + R.m0); T.m0.visible = D + R.m0 < HD + 0.01;
}
// süllyedésmező: u(x, mélység, z) – a mélységgel csökken (a még alatta lévő rétegek összenyomódása), oldalirányban lecseng
function dispFn() {
  const T = three, sT = Math.max(R.s, 1e-6), k = T.sDisp / sT * st.ex / 1000, B = st.B, D = st.D, cum = R.cum || [], dz = 0.05;
  return (x, y, z) => { const d = -y; let u; if (d <= D) u = R.s; else { const i = Math.floor((d - D) / dz); u = i >= cum.length ? 0 : R.s - cum[i]; }
    if (u <= 0) return 0; const r = Math.max(Math.abs(x), Math.abs(z)), half = B / 2 + .2; const spread = 0.5 * B + 0.5 + 0.45 * Math.max(0, d - D);
    const w = r <= half ? 1 : Math.exp(-(r - half) / spread); return u * w * k; };
}
function deform(geo, f) { const a = geo.attributes.position, b0 = geo.userData.base; for (let i = 0; i < a.count; i++) { const x = b0[i * 3], y = b0[i * 3 + 1], z = b0[i * 3 + 2]; a.array[i * 3 + 1] = y - f(x, y, z); } a.needsUpdate = true; geo.computeVertexNormals(); }
function applySettle() {
  const T = three; if (!R) return; const f = dispFn(); const s0 = f(0, -st.D + 0.001, 0);
  T.grp.fnd.position.y = -s0; T.grp.bulb.position.y = -s0;
  T.grp.soil.children.forEach(m => deform(m.geometry, f)); deform(T.heat.geometry, f);
}
const LBL = {};
function labels3D() {
  const T = three, ov = $('#simOv'); if (!ov) return; const w = T.host.clientWidth, h = T.host.clientHeight; const v = new THREE.Vector3();
  const put = (key, x, y, z, text, cls = '') => { let e = LBL[key]; if (!e) { e = H('div', { class: 'lbl ' + cls }); ov.appendChild(e); LBL[key] = e; } v.set(x, y, z).project(T.cam); const px = (v.x + 1) / 2 * w, py = (1 - v.y) / 2 * h; const vis = v.z < 1 && px > -40 && px < w + 40 && py > 24 && py < h - 24; e.style.display = vis ? 'block' : 'none'; e.textContent = text; const hw = (e.offsetWidth || 0) / 2 + 6; e.style.left = clamp(px, hw, w - hw) + 'px'; e.style.top = py + 'px'; };
  const s = -T.grp.fnd.position.y;
  put('N', 1.2, 1.75, 0, `N = ${fmt(st.N)} kN`, 'c');
  put('B', 0, -st.D - s - 0.32, st.B / 2 + 0.1, `B × B = ${fmt(st.B, 1)} × ${fmt(st.B, 1)} m`, 't');
  put('D', 1.0, -Math.max(0.3, (st.D - HF) / 2) - s, 0.25, `D = ${fmt(st.D, 1)} m`);
  put('m0', st.B / 2 + 1.9, -(st.D + R.m0) + 0.05, 0.1, `m₀ = ${fmt(R.m0, 1)} m`, 'c');
  put('s', st.B / 2 + 2.3, 0.35, 0.2, `s = ${fmt(R.s, 0)} mm  (×${st.ex})`, 't');
  P().layers.forEach((l, i) => { const bot = Math.min(l.bot, HD); put('L' + i, -st.B / 2 - 2.4, -(l.top + Math.min(bot, l.top + 3)) / 2 - (i === 0 ? 0.35 : 0), 0.06, `${l.n} · Eoed = ${fmt(l.E, 1)} MPa`); });
  for (let i = P().layers.length; i < 3; i++) if (LBL['L' + i]) LBL['L' + i].style.display = 'none';
}

// ---------------- 2D metszet ----------------
function draw2D() {
  const cv = $('#sim2d'); if (!cv) return; const host = cv.parentElement; const w = host.clientWidth, h = host.clientHeight; const dpr = Math.min(devicePixelRatio, 2); cv.width = w * dpr; cv.height = h * dpr; const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const top = 46, sc = (h - top - 10) / HD, xs = (x) => w / 2 + x * sc, ys = (d) => top + d * sc;
  g.clearRect(0, 0, w, h);
  const T = {}; ['clay', 'clay2', 'sand', 'silt', 'grav'].forEach(k => T[k] = g.createPattern(noiseTex(k).userData.canvas, 'repeat'));
  for (const l of P().layers) { g.fillStyle = T[l.tex]; g.fillRect(xs(HX0) - 400, ys(l.top), 2000, (Math.min(l.bot, HD) - l.top) * sc); }
  const hc = document.createElement('canvas'); hc.width = HW * 2; hc.height = HH * 2; drawHeat(hc, false); g.imageSmoothingEnabled = true; g.drawImage(hc, xs(HX0), ys(0), (HX1 - HX0) * sc, HD * sc);
  g.fillStyle = 'rgba(120,150,90,.9)'; g.fillRect(0, top - 6, w, 6);
  const s = R.s / 1000 * st.ex;
  if (st.D > HF) { g.fillStyle = 'rgba(160,150,135,.6)'; g.fillRect(xs(-st.B / 2 - .25), ys(0), (st.B + .5) * sc, (st.D - HF) * sc); }
  g.fillStyle = '#c3c7ca'; g.strokeStyle = '#4b5458'; g.lineWidth = 1.5; g.fillRect(xs(-st.B / 2), ys(st.D - HF) + s * sc, st.B * sc, HF * sc); g.strokeRect(xs(-st.B / 2), ys(st.D - HF) + s * sc, st.B * sc, HF * sc);
  g.fillRect(xs(-.22), ys(-0.9), .44 * sc, (st.D - HF + 0.9) * sc + s * sc);
  g.strokeStyle = '#d4553a'; g.setLineDash([8, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(0, ys(st.D + R.m0)); g.lineTo(w, ys(st.D + R.m0)); g.stroke(); g.setLineDash([]);
  g.font = '700 12px Inter, sans-serif'; const tag = (x, y, t, bg) => { const tw = g.measureText(t).width + 12; g.fillStyle = bg; g.beginPath(); g.roundRect(x, y - 10, tw, 20, 5); g.fill(); g.fillStyle = '#fff'; g.fillText(t, x + 6, y + 4); };
  tag(w - 210, ys(st.D + R.m0) - 14, `határmélység m₀ = ${fmt(R.m0, 1)} m`, 'rgba(196,72,46,.92)');
  tag(xs(st.B / 2) + 10, ys(st.D) + s * sc - 4, `s = ${fmt(R.s, 0)} mm (×${st.ex})`, 'rgba(13,122,104,.95)');
  tag(xs(0.22) + 10, ys(Math.max(0.35, (st.D - HF) / 2)), `D = ${fmt(st.D, 1)} m`, 'rgba(10,24,21,.8)');
  tag(w / 2 - 36, top - 30, `N = ${fmt(st.N)} kN`, 'rgba(196,72,46,.92)');
  P().layers.forEach(l => tag(8, ys((l.top + Math.min(l.bot, HD)) / 2), `${l.n} · Eoed ${fmt(l.E, 1)} MPa`, 'rgba(10,24,21,.72)'));
  g.fillStyle = 'rgba(10,24,21,.7)'; g.font = '600 10px Inter, sans-serif'; for (let d = 0; d <= HD; d += 2) { g.fillRect(w - 26, ys(d), 10, 1.5); g.fillText(d + ' m', w - 52, ys(d) + 4); }
}

// ---------------- grafikonok ----------------
function chartDepth() {
  const svg = $('#simDepth'); if (!svg) return; svg.innerHTML = ''; const W = 420, Hh = 310, L = 46, Rr = 12, T = 40, Bm = 34; svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
  const zmax = Math.max(R.m0 * 1.25, st.B * 2.2, 3); const smax = Math.max(R.qn, 20) * 1.05; const xs = (v) => L + v / smax * (W - L - Rr), ys = (z) => T + z / zmax * (Hh - T - Bm);
  P().layers.forEach(l => { const a = clamp(l.top - st.D, 0, zmax), b = clamp(l.bot - st.D, 0, zmax); if (b > a) { S('rect', { x: L, y: ys(a), width: W - L - Rr, height: ys(b) - ys(a), fill: l.c, opacity: .16 }, svg); S('text', { x: W - Rr - 4, y: ys(b) - 6, 'text-anchor': 'end', 'font-size': 10.5, fill: css('--mute'), 'font-weight': 600 }, svg).textContent = l.n; } });
  for (let k = 0; k <= 4; k++) { const v = smax * k / 4; S('line', { x1: xs(v), x2: xs(v), y1: T, y2: Hh - Bm, stroke: css('--line2') }, svg); S('text', { x: xs(v), y: Hh - Bm + 14, 'text-anchor': 'middle', 'font-size': 10, fill: css('--mute') }, svg).textContent = Math.round(v); }
  for (let z = 0; z <= zmax; z += zmax > 8 ? 2 : 1) S('text', { x: L - 6, y: ys(z) + 3, 'text-anchor': 'end', 'font-size': 10, fill: css('--mute') }, svg).textContent = z;
  S('text', { x: (L + W) / 2, y: Hh - 4, 'text-anchor': 'middle', 'font-size': 11, fill: css('--ink2'), 'font-weight': 600 }, svg).textContent = 'feszültség [kPa]';
  S('text', { x: 12, y: (T + Hh) / 2, 'text-anchor': 'middle', 'font-size': 11, fill: css('--ink2'), 'font-weight': 600, transform: `rotate(-90 12 ${(T + Hh) / 2})` }, svg).textContent = 'mélység az alapsík alatt [m]';
  const pin = R.prof.filter(p => !p.out && p.z <= zmax), pout = R.prof.filter(p => p.out && p.z <= zmax);
  if (pin.length) { const area = `M${xs(0)},${ys(pin[0].z)} ` + pin.map(p => `L${xs(p.ds)},${ys(p.z)}`).join(' ') + ` L${xs(0)},${ys(R.m0)} Z`; S('path', { d: area, fill: css('--teal'), opacity: .18 }, svg); }
  S('polyline', { points: [...pin, ...pout].map(p => `${xs(Math.max(0, p.ds))},${ys(p.z)}`).join(' '), fill: 'none', stroke: css('--teal'), 'stroke-width': 2.6 }, svg);
  S('polyline', { points: R.prof.filter(p => p.z <= zmax).map(p => `${xs(p.crit)},${ys(p.z)}`).join(' '), fill: 'none', stroke: css('--coral'), 'stroke-width': 2, 'stroke-dasharray': '6 5' }, svg);
  S('line', { x1: L, x2: W - Rr, y1: ys(R.m0), y2: ys(R.m0), stroke: css('--coral'), 'stroke-width': 1.5 }, svg);
  S('text', { x: xs(smax * .45), y: ys(R.m0) - 6, 'font-size': 11, fill: css('--coral-ink'), 'font-weight': 700 }, svg).textContent = `m₀ = ${fmt(R.m0, 2)} m`;
  const lg = S('g', { transform: `translate(${L},6)` }, svg); S('line', { x1: 0, x2: 20, y1: 10, y2: 10, stroke: css('--teal'), 'stroke-width': 2.6 }, lg); S('text', { x: 26, y: 14, 'font-size': 10.5, fill: css('--ink2') }, lg).textContent = st.method === 'J' ? 'Δσz – Jáky (lineáris)' : 'Δσz – rugalmas féltér';
  S('line', { x1: 170, x2: 190, y1: 10, y2: 10, stroke: css('--coral'), 'stroke-width': 2, 'stroke-dasharray': '6 5' }, lg); S('text', { x: 196, y: 14, 'font-size': 10.5, fill: css('--ink2') }, lg).textContent = '0,2 · σ₀ (önsúly 20%-a)';
}
let CURVE = null;
function curveData() {
  const key = [st.pk, st.N, st.curve, st.curve === 'B' ? st.D : st.B].join('|'); if (CURVE && CURVE.key === key) return CURVE;
  const xs = []; const J = [], E = []; const lo = st.curve === 'B' ? 1.2 : 0.8, hi = st.curve === 'B' ? 4.5 : 4.0;
  for (let v = lo; v <= hi + 1e-6; v += 0.1) { xs.push(v); const a = { P: P(), N: st.N, B: st.curve === 'B' ? v : st.B, D: st.curve === 'B' ? st.D : v }; J.push(calc({ ...a, method: 'J' }, false).s); E.push(calc({ ...a, method: 'E' }, false).s); }
  CURVE = { key, xs, J, E, lo, hi }; return CURVE;
}
function chartCurve() {
  const svg = $('#simCurve'); if (!svg) return; svg.innerHTML = ''; const W = 420, Hh = 310, L = 46, Rr = 14, T = 40, Bm = 34; svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
  const c = curveData(); const raw = Math.max(60, ...c.J, ...c.E) * 1.05; const stp = (() => { const r = raw / 4, p = 10 ** Math.floor(Math.log10(r)); return [1, 2, 2.5, 5, 10].map(m => m * p).find(v => v >= r); })(); const ymax = Math.ceil(raw / stp) * stp; const xs = (v) => L + (v - c.lo) / (c.hi - c.lo) * (W - L - Rr), ys = (v) => Hh - Bm - v / ymax * (Hh - T - Bm);
  for (let v = 0; v <= ymax + 1e-6; v += stp) { S('line', { x1: L, x2: W - Rr, y1: ys(v), y2: ys(v), stroke: css('--line2') }, svg); S('text', { x: L - 6, y: ys(v) + 3, 'text-anchor': 'end', 'font-size': 10, fill: css('--mute') }, svg).textContent = fmt(v, stp % 1 ? 1 : 0); }
  for (let v = Math.ceil(c.lo); v <= c.hi; v += 1) S('text', { x: xs(v), y: Hh - Bm + 14, 'text-anchor': 'middle', 'font-size': 10, fill: css('--mute') }, svg).textContent = v;
  S('rect', { x: L, y: ys(ymax), width: W - L - Rr, height: ys(50) - ys(ymax), fill: css('--coral'), opacity: .07 }, svg);
  S('line', { x1: L, x2: W - Rr, y1: ys(50), y2: ys(50), stroke: css('--coral'), 'stroke-dasharray': '4 4' }, svg); S('text', { x: L + 6, y: ys(50) + 14, 'font-size': 10.5, fill: css('--coral-ink'), 'font-weight': 700 }, svg).textContent = '50 mm – általános határ';
  const line = (arr, col, w, dash, op) => S('polyline', { points: arr.map((v, i) => `${xs(c.xs[i])},${ys(v)}`).join(' '), fill: 'none', stroke: col, 'stroke-width': w, 'stroke-dasharray': dash || '', opacity: op }, svg);
  line(c.J, css('--teal'), st.method === 'J' ? 3 : 1.6, st.method === 'J' ? '' : '5 4', st.method === 'J' ? 1 : .7); line(c.E, css('--violet'), st.method === 'E' ? 3 : 1.6, st.method === 'E' ? '' : '5 4', st.method === 'E' ? 1 : .7);
  const cx = st.curve === 'B' ? st.B : st.D; S('line', { x1: xs(cx), x2: xs(cx), y1: T, y2: Hh - Bm, stroke: css('--ink2'), 'stroke-dasharray': '2 3' }, svg); S('circle', { cx: xs(cx), cy: ys(R.s), r: 6, fill: st.method === 'J' ? css('--teal') : css('--violet'), stroke: css('--card'), 'stroke-width': 2 }, svg);
  if (base && base.pk === st.pk) { const bx = st.curve === 'B' ? base.B : base.D; if (bx >= c.lo && bx <= c.hi) S('circle', { cx: xs(bx), cy: ys(base.s), r: 5, fill: 'none', stroke: css('--amber'), 'stroke-width': 2.5 }, svg); }
  S('text', { x: (L + W) / 2, y: Hh - 4, 'text-anchor': 'middle', 'font-size': 11, fill: css('--ink2'), 'font-weight': 600 }, svg).textContent = st.curve === 'B' ? 'alapszélesség B [m]' : 'alapsík mélysége D [m]';
  S('text', { x: 12, y: (T + Hh) / 2, 'text-anchor': 'middle', 'font-size': 11, fill: css('--ink2'), 'font-weight': 600, transform: `rotate(-90 12 ${(T + Hh) / 2})` }, svg).textContent = 'süllyedés s [mm]';
  const lg = S('g', { transform: `translate(${L},6)` }, svg);
  S('line', { x1: 0, x2: 20, y1: 10, y2: 10, stroke: css('--teal'), 'stroke-width': 3 }, lg); S('text', { x: 26, y: 14, 'font-size': 10.5, fill: css('--ink2') }, lg).textContent = 'Jáky: m₀ = B, lineáris';
  S('line', { x1: 170, x2: 190, y1: 10, y2: 10, stroke: css('--violet'), 'stroke-width': 3 }, lg); S('text', { x: 196, y: 14, 'font-size': 10.5, fill: css('--ink2') }, lg).textContent = 'rugalmas féltér + 0,2·σ₀';
}

// ---------------- eredmények, szöveges értékelés ----------------
function insight() {
  const pk = st.pk; const r = (o) => calc({ P: P(), N: st.N, B: st.B, D: st.D, method: st.method, ...o }, false).s;
  const dB = r({ B: Math.min(4.5, st.B + 0.5) }) - R.s, dD = r({ D: Math.min(4, st.D + 0.5) }) - R.s;
  const pct = (d) => (d > 0 ? '+' : '') + fmt(d / R.s * 100, 0) + '%';
  let t = '';
  if (pk === 'A') t = `<b>A eset:</b> a szélesebb alap a feszültség egy részét a mélyebben lévő, kevésbé összenyomódó homokra „közvetíti” – a talpnyomás csökkentése itt <b>hatásos</b>. +0,5 m szélesítés: <b>${pct(dB)}</b>.`;
  if (pk === 'B') t = dB > 0 ? `<b>B eset:</b> a szélesítés most <b>növeli</b> a süllyedést (+0,5 m: <b>${pct(dB)}</b>): a nagyobb határmélység miatt a lejjebb fekvő puha agyag is feszültséget kap – pont az ellenkező hatást érjük el!` : `<b>B eset:</b> a szélesítés alig segít (+0,5 m: <b>${pct(dB)}</b>), mert a szélesebb alap alatt mélyebbre jutnak a feszültségek, és a lejjebb fekvő puha agyag kapja a terhet. ${st.method === 'E' ? 'Válts Jáky-módszerre: ott a süllyedés még nő is!' : ''}`;
  if (pk === 'C') t = `<b>Homogén talaj:</b> a szélesítés csökkenti a süllyedést, de <b>nem arányosan</b> – a szélesebb alap nehezebb, és alatta mélyebbre jut a feszültség. +0,5 m szélesítés: <b>${pct(dB)}</b>; +0,5 m mélyítés: <b>${pct(dD)}</b>.`;
  if (pk === 'D') t = st.D + 0.001 < 2.6 ? `<b>Mélyebb alapsík:</b> a puha réteg alatt 2,6 m-től kavics van. Vidd lejjebb az alapsíkot! +0,5 m mélyítés: <b>${pct(dD)}</b>. Ha az alapsík eléri a kavicsot, a süllyedés töredékére csökken.` : `<b>Az alapsík a kavicson van</b> – a süllyedés töredéke a kiindulónak. Ne feledd: 2–2,5 m-nél mélyebb sávalap már nem gazdaságos → pontalap gerendaráccsal, kútalapozás, vagy pince.`;
  if (st.D > 2.5 && pk !== 'D') t += ` <br>⚠ <b>D > 2,5 m:</b> ilyen mély sávalap már nem gazdaságos – pontalap + gerendarács, kútalapozás vagy pince jöhet szóba.`;
  $('#simInsight').innerHTML = t;
}
function results() {
  const s = R.s; $('#rS').textContent = fmt(s, 0); const col = s <= 25 ? css('--ok') : s <= 50 ? css('--amber') : css('--coral'); $('#rS').style.color = col;
  const bar = $('#rBar'); bar.style.width = clamp(s / 100 * 100, 2, 100) + '%'; bar.style.background = col;
  $('#rQ').textContent = fmt(R.q, 0) + ' kPa'; $('#rQn').textContent = fmt(R.qn, 0) + ' kPa'; $('#rM0').textContent = fmt(R.m0, 2) + ' m'; $('#rW').textContent = fmt(R.W, 0) + ' kN';
  const st0 = $('#rStatus'); st0.className = 'status' + (s <= 25 ? '' : s <= 50 ? ' w' : ' b'); st0.textContent = s <= 25 ? 'kis süllyedés' : s <= 50 ? 'általában megengedhető (≤ 50 mm)' : 'túl nagy – beavatkozás kell';
  const cmp = $('#rCmp'); if (base && base.pk === st.pk) { const d = (s - base.s) / base.s * 100; cmp.innerHTML = `Kiinduló terv: <b class="mono">${fmt(base.s, 0)} mm</b> → most <b class="mono" style="color:${d <= 0 ? css('--ok') : css('--coral')}">${d > 0 ? '+' : ''}${fmt(d, 0)}%</b>`; } else cmp.innerHTML = 'Rögzíts egy kiinduló tervet az összevetéshez.';
  const c = cost(st.B, st.D); $('#rCost').textContent = fmt(c, 0);
  const ch = $('#rChal'); const k = st.pk + st.N; if (s <= 25 && (!best[k] || c < best[k])) best[k] = c; ch.innerHTML = s <= 25 ? `★ Teljesítve! Ráfordítás: <b class="mono">${fmt(c, 0)}</b>${best[k] ? ` · legjobb: <b class="mono">${fmt(best[k], 0)}</b>` : ''}` : `Cél: s ≤ 25 mm a lehető legkisebb ráfordítással${best[k] ? ` · legjobb: <b class="mono">${fmt(best[k], 0)}</b>` : ''}`;
  const cb = $('#rContrib'); cb.innerHTML = ''; const tot = Math.max(s, 1e-6); P().layers.forEach(l => { const v = R.contrib[l.n] || 0; if (v <= 0.01) return; cb.appendChild(H('div', { style: `flex:${v / tot};background:${l.c};min-width:2px`, title: `${l.n}: ${fmt(v, 1)} mm` })); });
  $('#rContribTxt').innerHTML = P().layers.map(l => `<span><i style="background:${l.c}"></i>${l.n}: <b class="mono">${fmt(R.contrib[l.n] || 0, 1)} mm</b></span>`).join('');
}
let pending = false;
function update(full = true) {
  R = calc({ P: P(), N: st.N, B: st.B, D: st.D, method: st.method });
  results(); insight(); chartDepth(); chartCurve();
  if (three && st.view === '3d') { computeField(); drawHeat(three.hc, true); three.htex.needsUpdate = true; placeFoundation(); buildBulbs(); three.sTarget = R.s; three.need = true; }
  else { computeField(); draw2D(); }
}
function sync() { ['simN', 'simB', 'simD', 'simEx'].forEach(id => { const r = document.getElementById(id); if (!r) return; r.value = { simN: st.N, simB: st.B, simD: st.D, simEx: st.ex }[id]; r.dispatchEvent(new Event('input')); }); }
function play(param, from, to) { const r = document.getElementById(param === 'B' ? 'simB' : 'simD'); const t0 = performance.now(), dur = 2600; const step = (t) => { const u = clamp((t - t0) / dur, 0, 1); const e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; r.value = (lerp(from, to, e)).toFixed(1); r.dispatchEvent(new Event('input')); if (u < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }

export function mountSim() {
  const host = $('#simView'); if (!host) return;
  const ok = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } })();
  U.bindRange('simN', v => { st.N = v; update(); }, v => fmt(v) + ' kN');
  U.bindRange('simB', v => { st.B = v; update(); }, v => fmt(v, 1) + ' m');
  U.bindRange('simD', v => { st.D = v; update(); }, v => fmt(v, 1) + ' m');
  U.bindRange('simEx', v => { st.ex = v; if (three) { applySettle(); three.need = true; } update(); }, v => '×' + v);
  U.seg('simProf', v => { st.pk = v; base = null; if (three) buildSoil3D(); const d = { A: [2.0, 1.0], B: [2.0, 1.0], C: [2.0, 1.0], D: [2.0, 0.8] }[v]; st.B = d[0]; st.D = d[1]; sync(); update(); $('#simProfNote').textContent = PROFILES[v].note; });
  U.seg('simMeth', v => { st.method = v; update(); });
  U.seg('simCurveSel', v => { st.curve = v; CURVE = null; chartCurve(); });
  $('#simBulb').addEventListener('change', e => { st.bulb = e.target.checked; if (three) buildBulbs(); });
  $('#simPin').addEventListener('click', () => { base = { pk: st.pk, s: R.s, B: st.B, D: st.D }; update(); });
  $('#simPlayB').addEventListener('click', () => play('B', 1.4, 4.0));
  $('#simPlayD').addEventListener('click', () => play('D', 0.8, 3.4));
  $('#simReset').addEventListener('click', () => { st.N = 1200; st.B = 2.0; st.D = st.pk === 'D' ? 0.8 : 1.0; st.ex = 10; sync(); update(); });
  const setView = (v) => { st.view = v; $$('#simViewSel button').forEach(b => b.classList.toggle('on', b.dataset.v === v)); $('#sim2d').style.display = v === '2d' ? 'block' : 'none'; if (three) three.renderer.domElement.style.display = v === '3d' ? 'block' : 'none'; $('#simOv').style.display = v === '3d' ? 'block' : 'none'; $('#simHint').style.display = v === '3d' ? 'block' : 'none'; update(); if (three) three.need = true; };
  $('#simViewSel').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setView(b.dataset.v); });
  if (ok) { try { init3D(host); buildSoil3D(); } catch (e) { console.warn('3D nem indult', e); three = null; } }
  if (!three) { $('#simViewSel').style.display = 'none'; setView('2d'); } else setView('3d');
  base = null; update(); base = { pk: st.pk, s: R.s, B: st.B, D: st.D }; update();
  addEventListener('resize', () => { if (st.view === '2d') draw2D(); });
  addEventListener('themechange', () => { chartDepth(); chartCurve(); });
}
mountSim();
