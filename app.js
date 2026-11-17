/* Abrands: brand switcher, shop + protein finder, mix box, Acup scroll story, countries, cart → WhatsApp.
   Data: data.js (window.AB). 3D: scene.js (window.ABScene). */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const AB = window.AB, BR = Object.fromEntries(AB.brands.map(b => [b.id, b])), PR = Object.fromEntries(AB.products.map(p => [p.id, p]));
const WA = String(AB.whatsapp || '').replace(/\D/g, '');   // empty = demo mode (orders not sent)
const CONTACT = String(AB.contact || '').replace(/\D/g, '');
const money = n => '$' + (Number.isInteger(n) ? n : n.toFixed(2));
const img = p => `assets/img/${p.img}.webp`;
const IC = {
  plus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M8 2.5v11M2.5 8h11"/></svg>',
  minus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M2.5 8h11"/></svg>',
  x: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>',
};
const inkOf = hex => { const c = hex.match(/\w\w/g).map(h => parseInt(h, 16) / 255); return (.2126 * c[0] + .7152 * c[1] + .0722 * c[2]) > .55 ? '#0A0A0C' : '#FFFFFF'; };
const stat = p => p.p ? [p.p, 'g protein'] : p.pct ? [p.pct + '%', 'protein'] : p.brand === 'abutter' ? ['100%', 'peanuts'] : ['—', ''];

/* ================= ACCENT ================= */
let brand = 'acup';
function accent(hex) {
  document.documentElement.style.setProperty('--acc', hex);
  document.documentElement.style.setProperty('--accInk', inkOf(hex) === '#FFFFFF' ? '#FFFFFF' : '#0A0A0C');
}

/* ================= HERO: brand switcher + 3D ================= */
const HERO_PICK = { acup: 'acup-trio', abar: 'abar-dark', abites: 'abites-choco', abutter: 'abutter-pb' };
$('#switch').innerHTML = AB.brands.map(b => `<button class="bs" type="button" data-b="${b.id}" style="--c:${b.color}" aria-pressed="false"><i></i><span><b>${esc(b.name)}</b><small>${esc(b.kind)}</small></span><span class="prog"></span></button>`).join('');
let heroProduct = PR[HERO_PICK.acup];
function showBrand(id, user) {
  brand = id; const b = BR[id], p = PR[HERO_PICK[id]]; heroProduct = p;
  accent(b.color);
  $$('#switch .bs').forEach(x => x.setAttribute('aria-pressed', x.dataset.b === id));
  $('#bigword').textContent = b.name.toUpperCase();
  const [v, u] = stat(p);
  $('#now').innerHTML = `<span class="k">${esc(b.kind)}</span><h3>${esc(b.name)} · ${esc(p.name)}</h3><p>${esc(b.pitch)}</p><div class="st"><b>${v}</b><span>${u}</span></div>`;
  if (window.ABScene) window.ABScene.show(id, p, b.color);
  if (user) { userPicked = true; document.body.classList.add('paused'); }
}
$('#switch').addEventListener('click', e => { const b = e.target.closest('[data-b]'); if (b) showBrand(b.dataset.b, true); });
let userPicked = false, heroVis = true;
new IntersectionObserver(es => { heroVis = es[0].isIntersecting; }).observe($('.hero'));
if (!reduce) setInterval(() => { if (!userPicked && heroVis && !document.hidden && !openId) { const i = AB.brands.findIndex(b => b.id === brand); showBrand(AB.brands[(i + 1) % AB.brands.length].id); } }, 6000);
(function wait() { if (window.ABScene) { showBrand(brand); return; } setTimeout(wait, 120); })();

/* marquee */
const MQ = ['Boost', 'Gain', 'Recover', 'Up to 40 g protein', 'No refined sugar', 'Delivery all over Lebanon'];
$('#mq').innerHTML = [...MQ, ...MQ].map(t => `<span>${t}</span>`).join('');

