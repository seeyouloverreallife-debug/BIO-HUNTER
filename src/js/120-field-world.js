/* ================= FIELD (habitat exploration) ================= */
/* v18.4: โลกภาคสนามโหลดจากข้อมูลแมพ (MAPS ใน 118-field-maps.js) — ตัวแปรด้านล่างถูกกำหนดใหม่ทุกครั้งที่ loadMap(เขต)
   WW/WH/SITES/DRINK_PT/REST_PT/PATROL/CAMPS/SIGNS/HAB ใช้ร่วมกับโค้ดภาคสนามทั้งหมดตามเดิม */
var WW = 2700, WH = 1725;
var SITES = null, DRINK_PT = null, REST_PT = null, PATROL = null;
var ROUTINE = [{ k: 'graze', dur: 15 }, { k: 'drink', dur: 11 }, { k: 'rest', dur: 22 }, { k: 'patrol', dur: 0 }];
var STAGE_NAME = { graze: 'กำลังกินหญ้า', drink: 'กำลังดื่มน้ำ', rest: 'กำลังนอนพัก', patrol: 'กำลังเดินสำรวจอาณาเขต' };
/* แคมป์ (แนว Monster Hunter): พักฟื้นล้างพิษ/แผลไฟ + ย้ายค่ายไปแคมป์ที่เคยพบ — A คือจุดเริ่มต้น */
var CAMPS = null, SIGNS = null, HAB = null;
var MAPKEY = '', MAP = null;
var FIELD = null;
var fbg = document.createElement('canvas');

function copyPt(o) { var c = {}, k; for (k in o) c[k] = o[k]; return c; }
function mapLabels() { /* ป้ายโซน (ชื่อตามแมพ) — ใช้บนพื้นและแผนที่ */
  var L = MAP.labels, S0 = SITES;
  return [{ n: L.meadow, x: S0.meadow.x, y: S0.meadow.y, c: '#cfe8c0' }, { n: L.water, x: S0.water.x, y: S0.water.y, c: '#bfe0f0' }, { n: L.den, x: S0.den.x, y: S0.den.y, c: '#e0dccb' }, { n: L.bloom, x: S0.bloom.x, y: S0.bloom.y, c: '#e0b8ff' }];
}
function mapHabPts() { return { graze: { x: SITES.meadow.x, y: SITES.meadow.y, n: 'กินหญ้า' }, drink: { x: DRINK_PT.x, y: DRINK_PT.y, n: 'ดื่มน้ำ' }, rest: { x: REST_PT.x, y: REST_PT.y, n: 'นอนพัก' } }; }

/* พงไม้/ต้นไม้/ก้อนหินของแมพ (เมล็ดสุ่มคงที่ → ผังเดิมทุกครั้ง) */
function buildHab(d) {
  var seed = d.habSeed, bushes = [], trees = [], frocks = [], i, j, h = d.hab, sit = d.sites, cps = d.camps, WX = d.w, HY = d.h;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  var cl = h.clusters;
  for (i = 0; i < cl.length; i++) for (j = 0; j < h.per; j++) bushes.push({ x: cl[i][0] + (rnd() - .5) * h.spx, y: cl[i][1] + (rnd() - .5) * h.spy, r: h.rmin + rnd() * h.rvar });
  var nRing = h.ring;
  for (i = 0; i < nRing; i++) { var a = i / nRing * TAU; trees.push({ x: WX / 2 + Math.cos(a) * (WX / 2 - 14) * 1.0, y: HY / 2 + Math.sin(a) * (HY / 2 - 14) * 1.0, r: 28 + rnd() * 10 }); }
  for (i = 0; i < h.rnd; i++) trees.push({ x: 120 + rnd() * (WX - 240), y: 90 + rnd() * (HY - 180), r: 20 + rnd() * 9 });
  trees = trees.filter(function (t) {
    if (dist(t.x, t.y, cps[0].x - 10, cps[0].y) < 140) return false;
    if (dist(t.x, t.y, sit.meadow.x, sit.meadow.y) < sit.meadow.r - 20 && Math.abs(t.x - WX / 2) < WX / 2 - 60) return false;
    if (Math.pow((t.x - sit.water.x) / (sit.water.rx + 40), 2) + Math.pow((t.y - sit.water.y) / (sit.water.ry + 40), 2) < 1) return false;
    if (dist(t.x, t.y, sit.den.x, sit.den.y) < 160) return false;
    return true;
  });
  for (i = 0; i < h.denRocks.length; i++) frocks.push({ x: sit.den.x + h.denRocks[i][0] * h.denK[0] * h.denK[1], y: sit.den.y + h.denRocks[i][1] * h.denK[0] * h.denK[1], r: h.denRocks[i][2] });
  h.rocks.forEach(function (f) { frocks.push({ x: f[0], y: f[1], r: f[2] }); });
  bushes = bushes.filter(function (b) {
    return dist(b.x, b.y, sit.den.x, sit.den.y) > 170 && dist(b.x, b.y, sit.meadow.x, sit.meadow.y) > 150 && dist(b.x, b.y, cps[0].x - 10, cps[0].y) > 170 &&
      Math.pow((b.x - sit.water.x) / (sit.water.rx + 20), 2) + Math.pow((b.y - sit.water.y) / (sit.water.ry + 20), 2) > 1;
  });
  var keepClear = d.patrol.concat([d.drink, d.rest]);
  for (i = 0; i < cps.length; i++) keepClear.push({ x: cps[i].x, y: cps[i].y, r: 40 });
  for (i = 0; i < d.signs.length; i++) keepClear.push(d.signs[i]);
  function clear(o) { for (var q = 0; q < keepClear.length; q++) if (dist(o.x, o.y, keepClear[q].x, keepClear[q].y) < o.r + 70) return false; return true; }
  frocks = frocks.filter(clear); trees = trees.filter(clear); bushes = bushes.filter(function (b) { return clear({ x: b.x, y: b.y, r: b.r * .5 }); });
  return { bushes: bushes, trees: trees, frocks: frocks };
}

