/* ================= FX ================= */
function rw(t) { if (typeof M === 'undefined' || !M || typeof t !== 'string' || !(mode === 'playing' || mode === 'decision' || mode === 'result')) return t; if (M.kind === 'rabbit') return t.split('โคนเขา').join('โคนหู').split('เขาเรืองแสง').join('หูเรืองแสง'); if (M.kind === 'wolf') return t.split('โคนเขา').join('ขากรรไกร').split('เขาเรืองแสง').join('เขี้ยวเรืองแสง'); return t; }
function showHint(text, dur) { hint.text = rw(text); hint.t = dur || 4; }
function hintOnce(key, text, dur) { if (hintsDone[key]) return; hintsDone[key] = true; showHint(text, dur); }
function burst(x, y, col, n, spd, life) {
  for (var i = 0; i < n; i++) {
    var a = rand(0, TAU), s = rand(.3, 1) * spd;
    parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: 0, life: rand(.25, 1) * (life || .5), c: col, s: rand(1.5, 3.5) });
  }
}
function ftext(x, y, str, col, size, life) { if (texts.length > 40) texts.shift(); for (var ti = 0, tg = 0; ti < texts.length && tg < 4; ti++) { var tt = texts[ti]; if (tt.t < .6 && Math.abs(tt.x - x) < 70 && Math.abs(tt.y - y) < 18) { y -= 18; tg++; ti = -1; } } texts.push({ x: x + rand(-8, 8), y: y, t: 0, life: life || .9, s: rw(str), c: col || '#fff', z: size || 16 }); }
function ring(x, y, r0, r1, col, life, lw) { if (rings.length > 40) rings.shift(); rings.push({ x: x, y: y, r0: r0, r1: r1, c: col, t: 0, life: life || .4, lw: lw || 3 }); }
function decal(x, y, col) { decals.push({ x: x, y: y, r: rand(4, 11), c: col }); if (decals.length > 90) decals.shift(); }
function addShake(a) { shake = Math.max(shake, a * setMul('shake')); }
function screenFx(fa, col, pu) { var m = setMul('shake'); if (m <= 0) return; if (fa > 0 && fa * m > flashA) { flashA = Math.min(.55, fa * m); flashC = col; } punch = Math.max(punch, pu * m); }
function slash(x, y, a, len, col, w) { if (setMul('shake') <= 0) return; if (slashes.length > 24) slashes.shift(); slashes.push({ x: x, y: y, a: a, len: len, c: col, w: w || 3, t: 0, life: .22 }); }
function chainTier(n) { return n >= 25 ? ['FERAL', '#ff4a4a'] : (n >= 15 ? ['WILD', '#ff9a4a'] : (n >= 8 ? ['GREAT', '#ffd45a'] : (n >= 4 ? ['GOOD', '#cfe8ff'] : ['', '#ffffff']))); }
function chainHit(x, y) {
  hitChain++; hitChainT = 3.2; chainPop = 1; if (hitChain > bestChain) bestChain = hitChain;
  if (hitChain === 5 || hitChain === 10 || hitChain === 15 || hitChain === 25 || (hitChain > 25 && hitChain % 10 === 0)) {
    var tr = chainTier(hitChain); ftext(P.x, P.y - 44, 'COMBO x' + hitChain + '!', tr[1], 20, 1.1); ring(P.x, P.y, 14, 60, tr[1], .4, 3); screenFx(.12, tr[1], .35); sfx('perfect');
  }
}
function drawChain() {
  if (hitChain < 3 || mode !== 'playing') return;
  var tr = chainTier(hitChain), z = 20 + Math.min(hitChain, 30) * .55 + chainPop * 9, g = HUDG || { hl: 20, k: 1 }, gx = g.hl + 2, gy = Math.max(178, HUDLB + 26);
  hudBlock(gx, gy, g.k, function () {
    txt('x' + hitChain, gx, gy, z, tr[1], 'left', true);
    if (tr[0]) txt(tr[0] + ' · HITS', gx, gy + z * .55, 11, tr[1], 'left', true); else txt('HITS', gx, gy + z * .55, 11, '#9aa39a', 'left', true);
    var k = clamp(hitChainT / 3.2, 0, 1); ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(gx, gy + z * .55 + 8, 90, 3); ctx.fillStyle = tr[1]; ctx.fillRect(gx, gy + z * .55 + 8, 90 * k, 3);
  });
}

