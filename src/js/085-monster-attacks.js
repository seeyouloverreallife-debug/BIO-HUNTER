function rockInLane() {
  var a = Math.atan2(P.y - M.y, P.x - M.x), ca = Math.cos(a), sa = Math.sin(a), dp = dist(M.x, M.y, P.x, P.y);
  for (var i = 0; i < ROCKS.length; i++) {
    var dx = ROCKS[i].x - M.x, dy = ROCKS[i].y - M.y;
    var along = dx * ca + dy * sa, perp = Math.abs(-dx * sa + dy * ca);
    if (along > 0 && along < dp && perp < M.r + ROCKS[i].r) return true;
  }
  return false;
}
function chooseAttack() {
  var m = M, p = P;
  var dx = p.x - m.x, dy = p.y - m.y, d = Math.hypot(dx, dy);
  var behind = Math.abs(angDiff(Math.atan2(dy, dx), m.face)) > 2.2;
  if (behind && d < 125) return 'kick';
  if (m.kind === 'fawn') return (d < 135 && Math.random() < .55) ? 'sweep' : 'charge';
  var canSpore = m.sporeCd <= 0 && lvl(m.tr.horn) < 3;
  var o = [], i;
  var clingy = m.nearT > 3.5, kite = d > 190;
  if (d < 135) { o.push(['sweep', 3]); o.push(['stomp', clingy ? 4.5 : 3]); o.push(['charge', 1]); if (clingy) o.push(['leap', 1.5]); }
  else if (d < 270) { o.push(['charge', 3]); o.push(['sweep', 1]); o.push(['leap', 2.2]); if (canSpore) o.push(['spore', 2]); }
  else { o.push(['charge', 3]); o.push(['leap', kite ? 3 : 2]); if (canSpore) o.push(['spore', 3]); }
  if (m.kind === 'boar') {
    var ob = [];
    for (i = 0; i < o.length; i++) { if (o[i][0] === 'spore') continue; if (o[i][0] === 'leap') o[i][1] *= .35; if (o[i][0] === 'charge') o[i][1] *= 1.6; ob.push(o[i]); }
    o = ob;
  }
  if (m.kind === 'rabbit') {
    o = [];
    if (d < 135) { o.push(['kick', 2.6]); o.push(['stomp', 3]); o.push(['leap', 1.6]); if ((m.burrowCd || 0) <= 0) o.push(['burrow', 2]); }
    else if (d < 280) { o.push(['leap', 3]); o.push(['charge', 2.4]); if ((m.burrowCd || 0) <= 0) o.push(['burrow', 3.4]); }
    else { o.push(['charge', 3]); o.push(['leap', 2.4]); if ((m.burrowCd || 0) <= 0) o.push(['burrow', 4]); }
  }
  if (m.kind === 'wolf') {
    o = [];
    if (d < 135) { o.push(['rake', 3.2]); o.push(['tusk', 2.6]); o.push(['sweep', 2]); o.push(['leap', 1.2]); }
    else if (d < 280) { o.push(['leap', 3]); o.push(['tusk', 2.4]); o.push(['charge', 2.2]); o.push(['rake', 1]); }
    else { o.push(['charge', 3]); o.push(['leap', 3]); }
    if ((m.howlCd || 0) <= 0) o.push(['howl', d < 200 ? 2.2 : 2.8]);
  }
  if (m.kind === 'hive') {
    o = [];
    if (d < 140) { o.push(['rake', 3]); o.push(['sweep', 2]); o.push(['spit', 1.6]); }
    else if (d < 290) { o.push(['spit', 3]); o.push(['leap', 2.2]); o.push(['tusk', 1.8]); }
    else { o.push(['spit', 3]); o.push(['charge', 2]); o.push(['leap', 2]); }
    if ((m.sumCd || 0) <= 0 && BUGS.length <= 3) o.push(['summon', BUGS.length === 0 ? 6 : 3]);
    if (m.sov && (m.pollenCd || 0) <= 0 && d < 290) o.push(['pollen', d < 160 ? 3.6 : 2.2]);
  }
  if (m.aggro) {
    var ad = m.adapt, ai;
    if ((m.breathCd || 0) <= 0 && d > 70) o.push(['breath', (d > 220 ? 3.6 : 2.4) * (ad === 'block' || ad === 'range' ? 1.8 : 1)]);
    if ((m.novaCd || 0) <= 0 && d < 200) o.push(['nova', ad === 'melee' ? 5.5 : 2.4]);
    for (ai = 0; ai < o.length; ai++) {
      if (ad === 'range' && (o[ai][0] === 'leap' || o[ai][0] === 'charge')) o[ai][1] *= 1.7;
      if (ad === 'dodge' && (o[ai][0] === 'tusk' || o[ai][0] === 'rake')) o[ai][1] *= 1.5;
      if (ad === 'block' && o[ai][0] === 'howl') o[ai][1] *= .5;
    }
  }
  if (m.kind === 'stag') {
    if ((m.howlCd || 0) <= 0) o.push(['howl', d < 200 ? 2.6 : 2]);
    if (d < 150) o.push(['rake', 3]);
  }
  if (m.variant) {
    if (d < 250) o.push(['lash', d < 160 ? 3.4 : 2.6]);
    if ((m.ensCd || 0) <= 0 && d > 120 && d < 360) o.push(['ensnare', 2.8]);
    if ((m.sproutCd || 0) <= 0) o.push(['sprout', 2.4]);
  }
  if (m.kind === 'boar' && d < 190) o.push(['tusk', 3.4]);
  if (m.kind === 'boar' && (m.rollCd || 0) <= 0 && d < 400) o.push(['roll', d < 250 ? 3.4 : 2.6]);
  var sg = SIG[m.ail];
  if (sg && !m.cured && m.sigCd <= 0 && lvl(m.tr[SIG_PART[sg]]) < 3 && !(sg === 'shards' && d < 90) && !(sg === 'bash' && (d > 280 || d < 60))) o.push([sg, d < 135 ? 3.2 : 2.8]);
  var tot = 0, lane = rockInLane();
  for (i = 0; i < o.length; i++) {
    if (o[i][0] === m.lastAtk) o[i][1] *= .4;
    if (o[i][0] === m.lastAtk2) o[i][1] *= .7;
    if (o[i][0] === 'charge' && lane) o[i][1] *= (m.rockCd > 0 ? .15 : .6);
    tot += o[i][1];
  }
  var r = Math.random() * tot;
  for (i = 0; i < o.length; i++) { r -= o[i][1]; if (r <= 0) return o[i][0]; }
  return o[0][0];
}
function startMonsterAttack(name, quick, chain) {
  var m = M, def = ATKS[name];
  var dur = def.tele * (m.phase >= 2 ? .82 : 1) * (m.drowsyT > 0 ? 1.4 : 1) * (m.kind === 'fawn' ? 1.2 : dfv('tele')) * (m.kind === 'boar' ? .88 : (m.kind === 'rabbit' ? .8 : (m.kind === 'wolf' ? .88 : 1))) * (m.packT > 0 ? .9 : 1) * (1 - BAL.rageTele * rageN(m));
  dur *= [1, 1, .95, .9][sickStage(m)] * (m.phase === 3 ? .92 : 1) * (m.aggro ? (name === 'nova' && m.adapt === 'melee' ? .72 : .92) : 1);
  if (quick) dur = .4;
  if (chain) { dur = (m.phase >= 2 ? .5 : .58) * (m.drowsyT > 0 ? 1.4 : 1); stats.chains++; }
  m.atk = { name: name, dur: dur, rec: def.rec * (m.phase >= 2 ? .8 : 1) * (m.drowsyT > 0 ? 1.3 : 1) * (chain ? 1.9 : 1) * dfv('rec'), ang: m.face, spots: null, hit: false, chained: !!quick || !!chain, chain2: !!chain };
  m.state = 'tele'; m.atkT = 0; m.lastAtk2 = m.lastAtk; m.lastAtk = name;
  m.rollHist = m.rollHist * .5 + m.rolls; m.rolls = 0;
  if (!quick && !chain && Math.random() < .22 + dfv('extra') + (m.rollHist >= 1.5 ? .28 : 0) + (m.phase >= 2 ? .08 : 0) + (m.aggro && m.adapt === 'dodge' ? .25 : 0)) { m.atk.hold = rand(.25, .5); hintOnce('holdhint', 'บางท่ามัน "ค้าง" ก่อนปล่อย — อย่ากลิ้งเร็วเกินไป รอให้พื้นที่แดงเต็มก่อนแล้วค่อยหลบ', 5); }
  m.stam -= def.stam + lvl(m.tr.flank) * 3;
  if (name === 'kick') m.atk.ang = m.face + Math.PI;
  if (name === 'summon') { m.sumCd = m.crisis ? (m.phase >= 2 ? 6 : 8) : (m.phase >= 2 ? 7 : 9); hintOnce('summonhint', 'ราชินีกำลังเรียกฝูงแมลง! ตัวเล็กตีตายง่ายและกวาดได้หลายตัวในสวิงเดียว — แต่ตราบที่ฝูงยังอยู่ ราชินีจะได้รับการปกป้อง (ดาเมจลด) เลือกว่าจะกวาดฝูงหรือกดดันราชินี', 8); }
  if (name === 'howl') { m.howlCd = m.phase >= 2 ? 8 : 11; hintOnce('howlhint', 'มันกำลังจะคำราม! คลื่นกระแทกแผ่เป็นวงออกจากตัวมัน — กลิ้งหลบ (Space) ตอนคลื่นมาถึงตัวคุณ (Perfect Dodge ได้) · อย่าหลบเร็วเกินไป', 8); }
  if (name === 'breath') { m.breathCd = m.phase >= 2 ? 6 : 8; hintOnce('breathhint', 'มันกำลังจะพ่นไฟ! แนวไฟกวาดเป็นพัด — ยาว ~300 · ปัดป้องไม่ได้ และไฟทะลุการ์ด (ลดดาเมจเหลือ 65%) · กลิ้งออกนอกแนว หรือวิ่งอ้อมข้าง ระวังพื้นที่ไฟลุกค้างอยู่', 8); }
  if (name === 'nova') { m.novaCd = m.phase >= 2 ? 7 : 9; hintOnce('novahint', 'ระเบิดไฟรอบตัว! วงรัศมี ~170 — ปัดป้องไม่ได้ ถอยออกนอกวงหรือกลิ้งตอนไฟปะทุ แล้วเหลือกองไฟเป็นวงรอบตัวมัน', 8); }
  if (name === 'pollen') { m.pollenCd = m.phase >= 2 ? 8 : 11; hintOnce('pollenhint', 'ราชินีกำลังสะบัดละอองเกสร! วงเหลืองรอบตัวมัน — ปัดป้องไม่ได้ ถอยออกนอกวงหรือกลิ้งตอนละอองปะทุ · ถ้าโดนจะ "ตาพร่า" เห็นเส้นเตือนได้เฉพาะรอบตัว', 8); }
  if (name === 'tusk') hintOnce('tuskhint', 'Boar แทงงา: พุ่งสั้นและเร็ว — Parry ได้ (ขอบฟ้า) ถ้าปัดสำเร็จมันเสียหลักนาน', 6);
  if (name === 'lash' && xLash()) hintOnce('lashcry', 'หนวดเคลือบผลึก! แข็งเกินกว่าจะ Parry — ต้องถอยหรือกลิ้งหลบเท่านั้น (แรงกว่า 20%)', 6);
  if (name === 'lash') hintOnce('lashhint', 'หนวดปรสิตฟาดกวาดไกล! วงกว้างกว่าเขา — โดนแล้วติดเชื้อ · Parry ได้ หรือถอยออกนอกวง', 6);
  if (name === 'burrow') { m.burrowCd = m.phase >= 2 ? 7 : 10; m.atk.tx = P.x; m.atk.ty = P.y; hintOnce('burrowhint', 'กระต่ายกำลังขุดโพรง! มันจะมุดใต้ดินแล้วโผล่ตรงวงแดง — ตอนอยู่ใต้ดินโจมตีไม่เข้า กลิ้งหนีวงแดง แล้วตีตอนมันเสียท่า', 7); }
  if (name === 'ensnare' && m.variant === 1 && m.mut === 'limp' && !quick) { m.atk.dur *= .7; hintOnce('enslimp', 'ขาคลั่ง! หนวดรัดพุ่งเร็วกว่าปกติ — เตือนสั้นลง', 6); }
  if (name === 'ensnare' && m.variant === 1 && m.mut === 'crystal') hintOnce('enscry', 'หนวดรัดเคลือบผลึก — ถูกลากแล้วเสี้ยนผลึกทำให้เลือดไหล และเจ็บกว่า 30%', 6);
  if (name === 'ensnare' && m.variant === 1 && m.mut === 'sepsis') hintOnce('enssep', 'หนวดรัดติดสปอร์ — จุดที่ถูกลากมาจะมีกลุ่มสปอร์ค้างอยู่ 6 วิ', 6);
  if (name === 'ensnare') { m.ensCd = m.phase >= 2 ? 7 : 10; hintOnce('ensnarehint', 'หนวดพุ่งเป็นเส้นตรงเพื่อรัดตัวคุณแล้วลากเข้าหา! ก้าวออกข้างหรือกลิ้งหลบเลน — ปัดไม่ได้', 7); }
  if (name === 'sprout' && m.mut === 'sepsis') hintOnce('sprsep', 'หนวดงอกจากพื้นทิ้งกลุ่มสปอร์ไว้ 6 วิ — โดนแล้วติดเชื้อ ระวังพื้นที่ตีบลง', 6);
  if (name === 'sprout') {
    m.sproutCd = m.phase >= 2 ? 8 : 11; hintOnce('sprouthint', 'หนวดจะงอกขึ้นจากพื้นรอบตัวคุณ! วงม่วงคือจุดที่หนวดโผล่ — ออกจากวงตอนมันเริ่มกระพริบ', 7);
    var nsp = (m.phase >= 2 ? 5 : 4) + (vStage(m) === 3 ? 1 : 0), sps = [{ x: P.x, y: P.y }];
    for (var si = 1; si < nsp; si++) { var sa = rand(0, TAU), sd2 = rand(55, 150), sx2 = P.x + Math.cos(sa) * sd2, sy2 = P.y + Math.sin(sa) * sd2, scd = dist(sx2, sy2, CX, CY), smx = ARENA_R - 36; if (scd > smx) { sx2 = CX + (sx2 - CX) / scd * smx; sy2 = CY + (sy2 - CY) / scd * smx; } sps.push({ x: sx2, y: sy2 }); }
    m.atk.spots = sps;
  }
  if (name === 'rake') hintOnce('rakehint', 'ตะกุยเขา 2 จังหวะ! ฟาดซ้ายแล้วฟาดขวา — Parry ได้ทั้งสองครั้ง หรือหลบถอยออกนอกวง', 6);
  if (name === 'roll') { m.rollCd = m.phase >= 2 ? 6 : 9; m.atk.bounces = 0; hintOnce('rollhint', 'Boar กำลังจะกลิ้งเป็นลูกบอล! มันพุ่งชนและเด้งกลับจากขอบสนามได้ (หลบอย่างเดียว ปัดป้องไม่ได้) — ล่อให้ชนขอบ/หิน = เกราะร้าว/มึนงง แล้วตีด้านหลังตอนมันพัก', 8); }
  if (name === 'leap') { m.atk.tx = P.x; m.atk.ty = P.y; hintOnce('leaphint', 'มันกำลังจะกระโดดทับ — วงกลมแดงคือจุดลงจอด หนีออกจากวงแล้วเข้าไปโจมตีตอนมันพัก', 5); }
  if (name === 'spore') {
    m.sporeCd = 7;
    var n = (lvl(m.tr.horn) >= 2 ? 3 : 5) + (m.phase >= 2 ? 1 : 0), spots = [{ x: P.x, y: P.y }];
    for (var i = 1; i < n; i++) {
      var a = rand(0, TAU), dd = rand(60, 170), sx = P.x + Math.cos(a) * dd, sy = P.y + Math.sin(a) * dd;
      var cd = dist(sx, sy, CX, CY), mx = ARENA_R - 40;
      if (cd > mx) { sx = CX + (sx - CX) / cd * mx; sy = CY + (sy - CY) / cd * mx; }
      spots.push({ x: sx, y: sy });
    }
    m.atk.spots = spots;
  }
  if (SIG_PART[name]) {
    m.sigCd = (m.phase >= 2 ? 5 : 7.5) * (dfv('think') < 1 ? .85 : 1) * [1, 1, .8, .65][sickStage(m)] * (m.mut === 'crystal' ? .55 : 1);
    var shint = { shards: 'โคนเขาคริสตัลระเบิดเป็นเศษพุ่ง 3 ทิศ — หนีออกนอกเลนสีแดง (ท่าประจำตัวของอาการนี้ รักษาแล้วท่านี้จะหายไป)', bash: 'ขาหลังอักเสบทำให้มันพุ่งไหล่สั้น ๆ — ถ้าหลบพ้น มันจะเสียหลักนาน โอกาสโจมตีสวน!', spit: 'แผลติดเชื้อทำให้มันพ่นหนองกรด — ทิ้งแอ่งเชื้อไว้บนพื้น อย่ายืนในแอ่ง' };
    hintOnce('sig_' + name, shint[name], 6);
    if (m.narrow && !m.diagKnown) confirmDiag('เห็นท่าประจำอาการ');
  }
  if (name === 'charge') hintOnce('rockhint', 'เคล็ดลับ: ล่อให้มันพุ่งชน "หิน" — มันจะมึนงงนานและเสียหายหนัก!', 5);
}
function inLane(ox, oy, ang, len, hw, px, py, pr) {
  var dx = px - ox, dy = py - oy, al = dx * Math.cos(ang) + dy * Math.sin(ang), pe = Math.abs(-dx * Math.sin(ang) + dy * Math.cos(ang));
  return al > 0 && al < len && pe < hw + pr;
}
function beginAct() {
  var m = M, p = P, A = m.atk, mult = m.phase >= 2 ? 1.15 : 1, i;
  m.state = 'act'; m.atkT = 0;
  switch (A.name) {
    case 'charge':
      A.speed = (m.phase >= 2 ? 640 : 545) * (m.kind === 'fawn' ? .82 : (m.kind === 'boar' ? 1.1 : 1)) * (lvl(m.tr.hind) >= 3 ? .62 : 1) * (m.drowsyT > 0 ? .75 : 1);
      A.maxT = lvl(m.tr.hind) >= 3 ? .5 : .78; A.hit = false; sfx('roar'); break;
    case 'summon': {
      var nb = m.sov ? (m.phase >= 2 ? 6 : 5) : (m.crisis ? (m.phase >= 2 ? 5 : 4) : (m.phase >= 2 ? 4 : 3)), sb;
      A.maxT = .3; sfx('roar'); addShake(5); ring(m.x, m.y, m.r, m.r + 90, '#e0b030', .5, 5); ftext(m.x, m.y - m.r - 44, 'เรียกฝูง!', '#ffd45a', 18, 1.3);
      for (sb = 0; sb < nb; sb++) { var sa2 = m.face + Math.PI + (sb - (nb - 1) / 2) * .7 + rand(-.2, .2); spawnBug(m.x + Math.cos(sa2) * (m.r + 14), m.y + Math.sin(sa2) * (m.r + 14)); }
      break;
    }
    case 'howl':
      if (m.kind === 'wolf') { m.packT = 8; ftext(m.x, m.y - m.r - 44, 'หอนเรียกฝูง! เร็วขึ้น', '#c8d0ff', 16, 1.4); hintOnce('packhint', 'หมาป่าหอนเรียกฝูง — มันเร็วขึ้นและง้างท่าสั้นลง 8 วินาที รีบหลบคลื่นเสียงแล้วถอยตั้งหลัก', 7); }
      A.waveR = 30; A.hit = false; A.hit2 = false; A.maxT = m.phase >= 2 ? 1.15 : .8; sfx('roar'); addShake(6); ring(m.x, m.y, m.r, 100, '#ff9a6a', .4, 5); break;
    case 'breath':
      A.maxT = 1.05; A.tick = 0; A.hitT = 0; sfx('roar'); addShake(4); ring(m.x, m.y, m.r, m.r + 50, '#ff9a3a', .4, 5); break;
    case 'nova':
      A.maxT = .25; sfx('stomp'); addShake(9); ring(m.x, m.y, 20, 170, '#ff7a3a', .5, 7); burst(m.x, m.y, '#ff9a3a', 22, 300);
      if (dist(p.x, p.y, m.x, m.y) < 170 + p.r) hurtPlayer(17 * (m.phase >= 2 ? 1.15 : 1), m.x, m.y, { pierce: true, kb: 380, src: 'nova' });
      fireRing(m.x, m.y, m.phase >= 2 ? 8 : 6, 115, 32, 6.5); fireRing(m.x, m.y, 3, 62, 28, 5); break;
    case 'pollen': {
      A.maxT = .3; sfx('spore'); addShake(6); ring(m.x, m.y, 20, POLLEN_R, '#e8e070', .5, 6); burst(m.x, m.y, '#f0e890', 26, 280); burst(m.x, m.y, '#e8e070', 14, 150, .8);
      if (dist(p.x, p.y, m.x, m.y) < POLLEN_R + p.r) {
        var plr = hurtPlayer(13 * mult, m.x, m.y, { kb: 200, src: 'pollen' });
        if (plr === 'hit' || plr === 'blocked') { applyFx('blind', 4.5); ftext(p.x, p.y - 30, 'ละอองเกสร!', '#e8e8a0', 16, 1); }
      }
      break;
    }
    case 'tusk':
      A.speed = 1000; A.maxT = .17; A.hit = false; sfx('swing'); break;
    case 'rake':
      A.maxT = .56; A.h1 = false; A.h2 = false; A.ang1 = A.ang - .6; A.ang2 = A.ang + .6; sfx('swing');
      ring(m.x, m.y, 20, 125, '#ff8a6a', .25, 6);
      if (inWedge(m.x, m.y, A.ang1, .62, 125, p.x, p.y, 0)) hurtPlayer(17 * mult, m.x, m.y, { canParry: true, kb: 200, src: 'rake' });
      A.h1 = true; break;
    case 'roll':
      A.speed = (m.phase >= 2 ? 720 : 640); A.maxT = 1.25; A.hit = false; A.bounces = 0; sfx('roar'); break;
    case 'leap':
      A.maxT = .5; sfx('swing'); break;
    case 'burrow':
      A.maxT = 1.2; m.burrowed = true; m.invuln = true; sfx('stomp'); burst(m.x, m.y, '#7a5a3a', 16, 200); ring(m.x, m.y, 10, 44, '#7a5a3a', .4, 5); break;
    case 'bash':
      A.speed = 700; A.maxT = .3; A.hit = false; sfx('roar'); break;
    case 'shards': {
      var offs = [-.42, 0, .42], shHit = false, t;
      sfx('spore'); addShake(6);
      for (i = 0; i < 3; i++) {
        var aa = A.ang + offs[i]; if (inLane(m.x, m.y, aa, 310, 18, p.x, p.y, p.r)) shHit = true;
        for (t = 50; t <= 300; t += 50) burst(m.x + Math.cos(aa) * t, m.y + Math.sin(aa) * t, '#ff4d6a', 3, 90, .5);
        ring(m.x + Math.cos(aa) * 150, m.y + Math.sin(aa) * 150, 8, 28, '#ff7a8a', .3, 3);
      }
      if (shHit) hurtPlayer(20 * mult, m.x, m.y, { kb: 200, src: 'shards' });
      break;
    }
    case 'spit': {
      var spHit = inWedge(m.x, m.y, A.ang, .42, 230, p.x, p.y, 0);
      ring(m.x, m.y, 20, 230, '#9ad84a', .3, 6); sfx('spore');
      [90, 150, 210].forEach(function (k) { var cx = m.x + Math.cos(A.ang) * k, cy = m.y + Math.sin(A.ang) * k; clouds.push({ x: cx, y: cy, r: 40, t: 0, life: 6 }); burst(cx, cy, '#9ad84a', 8, 110, .7); });
      if (spHit) { var rs = hurtPlayer(16 * mult, m.x, m.y, { canParry: true, kb: 120, src: 'spit' }); if (rs === 'hit' || rs === 'blocked') p.infT = infDur(); }
      break;
    }
    case 'sweep':
      var swHit = inWedge(m.x, m.y, A.ang, SWEEP.half, SWEEP.R, p.x, p.y, 0);
      ring(m.x, m.y, 20, SWEEP.R, '#ff8a6a', .25, 6); sfx('swing');
      if (swHit) hurtPlayer(22 * mult, m.x, m.y, { canParry: true, kb: 200, src: 'sweep' });
      m.x += Math.cos(A.ang) * 18; m.y += Math.sin(A.ang) * 18;
      break;
    case 'stomp':
      ring(m.x, m.y, 20, STOMP_R, '#ffb86a', .4, 6); addShake(8); sfx('stomp');
      if (dist(p.x, p.y, m.x, m.y) < STOMP_R) hurtPlayer(18 * mult, m.x, m.y, { kb: 220, src: 'stomp' });
      break;
    case 'kick':
      ring(m.x, m.y, 20, KICK.R, '#ff8a6a', .25, 6); sfx('swing');
      if (inWedge(m.x, m.y, A.ang, KICK.half, KICK.R, p.x, p.y, 0)) hurtPlayer(20 * mult, m.x, m.y, { canParry: true, kb: 220, src: 'kick' });
      break;
    case 'lash':
      ring(m.x, m.y, 20, 250, '#b06ad8', .3, 7); sfx('swing'); addShake(4);
      if (inWedge(m.x, m.y, A.ang, .5, 250, p.x, p.y, 0)) { var lsr = hurtPlayer(20 * mult * (xLash() ? 1.2 : 1), m.x, m.y, { canParry: !xLash(), kb: 240, src: 'lash' }); if (lsr === 'hit' || lsr === 'blocked') { p.infT = infDur(); applyFx('sap'); ftext(p.x, p.y - 30, 'เชื้อปรสิต!', '#c8a0ff', 16, 1); } }
      A.maxT = .3; break;
    case 'ensnare': {
      var enHit = inLane(m.x, m.y, A.ang, 330, 22, p.x, p.y, p.r), et;
      sfx('spore'); addShake(4);
      for (et = 40; et <= 320; et += 40) burst(m.x + Math.cos(A.ang) * et, m.y + Math.sin(A.ang) * et, '#b06ad8', 3, 80, .5);
      if (enHit) {
        var enr = hurtPlayer(14 * mult * (m.variant === 1 && m.mut === 'crystal' ? 1.3 : 1), m.x, m.y, { kb: 0, src: 'ensnare' });
        if (enr === 'hit') { var pd0 = m.r + p.r + 12; p.x = m.x + Math.cos(A.ang) * pd0; p.y = m.y + Math.sin(A.ang) * pd0; p.stun = Math.max(p.stun, .4); p.infT = infDur(); ftext(p.x, p.y - 30, 'ถูกรัด!', '#c8a0ff', 18, 1); ring(p.x, p.y, 10, 50, '#b06ad8', .4, 4); applyFx('bind'); if (m.variant === 1 && m.mut === 'crystal') { applyFx('bleed'); ftext(p.x, p.y - 52, 'เสี้ยนผลึก!', '#e0a0ff', 15, 1); burst(p.x, p.y, '#e0a0ff', 10, 220); } if (m.variant === 1 && m.mut === 'sepsis') clouds.push({ x: p.x, y: p.y, r: 42, t: 0, life: 6 }); } else if (enr === 'blocked') p.infT = infDur();
      }
      A.maxT = .3; break;
    }
    case 'sprout':
      sfx('spore'); addShake(5);
      for (i = 0; i < A.spots.length; i++) {
        var sp9 = A.spots[i];
        ring(sp9.x, sp9.y, 8, 40, '#b06ad8', .4, 5); burst(sp9.x, sp9.y, '#8a5ac8', 10, 150, .7);
        if (m.mut === 'sepsis') clouds.push({ x: sp9.x, y: sp9.y, r: 40, t: 0, life: 6 });
        if (dist(p.x, p.y, sp9.x, sp9.y) < 40) { var spr = hurtPlayer(15 * mult, sp9.x, sp9.y, { kb: 120, src: 'sprout' }); if (spr === 'hit' || spr === 'blocked') { p.infT = infDur(); applyFx('brittle'); ftext(p.x, p.y - 30, 'เชื้อปรสิต!', '#c8a0ff', 16, 1); } }
      }
      break;
    case 'spore':
      sfx('spore');
      for (i = 0; i < A.spots.length; i++) {
        var s = A.spots[i];
        ring(s.x, s.y, 8, SPORE_R, '#b06ad8', .4); burst(s.x, s.y, '#b06ad8', 10, 120, .8);
        clouds.push({ x: s.x, y: s.y, r: SPORE_R, t: 0, life: 5 });
        if (dist(p.x, p.y, s.x, s.y) < SPORE_R) { var rr = hurtPlayer(14 * mult, s.x, s.y, { kb: 60, src: 'spore' }); if (rr === 'hit' || rr === 'blocked') p.infT = infDur(); }
      }
      break;
  }
}