/* ================= CART ================= */
const KEY = 'abrands-cart-v1';
let cart = {}; try { cart = JSON.parse(localStorage.getItem(KEY) || '{}'); Object.keys(cart).forEach(k => { if (!PR[k] || !(cart[k] > 0)) delete cart[k]; }); } catch (e) { cart = {}; }
let boxes = []; try { boxes = JSON.parse(localStorage.getItem(KEY + '-boxes') || '[]').filter(b => b.every(id => PR[id])); } catch (e) { boxes = []; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); localStorage.setItem(KEY + '-boxes', JSON.stringify(boxes)); } catch (e) {} };
const boxPrice = b => { const full = b.reduce((s, id) => s + PR[id].price, 0); return { full, price: Math.round(full * (100 - AB.box.off)) / 100 }; };
function totals() {
  const items = Object.entries(cart).reduce((s, [id, q]) => s + PR[id].price * q, 0);
  const bx = boxes.map(boxPrice), boxFull = bx.reduce((s, b) => s + b.full, 0), boxPay = bx.reduce((s, b) => s + b.price, 0);
  const n = Object.values(cart).reduce((a, b) => a + b, 0) + boxes.length * AB.box.size;
  return { n, items, boxFull, boxPay, save: Math.round((boxFull - boxPay) * 100) / 100, total: Math.round((items + boxPay) * 100) / 100 };
}
function setQty(id, q, from) {
  const before = cart[id] || 0; q = Math.max(0, Math.min(99, q));
  if (q) cart[id] = q; else delete cart[id];
  save(); renderCtl(id); counts(q > before);
  if (q > before) { fly(from, PR[id]); toast(`${PR[id].name} added`); }
  if ($('#cart').classList.contains('on')) renderCart();
}