/* ================= INPUT ================= */
var MOVE_KEYS = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
function pressKey(k) {
  keys[k] = true; initAudio();
  if (mode === 'playing' && !paused) {
    if (k === ' ') P.bufDodge = .18;
    else if (k === 'j') P.bufAtk = .22;
    else if (k === 'k') P.bufHeavy = .22;
    else if (k === 'e') fireDart();
    else if (k === 't') cycleLoad();
    else if (k === 'r') startHeal();
    if (MOVE_KEYS.indexOf(k) >= 0) aimMode = 'keys';
  }
  if (mode === 'field' && FIELD && !paused) { if (k === 'b' && !FIELD.mapOpen) placeBait(); else if (k === 'v' && !FIELD.mapOpen) placeSnare(); else if (k === 'n') { FIELD.mapOpen = !FIELD.mapOpen; keys['n'] = false; sfx('scan'); } }
  if (mode === 'title' && (k === 'enter' || k === ' ')) { ACTIONS.tgo(); return; }
  if (mode === 'village' && V && (k === 'f' || k === 'e' || k === 'enter' || k === ' ')) villageInteract();
  if (k === 'escape' && mode === 'field' && FIELD && FIELD.mapOpen) { FIELD.mapOpen = false; return; } /* Esc ปิดแผนที่เต็มก่อน */
  if (k === 'p' || k === 'escape') togglePause();
  if (k === 'm') muted = !muted;
}
window.addEventListener('keydown', function (e) {
  var k = String(e.key).toLowerCase();
  if (e.target && e.target.tagName === 'TEXTAREA') return;
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].indexOf(k) >= 0 && e.preventDefault) e.preventDefault();
  if (e.repeat) return;
  pressKey(k);
});
window.addEventListener('keyup', function (e) { keys[String(e.key).toLowerCase()] = false; });
function releaseKey(k) { keys[k] = false; }
/* ภาคสนาม: แตะ/คลิกมินิแมป = เปิดแผนที่เต็ม · แตะที่ใดก็ได้ตอนเปิดอยู่ = ปิด */
canvas.addEventListener('pointerdown', function (e) {
  if (mode !== 'field' || !FIELD) return;
  var F = FIELD, r = canvas.getBoundingClientRect(), x = (e.clientX - r.left) * VW / r.width, y = (e.clientY - r.top) * H / r.height, q = F.mmRect;
  if (F.mapOpen) { F.mapOpen = false; if (e.preventDefault) e.preventDefault(); return; }
  if (F.campMenu >= 0) { /* เมนูแคมป์: แตะตัวเลือก / แตะนอกแผงเพื่อปิด */
    var cr = F.cmRects || [], ci, hit = -1, cp = F.cmPanel;
    for (ci = 0; ci < cr.length; ci++) if (x >= cr[ci].x && x <= cr[ci].x + cr[ci].w && y >= cr[ci].y && y <= cr[ci].y + cr[ci].h) hit = ci;
    if (hit >= 0) campDo(F, campOptions(F)[hit]);
    else if (!cp || x < cp.x || x > cp.x + cp.w || y < cp.y || y > cp.y + cp.h) F.campMenu = -1;
    if (e.preventDefault) e.preventDefault(); return;
  }
  if (q && x >= q.x - 8 && x <= q.x + q.w + 8 && y >= q.y - 8 && y <= q.y + q.h + 8) { F.mapOpen = true; initAudio(); sfx('scan'); if (e.preventDefault) e.preventDefault(); }
}, true);
canvas.addEventListener('mousemove', function (e) {
  var r = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - r.left) * VW / r.width - OFFX; mouse.y = (e.clientY - r.top) * H / r.height; aimMode = 'mouse';
});
canvas.addEventListener('mousedown', function (e) {
  initAudio();
  if (e.button === 0) { mouse.l = true; if (mode === 'playing' && !paused) P.bufAtk = .22; }
  if (e.button === 2) { mouse.r = true; if (mode === 'playing' && !paused) P.bufHeavy = .22; }
});
window.addEventListener('mouseup', function (e) { if (e.button === 0) mouse.l = false; if (e.button === 2) mouse.r = false; });
canvas.addEventListener('contextmenu', function (e) { if (e.preventDefault) e.preventDefault(); });
function clearInput(keepLatch) {
  for (var k in keys) if (!(keepLatch && k === 'c')) keys[k] = false;
  mouse.l = false; mouse.r = false;
  try { var kn = document.getElementById('joyKnob'); if (kn && kn.style) kn.style.transform = 'translate(0,0)'; } catch (e) {}
  if (!keepLatch) try { var sn = document.getElementById('t_sneak'); if (sn && sn.classList) sn.classList.remove('on'); } catch (e) {}
}
window.addEventListener('blur', function () { clearInput(false); if (mode === 'playing' || mode === 'field') paused = true; });
function togglePause() { if (mode === 'playing' || mode === 'field') paused = !paused; }

