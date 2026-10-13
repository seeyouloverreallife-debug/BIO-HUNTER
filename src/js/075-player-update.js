function updatePlayer(dt) {
  var p = P;
  p.counter = Math.max(0, p.counter - dt); p.slipT = Math.max(0, p.slipT - dt); if (p.streakT > 0) { p.streakT -= dt; if (p.streakT <= 0) p.streak = 0; } if (p.flow > 0) { p.flowT -= dt; if (p.flowT <= 0) { p.flow = 0; p.flowT = 0; } }
  p.hurtT = Math.max(0, p.hurtT - dt); p.bufAtk = Math.max(0, p.bufAtk - dt); p.bufDodge = Math.max(0, p.bufDodge - dt);
  p.dartCd = Math.max(0, p.dartCd - dt); p.comboWin = Math.max(0, p.comboWin - dt); p.stun = Math.max(0, p.stun - dt);
  if (p.state !== 'dodge') p.iframes = 0;
  if (p.infT > 0) { p.infT -= dt; if (fullSet() === 'symbiont') p.hp = Math.min(p.maxHp, p.hp + 2 * dt); else dotPlayer(3 * dt); }
  if (p.hasteT > 0) p.hasteT = Math.max(0, p.hasteT - dt);
  if (p.hopT > 0) p.hopT = Math.max(0, p.hopT - dt);
  if (p.fx) for (var fk in p.fx) if (p.fx[fk] > 0) { p.fx[fk] = Math.max(0, p.fx[fk] - dt); if (fk === 'bleed') dotPlayer(2 * dt); if (fk === 'burn') dotPlayer(4 * dt, 'fire'); }
  var mv = moveVec(), moving = !!(mv.x || mv.y), speedMul = 1;
  var WP0 = curW(), heldCh = (WP0.dashcut || WP0.thicket) ? false : (WP0.holdCharge ? isAtkHeld() : isHeavyHeld());
  p.bufHeavy = Math.max(0, p.bufHeavy - dt);
  if (isAtkHeld()) p.atkHold += dt; else p.atkHold = 0;
  if (!heldCh) p.chargeNeedRelease = false;
  var chargeHeld = heldCh && !p.chargeNeedRelease && (!WP0.holdCharge || p.atkHold >= .2);
  p.thCd = Math.max(0, (p.thCd || 0) - dt);
  if (M) { M.dizzy = Math.max(0, (M.dizzy || 0) - 7 * dt); M.dizzyCd = Math.max(0, (M.dizzyCd || 0) - dt); }
  if (p.frenzy) {
    if (WP0.frenzy) { p.st -= 14 * dt; p.stDelay = Math.max(p.stDelay, .3); }
    if (!WP0.frenzy || p.st <= 0) { p.frenzy = false; p.st = Math.max(0, p.st); p.stDelay = 1; ftext(p.x, p.y - 40, 'หมดแรง', '#c8a04a', 16, 1); }
  }
  var canTurn = p.state === 'free' || p.state === 'charge' || p.state === 'heal';
  if (canTurn) {
    if (aimMode === 'mouse') p.face = Math.atan2(mouse.y - p.y, mouse.x - p.x);
    else if (moving) p.face = Math.atan2(mv.y, mv.x);
  }
  if (p.stun > 0) {
    p.blocking = false; p.scanning = false;
  } else switch (p.state) {
    case 'free': {
      var bk = !!(keys['l'] || keys['shift']), was = p.blocking;
      p.blocking = bk && p.st > 0;
      if (p.blocking && !was) { p.blockStart = tNow; stats.blocks++; obsRead('block', 1.3); }
      p.scanning = !!keys['q'] && !p.blocking;
      if (p.scanning) { p.scanT = Math.min(1.2, p.scanT + dt); speedMul *= .45; } else p.scanT = Math.max(0, p.scanT - dt * 3);
      if (p.blocking) speedMul *= .5;
      speedMul *= curW().walk * (fullSet() === 'warren' ? 1.05 : 1) * (p.frenzy ? 1.12 : 1) * (fxOn('bind') ? .6 : 1) * (p.hasteT > 0 ? 1.18 : 1);
      if (p.bufDodge > 0 && p.st >= curW().dodge * (p.frenzy ? 1.5 : 1)) { startDodge(); break; }
      if (p.bufAtk > 0 && !p.blocking && p.slipT > 0 && M.state !== 'downed') { startSlip(); break; }
      if (p.bufHeavy > 0 && !p.blocking) {
        if (curW().dashcut && p.st >= 14) { startDashCut(); break; }
        if (curW().thicket && p.thCd <= 0 && p.st >= 16) { startThicket(); break; }
        if (curW().tether && M.tether > 0 && p.st >= 12) { startYank(); break; }
      }
      var waitHold = curW().holdCharge && isAtkHeld() && !p.chargeNeedRelease && p.st >= 10;
      if (p.bufAtk > 0 && !p.blocking && !waitHold && (p.frenzy ? p.st > 0 : p.st >= 7)) {
        var nx = (p.comboWin > 0 && p.combo > 0 && p.combo < maxStage()) ? p.combo + 1 : 1;
        if (nx > 1 && !nextOk(nx)) nx = 1;
        startAttack(nx); break;
      }
      if (chargeHeld && !p.blocking && p.st >= 10 && curW().heavy(0)) { startCharge(); break; }
      var sp = CFG.walk * speedMul;
      p.x += mv.x * sp * dt; p.y += mv.y * sp * dt;
      if (moving) p.walk += sp * dt * .06;
      break;
    }
    case 'charge': {
      p.charge = Math.min(curW().heavyT * 1.2, p.charge + dt * (fxOn('numb') ? .75 : 1));
      if (p.bufDodge > 0 && p.st >= curW().dodge) { startDodge(); break; }
      var sp2 = CFG.walk * .4;
      p.x += mv.x * sp2 * dt; p.y += mv.y * sp2 * dt;
      if (!chargeHeld) fireHeavy();
      break;
    }
    case 'dodge': {
      p.dodgeT += dt;
      if (p.slipT > 0 && p.bufAtk > 0 && p.dodgeT > .1 && M.state !== 'downed') { startSlip(); break; }
      var tt = p.dodgeT / .3, spd = 640 * (1 - tt * .75) * (p.frenzy ? 1.55 : 1);
      p.x += p.dodgeDir.x * spd * dt; p.y += p.dodgeDir.y * spd * dt;
      p.iframes = (p.dodgeT > .03 && p.dodgeT < .27) ? 1 : 0;
      p.trailT -= dt;
      if (p.trailT <= 0) { p.trail.push({ x: p.x, y: p.y, life: .22, fz: p.frenzy }); p.trailT = .04; }
      if (p.dodgeT >= .3) { p.state = 'free'; p.iframes = 0; }
      break;
    }
    case 'atk': {
      var s = p.atk, ad = dt * (p.frenzy ? 1.35 : 1) * (fxOn('numb') ? .75 : 1); p.atkT += ad;
      if (p.atkT < s.wind + s.act) {
        var ls = s.lunge / (s.wind + s.act);
        p.x += Math.cos(p.face) * ls * ad; p.y += Math.sin(p.face) * ls * ad;
      }
      if (s.multi) {
        if (p.atkT >= s.wind) {
          var kk = Math.min(s.multi.n, Math.floor((p.atkT - s.wind) / s.multi.gap) + 1);
          while ((s.done || 0) < kk) { s.done = (s.done || 0) + 1; var q = {}; for (var qk in s) q[qk] = s[qk]; q.pr = s.done === s.multi.n; if (s.pierce && s.done === 2) q.opp = true; tryPlayerHit(q); }
        }
      } else if (!p.atkHit && p.atkT >= s.wind && p.atkT < s.wind + s.act) tryPlayerHit();
      var recStart = s.wind + s.act + .04;
      if (p.atkT >= recStart && p.bufDodge > 0 && p.st >= curW().dodge) { startDodge(); break; }
      if (p.atkT >= recStart && p.bufHeavy > 0 && !s.heavy) {
        if (curW().dashcut && p.st >= 14) { startDashCut(); break; }
        if (curW().thicket && p.thCd <= 0 && p.st >= 16) { startThicket(); break; }
        if (curW().tether && M.tether > 0 && p.st >= 12) { startYank(); break; }
      }
      if (!s.heavy && p.atkT >= recStart && p.bufAtk > 0 && nextOk(p.atkStage + 1)) { startAttack(p.atkStage + 1); break; }
      if (p.atkT >= s.wind + s.act + s.rec * (s.heavy ? 1 : 1 - .08 * p.flow)) {
        p.state = 'free';
        if (!s.heavy) { var ms = maxStage(); p.combo = p.atkStage; p.comboWin = p.atkStage < ms ? .35 + .1 * p.flow : 0; if (p.atkStage >= ms) p.combo = 0; }
      }
      break;
    }
    case 'heal': {
      p.healT += dt;
      if (p.bufDodge > 0 && p.st >= curW().dodge) { startDodge(); break; }
      var sp3 = CFG.walk * .3;
      p.x += mv.x * sp3 * dt; p.y += mv.y * sp3 * dt;
      if (p.healT >= healTime()) {
        p.hp = Math.min(p.maxHp, p.hp + healAmt()); p.infT = 0; clearFx(); p.salves--; p.state = 'free';
        ftext(p.x, p.y - 24, '+' + healAmt() + ' HP', '#7fe0b5', 16); ring(p.x, p.y, 8, 36, '#7fe0b5', .5); sfx('heal');
      }
      break;
    }
  }
  // stamina
  var busy = p.state === 'atk' || p.state === 'dodge' || p.state === 'charge';
  if (p.blocking) { p.stDelay = Math.max(p.stDelay, .3); }
  p.stDelay = Math.max(0, p.stDelay - dt);
  if (!busy && !p.blocking && p.stDelay <= 0) p.st = Math.min(p.maxSt, p.st + CFG.stRegen * dt * (fxOn('sap') ? .3 : 1) * (p.hasteT > 0 ? 1.3 : 1) * (fullSet() === 'hide' ? 1.3 : 1) * (p.favor ? 1.2 : 1) * (p.hp <= p.maxHp * .35 ? 1.25 : 1));
  p.st = clamp(p.st, 0, p.maxSt);
  if (hasSkill('wind') && !p.windUsed && p.st < 15 && !p.dead) {
    p.windUsed = true; p.st = Math.min(p.maxSt, p.st + 20);
    ftext(p.x, p.y - 32, 'SECOND WIND', '#7fe0b5', 15, 1); ring(p.x, p.y, 8, 40, '#7fe0b5', .5); sfx('heal');
  }
  if (p.blocking && p.st <= 0) p.blocking = false;
  // knockback + collisions
  p.x += p.kvx * dt; p.y += p.kvy * dt;
  var kd = Math.max(0, 1 - 9 * dt); p.kvx *= kd; p.kvy *= kd;
  for (var i = 0; i < ROCKS.length; i++) pushOut(p, ROCKS[i].x, ROCKS[i].y, ROCKS[i].r);
  pushOut(p, M.x, M.y, M.r * .85);
  keepInArena(p);
  for (var t = p.trail.length - 1; t >= 0; t--) { p.trail[t].life -= dt; if (p.trail[t].life <= 0) p.trail.splice(t, 1); }
  // scan lock
  if (p.scanning && p.scanT >= scanTime() && dist(p.x, p.y, M.x, M.y) < 380) {
    var first = !scanRec;
    var v = vitals(); scanRec = { t: tNow, hr: v.hr, temp: v.temp, br: v.br, stress: v.stress, inf: v.inf };
    if (!p._scanLocked) { p._scanLocked = true; stats.scans++; sfx('scan'); }
    if (!M.diagKnown) {
      var helplessNow = M.state === 'stagger' || M.state === 'stun' || M.state === 'exhaust' || M.state === 'retreat' || M.drowsyT > 0 || M.state === 'downed';
      if (M.kind === 'fawn' || (M.narrow && helplessNow)) confirmDiag('สแกนละเอียดตอนมันอ่อนแรง');
      else if (!M.narrow) { M.narrow = true; ftext(M.x, M.y - M.r - 40, 'สงสัย: ' + suspectNames(), '#ffd45a', 15, 2.2); ring(M.x, M.y, M.r, M.r + 36, '#ffd45a', .5, 3); showHint('สแกนได้ผลเบื้องต้น: สงสัย ' + suspectNames() + ' — ยังไม่ยืนยัน! สแกนซ้ำตอนมันเซ/สตัน/หมดแรง/ง่วงซึม หรือรอดูท่าประจำอาการของมัน ยิงยาเดาผิด = มันโมโห', 8); }
      else if ((M.scanMsgT || 0) < tNow) { M.scanMsgT = tNow + 3; ftext(M.x, M.y - M.r - 40, 'ยังไม่แน่ชัด — สแกนซ้ำตอนมันเซ/หมดแรง', '#ffd45a', 13, 1.6); }
    }
    if (!phScan(M) && M.kind !== 'fawn') {
      M.scanPh = true; M.scanLog = M.scanLog || {}; M.scanLog[M.phase] = 1;
      var PSN = { 1: 'สแกนเฟส 1', 2: 'สแกนเฟส 2 · ล็อกเป้า', 3: 'สแกนเฟส 3 · ล็อกจุดวิกฤต' };
      ftext(M.x, M.y - M.r - 62, PSN[M.phase] + '!', '#9fe8ff', 18, 2); ring(M.x, M.y, M.r, M.r + 70, '#9fe8ff', .6, 4);
      showHint(M.phase === 3 ? 'ล็อกจุดวิกฤตแล้ว: ตีจุดอาการเจ็บ +30% · ยารักษาได้ผล +25% · ตีโดนทุกจุด +10%' : (M.phase === 2 ? 'ล็อกเป้าแล้ว: ตีโดนทุกจุด +10% · ยารักษาได้ผล +25% · เฟสถัดไปต้องสแกนใหม่' : 'สแกนแล้ว: บันทึกอาการเฟสนี้ไว้'), 5);
    }
    if (first) hintOnce('scanned', 'ชีพจรถูกบันทึกแล้ว — ตัวเลขนี้จะเป็นข้อมูลตอนเลือกโดสยาสลบ', 4);
  } else if (!p.scanning) p._scanLocked = false;
}
function dotPlayer(d, src) {
  if (P.dead || mode !== 'playing') return;
  P.hp -= d; stats.dmgBy[src || 'infect'] += d;
  if (P.hp <= 0) playerDied();
}
function playerDied() {
  if (P.dead) return;
  P.dead = true; P.hp = 0; slowT = 1.2; addShake(10);
  setTimeout(function () { if (mode === 'playing') finish('defeat'); }, 900);
}
function perfectDodge() {
  stats.perfect++; slowT = .55; screenFx(.2, '#9fe8ff', .5); P.slipT = .7; P.st = Math.min(P.maxSt, P.st + 22); gainFlow();
  ftext(P.x, P.y - 30, 'PERFECT!', '#ffd45a', 20, 1); ring(P.x, P.y, 10, 50, '#ffd45a', .45); sfx('perfect');
  hintOnce('perfect', 'Perfect Dodge! เวลาช้าลงชั่วครู่ — กดตีทันที = SLIP STRIKE พุ่งเข้าไปตีสวน', 3);
}
var MELEE_SRC = { breath: 1, nova: 1, burrow: 1, charge: 1, sweep: 1, stomp: 1, kick: 1, leap: 1, bash: 1, tusk: 1, rake: 1, roll: 1 };
// ท่าพื้นฐานผูกกับระยะโรค: ระยะ III ติดเชื้อมากับท่า / variant ระยะ II+ ดูดพลังมากับท่า
function hurtPlayer(dmg, sx, sy, o) {
  var r = hurtPlayer0(dmg, sx, sy, o);
  if (r === 'hit' && o && MELEE_SRC[o.src] && M) {
    var sg = sickStage(M);
    if (sg === 3) { var idr = infDur(); if (idr > 0) { var wasI = P.infT > 0; P.infT = Math.max(P.infT, Math.min(idr, 3)); if (!wasI) { ftext(P.x, P.y - 40, 'เชื้อติดมากับท่า!', '#c79cff', 14, 1); hintOnce('infmelee', 'ระยะวิกฤต: ท่าธรรมดาของมันก็ทำให้ติดเชื้อได้แล้ว — รักษาให้ระยะลดลงหรือใช้ยาสมานแผล (R)', 6); } } }
    if (vStage(M) >= 2) { applyFx('sap', 3); }
    if (o.src === 'breath' || o.src === 'nova') applyFx('burn');
    if (M.kind === 'wolf') { var bl = { rake: .7, tusk: .7, sweep: .4, leap: .4, kick: .3, charge: .3 }[o.src]; if (bl && Math.random() < bl) applyFx('bleed'); }
  }
  return r;
}
function hurtPlayer0(dmg, sx, sy, o) {
  o = o || {};
  var p = P;
  if (p.dead || mode !== 'playing') return 'none';
  dmg *= (M.dmgMul || 1) * (M.cured ? .88 : 1) * (M.enrageT > 0 ? 1.15 : 1) * (sickStage(M) === 3 ? 1.12 : 1) * (M.phase === 3 ? 1.1 : 1) * (1 + BAL.rageDmg * rageN(M));
  if (p.hurtT > 0) return 'none';
  if (p.iframes > 0) {
    if (!o.noPerfect && tNow - p.dodgeStart < .22) perfectDodge();
    return 'dodged';
  }
  var ang = Math.atan2(sy - p.y, sx - p.x);
  if (o.pierce && p.blocking && Math.abs(angDiff(ang, p.face)) < 1.7) { dmg *= .65; ftext(p.x, p.y - 22, 'ไฟทะลุการป้องกัน!', '#ff9a4a', 13, .9); }
  if (p.blocking && !o.pierce && Math.abs(angDiff(ang, p.face)) < 1.7) {
    if (o.canParry && tNow - p.blockStart < .2) {
      stats.parry++; slowT = .35; hitstop = .12; screenFx(.3, '#cfe8ff', .7); p.hurtT = .4; p.slipT = .7; gainFlow();
      p.st = Math.min(p.maxSt, p.st + 25);
      ftext(p.x, p.y - 30, 'PARRY!', '#9fe8ff', 22, 1); ring(p.x, p.y, 10, 60, '#9fe8ff', .5, 4); burst(p.x, p.y, '#9fe8ff', 14, 220); sfx('parry');
      if (M.state !== 'downed' && !M.invuln) startStagger(1.3, false);
      hintOnce('parry', 'Parry สำเร็จ! มอนสเตอร์เสียหลัก', 3);
      return 'parried';
    }
    var cost = 14 * (o.heavy ? 1.5 : 1) * (curW().blockMul || 1) * armorBlk();
    if (p.st >= cost) {
      p.st -= cost; p.stDelay = .8; p.hurtT = .35;
      var cd = dmg * .3; p.hp -= cd; stats.taken++; if (o.src) stats.dmgBy[o.src] += cd;
      p.kvx += Math.cos(ang + Math.PI) * 170; p.kvy += Math.sin(ang + Math.PI) * 170;
      burst(p.x, p.y, '#cfe8ff', 6, 150); ftext(p.x, p.y - 22, 'BLOCK', '#cfe8ff', 14); addShake(3); sfx('block');
      if (p.hp <= 0) playerDied();
      return 'blocked';
    }
    p.st = 0; p.stun = .5; ftext(p.x, p.y - 30, 'GUARD BREAK', '#e8a04a', 16);
  }
  if (p.state === 'charge' && curW().armor) { dmg *= .6; ftext(p.x, p.y - 36, 'ARMOR', '#ffb066', 13, .7); }
  dmg *= (curW().taken || 1) * armorTaken() * (p.frenzy ? 1.3 : 1) * (fxOn('brittle') ? 1.2 : 1);
  if (fullSet() === 'bristle' && !p.lsUsed && p.hp - dmg <= 0) { dmg = Math.max(0, p.hp - 1); p.lsUsed = true; p.hurtT = 1.5; ftext(p.x, p.y - 52, 'LAST STAND!', '#ffd45a', 22, 1.4); ring(p.x, p.y, p.r, p.r + 70, '#ffd45a', .5, 5); }
  p.hp -= dmg; p.hurtT = Math.max(p.hurtT, .55); stats.taken++;
  if (p.flow > 0) ftext(p.x, p.y - 44, 'FLOW หาย', '#c79c9c', 14, 1);
  if (p.streak >= 5) ftext(p.x, p.y - 58, 'สตรีคขาด', '#c79c9c', 13, .9);
  p.streak = 0; p.streakT = 0;
  p.flow = 0; p.flowT = 0; p.counter = 0; if (o.src) stats.dmgBy[o.src] += dmg;
  if (p.state === 'heal') p.state = 'free';
  var armored = p.state === 'charge' && curW().armor;
  if (p.state === 'charge' && !armored) { p.state = 'free'; p.charge = 0; }
  var kb = (o.kb || 160) * (armored ? .3 : 1);
  p.kvx += Math.cos(ang + Math.PI) * kb; p.kvy += Math.sin(ang + Math.PI) * kb;
  burst(p.x, p.y, '#e0524a', 10, 200); ftext(p.x, p.y - 24, '-' + Math.round(dmg), '#ff6a5a', 20, 1);
  addShake(8); hitstop = Math.max(hitstop, .06); sfx('hurt'); hitChain = 0; hitChainT = 0; screenFx(.12, '#ff2a2a', .25);
  if (p.hp <= 0) playerDied();
  return 'hit';
}