/* ================= SHOP ================= */
let fBrand = 'all', minP = 0, tag = null;
$('#filters').innerHTML = `<button class="fb" type="button" data-fb="all" aria-pressed="true" style="--c:#F4F4F6;--ci:#0A0A0C">All <small>${AB.products.length}</small></button>` + AB.brands.map(b => `<button class="fb" type="button" data-fb="${b.id}" aria-pressed="false" style="--c:${b.color};--ci:${inkOf(b.color)}"><i></i>${esc(b.name)}</button>`).join('');
function card(p) {
  const b = BR[p.brand], [v, u] = stat(p);
  return `<article class="pc reveal" id="pc-${p.id}" style="--c:${p.color};--ci:${inkOf(p.color)}">
    <div class="ph"><img src="${img(p)}" alt="${esc(b.name)} ${esc(p.name)}" loading="lazy" width="480" height="480"><button type="button" data-open="${p.id}" aria-label="${esc(p.name)} details"></button>
      <div class="badge" aria-hidden="true"><b>${v}</b><small>${u.toUpperCase().replace('G ', '')}</small></div><span class="brand">${esc(b.name)}</span></div>
    <div class="bd"><span class="ln">${esc(p.line)}</span><h3>${esc(p.name)}</h3>
      <div class="ft"><span class="pr">${money(p.price)}<small>${p.unit ? '/ ' + esc(p.unit) : p.size ? esc(p.size) : ''}</small></span><div data-ctl="${p.id}"></div></div></div></article>`;
}
$('#grid').innerHTML = AB.products.map(card).join('');
function renderCtl(id) {
  const p = PR[id], q = cart[id] || 0, el = $(`[data-ctl="${id}"]`); if (!el) return;
  el.innerHTML = q ? `<div class="step" role="group" aria-label="${esc(p.name)} quantity"><button type="button" data-dec="${id}" aria-label="One less">${IC.minus}</button><output>${q}</output><button type="button" data-add="${id}" aria-label="One more">${IC.plus}</button></div>`
    : `<button class="add" type="button" data-add="${id}" aria-label="Add ${esc(p.name)}">${IC.plus}</button>`;
}
AB.products.forEach(p => renderCtl(p.id));
function filter() {
  let shown = 0;
  AB.products.forEach(p => {
    const prot = p.p || (p.pct ? 20 : 0);
    const ok = (fBrand === 'all' || p.brand === fBrand) && prot >= minP && (!tag || (p.tags || []).includes(tag));
    $('#pc-' + p.id).classList.toggle('dim', !ok); $('#pc-' + p.id).hidden = !ok && (fBrand !== 'all' && p.brand !== fBrand); if (ok) shown++;
  });
  $('#est').textContent = (shown ? '' : 'Nothing matches. Try less protein or another taste. ') + (AB.pricesConfirmed ? '' : 'Prices are placeholders until Abrands confirms them.');
}
$('#filters').onclick = e => { const b = e.target.closest('[data-fb]'); if (!b) return; fBrand = b.dataset.fb; $$('#filters .fb').forEach(x => x.setAttribute('aria-pressed', x === b)); if (fBrand !== 'all') showBrand(fBrand, true); filter(); };
$('#minP').oninput = e => { minP = +e.target.value; $('#minPv').textContent = minP ? minP + 'g+' : 'ANY'; filter(); };
$$('[data-tag]').forEach(b => b.onclick = () => { tag = tag === b.dataset.tag ? null : b.dataset.tag; $$('[data-tag]').forEach(x => x.setAttribute('aria-pressed', x.dataset.tag === tag)); filter(); });
filter();
if (!reduce) $('#grid').addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; const c = e.target.closest('.pc'); if (!c) return; const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 10}deg) translateY(-4px)`; });
$('#grid').addEventListener('pointerout', e => { const c = e.target.closest('.pc'); if (c && !c.contains(e.relatedTarget)) c.style.transform = ''; });

/* ================= SCROLL STORY (Acup ritual, real photos) ================= */
const story = $('#story'), steps = $$('.story .st'), frames = $$('.story .fr'), bars = $$('.story .bar i');
const STORY_C = ['#F08A1C', '#2E2B6B', '#B99B6C', '#E8467A'];
let lastStep = -1;
function storyTick() {
  const r = story.getBoundingClientRect(), span = r.height - innerHeight; if (r.bottom < 0 || r.top > innerHeight) return;
  const p = Math.max(0, Math.min(.9999, -r.top / span)), step = Math.floor(p * 4), local = p * 4 - step;
  bars.forEach((b, i) => b.style.width = (i < step ? 100 : i === step ? local * 100 : 0) + '%');
  if (step !== lastStep) {
    lastStep = step;
    steps.forEach((s, i) => s.classList.toggle('on', i === step)); frames.forEach((f, i) => f.classList.toggle('on', i === step));
    $('#sNum').textContent = '0' + (step + 1); story.style.setProperty('--sc', STORY_C[step]);
  }
  const img = frames[step].querySelector('img'); if (!reduce) img.style.transform = `translateY(${(local - .5) * -4}%) scale(1.06)`;
}
story.style.setProperty('--sc', STORY_C[0]);

/* ================= MIX BOX ================= */
let mix = [];
$('#mixN').textContent = AB.box.size; $('#mixOff').textContent = `−${AB.box.off}%`;
$('#picks').innerHTML = AB.products.map(p => `<button class="pk" type="button" data-pk="${p.id}" aria-label="Add ${esc(BR[p.brand].name)} ${esc(p.name)} to the box"><img src="${img(p)}" alt="">${esc(p.name)}</button>`).join('');
function renderMix(pop = -1) {
  $('#slots').innerHTML = Array.from({ length: AB.box.size }, (_, i) => {
    const p = PR[mix[i]];
    return p ? `<button type="button" class="slot on" data-sl="${i}" style="--c:${p.color};${i === pop || pop === 'all' ? '' : 'animation:none'}" aria-label="${esc(p.name)}, tap to remove"><img src="${img(p)}" alt=""></button>` : `<span class="slot" aria-hidden="true">${i + 1}</span>`;
  }).join('');
  const n = mix.length, bp = boxPrice(mix);
  $('#meter').style.width = n / AB.box.size * 100 + '%';
  $('#tTxt').textContent = n === AB.box.size ? 'Box full 🔥' : `${n} of ${AB.box.size}`;
  $('#tTot').innerHTML = n ? `<s style="opacity:.5">${money(bp.full)}</s> <b>${money(n === AB.box.size ? bp.price : bp.full)}</b>` : '<b>$0</b>';
  $('#mixAdd').disabled = n !== AB.box.size; $('#mixAdd').textContent = n === AB.box.size ? `Add box · ${money(bp.price)}` : `Add ${AB.box.size - n} more`;
}
renderMix();
$('#picks').onclick = e => { const b = e.target.closest('[data-pk]'); if (!b) return; if (mix.length >= AB.box.size) { toast('Box is full. Tap a slot to swap'); return; } mix.push(b.dataset.pk); renderMix(mix.length - 1); };
$('#slots').onclick = e => { const b = e.target.closest('[data-sl]'); if (b) { mix.splice(+b.dataset.sl, 1); renderMix(); } };
$('#mixRand').onclick = () => { while (mix.length < AB.box.size) mix.push(AB.products[Math.floor(Math.random() * AB.products.length)].id); renderMix('all'); };
$('#mixClear').onclick = () => { mix = []; renderMix(); };
$('#mixAdd').onclick = () => { if (mix.length !== AB.box.size) return; const r = $('#mixAdd').getBoundingClientRect(); boxes.push(mix.slice()); save(); counts(true); fly(r, PR[mix[0]]); toast(`Mix box added · ${money(boxPrice(mix).price)}`); mix = []; renderMix(); if ($('#cart').classList.contains('on')) renderCart(); };

/* ================= COUNTRIES ================= */
let country = 'lb'; try { country = localStorage.getItem('abrands-country') || 'lb'; } catch (e) {}
const WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.4 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.5.4.1.1.1.8-.1 1.4z"/></svg>';
const waText = c => `https://wa.me/${CONTACT}?text=${encodeURIComponent(`Hi Abrands! I'm in ${c.name} and I'd like to order. Do you deliver to my area?`)}`;
$('#cty').innerHTML = AB.countries.map(c => `<div class="ct" role="button" tabindex="0" data-ct="${c.id}" aria-pressed="${c.id === country}"><span class="f">${c.flag}</span><b>${esc(c.name)}</b><small>${esc(c.id === 'lb' ? 'Delivery all over Lebanon. Order on the site or on WhatsApp.' : 'Message us for delivery and prices to ' + c.name + '.')}</small>
  <a class="wa" href="${waText(c)}" target="_blank" rel="noopener">${WA_ICON}WhatsApp</a>${c.id === 'lb' ? '<a class="go" href="#shop">Shop</a>' : ''}</div>`).join('');
