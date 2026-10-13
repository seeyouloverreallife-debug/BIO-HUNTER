function segBlocked(ax, ay, bx, by) {
  var arrs = [HAB.trees, HAB.frocks], dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1;
  for (var k = 0; k < 2; k++) for (var i = 0; i < arrs[k].length; i++) {
    var o = arrs[k][i], t = clamp(((o.x - ax) * dx + (o.y - ay) * dy) / L2, 0, 1);
    if (dist(o.x, o.y, ax + dx * t, ay + dy * t) < o.r) return true;
  }
  return false;
}
function inBush(x, y, shrink) {
  for (var i = 0; i < HAB.bushes.length; i++) if (dist(x, y, HAB.bushes[i].x, HAB.bushes[i].y) < HAB.bushes[i].r * (shrink || .8)) return true;
  return false;
}
function zoneAt(x, y) {
  var w = SITES.water;
  if (Math.pow((x - w.x) / (w.rx + 80), 2) + Math.pow((y - w.y) / (w.ry + 80), 2) < 1) return 'water';
  if (dist(x, y, SITES.den.x, SITES.den.y) < SITES.den.r + 90) return 'den';
  if (dist(x, y, SITES.bloom.x, SITES.bloom.y) < SITES.bloom.r + 90) return 'bloom';
  for (var i = 0; i < HAB.bushes.length; i++) if (dist(x, y, HAB.bushes[i].x, HAB.bushes[i].y) < HAB.bushes[i].r + 80) return 'thicket';
  return 'meadow';
}
function rtTarget(fr) {
  var k = ROUTINE[fr.rt.i].k;
  if (k === 'graze') { var a = rand(0, TAU), rr = rand(20, 160); fr.rt.tx = SITES.meadow.x + Math.cos(a) * rr; fr.rt.ty = SITES.meadow.y + Math.sin(a) * rr; }
  else if (k === 'drink') { fr.rt.tx = DRINK_PT.x; fr.rt.ty = DRINK_PT.y; }
  else if (k === 'rest') { fr.rt.tx = REST_PT.x; fr.rt.ty = REST_PT.y; }
  else { fr.rt.tx = PATROL[fr.rt.wp].x; fr.rt.ty = PATROL[fr.rt.wp].y; }
}
function startField() {
  huntKind = pickKind(); huntVariant = pickVariant(); huntQuest = curQuestId(); if (!PREP) PREP = newPrep();
  huntRegion = regionFor(huntKind); /* เขตป่า = แมพ = ระบบนิเวศของการออกล่ารอบนี้ */
  var MP = loadMap(huntRegion), es = ecoSigns(MP, huntRegion); SIGNS = es.list;
  initWorld();
  var st = Math.floor(Math.random() * 3);
  M.x = [SITES.meadow.x + 40, DRINK_PT.x - 30, REST_PT.x - 20][st]; M.y = [SITES.meadow.y - 20, DRINK_PT.y + 20, REST_PT.y + 10][st];
  M.state = 'idle'; M.face = rand(0, TAU);
  P.x = CAMPS[0].x + 36; P.y = CAMPS[0].y + 24; P.face = 0; P.hp = P.maxHp;
  FIELD = { t: 0, wind: rand(0, TAU), aw: 0, alertT: 0, rt: { i: st, phase: 'do', t: rand(0, 4), tx: M.x, ty: M.y, wp: 0 }, scan: null, scanT: 0, signT: 0, signId: '', done: {}, hpLoss: 0,
    seenT: 99, noise: 0, hidden: false, feed: [], restWoken: false, bait: null, baitLeft: invN('bait'), snareLeft: invN('snare'), snares: [], headUp: false, camX: 0, camY: 0, tip: 0, status: '' };
  FIELD.region = huntRegion; FIELD.hz = ecoHazard(huntRegion); FIELD.patches = ecoPatches(huntRegion, MP); FIELD.held = es.held;
  rtTarget(FIELD);
  FIELD.obs = {}; FIELD.lk = null; FIELD.mapOpen = false; FIELD.onScreen = false; FIELD.campMenu = -1; FIELD.trailT = 0; FIELD.cr = []; FIELD.campSeen = [true, false, false, false]; FIELD.nearCamp = -1; FIELD.fLatch = false;
  fogReset(FIELD); fogReveal(FIELD, P.x, P.y);
  mode = 'field'; paused = false; hidePanel();
  fieldMsg('ออกสำรวจ ' + MP.name + ' (ป่า ' + Math.round(forestOf(huntRegion)) + '%) · ลาดตระเวนหา ' + monName() + ' — มันใช้ชีวิตตามกิจวัตร: กินหญ้า → ดื่มน้ำ → นอนพัก → เดินสำรวจ ลองสังเกตและหาข้อมูลก่อนเข้าใกล้ · ค้าง Q ในระยะ ~360 เพื่อวินิจฉัยโดยไม่ต้องปะทะ · กด N (หรือแตะมินิแมป) เปิดแผนที่เต็ม · เต็นท์ = แคมป์ ใช้ F พักฟื้น/ย้ายค่าย · ตรวจ "รอยเท้า" แล้วตามรอยเรืองแสงไปหามัน', 11);
  if (es.held > 0) fieldMsg('ระบบนิเวศเขตนี้: พืช/หนังที่เก็บไปแล้ว ' + es.held + ' จุดยังไม่งอกใหม่ (ป่า ' + Math.round(forestOf(huntRegion)) + '% → งอกหลังผ่านไป ' + ecoRegrow(huntRegion) + ' รอบล่า)', 9);
  if (FIELD.patches.length) fieldMsg('ป่าเขตนี้ป่วย — มีหย่อมสปอร์ม่วงลอยอยู่ ' + FIELD.patches.length + ' จุด หลีกเลี่ยงให้พ้น', 9);
}
function fieldMsg(t, dur) { FIELD.feed.unshift({ t: t, life: dur || 6 }); if (FIELD.feed.length > 4) FIELD.feed.pop(); }
function moveObstacles(o, rr) {
  var i, arrs = [HAB.trees, HAB.frocks], keep = o.r;
  if (rr) o.r = rr;
  for (var k = 0; k < 2; k++) for (i = 0; i < arrs[k].length; i++) pushOut(o, arrs[k][i].x, arrs[k][i].y, arrs[k][i].r);
  o.r = keep;
  o.x = clamp(o.x, 30, WW - 30); o.y = clamp(o.y, 30, WH - 30);
}
function updateField(dt) {
  var F = FIELD, m = M, p = P, i;
  if (keys['n']) { keys['n'] = false; F.mapOpen = !F.mapOpen; sfx('scan'); } /* แผนที่เต็ม: หยุดเวลาไว้ขณะเปิด */
  if (F.mapOpen) { if (keys['x']) { keys['x'] = false; F.mapOpen = false; } return; }
  if (F.campMenu >= 0) { campMenuKeys(F); return; } /* เมนูแคมป์: หยุดเวลาไว้ */
  tNow += dt; F.t += dt; F.seenT += dt; if (F.trailT > 0) F.trailT = Math.max(0, F.trailT - dt);
  for (i = F.feed.length - 1; i >= 0; i--) { F.feed[i].life -= dt; if (F.feed[i].life <= 0) F.feed.splice(i, 1); }
  F.wind += (Math.sin(F.t * .07) * .25 + .03) * dt;
  var wx = Math.cos(F.wind), wy = Math.sin(F.wind);
  // --- player
  var mv = { x: 0, y: 0 };
  if (keys['w'] || keys['arrowup']) mv.y -= 1; if (keys['s'] || keys['arrowdown']) mv.y += 1;
  if (keys['a'] || keys['arrowleft']) mv.x -= 1; if (keys['d'] || keys['arrowright']) mv.x += 1;
  var moving = mv.x || mv.y, sneak = !!(keys['c'] || keys['control']), ml = Math.hypot(mv.x, mv.y) || 1;
  var inB = inBush(p.x, p.y, 1);
  var sp = (sneak ? 95 : CFG.walk * .9) * (inB ? .8 : 1);
  p.x += mv.x / ml * sp * dt; p.y += mv.y / ml * sp * dt;
  if (moving) p.face = Math.atan2(mv.y, mv.x);
  moveObstacles(p);
  F.noise = !moving ? 55 : (sneak ? 42 : 125); F.sneak = sneak; F.moving = !!moving;
  if (dist(p.x, p.y, F.rvX, F.rvY) > 14) { fogReveal(F, p.x, p.y); F.rvX = p.x; F.rvY = p.y; }
  // aggro wolf: forest fires along its path
  if (m.aggro) {
    if (!F.fires) { F.fires = []; F.flx = m.x; F.fly = m.y; }
    if (dist(m.x, m.y, F.flx, F.fly) > 70) { F.flx = m.x; F.fly = m.y; F.fires.push({ x: m.x, y: m.y, t: 0, life: 16 }); huntFires++; stats.fires++; if (F.fires.length > 60) F.fires.shift();
      if (!F.fireWarn) { F.fireWarn = true; fieldMsg('ป่าลุกไหม้ตามรอยมัน! ไฟทำลายป่า (โทษตอนจบ) และลวกคุณถ้าเหยียบ', 6); } }
    for (i = F.fires.length - 1; i >= 0; i--) { var ff0 = F.fires[i]; ff0.t += dt; if (ff0.t >= ff0.life) { F.fires.splice(i, 1); continue; }
      if (dist(p.x, p.y, ff0.x, ff0.y) < 34 && p.hp > 35) { p.hp -= 5 * dt; F.hpLoss += 5 * dt; } }
  }
  // bloom hazard
  var inHaz = dist(p.x, p.y, SITES.bloom.x, SITES.bloom.y) < SITES.bloom.r * (F.hz || 1), pkh;
  for (i = 0; !inHaz && F.patches && i < F.patches.length; i++) { pkh = F.patches[i]; if (dist(p.x, p.y, pkh.x, pkh.y) < pkh.r) inHaz = true; }
  if (inHaz) {
    if (p.hp > 35) { p.hp -= 3.2 * dt; F.hpLoss += 3.2 * dt; }
    if (!F.bloomWarn) { F.bloomWarn = true; fieldMsg('สปอร์ Bloomrot! ที่นี่ทำให้คุณป่วยและเสีย HP — ออกไปเร็ว ๆ', 5); }
  }
  // --- monster routine
  var alert = F.aw > .45, st = ROUTINE[F.rt.i].k;
  var bt = F.bait, baited = false, eating = false;
  if (bt && !bt.done) { bt.t += dt; if (bt.t > 60) bt.done = true; }
  if (bt && !bt.done && !(st === 'rest' && F.rt.phase === 'do' && !F.restWoken) && dist(m.x, m.y, bt.x, bt.y) < 420) { baited = true; eating = dist(m.x, m.y, bt.x, bt.y) <= 30; }
  if (m.state === 'idle' || m.state === 'stalk') {
    if (alert) {
      m.state = 'idle'; m.face = turnToward(m.face, Math.atan2(p.y - m.y, p.x - m.x), dt * 2.2);
      if (st === 'rest' && F.aw > .55 && !F.restWoken) { F.restWoken = true; fieldMsg('มันสะดุ้งตื่น! ระวัง', 3); }
    } else if (baited) {
      var bdx = bt.x - m.x, bdy = bt.y - m.y, bd = Math.hypot(bdx, bdy);
      if (bd > 22) {
        m.face = turnToward(m.face, Math.atan2(bdy, bdx), dt * 2.4); m.state = 'stalk'; var bstp = Math.min(bd, 70 * dt); m.x += bdx / bd * bstp; m.y += bdy / bd * bstp; m.walk += bstp * .12;
        if (!bt.noted) { bt.noted = true; fieldMsg('มันได้กลิ่นเหยื่อ — กำลังเดินไปกิน', 4); }
      } else {
        m.state = 'idle'; F.headUp = false; bt.eatT += dt;
        if (!bt.eatMsg) { bt.eatMsg = true; fieldMsg('มันกำลังกินเหยื่อ — เสียสมาธิ! เข้าใกล้ได้', 4); }
        if (bt.eatT >= 9) { bt.done = true; F.rt.phase = 'walk'; rtTarget(F); fieldMsg('มันกินหมดแล้ว กลับไปทำกิจวัตรต่อ', 4); }
      }
    } else if (F.rt.phase === 'walk') {
      var ddx = F.rt.tx - m.x, ddy = F.rt.ty - m.y, dd = Math.hypot(ddx, ddy), spd = (st === 'patrol' ? 85 : 62) * 1.25; /* แผนที่ใหญ่ขึ้น: เดินไวขึ้นเล็กน้อยให้จังหวะกิจวัตรเท่าเดิม */
      m.face = turnToward(m.face, Math.atan2(ddy, ddx), dt * 2.4); m.state = 'stalk';
      if (dd < 20) {
        if (st === 'patrol' && F.rt.wp < PATROL.length - 1) { F.rt.wp++; rtTarget(F); }
        else { F.rt.phase = 'do'; F.rt.t = 0; m.state = 'idle'; if (st === 'patrol') { F.rt.i = 0; F.rt.wp = 0; F.rt.phase = 'walk'; rtTarget(F); } }
      } else { var stp = Math.min(dd, spd * dt); m.x += ddx / dd * stp; m.y += ddy / dd * stp; m.walk += stp * .12; }
    } else {
      m.state = 'idle'; F.rt.t += dt;
      if (st === 'graze') { m.face += Math.sin(F.t * .8) * .25 * dt; F.headUp = (F.rt.t % 5) > 3.4; }
      else if (st === 'drink') m.face = turnToward(m.face, Math.atan2(SITES.water.y - m.y, SITES.water.x - m.x), dt * 1.5);
      if (st !== 'graze') F.headUp = false;
      if (F.rt.t >= ROUTINE[F.rt.i].dur) { F.rt.i = (F.rt.i + 1) % ROUTINE.length; F.rt.phase = 'walk'; F.restWoken = false; rtTarget(F); }
    }
  }
  var ox = m.x, oy = m.y; moveObstacles(m, 14);
  { var lc = F.cr[F.cr.length - 1]; /* รอยเท้าที่มันทิ้งไว้ (เก็บเป็นสายตามเวลา) */
    if (!lc || dist(m.x, m.y, lc.x, lc.y) > 46) { F.cr.push({ x: m.x, y: m.y, t: F.t, a: m.face, s: F.cr.length & 1 }); if (F.cr.length > 170) F.cr.shift(); } }
  if (F.rt.phase === 'walk' && !alert && !baited) {
    F.rt.stuck = (F.rt.stuck || 0) + (dist(m.x, m.y, F.lastMx === undefined ? -999 : F.lastMx, F.lastMy === undefined ? -999 : F.lastMy) < .25 ? dt : -F.rt.stuck);
    if (F.rt.stuck > 2.5) { m.x = F.rt.tx; m.y = F.rt.ty; F.rt.stuck = 0; }
  } else F.rt.stuck = 0;
  F.lastMx = m.x; F.lastMy = m.y;
  // --- perception
  var d = dist(p.x, p.y, m.x, m.y), asleep = st === 'rest' && F.rt.phase === 'do' && !F.restWoken;
  var vr = asleep ? 55 : (st === 'drink' && F.rt.phase === 'do' ? 170 : (st === 'graze' && F.rt.phase === 'do' && !F.headUp ? 150 : 290));
  if (eating) vr *= .55;
  var fov = asleep ? .3 : .95, ang = Math.atan2(p.y - m.y, p.x - m.x);
  var hidden = inBush(p.x, p.y, .8) && d > (sneak ? 45 : 70); F.hidden = hidden;
  var seen = d < vr && Math.abs(angDiff(ang, m.face)) < fov && !hidden && !segBlocked(m.x, m.y, p.x, p.y);
  var heard = d < F.noise * (asleep ? .6 : (eating ? .7 : 1)); F.heard = heard;
  var smx = m.x - F.camX, smy = m.y - F.camY; F.onScreen = smx > 20 && smx < VW - 20 && smy > 20 && smy < H - 20; /* อยู่ในจอ = "เห็น" */
  if (F.onScreen) { F.lk = { x: m.x, y: m.y, t: F.t }; if (F.rt.phase === 'do' || st === 'patrol') F.obs[st] = true; }
  var down = ((p.x - m.x) / (d || 1)) * wx + ((p.y - m.y) / (d || 1)) * wy, scent = down > .8 && d < 170 && !asleep;
  var rate = 0;
  if (seen) rate += .6 + (1 - d / vr) * 1.6;
  if (heard) rate += .7;
  if (scent) rate += .5;
  if (rate > 0) F.aw = Math.min(1.05, F.aw + rate * dt * (asleep ? .5 : (eating ? .65 : 1))); else F.aw = Math.max(0, F.aw - .3 * dt);
  if (seen || d < 330 && !hidden) F.seenT = Math.min(F.seenT, d < 330 ? 0 : F.seenT);
  F.status = hidden ? 'ซ่อนในพุ่มไม้' : (!moving ? 'นิ่งอยู่' : (sneak ? 'ย่องเงียบ' : 'เดินปกติ (เสียงดังพอสมควร)'));
  if (scent && F.aw > .25 && !F.scentTip) { F.scentTip = true; fieldMsg('ลมพัดกลิ่นคุณไปหามัน! เดินอ้อมไปทางเหนือลม', 4.5); }
  // --- signs / scan
  var near = null;
  for (i = 0; i < SIGNS.length; i++) if (!F.done[SIGNS[i].id] && dist(p.x, p.y, SIGNS[i].x, SIGNS[i].y) < 55) near = SIGNS[i];
  if (near && keys['f']) {
    if (F.signId !== near.id) { F.signId = near.id; F.signT = 0; }
    F.signT += dt;
    if (F.signT >= near.t) { F.done[near.id] = true; F.signId = ''; signResult(near.id); }
  } else { F.signId = ''; F.signT = 0; }
  F.nearSign = near;
  /* แคมป์: พบเมื่อเคยสำรวจถึง · ยืนใกล้แล้วกด F (กดแตะ ไม่ใช่ค้าง) เพื่อเปิดเมนูพัก/ย้ายค่าย */
  var nc = -1;
  for (i = 0; i < CAMPS.length; i++) {
    if (!F.campSeen[i] && (fogKnown(F, CAMPS[i].x, CAMPS[i].y) || dist(p.x, p.y, CAMPS[i].x, CAMPS[i].y) < 200)) { F.campSeen[i] = true; fieldMsg('พบ ' + CAMPS[i].n + ' — ใช้ย้ายค่ายและพักฟื้นได้', 5); }
    if (dist(p.x, p.y, CAMPS[i].x, CAMPS[i].y) < 66) nc = i;
  }
  F.nearCamp = nc;
  if (keys['f']) { if (!F.fLatch) { F.fLatch = true; if (nc >= 0 && !near) { F.campMenu = nc; sfx('scan'); return; } } } else F.fLatch = false;
  if (keys['q'] && d < 360 && !segBlocked(m.x, m.y, p.x, p.y)) {
    F.scanT += dt;
    if (F.scanT >= scanTime() && !F.scan) {
      var v = vitals(); F.scan = { hr: v.hr, temp: v.temp, br: v.br, stress: v.stress, inf: v.inf }; PREP.fieldDiag = true; sfx('scan');
      ftext(m.x, m.y - m.r - 36, 'วินิจฉัย: ' + AIL[m.ail].name, '#9fe8ff', 16, 2.4);
      fieldMsg('สแกนจากระยะไกล: ' + AIL[m.ail].name + ' · ชีพจร ' + v.hr + ' bpm (บันทึกไว้ใช้คำนวณโดสยาสลบ)', 8);
    }
  } else F.scanT = Math.max(0, F.scanT - dt * 2);
  for (i = texts.length - 1; i >= 0; i--) { var tx = texts[i]; tx.t += dt; tx.y -= 28 * dt; if (tx.t >= tx.life) texts.splice(i, 1); }
  // --- snares
  for (i = 0; i < F.snares.length; i++) {
    var sn = F.snares[i]; if (sn.arm > 0) sn.arm -= dt;
    if (sn.arm <= 0 && !sn.used && dist(m.x, m.y, sn.x, sn.y) < 34) { sn.used = true; encounter('snared'); return; }
  }
  // --- encounter
  if ((keys['j'] || mouse.l) && d < 90 && F.aw < .75) { encounter('sneak'); return; }
  if (F.aw >= 1) { encounter('noticed'); return; }
  if (d < m.r + p.r + 6) { encounter('bumped'); return; }
  if (keys['x']) { keys['x'] = false; enterVillage('ถอนตัวกลับหมู่บ้านก่อน — ไม่ได้ออกล่า'); }
}
function placeBait() {
  var F = FIELD; if (!F) return;
  if (F.baitLeft <= 0) { fieldMsg('ไม่มีเหยื่อล่อเหลือแล้ว (ซื้อเพิ่มที่ร้านพ่อค้าในหมู่บ้าน)', 3); return; }
  if (F.bait && !F.bait.done) { fieldMsg('มีเหยื่อล่อวางอยู่แล้ว — รอให้มันกินหมดก่อน', 3); return; }
  F.baitLeft--; S.inv.bait = Math.max(0, invN('bait') - 1); persist(); F.bait = { x: P.x, y: P.y, t: 0, eatT: 0, done: false }; sfx('heal');
  fieldMsg('วางเหยื่อล่อแล้ว — ถ้ามันอยู่ในรัศมีกลิ่นจะเดินมากิน (ซ่อนตัวรอได้)', 5);
}
function placeSnare() {
  var F = FIELD; if (!F) return;
  if (F.snareLeft <= 0) { fieldMsg('ไม่มีกับดักเหลือแล้ว (ซื้อเพิ่มที่ร้านพ่อค้าในหมู่บ้าน)', 3); return; }
  F.snareLeft--; S.inv.snare = Math.max(0, invN('snare') - 1); persist(); F.snares.push({ x: P.x, y: P.y, arm: 1.5, used: false }); sfx('scan');
  fieldMsg('ซ่อนกับดักเถาวัลย์แล้ว — จะทำงานใน 1.5 วินาที (คุณเดินผ่านได้ปลอดภัย) ลองวางไว้ใต้เหยื่อ', 5);
}
function signResult(id) {
  var c = PREP.candFirst ? [PREP.ail, PREP.cand] : [PREP.cand, PREP.ail];
  sfx('heal');
  if (ecoPickable(id) && FIELD) { ecoOf(FIELD.region || huntRegionKey()).picked[id] = S.hunts || 0; persist(); } /* ระบบนิเวศเขต: เก็บแล้วต้องรอให้งอกใหม่ */
  if (id.indexOf('tracks') === 0) {
    FIELD.trailT = 55; /* รอยเท้าเรืองแสงตามทางที่มันเดินผ่าน */
    if (!PREP.done.track) { PREP.done.track = true; PREP.res.track = 'จากรอยเท้า: <b>' + AIL[c[0]].name + '</b> หรือ <b>' + AIL[c[1]].name + '</b>'; fieldMsg('ตรวจรอยเท้า: อาการน่าจะเป็น ' + AIL[c[0]].name + ' หรือ ' + AIL[c[1]].name + ' · รอยเท้าเรืองแสงชี้ทางที่มันเดินผ่านนาน 55 วิ — ตามไปที่ปลายรอย', 9); }
    else fieldMsg('รอยเท้าสด! เห็นเส้นทางที่มันเดินผ่านนาน 55 วิ — ปลายรอยคือที่ที่มันอยู่ล่าสุด', 6);
  }
  else if (id === 'dung') { PREP.done.sample = true; PREP.res.sample = 'ผลตรวจตัวอย่าง: <b>' + AIL[PREP.ail].name + '</b>'; fieldMsg('วิเคราะห์ตัวอย่างมูลแล้ว: ' + AIL[PREP.ail].name + ' → ยาที่ตรงคือ ' + MEDS[AIL[PREP.ail].med], 9); }
  else if (id.indexOf('plant_') === 0) { var pk = id.split('_')[1].replace(/\d+$/, ''), pn = 2 + (Math.random() < .35 ? 1 : 0); if (HERBS.indexOf(pk) >= 0) { S.mats[pk] = Math.min(9999, (S.mats[pk] || 0) + pn); persist(); fieldMsg('เก็บ' + MATS[pk] + 'ได้ ' + pn + ' ต้น — เก็บเข้ากระเป๋าถาวร (เอาไปผสมยาที่ห้องวิจัย หรือปลูกที่ลานเพาะปลูก)', 5); } }
  else if (id.indexOf('shed') === 0) { PREP.hide = (PREP.hide || 0) + 1; fieldMsg('เก็บหนังกวางที่ลอกร่วงได้ 1 ชิ้น — ได้รับเมื่อจบการล่า (ไม่ต้องฆ่ามัน)', 6); }
  else { PREP.done.herbs = true; fieldMsg('เก็บสมุนไพรได้ — ยาสมานแผล +1 (เก็บได้ครั้งเดียวต่อการออกล่า)', 5); }
}
function encounter(why) {
  var F = FIELD, st = ROUTINE[F.rt.i].k;
  var ctx0 = { why: why, stage: st, asleep: st === 'rest' && !F.restWoken && F.rt.phase === 'do', woken: st === 'rest' && F.restWoken, zone: zoneAt(M.x, M.y), scan: F.scan, hpLoss: F.hpLoss };
  FIELD = null;
  beginBattle(ctx0);
}
