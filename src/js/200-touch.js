/* ================= TOUCH / FULLSCREEN / RESIZE ================= */
var isTouch = false;
try { isTouch = !!(('ontouchstart' in window) || (window.navigator && window.navigator.maxTouchPoints > 0) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)); } catch (e) {}
if (document.body && document.body.classList) { if (isTouch) document.body.classList.add('touch'); }
try { var rotGo = document.getElementById('rot_go'); if (rotGo) rotGo.addEventListener('click', function () { document.body.classList.add('norot'); }); } catch (e) {}
function bindHold(id, key) {
  var el = document.getElementById(id); if (!el) return;
  var held = {};
  function down(e) { if (e.preventDefault) e.preventDefault(); try { if (el.setPointerCapture) el.setPointerCapture(e.pointerId); } catch (x) {} held[e.pointerId] = true; pressKey(key); }
  function up(e) { if (e.preventDefault) e.preventDefault(); if (held[e.pointerId] === undefined && Object.keys(held).length) return; delete held[e.pointerId]; if (!Object.keys(held).length) releaseKey(key); }
  el.addEventListener('pointerdown', down); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('contextmenu', function (e) { if (e.preventDefault) e.preventDefault(); });
}
function bindLatch(id, key) {
  var el = document.getElementById(id); if (!el) return;
  el.addEventListener('pointerdown', function (e) {
    if (e.preventDefault) e.preventDefault(); initAudio();
    keys[key] = !keys[key];
    if (el.classList) { if (keys[key]) el.classList.add('on'); else el.classList.remove('on'); }
  });
}
(function setupTouch() {
  [['t_atk', 'j'], ['t_dodge', ' '], ['t_heavy', 'k'], ['t_block', 'l'], ['t_scan', 'q'], ['t_dart', 'e'], ['t_load', 't'], ['t_heal', 'r'], ['t_int', 'f'], ['t_bait', 'b'], ['t_snare', 'v'], ['t_map', 'n'], ['t_x', 'x']].forEach(function (b) { bindHold(b[0], b[1]); });
  bindLatch('t_sneak', 'c');
  var pb = document.getElementById('t_pause');
  if (pb) pb.addEventListener('pointerdown', function (e) { if (e.preventDefault) e.preventDefault(); initAudio(); togglePause(); });
  var joy = document.getElementById('joy'), knob = document.getElementById('joyKnob'), jid = null;
  function joyKeys(x, y) { keys['a'] = x < -.38; keys['d'] = x > .38; keys['w'] = y < -.38; keys['s'] = y > .38; if (x || y) aimMode = 'keys'; }
  function joyMove(e) {
    var r = joy.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, R = r.width / 2;
    var dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy) || 1, m = Math.min(1, d / R);
    var ux = dx / d * m, uy = dy / d * m;
    if (m < .25) { ux = 0; uy = 0; }
    joyKeys(ux, uy);
    if (knob && knob.style) knob.style.transform = 'translate(' + (dx / d * Math.min(d, R * .6)) + 'px,' + (dy / d * Math.min(d, R * .6)) + 'px)';
  }
  if (joy) {
    joy.addEventListener('pointerdown', function (e) { if (e.preventDefault) e.preventDefault(); initAudio(); jid = e.pointerId; try { if (joy.setPointerCapture) joy.setPointerCapture(e.pointerId); } catch (x) {} joyMove(e); });
    joy.addEventListener('pointermove', function (e) { if (jid === e.pointerId) joyMove(e); });
    var jend = function (e) { if (jid !== e.pointerId) return; jid = null; joyKeys(0, 0); if (knob && knob.style) knob.style.transform = 'translate(0,0)'; };
    joy.addEventListener('pointerup', jend); joy.addEventListener('pointercancel', jend);
  }
  var fs = document.getElementById('t_fs');
  if (fs) fs.addEventListener('click', toggleFullscreen);
  var sk = document.getElementById('tskip');
  if (sk) { sk.addEventListener('pointerdown', function (e) { if (e.stopPropagation) e.stopPropagation(); }); sk.addEventListener('mousedown', function (e) { if (e.stopPropagation) e.stopPropagation(); }); sk.addEventListener('click', function (e) { if (e.stopPropagation) e.stopPropagation(); tutSkip(); }); }
})();