$('#cty').onkeydown = e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.ct')) { e.preventDefault(); e.target.click(); } };
$('#cty').onclick = e => { if (e.target.closest('a')) return; const b = e.target.closest('[data-ct]'); if (!b) return; country = b.dataset.ct; try { localStorage.setItem('abrands-country', country); } catch (er) {} $$('#cty .ct').forEach(x => x.setAttribute('aria-pressed', x.dataset.ct === country)); toast(`Delivering to ${AB.countries.find(c => c.id === country).name}`); };
$('#wsC').innerHTML = AB.countries.map(c => `<option value="${c.id}">${c.flag} ${esc(c.name)}</option>`).join('');

/* ================= SHEET ================= */
function openSheet(id) {
  const p = PR[id], b = BR[p.brand]; let q = 1;
  $('#sheet').style.setProperty('--c', p.color);
  $('#shPh').innerHTML = `<img src="${img(p)}" alt="${esc(b.name)} ${esc(p.name)}">`;
  const facts = [stat(p), [esc(b.kind), 'brand line'], p.kcal ? [p.kcal, 'cal / bite'] : [p.unit || 'single', 'size']];
  const draw = () => {
    $('#shBd').innerHTML = `<button class="x" type="button" data-close aria-label="Close">${IC.x}</button><span class="ln">${esc(b.name)} · ${esc(p.line)}</span><h2 id="shN">${esc(p.name)}</h2>
      <div class="facts">${facts.map(([v, l]) => `<div><b>${v}</b><small>${l}</small></div>`).join('')}</div><p class="d">${esc(b.pitch)}</p>
      <div class="sh-act"><div class="step" role="group" aria-label="Quantity"><button type="button" id="sM" aria-label="One less">${IC.minus}</button><output id="sQ">${q}</output><button type="button" id="sP" aria-label="One more">${IC.plus}</button></div>
      <button class="gobtn" type="button" id="sA"><span>Add to order</span><span id="sT">${money(p.price * q)}</span></button></div>`;
    $('#sM').onclick = () => { if (q > 1) { q--; upd(); } }; $('#sP').onclick = () => { if (q < 50) { q++; upd(); } };
    $('#sA').onclick = () => { const r = $('#sA').getBoundingClientRect(); closeAll(); setQty(id, (cart[id] || 0) + q, r); };
  };
  const upd = () => { $('#sQ').textContent = q; $('#sT').textContent = money(p.price * q); };
  draw(); openPanel('sheet');
}

