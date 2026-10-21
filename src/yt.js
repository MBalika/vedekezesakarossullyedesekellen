/* ===== BME Építőmérnöki Kar – YouTube-felvételek („Nézd meg élőben is!” kártyák) ===== */
(function () {
  const { $, $$ } = window.U;
  // a felhasznált videók adatai (cím, hossz, lejátszási lista, a polaroidok feliratai)
  const LIST_TJ = 'PLiAsGexXzYoLJnR9HUPPN85cACUQXJhYj', LIST_C = 'PLiAsGexXzYoJk3IiDC5YBCNSs0_YQFXXA';
  const YT = {
    '8Zcv7ktWD68': { title: 'Talajjavítások', dur: '2:36', playlist: 'Talajjavítások', list: LIST_TJ, kick: 'A talajjavítások áttekintése', tech: 'Talajjavítások', caps: ['Mélytömörítés', 'Vibrátorfej kavicsban', 'Talajjavítási módszerek', 'Dinamikus tömörítés'] },
    Gca4PGhTC5o: { title: 'Vibroflotáció', dur: '2:23', playlist: 'Talajjavítások', list: LIST_TJ, kick: 'A vibroflotáció a valóságban', tech: 'Vibroflotáció', caps: ['Vibroflot a talajban', 'Vízöblítés', 'Utántöltés', 'Raszteres tömörítés'] },
    LtSalNj4ByQ: { title: 'Talajtömörítés döngöléssel', dur: '3:16', playlist: 'Talajjavítások', list: LIST_TJ, kick: 'A döngölés a valóságban', tech: 'Döngölés, kőtömzs', caps: ['Döngölési raszter', 'Ejtősúly', 'Kőtömzs', 'Ejtegetés'] },
    cNkNZV6kgqk: { title: 'Vibrált kőoszlopok', dur: '2:48', playlist: 'Talajjavítások', list: LIST_TJ, kick: 'A vibrált kőoszlop a valóságban', tech: 'Vibrált kőoszlop', caps: ['Vibrátoros gép', 'Anyagtartály feltöltése', 'Kavics a mélyponton', 'Kőoszlop-raszter'] },
    CgKwZBWn_xM: { title: 'Injektálások', dur: '5:53', playlist: 'Talajjavítások', list: LIST_TJ, kick: 'Az injektálás a valóságban', tech: 'Injektálás', caps: ['Furatkészítés', 'Injektáló furatok', 'Injektálás alagútban', 'Behatoló habarcs'] },
    wh31VB1fY_8: { title: 'Mélykeverés', dur: '5:52', playlist: 'Talajjavítások', list: LIST_TJ, kick: 'A mélykeverés és a tömegstabilizáció a valóságban', tech: 'Mélykeverés, tömegstabilizáció', caps: ['Keverés a part mentén', 'Kiemelt keverőszár', 'Keverőmarós fal', 'Tömegstabilizáció'] },
    'MPjXIhchN-w': { title: 'Jet-grouting', dur: '4:27', playlist: 'Talajjavítások', list: LIST_TJ, kick: 'A jet-grouting a valóságban', tech: 'Jet-grouting', caps: ['Foghíjtelek', 'Fúrás a gödörben', 'Visszafolyó iszap', 'Feltárt jet-oszlopok'] },
    c3vKfjgqJdA: { title: 'Cölöpalapozások rendszerezése', dur: '2:32', playlist: 'Cölöpalapozások', list: LIST_C, kick: 'A cölöpözési technológiák áttekintése', tech: 'Cölöpalapozások', caps: ['Teherviselő oszlop', 'CFA-spirál', 'Nagyátmérőjű fúrt', 'Franki-hagymák'] },
  };
  window.YT = YT;
  const img = (id, f) => `img/yt/${id}/${f}`;
  const watch = (id) => `https://www.youtube.com/watch?v=${id}` + (YT[id].list ? `&list=${YT[id].list}` : '');
  function mk(tag, attrs = {}, ...kids) {
    const e = document.createElement(tag);
    for (const k in attrs) { const v = attrs[k]; if (v == null || v === false) continue; if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v); }
    for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
    return e;
  }

  // --- lejátszó ablak (youtube-nocookie) ---
  const modal = $('#ytmodal');
  let lastFocus = null;
  function openYT(id) {
    const y = YT[id]; if (!y || !modal) return;
    lastFocus = document.activeElement;
    $('.mh span', modal).textContent = y.title;
    $('.frame', modal).innerHTML = '';
    $('.frame', modal).appendChild(mk('iframe', { src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`, title: y.title, allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen', referrerpolicy: 'strict-origin-when-cross-origin' }));
    $('#ytopen', modal).href = watch(id);
    $('.ytinfo', modal).textContent = `BME Építőmérnöki Kar · YouTube · ${y.playlist} lejátszási lista · ${y.dur}`;
    modal.classList.add('on'); document.body.style.overflow = 'hidden';
    setTimeout(() => { const b = $('#ytclose', modal); if (b) b.focus(); }, 50);
  }
  function closeYT() {
    if (!modal || !modal.classList.contains('on')) return;
    modal.classList.remove('on'); $('.frame', modal).innerHTML = ''; document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (modal) {
    $('#ytclose', modal).addEventListener('click', closeYT);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeYT(); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') closeYT(); });
  }
  window.openYT = openYT;

  // --- nagy kártya: <div data-ytc="ID" [data-kick="…"]></div> ---
  function ytCard(el, id) {
    const y = YT[id]; if (!y) { console.warn('Nincs ilyen YouTube-videó:', id); return; }
    const caps = el.dataset.caps ? el.dataset.caps.split('|') : y.caps;
    const go = () => openYT(id);
    el.classList.add('ytc'); el.innerHTML = '';
    const board = mk('div', { class: 'ytc-board' },
      [1, 2, 3, 4].map((k) => mk('figure', { class: 'ytc-pol p' + k, onclick: go }, mk('img', { src: img(id, `p${k}.jpg`), alt: caps[k - 1] || '', loading: 'lazy', decoding: 'async' }), mk('figcaption', {}, caps[k - 1] || ''))),
      mk('button', { class: 'ytc-main', type: 'button', onclick: go, 'aria-label': 'Videó lejátszása: ' + y.title }, mk('img', { src: img(id, 't.jpg'), alt: '', loading: 'lazy', decoding: 'async' }), mk('span', { class: 'ytc-yt' })));
    el.append(
      mk('div', { class: 'ytc-head' }, mk('div', { class: 'ytc-kick' }, el.dataset.kick || y.kick), mk('div', { class: 'ytc-title' }, 'Nézd meg élőben is!')),
      mk('div', { class: 'ytc-qr' }, mk('img', { src: img(id, 'qr.png'), alt: 'QR-kód: youtu.be/' + id, loading: 'lazy' })),
      board,
      mk('div', { class: 'ytc-bar' }, mk('span', { class: 'ytc-logo', 'aria-hidden': 'true' }),
        mk('div', {}, mk('b', {}, y.title), mk('small', {}, `BME Építőmérnöki Kar · YouTube · ${y.playlist} lejátszási lista · ${y.dur}`)),
        mk('a', { class: 'ytc-link', href: watch(id), target: '_blank', rel: 'noopener' }, mk('span', { class: 'u' }, 'youtu.be/' + id), mk('span', { class: 'h' }, '▶ kattints a képre, vagy nyisd meg a YouTube-on ↗'))));
  }
  // --- kis kártya: <button data-ytm="ID"></button> ---
  function ytMini(el, id) {
    const y = YT[id]; if (!y) return;
    el.classList.add('ytm'); el.innerHTML = ''; el.type = 'button';
    el.append(mk('div', { class: 'th' }, mk('img', { src: img(id, 't.jpg'), alt: '', loading: 'lazy' }), mk('span', { class: 'ytc-yt' }), mk('span', { class: 'd' }, y.dur)),
      mk('div', { class: 'strip' }, [1, 2, 3, 4].map((k) => mk('img', { src: img(id, `p${k}.jpg`), alt: '', loading: 'lazy' }))),
      mk('div', { class: 'm' }, mk('small', {}, 'BME Építőmérnöki Kar · YouTube'), mk('b', {}, el.dataset.tech || y.tech)));
    el.addEventListener('click', () => openYT(id));
    el.setAttribute('aria-label', 'YouTube-videó: ' + y.title);
  }
  $$('[data-ytc]').forEach((el) => ytCard(el, el.dataset.ytc));
  $$('[data-ytm]').forEach((el) => ytMini(el, el.dataset.ytm));
})();