/* พื้นแมพ (วาดครั้งเดียวต่อแมพ): สีตาม pal ของแมพ */
function buildFieldBg() {
  var d = MAP, pal = d.pal, c = fbg.getContext('2d'), seed = d.bgSeed, i;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  var groundArt = paintedGround(c), m = SITES.meadow;
  if (!groundArt) {
  c.fillStyle = pal.base; c.fillRect(0, 0, WW, WH);
  for (i = 0; i < pal.blobs; i++) {
    c.fillStyle = 'rgba(' + (pal.blob[0] + rnd() * 20 | 0) + ',' + (pal.blob[1] + rnd() * 36 | 0) + ',' + (pal.blob[2] + rnd() * 20 | 0) + ',.35)';
    c.beginPath(); c.arc(rnd() * WW, rnd() * WH, 20 + rnd() * 50, 0, TAU); c.fill();
  }
  var m = SITES.meadow, g = c.createRadialGradient(m.x, m.y, 20, m.x, m.y, m.r);
  g.addColorStop(0, pal.meadow[0]); g.addColorStop(.7, pal.meadow[1]); g.addColorStop(1, pal.meadow[2]);
  c.fillStyle = g; c.beginPath(); c.arc(m.x, m.y, m.r, 0, TAU); c.fill();
  }
  var w = SITES.water;
  if (!paintedWater(c,w)) {
  c.fillStyle = pal.water[0]; c.beginPath(); c.ellipse(w.x, w.y, w.rx + 26, w.ry + 22, 0, 0, TAU); c.fill();
  var wg = c.createRadialGradient(w.x, w.y, 10, w.x, w.y, Math.max(w.rx, w.ry)); wg.addColorStop(0, pal.water[1]); wg.addColorStop(1, pal.water[2]);
  c.fillStyle = wg; c.beginPath(); c.ellipse(w.x, w.y, w.rx, w.ry, 0, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(200,230,255,.25)'; c.lineWidth = 2;
  for (i = 0; i < 6; i++) { c.beginPath(); c.ellipse(w.x + (rnd() - .5) * (w.rx * 2 / 3), w.y + (rnd() - .5) * (w.ry * .5), 22 + rnd() * 20, 8 + rnd() * 6, 0, 0, TAU); c.stroke(); }
  } else {
    /* Keep the decorative random stream identical outside the water area. */
    for (i = 0; i < 6; i++) { rnd(); rnd(); rnd(); rnd(); }
  }
  var dn = SITES.den, dg = c.createRadialGradient(dn.x, dn.y, 10, dn.x, dn.y, dn.r + 30); dg.addColorStop(0, pal.den[0]); dg.addColorStop(.75, pal.den[1]); dg.addColorStop(1, pal.den[2]);
  c.fillStyle = dg; c.beginPath(); c.arc(dn.x, dn.y, dn.r + 30, 0, TAU); c.fill();
  var b = SITES.bloom, bgd = c.createRadialGradient(b.x, b.y, 10, b.x, b.y, b.r + 20); bgd.addColorStop(0, 'rgba(176,106,216,.6)'); bgd.addColorStop(1, 'rgba(176,106,216,0)');
  c.fillStyle = bgd; c.beginPath(); c.arc(b.x, b.y, b.r + 20, 0, TAU); c.fill();
  for (i = 0; i < 90; i++) { var a = rnd() * TAU, rr = rnd() * b.r; c.fillStyle = 'rgba(210,150,255,.55)'; c.beginPath(); c.arc(b.x + Math.cos(a) * rr, b.y + Math.sin(a) * rr, 3 + rnd() * 5, 0, TAU); c.fill(); }
  if (!groundArt) {
  for (i = 0; i < pal.grassN; i++) {
    var gx = rnd() * WW, gy = rnd() * WH; c.strokeStyle = 'rgba(' + (pal.grass[0] + rnd() * 40 | 0) + ',' + (pal.grass[1] + rnd() * 50 | 0) + ',' + (pal.grass[2] + rnd() * 30 | 0) + ',.3)'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx + (rnd() - .5) * 6, gy - 5 - rnd() * 6); c.stroke();
  }
  for (i = 0; i < pal.scree; i++) { /* กรวด/เศษหิน (สันเขา) */
    c.fillStyle = 'rgba(' + (120 + rnd() * 40 | 0) + ',' + (116 + rnd() * 36 | 0) + ',' + (102 + rnd() * 30 | 0) + ',.4)'; c.beginPath(); c.arc(rnd() * WW, rnd() * WH, 1.5 + rnd() * 3.5, 0, TAU); c.fill();
  }
  }
  for (i = 0; i < pal.holes; i++) { /* เนินโพรงกระต่าย: วงดินนูนมีรูมืดตรงกลาง */
    var hx = m.x + (rnd() - .5) * m.r * 2.1, hy = m.y + (rnd() - .5) * m.r * 1.4, hr = 9 + rnd() * 9;
    c.fillStyle = 'rgba(96,76,52,.75)'; c.beginPath(); c.ellipse(hx, hy + 2, hr * 1.5, hr * 1.05, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(28,20,14,.9)'; c.beginPath(); c.ellipse(hx, hy, hr * .8, hr * .5, 0, 0, TAU); c.fill();
  }
  var fr = HAB.frocks; for (i = 0; i < fr.length; i++) {
    var R = fr[i]; c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(R.x + 5, R.y + 8, R.r * 1.05, R.r * .85, 0, 0, TAU); c.fill();
    if (visualDraw(c, 'rock_' + ['a','b','c'][i % 3], R.x - R.r * 1.15, R.y - R.r * 1.15, R.r * 2.3, R.r * 2.3)) continue;
    var rg = c.createRadialGradient(R.x - R.r * .3, R.y - R.r * .3, 2, R.x, R.y, R.r); rg.addColorStop(0, pal.rockFill[0]); rg.addColorStop(1, pal.rockFill[1]);
    c.fillStyle = rg; c.beginPath(); c.arc(R.x, R.y, R.r, 0, TAU); c.fill();
  }
}

/* โหลดแมพของเขตป่า (คืน def) — สร้างพื้นใหม่เฉพาะตอนเปลี่ยนแมพ */
function loadMap(key) {
  var d = MAPS[key] || MAPS.stag, k, fs;
  if (MAPKEY === d.key) return d;
  MAPKEY = d.key; MAP = d;
  WW = d.w; WH = d.h;
  SITES = {}; for (k in d.sites) SITES[k] = copyPt(d.sites[k]);
  DRINK_PT = copyPt(d.drink); REST_PT = copyPt(d.rest);
  PATROL = d.patrol.map(copyPt); CAMPS = d.camps.map(copyPt); SIGNS = d.signs.map(copyPt);
  HAB = buildHab(d);
  if (fbg.width !== WW || fbg.height !== WH) { fbg.width = WW; fbg.height = WH; }
  buildFieldBg();
  FG_W = Math.ceil(WW / 20); FG_H = Math.ceil(WH / 20);
  fs = typeof FOGS === 'number' ? FOGS : .1;
  if (fogC) { fogC.width = Math.ceil(WW * fs); fogC.height = Math.ceil(WH * fs); }
  ZONE_LB = mapLabels(); HAB_PT = mapHabPts();
  return d;
}
var FG_W = 0, FG_H = 0, fogC = null, ZONE_LB = null, HAB_PT = null;
loadMap('stag');