/* ================= CART DRAWER + CHECKOUT ================= */
let view = 'list', form = { name: '', phone: '', address: '', notes: '' };
try { Object.assign(form, JSON.parse(localStorage.getItem('abrands-details') || '{}')); } catch (e) {}
function renderCart() {
  const body = $('#cartBody'), foot = $('#cartFoot'), t = totals();
  if (view === 'done') return;
  if (!t.n) { view = 'list'; body.innerHTML = `<div class="empty"><b>Empty tank</b>Add something with protein in it 💪</div>`; foot.innerHTML = `<button class="gobtn ghost" type="button" data-close>Browse products</button>`; return; }
  const cty = AB.countries.find(c => c.id === country);
  if (view === 'list') {
    body.innerHTML = Object.keys(cart).map(id => { const p = PR[id]; return `<div class="line"><img src="${img(p)}" alt=""><div><b>${esc(BR[p.brand].name)} ${esc(p.name)}</b><small>${money(p.price)} each</small></div><div class="step" role="group" aria-label="${esc(p.name)} quantity"><button type="button" data-dec="${id}" aria-label="One less">${IC.minus}</button><output>${cart[id]}</output><button type="button" data-add="${id}" aria-label="One more">${IC.plus}</button></div></div>`; }).join('')
      + boxes.map((bx, i) => `<div class="line"><img src="${img(PR[bx[0]])}" alt=""><div><b>Mix box #${i + 1}</b><small>${bx.map(id => PR[id].name).join(', ')}</small></div><button class="x" type="button" data-rmbox="${i}" aria-label="Remove mix box">${IC.x}</button></div>`).join('')
      + `<div class="sum"><div><span>Items</span><span>${money(t.items + t.boxFull)}</span></div>${t.save ? `<div class="save"><span>Mix box −${AB.box.off}%</span><span>−${money(t.save)}</span></div>` : ''}
        <div><span>Delivery to</span><span>${cty.flag} ${esc(cty.name)}</span></div><div class="tot"><span>Total</span><span>${money(t.total)}</span></div><p class="note">Delivery fee confirmed on WhatsApp.</p></div>`
      + (boxes.length ? '' : `<div class="nudge">📦 Build a <b>mix box</b> of ${AB.box.size} and save ${AB.box.off}%.</div>`);
    foot.innerHTML = `<button class="gobtn" type="button" id="toD"><span>Checkout</span><span>${money(t.total)}</span></button>`;
    $('#toD').onclick = () => { view = 'details'; renderCart(); };
  } else {
    body.innerHTML = `<form id="ck" class="form" style="margin-top:0" novalidate>
      <div class="field"><label for="cN">Name</label><input id="cN" name="name" autocomplete="name" value="${esc(form.name)}"><span class="err" id="eN"></span></div>
      <div class="field"><label for="cP">Phone</label><input id="cP" name="phone" type="tel" inputmode="tel" autocomplete="tel" value="${esc(form.phone)}"><span class="err" id="eP"></span></div>
      <div class="field"><label>Country</label><div class="seg" id="ckC">${AB.countries.map(c => `<button type="button" data-cc="${c.id}" aria-pressed="${c.id === country}">${c.flag} ${esc(c.name)}</button>`).join('')}</div></div>
      <div class="field"><label for="cA">Address</label><input id="cA" name="address" autocomplete="street-address" placeholder="City, street, building" value="${esc(form.address)}"><span class="err" id="eA"></span></div>
      <div class="field"><label for="cNo">Notes (optional)</label><textarea id="cNo" name="notes" rows="2">${esc(form.notes)}</textarea></div></form>`;
    foot.innerHTML = `<button class="gobtn" type="submit" form="ck"><span>Send order on WhatsApp</span><span>${money(t.total)}</span></button><button class="gobtn ghost" type="button" id="ckB">Back</button>`;
    const f = $('#ck');
    f.oninput = () => { form = Object.fromEntries(new FormData(f)); try { localStorage.setItem('abrands-details', JSON.stringify(form)); } catch (e) {} };
    $('#ckC').onclick = e => { const b = e.target.closest('[data-cc]'); if (!b) return; country = b.dataset.cc; $$('#ckC button').forEach(x => x.setAttribute('aria-pressed', x === b)); $$('#cty .ct').forEach(x => x.setAttribute('aria-pressed', x.dataset.ct === country)); };
    f.onsubmit = place; $('#ckB').onclick = () => { view = 'list'; renderCart(); };
  }
}
function place(e) {
  e.preventDefault();
  const eN = !form.name.trim(), eP = String(form.phone).replace(/\D/g, '').length < 7, eA = !form.address.trim();
  $('#eN').textContent = eN ? 'Tell us your name.' : ''; $('#eP').textContent = eP ? 'We need a phone number.' : ''; $('#eA').textContent = eA ? 'Where should we deliver?' : '';
  if (eN || eP || eA) { (eN ? $('#cN') : eP ? $('#cP') : $('#cA')).focus(); return; }
  const t = totals(), no = 'AB-' + Math.floor(1000 + Math.random() * 9000), cty = AB.countries.find(c => c.id === country);
  const lines = Object.keys(cart).map(id => `• ${cart[id]} × ${BR[PR[id].brand].name} ${PR[id].name} (${money(PR[id].price * cart[id])})`)
    .concat(boxes.map((b, i) => `• Mix box #${i + 1} (${money(boxPrice(b).price)}): ${b.map(id => PR[id].name).join(', ')}`));
  const txt = `*New Abrands order* ${no}\n\n${lines.join('\n')}\n\n${t.save ? `Mix box saving: −${money(t.save)}\n` : ''}*Total: ${money(t.total)}* (+ delivery)\n\n👤 ${form.name.trim()}\n📞 ${form.phone.trim()}\n${cty.flag} ${cty.name} · ${form.address.trim()}${form.notes.trim() ? '\n📝 ' + form.notes.trim() : ''}`;
  if (WA) { const u = `https://wa.me/${WA}?text=${encodeURIComponent(txt)}`, w = window.open(u, '_blank'); if (w) w.opener = null; else location.href = u; }
  view = 'done';
  $('#cartBody').innerHTML = `<div class="done"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46"/><path pathLength="1" d="M30 52l13 13 27-29"/></svg><h3>Order locked in</h3><p>Order <b>${no}</b>, ${money(t.total)}. ${WA ? 'Just tap Send in WhatsApp.' : ''}</p>${WA ? '' : '<div class="demo">Demo mode: this order was not sent to Abrands.</div>'}</div>`;
  $('#cartFoot').innerHTML = `<button class="gobtn" type="button" id="nO"><span>Done</span><span>✓</span></button>`;
  cart = {}; boxes = []; save(); AB.products.forEach(p => renderCtl(p.id)); counts();
  $('#nO').onclick = () => { view = 'list'; closeAll(); };
}

