/* ================= RENDER ================= */
var bg = document.createElement('canvas'); bg.width = W; bg.height = H;
var bctx = bg.getContext('2d');
function buildBg() {
  var c = bctx, seed = 7, i;
  if (paintedArena(c)) return;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  c.fillStyle = '#0a0f0b'; c.fillRect(0, 0, W, H);
  for (i = 0; i < 90; i++) {
    var a = rnd() * TAU, r = ARENA_R + 6 + rnd() * 150, x = CX + Math.cos(a) * r, y = CY + Math.sin(a) * r * 1.0;
    c.fillStyle = 'rgba(' + (14 + rnd() * 14 | 0) + ',' + (30 + rnd() * 26 | 0) + ',' + (18 + rnd() * 14 | 0) + ',.55)';
    c.beginPath(); c.arc(x, y, 14 + rnd() * 38, 0, TAU); c.fill();
  }
  var g = c.createRadialGradient(CX, CY, 30, CX, CY, ARENA_R);
  g.addColorStop(0, AV.g0); g.addColorStop(.7, AV.g1); g.addColorStop(1, AV.g2);
  c.fillStyle = g; c.beginPath(); c.arc(CX, CY, ARENA_R, 0, TAU); c.fill();
  if (AV.decor === 'water') { var wgd = c.createRadialGradient(CX - 30, CY + 20, 10, CX - 30, CY + 20, 120); wgd.addColorStop(0, 'rgba(80,150,200,.75)'); wgd.addColorStop(1, 'rgba(60,120,170,0)'); c.fillStyle = wgd; c.beginPath(); c.ellipse(CX - 30, CY + 20, 130, 90, 0, 0, TAU); c.fill(); }
  if (AV.decor === 'den') { for (i = 0; i < 40; i++) { var da = rnd() * TAU, dr = Math.sqrt(rnd()) * (ARENA_R - 10); c.fillStyle = 'rgba(120,120,110,' + (.2 + rnd() * .25) + ')'; c.beginPath(); c.arc(CX + Math.cos(da) * dr, CY + Math.sin(da) * dr, 3 + rnd() * 7, 0, TAU); c.fill(); } }
  if (AV.decor === 'thicket') { for (i = 0; i < 22; i++) { var ta = i / 22 * TAU, tr = ARENA_R - 26 + rnd() * 12; c.fillStyle = 'rgba(22,52,30,.85)'; c.beginPath(); c.arc(CX + Math.cos(ta) * tr, CY + Math.sin(ta) * tr, 22 + rnd() * 16, 0, TAU); c.fill(); } }
  if (AV.decor === 'bloom') { for (i = 0; i < 12; i++) { var ba = rnd() * TAU, br = rnd() * (ARENA_R - 40), bgx = CX + Math.cos(ba) * br, bgy = CY + Math.sin(ba) * br, bgr = c.createRadialGradient(bgx, bgy, 2, bgx, bgy, 40); bgr.addColorStop(0, 'rgba(190,120,240,.5)'); bgr.addColorStop(1, 'rgba(190,120,240,0)'); c.fillStyle = bgr; c.beginPath(); c.arc(bgx, bgy, 40, 0, TAU); c.fill(); } }
  for (i = 0; i < 380; i++) {
    var a2 = rnd() * TAU, r2 = Math.sqrt(rnd()) * (ARENA_R - 8), gx = CX + Math.cos(a2) * r2, gy = CY + Math.sin(a2) * r2;
    c.strokeStyle = 'rgba(' + (60 + rnd() * 40 | 0) + ',' + (100 + rnd() * 50 | 0) + ',' + (60 + rnd() * 30 | 0) + ',.35)'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx + (rnd() - .5) * 6, gy - 5 - rnd() * 6); c.stroke();
  }
  for (i = 0; i < 14; i++) {
    var a3 = rnd() * TAU, r3 = rnd() * (ARENA_R - 40), px = CX + Math.cos(a3) * r3, py = CY + Math.sin(a3) * r3;
    var pg = c.createRadialGradient(px, py, 2, px, py, 26 + rnd() * 20);
    pg.addColorStop(0, 'rgba(176,106,216,.28)'); pg.addColorStop(1, 'rgba(176,106,216,0)');
    c.fillStyle = pg; c.beginPath(); c.arc(px, py, 46, 0, TAU); c.fill();
  }
  for (i = 0; i < 64; i++) {
    var a4 = i / 64 * TAU + rnd() * .05, rx = CX + Math.cos(a4) * (ARENA_R + 4), ry = CY + Math.sin(a4) * (ARENA_R + 4);
    c.fillStyle = 'rgb(' + (58 + rnd() * 28 | 0) + ',' + (62 + rnd() * 26 | 0) + ',' + (58 + rnd() * 24 | 0) + ')';
    c.beginPath(); c.arc(rx, ry, 8 + rnd() * 7, 0, TAU); c.fill();
  }
  c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 3; c.beginPath(); c.arc(CX, CY, ARENA_R - 1, 0, TAU); c.stroke();
  for (i = 0; i < ROCKS.length; i++) {
    var R = ROCKS[i];
    c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(R.x + 5, R.y + 8, R.r * 1.05, R.r * .85, 0, 0, TAU); c.fill();
    var rg = c.createRadialGradient(R.x - R.r * .3, R.y - R.r * .3, 2, R.x, R.y, R.r);
    rg.addColorStop(0, '#8a8d86'); rg.addColorStop(1, '#4b4e49');
    c.fillStyle = rg; c.beginPath(); c.arc(R.x, R.y, R.r, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 1.5; c.stroke();
  }
}
buildBg();

