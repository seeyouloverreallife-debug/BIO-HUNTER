/* ================= VILLAGE ================= */
var V = null;
/* v17.9: อาคาร/NPC ใช้ภาพจริง — (x,y,w,h) = ฐานที่ชน · (ax,ay) = จุดกึ่งกลางล่างของภาพ · aw = ความกว้างที่วาด · วาดเรียงตามความลึก (y) */
var VIL_RECTS = [
  { x: 104, y: 214, w: 132, h: 68, roof: '#8a4a3a', sign: 'โรงเครื่องมือ', art: 'vil_workshop', ax: 170, ay: 282, aw: 165 },
  { x: 104, y: 440, w: 132, h: 68, roof: '#4a6a8a', sign: 'ร้านเกราะ', art: 'vil_armorer', ax: 170, ay: 508, aw: 165 },
  { x: 394, y: 214, w: 132, h: 68, roof: '#4a8a6a', sign: 'ห้องวิจัย', art: 'vil_lab', ax: 460, ay: 282, aw: 165 },
  { x: 635, y: 450, w: 110, h: 50, roof: '#8a7a3a', sign: 'ร้านค้า', art: 'vil_shop', ax: 690, ay: 500, aw: 135 },
  { x: 665, y: 140, w: 140, h: 50, roof: '#6a8a4a', sign: 'คอกฟื้นฟู', art: 'vil_rehab_pen', ax: 735, ay: 190, aw: 190 }
];
var VIL_NPCS = [
  { id: 'smith', name: 'ช่างบราน', role: 'ช่างเครื่องมือ · อาวุธ', x: 170, y: 314, col: '#e0904a', view: 'forge', pic: 'npc_bran' },
  { id: 'armorer', name: 'ช่างมีรา', role: 'ช่างเกราะ · ชุดเกราะ', x: 170, y: 542, col: '#6ab0e8', view: 'armor', pic: 'npc_mira' },
  { id: 'doc', name: 'ดร.น้อย', role: 'นักนิเวศ · ห้องวิจัย', x: 460, y: 314, col: '#7fe0b5', view: 'lab', pic: 'npc_noi' },
  { id: 'elder', name: 'ผู้เฒ่าตา', role: 'แคมป์ · ทักษะและตั้งค่า', x: 520, y: 455, col: '#c8b8e8', view: 'skills', pic: 'npc_ta' },
  { id: 'trader', name: 'พ่อค้าพิม', role: 'ร้านค้า · เสบียง', x: 690, y: 534, col: '#e8d86a', view: 'shop', pic: 'npc_pim' },
  { id: 'captain', name: 'กัปตันเรน', role: 'แผนที่ป่า · ออกพิทักษ์', x: 800, y: 380, col: '#e86a5a', view: 'main', pic: 'npc_ren' },
  { id: 'keeper', name: 'ป้าแก้ว', role: 'ผู้ดูแลคอก · ฟื้นฟูสัตว์', x: 735, y: 226, col: '#f0a8c8', view: 'pen', pic: 'npc_kaew' },
  { id: 'board', name: 'กระดานภารกิจ', role: 'เลือกเควส', x: 318, y: 212, col: '#c89a5a', view: 'board', obj: true, art: 'vil_quest_board', aw: 92 },
  { id: 'garden', name: 'ลานเพาะปลูก', role: 'ปลูกสมุนไพร', x: 335, y: 505, col: '#7a5a34', view: 'garden', obj: true },
  { id: 'dojo', name: 'ลานซ้อม', role: 'ลองคอมโบ · วัด DPS', x: 840, y: 540, col: '#b8504a', view: 'dojo', obj: true, art: 'vil_training_yard', aw: 150 },
  { id: 'kid', name: 'เด็กน้อย', role: 'ชาวบ้าน', x: 330, y: 300, col: '#f0f0f0', view: null, pic: 'npc_child' }
];
var VIL_GATE = { art: 'vil_forest_gate', ax: 850, ay: 350, aw: 220 };
var VIL_TREES = [];
(function () { var sd = 7; function r() { sd = (sd * 9301 + 49297) % 233280; return sd / 233280; } for (var i = 0; i < 42; i++) { var side = r(), tx, ty; if (side < .5) { tx = r() * 960; ty = r() < .5 ? 20 + r() * 30 : 560 + r() * 30; } else { tx = r() < .5 ? 10 + r() * 40 : 910 + r() * 40; ty = r() * 600; } VIL_TREES.push({ x: tx, y: ty, r: 16 + r() * 14 }); } })();
function trustLine() {
  var best = 'stag', i, k, w = 'stag', v;
  for (i = 0; i < SPECIES.length; i++) { k = SPECIES[i]; if (k === 'boar' && S.wins < 1) continue; if (k === 'rabbit' && S.wins < 2) continue; if (trustOf(k) > trustOf(best)) best = k; if (trustOf(k) < trustOf(w)) w = k; }
  v = trustOf(best);
  if (v >= 90) return 'ดูนั่น ' + REGIONS[best].kind + ' เดินมาถึงรั้วเอง — มันไว้ใจพวกเราจริง ๆ แล้วนะ';
  if (v >= 70) return 'เห็น' + REGIONS[best].kind + 'โผล่ที่ขอบรั้วบ่อยขึ้น มันเริ่มไว้ใจเรา';
  if (trustOf(w) < 20 && (S.wins >= 1 || w === 'stag')) return 'พวก' + REGIONS[w].kind + 'หวาดกลัวเรามาก — รักษาและปล่อยพวกมันกลับป่าจะช่วยกู้ความไว้ใจ';
  return '';
}
function npcLine(id) {
  var w = S.wins, h = S.hunts, n = S.log && S.log.length ? S.log[0] : null;
  if (id === 'smith') return h === 0 ? 'อาวุธทุกชิ้นคือเครื่องมือดูแลป่า — หอกผูกสายต้อนมัน ปืนเมล็ดปลูกพุ่มหนาม มีดตัดแต่งตัดเฉพาะจุดเสีย' : (S.wk < 3 ? 'เอาวัสดุมา ข้าจะลับอาวุธให้คมขึ้น (Mk.' + ['II', 'III', 'III'][S.wk - 1] + ')' : 'อาวุธเจ้าถึงขีดสุดแล้ว ที่เหลือคือฝีมือ');
  if (id === 'armorer') return !S.res.arm_hide_chest ? 'หนังกวางที่เจ้าเก็บมา ข้าเย็บเป็นชุดเบา ๆ ให้ได้นะ' : 'ชุดเกราะดีไม่ได้กันทุกอย่าง — แต่โดนน้อยลงก็รอดนานขึ้น';
  if (id === 'doc') return w === 0 ? 'อย่าลืมสแกนก่อนยิงยา ยามั่ว ๆ รังแต่จะทำให้มันโมโห' : 'ตัวอย่างที่เจ้าเอามาช่วยเราได้เยอะ — ดูห้องวิจัยสิ มีอุปกรณ์ใหม่';
  if (id === 'elder') return 'พักก่อนก็ได้ เสียงฝีเท้าของมัน ป่ายังจำได้ — ทักษะที่ฝึกจะอยู่กับเจ้าตลอด';
  if (id === 'keeper' && S.hunts > 0) { var tk = trustLine(); if (tk) return tk; }
  if (id === 'keeper') return S.pen.length ? 'ตัวที่เอากลับมาดูซึมอยู่ ตรวจให้ถูกแล้วให้ยาให้ตรงอาการนะ' : 'ถ้าจับสัตว์ป่วยมาได้ พามาที่คอกนี้ ข้าจะช่วยดูแลจนหายดีก่อนปล่อยกลับป่า';
  if (id === 'trader') return 'ยาสลบ ยาสมานแผล ของพกสำคัญกว่าความกล้านะ — มีของเหลือใช้ก็ขายให้ข้าได้ ส่วนเสบียงจ่ายด้วยเหรียญนะ';
  if (id === 'garden') return 'แปลงสมุนไพรของหมู่บ้าน — ปลูกแล้วรอให้ผ่านการล่าอีกสองครั้งก็เก็บเกี่ยวได้';
  if (id === 'dojo') return 'ลานซ้อมของหมู่บ้าน — ตั้งเป้าให้ตีได้ไม่อั้น ไม่เสียของ ไม่ได้รางวัล วัดดาเมจต่อวินาทีกับคอมโบได้';
  if (id === 'board') return 'ติดประกาศภารกิจจากชาวบ้าน — เลือกเควสที่นี่ แล้วไปรายงานตัวกับกัปตันเรน';
  if (id === 'captain' && S.hunts > 0 && trustOf('stag') < 20 && trustOf('boar') < 20) return 'สัตว์ป่าเริ่มหลบหน้าพวกเราแล้ว — ถ้าเอาแต่ปราบ ป่าจะไม่ไว้ใจวาเดนอีก ลองจับและรักษาดูบ้าง';
  if (id === 'captain' && S.hunts > 0) return 'แผนที่ป่าบอกสุขภาพแต่ละเขต — ' + (forestMax() >= 70 ? 'ป่าฟื้นแล้ว รักษาต่อไป' : (forestMax() < 30 ? 'ป่ากำลังทรุด ลดการกำจัดเถอะ' : 'ช่วยมันอีกนิด ป่าจะฟื้น')) + ' (' + Math.round(forestOf('stag')) + '%)';
  if (id === 'captain') return w === 0 ? 'Rothorn Stag ยังคุกคามพืชผลอยู่ — ไปเตรียมตัวแล้วเปิดประตูออกล่าได้เลย' : (n && n.out === 'defeat' ? 'ครั้งก่อนหนักเอาเรื่อง เตรียมตัวให้ดีกว่านี้' : 'ทำได้ดี Warden — ยังมีเรื่องให้ล่า ลองดูรายงานบนกระดาน');
  return 'ลุงช่างบอกว่าชุดเกราะเท่ ๆ ทำจากหนังหมูป่านะ!';
}