/* ================= PANELS ================= */
let openId = null, retFocus = null;
function openPanel(id) {
  if (openId) $('#' + openId).classList.remove('on');
  retFocus = retFocus || document.activeElement; openId = id;
  $('#' + id).classList.add('on'); $('#ov').classList.add('on'); document.body.classList.add('locked'); $('#obar').classList.remove('on');
  if (id === 'cart') renderCart();
  setTimeout(() => { const f = $('#' + id + ' [data-close]'); if (f) f.focus(); }, 80);
}
function closeAll() {
  if (!openId) return; $('#' + openId).classList.remove('on'); $('#ov').classList.remove('on'); document.body.classList.remove('locked'); openId = null;
  if (view === 'done') view = 'list'; counts(); if (retFocus && document.contains(retFocus)) retFocus.focus(); retFocus = null;
}
addEventListener('keydown', e => {
  if (e.key === 'Escape' && openId) closeAll();
  if (e.key === 'Tab' && openId) { const f = $$(`#${openId} button, #${openId} input, #${openId} textarea, #${openId} select`).filter(x => !x.disabled && x.offsetParent); if (!f.length) return; if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); } }
});
document.addEventListener('click', e => {
  const t = e.target;
  const a = t.closest('[data-add]'); if (a) { setQty(a.dataset.add, (cart[a.dataset.add] || 0) + 1, a.closest('#cart') ? null : a.getBoundingClientRect()); return; }
  const d = t.closest('[data-dec]'); if (d) { setQty(d.dataset.dec, (cart[d.dataset.dec] || 0) - 1); return; }
  const rb = t.closest('[data-rmbox]'); if (rb) { boxes.splice(+rb.dataset.rmbox, 1); save(); counts(); renderCart(); return; }
  const o = t.closest('[data-open]'); if (o) { openSheet(o.dataset.open); return; }
  if (t.closest('#cartBtn') || t.closest('[data-cart]')) { openPanel('cart'); return; }
  if (t.closest('[data-close]') || t === $('#ov')) closeAll();
});