/* v17.1 UX: ขนาดตัวอักษรบน canvas ถูกย่อตามจอ (จอมือถือสูง ~360px → ตัวอักษร 12 หน่วยเหลือ ~7px จริง)
   UIK = px จริงต่อ 1 หน่วยโลก · HK = ตัวคูณขยาย HUD (1 บนจอใหญ่ → สูงสุด 1.4 บนมือถือ) · TXK = ตัวคูณของ txt() ณ ตอนวาด (1 ใน HUD ที่ขยายทั้งก้อนแล้ว) */
var UIK = 1, HK = 1, TXK = 1, WK = 1;
function hudCalc() {
  try { var r = canvas.getBoundingClientRect(); UIK = r.height > 0 ? r.height / H : 1; HK = clamp(10 / (12 * UIK), 1, 1.4); if (HK < 1.04) HK = 1; } catch (e) { UIK = 1; HK = 1; }
  WK = Math.min(HK, 1.3); /* ตัวคูณข้อความลอยในโลก (ตัวเลขดาเมจ ป้ายบอกท่า ชื่อ NPC) */
}
function txtFont(size, bold) { return (bold ? '700 ' : '500 ') + size + 'px "Noto Sans Thai","Sarabun","Segoe UI",Tahoma,sans-serif'; }
function tw(s, size, bold) { ctx.font = txtFont(size * TXK, bold); return ctx.measureText(rw(s)).width; }
function txt(s, x, y, size, col, align, bold) {
  s = rw(s);
  ctx.font = txtFont(size * TXK, bold);
  ctx.fillStyle = col || '#fff'; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}
