/* ================= HELPERS ================= */
function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function rand(a, b) { return a + Math.random() * (b - a); }
function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
function angDiff(a, b) { var d = a - b; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return d; }
function lerp(a, b, t) { return a + (b - a) * t; }
function turnToward(cur, target, step) { var d = angDiff(target, cur); return Math.abs(d) <= step ? target : cur + (d > 0 ? step : -step); }
function lvl(pts) { return pts >= 130 ? 3 : pts >= 85 ? 2 : pts >= 40 ? 1 : 0; }
function pushOut(o, cx, cy, cr) {
  var dx = o.x - cx, dy = o.y - cy, d = Math.hypot(dx, dy), min = o.r + cr;
  if (d < min) { if (d < 0.001) { dx = 1; dy = 0; d = 1; } o.x = cx + dx / d * min; o.y = cy + dy / d * min; return true; }
  return false;
}
function keepInArena(o) {
  var dx = o.x - CX, dy = o.y - CY, d = Math.hypot(dx, dy), max = ARENA_R - o.r;
  if (d > max) { o.x = CX + dx / d * max; o.y = CY + dy / d * max; return true; }
  return false;
}
function inWedge(ox, oy, ang, half, R, px, py, pr) {
  var dx = px - ox, dy = py - oy, d = Math.hypot(dx, dy);
  if (d > R + pr) return false;
  if (d < pr + 8) return true;
  return Math.abs(angDiff(Math.atan2(dy, dx), ang)) <= half + Math.atan2(pr, d);
}
function fmtTime(s) { var m = Math.floor(s / 60), r = Math.floor(s % 60); return m + ':' + (r < 10 ? '0' : '') + r; }

/* ================= AUDIO ================= */
var AC = null, muted = false;
function initAudio() {
  if (AC) return;
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; }
}
function tone(f, dur, type, vol, slide) {
  if (!AC || muted || !setMul('vol')) return;
  try {
    var o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
    o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t + dur);
    g.gain.setValueAtTime(Math.max(.0002, (vol || .08) * setMul('vol')), t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + dur);
  } catch (e) {}
}
function noise(dur, vol) {
  if (!AC || muted || !setMul('vol')) return;
  try {
    var n = Math.floor(AC.sampleRate * dur), b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = AC.createBufferSource(), g = AC.createGain(); s.buffer = b; g.gain.value = vol * setMul('vol');
    s.connect(g); g.connect(AC.destination); s.start();
  } catch (e) {}
}
function sfx(n) {
  if (!AC || muted) return;
  switch (n) {
    case 'swing': noise(.07, .07); break;
    case 'hit': tone(220 * sfxPm, .09, 'square', .08, -120); noise(.07, .08); break;
    case 'heavy': tone(110 * sfxPm, .18, 'sawtooth', .12, -70); noise(.14, .14); break;
    case 'clang': tone(1500, .05, 'square', .07, -1000); tone(840, .1, 'triangle', .07, -300); noise(.04, .08); break;
    case 'flesh': tone(85, .1, 'sine', .1, -35); break;
    case 'dodge': noise(.1, .05); break;
    case 'hurt': tone(140, .2, 'sawtooth', .12, -80); break;
    case 'block': tone(520, .06, 'square', .07, -200); break;
    case 'parry': tone(880, .12, 'triangle', .12, 300); tone(1320, .1, 'triangle', .08, 0); break;
    case 'perfect': tone(660, .12, 'triangle', .1, 330); break;
    case 'roar': tone(90, .6, 'sawtooth', .14, -30); noise(.5, .1); break;
    case 'stomp': tone(60, .25, 'sine', .2, -30); noise(.2, .12); break;
    case 'spore': tone(300, .3, 'sine', .06, -150); noise(.3, .06); break;
    case 'scan': tone(1200, .05, 'sine', .04, 200); break;
    case 'dart': tone(900, .08, 'square', .05, -500); break;
    case 'heal': tone(520, .2, 'sine', .08, 260); break;
    case 'break': tone(200, .3, 'square', .12, -150); noise(.25, .15); break;
  }
}

/* ================= DOM ================= */
var canvas = document.getElementById('game'), ctx = canvas.getContext('2d');
var ov = document.getElementById('ov'), panelEl = document.getElementById('panel'), titleEl = document.getElementById('title');
var GAME_VER = '18.6.1', titleArm = 0;

