/* ================= MONSTER ================= */
function infection() { return clamp(75 - lvl(M.tr.horn) * 22, 0, 100); }
function vitals() {
  var s = M.stress;
  return { hr: Math.round(55 + s * .9), temp: (37.2 + infection() / 55 + s * .004).toFixed(1),
    br: Math.round(16 + s * .28 + (M.state === 'exhaust' ? 8 : 0)), stress: Math.round(s), inf: Math.round(infection()) };
}
function addTrauma(part, pts) {
  if (M.ail && AIL[M.ail].part === part) pts *= 1.35;
  var old = lvl(M.tr[part]);
  M.tr[part] = Math.min(140, M.tr[part] + pts);
  var nw = lvl(M.tr[part]);
  if (nw > old) {
    var rel = part === 'horn' ? M.face : (part === 'hind' ? M.face + Math.PI : M.face + Math.PI / 2);
    ftext(M.x + Math.cos(rel) * 50, M.y + Math.sin(rel) * 50 - 20, PART_TH[part] + ' TRAUMA ' + nw, '#ffd45a', 15, 1.4);
    ring(M.x, M.y, M.r, M.r + 40, '#ffd45a', .5); sfx('break'); addShake(6);
    if (!M.wound && M.scarCd <= 0 && M.state !== 'downed') {
      M.wound = { part: part, t: 0, life: 11, side: (angDiff(Math.atan2(P.y - M.y, P.x - M.x), M.face) >= 0 ? 1 : -1) };
      ftext(M.x, M.y - M.r - 52, 'แผลเปิด! ' + PART_TH[part], '#fff2a8', 18, 1.6);
      hintOnce('wound', 'แผลเปิดที่' + PART_TH[part] + ' (วงเรืองแสง) — ชาร์จตีหนักใส่ด้านนั้น = PRECISION STRIKE ดาเมจ ×2 และทำให้มันเสียหลัก (มีเวลา ~11 วินาที, ใช้แล้วต้องรอแผลใหม่)', 7);
    }
    if (part === 'horn' && nw === 2) hintOnce('horn2', 'โคนเขาร้าวแล้ว — ตอนนี้ฉีดยารักษา (Treat) ได้เต็มประสิทธิภาพ', 4.5);
    if (part === 'horn' && nw === 3) hintOnce('horn3', 'คริสตัลแตก! มันพ่นสปอร์ไม่ได้อีก', 4);
    if (part === 'hind' && nw >= 1) hintOnce('hind1', 'ขาหลังบาดเจ็บ — มันช้าลง ถ้าถึงระดับ 3 จะพุ่งชนเต็มแรงไม่ได้', 4.5);
    if (part === 'flank' && nw >= 1) hintOnce('flank1', 'สีข้างเปิดแผล — มันเลือดไหลและเสียแรงเร็วขึ้น', 4);
  }
}
var CRIT_W = { lance: { c: 0, m: 1.5 }, blades: { c: .06, m: 1.35 }, maul: { c: -.02, m: 1.9 }, fangs: { c: .03, m: 1.6 } };
var CRIT_OFF = false;
function critInfo(m, s) {
  var wk = (S && S.weapon) || 'lance', cw = CRIT_W[wk] || { c: 0, m: 1.5 }, c = .06 + cw.c, why = [];
  if (m.state === 'stagger' || m.state === 'stun' || m.state === 'exhaust') { c += .2; why.push('มันเสียหลัก'); }
  else if (m.state === 'rec') { c += .12; why.push('จังหวะพักท่า'); }
  if (P && P.flow > 0) { c += .03 * P.flow; why.push('flow ' + P.flow); }
  if (P && P.counter > 0) { c += .15; why.push('สวนกลับ'); }
  if (s && s.heavy) { c += .05; why.push('ตีหนัก'); }
  return { p: CRIT_OFF ? 0 : clamp(c, 0, .6), m: cw.m, why: why };
}
function hitMonster(s) {
  var m = M;
  if (m.state === 'downed') return;
  if (m.invuln) { ftext(m.x, m.y - 50, 'IMMUNE', '#aaa', 14); return; }
  obsRead(dist(P.x, P.y, m.x, m.y) > 230 ? 'range' : 'melee', .5);
  var sneak = m.ambush && !m.provoked;
  m.provoked = true;
  var rel = Math.abs(angDiff(Math.atan2(P.y - m.y, P.x - m.x), m.face));
  var part = rel < .87 ? 'horn' : (rel < 2.18 ? 'flank' : 'hind');
  var helplessEarly = (m.state === 'stagger' || m.state === 'stun' || m.state === 'exhaust');
  var OPP = { horn: 'hind', hind: 'horn', flank: 'flank' };
  if (s.opp && m.lastPart) part = OPP[m.lastPart];
  m.lastPart = part;
  var WH = curW(), headF = !!(WH.headFocus && part === 'horn');
  var mult = part === 'hind' ? 1.15 : (part === 'horn' ? (headF ? 1 : .8) : 1);
  var interrupt = !!((((s.heavy || s.fin) && part === 'horn') || s.yank) && m.state === 'tele' && m.atk && !helplessEarly);
  var knock = !!(s.upswing && part === 'horn' && m.state === 'act' && m.atk && (m.atk.name === 'charge' || m.atk.name === 'bash' || m.atk.name === 'leap'));
  if (knock) mult *= 1.3;
  var armored = false, armBreak = false;
  if (m.kind === 'boar') {
    if (part === 'horn') mult = Math.max(mult, 1.15);
    if (part === 'hind') {
      if (m.armor > 0) { armored = true; mult *= .5; m.armor -= (s.stg || 10) * (s.heavy ? 1.4 : 1) + 6; if (m.armor <= 0) { m.armor = 0; armBreak = true; } }
      else mult *= 1.3;
    }
  }
  var pruned = !!(WH.dashcut && m.diagKnown && !m.cured && AIL[m.ail].part === part);
  if (pruned) { mult *= 1.4; m.sick = Math.max(0, (m.sick || 0) - 7); ftext(m.x, m.y - m.r - 44, 'PRUNE!', '#b5f08a', 22, 1); ring(m.x, m.y, m.r, m.r + 50, '#b5f08a', .35, 4); stats.prunes = (stats.prunes || 0) + 1; }
  if (s.heavy && WH.tether && !m.tether) { m.tether = 5 + (WH.tetherT || 0); ftext(m.x, m.y - m.r - 54, 'TETHERED!', '#9fe1cb', 20, 1); hintOnce('tether', 'ผูกสายแล้ว! มันเดินช้าลง — กด K อีกครั้งเพื่อกระชากมันเข้ามา (ถ้ามันกำลังง้างท่า = ขัดท่าทันที) · อย่าวิ่งห่างเกิน ~360 สายจะขาด', 8); } else if (s.heavy && WH.tether) m.tether = 5;
  if (s.opp) { ftext(m.x, m.y - m.r - 30, 'PIERCE!', '#9fe1cb', 20, .9); ring(m.x, m.y, m.r, m.r + 40, '#9fe1cb', .3, 4); }
  if (m.diagKnown && !m.cured && AIL[m.ail].part === part) mult *= (m.phase === 3 && phScan(m) ? 1.3 : 1.15);
  if (m.phase >= 2 && m.kind !== 'fawn' && phScan(m)) mult *= 1.1;
  if (m.mut === 'crystal' && part === 'horn') mult *= .7;
  if (sneak) { mult *= 1.8; m.ambush = false; ftext(m.x, m.y - m.r - 40, 'SNEAK ATTACK!', '#ff9a4a', 22, 1.3); ring(m.x, m.y, m.r, m.r + 60, '#ff9a4a', .4, 4); }
  var helpless = (m.state === 'stagger' || m.state === 'stun' || m.state === 'exhaust');
  var precise = !!(m.wound && (s.heavy || s.pr) && part === m.wound.part && !s.fin);
  if (precise) mult *= 2;
  if (s.whirl) { m.stag += 12; ftext(m.x, m.y - m.r - 24, 'WHIRL!', '#9fe8ff', 18, .9); ring(P.x, P.y, 20, s.reach, '#9fe8ff', .3, 4); addShake(7); }
  if (s.slip) { mult *= 1.25; P.flowT = Math.min(5, P.flowT + 1); ftext(m.x, m.y - m.r - 24, 'SLIP!', '#fff2a8', 18, .9); ring(m.x, m.y, m.r, m.r + 36, '#fff2a8', .3, 4); }
  if (m.state === 'exhaust') mult *= 1.25;
  if (m.kind === 'hive' && BUGS.length > 0 && !helpless) { mult *= 1 - Math.min(m.sov ? .5 : .4, BUGS.length * .08); ftext(m.x, m.y - m.r - 8, 'ฝูงปกป้อง', '#d8b030', 12, .6); hintOnce('guardhint', 'ฝูงแมลงคุ้มกันราชินีอยู่ — ดาเมจที่ใส่ราชินีลดลงตามจำนวนแมลง กวาดฝูงก่อน หรือรอจังหวะที่ราชินีเสียหลัก', 8); }
  if (WH.tier === 3 && helpless) mult *= 1.2;
  var adren = P.hp <= P.maxHp * .35 && !P.dead; if (adren) mult *= 1.15;
  if (P.infT > 0 && fullSet() === 'symbiont') mult *= 1.12;
  if (P.favor) mult *= 1.1;
  if (fullSet() === 'alpha' && m.phase >= 2) mult *= 1.08;
  if (hasSkill('edge')) mult *= 1 + .03 * skillLv('edge');
  if (P.hopT > 0 && WH.hop && !s.heavy) { mult *= (WH.hopMul || 1.3); P.hopT = 0; P.st = Math.min(P.maxSt, P.st + (s.cost || 0)); ftext(m.x, m.y - m.r - 42, 'HOP!', '#d8c8a0', 17, .8); ring(m.x, m.y, m.r, m.r + 30, '#d8c8a0', .3, 4); }
  if (m.state === 'stagger' || m.state === 'stun') mult *= 1.1;
  var fl = P.flow, counter = P.counter > 0, fin = !!s.fin;
  mult *= 1 + .12 * fl;
  if (P.streak >= 3) mult *= 1 + Math.min(.3, .03 * P.streak);
  if (counter) mult *= 1.6;
  var ci = critInfo(m, s), crit = !armored && !precise && Math.random() < ci.p;
  if (crit) { mult *= ci.m; stats.crits = (stats.crits || 0) + 1; }
  if (PRAC) { PRAC.nh = (PRAC.nh || 0) + 1; if (crit) { PRAC.nc = (PRAC.nc || 0) + 1; PRAC.flagCrit = true; } }
  var dmg = Math.max(1, Math.round(s.dmg * mult * wmul() * (WH.pow || 1) * dullMul(m)));
  if (m.state === 'retreat') m.rtDmg = (m.rtDmg || 0) + dmg;
  m.hp -= dmg; stats.hits++; if (WH.lifesteal && P.hp > 0) P.hp = Math.min(P.maxHp, P.hp + dmg * WH.lifesteal);
  var softSkip = false; if (s.soft) { P.softAlt = !P.softAlt; softSkip = P.softAlt; }
  if (!softSkip) P.streak++; P.streakT = 3.2; if (P.streak > (stats.streakMax || 0)) stats.streakMax = P.streak;
  if (P.streak === 5 || P.streak === 10 || P.streak === 15) { ftext(P.x, P.y - 40, P.streak + ' HIT!', '#ffd45a', 20, 1); if (!P.frenzy) P.st = Math.min(P.maxSt, P.st + 12); sfx('parry'); hintOnce('streak', 'ตีต่อเนื่องโดยไม่โดนโจมตี = สตรีค! ยิ่งสูงยิ่งตีแรงขึ้น (สูงสุด +30%) และได้สตามินาคืน — โดนตีแล้วสตรีคหาย', 5); }
  if (fl > 0 && !fin) { P.st = Math.min(P.maxSt, P.st + 1.5 * fl * (s.soft ? .35 : 1)); P.flowT = Math.min(5, P.flowT + (s.soft ? .4 : 1)); }
  if (counter) { screenFx(.14, '#ffd45a', .4); stats.counters++; P.counter = 0; ftext(m.x, m.y - m.r - 36, 'COUNTER!', '#ffd45a', 22, 1.1); ring(m.x, m.y, m.r, m.r + 50, '#ffd45a', .4, 4); addShake(6); }
  if (precise) {
    stats.precision = (stats.precision || 0) + 1; m.wound = null; m.scarCd = 14;
    ftext(m.x, m.y - m.r - 58, 'PRECISION STRIKE!', '#fff2a8', 26, 1.4); ring(m.x, m.y, m.r, m.r + 100, '#fff2a8', .55, 6); burst(m.x, m.y, '#fff2a8', 22, 320);
    addShake(13); hitstop = Math.max(hitstop, .15); sfx('break');
    var ra = Math.atan2(P.y - m.y, P.x - m.x); m.x -= Math.cos(ra) * 16; m.y -= Math.sin(ra) * 16;
  } else if (s.heavy) { var rb0 = Math.atan2(P.y - m.y, P.x - m.x); m.x -= Math.cos(rb0) * 6; m.y -= Math.sin(rb0) * 6; }
  if (fin) { screenFx(.26, '#ff9a4a', 1); stats.finishers++; ftext(m.x, m.y - m.r - 58, 'FINISHER!', '#ff9a4a', 26, 1.3); ring(m.x, m.y, m.r, m.r + 90, '#ff9a4a', .5, 5); addShake(10); P.flow = 0; P.flowT = 0; }
  m.stress = clamp(m.stress + dmg * .3, 0, 100);
  addTrauma(part, s.tr * wmul() * (armored ? .4 : 1));
  if (armored) { ftext(m.x, m.y - m.r - 20, 'เกราะ!', '#aab4c0', 14, .6); sfx('clang'); }
  if (!helpless && m.state !== 'roar' && m.stagCd <= 0) m.stag += (s.stg + (counter ? 30 : 0)) * (part === 'horn' ? 1.5 : 1) * (headF ? 1.3 : 1);
  var a = Math.atan2(P.y - m.y, P.x - m.x), hx = m.x + Math.cos(a) * m.r, hy = m.y + Math.sin(a) * m.r;
  var col = part === 'horn' ? '#ffd45a' : (part === 'hind' ? '#ff9a4a' : '#ffffff');
  burst(hx, hy, '#b06ad8', s.heavy ? 16 : 9, s.heavy ? 260 : 190); decal(hx, hy, 'rgba(150,90,200,.55)');
  if (crit) {
    ftext(hx, hy - 14, dmg + '!', '#66e0ff', s.heavy ? 30 : 24, 1.1); ftext(hx, hy - 40, 'CRIT!', '#ffffff', 18, .9); ring(hx, hy, 6, 44, '#66e0ff', .3, 3); burst(hx, hy, '#66e0ff', 10, 240); sfx('parry'); addShake(4);
    if (!m.invuln) m.stag += 5; hintOnce('crithint', 'คริติคอล! ดาเมจ ×1.4–1.9 (ตามอาวุธ) — โอกาสสูงขึ้นเมื่อมันเสียหลัก/พักท่า, มี flow สูง, ตีหนัก หรือสวนกลับหลังปัดป้อง', 8);
  } else ftext(hx, hy - 14, String(dmg), col, s.heavy ? 24 : 17, .9);
  hitstop = Math.max(hitstop, s.heavy ? .09 : (s.soft ? .02 : .045)); addShake(s.heavy ? 9 : (s.soft ? 2 : 4));
  chainHit(hx, hy); sfxPm = 1 + Math.min(hitChain, 15) * .035; sfx(s.heavy ? 'heavy' : 'hit'); sfxPm = 1; if (!armored) sfx('flesh');
  { var sna = Math.atan2(m.y - P.y, m.x - P.x), sn, snN = s.heavy ? 3 : (s.soft ? 1 : 2); for (sn = 0; sn < snN; sn++) slash(hx, hy, sna + rand(-.7, .7), (s.heavy ? 72 : 48) + rand(0, 14), crit ? '#66e0ff' : (armored ? '#d8e4f0' : '#ffffff'), s.heavy ? 4 : 3); if (s.heavy) screenFx(.07, '#ffd9a0', .3); }
  if (s.slam) { ring(P.x, P.y, 20, s.reach, '#ffb066', .35, 5); burst(P.x + Math.cos(P.face) * 40, P.y + Math.sin(P.face) * 40, '#8a7a58', 10, 200); addShake(11); }
  m.hitFlash = .08;
  { var kj = s.heavy ? 11 : (s.soft ? 2.5 : 6), kaa = Math.atan2(m.y - P.y, m.x - P.x); m.kx = Math.cos(kaa) * kj; m.ky = Math.sin(kaa) * kj;
    var sx0 = m.x - Math.cos(kaa) * m.r, sy0 = m.y - Math.sin(kaa) * m.r; burst(sx0, sy0, WH.color, s.heavy ? 10 : 5, s.heavy ? 340 : 240); if (s.heavy || fin) slowT = Math.max(slowT, fin ? .35 : .18); }
  var dizzyNow = false;
  if (headF && !helpless && m.state !== 'roar' && (m.dizzyCd || 0) <= 0) {
    m.dizzy = (m.dizzy || 0) + s.stg * .8 * (s.heavy ? 1.2 : 1);
    if (m.dizzy >= 100) { dizzyNow = true; m.dizzy = 0; m.dizzyCd = 6; }
  }
  if (m.hp <= 0) { monsterDowned(); return; }
  if (checkPhase(m)) { /* phase change handled */ }
  else if (armBreak) {
    startStagger(1.6, false); screenFx(.28, '#9fe8ff', .8); ftext(m.x, m.y - m.r - 62, 'ARMOR BREAK!', '#9fe8ff', 26, 1.4); ring(m.x, m.y, m.r, m.r + 100, '#9fe8ff', .5, 6); burst(m.x, m.y, '#aab4c0', 22, 320); slowT = Math.max(slowT, .35); addShake(13); hitstop = Math.max(hitstop, .14); sfx('break');
    hintOnce('armbreak', 'เกราะหลังแตกแล้ว! ตอนนี้โจมตีด้านหลังได้ดาเมจ +30%', 5);
  }
  else if (interrupt) {
    startStagger(1.0, false); P.flowT = Math.min(5, P.flowT + 1.5); P.st = Math.min(P.maxSt, P.st + 10); slowT = Math.max(slowT, .25);
    screenFx(.18, '#ff9a4a', .5); ftext(m.x, m.y - m.r - 62, 'INTERRUPT!', '#ff9a4a', 24, 1.3); ring(m.x, m.y, m.r, m.r + 80, '#ff9a4a', .45, 5); addShake(10); hitstop = Math.max(hitstop, .12); sfx('break');
    stats.interrupts = (stats.interrupts || 0) + 1; hintOnce('interrupt', 'INTERRUPT! ท่าหนัก/Finisher ใส่หัวตอนมันกำลังง้างท่า = ขัดท่าให้มันเซ (เสี่ยงแต่คุ้ม)', 6);
  }
  else if (knock) {
    m.state = 'stun'; m.stT = 0; m.stDur = 3; m.atk = null; m.stag = 0; m.dizzy = 0;
    ftext(m.x, m.y - m.r - 62, 'ล้ม! KNOCKDOWN', '#ffb066', 26, 1.5); ring(m.x, m.y, m.r, m.r + 110, '#ffb066', .55, 6); burst(m.x, m.y, '#ffb066', 24, 340);
    slowT = Math.max(slowT, .4); addShake(15); hitstop = Math.max(hitstop, .16); screenFx(.3, '#ffffff', .9); sfx('break'); stats.knocks = (stats.knocks || 0) + 1;
  }
  else if (dizzyNow) {
    m.state = 'stun'; m.stT = 0; m.stDur = 2.4; m.atk = null; m.stag = 0;
    ftext(m.x, m.y - m.r - 62, 'DIZZY! มึนหัว', '#ffd45a', 24, 1.4); ring(m.x, m.y, m.r, m.r + 90, '#ffd45a', .5, 5); addShake(10); hitstop = Math.max(hitstop, .12); sfx('break');
  }
  else if (precise && !helpless && m.state !== 'roar') startStagger(1.7, false);
  else if (m.stag >= m.stagNeed && !helpless && m.state !== 'roar') startStagger(1.4, true);
}
function startStagger(dur, fromMeter) {
  var m = M;
  m.state = 'stagger'; m.stT = 0; m.stDur = dur; m.atk = null; m.stag = 0;
  if (fromMeter) m.stagNeed += 45;
  ring(m.x, m.y, m.r, m.r + 30, '#c79cff', .5); addShake(5);
  hintOnce('stagger', 'มันเซแล้ว! โจมตีเต็มที่!', 3);
}
// ---- 3 เฟส: 1 (100–66%) / 2 คลุ้มคลั่ง (≤66%) / 3 วิกฤต (≤33%). ทุกเฟสต้องสแกนใหม่ (Q) เพื่อ "ล็อกเป้า"
var PH_HP = [0, 1, .66, .33];
function checkPhase(m) {
  if (m.kind === 'fawn' || m.hp <= 0 || m.phase >= 3) return false;
  if (m.hp <= m.maxHp * PH_HP[m.phase + 1]) { startPhase(m.phase + 1); return true; }
  return false;
}
function phScan(m) { return !!(m && (m.scanPh || (m.phase === 1 && m.diagKnown) || m.kind === 'fawn')); }
function startPhase(n) {
  var m = M;
  m.phase = n; m.state = 'roar'; m.stT = 0; m.stDur = n === 3 ? 2 : 1.7; m.invuln = true; m.atk = null;
  m.scanPh = false; scanRec = null;
  if (n === 2 && !m.cured && m.kind !== 'fawn' && (m.crisis || Math.random() < .35 + .65 * (m.sick / 100))) {
    m.mut = m.ail;
    var MN = { crystal: 'คริสตัลงอกคลุมหัว — ตีหัวได้ผลน้อยลง เศษผลึกถี่ขึ้น', limp: 'กล้ามเนื้อขาคลั่ง — เร็วขึ้นและต่อท่าไวขึ้น', sepsis: 'ละอองสปอร์ฟุ้งรอบตัว — ปล่อยกลุ่มสปอร์ต่อเนื่อง' };
    ftext(m.x, m.y - m.r - 70, 'MUTATION!', '#ff5ad0', 28, 2); ring(m.x, m.y, m.r, m.r + 160, '#ff5ad0', .8, 7);
    showHint('กลายพันธุ์! ' + MN[m.ail] + ' · ยังรักษาได้ — ยิงยาตรงอาการให้ครบเพื่อยกเลิกการกลายพันธุ์', 8);
  }
  if (n === 3 && !m.cured) m.sick = Math.min(100, (m.sick || 0) + 15);
  m.stress = clamp(m.stress + (n === 3 ? 20 : 25), 0, 100);
  ring(m.x, m.y, m.r, 220, n === 3 ? '#ff2a2a' : '#ff5a4a', .8, 5); addShake(n === 3 ? 16 : 12); hitstop = Math.max(hitstop, .15); sfx('roar');
  if (n === 3) ring(m.x, m.y, m.r + 40, 300, '#ff9a4a', .9, 4);
  if (m.sov && n >= 2) { /* ราชินีผู้ครองรัง: ตื่นเรียกฝูงรอบใหม่ทุกครั้งที่เข้าเฟสใหม่ */
    for (var swi = 0, swn = n === 3 ? 4 : 3; swi < swn; swi++) { var swa = m.face + TAU * swi / swn + .5; spawnBug(m.x + Math.cos(swa) * (m.r + 22), m.y + Math.sin(swa) * (m.r + 22)); }
    ftext(m.x, m.y - m.r - 92, 'ฝูงตื่นรับเสียงเรียก!', '#ffd45a', 18, 1.6);
  }
  showHint(n === 3 ? 'PHASE 3 — ระยะวิกฤต! แรงขึ้น เร็วขึ้น อาการหนักขึ้น · สแกน (Q) ใหม่เพื่อล็อกเป้า — ข้อมูลเก่าใช้ไม่ได้แล้ว' : 'PHASE 2 — มันคลุ้มคลั่ง! ท่าโจมตีเร็วขึ้นและต่อเนื่องขึ้น · สแกน (Q) ใหม่เพื่อล็อกเป้า — ข้อมูลเก่าใช้ไม่ได้แล้ว', 6);
}
function toExhaust() {
  var m = M;
  m.state = 'exhaust'; m.stT = 0; m.stDur = 3; m.atk = null; m.exhaustedOnce = true;
  hintOnce('exh', 'มันหมดแรง! ได้รับดาเมจเพิ่ม 25% — โจมตีเลย', 3.5);
}
function toRetreat() {
  var m = M; m.retr = m.retr || {}; m.retr[m.phase] = true;
  var ang = Math.atan2(m.y - P.y, m.x - P.x), tx = CX + Math.cos(Math.atan2(CY - P.y, CX - P.x)) * ARENA_R * .6, ty = CY + Math.sin(Math.atan2(CY - P.y, CX - P.x)) * ARENA_R * .6;
  m.state = 'retreat'; m.stT = 0; m.atk = null; m.rtDur = m.phase === 3 ? 9 : 11; m.rtDmg = 0; m.rtTx = tx; m.rtTy = ty; m.rtSet = false; m.rtNear = 0;
  m.stam = Math.min(100, m.stam + 30);
  ftext(m.x, m.y - m.r - 50, 'มันถอยหนี!', '#9fe8ff', 22, 1.6);
  showHint('มันถอยหนี! สแกน (Q) + ฉีดยาได้เต็มผล — อย่าเข้าใกล้หรือตีแรง ไม่งั้นมันกลับมาสู้', 8);
}
function endRetreat(why) {
  var m = M; m.rtDur = 0;
  m.enrageT = why === 'back' ? 0 : 6;
  ftext(m.x, m.y - m.r - 50, why === 'back' ? 'มันกลับมาแล้ว!' : 'มันโมโห!', '#ff7a5a', 20, 1.2); ring(m.x, m.y, m.r, m.r + 70, '#ff7a5a', .5, 4); sfx('roar');
  toStalk();
}
function toStalk() {
  M.state = 'stalk'; M.stT = 0; M.atk = null; M.thinkT = rand(.4, .9) * dfv('think') / (M.phase >= 2 ? 1.4 : 1) * (M.mut === 'limp' ? .8 : 1) * (M.enrageT > 0 ? .75 : 1);
}
function monsterDowned() {
  var m = M;
  m.hp = 0; m.state = 'downed'; m.stT = 0; m.atk = null; m.downStress = m.stress; m.invuln = false;
  if (m.kind === 'hive') clearBugs();
  slowT = 1.2; hitstop = .25; addShake(12); screenFx(.5, '#ffffff', 1.3); pendingDecision = 1.8;
  ring(m.x, m.y, m.r, 160, '#ffffff', .8, 4); sfx('roar');
  showHint('มอนสเตอร์ล้มลงแล้ว...', 3);
}
