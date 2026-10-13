
/* ================= CONFIG ================= */
var CFG = { mHp: 900, pHp: 100, pSt: 100, walk: 205, stRegen: 28 };
/* v18.5 สมดุล "ของต้องอัปเกรดจริง" — ปรับตัวเลขที่นี่ที่เดียว (ทดสอบด้วย tools\balance.ps1)
   mk: ตัวคูณดาเมจ/Trauma ของชุดอาวุธ Mk.I/II/III · armorDr: คูณค่าลดดาเมจต่อชิ้นของทุกเซ็ต · armorHp: HP สูงสุดต่อชิ้น
   tier: ตัวคูณมอนสเตอร์ตามระดับเควส (hp/dmg) + Mk ขั้นต่ำที่อาวุธจะ "เจาะผิว" ได้เต็ม (mk) + เวลาก่อนเริ่มคลั่ง (grace วินาที)
   dull: ดาเมจที่เหลือต่อ 1 ขั้น Mk ที่ขาด · rage: ยิ่งสู้นาน มันยิ่งคลั่ง (ดาเมจ +dmg/ขั้น · เทเลกราฟเร็วขึ้น tele/ขั้น) */
var BAL = {
  mk: [1, 1.25, 1.55], armorDr: 2.2, armorHp: { hide: 4, crystal: 4, bristle: 6, symbiont: 5, warren: 3, alpha: 6, hive: 6 },
  tier: { 0: { hp: 1, dmg: 1, mk: 1, grace: 0 }, 1: { hp: 1, dmg: 1, mk: 1, grace: 0 }, 2: { hp: 1, dmg: 1.1, mk: 2, grace: 80 }, 3: { hp: 1.2, dmg: 1.12, mk: 3, grace: 70 }, 4: { hp: 1.25, dmg: 1.18, mk: 3, grace: 80 } },
  dull: .78, rageStep: 18, rageMax: 5, rageDmg: .08, rageTele: .04, graceDiff: [1.3, 1, .8]
};
function dullMul(m) { /* ผิวมอนสเตอร์แกร่งเกินอาวุธ: ขาด Mk 1 ขั้น = ดาเมจ ×dull */
  if (!m || m.kind === 'fawn' || PRAC || !S) return 1;
  var need = (BAL.tier[m.tier || 1] || BAL.tier[1]).mk, have = S.wk || 1;
  return have >= need ? 1 : Math.pow(BAL.dull, need - have);
}
function rageN(m) { /* ระดับความคลั่งตามเวลาที่สู้ (0..rageMax) — หายเมื่อรักษาสำเร็จ */
  if (!m || m.kind === 'fawn' || m.cured || PRAC) return 0;
  var t = BAL.tier[m.tier || 1] || BAL.tier[1]; if (!t.grace) return 0;
  var g = t.grace * BAL.graceDiff[S && S.set ? clamp(Math.round(+S.set.diff), 0, 2) : 1], over = (m.fightT || 0) - g;
  return over < 0 ? 0 : Math.min(BAL.rageMax, 1 + Math.floor(over / BAL.rageStep));
}
function tierBoost(m) { var t = BAL.tier[m.tier || 1]; if (t) { if (t.hp !== 1) m.hp = m.maxHp = Math.round(m.maxHp * t.hp); m.dmgMul *= t.dmg; } return m; }
var TAU = Math.PI * 2;
var W = 960, H = 600, CX = 480, CY = 312, ARENA_R = 268;
var ROCKS = [
  { x: CX - 128, y: CY - 84, r: 27 },
  { x: CX + 150, y: CY - 50, r: 25 },
  { x: CX - 30,  y: CY + 138, r: 29 },
  { x: CX + 135, y: CY + 120, r: 20 }
];
var STAGES = [null,
  { wind: .07, act: .10, rec: .20, dmg: 10, tr: 12, stg: 10, reach: 78,  arc: .75, lunge: 60,  cost: 7 },
  { wind: .07, act: .10, rec: .20, dmg: 11, tr: 12, stg: 10, reach: 80,  arc: .75, lunge: 60,  cost: 7 },
  { wind: .12, act: .12, rec: .38, dmg: 20, tr: 22, stg: 22, reach: 112, arc: .60, lunge: 100, cost: 10 },
  { wind: .13, act: .14, rec: .46, dmg: 26, tr: 26, stg: 40, reach: 135, arc: Math.PI, lunge: 26, cost: 14, whirl: true, gate: 2 },
  { wind: .10, act: .14, rec: .42, dmg: 34, tr: 32, stg: 34, reach: 124, arc: .95, lunge: 110, cost: 0, fin: true }
];
var WEAPONS = {
  lance: { name: 'Tether Lance', th: 'หอกสายพัน', desc: '[ง่าย ★☆☆] สมดุล รับดาเมจน้อยลง 10% บล็อกประหยัดสตามินา · คอมโบ 5 ท่า · ท่าหนัก (ค้าง K ชาร์จ) = ยิงหอกพ่วงสายพัน แทงทะลุ 2 จุด และ "ผูกสาย" 5 วิ (มันเดินช้าลง 40%) · กด K อีกครั้งขณะผูกสาย = กระชากดึงเข้ามา ขัดท่าที่กำลังง้าง', tether: true, stages: STAGES, dodge: 18, walk: 1, color: '#9fe1cb', fill: 'rgba(159,225,203,.22)', lw: 4, heavyT: 1.0, hc0: 18, hc1: 8, armor: false, tier: 1, pow: 1.1, taken: .9, blockMul: .7,
    heavy: function (n) { return { wind: .19, act: .3, rec: .5, dmg: 17 + 19 * n, tr: 15 + 14 * n, stg: 16 + 20 * n, reach: 128, arc: .5, lunge: 96, cost: 0, heavy: true, pierce: true, multi: { n: 2, gap: .15 }, n: n }; } },
  blades: { name: 'Pruning Blades', th: 'มีดตัดแต่ง', desc: '[ยาก ★★★] เปราะ (รับดาเมจ +20%, บล็อกเปลือง) ดาเมจต่อฮิตต่ำ ต้องตีรัวและหลบเก่ง · คอมโบ 6 ท่า · ตัดโดน "จุดติดเชื้อ" (หลังสแกนยืนยัน) = PRUNE ดาเมจ +40% และลดอาการป่วยลง · ท่าหนัก (K) = Slip-Cut พุ่งตัดผ่านตัวมัน มีช่วงอมตะสั้น ๆ · ตีตอนมันเซ/สตัน +20% · กลิ้งหลบเปลืองน้อย (12)', dodge: 12, walk: 1.07, color: '#b5f08a', fill: 'rgba(181,240,138,.2)', lw: 3, heavyT: .55, hc0: 12, hc1: 6, armor: false, tier: 3, pow: .95, taken: 1.2, blockMul: 1.2, dashcut: true,
    stages: [null,
      { wind: .04, act: .07, rec: .11, dmg: 6, tr: 16, stg: 5, reach: 66, arc: .95, lunge: 46, cost: 4, soft: true },
      { wind: .04, act: .07, rec: .11, dmg: 6, tr: 16, stg: 5, reach: 66, arc: .95, lunge: 46, cost: 4, soft: true },
      { wind: .04, act: .07, rec: .12, dmg: 7, tr: 16, stg: 6, reach: 68, arc: .95, lunge: 50, cost: 4, soft: true },
      { wind: .05, act: .07, rec: .13, dmg: 8, tr: 18, stg: 7, reach: 70, arc: 1.0, lunge: 52, cost: 5, soft: true },
      { wind: .07, act: .09, rec: .24, dmg: 13, tr: 22, stg: 14, reach: 76, arc: 1.1, lunge: 70, cost: 7, pr: true },
      { wind: .08, act: .12, rec: .38, dmg: 30, tr: 34, stg: 30, reach: 100, arc: 1.2, lunge: 100, cost: 0, fin: true }],
    heavy: function (n) { return null; } },
  maul: { name: 'Seed Cannon', th: 'ปืนใหญ่เมล็ด', desc: '[กลาง ★★☆] อาวุธระยะกลาง ยิงจากไกลได้ (ไกลกว่าอาวุธอื่นเกือบ 2 เท่า) ดาเมจต่อนัดต่ำกว่าอาวุธประชิด · คอมโบ 4 นัด (นัดสุดท้ายแรงสุด) · ท่าหนัก (K) = ยิงเมล็ด "พุ่มหนาม" ลงพื้น 7 วิ: มอนสเตอร์ในพุ่มเดินช้า 45% และสะสมแรงเสียหลัก ส่วนคุณในพุ่มฟื้นสตามินาเร็วขึ้น 80% (คูลดาวน์ 6 วิ) · เดินคล่อง กลิ้งหลบเปลืองน้อย (16)', dodge: 16, walk: .98, color: '#8fd18a', fill: 'rgba(143,209,138,.2)', lw: 5, heavyT: 1, hc0: 0, hc1: 0, armor: false, tier: 2, pow: .8, taken: 1, blockMul: 1.1, thicket: true,
    stages: [null,
      { wind: .12, act: .08, rec: .24, dmg: 15, tr: 14, stg: 11, reach: 190, arc: .17, lunge: 0, cost: 7, shot: true },
      { wind: .12, act: .08, rec: .24, dmg: 17, tr: 15, stg: 12, reach: 190, arc: .17, lunge: 0, cost: 7, shot: true },
      { wind: .15, act: .09, rec: .32, dmg: 26, tr: 24, stg: 22, reach: 190, arc: .21, lunge: 0, cost: 11, shot: true },
      { wind: .24, act: .10, rec: .5, dmg: 46, tr: 40, stg: 60, reach: 205, arc: .3, lunge: -40, cost: 0, fin: true, shot: true }],
    heavy: function (n) { return null; } },
  fangs: { name: 'Warren Fangs', th: 'เขี้ยวโพรง', desc: '[กลาง ★★☆] กรงเล็บคู่ของนักล่าโพรง คอมโบเร็ว พุ่งเข้าหาเป้าไกล · กลิ้งหลบเปลืองน้อย (10) · "HOP" หลังกลิ้งหลบ ท่าโจมตีถัดไปใน 0.75 วิ แรงขึ้น 30% และคืนสตามินาของท่านั้น · ท่าหนัก (ค้าง K) = พุ่งกระโจนฟัน ยิ่งชาร์จยิ่งไกลและแรง · รับดาเมจปกติ',
    stages: [null,
      { wind: .06, act: .09, rec: .15, dmg: 8, tr: 10, stg: 8, reach: 72, arc: .85, lunge: 78, cost: 5 },
      { wind: .06, act: .09, rec: .15, dmg: 8, tr: 10, stg: 8, reach: 72, arc: .85, lunge: 78, cost: 5 },
      { wind: .06, act: .09, rec: .17, dmg: 9, tr: 11, stg: 9, reach: 74, arc: .85, lunge: 84, cost: 5 },
      { wind: .07, act: .10, rec: .2, dmg: 13, tr: 18, stg: 15, reach: 82, arc: .8, lunge: 96, cost: 7 },
      { wind: .10, act: .13, rec: .4, dmg: 31, tr: 30, stg: 32, reach: 106, arc: 1.0, lunge: 150, cost: 0, fin: true }],
    heavy: function (n) { return { wind: .16, act: .22, rec: .55, dmg: 15 + 17 * n, tr: 13 + 12 * n, stg: 14 + 22 * n, reach: 112, arc: .7, lunge: 150 + 70 * n, cost: 0, heavy: true, n: n }; },
    dodge: 10, walk: 1.04, color: '#d8c8a0', fill: 'rgba(216,200,160,.22)', lw: 3, heavyT: .85, hc0: 14, hc1: 7, armor: false, tier: 2, pow: .92, taken: 1, blockMul: 1.1, hop: true }
};
var WEAPON_KEYS = ['lance', 'maul', 'blades', 'fangs'];
for (var wkk in WEAPONS) WEAPONS[wkk].id = wkk;
function eqSet(slot) { var id = S && S.eq && S.eq[slot]; return id && SETS[id] ? SETS[id] : null; }
function eqCount(id) { var n = 0; for (var i = 0; i < SLOTS.length; i++) if (S && S.eq && S.eq[SLOTS[i]] === id) n++; return n; }
function fullSet() { for (var k in SETS) if (eqCount(k) === 4) return k; return ''; }
function armSum(f) { var t = 0; for (var i = 0; i < SLOTS.length; i++) { var a = eqSet(SLOTS[i]); if (a) t += a[f]; } return t; }
function armorTaken() { return Math.max(.35, 1 - armSum('dr') - .03 * skillLv('grit')); }
function armorSt() { return armSum('st') + 4 * skillLv('stam'); }
function armorBlk() { return 1 - armSum('blk'); }
// ---- disease stages (m.sick 0..100): 1 เริ่มต้น (10+) / 2 ลุกลาม (35+) / 3 วิกฤต (70+). การรักษาลด sick ทำให้ลดขั้นได้
var SICK_NAME = ['', 'เริ่มต้น', 'ลุกลาม', 'วิกฤต'], SICK_COL = ['#888', '#d9a030', '#ff9a4a', '#ff4a4a'];
function sickStage(m) { if (!m || m.cured || m.kind === 'fawn') return 0; var s = m.sick || 0; return s >= 70 ? 3 : s >= 35 ? 2 : s >= 10 ? 1 : 0; }
function vStage(m) { return m && m.variant === 1 ? sickStage(m) : 0; }
// ---- player status effects (P.fx[key] = seconds left). infection keeps its own timer P.infT.
var STATUS = {
  bind:    { th: 'พันธนาการ', col: '#c8a0ff', dur: 3.5, desc: 'เดินช้าลง 40%' },
  sap:     { th: 'ดูดพลัง',   col: '#7fd0e8', dur: 5,   desc: 'สตามินาฟื้นช้าลงมาก (30%)' },
  brittle: { th: 'เปราะ',     col: '#ffb066', dur: 6,   desc: 'รับดาเมจเพิ่ม 20%' },
  bleed:   { th: 'เลือดไหล',  col: '#ff6a5a', dur: 6,   desc: 'เสีย HP ต่อเนื่อง 2/วิ (เขี้ยวหมาป่าและเสี้ยนผลึกทำให้เกิด)' },
  burn:    { th: 'ไฟลวก',    col: '#ff8a3a', dur: 3,   desc: 'เสีย HP ต่อเนื่อง 4/วิ จากไฟ' },
  // v17: ผูกกลไกแล้ว — ใช้โดย Hivemother Sovereign (ระดับ 4): ฝูงกัด = ชา · ละอองเกสร = ตาพร่า. (ยังเหลือ rooted: ตรึงกับที่ สั้นมาก — ยังไม่ออกแบบ)
  numb:    { th: 'ชา',        col: '#9be8c8', dur: 4,   desc: 'ท่าโจมตีและการชาร์จช้าลง 25% (ฝูงของราชินีผู้ครองรังกัดแล้วชา)' },
  blind:   { th: 'ตาพร่า',    col: '#e8e8a0', dur: 4,   desc: 'ภาพมัว มองเห็นเส้นเตือนได้เฉพาะรอบตัว (ละอองเกสรของราชินีผู้ครองรัง)' }
};
function fxOn(k) { return !!(P && P.fx && P.fx[k] > 0); }
function applyFx(k, base) {
  var d = STATUS[k]; if (!d || !P || !P.fx) return;
  var dur = (base || d.dur) * (vStage(M) === 3 ? 1.5 : 1) * (fullSet() === 'symbiont' ? .6 : 1) * (fullSet() === 'crystal' ? .5 : 1);
  if (dur <= 0) return;
  if (!(P.fx[k] > 0)) ftext(P.x + 14, P.y - 48, d.th + '!', d.col, 15, 1.1);
  P.fx[k] = Math.max(P.fx[k] || 0, dur);
}
function clearFx() { if (P && P.fx) for (var k in P.fx) P.fx[k] = 0; }
function infDur() { return fullSet() === 'crystal' ? 0 : 6 * (vStage(M) === 3 ? 1.5 : 1) * Math.max(0, 1 - armSum('inf')); }
function armorName() { var f = fullSet(); if (f) return SETS[f].name + ' ครบเซ็ต'; var n = 0; for (var i = 0; i < SLOTS.length; i++) if (eqSet(SLOTS[i])) n++; return n ? 'ชุดผสม ' + n + '/4' : 'ชุดผู้คุม'; }
function ownsWeapon(k, sv) { sv = sv || S; return k === 'lance' || !!sv.res['wp_' + k]; }