/* วาด HUD ทั้งก้อนแบบขยาย k เท่า โดยตรึงมุม (ax, ay) ไว้กับที่ */
function hudBlock(ax, ay, k, fn) {
  var tk = TXK; TXK = 1;
  if (k > 1.02) { ctx.save(); ctx.translate(ax, ay); ctx.scale(k, k); ctx.translate(-ax, -ay); try { fn(); } finally { ctx.restore(); TXK = tk; } }
  else { try { fn(); } finally { TXK = tk; } }
}
function bar(x, y, w, h, frac, col) {
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  ctx.fillStyle = '#1b2420'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = col; ctx.fillRect(x, y, w * clamp(frac, 0, 1), h);
}
function drawWound() {
  var w = M.wound; if (!w || M.state === 'downed') return;
  var off = w.part === 'horn' ? 0 : (w.part === 'hind' ? Math.PI : w.side * Math.PI / 2), a = M.face + off;
  var x = M.x + Math.cos(a) * (M.r * .8), y = M.y + Math.sin(a) * (M.r * .8), left = w.life - w.t, pulse = .5 + .5 * Math.sin(tNow * (left < 3 ? 14 : 7));
  ctx.save();
  ctx.fillStyle = 'rgba(255,242,168,' + (.25 + .3 * pulse) + ')'; ctx.beginPath(); ctx.arc(x, y, 16 + 5 * pulse, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#fff2a8'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, 10, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.moveTo(x, y - 6); ctx.lineTo(x, y + 6); ctx.stroke();
  ctx.restore();
}
function xLash() { return !!(M && M.variant === 1 && M.mut === 'crystal'); }
function parryOK(n) { return !!PARRYABLE[n] && !(n === 'lash' && xLash()); }
var PARRYABLE = { lash: 1, charge: 1, sweep: 1, kick: 1, bash: 1, spit: 1, tusk: 1, rake: 1 };
function drawTele2() {
  if (M.state !== 'tele' || !M.atk) return;
  var par = parryOK(M.atk.name);
  txt(par ? 'Parry ได้ (ขอบฟ้า)' : 'หลบเท่านั้น', M.x, M.y - M.r - 30, 12, par ? '#9fe8ff' : '#ffb86a', 'center', true);
}
function drawTelegraph() {
  if (M.state !== 'tele' || !M.atk) return;
  var A = M.atk, prog = clamp(M.atkT / A.dur, 0, 1), al = .12 + .3 * prog, i;
  ctx.save();
  if (fxOn('blind') && P) { ctx.beginPath(); ctx.arc(P.x, P.y, BLIND_R, 0, TAU); ctx.clip(); } /* ตาพร่า: เห็นเส้นเตือนเฉพาะรอบตัว */
  var fillc ='rgba(224,70,56,' + al + ')', edge = 'rgba(255,110,90,' + (.35 + .5 * prog) + ')';
  if (parryOK(A.name)) edge = 'rgba(159,232,255,' + (.5 + .5 * prog) + ')';
  ctx.fillStyle = fillc; ctx.strokeStyle = edge; ctx.lineWidth = parryOK(A.name) ? 3 : 2;
  if (A.name === 'charge' || A.name === 'roll') {
    var len = 470;
    ctx.translate(M.x, M.y); ctx.rotate(A.ang);
    ctx.fillRect(0, -M.r, len, M.r * 2); ctx.strokeRect(0, -M.r, len, M.r * 2);
    if (prog >= .7) { ctx.fillStyle = 'rgba(255,90,70,.22)'; ctx.fillRect(0, -M.r, len, M.r * 2); }
  } else if (A.name === 'sweep' || A.name === 'kick') {
    var half = A.name === 'sweep' ? SWEEP.half : KICK.half, R = A.name === 'sweep' ? SWEEP.R : KICK.R;
    ctx.beginPath(); ctx.moveTo(M.x, M.y); ctx.arc(M.x, M.y, R, A.ang - half, A.ang + half); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,90,70,' + (.1 + .35 * prog) + ')';
    ctx.beginPath(); ctx.moveTo(M.x, M.y); ctx.arc(M.x, M.y, R * prog, A.ang - half, A.ang + half); ctx.closePath(); ctx.fill();
  } else if (A.name === 'shards') {
    var offs2 = [-.42, 0, .42];
    for (i = 0; i < 3; i++) {
      ctx.save(); ctx.translate(M.x, M.y); ctx.rotate(A.ang + offs2[i]);
      ctx.fillStyle = 'rgba(255,77,106,' + al + ')'; ctx.strokeStyle = 'rgba(255,140,160,' + (.35 + .5 * prog) + ')';
      ctx.fillRect(0, -18, 310, 36); ctx.strokeRect(0, -18, 310, 36);
      ctx.fillStyle = 'rgba(255,110,130,' + (.1 + .35 * prog) + ')'; ctx.fillRect(0, -18, 310 * prog, 36);
      ctx.restore();
    }
  } else if (A.name === 'breath') {
    ctx.fillStyle = 'rgba(255,140,40,' + al + ')';
    ctx.beginPath(); ctx.moveTo(M.x, M.y); ctx.arc(M.x, M.y, 300, A.ang - .4, A.ang + .4); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,190,70,' + (.1 + .3 * prog) + ')'; ctx.beginPath(); ctx.moveTo(M.x, M.y); ctx.arc(M.x, M.y, 300 * prog, A.ang - .4, A.ang + .4); ctx.closePath(); ctx.fill();
  } else if (A.name === 'nova') {
    ctx.fillStyle = 'rgba(255,120,50,' + al + ')'; ctx.beginPath(); ctx.arc(M.x, M.y, 170, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,170,70,' + (.1 + .3 * prog) + ')'; ctx.beginPath(); ctx.arc(M.x, M.y, 170 * prog, 0, TAU); ctx.fill();
  } else if (A.name === 'pollen') {
    ctx.fillStyle = 'rgba(232,224,90,' + al + ')'; ctx.strokeStyle = 'rgba(255,248,150,' + (.35 + .5 * prog) + ')';
    ctx.beginPath(); ctx.arc(M.x, M.y, POLLEN_R, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,245,130,' + (.1 + .3 * prog) + ')'; ctx.beginPath(); ctx.arc(M.x, M.y, POLLEN_R * prog, 0, TAU); ctx.fill();
  } else if (A.name === 'summon') {
    ctx.fillStyle = 'rgba(220,170,40,' + al + ')'; ctx.beginPath(); ctx.arc(M.x, M.y, 120, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,210,70,' + (.08 + .25 * prog) + ')'; ctx.beginPath(); ctx.arc(M.x, M.y, 120 * prog, 0, TAU); ctx.fill();
  } else if (A.name === 'howl') {
    ctx.beginPath(); ctx.arc(M.x, M.y, 330, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,150,90,' + (.08 + .25 * prog) + ')'; ctx.beginPath(); ctx.arc(M.x, M.y, 330 * prog, 0, TAU); ctx.fill();
  } else if (A.name === 'rake') {
    var halfR = .62;
    ctx.beginPath(); ctx.moveTo(M.x, M.y); ctx.arc(M.x, M.y, 125, A.ang - .6 - halfR, A.ang - .6 + halfR); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(M.x, M.y); ctx.arc(M.x, M.y, 125, A.ang + .6 - halfR, A.ang + .6 + halfR); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (A.name === 'bash' || A.name === 'tusk') {
    var bl = A.name === 'tusk' ? 175 : 230;
    ctx.translate(M.x, M.y); ctx.rotate(A.ang);
    ctx.fillRect(0, -M.r, bl, M.r * 2); ctx.strokeRect(0, -M.r, bl, M.r * 2);
    ctx.fillStyle = 'rgba(255,130,70,' + (.1 + .35 * prog) + ')'; ctx.fillRect(0, -M.r, bl * prog, M.r * 2);
  } else if (A.name === 'spit') {
    ctx.fillStyle = 'rgba(140,210,70,' + al + ')';
    ctx.beginPath(); ctx.moveTo(M.x, M.y); ctx.arc(M.x, M.y, 230, A.ang - .42, A.ang + .42); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(170,230,90,' + (.1 + .3 * prog) + ')'; ctx.beginPath(); ctx.moveTo(M.x, M.y); ctx.arc(M.x, M.y, 230 * prog, A.ang - .42, A.ang + .42); ctx.closePath(); ctx.fill();
  } else if (A.name === 'burrow') {
    ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(M.x, M.y); ctx.lineTo(A.tx, A.ty); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(A.tx, A.ty, BURROW_R, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(160,120,70,' + (.12 + .38 * prog) + ')'; ctx.beginPath(); ctx.arc(A.tx, A.ty, BURROW_R * prog, 0, TAU); ctx.fill();
  } else if (A.name === 'leap') {
    ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(M.x, M.y); ctx.lineTo(A.tx, A.ty); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(A.tx, A.ty, LEAP_R, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,150,70,' + (.1 + .35 * prog) + ')'; ctx.beginPath(); ctx.arc(A.tx, A.ty, LEAP_R * prog, 0, TAU); ctx.fill();
  } else if (A.name === 'stomp') {
    ctx.beginPath(); ctx.arc(M.x, M.y, STOMP_R, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,150,70,' + (.1 + .35 * prog) + ')'; ctx.beginPath(); ctx.arc(M.x, M.y, STOMP_R * prog, 0, TAU); ctx.fill();
  } else if (A.name === 'lash') {
    ctx.beginPath(); ctx.moveTo(M.x, M.y); ctx.arc(M.x, M.y, 250, A.ang - .5, A.ang + .5); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(176,106,216,' + (.1 + .35 * prog) + ')'; ctx.beginPath(); ctx.moveTo(M.x, M.y); ctx.arc(M.x, M.y, 250 * prog, A.ang - .5, A.ang + .5); ctx.closePath(); ctx.fill();
  } else if (A.name === 'ensnare') {
    ctx.translate(M.x, M.y); ctx.rotate(A.ang); ctx.fillStyle = 'rgba(176,106,216,' + al + ')'; ctx.strokeStyle = 'rgba(210,150,255,' + (.35 + .5 * prog) + ')';
    ctx.fillRect(0, -22, 330, 44); ctx.strokeRect(0, -22, 330, 44); ctx.fillStyle = 'rgba(200,140,255,' + (.1 + .35 * prog) + ')'; ctx.fillRect(0, -22, 330 * prog, 44);
  } else if ((A.name === 'spore' || A.name === 'sprout') && A.spots) {
    ctx.fillStyle = 'rgba(176,106,216,' + al + ')'; ctx.strokeStyle = 'rgba(210,150,255,' + (.35 + .5 * prog) + ')';
    for (i = 0; i < A.spots.length; i++) { ctx.beginPath(); ctx.arc(A.spots[i].x, A.spots[i].y, SPORE_R, 0, TAU); ctx.fill(); ctx.stroke(); }
  }
  ctx.restore();
}
function drawTendrils() {
  var m = M; if (!m || !m.variant || m.state === 'downed') return;
  var lashing = m.atk && m.state === 'act' && (m.atk.name === 'lash' || m.atk.name === 'ensnare') ? 1 : 0, n = 7, i, k;
  if (rigFor(m) && !lashing) return; /* the art already shows its own tendrils/vines; whips appear only while lashing */
  ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.face); ctx.lineCap = 'round';
  for (i = 0; i < n; i++) {
    var base = (i / (n - 1) - .5) * 2.4, len = (46 + (i % 3) * 22) * (1 + .5 * lashing), ph = tNow * 3 + i * 1.7, ax = Math.cos(Math.PI + base * .55), ay = Math.sin(Math.PI + base * .55);
    var sx = ax * (m.r - 10), sy = ay * (m.r - 10), wx = ax * (m.r - 10 + len * .5) + Math.sin(ph) * 10, wy = ay * (m.r - 10 + len * .5) + Math.cos(ph * 1.3) * 12, ex = ax * (m.r - 10 + len) + Math.sin(ph + 1) * 14, ey = ay * (m.r - 10 + len) + Math.cos(ph) * 16;
    ctx.strokeStyle = 'rgba(70,40,110,.95)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(wx, wy, ex, ey); ctx.stroke();
    ctx.strokeStyle = 'rgba(150,100,210,.9)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(wx, wy, ex, ey); ctx.stroke();
    ctx.fillStyle = i % 2 ? '#d89aff' : '#9ad84a'; ctx.beginPath(); ctx.arc(ex, ey, 4, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
function drawAntler(side, brokenLv, hx, pulse) {
  var broken = brokenLv >= 3 || (brokenLv >= 2 && side > 0);
  ctx.strokeStyle = '#d8c58a'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  var p1x = hx + 14, p1y = side * 22, p2x = hx + 32, p2y = side * 36;
  ctx.beginPath(); ctx.moveTo(hx, side * 6); ctx.lineTo(p1x, p1y); if (!broken) ctx.lineTo(p2x, p2y); ctx.stroke();
  ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(p1x + 20, side * 14); ctx.stroke();
  if (!broken) { ctx.beginPath(); ctx.moveTo(p2x, p2y); ctx.lineTo(p2x + 18, side * 30); ctx.stroke(); }
  var tipx = broken ? p1x : p2x, tipy = broken ? p1y : p2y, gl = broken ? 3 : (5 + pulse * 4);
  ctx.fillStyle = broken ? '#7a3a4a' : '#ff4d6a'; ctx.beginPath(); ctx.arc(tipx, tipy, gl, 0, TAU); ctx.fill();
  if (!broken) { ctx.fillStyle = 'rgba(255,77,106,.25)'; ctx.beginPath(); ctx.arc(tipx, tipy, gl + 6, 0, TAU); ctx.fill(); }
}
