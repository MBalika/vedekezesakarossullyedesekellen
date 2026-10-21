/* ===== Védekezés a káros süllyedések ellen – alap UI ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const fmt = (v, d = 0) => (Math.round(v * 10 ** d) / 10 ** d).toLocaleString('hu-HU', { minimumFractionDigits: d, maximumFractionDigits: d });
const NS = 'http://www.w3.org/2000/svg';
function S(tag, attrs = {}, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function H(tag, attrs = {}, html) { const e = document.createElement(tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
window.U = { $, $$, clamp, lerp, fmt, S, H, css };

// --- csúszkák kitöltése + értékkijelzés ---
function fillRange(r) { const p = (r.value - r.min) / (r.max - r.min) * 100; r.style.setProperty('--p', p + '%'); }
function bindRange(id, onInput, fmtFn) {
  const r = document.getElementById(id); if (!r) return null; const out = document.querySelector(`[data-for="${id}"]`);
  const upd = () => { fillRange(r); if (out) out.textContent = fmtFn ? fmtFn(+r.value) : r.value; onInput && onInput(+r.value); };
  r.addEventListener('input', upd); upd(); return r;
}
window.U.bindRange = bindRange; window.U.fillRange = fillRange;
function seg(container, onPick) { const el = typeof container === 'string' ? document.getElementById(container) : container; if (!el) return; el.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b || !el.contains(b)) return; $$('button', el).forEach(x => x.classList.toggle('on', x === b)); onPick(b.dataset.v, b); }); }
window.U.seg = seg;

// --- téma ---
(function theme() {
  const root = document.documentElement; let saved = null; try { saved = localStorage.getItem('sv-theme'); } catch (e) { }
  if (saved && !root.hasAttribute('data-theme')) root.setAttribute('data-theme', saved);
  const btn = $('#themeBtn'); if (!btn) return;
  const isDark = () => root.getAttribute('data-theme') ? root.getAttribute('data-theme') === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const label = () => { btn.innerHTML = isDark() ? '☀︎ Világos' : '☾ Sötét'; };
  btn.addEventListener('click', () => { const t = isDark() ? 'light' : 'dark'; root.setAttribute('data-theme', t); try { localStorage.setItem('sv-theme', t); } catch (e) { } label(); dispatchEvent(new Event('themechange')); });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { label(); dispatchEvent(new Event('themechange')); });
  label();
})();

// --- fejezet-navigáció, haladás ---
(function nav() {
  const links = $$('.chapnav a'); const secs = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const prog = $('.progress'); const top = $('.totop');
  const onScroll = () => {
    const y = scrollY + 140; let cur = null; secs.forEach(s => { if (s.offsetTop <= y) cur = s; });
    links.forEach(a => a.classList.toggle('on', cur && a.getAttribute('href') === '#' + cur.id));
    const h = document.documentElement.scrollHeight - innerHeight; if (prog) prog.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
    if (top) top.classList.toggle('on', scrollY > 900);
    const on = links.find(a => a.classList.contains('on')); if (on && on.dataset.lastOn !== '1') { links.forEach(a => a.dataset.lastOn = ''); on.dataset.lastOn = '1'; on.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); }
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (top) top.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
})();

// --- fülek ---
$$('.tabs').forEach(tabs => {
  const grp = tabs.dataset.group; const panes = $$(`.tabpane[data-group="${grp}"]`);
  tabs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; $$('button', tabs).forEach(x => x.classList.toggle('on', x === b)); panes.forEach(p => p.classList.toggle('on', p.dataset.tab === b.dataset.tab)); dispatchEvent(new CustomEvent('tabchange', { detail: { group: grp, tab: b.dataset.tab } })); });
});
window.U.openTab = (grp, tab) => { const b = document.querySelector(`.tabs[data-group="${grp}"] button[data-tab="${tab}"]`); if (b) b.click(); };

// --- videók ---
const VIDEOS = {
  tj1: { t: 'Talajcsere', s: 'kisebb talpnyomás, mélyebb alapsík, talajcsere', d: '1:52', ch: 'a–c' },
  tj7: { t: 'Előterhelés – Mexikóváros', s: 'kavicsterhelés, kivárás, ütemezett eltávolítás', d: '1:50', ch: 'e' },
};
window.VIDEOS = VIDEOS;
(function videos() {
  const modal = $('#vmodal'); if (!modal) return; const frame = $('.frame', modal), title = $('.mh span', modal);
  const open = (k) => {
    const v = VIDEOS[k]; if (!v) return; title.textContent = v.t; frame.innerHTML = '';
    const f = H('iframe', { src: `video/${k}.html`, title: v.t, allow: 'autoplay; fullscreen' }); frame.appendChild(f);
    modal.classList.add('on'); document.body.style.overflow = 'hidden';
  };
  const close = () => { modal.classList.remove('on'); frame.innerHTML = ''; document.body.style.overflow = ''; };
  $('#vclose').addEventListener('click', close); modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('on')) close(); });
  const fs = $('#vfs'); if (fs) fs.addEventListener('click', () => { const f = $('iframe', frame); if (f && f.requestFullscreen) f.requestFullscreen().catch(() => { }); });
  $$('[data-video]').forEach(b => b.addEventListener('click', () => open(b.dataset.video)));
  // kártyák kitöltése
  $$('.vcard[data-video]').forEach(c => { const v = VIDEOS[c.dataset.video]; if (!v) return; c.innerHTML = `<div class="vthumb"><img src="img/thumb-${c.dataset.video}.jpg" alt="" loading="lazy"><div class="pl"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z" fill="#fff"/></svg></div><span class="t">${v.d}</span></div><div><div class="kicker" style="margin-bottom:4px">Animáció · ${v.ch}</div><h4>${v.t}</h4><p>${v.s}</p></div>`; });
})();

// --- kvízmotor ---
function quiz(el, items) {
  if (!el) return; let i = 0; const res = items.map(() => null), pick = items.map(() => null);
  const body = H('div'); el.appendChild(body);
  const dots = $('.dots', el);
  const draw = () => {
    body.innerHTML = '';
    if (i >= items.length) { const ok = res.filter(x => x === true).length; body.appendChild(H('div', { class: 'qres on' }, `<div class="kicker">Eredmény</div><b>${ok} / ${items.length}</b><p class="muted">${ok === items.length ? 'Hibátlan – gratulálok!' : ok >= items.length * .6 ? 'Szép munka! Nézd át a hibás kérdéseket.' : 'Érdemes még egyszer átfutni a fejezetet.'}</p><div class="qnav" style="justify-content:center"><button class="sec" data-a="restart">Újrakezdés</button></div>`)); }
    else {
      const it = items[i]; const q = H('div', { class: 'q on' }, `<div class="qn">${i + 1}. kérdés / ${items.length}</div><div class="qt">${it.q}</div>`);
      const opts = H('div', { class: 'opts' }); it.o.forEach((o, k) => { const b = H('button', { class: 'opt' }, `<span class="k">${'ABCD'[k]}</span><span>${o}</span>`); b.addEventListener('click', () => answer(k, opts, q)); opts.appendChild(b); });
      q.appendChild(opts); q.appendChild(H('div', { class: 'expl' }, it.e)); body.appendChild(q);
      const nav = H('div', { class: 'qnav' }, `<button class="sec" data-a="prev" ${i === 0 ? 'disabled' : ''}>← Előző</button><button data-a="next" ${res[i] === null ? 'disabled' : ''}>${i === items.length - 1 ? 'Eredmény' : 'Következő →'}</button>`); body.appendChild(nav);
      if (res[i] !== null) reveal(opts, q, pick[i]);
    }
    if (dots) dots.innerHTML = items.map((_, k) => `<i class="${res[k] === true ? 'ok' : res[k] === false ? 'no' : ''} ${k === i ? 'cur' : ''}"></i>`).join('');
  };
  const reveal = (opts, q, picked) => { const it = items[i]; $$('.opt', opts).forEach((b, k) => { b.disabled = true; if (k === it.a) b.classList.add('ok'); else if (k === picked) b.classList.add('no'); }); $('.expl', q).classList.add('on'); };
  const answer = (k, opts, q) => { if (res[i] !== null) return; res[i] = k === items[i].a; pick[i] = k; reveal(opts, q, k); $('[data-a="next"]', el).disabled = false; if (dots) dots.children[i].className = (res[i] ? 'ok' : 'no') + ' cur'; };
  el.addEventListener('click', (e) => { const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a; if (a === 'next') i++; else if (a === 'prev') i = Math.max(0, i - 1); else if (a === 'restart') { i = 0; res.fill(null); pick.fill(null); } draw(); });
  draw();
}
window.QUIZ = quiz;

// --- igaz / hamis ---
function trueFalse(grid, items, scoreEl) {
  if (!grid) return; let done = 0, ok = 0;
  const upd = () => { const pct = done ? Math.round(ok / done * 100) : 0; const fin = done === items.length ? ` · <span class="status${pct >= 80 ? '' : pct >= 50 ? ' w' : ' b'}">${pct >= 90 ? 'Kiváló! Mehetsz vizsgázni.' : pct >= 75 ? 'Jó eredmény!' : pct >= 50 ? 'Nem rossz – nézd át a hibásakat.' : 'Érdemes újra átnézni a fejezeteket.'} (${pct}%)</span>` : ''; scoreEl.innerHTML = `Helyes: <b>${ok}</b> / ${done} megválaszolt · összesen ${items.length}${fin}<span class="tfprog"><i style="width:${done / items.length * 100}%"></i></span>`; };
  items.forEach((it, k) => {
    const c = H('div', { class: 'tf' }, `<div class="st"><span class="no">${String(k + 1).padStart(2, '0')}</span>${it.s}</div><div class="bt"><button data-v="1">Igaz</button><button data-v="0">Hamis</button></div><div class="fb"></div>`);
    c.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b || c.dataset.done) return; c.dataset.done = 1; done++; const right = (b.dataset.v === '1') === it.t; if (right) ok++; c.classList.add(right ? 'ok' : 'no'); $$('button', c).forEach(x => { if ((x.dataset.v === '1') === it.t) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); }); $('.fb', c).innerHTML = `<b>${right ? '✓ Helyes.' : '✗ Nem egészen.'}</b> Az állítás <b>${it.t ? 'igaz' : 'hamis'}</b>. ${it.e}`; $$('button', c).forEach(x => x.disabled = true); upd(); });
    grid.appendChild(c);
  });
  upd();
  const r = $('#tfReset'); if (r) r.addEventListener('click', () => { grid.innerHTML = ''; trueFalse(grid, items, scoreEl); }, { once: true });
}
window.TF = trueFalse;
