/* ===== Védekezés a káros süllyedések ellen – alap UI ===== */
const EN = (document.documentElement.lang || '').toLowerCase().startsWith('en');   // angol oldal (en.html)
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const fmt = (v, d = 0) => { const s = (Math.round(v * 10 ** d) / 10 ** d).toLocaleString(EN ? 'en-GB' : 'hu-HU', { minimumFractionDigits: d, maximumFractionDigits: d }); return EN ? s.replace(/,/g, '\u202f') : s; };   // angolul: tizedespont, ezres tagolás keskeny szóközzel
const NS = 'http://www.w3.org/2000/svg';
function S(tag, attrs = {}, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function H(tag, attrs = {}, html) { const e = document.createElement(tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
/* SVG-szöveg valódi alsó indexszel: a „σ_{1} = 260 kPa” jelölésből tspan-ek készülnek (dy-nal, hogy minden böngészőben működjön) */
function rich(e, str, fs) { const parts = String(str).split(/_\{([^}]*)\}/); e.textContent = ''; if (parts.length === 1) { e.textContent = str; return e; } const d = +(fs || e.getAttribute('font-size') || 12) * .24; let pend = 0; parts.forEach((s, i) => { if (!s) return; const ts = document.createElementNS(NS, 'tspan'); if (i % 2) { ts.setAttribute('dy', d.toFixed(2)); ts.setAttribute('font-size', '72%'); pend = -d; } else if (pend) { ts.setAttribute('dy', pend.toFixed(2)); pend = 0; } ts.textContent = s; e.appendChild(ts); }); return e; }
const pct = (v, d = 0) => fmt(v, d) + (EN ? '%' : '\u00a0%');   // százalék: magyarul nem törő szóközzel, angolul tapadva
window.U = { $, $$, clamp, lerp, fmt, S, H, css, EN, rich, pct };

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
  const prog = $('.progress'); const top = $('.totop'); const nav = $('.chapnav'); const bar = $('.topbar');
  /* az aktív menüpontot csak a menüsávon belül görgetjük középre – az oldal görgetését nem szakítja meg
     (a korábbi scrollIntoView megállította a menüre kattintva induló görgetést) */
  const centerTab = (a) => { if (!nav || nav.scrollWidth <= nav.clientWidth + 1) return; nav.scrollTo({ left: Math.max(0, a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2), behavior: 'smooth' }); };
  /* a horgonyok a ragadós fejléc alá érkeznek, a fejléc tényleges magasságával számolva */
  const pad = () => { if (bar) document.documentElement.style.scrollPaddingTop = (bar.offsetHeight + 10) + 'px'; };
  pad(); addEventListener('resize', pad); addEventListener('load', pad);
  /* menükattintás: görgetés a fejezetre, a végén ellenőrzés – ha közben feljebb valami magasabb lett (képek, ábrák), utánaigazít */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]'); if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const h = a.getAttribute('href'); if (h.length < 2) return; let t = null; try { t = document.querySelector(h); } catch (er) { } if (!t) return; e.preventDefault();
    const goal = () => Math.max(0, t.getBoundingClientRect().top + scrollY - (bar ? bar.offsetHeight : 0) - 10);
    history.replaceState(null, '', h);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* nagy távolságnál előbb a cél közelébe ugrunk, és csak az utolsó szakasz sima – a hosszú oldalon így is gyorsan és pontosan érkezik */
    const y0 = scrollY, g0 = goal(); if (!reduce && Math.abs(g0 - y0) > 4000) scrollTo({ top: g0 + (g0 > y0 ? -1200 : 1200), behavior: 'instant' });
    scrollTo({ top: goal(), behavior: reduce ? 'instant' : 'smooth' });
    let n = 0; const fix = () => { const d = goal() - scrollY; if (Math.abs(d) > 4 && n++ < 3) { scrollTo({ top: goal(), behavior: 'instant' }); setTimeout(fix, 250); } };
    const done = () => { removeEventListener('scrollend', done); clearTimeout(tm); fix(); };
    addEventListener('scrollend', done, { once: true }); const tm = setTimeout(done, 1600);
  });
  /* alpontsor: a menü alatt az aktív módszercsoport alpontjai; a fül- és módszerválasztó alpontok a megnyitott fület jelzik */
  const sns = $$('.subnav .sn'); let snCur = null;
  const subMark = (y, curId) => {
    const sh = sns.find(d => d.dataset.sec === curId) || sns.find(d => d.dataset.sec === '');
    if (sh !== snCur) { sns.forEach(d => d.classList.toggle('on', d === sh)); snCur = sh; if (sh) sh.scrollLeft = 0; }
    if (!sh || !sh.dataset.sec) return; const as = $$('a', sh); let best = null;
    as.forEach(a => {
      if (a.dataset.open) { const [g, t] = a.dataset.open.split(':'); const tb = document.querySelector(`.tabs[data-group="${g}"] button[data-tab="${t}"]`); let on = !!(tb && tb.classList.contains('on'));
        if (on && a.dataset.inj != null) { const ib = document.querySelector('#injM button.on'); on = !!(ib && ib.dataset.v === a.dataset.inj); } a.classList.toggle('on', on); }
      else { const t = document.querySelector(a.getAttribute('href')); if (t && t.getBoundingClientRect().top + scrollY <= y) best = a; }
    });
    as.filter(a => !a.dataset.open).forEach(a => a.classList.toggle('on', a === best));
    const on = as.find(a => a.classList.contains('on')); if (on && sh.scrollWidth > sh.clientWidth + 1 && on.dataset.lastOn !== '1') { as.forEach(a => a.dataset.lastOn = ''); on.dataset.lastOn = '1'; sh.scrollTo({ left: Math.max(0, on.offsetLeft - (sh.clientWidth - on.offsetWidth) / 2), behavior: 'smooth' }); }
  };
  /* alpont-hivatkozás: a megfelelő fül (és injektálási módszer) megnyitása a görgetés előtt */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-open]'); if (!a) return; const [g, t] = a.dataset.open.split(':'); window.U.openTab(g, t);
    if (a.dataset.inj != null) { const b = document.querySelector(`#injM button[data-v="${a.dataset.inj}"]`); if (b && !b.classList.contains('on')) b.click(); }
  }, true);
  const onScroll = () => {
    const y = scrollY + (bar ? bar.offsetHeight : 120) + 30; let cur = null; secs.forEach(s => { if (s.offsetTop <= y) cur = s; });
    links.forEach(a => a.classList.toggle('on', cur && a.getAttribute('href') === '#' + cur.id));
    subMark(y, cur ? cur.id : '');
    const h = document.documentElement.scrollHeight - innerHeight; if (prog) prog.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
    if (top) top.classList.toggle('on', scrollY > 900);
    const on = links.find(a => a.classList.contains('on')); if (on && on.dataset.lastOn !== '1') { links.forEach(a => a.dataset.lastOn = ''); on.dataset.lastOn = '1'; centerTab(on); }
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  addEventListener('tabchange', () => setTimeout(onScroll, 0)); document.addEventListener('click', (e) => { if (e.target.closest('#injM')) setTimeout(onScroll, 0); });
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
  tj1: { t: 'Alapozás átalakítása', s: 'kisebb talpnyomás · mélyebb alapsík · talajcsere', d: '2:16', ch: '1/A–1/C' },
  tj7: { t: 'Előterhelés – Mexikóváros', s: 'ballaszt az épületsúlyig, kivárás, ütemezett eltávolítás', d: '2:14', ch: '4/A' },
};
window.VIDEOS = VIDEOS;
(function videos() {
  const modal = $('#vmodal'); if (!modal) return; const frame = $('.frame', modal), title = $('.mh span', modal);
  const open = (k) => {
    const v = VIDEOS[k]; if (!v) return; title.textContent = v.t; frame.innerHTML = '';
    const f = H('iframe', { src: `video/${EN ? 'en/' : ''}${k}.html`, title: v.t, allow: 'autoplay; fullscreen' }); frame.appendChild(f);
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
  const upd = () => { const pct = done ? Math.round(ok / done * 100) : 0; const fin = done === items.length ? ` · <span class="status${pct >= 80 ? '' : pct >= 50 ? ' w' : ' b'}">${pct >= 90 ? 'Kiváló! Mehetsz vizsgázni.' : pct >= 75 ? 'Jó eredmény!' : pct >= 50 ? 'Nem rossz – nézd át a hibásakat.' : 'Érdemes újra átnézni a fejezeteket.'} (${pct}${EN ? '' : '\u00a0'}%)</span>` : ''; scoreEl.innerHTML = `Helyes: <b>${ok}</b> / ${done} megválaszolt · összesen ${items.length}${fin}<span class="tfprog"><i style="width:${done / items.length * 100}%"></i></span>`; };
  items.forEach((it, k) => {
    const c = H('div', { class: 'tf' }, `<div class="st"><span class="no">${String(k + 1).padStart(2, '0')}</span>${it.s}</div><div class="bt"><button data-v="1">Igaz</button><button data-v="0">Hamis</button></div><div class="fb"></div>`);
    c.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b || c.dataset.done) return; c.dataset.done = 1; done++; const right = (b.dataset.v === '1') === it.t; if (right) ok++; c.classList.add(right ? 'ok' : 'no'); $$('button', c).forEach(x => { if ((x.dataset.v === '1') === it.t) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); }); $('.fb', c).innerHTML = `<b>${right ? '✓ Helyes.' : '✗ Nem egészen.'}</b> Az állítás <b>${it.t ? 'igaz' : 'hamis'}</b>. ${it.e}`; $$('button', c).forEach(x => x.disabled = true); upd(); });
    grid.appendChild(c);
  });
  upd();
  const r = $('#tfReset'); if (r) r.addEventListener('click', () => { grid.innerHTML = ''; trueFalse(grid, items, scoreEl); }, { once: true });
}
window.TF = trueFalse;

