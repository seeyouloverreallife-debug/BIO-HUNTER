/* ================= SAVE / PROGRESSION ================= */
var MATS = { blood: 'เลือดสด', saliva: 'น้ำลาย', crystal: 'ผลึก Bloomrot', hide: 'หนังกวาง', antler: 'เขากวาง', velvet: 'กำมะหยี่เขากวาง', tusk: 'เขี้ยวหมูป่า', bristle: 'ขนหนามหมูป่า', fur: 'ขนกระต่าย', ear: 'หูกระต่าย', fang: 'เขี้ยวหมาป่า', mane: 'แผงคอหมาป่า', chitin: 'เปลือกไคตินราชินี', jelly: 'เยลลี่หลวง', coin: 'เหรียญ' , moss: 'มอสน้ำค้าง', bark: 'เปลือกวิลโลว์', sage: 'ใบเสจป่า', poppy: 'ดอกป๊อปปี้ง่วง' };
var MAT_KEYS = ['blood', 'saliva', 'crystal', 'hide', 'antler', 'velvet', 'tusk', 'bristle', 'fur', 'ear', 'fang', 'mane', 'chitin', 'jelly', 'moss', 'bark', 'sage', 'poppy', 'coin'];
// วัสดุเฉพาะสายพันธุ์: ทั่วไป (ดรอปเกือบทุกครั้ง) + หายาก (ต้องทำโคนเขา/โคนหูร้าว ระดับ 2+ หรือเป็นตัวแปรรุนแรง)
var SP_MATS = { stag: { common: 'antler', rare: 'velvet' }, boar: { common: 'tusk', rare: 'bristle' }, rabbit: { common: 'fur', rare: 'ear' }, wolf: { common: 'fang', rare: 'mane' }, hive: { common: 'chitin', rare: 'jelly' } };
var BOSS_KINDS = { wolf: 1, hive: 1 };
function isBoss(k) { return !!BOSS_KINDS[k]; }
var SP_COMMON = { capture_ok: 1, treat_full: 1, eliminate: 1, capture_under: 1, treat_part: 1, treat_wrong: 1, capture_over: 1, defeat: 0 };
// ดรอปเฉพาะสายพันธุ์: ท่อนตัว (carve) +1 ทุกครั้ง · ส่วนที่ทำร้ายจนร้าว (ระดับ 2+): สีข้าง/ขาหลัง +1 ทั่วไป, โคนเขา/หู = ของหายาก · เกรด A/S +1 · ตัวแปรรุนแรง/วิกฤต ได้หายากเพิ่ม · กันดวงซวย: carve พิเศษทุก 3 ครั้ง, หายากการันตีทุก 3 ครั้งที่ไม่ได้
// ---- ระบบภารกิจ: ระดับ 1 / 2 / 3 / Extra
var QUESTS = [
  { id: 'q1_stag', tier: 1, name: 'First Bloom', kind: 'stag', req: {}, info: 'กวางติดเชื้อบุกพืชผล — วินิจฉัย แล้วเลือก จับ / รักษา / กำจัด' },
  { id: 'q1_boar', tier: 1, name: 'Thornback', kind: 'boar', req: { wins: 1 }, info: 'หมูป่าเกราะหนา พุ่งชนต่อเนื่อง — ทุบเกราะแล้วตีหัว' },
  { id: 'q2_stag', tier: 2, key: true, name: 'Tendril Stag', kind: 'stag', req: { clear: 'q1_stag', rank: 1 }, info: 'ระดับรุนแรง: ปรสิตหนวดงอกจากตัว · HP ×1.6 · ดาเมจ +12% · ท่าหนวด 3 ท่า · รางวัล ×1.5 · XP ×1.3' },
  { id: 'q2_boar', tier: 2, name: 'Spore-Mantled Boar', kind: 'boar', req: { clear: 'q1_boar', rank: 1 }, info: 'ระดับรุนแรง: ปรสิตหนวดงอกจากตัว · HP ×1.6 · ดาเมจ +12% · ท่าหนวด 3 ท่า · รางวัล ×1.5 · XP ×1.3' },
  { id: 'q3_stag', tier: 3, key: true, name: 'Crisis: Tendril Stag', kind: 'stag', crisis: true, req: { clear: 'q2_stag', rank: 2 }, info: 'วิกฤต: เริ่มด้วยอาการลุกลามแล้ว (ป่วย 45) · ต้องกลายพันธุ์แน่นอนในเฟส 2 · รางวัล ×2 + ผลึก 2 · XP ×1.7' },
  { id: 'q3_boar', tier: 3, name: 'Crisis: Spore-Mantled Boar', kind: 'boar', crisis: true, req: { clear: 'q2_boar', rank: 2 }, info: 'วิกฤต: เริ่มด้วยอาการลุกลามแล้ว (ป่วย 45) · ต้องกลายพันธุ์แน่นอนในเฟส 2 · รางวัล ×2 + ผลึก 2 · XP ×1.7' },
  { id: 'q1_rabbit', tier: 1, name: 'Bramble Hare', kind: 'rabbit', req: { wins: 2 }, info: 'กระต่ายพุ่มหนามตัวเล็กแต่ว่องไว — ขุดโพรงหนีใต้ดินแล้วโผล่ใต้เท้า · ตัวเปราะ HP ต่ำ หลังโผล่พ้นดินคือจังหวะโจมตี' },
  { id: 'q2_rabbit', tier: 2, name: 'Tendril Hare', kind: 'rabbit', req: { clear: 'q1_rabbit', rank: 1 }, info: 'ระดับรุนแรง: ปรสิตหนวดงอกจากตัว · HP ×1.6 · ดาเมจ +12% · ท่าหนวด 3 ท่า · รางวัล ×1.5 · XP ×1.3' },
  { id: 'q3_rabbit', tier: 3, name: 'Crisis: Tendril Hare', kind: 'rabbit', crisis: true, req: { clear: 'q2_rabbit', rank: 2 }, info: 'วิกฤต: เริ่มด้วยอาการลุกลามแล้ว (ป่วย 45) · ต้องกลายพันธุ์แน่นอนในเฟส 2 · รางวัล ×2 + ผลึก 2 · XP ×1.7' },
  { id: 'q2_wolf', tier: 2, name: 'Ashfang Wolf', kind: 'wolf', req: { clear: 'q2_stag', clear2: 'q2_boar', rank: 1 }, info: 'ผู้ล่าสูงสุดของป่า — ปรากฏเฉพาะระดับ 2 ขึ้นไป · แกร่งกว่าตัวอื่นทุกด้าน: HP สูง เร็ว เขี้ยวคมทำให้เลือดไหล · หอนเรียกฝูงเร่งความเร็ว · ปรสิตหนวดงอกจากตัว · รางวัล ×1.5 · XP ×1.3' },
  { id: 'q3_wolf', tier: 3, name: 'Crisis: Ashfang Alpha', kind: 'wolf', crisis: true, req: { clear: 'q2_wolf', rank: 2 }, info: 'วิกฤต: จ่าฝูงที่ติดเชื้อลุกลามแล้ว (ป่วย 45) · ต้องกลายพันธุ์แน่นอนในเฟส 2 · รางวัล ×2 + ผลึกพิเศษ · XP ×1.7' },
  { id: 'q4_aggro', tier: 4, name: 'Cinderfang: Aggro Wolf', kind: 'wolf', crisis: true, aggro: true, req: { clear: 'q3_wolf', rank: 4 }, info: 'ระดับ 4 ★★★★ — Aggro Wolf พันธุ์ก้าวร้าวที่เก่งที่สุดตอนนี้: อ่านท่าทางของคุณแล้วปรับตัว (กลิ้งเยอะ/กันเยอะ/ตีประชิด/ยืนยิงไกล) · พ่นไฟเป็นแนวและระเบิดไฟรอบตัว · พื้นสนามและป่าที่มันเหยียบมีไฟลุก · เริ่มด้วยอาการลุกลามและกลายพันธุ์แน่นอน' },
  { id: 'q4_sov', tier: 4, name: 'Hivemother Sovereign', kind: 'hive', crisis: true, sov: true, req: { clear: 'q3_hive', rank: 5 }, info: 'ระดับ 4 ★★★★ — ราชินีผู้ครองรัง: ฝูงใหญ่กว่าเดิมและกัดแล้ว "ชา" (ท่าโจมตี/ชาร์จช้าลง 25%) · ระเบิดละอองเกสรรอบตัวทำให้ "ตาพร่า" เห็นเส้นเตือนได้เฉพาะรอบตัว · ฝูงคุ้มกันราชินีหนักขึ้น (ลดดาเมจสูงสุด 50%) · ตื่นเรียกฝูงเพิ่มทุกครั้งที่เข้าเฟสใหม่ · เริ่มด้วยอาการลุกลามและกลายพันธุ์แน่นอน' },
  { id: 'q2_hive', tier: 2, name: 'Hivemother Queen', kind: 'hive', req: { clear: 'q2_wolf', rank: 2 }, info: 'ราชินีรังแมลงติดเชื้อ — เรียก "ฝูงแมลงลูกน้อง" ออกมาช่วยสู้ · ตราบที่ฝูงยังอยู่ราชินีจะได้รับการปกป้อง (ดาเมจที่ได้ลดลงถึง 40%) · เลือกเอาว่าจะกวาดฝูงก่อนหรือกดดันราชินี · ตีฝูงได้หลายตัวพร้อมกัน · รางวัล ×1.5 · XP ×1.3' },
  { id: 'q3_hive', tier: 3, name: 'Crisis: Hivemother Swarm', kind: 'hive', crisis: true, req: { clear: 'q2_hive', rank: 2 }, info: 'วิกฤต: ราชินีรังที่ติดเชื้อลุกลามแล้ว (ป่วย 45) · HP สูงขึ้น เรียกฝูงถี่และมากขึ้น · รางวัล ×2 + เยลลี่หลวงมีโอกาสสูง · XP ×1.7' },
  { id: 'ex_alpha', tier: 'E', name: 'Silent Hunt', kind: 'wolf', crisis: true, goal: 'taken', req: { clear: 'q3_wolf' }, info: 'EXTRA — เงื่อนไขพิเศษ: ถูกโจมตีไม่เกิน 8 ครั้ง และจบเคสสำเร็จ · ความยากเท่าระดับ 3' },
  { id: 'ex_gentle', tier: 'E', name: 'Gentle Hand', kind: 'stag', crisis: true, goal: 'heal', req: { clear: 'q3_stag' }, info: 'EXTRA — เงื่อนไขพิเศษ: ต้องจบด้วย "รักษาในสนามสำเร็จ" · ความยากเท่าระดับ 3' },
  { id: 'ex_light', tier: 'E', name: 'Light Step', kind: 'boar', crisis: true, goal: 'taken', req: { clear: 'q3_boar' }, info: 'EXTRA — เงื่อนไขพิเศษ: ถูกโจมตีไม่เกิน 8 ครั้ง และจบเคสสำเร็จ · ความยากเท่าระดับ 3' },
  { id: 'ex_swift', tier: 'E', name: 'Quick Paws', kind: 'rabbit', crisis: true, goal: 'fast', req: { clear: 'q3_rabbit' }, info: 'EXTRA — เงื่อนไขพิเศษ: จบเคสสำเร็จภายใน 100 วินาที · ความยากเท่าระดับ 3' },
  { id: 'ex_lock', tier: 'E', name: 'Total Lock', kind: 'stag', crisis: true, goal: 'scan', req: { clear: 'q3_stag', clear2: 'q3_boar' }, info: 'EXTRA — เงื่อนไขพิเศษ: สแกนล็อกเป้าครบทั้งเฟส 2 และเฟส 3 แล้วจบเคสสำเร็จ · ความยากเท่าระดับ 3' }
];
var KEY_Q = { 2: 'q2_stag', 3: 'q3_stag' };
var QTIER_NAME = { 1: 'ระดับ 1', 2: 'ระดับ 2', 3: 'ระดับ 3', 4: 'ระดับ 4 ★★★★', E: 'EXTRA' };
function qDef(id) { for (var i = 0; i < QUESTS.length; i++) if (QUESTS[i].id === id) return QUESTS[i]; return null; }
function qCleared(id) {
  if (!S) return false;
  if ((S.qclear && S.qclear[id]) > 0) return true;
  return (id === 'q1_stag' && S.cleared && S.cleared.stag >= 1) || (id === 'q1_boar' && S.cleared && S.cleared.boar >= 1) || (id === 'q1_rabbit' && S.cleared && S.cleared.rabbit >= 1);
}
function qReqText(q) {
  var r = q.req, a = [];
  if (r.wins) a.push('จบเคสสำเร็จ ' + r.wins + ' ครั้ง');
  if (r.clear) a.push('ผ่าน ' + qDef(r.clear).name);
  if (r.clear2) a.push('ผ่าน ' + qDef(r.clear2).name);
  if (r.rank) a.push('ยศ ' + RANK_NAME[r.rank]);
  if (KEY_Q[q.tier] && q.id !== KEY_Q[q.tier]) a.push('ผ่านเควสเลื่อนขั้น ' + qDef(KEY_Q[q.tier]).name);
  return a.join(' + ');
}
function keyDone(t) {
  if (!KEY_Q[t]) return true; if (qCleared(KEY_Q[t])) return true;
  for (var i = 0; i < QUESTS.length; i++) if (QUESTS[i].tier === t && qCleared(QUESTS[i].id)) return true;
  return false;
}
function qUnlocked(q) {
  var r = q.req;
  if (KEY_Q[q.tier] && q.id !== KEY_Q[q.tier] && !keyDone(q.tier)) return false;
  if (r.wins && S.wins < r.wins) return false;
  if (r.clear && !qCleared(r.clear)) return false;
  if (r.clear2 && !qCleared(r.clear2)) return false;
  if (r.rank && rankIdx() < r.rank) return false;
  return true;
}
function curQuest() { var q = S && S.quest ? qDef(S.quest) : null; return q && qUnlocked(q) ? q : null; }
function curQuestId() { var q = curQuest(); return q ? q.id : ''; }
// ยศ 8 ขั้น: ขึ้นยศได้ต่อเมื่อ (1) ผ่านเควสสอบเลื่อนยศของขั้นนั้น และ (2) XP ถึงเกณฑ์ — ต้องผ่านครบทุกขั้นก่อนหน้า
var RANK_XP = [0, 100, 300, 600, 1000, 1500, 2100, 3000];
var RANK_NAME = ['Seedling Warden', 'Grove Warden', 'Moss Keeper', 'Root Keeper', 'Elder Keeper', 'Ancient Warden', 'Grove Marshal', 'Primeval Warden'];
var RANK_EXAM = [null, 'q1_boar', 'q2_stag', 'q3_stag', 'q3_wolf', 'q4_aggro', 'q3_hive', 'ex_lock'];
function rankSkillPts(r) { return r <= 4 ? r * 2 : 8 + (r - 4); }
var SAVE_KEY = 'bio-hunter-warden-v3';
var CAT = {
  scanner2: { tab: 'lab',  name: 'Scanner Mk.II', desc: 'ล็อกสัญญาณชีพเร็วขึ้น และแสดงท่าที่มอนสเตอร์กำลังเตรียมโจมตี', cost: { blood: 2, saliva: 1 } },
  notes:    { tab: 'lab',  name: 'Field Notes', desc: 'ตอนสแกน เห็นแต้ม Trauma ของแต่ละจุดว่าใกล้ระดับถัดไปแค่ไหน', cost: { saliva: 2 } },
  antidote: { tab: 'lab',  name: 'ยาสมานแผลเข้มข้น', desc: 'ยาสมานแผลฟื้น HP 50 (เดิม 35)', cost: { saliva: 2, crystal: 1 } },
  dartcase: { tab: 'shop', name: 'กล่องยาสลบขยาย', desc: 'พกลูกดอกยาสลบได้ 7 นัด (เดิม 5)', cost: { blood: 2, hide: 1 } },
  plot4:    { tab: 'garden', name: 'แปลงเพาะปลูกที่ 4', desc: 'เพิ่มแปลงปลูกสมุนไพรอีกหนึ่งแปลง', cost: { hide: 2, blood: 1 } },
  satchel:  { tab: 'shop', name: 'กระเป๋าสมุนไพร', desc: 'พกยาสมานแผลได้ 6 หลอด (เดิม 5)', cost: { hide: 2 } },
  lance2:   { tab: 'forge', name: 'ชุดอาวุธ Mk.II', desc: 'ดาเมจและแต้ม Trauma +25% (ทุกอาวุธ) · มอนสเตอร์ระดับ 2 ขึ้นไปต้องมี Mk.II จึงเจาะผิวได้เต็ม', cost: { hide: 1, blood: 2 }, wk: 2 },
  lance3:   { tab: 'forge', name: 'ชุดอาวุธ Mk.III', desc: 'ดาเมจและแต้ม Trauma +55% (รวม ทุกอาวุธ) · ระดับ 3–4 ต้องมี Mk.III จึงเจาะผิวได้เต็ม', cost: { crystal: 2, saliva: 2 }, wk: 3, req: 'lance2' }
};
var SK_BRANCH = { warden: { name: 'นักสู้ภาคสนาม', d: 'ร่างกายและการต่อสู้' }, medic: { name: 'หมอสัตว์ป่า', d: 'รักษา คอกฟื้นฟู ยา' }, handler: { name: 'ผู้คุมป่า', d: 'จับ ความไว้ใจ ป่า รางวัล' } };
var SK_BRANCH_KEYS = ['warden', 'medic', 'handler'];
var SK_TIER2 = 3;
var SKILLS = {
  vigor:  { br: 'warden', tier: 1, max: 3, cost: 1, name: 'Hardy Frame', desc: 'HP สูงสุด +5 ต่อเลเวล' },
  stam:   { br: 'warden', tier: 1, max: 3, cost: 1, name: 'Endurance', desc: 'สตามินาสูงสุด +4 ต่อเลเวล' },
  wind:   { br: 'warden', tier: 1, max: 1, cost: 1, name: 'Second Wind', desc: 'สแตมินาต่ำกว่า 15 ฟื้นให้ทันที 20 (ครั้งเดียวต่อภารกิจ)' },
  grit:   { br: 'warden', tier: 2, max: 2, cost: 2, name: 'Thick Skin', desc: 'ลดดาเมจที่ได้รับ 3% ต่อเลเวล' },
  edge:   { br: 'warden', tier: 2, max: 2, cost: 2, name: 'Keen Edge', desc: 'ดาเมจที่ทำได้ +3% ต่อเลเวล' },
  steady: { br: 'medic', tier: 1, max: 1, cost: 1, name: 'Steady Hands', desc: 'ฉีดยาสมานแผลเร็วขึ้น 20%' },
  medic:  { br: 'medic', tier: 1, max: 1, cost: 2, name: 'Field Medic', desc: 'Treat ได้เลือดเพิ่ม +1 และถ้ารักษาเต็มได้ผลึกเพิ่ม +1' },
  bedside:{ br: 'medic', tier: 1, max: 2, cost: 1, name: 'Bedside Manner', desc: 'สัตว์ที่ส่งเข้าคอกฟื้นฟูมีสภาพเริ่มต้นดีขึ้น +10 ต่อเลเวล' },
  triage: { br: 'medic', tier: 2, max: 2, cost: 2, name: 'Triage Kit', desc: 'พกยาสมานแผลเข้าสนามได้ +1 ต่อเลเวล' },
  aim:    { br: 'handler', tier: 1, max: 1, cost: 2, name: 'Steady Aim', desc: 'ให้โดสสูงกว่าที่ต้องการหนึ่งระดับได้โดยไม่ OD' },
  gentle: { br: 'handler', tier: 1, max: 2, cost: 1, name: 'Gentle Touch', desc: 'ความไว้ใจที่ได้รับเพิ่ม +25% ต่อเลเวล' },
  pathf:  { br: 'handler', tier: 1, max: 2, cost: 1, name: 'Pathfinder', desc: 'ป่าฟื้นฟูเร็วขึ้น +15% ต่อเลเวล (เฉพาะส่วนที่เพิ่ม)' },
  haggle: { br: 'handler', tier: 1, max: 2, cost: 1, name: 'Haggler', desc: 'เหรียญจากภารกิจ +8% ต่อเลเวล' },
  keen:   { br: 'handler', tier: 2, max: 1, cost: 2, name: 'Keen Eye', desc: 'วัสดุหายากการันตีเร็วขึ้น: ทุก 2 ภารกิจ (เดิม 3)' }
};
var LOOT = {
  capture_ok: { blood: 2, saliva: 1, crystal: 1 }, capture_under: { blood: 1 }, capture_over: { hide: 1 },
  treat_full: { blood: 1, saliva: 1, crystal: 1 }, treat_part: { blood: 1 }, treat_wrong: { blood: 1 }, eliminate: { hide: 2 }, defeat: {}
};
var S = null;
var OUT_KEYS = ['capture_ok', 'capture_under', 'capture_over', 'treat_full', 'treat_part', 'treat_wrong', 'eliminate', 'defeat'];
var SLOTS = ['head', 'chest', 'arms', 'legs'];
var SLOT_NAME = { head: 'หมวก', chest: 'เกราะอก', arms: 'ปลอกแขน', legs: 'เกราะขา' };
var SETS = {
  hide:    { name: 'หนังกวาง', dr: .03, st: 3, inf: 0, blk: 0, bonus: 'ครบเซ็ต "Fleet Hunter": สตามินาฟื้นเร็วขึ้น +30%',
             cost: { head: { hide: 1, antler: 3, velvet: 1 }, chest: { hide: 2, antler: 3, velvet: 1, blood: 1 }, arms: { hide: 1, antler: 2, velvet: 1 }, legs: { hide: 1, antler: 2, velvet: 1 } } },
  crystal: { name: 'ผลึก Bloomrot', dr: .03, st: 0, inf: .125, blk: .04, bonus: 'ครบเซ็ต "Spore Ward": ภูมิคุ้มกัน ไม่ติดเชื้ออีก',
             cost: { head: { crystal: 1, saliva: 1 }, chest: { crystal: 2, saliva: 1 }, arms: { crystal: 1, saliva: 1 }, legs: { crystal: 1, saliva: 1, blood: 1 } } },
  bristle: { name: 'หนามหมูป่า', dr: .04, st: 2, inf: 0, blk: .075, bonus: 'ครบเซ็ต "Last Stand": ครั้งแรกที่จะตายต่อภารกิจ รอดที่ HP 1 พร้อมอมตะ 1.5 วิ',
             cost: { head: { hide: 1, tusk: 3, bristle: 1 }, chest: { hide: 2, tusk: 3, bristle: 1 }, arms: { hide: 1, tusk: 2, bristle: 1 }, legs: { hide: 1, tusk: 2, bristle: 1, blood: 1 } }, req: 'hide' }
};
SETS.symbiont = { name: 'ซิมไบโอนต์', dr: .035, st: 3, inf: 0, blk: .03, gate: 60, bonus: 'ครบเซ็ต "Symbiosis": ขณะติดเชื้อ สปอร์กลายเป็นพันธมิตร ฟื้น HP 2/วิ แทนเสียเลือด และตีแรงขึ้น 12% (ต้องป่าฟื้นตัว ≥60% ถึงจะสร้างได้)',
  cost: { head: { crystal: 1, hide: 1 }, chest: { crystal: 2, hide: 1, saliva: 1, velvet: 1 }, arms: { crystal: 1, saliva: 1 }, legs: { crystal: 1, hide: 1, saliva: 1 } } };