(function setupTouchLayout() {
  var KEY = 'bio-hunter-ui-v2';
  var IDS = ['joy', 't_atk', 't_dodge', 't_heavy', 't_block', 't_scan', 't_dart', 't_load', 't_heal', 't_sneak', 't_int', 't_bait', 't_snare', 't_map', 't_x'];
  var NAMES = { t_map: 'แผนที่', joy: 'จอยสติ๊ก', t_atk: 'ตี', t_dodge: 'หลบ', t_heavy: 'ชาร์จตีหนัก', t_block: 'กัน', t_scan: 'สแกน', t_dart: 'ยิงยา', t_load: 'สลับยา', t_heal: 'ยาสมาน', t_sneak: 'ย่อ', t_int: 'ตรวจ/เก็บ', t_bait: 'เหยื่อ', t_snare: 'กับดัก', t_x: 'ถอย' };
  var UI = { s: 1, o: 1, pos: {}, k: {} }, TE = false, dirty = {}, sel = null, drag = null, tmp = {}, view = 'playing';
  var tEl = document.getElementById('touch'), bar = document.getElementById('tedit');
  function el(id) { return document.getElementById(id); }
  try {
    var raw = JSON.parse(window.localStorage.getItem(KEY) || 'null');
    if (raw && typeof raw === 'object') {
      if (+raw.s >= .6 && +raw.s <= 1.8) UI.s = +raw.s;
      if (+raw.o >= .25 && +raw.o <= 1) UI.o = +raw.o;
      IDS.forEach(function (id) {
        var q = raw.pos && raw.pos[id]; if (q && q.length === 2 && +q[0] >= -.2 && +q[0] <= 1.2 && +q[1] >= -.2 && +q[1] <= 1.2) UI.pos[id] = [+q[0], +q[1]];
        var kk = raw.k && +raw.k[id]; if (kk >= .5 && kk <= 2.2) UI.k[id] = kk;
      });
    }
  } catch (e) {}
  function store() { try { window.localStorage.setItem(KEY, JSON.stringify(UI)); } catch (e) {} }
  function place(e, l, t) {
    var iw = window.innerWidth, ih = window.innerHeight, r = e.getBoundingClientRect();
    l = Math.max(0, Math.min(l, iw - (r.width || 0))); t = Math.max(0, Math.min(t, ih - (r.height || 0)));
    e.style.left = l + 'px'; e.style.top = t + 'px'; e.style.right = 'auto'; e.style.bottom = 'auto';
    return [l / iw, t / ih];
  }
  function apply() {
    try {
      if (!tEl) return;
      tEl.style.setProperty('--ts', UI.s); tEl.style.setProperty('--to', UI.o);
      IDS.forEach(function (id) {
        var e = el(id); if (!e) return;
        e.style.setProperty('--k', UI.k[id] || 1);
        var q = TE && tmp[id] ? tmp[id] : UI.pos[id];
        if (q) { e.style.left = (q[0] * window.innerWidth) + 'px'; e.style.top = (q[1] * window.innerHeight) + 'px'; e.style.right = 'auto'; e.style.bottom = 'auto'; }
        else { e.style.left = ''; e.style.top = ''; e.style.right = ''; e.style.bottom = ''; }
      });
      IDS.forEach(function (id) {
        var e = el(id), q = TE && tmp[id] ? tmp[id] : UI.pos[id];
        if (e && q) { var r = e.getBoundingClientRect(); if (r.width > 0) { var pp = place(e, q[0] * window.innerWidth, q[1] * window.innerHeight); if (TE && tmp[id]) tmp[id] = pp; else UI.pos[id] = pp; } }
      });
    } catch (e) {}
  }
  function setView(v) { view = v; document.body.setAttribute('data-te', v); var b = bar && bar.querySelector ? bar.querySelector('[data-te="view"]') : null; if (b) b.textContent = 'มุมมอง: ' + (v === 'playing' ? 'ต่อสู้' : 'ลาดตระเวน'); }
  function ensure() {
    IDS.forEach(function (id) {
      if (tmp[id]) return; var e = el(id), r = e.getBoundingClientRect();
      if (r.width > 0) tmp[id] = [r.left / window.innerWidth, r.top / window.innerHeight];
    });
  }
  function select(id) {
    sel = id;
    IDS.forEach(function (i) { var e = el(i); if (e && e.classList) { if (i === id) e.classList.add('sel'); else e.classList.remove('sel'); } });
    var l = document.getElementById('te_sel'); if (l) l.textContent = id ? 'เลือก: ' + NAMES[id] + ' (ขนาด ×' + (UI.k[id] || 1).toFixed(1) + ')' : 'ลากปุ่มเพื่อย้าย · แตะปุ่มเพื่อเลือก';
  }
  function enter() {
    try {
      document.body.classList.add('tedit'); TE = true; dirty = {}; tmp = {};
      IDS.forEach(function (id) { if (UI.pos[id]) tmp[id] = UI.pos[id].slice(); });
      setView('playing'); apply(); ensure(); select(null);
    } catch (e) {}
  }
  function leave() {
    if (!TE && !(document.body && document.body.classList && document.body.classList.contains('tedit'))) return;
    drag = null; TE = false; document.body.classList.remove('tedit'); document.body.removeAttribute('data-te'); select(null);
    IDS.forEach(function (id) { if (dirty[id] && tmp[id]) UI.pos[id] = tmp[id]; });
    tmp = {}; store(); apply();
  }
  window.__enterTEdit = enter;
  (function () {
    var ex = document.getElementById('te_exit'); if (ex) { ex.addEventListener('click', function (e) { if (e.stopPropagation) e.stopPropagation(); leave(); }); ex.addEventListener('pointerup', function (e) { if (e.stopPropagation) e.stopPropagation(); leave(); }); }
    window.addEventListener('keydown', function (e) { if ((TE || (document.body && document.body.classList && document.body.classList.contains('tedit'))) && (e.key === 'Escape' || e.key === 'Enter')) { if (e.preventDefault) e.preventDefault(); leave(); } }, true);
  })();
  function mirror() {
    var iw = window.innerWidth, done = {}, keep = view;
    ['playing', 'field'].forEach(function (v) {
      setView(v); apply(); ensure();
      IDS.forEach(function (id) {
        if (done[id] || !tmp[id]) return; var r = el(id).getBoundingClientRect(); if (!(r.width > 0)) return;
        tmp[id] = [(iw - (tmp[id][0] * iw + r.width)) / iw, tmp[id][1]]; dirty[id] = true; done[id] = true;
      });
    });
    setView(keep); apply();
  }
  if (bar) bar.addEventListener('click', function (e) {
    var b = e.target && e.target.getAttribute ? e.target : null; var a = b && b.getAttribute('data-te'); if (!a) return;
    if (a === 's-') UI.s = Math.max(.6, Math.round((UI.s - .1) * 10) / 10);
    else if (a === 's+') UI.s = Math.min(1.8, Math.round((UI.s + .1) * 10) / 10);
    else if (a === 'k-' || a === 'k+') { if (!sel) return; var kv = (UI.k[sel] || 1) + (a === 'k+' ? .1 : -.1); UI.k[sel] = Math.max(.5, Math.min(2.2, Math.round(kv * 10) / 10)); select(sel); }
    else if (a === 'o') UI.o = UI.o > .9 ? .6 : (UI.o > .5 ? .35 : 1);
    else if (a === 'view') { setView(view === 'playing' ? 'field' : 'playing'); apply(); ensure(); apply(); return; }
    else if (a === 'bar') { bar.classList.toggle('tbot'); return; }
    else if (a === 'mirror') { mirror(); return; }
    else if (a === 'reset') { UI = { s: 1, o: 1, pos: {}, k: {} }; tmp = {}; dirty = {}; apply(); ensure(); select(null); store(); return; }
    else if (a === 'done') { leave(); return; }
    apply(); store();
  });
  if (tEl) {
    tEl.addEventListener('pointerdown', function (e) {
      if (!TE) return;
      e.stopPropagation(); if (e.preventDefault) e.preventDefault();
      var t = e.target, e0 = t && t.closest ? t.closest('#joy,.tb') : null; if (!e0 || IDS.indexOf(e0.id) < 0) return;
      var r = e0.getBoundingClientRect();
      drag = { id: e0.id, el: e0, dx: e.clientX - r.left, dy: e.clientY - r.top, pid: e.pointerId }; select(e0.id);
    }, true);
    window.addEventListener('pointermove', function (e) {
      if (!TE || !drag || drag.pid !== e.pointerId) return;
      tmp[drag.id] = place(drag.el, e.clientX - drag.dx, e.clientY - drag.dy); dirty[drag.id] = true;
    });
    var up = function (e) { if (drag && drag.pid === e.pointerId) drag = null; };
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  }
  window.addEventListener('resize', function () { apply(); });
  apply();
  window.__ui = { get: function () { return UI; }, apply: apply, enter: enter, leave: leave };
  if (document.addEventListener) document.addEventListener('visibilitychange', function () { try { if (document.hidden && TE) leave(); } catch (e) {} });
})();
function toggleFullscreen() {
  try {
    var d = document, el = d.documentElement;
    if (!d.fullscreenElement && !d.webkitFullscreenElement) {
      var f = el.requestFullscreen || el.webkitRequestFullscreen;
      if (f) { var pr = f.call(el); if (pr && pr.then) pr.then(function () { try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function () {}); } catch (e) {} }, function () {}); }
    } else { var x = d.exitFullscreen || d.webkitExitFullscreen; if (x) x.call(d); }
  } catch (e) {}
}
function fitCanvas() {
  try {
    var iw = window.innerWidth, ih = window.innerHeight, wrap = document.getElementById('wrap');
    if (iw && ih && wrap && wrap.style) {
      var fh = isTouch ? 0 : 28, ar = clamp(iw / Math.max(100, ih - fh), 1.6, 2.134);
      VW = Math.round(H * ar); OFFX = (VW - W) / 2;
      wrap.style.width = Math.floor(Math.min(iw, (ih - fh) * ar)) + 'px'; wrap.style.aspectRatio = VW + ' / ' + H;
    }
    var r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    var n = clamp(Math.ceil(r.width * dpr / VW - .05), 1, 3);
    if (n !== RS || canvas.width !== VW * n) { RS = n; canvas.width = VW * n; canvas.height = H * n; }
    hudCalc();
  } catch (e) {}
}
window.addEventListener('resize', fitCanvas);
if (document.addEventListener) document.addEventListener('visibilitychange', function () { if (document.hidden) { clearInput(false); if (mode === 'playing' || mode === 'field') paused = true; } });

