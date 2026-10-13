/* ================= STATE ================= */
var mode = 'title', paused = false;
var FIRES = [], huntFires = 0, SHRINE = null, PRAC = null;
var P, M, darts, clouds, parts, texts, rings, decals, stats, scanRec;
var slashes = [], flashA = 0, flashC = '#fff', punch = 0, hitChain = 0, hitChainT = 0, chainPop = 0, sfxPm = 1, bestChain = 0;
var tNow = 0, hitstop = 0, slowT = 0, shake = 0, pendingDecision = 0, hint = { text: '', t: 0 }, hintsDone = {};
var TUT = null, guidePg = 0;
var keys = {}, mouse = { x: CX + 120, y: CY, l: false, r: false }, aimMode = 'keys';

function makePlayer() {
  return { x: CX - 170, y: CY + 40, r: 13, hp: CFG.pHp + 6 * verdantN() + 5 * skillLv('vigor') + armSum('hp'), maxHp: CFG.pHp + 6 * verdantN() + 5 * skillLv('vigor') + armSum('hp'), st: CFG.pSt + armorSt(), maxSt: CFG.pSt + armorSt(), lsUsed: false, thCd: 0, stDelay: 0,
    face: 0, state: 'free', atk: null, atkStage: 0, atkT: 0, atkHit: false, combo: 0, comboWin: 0, streak: 0, streakT: 0, slipT: 0, chainHits: 0, flow: 0, flowT: 0, counter: 0,
    dodgeT: 0, dodgeStart: -10, dodgeDir: { x: 1, y: 0 }, iframes: 0, trail: [], trailT: 0,
    charge: 0, chargeNeedRelease: false, blocking: false, blockStart: -10, scanning: false, scanT: 0,
    salves: capSalves(), healT: 0, darts: capDarts(), dartCd: 0, windUsed: false, infT: 0, fx: {}, hurtT: 0, stun: 0, kvx: 0, kvy: 0,
    bufAtk: 0, bufDodge: 0, bufHeavy: 0, load: 'sed', atkHold: 0, frenzy: false, walk: 0, dead: false };
}
var huntInv = false, RS = 1, VW = 960, OFFX = 0, huntKind = 'stag', targetKind = 'stag', PREP = null, huntHide = 0, huntMeds = { solvent: true, antiinf: true, antibio: true };
var huntVariant = 0, huntQuest = '';
function aggroNow() { var id = (mode === 'playing' || mode === 'decision' || mode === 'result') && M && M.kind === 'wolf' ? M.quest : (S && S.quest); var q = id ? qDef(id) : null; return !!(q && q.aggro); }
function monNameOf(k, v) { if (k === 'hive') return 'Hivemother Queen'; if (k === 'wolf') return v === 1 ? (aggroNow() ? 'Cinderfang Aggro Wolf' : 'Tendril Wolf') : 'Ashfang Wolf'; if (v === 1 && k !== 'fawn') return k === 'boar' ? 'Spore-Mantled Boar' : (k === 'rabbit' ? 'Tendril Hare' : 'Tendril Stag'); return k === 'fawn' ? 'Fernback Fawn' : (k === 'boar' ? 'Thornback Boar' : (k === 'rabbit' ? 'Bramble Hare' : 'Rothorn Stag')); }
function sovNow() { var id = (mode === 'playing' || mode === 'decision' || mode === 'result') && M && M.kind === 'hive' ? M.quest : (S && S.quest); var q = id ? qDef(id) : null; return !!(q && q.sov); }
function monName() { if ((M ? M.kind : huntKind) === 'hive' && (M && (mode === 'playing' || mode === 'decision' || mode === 'result') ? M.sov : sovNow())) return 'Hivemother Sovereign'; return monNameOf(M ? M.kind : huntKind, M ? M.variant : huntVariant); }
function variantForced(k) { return !!S && k !== 'fawn' && forestOf(k) < 20; }
function pickVariant() { var k = pickKind(); if (k === 'fawn' || !S) return 0; var q = curQuest(); if (q) return (q.tier === 1 ? (variantForced(k) ? 1 : 0) : 1); if (variantForced(k)) return 1; return (S.sev && S.sev[k] && S.cleared && S.cleared[k] >= 1) ? 1 : 0; }
function applyVariant(m) {
  PART_TH.horn = m.kind === 'rabbit' ? 'โคนหู' : ((m.kind === 'wolf' || m.kind === 'hive') ? 'ขากรรไกร' : 'โคนเขา');
  m.variant = 0; m.quest = m.kind === 'fawn' ? '' : huntQuest; m.crisis = false;
  var qdt = qDef(huntQuest); m.tier = m.kind === 'fawn' ? 0 : (qdt ? (qdt.tier === 'E' ? 3 : qdt.tier) : (huntVariant === 1 ? 2 : 1)); m.fightT = 0; m.rageShown = 0;
  if (m.kind === 'hive') { var qh = qDef(huntQuest); m.sumCd = 2; if (qh && qh.crisis) { m.crisis = true; m.sick = Math.max(m.sick || 0, 45); m.hp = m.maxHp = Math.round(m.maxHp * 1.25); m.sumCd = 1; }
    if (qh && qh.sov) { m.sov = true; m.hp = m.maxHp = Math.round(m.maxHp * 1.3); m.dmgMul *= 1.1; m.stagNeed = Math.round(m.stagNeed * 1.1); m.pollenCd = 5; m.sumCd = 1; }
    return tierBoost(m); }
  if (huntVariant !== 1 || m.kind === 'fawn') return m;
  m.variant = 1; m.hp = m.maxHp = Math.round(m.maxHp * 1.6); m.dmgMul *= 1.12; m.stagNeed = Math.round(m.stagNeed * 1.15); m.r += 3; m.ensCd = 4; m.sproutCd = 6;
  var qd = qDef(huntQuest); if (qd && qd.crisis) { m.crisis = true; m.sick = Math.max(m.sick || 0, 45); }
  if (qd && qd.aggro && m.kind === 'wolf') { m.aggro = true; m.hp = m.maxHp = Math.round(m.maxHp * 1.3); m.dmgMul *= 1.1; m.read = { dodge: 0, block: 0, melee: 0, range: 0 }; m.adapt = ''; m.adaptMsgT = 0; m.breathCd = 3; m.novaCd = 6; m.pvx = 0; m.pvy = 0; m.lpx = null; m.lpy = null; m.fireStep = 0; }
  return tierBoost(m);
}
function pickKind() { var q = curQuest(); if (q) return q.kind; return (targetKind === 'rabbit' && S && S.wins >= 2) ? 'rabbit' : ((targetKind === 'boar' && S && S.wins >= 1) ? 'boar' : 'stag'); }
function makeMonster() { return applyMut(applyVariant(makeMonster0())); }
function makeMonster0() {
  var f = huntKind === 'fawn', bo = huntKind === 'boar', ra = huntKind === 'rabbit', wo = huntKind === 'wolf', hv = huntKind === 'hive';
  var ail = f ? 'crystal' : (PREP ? PREP.ail : AIL_KEYS[Math.floor(Math.random() * 3)]), others = AIL_KEYS.filter(function (k) { return k !== ail; });
  return { ail: ail, cand: PREP && !f ? PREP.cand : others[Math.floor(Math.random() * 2)], candFirst: PREP && !f ? PREP.candFirst : Math.random() < .5, narrow: false, ambush: false, diagKnown: false, kind: huntKind, armor: bo ? 90 : 0, armorMax: bo ? 90 : 0, dmgMul: f ? .6 : DF.dmg[diffLv()] * (bo ? 1.1 : (ra ? .95 : (wo ? 1.18 : (hv ? 1.08 : 1)))), x: CX + 175, y: CY - 30, r: f ? 27 : (bo ? 35 : (ra ? 25 : (wo ? 37 : (hv ? 43 : 40)))), face: Math.PI * .9, hp: f ? 260 : Math.round(CFG.mHp * DF.hp[diffLv()] * (bo ? .92 : (ra ? .62 : (wo ? 1.4 : (hv ? 1.5 : 1))))), maxHp: f ? 260 : Math.round(CFG.mHp * DF.hp[diffLv()] * (bo ? .92 : (ra ? .62 : (wo ? 1.4 : (hv ? 1.5 : 1))))), state: 'idle', stT: 0, stDur: 0,
    atk: null, atkT: 0, thinkT: .6, phase: 1, stam: 100, tr: { horn: 0, flank: 0, hind: 0 }, stag: 0, stagNeed: f ? 90 : Math.round(150 * DF.stag[diffLv()] * (ra ? .75 : (wo ? 1.3 : (hv ? 1.25 : 1)))),
    stress: 22, sed: 0, drowsyT: 0, hitFlash: 0, walk: 0, invuln: false, lastAtk: '', sporeCd: 0, sigCd: 3, sick: 0, cureP: 0, cured: false, mut: null, enrageT: 0, cloudT: 3,
    downStress: 0, exhaustedOnce: false, provoked: false, rockCd: 0, stagCd: 0, wound: null, scarCd: 0, nearT: 0, rolls: 0, rollHist: 0 };
}
var PODS = [], BUGS = [], BUG_CAP = 8;
function bugCap() { return M && M.sov ? 10 : BUG_CAP; }
function spawnBug(x, y) {
  if (BUGS.length >= bugCap()) return null;
  var d0 = dist(x, y, CX, CY), mx = ARENA_R - 14; if (d0 > mx) { x = CX + (x - CX) / d0 * mx; y = CY + (y - CY) / d0 * mx; }
  var b = { x: x, y: y, vx: 0, vy: 0, kx: 0, ky: 0, r: 9, hp: 26, cd: rand(.5, 1.1), ph: Math.random() * TAU, age: 0, hit: 0, ang: 0 };
  BUGS.push(b); burst(x, y, '#d8b030', 5, 110, .4); return b;
}
function clearBugs() { var i; for (i = 0; i < BUGS.length; i++) burst(BUGS[i].x, BUGS[i].y, '#d8b030', 6, 140, .5); BUGS = []; }
function killBug(i) {
  var b = BUGS[i]; BUGS.splice(i, 1); burst(b.x, b.y, '#d8b030', 9, 170, .5); ring(b.x, b.y, 4, 22, '#ffe08a', .25, 3);
  stats.bugs = (stats.bugs || 0) + 1; if (P && !P.dead) P.st = Math.min(P.maxSt, P.st + (fullSet() === 'hive' ? 5 : 2));
}
function bugsStrike(s) {
  if (!BUGS.length || !P) return;
  var i, b, dx, dy, d, killed = 0, hitN = 0;
  for (i = BUGS.length - 1; i >= 0; i--) {
    b = BUGS[i]; if (b.hit > 0) continue;
    dx = b.x - P.x; dy = b.y - P.y; d = Math.hypot(dx, dy);
    if (d - b.r > s.reach) continue;
    if (Math.abs(angDiff(Math.atan2(dy, dx), P.face)) > s.arc + .25 + Math.atan2(b.r, Math.max(d, 1))) continue;
    b.hp -= (s.dmg || 30); b.hit = .25; hitN++;
    if (b.hp <= 0) { killBug(i); killed++; }
    else { b.kx += dx / Math.max(d, 1) * 260; b.ky += dy / Math.max(d, 1) * 260; burst(b.x, b.y, '#d8b030', 4, 110, .3); }
  }
  if (hitN) { addShake(2 + Math.min(4, killed)); sfx('swing'); }
  if (killed >= 3) { ftext(P.x, P.y - 62, 'CLEAVE ×' + killed + '!', '#ffd45a', 20, 1.1); hintOnce('cleavehint', 'ตีโดนแมลงหลายตัวในสวิงเดียว! ท่ากวาดกว้างเหมาะกับการเคลียร์ฝูง', 6); }
}
function updateBugs(dt) {
  if (!BUGS.length || !M || !P) return;
  if (M.state === 'downed') { clearBugs(); return; }
  var i, j, b, o, dx, dy, d, a, sp, dd, ph3 = M.phase >= 2 ? 1.12 : 1;
  for (i = 0; i < BUGS.length; i++) {
    b = BUGS[i]; b.age += dt; b.hit = Math.max(0, b.hit - dt); b.cd = Math.max(0, b.cd - dt);
    dx = P.x - b.x; dy = P.y - b.y; d = Math.hypot(dx, dy) || 1;
    a = Math.atan2(dy, dx) + Math.sin(tNow * 3.2 + b.ph) * (d > 70 ? .7 : .25);
    sp = (b.age < .45 ? 40 : 128 * ph3) * (P.dead ? 0 : 1);
    b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp;
    for (j = i + 1; j < BUGS.length; j++) { o = BUGS[j]; dx = o.x - b.x; dy = o.y - b.y; dd = Math.hypot(dx, dy) || 1; if (dd < 17) { var pu = (17 - dd) * 3.2 * dt * 60 / 60; b.x -= dx / dd * pu; b.y -= dy / dd * pu; o.x += dx / dd * pu; o.y += dy / dd * pu; } }
    b.x += (b.vx + b.kx) * dt; b.y += (b.vy + b.ky) * dt; b.kx *= Math.max(0, 1 - 9 * dt); b.ky *= Math.max(0, 1 - 9 * dt);
    b.ang = Math.atan2(b.vy, b.vx);
    dd = dist(b.x, b.y, CX, CY); if (dd > ARENA_R - 12) { b.x = CX + (b.x - CX) / dd * (ARENA_R - 12); b.y = CY + (b.y - CY) / dd * (ARENA_R - 12); }
    if (!P.dead && b.age > .45 && b.cd <= 0 && dist(b.x, b.y, P.x, P.y) < b.r + P.r + 2) {
      b.cd = 1.2;
      var rr = hurtPlayer(5 * (fullSet() === 'hive' ? .4 : 1), b.x, b.y, { kb: 90, src: 'swarm' });
      if (rr === 'hit' && M.sov) { applyFx('numb', 3); hintOnce('numbhint', 'ฝูงของราชินีผู้ครองรังกัดแล้วชา! ท่าโจมตีและการชาร์จช้าลง 25% — กวาดฝูงก่อนจะรัวคอมโบ หรือใช้ยาสมานแผล (R) ล้างอาการ', 8); }
      if (rr === 'hit') hintOnce('bughint','แมลงลูกน้องกัดทีละนิด — ตีทิ้งได้ในสวิงเดียว อย่าปล่อยให้สะสมจนล้อมตัว', 6);
    }
  }
}
var BUGSPR = [null, null], BUGSIL = {}, BUGW = 40; /* BUGW = ความยาวสไปรต์ในโลก (หน่วย) — ฮิตบ็อกซ์จริงรัศมี 9 */
function bugSil(im) { /* เงาขาวสำหรับกระพริบตอนโดนตี (สร้างครั้งเดียวต่อเฟรม) */
  var key = im.src.length + ':' + im.width, c = BUGSIL[key]; if (c) return c;
  c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
  var cx = c.getContext('2d'); cx.drawImage(im, 0, 0); cx.globalCompositeOperation = 'source-in'; cx.fillStyle = '#ffffff'; cx.fillRect(0, 0, c.width, c.height);
  BUGSIL[key] = c; return c;
}
function drawBugs() {
  var i, b, sc, fl;
  for (i = 0; i < BUGS.length; i++) {
    b = BUGS[i]; sc = Math.min(1, b.age / .25); fl = Math.sin(tNow * 55 + b.ph) * .5;
    ctx.save(); ctx.translate(b.x, b.y); ctx.scale(sc, sc);
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(0, 6, 9, 4, 0, 0, TAU); ctx.fill();
    ctx.rotate(b.ang);
    if (BUGSPR[0] && BUGSPR[1]) { /* ภาพจริงลูกน้องแมลง 2 เฟรม: ปีกพับ/กาง สลับกันเป็นจังหวะกระพือ */
      var bsp = BUGSPR[(Math.floor(tNow * 18 + b.ph * 3) & 1)], bw = BUGW, bh = bw * bsp.height / bsp.width;
      ctx.drawImage(bsp, -bw / 2, -bh / 2, bw, bh);
      if (b.hit > 0) { ctx.globalAlpha = .8; ctx.drawImage(bugSil(bsp), -bw / 2, -bh / 2, bw, bh); ctx.globalAlpha = 1; }
      ctx.restore(); continue;
    }
    ctx.fillStyle = 'rgba(215,235,225,.35)'; ctx.beginPath(); ctx.ellipse(-1, -7, 8, 3.4 + fl, -.4, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(-1, 7, 8, 3.4 - fl, .4, 0, TAU); ctx.fill();
    ctx.fillStyle = b.hit > 0 ? '#fff' : '#c8a02a'; ctx.beginPath(); ctx.ellipse(-3, 0, 8, 5.2, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = b.hit > 0 ? '#fff' : '#4a3a12'; ctx.beginPath(); ctx.arc(5, 0, 4.2, 0, TAU); ctx.fill();
    ctx.fillStyle = '#e0452a'; ctx.beginPath(); ctx.arc(7, -2, 1.3, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(7, 2, 1.3, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(60,40,10,.7)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-6, -2); ctx.lineTo(-1, -2); ctx.moveTo(-6, 2); ctx.lineTo(-1, 2); ctx.stroke();
    ctx.restore();
  }
}
function initPods() {
  PODS = []; THICKETS = [];
  var cand = [[-110, -150], [140, 150], [-20, 175], [195, -120], [-205, 90], [10, -190], [-150, -40], [60, 20], [150, -25], [-70, 105], [100, -200], [-215, -95]], i, j, n = 0, gap = podTarget() > 3 ? 105 : 150;
  for (i = 0; i < cand.length && n < podTarget(); i++) {
    var px = CX + cand[i][0], py = CY + cand[i][1], ok = Math.hypot(px - CX, py - CY) < ARENA_R - 40;
    for (j = 0; j < ROCKS.length; j++) if (Math.hypot(px - ROCKS[j].x, py - ROCKS[j].y) < ROCKS[j].r + 34) ok = false;
    if (Math.hypot(px - (CX - 170), py - (CY + 40)) < 70 || Math.hypot(px - (CX + 175), py - (CY - 30)) < 70) ok = false;
    for (j = 0; j < PODS.length; j++) if (Math.hypot(px - PODS[j].x, py - PODS[j].y) < gap) ok = false;
    if (ok) { PODS.push({ x: px, y: py, r: 15, cd: 0 }); n++; }
  }
}
function burstPod(pd, byMonster) {
  var m = M; pd.cd = 22;
  if (!byMonster && P && !P.dead) {
    var dsx = ensureDoses();
    if (P.load !== 'sed' && huntMeds[P.load]) { if (dsx[P.load] < invCap(P.load)) { dsx[P.load]++; ftext(P.x, P.y - 46, 'ผสมยา +1 (' + MEDS[P.load] + ' ×' + dsx[P.load] + ')', '#ffb0e0', 15, 1.4); } }
    else if (P.darts < invCap('dart')) { P.darts++; ftext(P.x, P.y - 46, 'ผสมยาสลบ +1', '#9fe8ff', 15, 1.4); }
  }
  ring(pd.x, pd.y, 10, 120, '#9be86a', .5, 5); burst(pd.x, pd.y, '#9be86a', 22, 300); addShake(6); sfx('stomp');
  ftext(pd.x, pd.y - 24, 'POD BURST!', '#9be86a', 16, 1);
  if (m.state === 'downed' || m.invuln || dist(pd.x, pd.y, m.x, m.y) > 125 + m.r * .5) return;
  m.hp -= 22; m.hitFlash = .1; ftext(m.x, m.y - m.r - 20, '-22', '#9be86a', 20, .9);
  if (m.hp <= 0) { monsterDowned(); return; }
  if (m.state === 'act' || m.state === 'tele') { m.state = 'stun'; m.stT = 0; m.stDur = 1.8; m.atk = null; m.stag = 0; ftext(m.x, m.y - m.r - 44, 'มึนเกสร!', '#9be86a', 18, 1.2); }
  else if (m.state !== 'roar' && m.state !== 'stagger' && m.state !== 'stun' && m.state !== 'exhaust') startStagger(1.2, false);
  hintOnce('pod2', 'ตีฝักเกสรเอง = เก็บสมุนไพรผสมยา เติมโดสลูกดอกที่โหลดอยู่ +1', 6);
  hintOnce('pod', 'ฝักเกสรระเบิดใส่มัน! ตีฝักตอนมันอยู่ใกล้ หรือล่อให้มันพุ่งชนฝัก = เสียหลัก (ฝักงอกใหม่ใน ~22 วินาที)', 6);
}
function updatePods(dt) {
  updateThickets(dt); updateAlly(dt);
  for (var i = 0; i < PODS.length; i++) {
    var pd = PODS[i];
    if (pd.cd > 0) { pd.cd -= dt; continue; }
    if (M.state === 'act' && dist(M.x, M.y, pd.x, pd.y) < M.r + pd.r) burstPod(pd, true);
  }
  var m = M;
  if (m.burrowed && !(m.state === 'act' && m.atk && m.atk.name === 'burrow')) { m.burrowed = false; m.invuln = false; }
  if (m.provoked && !m.cured && m.kind !== 'fawn' && m.state !== 'downed') {
    var s0 = m.sick; m.sick = Math.min(100, m.sick + 1.4 * dt);
  }
  { var stN = sickStage(m), stO = m.sickStg || 0;
    if (stN !== stO) {
      m.sickStg = stN;
      if (stN > stO && stN >= 2) {
        ftext(m.x, m.y - m.r - 40, stN === 3 ? 'ระยะวิกฤต!' : 'อาการลุกลาม!', SICK_COL[stN], 20, 1.5); ring(m.x, m.y, m.r, m.r + 90, SICK_COL[stN], .5, 6); sfx('spore');
        if (stN === 2) hintOnce('sick2', 'ระยะลุกลาม: ท่าประจำอาการถี่ขึ้น เร็วขึ้นเล็กน้อย — รีบสแกนและยิงยารักษา (T สลับลูกดอก)', 7);
        else hintOnce('sick3', 'ระยะวิกฤต! มันแรงขึ้น เร็วขึ้น และปล่อยสปอร์เป็นระยะ' + (m.variant === 1 ? ' หนวดปรสิตเร็วขึ้น พิษนานขึ้น และงอกจากพื้นมากขึ้น' : '') + ' — ยารักษาถูกชนิดจะลดระยะลง', 8);
      } else if (stN < stO && stO >= 2) ftext(m.x, m.y - m.r - 40, 'อาการทุเลา', '#9be86a', 16, 1.2);
    }
    if (stN === 3 && m.state !== 'downed') { m.sporeT = (m.sporeT == null ? 4 : m.sporeT) - dt; if (m.sporeT <= 0) { m.sporeT = 8; clouds.push({ x: m.x, y: m.y, r: 42, t: 0, life: 5 }); } }
  }
  if (m.enrageT > 0) m.enrageT -= dt;
  if (m.mut === 'sepsis' && m.state !== 'downed') { m.cloudT -= dt; if (m.cloudT <= 0) { m.cloudT = 3.5; clouds.push({ x: m.x, y: m.y, r: 46, t: 0, life: 5 }); } }
  if (m.kind === 'boar' && m.armorMax && m.armor <= 0 && m.state !== 'downed') {
    m.armorT = (m.armorT || 0) + dt;
    if (m.armorT > 20) { m.armor = 45; m.armorT = 0; ftext(m.x, m.y - m.r - 30, 'เกราะงอกใหม่', '#aab4c0', 16, 1.2); ring(m.x, m.y, m.r, m.r + 40, '#aab4c0', .4, 4); }
  }
  if (m.kx || m.ky) { m.kx *= Math.max(0, 1 - 14 * dt); m.ky *= Math.max(0, 1 - 14 * dt); if (Math.abs(m.kx) + Math.abs(m.ky) < .2) { m.kx = 0; m.ky = 0; } }
}
function initWorld() {
  P = makePlayer(); M = makeMonster(); ALLY = null; initPods();
  darts = []; clouds = []; FIRES = []; SHRINE = null; PRAC = null; try { document.body.removeAttribute('data-prac'); } catch (e0) {} parts = []; texts = []; rings = []; decals = []; slashes = []; BUGS = []; flashA = 0; punch = 0; hitChain = 0; hitChainT = 0; chainPop = 0; bestChain = 0;
  stats = { dodges: 0, blocks: 0, heavies: 0, fires: 0, counters: 0, flowMax: 0, finishers: 0, time: 0, taken: 0, hits: 0, parry: 0, perfect: 0, scans: 0, rock: 0, darts: 0, chains: 0, dmgBy: { swarm: 0, breath: 0, nova: 0, fire: 0, charge: 0, sweep: 0, stomp: 0, spore: 0, kick: 0, leap: 0, infect: 0, shards: 0, bash: 0, spit: 0, roll: 0, howl: 0, tusk: 0, rake: 0, lash: 0, ensnare: 0, sprout: 0, burrow: 0, pollen: 0 } };
  scanRec = null; tNow = 0; hitstop = 0; slowT = 0; shake = 0; pendingDecision = 0; hintsDone = {}; hint = { text: '', t: 0 }; TUT = null; PTF = { n: 0, sum: 0, slow: 0, worst: 0 };
}