/* ================= COUNTS / FLY / TOAST ================= */
function counts(bump) {
  const t = totals(); $('#cnt').textContent = t.n;
  $('#obarT').innerHTML = `${t.n} item${t.n === 1 ? '' : 's'} · <b>${money(t.total)}</b>`;
  $('#obar').classList.toggle('on', t.n > 0 && !openId);
  if (bump && !reduce) { const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
}
function fly(r, p) {
  if (!r || reduce) return;
  const d = document.createElement('div'); d.className = 'fly'; d.style.backgroundImage = `url(${img(p)})`; document.body.appendChild(d);
  const x0 = r.left + r.width / 2, y0 = r.top + r.height / 2, t = $('#cartBtn').getBoundingClientRect(), x1 = t.left + t.width / 2, y1 = t.top + t.height / 2;
  d.style.left = x0 + 'px'; d.style.top = y0 + 'px';
  d.animate([{ transform: 'translate(0,0) scale(1) rotate(0)' }, { transform: `translate(${(x1 - x0) * .5}px,${Math.min(y0, y1) - y0 - 120}px) scale(1.3) rotate(160deg)`, offset: .5 }, { transform: `translate(${x1 - x0}px,${y1 - y0}px) scale(.25) rotate(340deg)`, opacity: .5 }], { duration: 850, easing: 'cubic-bezier(.45,0,.55,1)' }).onfinish = () => d.remove();
}
let tt; function toast(s) { const el = $('#toast'); el.textContent = s; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('on'), 2100); $('#live').textContent = s; }

/* ================= WHOLESALE ================= */
$('#wsForm').onsubmit = e => {
  e.preventDefault(); const n = $('#wsName').value.trim(); $('#wsErr').textContent = n ? '' : 'Tell us the name of your place.'; if (!n) { $('#wsName').focus(); return; }
  const c = AB.countries.find(x => x.id === $('#wsC').value);
  const txt = `Wholesale request for Abrands\n${n} (${$('#wsType').value})\n${c.flag} ${c.name} · ${$('#wsArea').value.trim() || '-'}`;
  if (WA) window.open(`https://wa.me/${WA}?text=${encodeURIComponent(txt)}`, '_blank', 'noopener'); else toast('Demo mode: request not sent');
  e.target.reset();
};

/* ================= LINKS, SCROLL, REVEAL, INTRO ================= */
$('#ig').href = AB.instagram; $('#waF').href = `https://wa.me/${CONTACT || '9617189537'}`;
const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
$$('.reveal').forEach(el => rio.observe(el));
addEventListener('scroll', () => { $('#hd').classList.toggle('solid', scrollY > 30); storyTick(); }, { passive: true });
(function intro() {
  const el = $('#intro'); let seen = false;
  try { seen = sessionStorage.getItem('ab-intro') === '1'; sessionStorage.setItem('ab-intro', '1'); } catch (e) {}
  if (seen || reduce) { el.remove(); document.documentElement.classList.add('ready'); return; }
  setTimeout(() => { el.classList.add('out'); document.documentElement.classList.add('ready'); setTimeout(() => el.remove(), 1300); }, 1600);
})();
counts(); storyTick();