// ---- weapon trees: แต่ละอาวุธแตกเป็น 2 สาย (A/B) × 2 ขั้น (ต้องมี Mk.II / Mk.III ของโรงอาวุธ) · วัสดุมาจากสายพันธุ์ต่างกัน · ล้างสายคืนวัสดุเต็ม
var WTREE_NODES = [
  { id: 'lance_a1', w: 'lance', br: 'A', tier: 2, name: 'Ward Lance', th: 'หอกพิทักษ์', sp: 'stag', desc: 'สายคุมสนาม: ผูกสายนานขึ้น +2 วิ · รับดาเมจ −5%', cost: { antler: 6, velvet: 2, hide: 2 }, mod: { taken: .95, tetherT: 2 } },
  { id: 'lance_a2', w: 'lance', br: 'A', tier: 3, prev: 'lance_a1', name: 'Sentinel Lance', th: 'หอกผู้เฝ้ายาม', sp: 'stag', desc: 'ผูกสายนาน +6 วิ รวม · รับดาเมจ −8% · บล็อกประหยัดขึ้น', cost: { antler: 8, velvet: 3, crystal: 2 }, mod: { taken: .92, tetherT: 6, blockMul: .85 } },
  { id: 'lance_b1', w: 'lance', br: 'B', tier: 2, name: 'Gore Lance', th: 'หอกเขี้ยวพุ่ง', sp: 'boar', desc: 'สายบุก: ดาเมจ +8% · ท่าหนักแรงขึ้น +15%', cost: { tusk: 6, bristle: 2, hide: 2 }, mod: { dmg: 1.08, heavy: 1.15 } },
  { id: 'lance_b2', w: 'lance', br: 'B', tier: 3, prev: 'lance_b1', name: 'Gorebreaker Lance', th: 'หอกพิฆาตหมูป่า', sp: 'boar', desc: 'ดาเมจ +14% · ท่าหนัก +30% · แลกกับรับดาเมจ +5%', cost: { tusk: 8, bristle: 3, blood: 2 }, mod: { dmg: 1.14, heavy: 1.3, taken: 1.05 } },
  { id: 'blades_a1', w: 'blades', br: 'A', tier: 2, name: 'Swift Pruners', th: 'มีดว่องไว', sp: 'rabbit', desc: 'สายคล่องตัว: กลิ้งหลบเปลืองน้อยลง (−2) · วิ่งเร็ว +4%', cost: { fur: 6, ear: 2, hide: 1 }, mod: { dodge: -2, walk: 1.04, dmg: 1.04 } },
  { id: 'blades_a2', w: 'blades', br: 'A', tier: 3, prev: 'blades_a1', name: 'Phantom Pruners', th: 'มีดเงา', sp: 'rabbit', desc: 'กลิ้งหลบเปลือง 9 · วิ่งเร็ว +8% · ดาเมจ +8%', cost: { fur: 8, ear: 3, saliva: 2 }, mod: { dodge: -3, walk: 1.08, dmg: 1.08 } },
  { id: 'blades_b1', w: 'blades', br: 'B', tier: 2, name: 'Rot Cutters', th: 'มีดตัดเชื้อ', sp: 'stag', desc: 'สายประคองตัว: ดูดเลือด 3% ของดาเมจ · ดาเมจ +5%', cost: { antler: 6, velvet: 2, crystal: 2 }, mod: { lifesteal: .03, dmg: 1.05 } },
  { id: 'blades_b2', w: 'blades', br: 'B', tier: 3, prev: 'blades_b1', name: 'Verdant Cutters', th: 'มีดเขียวชอุ่ม', sp: 'stag', desc: 'ดูดเลือด 6% · เปราะน้อยลง (รับดาเมจ −10%)', cost: { antler: 8, velvet: 3, saliva: 2 }, mod: { lifesteal: .06, taken: .9 } },
  { id: 'maul_a1', w: 'maul', br: 'A', tier: 2, name: 'Thicket Cannon', th: 'ปืนใหญ่พุ่มหนาม', sp: 'boar', desc: 'สายคุมพื้นที่: พุ่มหนามอยู่นานขึ้น +3 วิ · เสียสมดุลสะสม +10%', cost: { tusk: 6, bristle: 2, hide: 2 }, mod: { seedT: 3, stg: 1.1 } },
  { id: 'maul_a2', w: 'maul', br: 'A', tier: 3, prev: 'maul_a1', name: 'Bramble Battery', th: 'ปืนใหญ่แนวหนาม', sp: 'boar', desc: 'พุ่มหนามนาน +6 วิ · เสียสมดุลสะสม +20%', cost: { tusk: 8, bristle: 3, crystal: 2 }, mod: { seedT: 6, stg: 1.2 } },
  { id: 'maul_b1', w: 'maul', br: 'B', tier: 2, name: 'Longshot Cannon', th: 'ปืนใหญ่ยิงไกล', sp: 'rabbit', desc: 'สายซุ่มยิง: ระยะยิง +25 · ดาเมจ +6%', cost: { fur: 6, ear: 2, hide: 2 }, mod: { reach: 25, dmg: 1.06 } },
  { id: 'maul_b2', w: 'maul', br: 'B', tier: 3, prev: 'maul_b1', name: 'Hawkeye Cannon', th: 'ปืนใหญ่ตาเหยี่ยว', sp: 'rabbit', desc: 'ระยะยิง +50 · ดาเมจ +12% · วิ่งเร็ว +3%', cost: { fur: 8, ear: 3, blood: 2 }, mod: { reach: 50, dmg: 1.12, walk: 1.03 } },
  { id: 'fangs_a1', w: 'fangs', br: 'A', tier: 2, name: 'Hunter Fangs', th: 'เขี้ยวนักล่า', sp: 'rabbit', desc: 'สายสวนกลับ: HOP แรง +45% · หน้าต่าง HOP นาน 1 วิ', cost: { fur: 6, ear: 2, hide: 2 }, mod: { hopMul: 1.45, hopWin: 1 } },
  { id: 'fangs_a2', w: 'fangs', br: 'A', tier: 3, prev: 'fangs_a1', name: 'Ambush Fangs', th: 'เขี้ยวดักซุ่ม', sp: 'rabbit', desc: 'HOP แรง +60% · หน้าต่าง HOP นาน 1.2 วิ', cost: { fur: 8, ear: 3, blood: 2 }, mod: { hopMul: 1.6, hopWin: 1.2 } },
  { id: 'fangs_b1', w: 'fangs', br: 'B', tier: 2, name: 'Briar Fangs', th: 'เขี้ยวหนาม', sp: 'boar', desc: 'สายบดขยี้: Trauma +15% · เสียสมดุลสะสม +10%', cost: { tusk: 6, bristle: 2, hide: 2 }, mod: { tr: 1.15, stg: 1.1 } },
  { id: 'fangs_b2', w: 'fangs', br: 'B', tier: 3, prev: 'fangs_b1', name: 'Thornrend Fangs', th: 'เขี้ยวฉีกหนาม', sp: 'boar', desc: 'Trauma +30% · เสียสมดุล +20% · ท่าหนัก +15%', cost: { tusk: 8, bristle: 3, saliva: 2 }, mod: { tr: 1.3, stg: 1.2, heavy: 1.15 } },
  { id: 'lance_c1', w: 'lance', br: 'C', tier: 2, name: 'Packleader Lance', th: 'หอกจ่าฝูง', sp: 'wolf', desc: 'สายนักล่าฝูง: ดาเมจ +7% · วิ่งเร็ว +4%', cost: { fang: 6, mane: 2, hide: 2 }, mod: { dmg: 1.07, walk: 1.04 } },
  { id: 'lance_c2', w: 'lance', br: 'C', tier: 3, prev: 'lance_c1', name: 'Alpha Lance', th: 'หอกจ่าฝูงอัลฟา', sp: 'wolf', desc: 'ดาเมจ +12% · วิ่งเร็ว +7% · แลกกับรับดาเมจ +5%', cost: { fang: 8, mane: 3, blood: 2 }, mod: { dmg: 1.12, walk: 1.07, taken: 1.05 } },
  { id: 'maul_c1', w: 'maul', br: 'C', tier: 2, name: 'Maw Cannon', th: 'ปืนใหญ่ขย้ำ', sp: 'wolf', desc: 'สายทำลายสมดุล: เสียสมดุลสะสม +15% · ดาเมจ +5%', cost: { fang: 6, mane: 2, hide: 2 }, mod: { stg: 1.15, dmg: 1.05 } },
  { id: 'maul_c2', w: 'maul', br: 'C', tier: 3, prev: 'maul_c1', name: 'Howler Cannon', th: 'ปืนใหญ่ผู้คำราม', sp: 'wolf', desc: 'เสียสมดุล +30% · ดาเมจ +10% · พุ่มหนามอยู่นานขึ้น +3 วิ', cost: { fang: 8, mane: 3, saliva: 2 }, mod: { stg: 1.3, dmg: 1.1, seedT: 3 } },
  { id: 'blades_c1', w: 'blades', br: 'C', tier: 2, name: 'Bloodscent Cutters', th: 'มีดตามกลิ่นเลือด', sp: 'wolf', desc: 'สายไล่ล่า: ดูดเลือด 2% · ดาเมจ +6% · วิ่งเร็ว +3%', cost: { fang: 6, mane: 2, crystal: 2 }, mod: { lifesteal: .02, dmg: 1.06, walk: 1.03 } },
  { id: 'blades_c2', w: 'blades', br: 'C', tier: 3, prev: 'blades_c1', name: 'Nightstalker Cutters', th: 'มีดนักล่ายามราตรี', sp: 'wolf', desc: 'ดูดเลือด 4% · ดาเมจ +12% · กลิ้งหลบเปลืองน้อยลง (−1)', cost: { fang: 8, mane: 3, saliva: 2 }, mod: { lifesteal: .04, dmg: 1.12, dodge: -1 } },
  { id: 'fangs_c1', w: 'fangs', br: 'C', tier: 2, name: 'Packfang', th: 'เขี้ยวฝูง', sp: 'wolf', desc: 'สายบีบเค้น: Trauma +10% · HOP แรง +25%', cost: { fang: 6, mane: 2, hide: 2 }, mod: { tr: 1.1, hopMul: 1.25 } },
  { id: 'fangs_c2', w: 'fangs', br: 'C', tier: 3, prev: 'fangs_c1', name: 'Alphafang', th: 'เขี้ยวอัลฟา', sp: 'wolf', desc: 'Trauma +20% · HOP แรง +40% · หน้าต่าง HOP นาน 1.1 วิ · ดาเมจ +6%', cost: { fang: 8, mane: 3, blood: 2 }, mod: { tr: 1.2, hopMul: 1.4, hopWin: 1.1, dmg: 1.06 } }
];
var WTREE = {}; WTREE_NODES.forEach(function (n) { (WTREE[n.w] = WTREE[n.w] || []).push(n); });
function wnodeDef(id) { for (var i = 0; i < WTREE_NODES.length; i++) if (WTREE_NODES[i].id === id) return WTREE_NODES[i]; return null; }
function wnodeOf(wk, sv) { sv = sv || S; var id = sv && sv.wt && sv.wt[wk]; var n = id ? wnodeDef(id) : null; return n && n.w === wk ? n : null; }
/* ไอคอนอาวุธ: ถ้าแตกสายแล้วใช้ภาพของ node (wup_<id>) ไม่งั้นใช้ภาพอาวุธพื้นฐาน (w_<ตระกูล>) */
function wIconKey(fam, sv) { var n = wnodeOf(fam, sv), k = n ? 'wup_' + n.id : ''; return (k && window.BH_UI && window.BH_UI[k]) ? k : 'w_' + fam; }
function wnodeCost(n) { var c = {}, x = n; while (x) { for (var k in x.cost) c[k] = (c[k] || 0) + x.cost[k]; x = x.prev ? wnodeDef(x.prev) : null; } return c; }
var WCACHE = {};
function buildWeapon(base, n) {
  var m = n.mod, w = {}, k, i;
  for (k in base) w[k] = base[k];
  w.name = n.name; w.th = n.th; w.node = n.id;
  w.stages = [null];
  for (i = 1; i < base.stages.length; i++) { var st = {}; for (k in base.stages[i]) st[k] = base.stages[i][k]; st.dmg = Math.round(st.dmg * (m.dmg || 1) * 10) / 10; st.tr = Math.round(st.tr * (m.tr || 1) * 10) / 10; st.stg = Math.round(st.stg * (m.stg || 1) * 10) / 10; if (m.reach) st.reach += m.reach; w.stages.push(st); }
  var bh = base.heavy; w.heavy = function (q) { var h = bh(q); if (!h) return h; var o = {}; for (var kk in h) o[kk] = h[kk]; o.dmg = Math.round(h.dmg * (m.dmg || 1) * (m.heavy || 1)); o.tr = Math.round(h.tr * (m.tr || 1)); o.stg = Math.round(h.stg * (m.stg || 1)); return o; };
  w.dodge = base.dodge + (m.dodge || 0); w.walk = base.walk * (m.walk || 1); w.taken = (base.taken || 1) * (m.taken || 1); w.blockMul = base.blockMul * (m.blockMul || 1);
  w.tetherT = m.tetherT || 0; w.seedT = m.seedT || 0; w.lifesteal = m.lifesteal || 0; if (m.hopMul) w.hopMul = m.hopMul; if (m.hopWin) w.hopWin = m.hopWin;
  return w;
}
function curW() { var k = (S && S.weapon) || 'lance'; if (!WEAPONS[k]) k = 'lance'; var n = wnodeOf(k); if (!n) return WEAPONS[k]; var key = k + '|' + n.id; return WCACHE[key] || (WCACHE[key] = buildWeapon(WEAPONS[k], n)); }
var ATKS = {
  charge: { tele: .85, rec: .95, stam: 14 },
  sweep:  { tele: .70, rec: .80, stam: 6 },
  stomp:  { tele: .90, rec: .90, stam: 8 },
  spore:  { tele: 1.1, rec: .95, stam: 9 },
  kick:   { tele: .45, rec: .65, stam: 4 },
  leap:   { tele: .95, rec: 1.0, stam: 10 },
  shards: { tele: .95, rec: .95, stam: 9 },
  bash:   { tele: .55, rec: .85, stam: 8 },
  spit:   { tele: .8, rec: .9, stam: 8 },
  roll:   { tele: .85, rec: 1.35, stam: 12 },
  howl:   { tele: 1.0, rec: 1.1, stam: 11 },
  tusk:   { tele: .5, rec: .8, stam: 6 },
  rake:   { tele: .55, rec: .9, stam: 8 },
  lash:   { tele: .8, rec: 1.0, stam: 10 },
  ensnare: { tele: .95, rec: 1.1, stam: 10 },
  sprout: { tele: 1.0, rec: 1.0, stam: 10 },
  burrow: { tele: .85, rec: 1.15, stam: 11 },
  summon: { tele: 1.1, rec: 1.05, stam: 10 },
  breath: { tele: .95, rec: 1.2, stam: 13 },
  nova:   { tele: .7, rec: 1.05, stam: 10 },
  pollen: { tele: .95, rec: 1.0, stam: 10 }
};
var SIG = { crystal: 'shards', limp: 'bash', sepsis: 'spit' };
var SIG_PART = { shards: 'horn', bash: 'hind', spit: 'flank' };
var SIG_NAME = { shards: 'เศษผลึกพุ่ง', bash: 'พุ่งชนไหล่', spit: 'พ่นหนองกรด' };
var LEAP_R = 85, BURROW_R = 78, POLLEN_R = 150, BLIND_R = 235;
var SWEEP = { R: 115, half: 1.0 }, STOMP_R = 105, KICK = { R: 100, half: .9 }, SPORE_R = 42;
var PART_TH = { horn: 'โคนเขา', flank: 'สีข้าง', hind: 'ขาหลัง' };
var TR_TH = [40, 85, 130, 130];