// --- nyelvváltó: a választás megmarad (alap-lang), a másik nyelvű oldal ugyanott nyílik meg (alap-pos) ---
(function langSwitch() {
  const sw = $('#langSw'), KEY = 'alap-pos'; const hh = () => { const t = $('.topbar'); return t ? t.offsetHeight : 0; };
  if (sw) sw.addEventListener('click', () => {
    try { localStorage.setItem('alap-lang', EN ? 'hu' : 'en'); } catch (e) { }
    const H0 = hh(); let best = null; document.querySelectorAll('main [id], section[id]').forEach((n) => { if (n.closest('svg')) return; const r = n.getBoundingClientRect(); if (r.height && r.top <= H0 + 1 && r.bottom > H0) best = n; });
    try { sessionStorage.setItem(KEY, JSON.stringify({ id: best ? best.id : '', off: best ? H0 - best.getBoundingClientRect().top : 0, y: scrollY, t: Date.now() })); } catch (e) { }
    sw.setAttribute('href', (EN ? './' : 'en') + (best ? '#' + best.id : ''));
  });
  let p = null; try { p = JSON.parse(sessionStorage.getItem(KEY) || 'null'); sessionStorage.removeItem(KEY); } catch (e) { }
  if (p && Date.now() - p.t < 20000) { if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const go = () => { const n = p.id && document.getElementById(p.id); const y = n ? n.getBoundingClientRect().top + scrollY - hh() + p.off : p.y; scrollTo({ top: Math.max(0, y), behavior: 'instant' }); };
    requestAnimationFrame(go); addEventListener('load', () => { go(); setTimeout(go, 600); }, { once: true }); }
})();
