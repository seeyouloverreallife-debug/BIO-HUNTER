/* ===== v17.7 แผนที่การล่า: หมอกสำรวจ · ไอคอนร่องรอยตามชนิด · ตัวชี้ขอบจอ · แผนที่เต็ม (N / แตะมินิแมป) · จดจำกิจวัตรที่เห็น ===== */
var FOGS = .1, SGIMG = {};
fogC = document.createElement('canvas'); FG_W = Math.ceil(WW / 20); FG_H = Math.ceil(WH / 20); /* FG_W/FG_H/fogC/ZONE_LB/HAB_PT ประกาศใน 120-field-world.js และตั้งใหม่ทุกครั้งที่ loadMap */
fogC.width = Math.ceil(WW * FOGS); fogC.height = Math.ceil(WH * FOGS);
ZONE_LB = mapLabels(); HAB_PT = mapHabPts();
var STAGE_SHORT = { graze: 'กินหญ้า', drink: 'ดื่มน้ำ', rest: 'นอนพัก', patrol: 'เดินสำรวจ' };
function signKind(id) {
  if (id === 'tracks') return { c: '#9fe8ff', ic: '', g: 'รอย', n: 'ร่องรอย/ตัวอย่าง', cat: 'clue' };
  if (id === 'dung') return { c: '#9fe8ff', ic: '', g: 'ตัวอย่าง', n: 'ร่องรอย/ตัวอย่าง', cat: 'clue' };
  if (id.indexOf('plant_') === 0) return { c: '#c8f08a', ic: 'm_' + id.split('_')[1].replace(/\d+$/, ''), g: '', n: 'พืชวัตถุดิบ', cat: 'plant' };
  if (id.indexOf('shed') === 0) return { c: '#e8b878', ic: 'm_hide', g: '', n: 'หนังที่ลอกร่วง', cat: 'hide' };
  return { c: '#8be88a', ic: 'i_salve', g: '', n: 'สมุนไพร', cat: 'herb' };
}
function fogReset(F) {
  var x = fogC.getContext('2d'); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, fogC.width, fogC.height);
  x.fillStyle = 'rgba(5,9,7,.94)'; x.fillRect(0, 0, fogC.width, fogC.height);
  F.fg = new Uint8Array(FG_W * FG_H); F.fgN = 0; F.rvX = -999; F.rvY = -999;
}
function fogReveal(F, px, py) { /* เปิดหมอกเป็นวงรีรอบตัวผู้เล่น ≈ พื้นที่ที่เห็นบนหน้าจอ */
  var x = fogC.getContext('2d'), s = FOGS, g;
  x.save(); x.globalCompositeOperation = 'destination-out'; x.translate(px * s, py * s); x.scale(1, .62);
  g = x.createRadialGradient(0, 0, 0, 0, 0, 46); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.78, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.beginPath(); x.arc(0, 0, 46, 0, TAU); x.fill(); x.restore();
  var cx = (px / 20) | 0, cy = (py / 20) | 0, i, j, dx, dy;
  for (j = Math.max(0, cy - 13); j <= Math.min(FG_H - 1, cy + 13); j++) for (i = Math.max(0, cx - 21); i <= Math.min(FG_W - 1, cx + 21); i++) {
    dx = (i - cx) / 21; dy = (j - cy) / 13;
    if (dx * dx + dy * dy <= 1 && !F.fg[j * FG_W + i]) { F.fg[j * FG_W + i] = 1; F.fgN++; }
  }
}
function fogKnown(F, x, y) { var i = (x / 20) | 0, j = (y / 20) | 0; return i >= 0 && j >= 0 && i < FG_W && j < FG_H && F.fg[j * FG_W + i] === 1; }
function fogPct(F) { return Math.min(100, Math.round(F.fgN / (FG_W * FG_H * .78) * 100)); }
function fieldSignsDone(F) { var n = 0; for (var i = 0; i < SIGNS.length; i++) if (F.done[SIGNS[i].id]) n++; return n; }
function monsterLive(F) { return !!(F.onScreen || F.scan || (PREP && PREP.done.route)); }
/* ---- แคมป์: เมนูพักฟื้น / ย้ายค่าย ---- */
function campOptions(F) {
  var o = [], i, c0 = CAMPS[F.campMenu], hurt = F.hpLoss > .5 || P.hp < P.maxHp - 1 || P.infT > 0;
  o.push({ t: hurt ? 'พักฟื้น — ล้างพิษสปอร์/แผลไฟ HP เต็ม' : 'พักฟื้น (สภาพเต็มอยู่แล้ว)', a: 'rest', ok: hurt });
  for (i = 0; i < CAMPS.length; i++) if (i !== F.campMenu && F.campSeen[i]) o.push({ t: 'ย้ายไป ' + CAMPS[i].n + ' (' + Math.round(dist(c0.x, c0.y, CAMPS[i].x, CAMPS[i].y) / 10) + ' ม.)', a: 'go', i: i, ok: true });
  o.push({ t: 'ปิดเมนู', a: 'close', ok: true });
  return o;
}
function campDo(F, op) {
  if (!op || !op.ok) return;
  if (op.a === 'rest') { P.hp = P.maxHp; P.infT = 0; clearFx(); F.hpLoss = 0; F.campMenu = -1; sfx('heal'); fieldMsg('พักที่แคมป์ — ล้างพิษและแผล HP เต็มแล้ว', 4); }
  else if (op.a === 'go') { var c = CAMPS[op.i]; P.x = c.x + 40; P.y = c.y + 26; moveObstacles(P); F.campMenu = -1; F.rvX = -999; F.aw = Math.max(0, F.aw - .35); F.fLatch = true; sfx('scan'); fieldMsg('ย้ายค่ายไป ' + c.n, 4); }
  else F.campMenu = -1;
}
function campMenuKeys(F) {
  var ops = campOptions(F), n;
  for (n = 1; n <= 9; n++) if (keys[String(n)]) { keys[String(n)] = false; campDo(F, ops[n - 1]); return; }
  if (keys['x']) { keys['x'] = false; F.campMenu = -1; }
  if (keys['f']) { if (!F.fLatch) { F.fLatch = true; F.campMenu = -1; } } else F.fLatch = false;
}
function drawCampMenu() {
  var F = FIELD, ops = campOptions(F), kk = clamp(Math.min(HK, (VW - 16) / 600), 1, 1.35), pw = 560, rowH = 46, ph = 84 + ops.length * (rowH + 8), px0 = CX - pw / 2, py0 = CY - ph / 2;
  F.cmRects = [];
  hudBlock(CX, CY, kk, function () {
    ctx.fillStyle = 'rgba(4,8,6,.72)'; ctx.fillRect(-OFFX - 400, -300, VW + 800, H + 600);
    ctx.fillStyle = 'rgba(14,20,16,.97)'; ctx.fillRect(px0, py0, pw, ph); ctx.strokeStyle = '#4d7a5f'; ctx.lineWidth = 2; ctx.strokeRect(px0, py0, pw, ph);
    txt(CAMPS[F.campMenu].n, CX, py0 + 26, 18, '#ffe9a0', 'center', true);
    txt(isTouch ? 'เวลาหยุดอยู่ — แตะที่ตัวเลือก (แตะนอกกรอบเพื่อปิด)' : 'เวลาหยุดอยู่ — กดเลข 1–' + ops.length + ' หรือคลิกที่ตัวเลือก (F/X ปิด)', CX, py0 + 50, 12, '#9aa39a', 'center', true);
    for (var i = 0; i < ops.length; i++) {
      var ry = py0 + 70 + i * (rowH + 8), o = ops[i];
      ctx.fillStyle = o.ok ? 'rgba(24,44,32,.95)' : 'rgba(24,30,26,.8)'; ctx.fillRect(px0 + 18, ry, pw - 36, rowH);
      ctx.strokeStyle = o.ok ? '#7fe0b5' : '#3c4a42'; ctx.lineWidth = 1.5; ctx.strokeRect(px0 + 18, ry, pw - 36, rowH);
      txt((i + 1) + '.  ' + o.t, px0 + 36, ry + rowH / 2 + 1, 15, o.ok ? '#e9f7ee' : '#6f7a72', 'left', true);
      F.cmRects.push({ x: CX + (px0 + 18 - CX) * kk + OFFX, y: CY + (ry - CY) * kk, w: (pw - 36) * kk, h: rowH * kk });
    }
    F.cmPanel = { x: CX + (px0 - CX) * kk + OFFX, y: CY + (py0 - CY) * kk, w: pw * kk, h: ph * kk };
  });
}
function drawCampsWorld(F) {
  for (var ci = 0; ci < CAMPS.length; ci++) {
    var c = CAMPS[ci], fl = .6 + .4 * Math.sin(tNow * 9 + ci * 2), fx = c.x + 26, fy = c.y + 14;
    var fg = ctx.createRadialGradient(fx, fy, 2, fx, fy, 50); fg.addColorStop(0, 'rgba(255,170,70,' + (.5 * fl) + ')'); fg.addColorStop(1, 'rgba(255,170,70,0)');
    ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(fx, fy, 50, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(c.x + 4, c.y + 26, 40, 11, 0, 0, TAU); ctx.fill();
    if (!visualDraw(ctx,'fld_tent',c.x-45,c.y-40,90,70)) {
    ctx.fillStyle = '#7a6a54'; ctx.strokeStyle = '#2a2016'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(c.x - 36, c.y + 24); ctx.lineTo(c.x, c.y - 28); ctx.lineTo(c.x + 36, c.y + 24); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#4a3c2c'; ctx.beginPath(); ctx.moveTo(c.x - 7, c.y + 24); ctx.lineTo(c.x, c.y - 2); ctx.lineTo(c.x + 7, c.y + 24); ctx.closePath(); ctx.fill();
    }
    if (!visualDraw(ctx,'fld_campfire',fx-16,fy-16,32,32,Math.floor(tNow*3+ci)%2,96,2)) {
    ctx.fillStyle = '#ffb040'; ctx.beginPath(); ctx.arc(fx, fy, 4 + 1.6 * fl, 0, TAU); ctx.fill();
    ctx.fillStyle = '#3a2a20'; ctx.fillRect(fx - 8, fy + 5, 16, 3);
    }
    var pc = F.nearCamp === ci; txt(c.id, c.x, c.y - 40, pc ? 18 : 15, pc ? '#ffe9a0' : '#e8d8b0', 'center', true);
  }
}
function drawTrailWorld(F) {
  var tr = F.trailT > 0, pulse = .6 + .4 * Math.sin(tNow * 6), p = P, i;
  for (i = 0; i < F.cr.length; i++) {
    var c = F.cr[i], age = F.t - c.t; if (age > 160) continue;
    var dp = dist(p.x, p.y, c.x, c.y); if (!tr && dp > 300) continue;
    var al = (tr ? .85 : .55 * (1 - dp / 300)) * (1 - age / 160); if (al < .05) continue;
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.a); ctx.translate(0, c.s ? 6 : -6);
    ctx.fillStyle = tr ? 'rgba(120,225,255,' + (al * pulse) + ')' : 'rgba(225,215,185,' + al + ')';
    ctx.beginPath(); ctx.ellipse(0, 0, 7, 4, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(-9, 0, 4, 2.6, 0, 0, TAU); ctx.fill();
    if (tr) { ctx.strokeStyle = 'rgba(120,225,255,' + (al * .6) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, 0, 12, 8, 0, 0, TAU); ctx.stroke(); }
    ctx.restore();
  }
  if (tr && F.cr.length) { var ec = F.cr[F.cr.length - 1]; ctx.strokeStyle = 'rgba(150,235,255,.9)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(ec.x, ec.y, 18 + 5 * pulse, 0, TAU); ctx.stroke(); txt('ปลายรอย', ec.x, ec.y - 30, 14, '#bff0ff', 'center', true); }
}
/* วาดแผนที่ทั้งก้อนลงในสี่เหลี่ยม (mx,my,mw,mh) — ใช้ร่วมกันทั้งมินิแมปและแผนที่เต็ม */
function drawMapCore(mx, my, mw, mh, full) {
  var F = FIELD, p = P, m = M, sx = mw / WW, sy = mh / WH, i, j, z, kd, im, rr = full ? 6 : 3.2, fsz = full ? 13 : 9;
  ctx.fillStyle = 'rgba(0,0,0,.62)'; ctx.fillRect(mx - 4, my - 4, mw + 8, mh + 8);
  ctx.globalAlpha = .92; ctx.drawImage(fbg, mx, my, mw, mh); ctx.globalAlpha = 1;
  ctx.drawImage(fogC, 0, 0, fogC.width, fogC.height, mx, my, mw, mh);
  var route = !!(PREP && PREP.done.route);
  // ชื่อโซน (เมื่อเคยไปถึงแล้ว หรือชาวบ้านบอกเส้นทาง) + วงอันตรายของดงบลูม
  for (i = 0; i < ZONE_LB.length; i++) {
    z = ZONE_LB[i];
    if (!(fogKnown(F, z.x, z.y) || (route && i < 3))) continue;
    if (i === 3) { ctx.strokeStyle = 'rgba(226,170,255,.75)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(mx + z.x * sx, my + z.y * sy, SITES.bloom.r * (F.hz || 1) * sx, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
    var zoff = i === 3 ? -SITES.bloom.r * sy - 8 : -[SITES.meadow.r, SITES.water.ry, SITES.den.r][i] * sy * .78; /* วางชื่อโซนไว้ขอบบนของโซน ไม่ชนป้ายจุดหากิน */
    txt(z.n, mx + z.x * sx, my + z.y * sy + zoff, fsz, z.c, 'center', true);
  }
  // หย่อมสปอร์ของระบบนิเวศ (เขตที่ป่าเสื่อม) — เห็นเมื่อสำรวจถึงแล้ว
  if (F.patches) for (i = 0; i < F.patches.length; i++) { var pq = F.patches[i]; if (!(fogKnown(F, pq.x, pq.y) || route)) continue; ctx.fillStyle = 'rgba(176,106,216,.3)'; ctx.strokeStyle = 'rgba(226,170,255,.85)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(mx + pq.x * sx, my + pq.y * sy, Math.max(2.5, pq.r * sx), 0, TAU); ctx.fill(); ctx.stroke(); }
  // จุดหากิน: รู้เมื่อสอบถามชาวบ้าน หรือเคยเห็นมันทำกิจนั้นจริง
  for (var hk in HAB_PT) {
    if (!(route || F.obs[hk])) continue;
    var hp = HAB_PT[hk], hx = mx + hp.x * sx, hy = my + hp.y * sy;
    ctx.fillStyle = 'rgba(255,233,160,.9)'; ctx.strokeStyle = '#3a2a10'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(hx, hy, rr + 1, 0, TAU); ctx.fill(); ctx.stroke();
    if (full) txt(hp.n, hx, hy + 15, 12, '#ffe9a0', 'center', true);
  }
  if (route || F.obs.patrol) { ctx.strokeStyle = 'rgba(255,233,160,.55)'; ctx.lineWidth = 1.3; ctx.setLineDash([3, 4]); ctx.beginPath(); for (i = 0; i < PATROL.length; i++) { if (!i) ctx.moveTo(mx + PATROL[i].x * sx, my + PATROL[i].y * sy); else ctx.lineTo(mx + PATROL[i].x * sx, my + PATROL[i].y * sy); } ctx.stroke(); ctx.setLineDash([]); }
  // รอยเท้าเรืองแสง (หลังตรวจรอยเท้า) + แคมป์ที่พบแล้ว
  if (F.trailT > 0 && F.cr.length > 1) {
    ctx.strokeStyle = 'rgba(130,230,255,.9)'; ctx.lineWidth = full ? 2.5 : 1.8; ctx.setLineDash([3, 4]); ctx.beginPath(); var tn = 0;
    for (i = 0; i < F.cr.length; i++) { if (F.t - F.cr[i].t > 160) continue; if (!tn++) ctx.moveTo(mx + F.cr[i].x * sx, my + F.cr[i].y * sy); else ctx.lineTo(mx + F.cr[i].x * sx, my + F.cr[i].y * sy); }
    ctx.stroke(); ctx.setLineDash([]);
  }
  for (i = 0; i < CAMPS.length; i++) {
    if (!F.campSeen[i]) continue;
    var cq = CAMPS[i], cqx = mx + cq.x * sx, cqy = my + cq.y * sy, cs = full ? 9 : 5;
    ctx.fillStyle = '#ffcf70'; ctx.strokeStyle = '#3a2a10'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cqx - cs, cqy + cs * .7); ctx.lineTo(cqx, cqy - cs); ctx.lineTo(cqx + cs, cqy + cs * .7); ctx.closePath(); ctx.fill(); ctx.stroke();
    txt(full ? cq.id + ' ' + cq.n.split('· ')[1] : cq.id, cqx, cqy + cs + (full ? 11 : 7), full ? 12 : 9, '#ffe9a0', 'center', true);
  }
  // ร่องรอย/ของเก็บที่ค้นพบแล้ว (สีตามชนิด)
  for (i = 0; i < SIGNS.length; i++) {
    var s = SIGNS[i]; if (F.done[s.id] || !fogKnown(F, s.x, s.y)) continue;
    kd = signKind(s.id); var qx = mx + s.x * sx, qy = my + s.y * sy;
    ctx.fillStyle = kd.c; ctx.strokeStyle = 'rgba(0,0,0,.75)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(qx, qy, rr, 0, TAU); ctx.fill(); ctx.stroke();
    im = full && kd.ic ? SGIMG[kd.ic] : null; if (im) ctx.drawImage(im, qx - 9, qy - 20, 18, 18);
  }
  if (F.bait && !F.bait.done) { ctx.fillStyle = '#c8965a'; ctx.beginPath(); ctx.arc(mx + F.bait.x * sx, my + F.bait.y * sy, rr * .8, 0, TAU); ctx.fill(); }
  for (i = 0; i < F.snares.length; i++) if (!F.snares[i].used) { ctx.strokeStyle = '#ffd666'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(mx + F.snares[i].x * sx, my + F.snares[i].y * sy, rr * .9, 0, TAU); ctx.stroke(); }
  // เป้าหมาย: ตำแหน่งสด หรือ "เงา" ตำแหน่งที่เห็นล่าสุด
  var live = monsterLive(F), pulse = .5 + .5 * Math.sin(tNow * 5);
  if (live) {
    ctx.fillStyle = '#ffb04a'; ctx.strokeStyle = '#5a2a00'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(mx + m.x * sx, my + m.y * sy, rr + 1, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,176,74,' + (.25 + .35 * pulse) + ')'; ctx.beginPath(); ctx.arc(mx + m.x * sx, my + m.y * sy, rr + 4 + 3 * pulse, 0, TAU); ctx.stroke();
  } else if (F.lk) {
    var age = F.t - F.lk.t, ga = clamp(1 - age / 100, .3, .85);
    ctx.strokeStyle = 'rgba(255,176,74,' + ga + ')'; ctx.lineWidth = 1.8; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(mx + F.lk.x * sx, my + F.lk.y * sy, rr + 3, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    if (full) txt('? ' + Math.round(age) + ' วิก่อน', mx + F.lk.x * sx, my + F.lk.y * sy - 14, 12, 'rgba(255,200,120,' + ga + ')', 'center', true);
  }
  // ผู้เล่น (ลูกศรชี้ทิศ)
  ctx.save(); ctx.translate(mx + p.x * sx, my + p.y * sy); ctx.rotate(p.face); var ps = full ? 1.5 : 1;
  ctx.fillStyle = '#4aa3e0'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(7 * ps, 0); ctx.lineTo(-4 * ps, 4 * ps); ctx.lineTo(-2 * ps, 0); ctx.lineTo(-4 * ps, -4 * ps); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  if (!full) { ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 1; ctx.strokeRect(mx + clamp(F.camX, 0, Math.max(0, WW - VW)) * sx, my + F.camY * sy, VW * sx, H * sy); }
}
/* ตัวชี้ขอบจอ: เป้าหมาย/ร่องรอยที่อยู่นอกจอ พร้อมระยะ */
function drawEdgeMarks(k, avoid) {
  var F = FIELD, p = P, m = M, list = [], i, cand = [], t;
  if (!F.onScreen) { var live = monsterLive(F); if (live || F.lk) list.push({ x: live ? m.x : F.lk.x, y: live ? m.y : F.lk.y, c: live ? '#ffb04a' : 'rgba(255,176,74,.6)', g: live ? '!' : '?', ghost: !live }); }
  for (i = 0; i < SIGNS.length; i++) { var s = SIGNS[i]; if (F.done[s.id] || !fogKnown(F, s.x, s.y)) continue; var sxx = s.x - F.camX, syy = s.y - F.camY; if (sxx > 30 && sxx < VW - 30 && syy > 30 && syy < H - 30) continue; cand.push({ d: dist(p.x, p.y, s.x, s.y), s: s }); }
  cand.sort(function (a, b) { return a.d - b.d; });
  for (i = 0; i < cand.length && i < 2; i++) { var kd = signKind(cand[i].s.id); list.push({ x: cand[i].s.x, y: cand[i].s.y, c: kd.c, g: '', ic: kd.ic, n: kd.cat }); }
  var cxm = VW / 2, cym = H / 2, hx = VW / 2 - 48, hy = H / 2 - 66;
  list.forEach(function (t) {
    var ax = t.x - F.camX, ay = t.y - F.camY, dx = ax - cxm, dy = ay - cym; if (!dx && !dy) return;
    var sc = Math.min(hx / Math.abs(dx || 1e-6), hy / Math.abs(dy || 1e-6)), fx = cxm + dx * sc - OFFX, fy = cym + dy * sc, ang = Math.atan2(dy, dx), dm = Math.round(dist(p.x, p.y, t.x, t.y) / 10);
    for (var ai = 0; avoid && ai < avoid.length; ai++) { var av = avoid[ai]; if (fx > av.x0 - 18 && fx < av.x1 + 18 && fy < av.y1 + 18) fy = av.y1 + 22; } /* ไม่ทับกล่อง HUD/มินิแมป */
    hudBlock(fx, fy, Math.min(k, 1.3), function () {
      ctx.save(); ctx.translate(fx, fy); ctx.rotate(ang);
      ctx.fillStyle = t.c; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(24, 0); ctx.lineTo(13, -8); ctx.lineTo(13, 8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.fillStyle = 'rgba(8,14,10,.78)'; ctx.strokeStyle = t.c; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(fx, fy, 13, 0, TAU); ctx.fill(); ctx.stroke();
      var im = t.ic ? SGIMG[t.ic] : null;
      if (im) ctx.drawImage(im, fx - 9, fy - 9, 18, 18); else txt(t.g || '•', fx, fy + 1, 15, t.c, 'center', true);
      txt(dm + ' ม.', fx, fy + 24, 11, '#e9e7df', 'center', true);
    });
  });
}
function drawFullMap(g) {
  var F = FIELD, kk = clamp(Math.min(HK, (VW - 16) / 960), 1, 1.35), ms = Math.min(720 / WW, 470 / WH), mw = Math.round(WW * ms), mh = Math.round(WH * ms), x0 = 22, y0 = 64, i, px = 760;
  hudBlock(CX, CY, kk, function () {
    ctx.fillStyle = 'rgba(4,8,6,.9)'; ctx.fillRect(-OFFX - 400, -300, VW + 800, H + 600);
    txt('แผนที่ลาดตระเวน — ' + MAP.name + ' · ' + monName(), x0, 30, 17, '#e9e7df', 'left', true);
    txt('แตะหรือกด N เพื่อปิด · เวลาหยุดอยู่ขณะดูแผนที่', x0, 48, 12, '#9aa39a', 'left', true);
    drawMapCore(x0, y0, mw, mh, true);
    // ลม
    var wa = F.wind; ctx.save(); ctx.translate(x0 + mw - 34, y0 + 34); ctx.fillStyle = 'rgba(8,14,10,.7)'; ctx.beginPath(); ctx.arc(0, 0, 24, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#cfe8d8'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-14 * Math.cos(wa), -14 * Math.sin(wa)); ctx.lineTo(14 * Math.cos(wa), 14 * Math.sin(wa)); ctx.stroke();
    ctx.fillStyle = '#cfe8d8'; ctx.beginPath(); ctx.arc(14 * Math.cos(wa), 14 * Math.sin(wa), 4.5, 0, TAU); ctx.fill(); ctx.restore();
    txt('ลม', x0 + mw - 34, y0 + 66, 11, '#cfe8d8', 'center', true);
    // แผงข้อมูลด้านขวา
    var y = 74, pct = fogPct(F), live = monsterLive(F), st = ROUTINE[F.rt.i].k;
    txt('สำรวจแล้ว ' + pct + '%', px, y, 14, '#e9e7df', 'left', true); bar(px, y + 12, 170, 7, pct / 100, '#7fb86a'); y += 40;
    txt('เก็บร่องรอย ' + fieldSignsDone(F) + '/' + SIGNS.length, px, y, 14, '#e9e7df', 'left', true); y += 30;
    var hv = Math.round(forestOf(F.region)), hcol = hv >= 70 ? '#7fe0b5' : (hv >= 40 ? '#e8d86a' : '#e86a5a');
    txt('ระบบนิเวศ · ป่า ' + hv + '% (' + forestTier(hv) + ')', px, y, 13, hcol, 'left', true); bar(px, y + 11, 170, 6, hv / 100, hcol); y += 26;
    txt('พืช/หนังงอกใหม่ใน ' + ecoRegrow(F.region) + ' รอบล่า' + (F.held ? ' · ยังไม่งอก ' + F.held + ' จุด' : ''), px, y, 11, '#9aa39a', 'left', true); y += 16;
    if (F.patches && F.patches.length) { txt('หย่อมสปอร์ม่วง ' + F.patches.length + ' จุด (อันตราย)', px, y, 11, '#d6a8f0', 'left', true); y += 16; }
    y += 10;
    txt('กิจวัตรของมัน', px, y, 14, '#ffe9a0', 'left', true); y += 22;
    for (i = 0; i < ROUTINE.length; i++) {
      var rk = ROUTINE[i].k, known = (PREP && PREP.done.route) || F.obs[rk], cur = i === F.rt.i && live;
      var tail = cur ? (F.rt.phase === 'do' && ROUTINE[i].dur ? ' (' + Math.max(0, Math.ceil(ROUTINE[i].dur - F.rt.t)) + ' วิ)' : ' (กำลังเดินไป)') : '';
      txt((cur ? '▶ ' : (known ? '✓ ' : '? ')) + (known || cur ? STAGE_SHORT[rk] : 'ยังไม่เคยเห็น') + tail, px, y, 13, cur ? '#ffb04a' : (known ? '#cfe8d8' : '#6f7a72'), 'left', true); y += 20;
    }
    if (!(PREP && PREP.done.route)) { txt('สังเกตมันให้ครบทุกกิจวัตร', px, y + 2, 11, '#9aa39a', 'left', true); txt('หรือถามชาวบ้านก่อนออกล่า', px, y + 17, 11, '#9aa39a', 'left', true); y += 40; } else y += 8;
    y += 8; txt('สัญลักษณ์', px, y, 13, '#e9e7df', 'left', true); y += 20;
    var LG = [['#9fe8ff', 'ร่องรอย/ตัวอย่าง'], ['#8be88a', 'สมุนไพร'], ['#c8f08a', 'พืชวัตถุดิบ'], ['#e8b878', 'หนังที่ลอกร่วง'], ['#ffcf70', 'แคมป์ (F พัก/ย้ายค่าย)'], ['#b06ad8', 'หย่อมสปอร์ (อันตราย)'], ['#ffb04a', 'เป้าหมาย']];
    for (i = 0; i < LG.length; i++) { ctx.fillStyle = LG[i][0]; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(px + 6, y - 1, 5, 0, TAU); ctx.fill(); ctx.stroke(); txt(LG[i][1], px + 18, y, 12, '#cfe8d8', 'left', true); y += 19; }
    ctx.strokeStyle = 'rgba(255,176,74,.8)'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(px + 6, y - 1, 5, 0, TAU); ctx.stroke(); ctx.setLineDash([]); txt('ตำแหน่งที่เห็นล่าสุด', px + 18, y, 12, '#cfe8d8', 'left', true);
  });
}