SETS.warren = { name: 'ขนกระต่ายพง', dr: .02, st: 4, inf: 0, blk: 0, clr: 'rabbit', bonus: 'ครบเซ็ต "Burrow Step": กลิ้งหลบเปลืองสตามินาน้อยลง 30% และวิ่งเร็วขึ้น 5% (ต้องเคยล่า/ฟื้นฟูกระต่ายสำเร็จ 1 ครั้ง)',
  cost: { head: { fur: 3, ear: 1 }, chest: { fur: 3, ear: 1, hide: 1 }, arms: { fur: 2, ear: 1, blood: 1 }, legs: { fur: 2, ear: 1, hide: 1 } } };
SETS.alpha = { name: 'ขนหมาป่าจ่าฝูง', dr: .045, st: 3, inf: 0, blk: .03, clr: 'wolf', bonus: 'ครบเซ็ต "Alpha\'s Mark": ดาเมจที่ทำได้ +8% เมื่อมอนสเตอร์เข้าเฟส 2 ขึ้นไป (ต้องเคยจบงานกับหมาป่า 1 ครั้ง)',
  cost: { head: { fang: 3, mane: 1 }, chest: { fang: 3, mane: 1, hide: 1 }, arms: { fang: 2, mane: 1 }, legs: { fang: 2, mane: 1, blood: 1 } } };
