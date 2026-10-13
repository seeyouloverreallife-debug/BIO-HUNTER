/* ================= PLAYER ================= */
function moveVec() {
  var mx = 0, my = 0;
  if (keys['w'] || keys['arrowup']) my -= 1;
  if (keys['s'] || keys['arrowdown']) my += 1;
  if (keys['a'] || keys['arrowleft']) mx -= 1;
  if (keys['d'] || keys['arrowright']) mx += 1;
  var d = Math.hypot(mx, my);
  return d ? { x: mx / d, y: my / d } : { x: 0, y: 0 };
}
function autoAim() {
  if (!M || M.state === 'downed') return;
  var a = Math.atan2(M.y - P.y, M.x - P.x), d = dist(P.x, P.y, M.x, M.y);
  if (d < 190 + M.r && Math.abs(angDiff(a, P.face)) < 1.1) P.face = a;
}
function startDodge() {
  stats.dodges++;
  var p = P, mv = moveVec();
  p.st -= curW().dodge * (p.frenzy ? 1.5 : 1) * (fullSet() === 'warren' ? .7 : 1); if (curW().hop) p.hopT = curW().hopWin || .75; p.stDelay = .55; p.state = 'dodge'; p.dodgeT = 0; p.dodgeStart = tNow; obsRead('dodge', 1.4); p.bufDodge = 0; if (M) M.rolls++;
  p.blocking = false; p.scanning = false; p.charge = 0; p.chargeNeedRelease = true;
  p.dodgeDir = (mv.x || mv.y) ? mv : { x: -Math.cos(p.face), y: -Math.sin(p.face) };
  sfx('dodge');
}
function maxStage() { var n = curW().stages.length - 1; return P.flow >= 3 ? n : n - 1; }
function nextOk(n) { var st = curW().stages[n]; return !!st && n <= maxStage() && (!st.gate || P.chainHits >= st.gate) && (P.frenzy ? P.st > 0 : P.st >= st.cost); }
function chargeFrac() { return clamp(P.charge / curW().heavyT, 0, 1); }
function gainFlow() {
  var p = P; p.flow = Math.min(3, p.flow + 1); p.flowT = 5; p.counter = 2.5; stats.flowMax = Math.max(stats.flowMax, p.flow);
  ftext(p.x, p.y - 46, 'FLOW ×' + p.flow, '#ffd45a', 18, 1.1); ring(p.x, p.y, 14, 56, '#ffd45a', .4, 3);
  hintOnce('flow', 'FLOW! Parry/Perfect Dodge สะสมสแตก — โจมตีแรงและไวขึ้น, การโจมตีถัดไปคือ COUNTER (×1.6), ครบ ×3 ต่อคอมโบได้ท่าที่ 5 (Finisher) · โดนโจมตีแล้วสแตกหาย', 7);
}
function startAttack(stage) {
  var s = curW().stages[stage], p = P;
  p.state = 'atk'; p.atk = s; p.atkStage = stage; p.atkT = 0; p.atkHit = false; p.bufAtk = 0;
  if (stage === 1) p.chainHits = 0;
  if (s.whirl) hintOnce('whirl', 'ท่าที่ 4 WHIRL SLASH! ตีต่อเนื่อง 3 ครั้ง (โดนอย่างน้อย 2) แล้วกดตีอีก = หมุนฟันรอบตัว ตีได้ทุกทิศ ดาเมจและแรงเสียหลักสูง แต่พักนาน', 6);
  p.st -= p.frenzy ? 0 : s.cost * (1 - .15 * p.flow); p.stDelay = .55; p.blocking = false; if (curW().holdCharge) p.chargeNeedRelease = true; p.scanning = false; autoAim(); sfx('swing');
}
function startCharge() { P.state = 'charge'; P.charge = 0; P.blocking = false; P.scanning = false; }
function fireHeavy() {
  stats.heavies++;
  var p = P, W = curW(), n = chargeFrac();
  p.atk = W.heavy(n);
  p.atkStage = 0; p.state = 'atk'; p.atkT = 0; p.atkHit = false; p.combo = 0; p.comboWin = 0;
  p.st = Math.max(0, p.st - (W.hc0 + n * W.hc1)); p.stDelay = .7; p.charge = 0; autoAim(); sfx('swing');
}
function isHeavyHeld() { return !!(keys['k'] || mouse.r); }
function isAtkHeld() { return !!(keys['j'] || mouse.l); }
var THICKETS = [];
function startDashCut() { stats.heavies++;
  var p = P, m = M, d = Math.hypot(m.x - p.x, m.y - p.y);
  p.bufHeavy = 0; p.bufAtk = 0;
  if (d < 420 && m.state !== 'downed') p.face = Math.atan2(m.y - p.y, m.x - p.x);
  p.atk = { wind: .04, act: .12, rec: .3, dmg: 22, tr: 28, stg: 16, reach: 150, arc: .8, lunge: clamp(d + m.r * .8, 120, 260), cost: 0, pr: true, dashcut: true };
  p.state = 'atk'; p.atkStage = 0; p.combo = 0; p.comboWin = 0; p.atkT = 0; p.atkHit = false;
  p.st = Math.max(0, p.st - 14); p.stDelay = .6; p.blocking = false; p.scanning = false; p.chargeNeedRelease = true; p.hurtT = Math.max(p.hurtT, .3);
  ring(p.x, p.y, 8, 50, '#b5f08a', .3, 3); sfx('swing');
  hintOnce('dashcut', 'SLIP-CUT! พุ่งตัดผ่านตัวมัน มีช่วงอมตะสั้น ๆ — ใช้เปลี่ยนตำแหน่งหรือหนีท่าโจมตี · ตัดโดนจุดติดเชื้อที่สแกนยืนยันแล้ว = PRUNE', 7);
}
function startThicket() { stats.heavies++;
  var p = P, m = M, d = Math.hypot(m.x - p.x, m.y - p.y), a = (m.state !== 'downed' && d < 520) ? Math.atan2(m.y - p.y, m.x - p.x) : p.face, L = clamp(d - m.r - 30, 90, 230);
  p.bufHeavy = 0; p.face = a;
  p.atk = { wind: .12, act: .06, rec: .32, dmg: 0, tr: 0, stg: 0, reach: 0, arc: 0, lunge: 0, cost: 0, heavy: true, thicketCast: true };
  p.state = 'atk'; p.atkStage = 0; p.combo = 0; p.comboWin = 0; p.atkT = 0; p.atkHit = true; p.bufAtk = 0;
  p.st = Math.max(0, p.st - 16); p.stDelay = .6; p.thCd = 6; p.blocking = false; p.scanning = false; p.chargeNeedRelease = true;
  var tx = clamp(p.x + Math.cos(a) * L, CX - ARENA_R + 50, CX + ARENA_R - 50), ty = clamp(p.y + Math.sin(a) * L, CY - ARENA_R + 50, CY + ARENA_R - 50);
  while (THICKETS.length >= 2) THICKETS.shift();
  THICKETS.push({ x: tx, y: ty, r: 80, t: 7 + (curW().seedT || 0), max: 7 + (curW().seedT || 0) });
  ring(tx, ty, 10, 80, '#8fd18a', .5, 5); burst(tx, ty, '#8fd18a', 14, 220); sfx('heal');
  hintOnce('thicket', 'พุ่มหนาม! มอนสเตอร์ที่ย่ำในพุ่มจะเดินช้าลงและเสียสมดุล ส่วนคุณยืนในพุ่มแล้วสตามินาฟื้นไว — ยิงให้มันเดินผ่านพุ่ม', 7);
}
function startYank() { stats.heavies++;
  var p = P, m = M;
  p.bufHeavy = 0; p.bufAtk = 0; p.chargeNeedRelease = true;
  var ang = Math.atan2(p.y - m.y, p.x - m.x), d = Math.hypot(m.x - p.x, m.y - p.y), to = m.r + 70;
  m.tether = 0;
  if (d > to) { var pull = Math.min(d - to, 130); m.x += Math.cos(ang) * pull; m.y += Math.sin(ang) * pull; }
  p.face = Math.atan2(m.y - p.y, m.x - p.x);
  p.atk = { wind: .05, act: .1, rec: .28, dmg: 14, tr: 12, stg: 30, reach: 190, arc: .6, lunge: 0, cost: 0, yank: true };
  p.state = 'atk'; p.atkStage = 0; p.combo = 0; p.comboWin = 0; p.atkT = 0; p.atkHit = false;
  p.st = Math.max(0, p.st - 12); p.stDelay = .55; p.blocking = false; p.scanning = false;
  ring(m.x, m.y, m.r, m.r + 50, '#9fe1cb', .3, 4); ftext(m.x, m.y - m.r - 28, 'YANK!', '#9fe1cb', 20, .9); sfx('swing'); addShake(5);
}
function updateThickets(dt) {
  var i, th, m = M, inT = false;
  for (i = THICKETS.length - 1; i >= 0; i--) {
    th = THICKETS[i]; th.t -= dt;
    if (th.t <= 0) { THICKETS.splice(i, 1); continue; }
    if (m.state !== 'downed' && Math.hypot(m.x - th.x, m.y - th.y) < th.r + m.r * .5) { m.thT = .15; if (m.state !== 'roar' && m.stagCd <= 0 && m.state !== 'stagger' && m.state !== 'stun') m.stag += 9 * dt; }
    if (Math.hypot(P.x - th.x, P.y - th.y) < th.r) inT = true;
  }
  if (inT && P.state !== 'dodge') P.st = Math.min(P.maxSt, P.st + CFG.stRegen * .8 * dt);
  if (m.thT > 0) m.thT -= dt;
}
function startSlip() {
  var p = P, m = M, d = Math.hypot(m.x - p.x, m.y - p.y);
  if (d < 380) p.face = Math.atan2(m.y - p.y, m.x - p.x);
  p.atk = { wind: .06, act: .14, rec: .36, dmg: 40, tr: 36, stg: 40, reach: 125, arc: .95, lunge: clamp(d - m.r - 36, 40, 240), cost: 0, slip: true };
  p.state = 'atk'; p.atkStage = 2; p.combo = 2; p.comboWin = .7; p.atkT = 0; p.atkHit = false; p.bufAtk = 0; p.slipT = 0;
  p.st = Math.max(0, p.st - 6); p.stDelay = .5; p.blocking = false; p.scanning = false; p.hurtT = Math.max(p.hurtT, .22);
  ring(p.x, p.y, 8, 46, '#fff2a8', .3, 3); sfx('swing');
  hintOnce('slip', 'SLIP STRIKE! ตีทันทีหลัง Perfect Dodge/Parry = พุ่งเข้าหาและตีแรง (×1.25) แล้วต่อคอมโบท่าที่ 3 ได้เลย', 5);
}
function startHeal() {
  if (!P || P.state !== 'free' || P.salves <= 0 || (P.hp >= P.maxHp - 1 && P.infT <= 0 && !Object.keys(P.fx).some(function (k) { return P.fx[k] > 0; }))) return;
  P.state = 'heal'; P.healT = 0; P.blocking = false; P.scanning = false;
}
function suspectNames() { return AIL[M.candFirst ? M.ail : M.cand].name + ' หรือ ' + AIL[M.candFirst ? M.cand : M.ail].name; }
function confirmDiag(why) {
  M.diagKnown = true; autoLoadMed(); ftext(M.x, M.y - M.r - 40, 'วินิจฉัย: ' + AIL[M.ail].name, '#9fe8ff', 17, 2.2); ring(M.x, M.y, M.r, M.r + 36, '#9fe8ff', .5, 3);
  showHint('วินิจฉัยแล้ว (' + why + '): ' + AIL[M.ail].name + ' — โจมตีจุดนั้นได้ดาเมจ +15% ยิงยารักษา (T สลับ) ใส่ ' + PART_TH[AIL[M.ail].part] + ' ให้ตรงชนิดและตรงจุด', 7);
}
function autoLoadMed(quiet) {
  if (!M || !P || M.cured || M.kind === 'fawn' || !AIL[M.ail]) return false;
  var med = AIL[M.ail].med; if (!huntMeds[med] || P.load === med || (ensureDoses()[med] || 0) <= 0) return false;
  P.load = med; if (!quiet) ftext(P.x, P.y - 46, 'โหลดยา ' + MEDS[med] + ' ให้อัตโนมัติ (T สลับกลับยาสลบ)', '#ffb0e0', 14, 1.8);
  return true;
}
function ensureDoses() { if (!P.doses) { P.doses = {}; for (var k in MEDS) if (huntMeds[k]) P.doses[k] = 3; } return P.doses; }
function fireDart() {
  if (!P || P.dartCd > 0 || P.state === 'dodge' || P.dead) return;
  obsRead('range', 1.2);
  var ds = ensureDoses(), useMed = P.load !== 'sed' && huntMeds[P.load];
  if (useMed) { if ((ds[P.load] || 0) <= 0) { ftext(P.x, P.y - 30, 'ยาหมด — กด T สลับ', '#ffb0e0', 13, .9); P.dartCd = .3; return; } ds[P.load]--; }
  else { if (P.darts <= 0) return; P.darts--; }
  P.dartCd = .5; stats.darts++;
  var a = aimMode === 'mouse' ? Math.atan2(mouse.y - P.y, mouse.x - P.x) : P.face;
  var ma = Math.atan2(M.y - P.y, M.x - P.x);
  if (Math.abs(angDiff(ma, a)) < .35) a = ma;
  darts.push({ x: P.x, y: P.y, vx: Math.cos(a) * 680, vy: Math.sin(a) * 680, t: 0, a: a, med: useMed ? P.load : null });
  sfx('dart');
}
function loadList() { var l = ['sed'], ds = ensureDoses(); for (var k in MEDS) if (huntMeds[k] && ds[k] > 0) l.push(k); return l; }
function cycleLoad() {
  if (!P || P.dead) return;
  var l = loadList(), i = l.indexOf(P.load); P.load = l[(i + 1) % l.length];
  ftext(P.x, P.y - 34, 'ลูกดอก: ' + (P.load === 'sed' ? 'ยาสลบ' : MEDS[P.load] + ' ×' + ensureDoses()[P.load]), P.load === 'sed' ? '#9fe8ff' : '#ffb0e0', 14, 1); sfx('scan');
  hintOnce('load', 'ลูกดอกหนึ่งนัดใช้ได้ทั้งยาสลบและยารักษา (กด T สลับ) — ยารักษาต้องตรงกับอาการ! ต้องยิงถูก "ตำแหน่งอาการ" ด้วย: ยาถูกชนิดแต่ผิดจุดได้ผลน้อย · ยามีจำกัดชนิดละ 3 โดส (ยิงพลาด/ผิดชนิดเสียโดส) — เก็บโดสเพิ่มด้วยการตีฝักเกสรในสนาม', 10);
}
function hitPartAt(x, y) {
  var rel = Math.abs(angDiff(Math.atan2(y - M.y, x - M.x), M.face));
  return rel < .87 ? 'horn' : (rel < 2.18 ? 'flank' : 'hind');
}
var hx0 = 0, hy0 = 0;
function applyMed(id) {
  var m = M, ok = AIL[m.ail].med === id;
  if (m.cured) { ftext(m.x, m.y - 54, 'รักษาแล้ว', '#9aa39a', 13, .8); return; }
  var hpart = hitPartAt(hx0, hy0), onPart = hpart === AIL[m.ail].part;
  if (ok) {
    var helpless = m.state === 'stagger' || m.state === 'stun' || m.state === 'exhaust' || m.state === 'retreat' || m.drowsyT > 0;
    var gain0 = (helpless ? 100 : 55) * (onPart ? 1 : .4) * (m.kind === 'fawn' ? 1 : (phScan(m) ? (m.phase >= 2 ? 1.25 : 1) : (m.preDx ? .8 : .6))); m.cureP += gain0; m.sick = Math.max(0, m.sick - 45 * (onPart ? 1 : .4)); m.stress = clamp(m.stress - 8, 0, 100);
    if (!onPart) ftext(m.x, m.y - 74, 'ผิดจุด! ฉีดที่ ' + PART_TH[AIL[m.ail].part], '#ffd45a', 14, 1.2);
    ftext(m.x, m.y - 54, 'ยาถูกชนิด! ' + Math.min(100, Math.round(m.cureP)) + '%', '#9be86a', 17, 1.2); burst(m.x, m.y, '#9be86a', 10, 160);
    if (m.cureP >= 100) {
      m.cured = true; m.stress = clamp(m.stress - 30, 0, 100); stats.fieldTreat = (stats.fieldTreat || 0) + 1;
      var hadMut = m.mut; m.mut = null;
      ftext(m.x, m.y - m.r - 66, hadMut ? 'รักษาสำเร็จ! กลายพันธุ์หาย' : 'รักษาในสนามสำเร็จ!', '#9be86a', 24, 1.6); ring(m.x, m.y, m.r, m.r + 110, '#9be86a', .6, 6); burst(m.x, m.y, '#9be86a', 26, 340); addShake(8); slowT = Math.max(slowT, .3); sfx('heal');
      showHint('รักษาในสนามสำเร็จ! ท่าประจำอาการหาย มันสงบลง (ดาเมจที่ได้รับ −12%) และตอนจบเลือก Treat ได้เลยโดยไม่ต้องเปิดโคนเขา', 7);
    }
  } else {
    m.wrongN = (m.wrongN || 0) + 1; m.enrageT = 8; m.stress = clamp(m.stress + 20, 0, 100); m.sick = Math.min(100, m.sick + (m.wrongN >= 2 ? 30 : 15));
    if (m.wrongN === 2) { ftext(m.x, m.y - m.r - 70, 'ยาตีกัน! อาการทรุด', '#ff5a4a', 20, 1.5); addShake(8); }
    ftext(m.x, m.y - 54, 'ยาไม่ตรงอาการ! โมโห', '#ff7a5a', 17, 1.3); ring(m.x, m.y, m.r, m.r + 60, '#ff7a5a', .4, 4); sfx('roar');
    hintOnce('wrongmed', 'ยาผิดชนิด! มันโมโหชั่วคราวและอาการลุกลามขึ้น — สแกน (Q) วินิจฉัยก่อนยิงยา', 6);
  }
}
function tryPlayerHit(over) {
  var s = over || P.atk, m = M;
  for (var pi = 0; pi < PODS.length; pi++) {
    var pd = PODS[pi]; if (pd.cd > 0) continue;
    var pdx = pd.x - P.x, pdy = pd.y - P.y, pdd = Math.hypot(pdx, pdy);
    if (pdd - pd.r <= s.reach && Math.abs(angDiff(Math.atan2(pdy, pdx), P.face)) < s.arc + .25) burstPod(pd, false);
  }
  bugsStrike(s);
  if (m.state === 'downed') return;
  var dx = m.x - P.x, dy = m.y - P.y, d = Math.hypot(dx, dy);
  if (d - m.r > s.reach) return;
  if (Math.abs(angDiff(Math.atan2(dy, dx), P.face)) > s.arc + Math.atan2(m.r, Math.max(d, 1))) return;
  P.atkHit = true;
  if (!s.heavy && !s.slip && !s.flurry) P.chainHits++; else if (s.slip) P.chainHits = Math.max(P.chainHits, 2);
  hitMonster(s);
  if (!s.heavy && !s.flurry && s.cost !== undefined && curW().stages[P.atkStage + 1] && curW().stages[P.atkStage + 1].gate && P.atkStage === 3 && P.chainHits >= 2) { ftext(P.x, P.y - 34, 'ต่อท่าที่ 4 ได้!', '#ffd45a', 13, .8); ring(P.x, P.y, 10, 40, '#ffd45a', .3, 3); }
}
