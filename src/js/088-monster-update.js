var ADAPT_TH = { dodge: 'จับจังหวะกลิ้ง', block: 'ทะลวงการ์ด', melee: 'ไล่คนตีประชิด', range: 'ตามคนยืนไกล' };
function obsRead(k, w) { if (M && M.aggro && M.read && M.read[k] != null) M.read[k] = Math.min(10, M.read[k] + (w || 1)); }
function addFire(x, y, r, life) {
  if (dist(x, y, CX, CY) > ARENA_R - 10) return;
  FIRES.push({ x: x, y: y, r: r, t: 0, life: life }); if (FIRES.length > 46) FIRES.shift();
  stats.fires++; huntFires++;
}
function fireRing(x, y, n, rad, r, life) { var a0 = rand(0, TAU); for (var i = 0; i < n; i++) addFire(x + Math.cos(a0 + i * TAU / n) * rad, y + Math.sin(a0 + i * TAU / n) * rad, r, life); }
function updateFires(dt) {
  for (var i = FIRES.length - 1; i >= 0; i--) {
    var f = FIRES[i]; f.t += dt;
    if (!P.dead && P.iframes <= 0 && dist(P.x, P.y, f.x, f.y) < f.r + P.r * .5) {
      if (!fxOn('burn')) hintOnce('firehint', 'ไฟลุกบนพื้น! เหยียบแล้วติดไฟลวก เสีย HP ต่อเนื่อง — เดินอ้อมกองไฟ (ไฟดับเองใน ~5-8 วิ)', 6);
      applyFx('burn');
    }
    if (f.t >= f.life) FIRES.splice(i, 1);
  }
}
function shrineUpdate(dt) {
  var m = M, p = P, S0 = SHRINE;
  if (!S0) { SHRINE = S0 = { x: CX, y: CY, hp: 100, burning: false, ext: 0, fireT: 0, lost: false, saved: 0 }; m.shrineT = 14; }
  if (m.torch && (m.state !== 'stalk' || m.tether > 0 || m.hp <= 0)) {
    m.torch = null; m.shrineT = m.phase >= 2 ? 16 : 20; S0.saved++;
    ftext(m.x, m.y - m.r - 44, 'ขัดจังหวะสำเร็จ!', '#9be8ff', 20, 1.6); ring(S0.x, S0.y, 20, 90, '#9be8ff', .5, 4);
  }
  if (!m.torch && m.state === 'stalk' && !S0.lost) {
    m.shrineT -= dt;
    if (m.shrineT <= 0) {
      if (S0.burning) m.shrineT = 6;
      else { m.torch = { ph: 'go', t: 0 }; hintOnce('torchhint', 'Aggro Wolf พุ่งไปเผาพุ่มไม้ศักดิ์สิทธิ์กลางสนาม! ขัดจังหวะก่อนมันเผาครบ ~3 วิ: ทำให้มัน stagger/สลบ หรือใช้ Tether Lance ดึงมัน', 9); ftext(m.x, m.y - m.r - 44, 'มันมุ่งไปที่พุ่มไม้!', '#ffb04a', 18, 1.4); }
    }
  }
  if (S0.burning && !S0.lost) {
    S0.hp -= 4 * dt; S0.fireT += dt;
    if (S0.fireT > 2.6) { S0.fireT = 0; addFire(S0.x + rand(-80, 80), S0.y + rand(-80, 80), 28, 5); }
    if (!p.dead && dist(p.x, p.y, S0.x, S0.y) < 80) { S0.ext += dt; if (S0.ext >= 1.8) { S0.burning = false; S0.ext = 0; S0.saved++; ftext(S0.x, S0.y - 60, 'ดับไฟได้แล้ว!', '#9be8ff', 22, 1.8); ring(S0.x, S0.y, 20, 110, '#9be8ff', .6, 6); } }
    else S0.ext = Math.max(0, S0.ext - .5 * dt);
    if (S0.hp <= 0) { S0.hp = 0; S0.burning = false; S0.lost = true; m.torch = null; ftext(S0.x, S0.y - 60, 'พุ่มไม้ศักดิ์สิทธิ์ถูกเผาหมด!', '#ff4a3a', 22, 2.4); showHint('พุ่มไม้ศักดิ์สิทธิ์ถูกเผาหมดแล้ว — ป่าจะเสียหายหนักตอนจบ', 6); addShake(8); }
  }
}
function aggroUpdate(dt) {
  var m = M, p = P, k, d = Math.hypot(p.x - m.x, p.y - m.y);
  shrineUpdate(dt);
  for (k in m.read) m.read[k] *= Math.max(0, 1 - .14 * dt);
  if (d > 280) m.read.range += .35 * dt; if (d < 130) m.read.melee += .3 * dt;
  if (m.lpx != null && dt > 0) { m.pvx += ((p.x - m.lpx) / dt - m.pvx) * .2; m.pvy += ((p.y - m.lpy) / dt - m.pvy) * .2; }
  m.lpx = p.x; m.lpy = p.y; m.adaptMsgT = Math.max(0, m.adaptMsgT - dt); m.adaptT = (m.adaptT || 0) - dt;
  if (m.adaptT <= 0) {
    m.adaptT = .8; var best = '', bv = 0; for (k in m.read) if (m.read[k] > bv) { bv = m.read[k]; best = k; }
    var prev = m.adapt; m.adapt = bv >= 3.2 ? best : (prev && m.read[prev] >= 2 ? prev : '');
    if (m.adapt && m.adapt !== prev && m.adaptMsgT <= 0) {
      m.adaptMsgT = 5; var AM = { dodge: 'มันจับจังหวะกลิ้งของคุณได้ — เล็งดักข้างหน้า!', block: 'มันรู้ว่าคุณตั้งการ์ด — ไฟทะลุการป้องกัน!', melee: 'มันระแวงการตีประชิด — ระเบิดไฟไล่!', range: 'มันเห็นคุณยืนไกล — พ่นไฟตามและพุ่งเข้าหา!' };
      ftext(m.x, m.y - m.r - 60, 'อ่านทางคุณออก!', '#ff9a4a', 20, 1.6); ring(m.x, m.y, m.r, m.r + 60, '#ff9a4a', .5, 4);
      showHint('Aggro Wolf ปรับตัว: ' + AM[m.adapt], 5);
    }
  }
}
function pracUpdate(dt) {
  var m = M, p = P, R = PRAC; m.hitFlash = Math.max(0, m.hitFlash - dt); R.t += dt;
  var dmg = m.maxHp - m.hp;
  if (dmg > .05) {
    if (R.last >= 0 && R.t - R.last > 8) { R.total = 0; R.first = -1; R.hits = []; R.n = 0; R.peak = 0; R.cn = 0; R.cd = 0; R.bn = 0; R.bd = 0; R.nh = 0; R.nc = 0; }
    if (R.first < 0) R.first = R.t;
    R.total += dmg; R.n++; R.peak = Math.max(R.peak, dmg);
    if (R.t - R.cl <= 1.1) { R.cn++; R.cd += dmg; } else { R.cn = 1; R.cd = dmg; }
    R.cl = R.t; R.last = R.t;
    if (R.cd > R.bd) { R.bd = R.cd; R.bn = R.cn; }
    R.hits.push({ t: R.t, d: dmg, c: !!R.flagCrit }); R.flagCrit = false; if (R.hits.length > 400) R.hits.shift();
  }
  m.hp = m.maxHp; m.stag = 0; m.state = 'stalk'; m.atk = null; m.invuln = false; m.stT = 0; m.thinkT = 99; m.sed = 0; m.tether = 0;
  if (m.armorMax && m.armor <= 0) { R.armT += dt; if (R.armT > 3) { m.armor = m.armorMax; R.armT = 0; } } else R.armT = 0;
  p.hp = p.maxHp; p.st = p.maxSt; p.infT = 0; if (p.dead) p.dead = false;
  if (keys['x']) { keys['x'] = false; enterVillage('กลับจากลานซ้อม'); }
  if (keys['b']) { keys['b'] = false; R.total = 0; R.first = -1; R.last = -1; R.hits = []; R.n = 0; R.peak = 0; R.cn = 0; R.cd = 0; R.bn = 0; R.bd = 0; R.nh = 0; R.nc = 0; ftext(p.x, p.y - 40, 'รีเซ็ตสถิติ', '#9fe1cb', 14, .8); }
}
function pracStats() {
  var R = PRAC, i, w5 = 0; if (!R) return null;
  for (i = R.hits.length - 1; i >= 0 && R.hits[i].t > R.t - 5; i--) w5 += R.hits[i].d;
  var span = R.first >= 0 ? Math.max(1, (R.t - R.last > 2 ? R.last : R.t) - R.first) : 1;
  var cI = critInfo(M, {}); return { crits: R.nc || 0, nh: R.nh || 0, critRate: R.nh ? (R.nc || 0) / R.nh : 0, critNow: cI.p, critMul: cI.m, total: Math.round(R.total), dps: R.first >= 0 ? R.total / span : 0, dps5: w5 / 5, n: R.n, peak: Math.round(R.peak), cn: (R.t - R.cl <= 1.1) ? R.cn : 0, cd: Math.round(R.cd), bn: R.bn, bd: Math.round(R.bd), span: span };
}
function updateMonster(dt) {
  var m = M, p = P, i;
  m.hitFlash = Math.max(0, m.hitFlash - dt);
  m.rollCd = Math.max(0, (m.rollCd || 0) - dt); m.howlCd = Math.max(0, (m.howlCd || 0) - dt); m.sumCd = Math.max(0, (m.sumCd || 0) - dt); m.packT = Math.max(0, (m.packT || 0) - dt); m.burrowCd = Math.max(0, (m.burrowCd || 0) - dt); m.pollenCd = Math.max(0, (m.pollenCd || 0) - dt); m.ensCd = Math.max(0, (m.ensCd || 0) - dt * (vStage(m) >= 2 ? 1.25 : 1)); m.sproutCd = Math.max(0, (m.sproutCd || 0) - dt * (vStage(m) >= 2 ? 1.25 : 1)); m.sporeCd = Math.max(0, m.sporeCd - dt); m.sigCd = Math.max(0, m.sigCd - dt); m.scarCd = Math.max(0, m.scarCd - dt);
  if (m.wound) { m.wound.t += dt; if (m.wound.t >= m.wound.life) { m.wound = null; m.scarCd = 6; ftext(m.x, m.y - m.r - 30, 'แผลปิดแล้ว', '#9aa39a', 13, 1); } } m.rockCd = Math.max(0, m.rockCd - dt); m.stagCd = Math.max(0, m.stagCd - dt);
  if (m.drowsyT > 0) m.drowsyT -= dt;
  if (m.state === 'downed') return;
  if (m.state !== 'idle' && m.kind !== 'fawn' && !PRAC) { /* ยิ่งสู้นาน ยิ่งคลั่ง: ตัวจับเวลา + ประกาศเมื่อขึ้นขั้น */
    m.fightT = (m.fightT || 0) + dt; var rg = rageN(m);
    if (rg > (m.rageShown || 0)) { m.rageShown = rg; ftext(m.x, m.y - m.r - 70, 'คลั่ง ×' + rg + '!', '#ff4a4a', 22, 1.5); ring(m.x, m.y, m.r, m.r + 80, '#ff4a4a', .5, 5); sfx('roar'); hintOnce('rage', 'ยิ่งสู้นานมันยิ่งคลั่ง: ดาเมจแรงขึ้นและท่าเร็วขึ้นเป็นขั้น ๆ — ชุดอาวุธ/เกราะที่ดีกว่าจะช่วยปิดเกมเร็วและทนได้มากกว่า', 7); }
    else if (rg < (m.rageShown || 0)) m.rageShown = rg;
  }
  if (m.aggro) { aggroUpdate(dt); m.breathCd = Math.max(0, (m.breathCd || 0) - dt); m.novaCd = Math.max(0, (m.novaCd || 0) - dt); }
  var target = (m.phase >= 2 ? 55 : 22); if (m.state === 'exhaust') target = 30;
  m.stress = clamp(m.stress + (target - m.stress) * Math.min(1, dt * .3), 0, 100);
  var fl = lvl(m.tr.flank);
  if (fl > 0 && m.hp > 1) m.hp = Math.max(1, m.hp - fl * 1.4 * (m.ail === 'sepsis' ? 1.5 : 1) * dt);
  if (m.state === 'stalk' || m.state === 'idle') m.stam = Math.min(100, m.stam + 9 * dt);
  var hl = lvl(m.tr.hind);
  var spd = (m.kind === 'rabbit' ? 1.3 : (m.kind === 'wolf' ? 1.2 * (m.packT > 0 ? 1.15 : 1) : (m.kind === 'hive' ? .95 : 1))) * [1, 1, 1.05, 1.1][sickStage(m)] * (m.ail === 'limp' && !m.cured ? .93 : 1) * (m.mut === 'limp' ? 1.22 : 1) * (1 - .1 * hl) * (m.drowsyT > 0 ? .6 : 1) * (m.phase >= 2 ? 1.15 : 1) * (m.tether > 0 ? .6 : 1) * (m.thT > 0 ? .55 : 1);
  if (m.tether > 0) { m.tether -= dt; if (Math.hypot(p.x - m.x, p.y - m.y) > 360) { m.tether = 0; ftext(m.x, m.y - m.r - 28, 'สายขาด', '#aab4c0', 14, .8); } }
  var dx = p.x - m.x, dy = p.y - m.y, d = Math.hypot(dx, dy), toP = Math.atan2(dy, dx);
  if (d < 150) m.nearT = Math.min(8, m.nearT + dt); else m.nearT = Math.max(0, m.nearT - dt * 2);
  switch (m.state) {
    case 'idle':
      m.stT += dt;
      if (!m.ambush) m.face = turnToward(m.face, toP, dt * .5);
      if (d < (m.ambush ? 55 : 270) || m.stT > (m.ambush ? 14 : 7) || m.provoked) { m.state = 'roar'; m.stT = 0; m.stDur = 1.2; sfx('roar'); ring(m.x, m.y, m.r, 150, '#ff7a5a', .7, 4); addShake(6); hintOnce('wake', 'มันตื่นแล้ว! เส้น/พื้นที่สีแดง = บริเวณที่กำลังจะถูกโจมตี — กด Space เพื่อกลิ้งหลบ', 5.5); }
      break;
    case 'roar':
      m.stT += dt; m.face = turnToward(m.face, toP, dt * 3);
      if (m.stT >= m.stDur) { m.invuln = false; if (m.phase >= 2 && m.kind !== 'fawn' && !m.cured && !(m.retr && m.retr[m.phase])) toRetreat(); else toStalk(); }
      break;
    case 'stalk': {
      if (m.aggro && m.torch && SHRINE) {
        var sx = SHRINE.x - m.x, sy = SHRINE.y - m.y, sd = Math.hypot(sx, sy), sa = Math.atan2(sy, sx);
        m.stT += dt; m.face = turnToward(m.face, sa, dt * 6);
        if (m.torch.ph === 'go') {
          if (sd > 108) { var sst = Math.min(sd - 104, 110 * spd * 1.6 * dt); m.x += Math.cos(sa) * sst; m.y += Math.sin(sa) * sst; m.walk += sst * .14; }
          else { m.torch.ph = 'burn'; m.torch.t = 0; ftext(m.x, m.y - m.r - 44, 'กำลังเผาพุ่มไม้!', '#ff7a3a', 18, 1.4); sfx('roar'); }
        } else {
          m.torch.t += dt;
          if (Math.random() < dt * 22) burst(m.x + Math.cos(sa) * (m.r + 20 + rand(0, 60)), m.y + Math.sin(sa) * (m.r + 20 + rand(0, 60)), '#ff9a3a', 2, 110, .5);
          if (m.torch.t >= 3) {
            m.torch = null; m.shrineT = m.phase >= 2 ? 20 : 26; SHRINE.burning = true; SHRINE.ext = 0; SHRINE.fireT = 0;
            ring(SHRINE.x, SHRINE.y, 20, 120, '#ff7a3a', .6, 6); fireRing(SHRINE.x, SHRINE.y, 5, 70, 30, 6);
            ftext(SHRINE.x, SHRINE.y - 60, 'พุ่มไม้ติดไฟ!', '#ff5a3a', 22, 1.8); showHint('พุ่มไม้ศักดิ์สิทธิ์ติดไฟแล้ว! ยืนใกล้ ๆ ค้างไว้ราว 2 วิ เพื่อดับไฟ — ไม่งั้นพุ่มไม้จะค่อยๆ ไหม้หมดและป่าจะเสียหายหนัก', 7);
          }
        }
        break;
      }
      m.stT += dt; m.face = turnToward(m.face, toP, dt * 2.6 * spd);
      if (d > 95) {
        var step = Math.min(d - 95, 110 * spd * dt);
        m.x += Math.cos(m.face) * step; m.y += Math.sin(m.face) * step; m.walk += step * .12;
      }
      m.thinkT -= dt;
      if (m.thinkT <= 0) startMonsterAttack(chooseAttack());
      break;
    }
    case 'tele': {
      m.atkT += dt;
      var A = m.atk, prog = m.atkT / A.dur;
      var aimA = (m.aggro && m.adapt === 'dodge' && A.name !== 'leap') ? Math.atan2(p.y + m.pvy * .4 - m.y, p.x + m.pvx * .4 - m.x) : toP;
      if (A.name !== 'kick' && prog < .7) { m.face = turnToward(m.face, aimA, dt * (m.aggro ? 4.4 : 3.5)); A.ang = m.face; }
      if (A.name === 'kick') A.ang = m.face + Math.PI;
      if ((A.name === 'leap' || A.name === 'burrow') && prog < .6) { var ldx = m.aggro && m.adapt === 'dodge' ? m.pvx * .35 : 0, ldy = m.aggro && m.adapt === 'dodge' ? m.pvy * .35 : 0; A.tx = lerp(A.tx, p.x + ldx, Math.min(1, dt * 5)); A.ty = lerp(A.ty, p.y + ldy, Math.min(1, dt * 5)); var lc = dist(A.tx, A.ty, CX, CY); if (lc > ARENA_R - 30) { A.tx = CX + (A.tx - CX) / lc * (ARENA_R - 30); A.ty = CY + (A.ty - CY) / lc * (ARENA_R - 30); } }
      if (prog >= 1 && A.hold > 0) { A.hold -= dt; m.atkT = A.dur; if (A.hold > 0) break; }
      if (prog >= 1) beginAct();
      break;
    }
    case 'act': {
      m.atkT += dt;
      var B = m.atk;
      if (B.name === 'charge') {
        var st = B.speed * dt;
        m.x += Math.cos(B.ang) * st; m.y += Math.sin(B.ang) * st; m.face = B.ang; m.walk += st * .2;
        if (m.aggro) { m.fireStep += st; if (m.fireStep >= 55) { m.fireStep = 0; addFire(m.x, m.y, 28, 5.5); } }
        if (!B.hit && dist(m.x, m.y, p.x, p.y) < m.r + p.r + 4) {
          B.hit = true;
          var res = hurtPlayer(28 * (m.phase >= 2 ? 1.15 : 1), m.x, m.y, { canParry: true, heavy: true, kb: 340, src: 'charge' });
          if (res === 'parried') { B.ended = true; }
        }
        if (m.state !== 'act' || !m.atk) break;
        var rockHit = false;
        for (i = 0; i < ROCKS.length; i++) {
          if (dist(m.x, m.y, ROCKS[i].x, ROCKS[i].y) < m.r + ROCKS[i].r) { rockHit = true; pushOut(m, ROCKS[i].x, ROCKS[i].y, ROCKS[i].r); break; }
        }
        if (rockHit && m.rockCd > 0) {
          m.state = 'stagger'; m.stT = 0; m.stDur = .5; m.atk = null;
          ring(m.x, m.y, m.r, 80, '#c79cff', .35, 4); addShake(5); sfx('stomp');
          break;
        }
        if (rockHit) {
          m.rockCd = 25; stats.rock++;
          m.hp -= 35; addTrauma('horn', 45); m.state = 'stun'; m.stT = 0; m.stDur = 1.8; m.atk = null; m.stag = 0;
          ring(m.x, m.y, m.r, 140, '#ffd45a', .6, 5); burst(m.x, m.y, '#ffd45a', 20, 300); addShake(14); hitstop = Math.max(hitstop, .14); sfx('break');
          ftext(m.x, m.y - 56, 'ชนหิน! -35', '#ffd45a', 22, 1.3);
          hintOnce('rockstun', 'ชนหิน! มันมึนงง — โจมตีให้หนัก!', 3.5);
          if (m.hp <= 0) monsterDowned();
          else checkPhase(m);
          break;
        }
        if (keepInArena(m)) {
          m.state = 'stagger'; m.stT = 0; m.stDur = .6; m.atk = null;
          ring(m.x, m.y, m.r, 90, '#c79cff', .4, 4); addShake(7); sfx('stomp');
          break;
        }
        if (B.ended || m.atkT >= B.maxT) { m.state = 'rec'; m.atkT = 0; }
      } else if (B.name === 'howl') {
        B.waveR = 30 + m.atkT * 540;
        var hd = dist(p.x, p.y, m.x, m.y);
        if (!B.hit && Math.abs(hd - B.waveR) < 24 + p.r) { B.hit = true; hurtPlayer(18 * (m.phase >= 2 ? 1.15 : 1), m.x, m.y, { kb: 300, src: 'howl' }); }
        if (m.phase >= 2) { var wr2 = 30 + Math.max(0, m.atkT - .42) * 540; if (m.atkT > .42 && !B.hit2 && Math.abs(hd - wr2) < 24 + p.r) { B.hit2 = true; hurtPlayer(14, m.x, m.y, { kb: 260, src: 'howl' }); } B.waveR2 = m.atkT > .42 ? wr2 : -1; }
        if (m.state === 'act' && m.atkT >= B.maxT) { m.state = 'rec'; m.atkT = 0; }
      } else if (B.name === 'tusk') {
        var ts = B.speed * dt;
        m.x += Math.cos(B.ang) * ts; m.y += Math.sin(B.ang) * ts; m.face = B.ang; m.walk += ts * .3;
        if (!B.hit && dist(m.x, m.y, p.x, p.y) < m.r + p.r + 12) { B.hit = true; var rt0 = hurtPlayer(20 * (m.phase >= 2 ? 1.15 : 1), m.x, m.y, { canParry: true, heavy: true, kb: 330, src: 'tusk' }); if (rt0 === 'parried') B.ended = true; }
        if (m.state !== 'act' || !m.atk) break;
        if (keepInArena(m)) { m.state = 'stagger'; m.stT = 0; m.stDur = .5; m.atk = null; break; }
        if (B.ended || m.atkT >= B.maxT) { m.state = 'rec'; m.atkT = 0; if (B.hit === false) B.rec *= 1.3; }
      } else if (B.name === 'breath') {
        B.ang = turnToward(B.ang, toP, dt * (m.phase >= 2 ? 1.5 : 1.0)); m.face = B.ang;
        B.tick -= dt; if (B.tick <= 0) {
          B.tick = .09; var bfd = rand(70, 300); burst(m.x + Math.cos(B.ang) * bfd, m.y + Math.sin(B.ang) * bfd, '#ff9a3a', 3, 120, .5);
          if (Math.random() < .55) addFire(m.x + Math.cos(B.ang + rand(-.3, .3)) * bfd, m.y + Math.sin(B.ang + rand(-.3, .3)) * bfd, 30, rand(5, 8));
        }
        B.hitT -= dt; if (B.hitT <= 0 && inWedge(m.x, m.y, B.ang, .4, 300, p.x, p.y, p.r)) { B.hitT = .3; hurtPlayer(9 * (m.phase >= 2 ? 1.15 : 1), m.x, m.y, { pierce: true, kb: 70, src: 'breath' }); }
        if (m.state === 'act' && m.atkT >= B.maxT) { m.state = 'rec'; m.atkT = 0; }
      } else if (B.name === 'rake') {
        if (!B.h2 && m.atkT >= .28) {
          B.h2 = true; ring(m.x, m.y, 20, 125, '#ff8a6a', .25, 6); sfx('swing');
          if (inWedge(m.x, m.y, B.ang2, .62, 125, p.x, p.y, 0)) hurtPlayer(17 * (m.phase >= 2 ? 1.15 : 1), m.x, m.y, { canParry: true, kb: 200, src: 'rake' });
        }
        if (m.state === 'act' && m.atkT >= B.maxT) { m.state = 'rec'; m.atkT = 0; }
      } else if (B.name === 'roll') {
        var rs0 = B.speed * dt;
        m.x += Math.cos(B.ang) * rs0; m.y += Math.sin(B.ang) * rs0; m.face = B.ang; m.walk += rs0 * .3;
        if (!B.hit && dist(m.x, m.y, p.x, p.y) < m.r + p.r + 4) {
          B.hit = true; hurtPlayer(20 * (m.phase >= 2 ? 1.15 : 1), m.x, m.y, { heavy: true, kb: 320, src: 'roll' });
        }
        if (m.state !== 'act' || !m.atk) break;
        var rrHit = false;
        for (i = 0; i < ROCKS.length; i++) {
          if (dist(m.x, m.y, ROCKS[i].x, ROCKS[i].y) < m.r + ROCKS[i].r) { rrHit = true; pushOut(m, ROCKS[i].x, ROCKS[i].y, ROCKS[i].r); break; }
        }
        if (rrHit) {
          m.hp -= 30; addTrauma('horn', 35); m.state = 'stun'; m.stT = 0; m.stDur = 2.2; m.atk = null; m.stag = 0; stats.rock++;
          if (m.armorMax) m.armor = Math.max(0, m.armor - 30);
          ring(m.x, m.y, m.r, 140, '#ffd45a', .6, 5); burst(m.x, m.y, '#ffd45a', 20, 300); addShake(14); hitstop = Math.max(hitstop, .14); sfx('break'); ftext(m.x, m.y - 56, 'ชนหิน! -30', '#ffd45a', 22, 1.3);
          if (m.hp <= 0) monsterDowned(); else checkPhase(m);
          break;
        }
        if (keepInArena(m)) {
          B.bounces++; B.hit = false;
          if (m.armorMax && m.armor > 0) { m.armor = Math.max(0, m.armor - 30); ftext(m.x, m.y - m.r - 20, 'เกราะร้าว!', '#aab4c0', 16, 1); }
          ring(m.x, m.y, m.r, 100, '#c79cff', .4, 4); addShake(8); sfx('stomp');
          if (B.bounces >= 2) { m.state = 'stagger'; m.stT = 0; m.stDur = .9; m.atk = null; break; }
          B.ang = Math.atan2(CY - m.y, CX - m.x) + rand(-.45, .45); B.maxT = Math.max(B.maxT, m.atkT + .5);
        }
        if (B.ended || m.atkT >= B.maxT) { m.state = 'rec'; m.atkT = 0; }
      } else if (B.name === 'bash') {
        var bs = B.speed * dt;
        m.x += Math.cos(B.ang) * bs; m.y += Math.sin(B.ang) * bs; m.face = B.ang; m.walk += bs * .2;
        if (!B.hit && dist(m.x, m.y, p.x, p.y) < m.r + p.r + 4) {
          B.hit = true;
          var rb = hurtPlayer(22 * (m.phase >= 2 ? 1.15 : 1), m.x, m.y, { canParry: true, heavy: true, kb: 300, src: 'bash' });
          if (rb === 'parried') B.ended = true;
        }
        if (m.state !== 'act' || !m.atk) break;
        if (keepInArena(m)) { m.state = 'stagger'; m.stT = 0; m.stDur = .6; m.atk = null; ring(m.x, m.y, m.r, 90, '#c79cff', .4, 4); addShake(7); sfx('stomp'); break; }
        if (B.ended || m.atkT >= B.maxT) {
          if (!B.hit) { B.rec *= 1.8; ftext(m.x, m.y - m.r - 28, 'เสียหลัก! โอกาสโจมตี', '#9fe8ff', 16, 1.4); }
          m.state = 'rec'; m.atkT = 0;
        }
      } else if (B.name === 'leap' || B.name === 'burrow') {
        var ld = dist(m.x, m.y, B.tx, B.ty), ls = (B.name === 'burrow' ? 560 : 820) * dt;
        m.face = Math.atan2(B.ty - m.y, B.tx - m.x);
        if (ld <= ls || m.atkT >= B.maxT) {
          m.x = B.tx; m.y = B.ty; keepInArena(m);
          if (B.name === 'burrow') {
            m.burrowed = false; m.invuln = false; B.rec *= 1.5;
            ring(m.x, m.y, 14, BURROW_R, '#a07a4a', .5, 6); burst(m.x, m.y, '#7a5a3a', 22, 280); addShake(9); sfx('stomp');
            ftext(m.x, m.y - m.r - 26, 'โผล่พ้นดิน! โอกาสโจมตี', '#9fe8ff', 15, 1.3);
            if (dist(p.x, p.y, B.tx, B.ty) < BURROW_R) hurtPlayer(20 * (m.phase >= 2 ? 1.15 : 1), m.x, m.y, { kb: 280, src: 'burrow' });
          } else {
            ring(m.x, m.y, 20, LEAP_R, '#ffb86a', .45, 6); burst(m.x, m.y, '#8a7a58', 14, 220); addShake(10); sfx('stomp');
            if (dist(p.x, p.y, B.tx, B.ty) < LEAP_R) hurtPlayer(24 * (m.phase >= 2 ? 1.15 : 1), m.x, m.y, { kb: 260, src: 'leap' });
            if (m.aggro) fireRing(m.x, m.y, m.phase >= 2 ? 5 : 4, 78, 30, 6);
          }
          m.state = 'rec'; m.atkT = 0;
        } else { m.x += Math.cos(m.face) * ls; m.y += Math.sin(m.face) * ls; m.walk += ls * .2; if (B.name === 'burrow' && Math.random() < .5) burst(m.x, m.y, '#7a5a3a', 2, 90, .4); }
      } else if (m.atkT >= .22) { m.state = 'rec'; m.atkT = 0; }
      break;
    }
    case 'rec': {
      m.atkT += dt;
      var C = m.atk;
      if (!C) { toStalk(); break; }
      if (C.chain2 && !C.restShown) { C.restShown = true; ftext(m.x, m.y - m.r - 28, 'หอบ! โอกาสโจมตี', '#9fe8ff', 16, 1.4); hintOnce('chainrest', 'ท่าต่อเนื่องจบแล้ว — มันหอบและเปิดช่องว่าง โจมตีสวนเลย!', 4); }
      if (m.atkT >= C.rec) {
        if (m.stam <= 0) { toExhaust(); break; }
        if (C.name === 'charge' && !C.chained && Math.random() < (m.phase >= 2 ? .55 : (m.kind === 'boar' ? .4 : 0))) { startMonsterAttack('charge', true); break; }
        if (!C.chained && m.kind !== 'fawn' && C.name === 'charge' && dist(m.x, m.y, P.x, P.y) < 170 && !P.dead && Math.random() < (m.kind === 'boar' ? .5 : .3)) {
          startMonsterAttack(m.kind === 'rabbit' ? 'kick' : 'sweep', false, true); break;
        }
        if (!C.chained && m.variant === 1 && m.mut === 'limp' && C.name === 'lash' && dist(m.x, m.y, P.x, P.y) < 270 && !P.dead && Math.random() < .6) {
          hintOnce('lashchain', 'ขากล้ามเนื้อคลั่ง! หนวดฟาดซ้ำสองครั้งติด — กลิ้งหลบแล้วอย่าเพิ่งเข้าใกล้', 5);
          startMonsterAttack('lash', false, true); break;
        }
        if (!C.chained && m.kind !== 'fawn' && (C.name === 'sweep' || C.name === 'stomp') && dist(m.x, m.y, P.x, P.y) < 185 && !P.dead && Math.random() < (m.phase >= 2 ? .6 : .38) + dfv('extra') + (sickStage(m) >= 2 ? .1 : 0)) {
          hintOnce('chainhint', 'ระวัง! บางทีมันต่อท่าที่สอง (ฟาด↔กระทืบ) — ดูรูปแดงอีกครั้งก่อนหลบ', 4.5);
          startMonsterAttack(m.kind === 'rabbit' ? 'kick' : (C.name === 'sweep' ? 'stomp' : 'sweep'), false, true); break;
        }
        toStalk();
      }
      break;
    }
    case 'retreat': {
      m.stT += dt; m.stress = clamp(m.stress - 6 * dt, 0, 100);
      var rdx = m.rtTx - m.x, rdy = m.rtTy - m.y, rd = Math.hypot(rdx, rdy);
      if (!m.rtSet && rd > 18) {
        m.face = turnToward(m.face, Math.atan2(rdy, rdx), dt * 5);
        var rs = Math.min(rd, 300 * spd * dt); m.x += Math.cos(m.face) * rs; m.y += Math.sin(m.face) * rs; m.walk += rs * .12;
      } else { m.rtSet = true; m.face = turnToward(m.face, toP + Math.PI, dt * 1.5); }
      if (d < 150 && m.rtSet) m.rtNear += dt; else m.rtNear = Math.max(0, m.rtNear - dt);
      if (m.rtNear > 1.2) endRetreat('near');
      else if (m.rtDmg >= m.maxHp * .07) endRetreat('hurt');
      else if (m.stT >= m.rtDur) endRetreat('back');
      break;
    }
    case 'stagger': case 'stun': case 'exhaust':
      m.stT += dt;
      if (m.stT >= m.stDur) {
        if (m.state === 'exhaust') m.stam = 60;
        m.stagCd = 5;
        toStalk();
      }
      break;
  }
  if (m.state !== 'downed') {
    for (i = 0; i < ROCKS.length; i++) if (m.state !== 'act') pushOut(m, ROCKS[i].x, ROCKS[i].y, ROCKS[i].r);
    if (m.state !== 'act') keepInArena(m);
  }
}