SETS.hive = { name: 'เกราะไคตินราชินี', dr: .04, st: 4, inf: .1, blk: .02, clr: 'hive', bonus: 'ครบเซ็ต "Swarm Ward": ดาเมจจากฝูงแมลง −60% และกำจัดแมลงแต่ละตัวได้สตามินา +3 (ต้องเคยจบงานกับราชินีรัง 1 ครั้ง)',
  cost: { head: { chitin: 3, jelly: 1 }, chest: { chitin: 3, jelly: 1, hide: 1 }, arms: { chitin: 2, jelly: 1 }, legs: { chitin: 2, jelly: 1, blood: 1 } } };
var SET_KEYS = ['hide', 'crystal', 'bristle', 'symbiont', 'warren', 'alpha', 'hive'];
(function () { for (var i = 0; i < SET_KEYS.length; i++) { var s0 = SETS[SET_KEYS[i]]; s0.dr = Math.round(s0.dr * BAL.armorDr * 1000) / 1000; s0.hp = BAL.armorHp[SET_KEYS[i]] || 0; } })(); /* v18.5: เกราะลดดาเมจได้จริง + เพิ่ม HP */
var REGIONS = { stag: { name: 'Sunken Grove', kind: 'ป่าริมหนอง' }, boar: { name: 'Thornback Ridge', kind: 'สันเขาหนาม' }, rabbit: { name: 'Burrow Meadow', kind: 'ทุ่งโพรงกระต่าย' } };
var SPECIES = ['stag', 'boar', 'rabbit'];
var LD_N = 3;
var PITY_SP = ['stag', 'boar', 'rabbit', 'wolf', 'hive'];
function spOf(k) { return k === 'boar' ? 'boar' : (k === 'rabbit' ? 'rabbit' : 'stag'); }
var FOREST_DELTA = { capture_ok: 10, capture_under: 3, capture_over: 0, treat_full: 14, treat_part: 6, treat_wrong: -2, eliminate: -10, defeat: -2 };
var PEN_COND = { capture_ok: 50, capture_under: 30, capture_over: 15 };
function penCap() { return S && S.res && S.res.pen2 ? 4 : 2; }
function penName(k, v) { return monNameOf(spOf(k), v); }
function penAdd(M0, kind) {
  if (M0 && M0.kind === 'hive') { if (PEN_COND[kind] === undefined) return ''; S.xp += 40; return '<p class="good">ราชินีรังต้องแยกไว้ในกรงเก็บกักพิเศษของทีมวิจัย — ไม่ส่งเข้าคอกฟื้นฟู · XP +40</p>'; }
  if (M0 && M0.kind === 'wolf') { if (PEN_COND[kind] === undefined) return ''; S.xp += 40; return '<p class="good">หมาป่าตัวใหญ่เกินกว่าคอกฟื้นฟูจะรับไว้ — ทีมพาไปปล่อยในถิ่นห่างไกลหลังรักษาเบื้องต้น · XP +40</p>'; }
  if (!M0 || M0.kind === 'fawn' || PEN_COND[kind] === undefined) return '';
  if (S.pen.length >= penCap()) { var fk0 = spOf(M0.kind); S.forest[fk0] = clamp(S.forest[fk0] + 3, 0, 100); return '<p class="warn">คอกฟื้นฟูเต็ม — ปล่อย ' + penName(M0.kind) + ' กลับป่าทันที (ป่า +3)</p>'; }
  S.pen.push({ kind: spOf(M0.kind), ail: M0.ail, cond: Math.max(5, PEN_COND[kind] + 10 * skillLv('bedside') - (M0.variant === 1 ? 10 : 0)), dx: !!M0.diagKnown, last: -1, mut: !!M0.mut, vr: M0.variant === 1 ? 1 : 0, id: (S.hunts || 0) + '-' + S.pen.length });
  return '<p class="good">นำ ' + penName(M0.kind) + ' กลับไปคอกฟื้นฟูที่หมู่บ้านแล้ว (สภาพ ' + Math.max(5, PEN_COND[kind] + 10 * skillLv('bedside') - (M0.variant === 1 ? 10 : 0)) + '%) — คุยกับผู้ดูแลคอกเพื่อรักษาต่อ</p>';
}
function penRelease(i, early) {
  var pt = S.pen[i], fk = pt.kind, f0 = forestOf(fk), msg;
  S.pen.splice(i, 1);
  if (early) { S.forest[fk] = clamp(f0 + 3, 0, 100); trustAdd(fk, 2); S.xp += 5; return 'ปล่อย ' + penName(fk) + ' กลับป่าก่อนหาย (ป่า +3 · ไว้ใจ +2)'; }
  var g = { blood: 2, saliva: 2, crystal: 1 }; if (pt.mut) { g.crystal += 1; g.hide = 1; } if (SP_MATS[fk]) { g[SP_MATS[fk].common] = 1; if (pt.mut) g[SP_MATS[fk].rare] = 1; }
  for (var k in g) S.mats[k] += g[k];
  S.forest[fk] = clamp(f0 + 8, 0, 100); trustAdd(fk, 8); S.xp += 30; S.released = (S.released || 0) + 1; S.favor = Math.min(3, (S.favor || 0) + 1);
  return penName(fk) + ' หายดีแล้ว ปล่อยกลับป่า! ป่า +8 · ไว้ใจ +8 · ได้ ' + costStr(g) + ' · XP +30 · ได้ "พรป่า" 1 ครั้ง (ใช้ในภารกิจถัดไป)';
}
var ALLY = null;
var ALLY_NAMES = ['ใบไม้', 'หมอก', 'ตะวัน', 'ลำธาร', 'ดอกหญ้า', 'เมฆ', 'พายุ', 'น้ำค้าง'];
var ALLY_INFO = {
  stag: { name: 'กวางผู้ปลอบ', abil: 'ตัวเล็ก · ทุก ~18 วิ ถ้า HP คุณต่ำกว่า 80% จะปลอบฟื้น HP ให้ · ล้างสปอร์ติดเชื้อทุก ~9 วิ · นาน ๆ ที (~28 วิ) ชนเบา ๆ ใส่มอนสเตอร์' },
  rabbit: { name: 'กระต่ายผู้ว่องไว', abil: 'ตัวเล็ก · ทุก ~20 วิ ตอนมอนสเตอร์กำลังง้างท่า จะกระโดดเตือน — คุณวิ่งไวขึ้น 18% และสตามินาฟื้นไวขึ้น 30% นาน 5 วิ' },
  boar: { name: 'หมูป่าผู้พุ่ง', abil: 'ตัวเล็ก · ทุก ~16 วิ พุ่งชนมอนสเตอร์ตอนที่มันเปิดช่อง (พักท่า/เสียหลัก) ดาเมจและแรงเสียหลักสูง' }
};
function allyLv(a) { return a.bond >= 5 ? 3 : (a.bond >= 2 ? 2 : 1); }
function allyPot(a) { return (1 + .25 * (allyLv(a) - 1)) * (a.mut ? 1.25 : 1) * (a.sev ? 1.1 : 1); }
function curAlly() { return S && S.allies && S.ally >= 0 && S.allies[S.ally] ? S.allies[S.ally] : null; }
function penAppoint(i) {
  var pt = S.pen[i], fk = pt.kind;
  S.allies.push({ id: String(Date.now()).slice(-6) + i, kind: pt.kind, mut: !!pt.mut, sev: pt.vr === 1, bond: 0, name: ALLY_NAMES[(S.allies.length + (S.released || 0) + S.hunts) % ALLY_NAMES.length] });
  if (S.ally < 0) S.ally = S.allies.length - 1;
  S.pen.splice(i, 1); S.forest[fk] = clamp(forestOf(fk) + 4, 0, 100); S.xp += 20;
  return 'แต่งตั้ง ' + S.allies[S.allies.length - 1].name + ' (' + ALLY_INFO[pt.kind].name + ') เป็นผู้ช่วยแล้ว! ป่า +4 · XP +20';
}
function makeAlly() {
  var a = curAlly(); ALLY = null;
  if (!a || huntKind === 'fawn') return '';
  ALLY = { idx: S.ally, kind: a.kind, mut: a.mut, name: a.name, pot: allyPot(a), lv: allyLv(a), x: P.x - 36, y: P.y + 18, cd: 6, cd2: 20, peck: false, soothe: 5, state: 'follow', tx: 0, ty: 0, t: 0 };
  return ' · ผู้ช่วย ' + a.name + ' Lv' + ALLY.lv;
}
function updateAlly(dt) {
  var a = ALLY; if (!a || !P || !M) return;
  a.t += dt; a.cd2 = Math.max(0, a.cd2 - dt); a.cd = Math.max(0, a.cd - dt); a.soothe = Math.max(0, a.soothe - dt);
  var m = M, p = P, mDown = m.state === 'downed';
  if (a.state === 'follow') {
    var back = p.face + Math.PI, gx = p.x + Math.cos(back) * 44 + Math.cos(back + 1.5) * 16, gy = p.y + Math.sin(back) * 44 + Math.sin(back + 1.5) * 16, dx = gx - a.x, dy = gy - a.y, dd = Math.hypot(dx, dy);
    if (dd > 3) { var sp = Math.min(dd * 6, 260) * dt; a.x += dx / dd * sp; a.y += dy / dd * sp; }
    if (a.kind === 'stag' && !mDown) {
      if (a.cd <= 0 && p.hp < p.maxHp * .8 && p.hp > 0) { var heal = Math.round(14 * a.pot); p.hp = Math.min(p.maxHp, p.hp + heal); a.cd = 18; ftext(p.x, p.y - 34, '+' + heal + ' ' + a.name, '#7fe0b5', 16, 1); ring(p.x, p.y, 10, 50, '#7fe0b5', .5, 4); sfx('heal'); }
      if (a.soothe <= 0 && (p.infT > 0 || Object.keys(p.fx).some(function (k) { return p.fx[k] > 0; }))) { p.infT = 0; clearFx(); a.soothe = 9; ftext(p.x, p.y - 50, 'ล้างเชื้อ', '#c8b8e8', 14, .9); ring(p.x, p.y, 10, 44, '#c8b8e8', .4, 3); }
    }
    if (a.kind === 'stag' && !mDown && a.cd2 <= 0 && m.state !== 'roar' && Math.hypot(m.x - a.x, m.y - a.y) < 380) { a.state = 'rush'; a.peck = true; }
    if (a.kind === 'rabbit' && !mDown && a.cd <= 0 && m.state === 'tele' && !P.dead) { a.cd = 20; P.hasteT = 5 * Math.min(1.5, a.pot); ftext(a.x, a.y - 24, a.name + ' เตือน!', '#bfe8a0', 14, .9); ring(P.x, P.y, 10, 46, '#bfe8a0', .45, 4); sfx('scan'); }
    if (a.kind === 'boar' && !mDown && a.cd <= 0 && (m.state === 'rec' || m.state === 'stagger' || m.state === 'stun' || m.state === 'exhaust') && Math.hypot(m.x - a.x, m.y - a.y) < 420) { a.state = 'rush'; sfx('swing'); ftext(a.x, a.y - 22, a.name + '!', '#ffb066', 14, .7); }
  } else if (a.state === 'rush') {
    if (mDown) { a.state = 'follow'; return; }
    var rx = m.x - a.x, ry = m.y - a.y, rd = Math.hypot(rx, ry);
    if (rd < m.r + 14) {
      var dmg = Math.round((a.peck ? 12 : 34) * a.pot); m.hp -= dmg; a.state = 'follow'; if (a.peck) a.cd2 = 28; else a.cd = 16;
      if (m.stagCd <= 0 && m.state !== 'stagger' && m.state !== 'stun') m.stag += (a.peck ? 8 : 40) * a.pot;
      a.peck = false;
      ftext(m.x, m.y - m.r - 14, String(dmg), '#ffb066', 20, .9); ring(m.x, m.y, m.r, m.r + 50, '#ffb066', .35, 4); burst(m.x, m.y, '#ffb066', 10, 220); addShake(5); sfx('heavy'); m.hitFlash = .08;
      if (m.hp <= 0) { monsterDowned(); return; }
    } else { var rs = 520 * dt; a.x += rx / rd * rs; a.y += ry / rd * rs; }
  }
}
function drawAlly() {
  var a = ALLY; if (!a) return;
  var im = vimg('ally_' + a.kind), w = a.kind === 'rabbit' ? 40 : 54, dx, dy;
  /* หันตามทิศที่เคลื่อนที่ · ยืนนิ่งแล้วหันไปทางมอนสเตอร์ */
  if (a.lx !== undefined) {
    dx = a.x - a.lx; dy = a.y - a.ly;
    if (dx * dx + dy * dy > .4) a.face = turnToward(a.face || 0, Math.atan2(dy, dx), .35);
    else if (M && M.state !== 'downed') a.face = turnToward(a.face || 0, Math.atan2(M.y - a.y, M.x - a.x), .08);
  }
  a.lx = a.x; a.ly = a.y;
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(a.x, a.y + 5, w * .38, 6, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = a.mut ? '#b06ad8' : '#7fe0b5'; ctx.globalAlpha = .85; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(a.x, a.y + 2, w * .46, w * .27, 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
  if (im) vilAnimal(a.kind, a.x, a.y, a.face || 0, w, 1);
  else { ctx.save(); ctx.translate(a.x, a.y); ctx.fillStyle = a.kind === 'boar' ? '#8a6a5a' : (a.kind === 'rabbit' ? '#b8a890' : '#c0985a'); ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fill(); ctx.restore(); }
  txt(a.name + ' Lv' + a.lv, a.x, a.y - 20, 9, '#bfe8d0', 'center', true);
}
function penHtml() {
  var h = trustHtml() + '<div class="item"><div style="width:100%"><b>คอกฟื้นฟู (' + S.pen.length + '/' + penCap() + ')</b><div class="d">สัตว์ที่จับมาจะพักฟื้นที่นี่ ดูแลได้ 1 ครั้งต่อรอบล่า ยาตรงอาการ +40% ยาผิด −10% อาหาร +10% · สภาพ 100% = หายดี เลือกปล่อยกลับป่า (ป่าฟื้น วัสดุ พรป่า) หรือแต่งตั้งเป็นผู้ช่วย</div></div></div>', i, pt, c, col, ready, k;
  if (!S.pen.length) h += '<p style="color:#9aa39a;font-size:13px">ยังไม่มีสัตว์ในคอก — ใช้ท่า "จับ" (ยาสลบให้ครบโดส) ตอนออกพิทักษ์ แล้วเอากลับมา</p>';
  for (i = 0; i < S.pen.length; i++) {
    pt = S.pen[i]; c = Math.round(pt.cond); col = c >= 70 ? '#7fe0b5' : (c >= 40 ? '#e8d86a' : '#e86a5a'); ready = pt.last < S.hunts;
    h += '<div class="item"><div style="width:100%">' + uiImg(pt.kind, 46, 'float:right;margin-left:8px') + '<b>' + penName(pt.kind, pt.vr) + (pt.mut ? ' (กลายพันธุ์)' : '') + '</b><div class="d">อาการ: ' + (pt.dx ? AIL[pt.ail].name : 'ยังไม่ทราบ — ต้องตรวจวินิจฉัย') + ' · สภาพ ' + c + '%</div>' +
      '<div style="height:6px;background:#1a2a20;border-radius:3px;margin:4px 0 8px"><div style="height:6px;width:' + c + '%;background:' + col + ';border-radius:3px"></div></div><div class="row">';
    if (pt.healed) { h += '<button data-act="pen" data-arg="rel:' + i + '">ปล่อยกลับป่า (ป่า +8 · วัสดุ · พรป่า)</button><button data-act="pen" data-arg="appoint:' + i + '" class="' + (S.allies.length >= 3 ? 'dim' : '') + '">แต่งตั้งเป็นผู้ช่วย</button></div></div></div>'; continue; }
    if (!pt.dx) h += '<button data-act="pen" data-arg="dx:' + i + '" class="' + (S.mats.saliva >= 1 ? '' : 'dim') + '">ตรวจวินิจฉัย (น้ำลาย ×1)</button>';
    else if (ready) {
      for (k in MEDS) h += '<button data-act="pen" data-arg="med:' + i + ':' + k + '" class="' + (canAfford({ saliva: 1, crystal: 1 }) ? '' : 'dim') + '">' + MEDS[k] + ' (น้ำลาย 1 · ผลึก 1)</button>';
    }
    if (ready) h += '<button data-act="pen" data-arg="food:' + i + '" class="' + (S.mats.blood >= 1 ? '' : 'dim') + '">ให้อาหาร (เลือด ×1)</button>';
    else h += '<span class="warn" style="font-size:12px">พักอยู่ — ออกพิทักษ์อีกรอบก่อนถึงจะดูแลต่อได้</span>';
    h += '<button data-act="pen" data-arg="free:' + i + '" style="margin-left:auto;font-size:12px;color:#9aa39a">ปล่อยก่อน</button></div></div></div>';
  }
  for (k in CAT) if (CAT[k].tab === 'pen') h += itemRow(k);
  h += '<h2 style="font-size:15px;margin-top:14px">ผู้ช่วยจากป่า (' + S.allies.length + '/3)</h2>';
  if (!S.allies.length) h += '<p style="color:#9aa39a;font-size:13px">สัตว์ที่รักษาหายแล้วเลือก "แต่งตั้งเป็นผู้ช่วย" ได้ จะตามไปช่วยในสนาม (ออกล่าด้วยได้ครั้งละ 1 ตัว) ยิ่งออกล่าด้วยกัน ยิ่งผูกพันและเก่งขึ้น</p>';
  for (i = 0; i < S.allies.length; i++) { var al = S.allies[i], on = S.ally === i;
    h += '<div class="item"><div><b>' + al.name + ' · ' + ALLY_INFO[al.kind].name + (al.mut ? ' (กลายพันธุ์ ×1.25)' : '') + ' · Lv' + allyLv(al) + '</b><div class="d">' + ALLY_INFO[al.kind].abil + ' · ผูกพัน ' + al.bond + ' (Lv2 ที่ 2, Lv3 ที่ 5)</div></div><div class="row"><button class="tab' + (on ? ' on' : '') + '" data-act="ally" data-arg="' + (on ? 'none' : 'use') + ':' + i + '">' + (on ? 'พาไปอยู่' : 'พาไปด้วย') + '</button><button data-act="ally" data-arg="free:' + i + '" style="font-size:12px;color:#9aa39a">ส่งกลับป่า</button></div></div>'; }
  return h;
}
function forestOf(k) { var v = S && S.forest ? S.forest[k] : 40; return typeof v === 'number' && isFinite(v) ? v : 40; }
function verdantN() { return (S && S.verdant ? (S.verdant.stag ? 1 : 0) + (S.verdant.boar ? 1 : 0) + (S.verdant.rabbit ? 1 : 0) : 0); }
function podTarget() { if (!S || huntKind === 'fawn') return 3; var v = forestOf(huntRegionKey()); return v >= 90 ? 5 : (v >= 70 ? 4 : (v < 30 ? 2 : 3)); }
function forestEffect(v) { return v >= 90 ? 'สมบูรณ์: ฝักสมุนไพร 5 จุดในสนาม' : (v >= 70 ? 'ฟื้นตัว: ฝักสมุนไพร 4 จุด · จบเคสสำเร็จได้วัสดุเพิ่ม' : (v >= 30 ? 'ทรงตัว: ฝักสมุนไพร 3 จุด' : (v >= 20 ? 'เสื่อมโทรม: ฝัก 2 จุด · มีสปอร์ลอยในสนาม' : 'โรคระบาด: ฝัก 2 จุด · สปอร์หนาแน่น · สัตว์ป่วยหนักตั้งแต่เริ่ม'))); }
function forestStart() {
  var out = '';
  if (!S || huntKind === 'fawn' || !M) return out;
  var fk = huntRegionKey(), v = forestOf(fk);
  if (v < 20) { M.sick = Math.min(100, (M.sick || 0) + 25); clouds.push({ x: CX + 90, y: CY - 70, r: 50, t: 0, life: 40 }); clouds.push({ x: CX - 60, y: CY + 110, r: 46, t: 0, life: 40 }); out += ' · โรคระบาด! สปอร์หนาแน่น'; }
  else if (v < 30) { clouds.push({ x: CX + 80, y: CY + 90, r: 46, t: 0, life: 40 }); out += ' · ป่าเสื่อมโทรม มีสปอร์ลอยอยู่'; }
  if (S.favor > 0) { S.favor--; P.favor = true; out += ' · พรป่า: ตีแรง +10% สตามินาไว +20%'; persist(); }
  return out;
}

