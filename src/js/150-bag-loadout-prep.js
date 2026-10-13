/* ===== BAG (v14.7): categorized inventory ===== */
var BAGCAT = 'all';
var BAG_CATS = [['all', 'ทั้งหมด'], ['animal', 'วัสดุสัตว์'], ['sample', 'ตัวอย่างชีวภาพ'], ['herb', 'สมุนไพร'], ['use', 'ไอเทมใช้'], ['gear', 'อุปกรณ์']];
var BAG_GROUPS = [
  { id: 'animal', key: 'stag', name: 'กวาง Rothorn Stag', mats: ['hide', 'antler', 'velvet'] },
  { id: 'animal', key: 'boar', name: 'หมูป่า Thornback Boar', mats: ['tusk', 'bristle'] },
  { id: 'animal', key: 'rabbit', name: 'กระต่าย Bramble Hare', mats: ['fur', 'ear'] },
  { id: 'animal', key: 'wolf', name: 'หมาป่า Ashfang Wolf', mats: ['fang', 'mane'] },
  { id: 'animal', key: 'hive', name: 'ราชินีรัง Hivemother', mats: ['chitin', 'jelly'] },
  { id: 'sample', key: '', name: 'ตัวอย่างชีวภาพ', mats: ['blood', 'saliva', 'crystal'] },
  { id: 'herb', key: '', name: 'สมุนไพร', mats: ['moss', 'bark', 'sage', 'poppy'] }
];
var MAT_SRC = { chitin: 'ดรอปจากราชินีรัง (เกือบทุกครั้ง)', jelly: 'ราชินีรัง: ขากรรไกรร้าว Lv2+ หรือเคสวิกฤต', blood: 'ได้จากการล่าและรักษา', saliva: 'ได้จากการล่าและรักษา', crystal: 'ได้จากสัตว์ติดเชื้อ ตัวแปรรุนแรงได้มากขึ้น', hide: 'ดรอปจากการล่า', antler: 'ดรอปจากกวาง (เกือบทุกครั้ง)', velvet: 'กวาง: โคนเขาร้าว Lv2+ หรือตัวแปรรุนแรง', tusk: 'ดรอปจากหมูป่า (เกือบทุกครั้ง)', bristle: 'หมูป่า: ท่าที่ร้าว Lv2+ หรือตัวแปรรุนแรง', fur: 'ดรอปจากกระต่าย (เกือบทุกครั้ง)', ear: 'กระต่าย: โคนหูร้าว Lv2+ หรือตัวแปรรุนแรง', fang: 'ดรอปจากหมาป่า', mane: 'หมาป่า: ตัวแปรรุนแรงหรือท่าร้าว Lv2+', moss: 'ปลูกที่ลานเพาะปลูก', bark: 'ปลูกที่ลานเพาะปลูก', sage: 'ปลูกที่ลานเพาะปลูก', poppy: 'ปลูกที่ลานเพาะปลูก' };
function bagCount(ids) { var n = 0, i; for (i = 0; i < ids.length; i++) n += S.mats[ids[i]] || 0; return n; }
function bagTotal() { var n = 0, i; for (i = 0; i < MAT_KEYS.length; i++) if (MAT_KEYS[i] !== 'coin') n += S.mats[MAT_KEYS[i]] || 0; return n; }
function bagBar() { return '<div class="bag-bar"><span class="chip" style="border-color:#b9962f;color:#ffd45a">เหรียญ ' + S.mats.coin + '</span><button class="tab" data-act="pack">กระเป๋า · ' + bagTotal() + '</button></div>'; }
function bagCard(k) {
  var n = S.mats[k] || 0;
  return '<div class="bag-c' + (n ? '' : ' z') + '">' + uiImg('m_' + k, 40, 'float:right;margin:0 0 2px 4px') + '<div class="bag-nm">' + MATS[k] + '</div><div class="bag-n">' + n + '</div><div class="bag-s">' + (MAT_SRC[k] || '') + '</div></div>';
}
function bagGroup(g) {
  var h = '<div class="bag-h">' + (g.key ? uiImg(g.key, 28) : '') + '<span>' + g.name + '</span><span class="ct">รวม ' + bagCount(g.mats) + '</span></div><div class="bag-grid">', i;
  for (i = 0; i < g.mats.length; i++) h += bagCard(g.mats[i]);
  return h + '</div>';
}
function bagUseHtml() {
  var h = '<div class="bag-h"><span>ไอเทมใช้ในสนาม</span><span class="ct">เตรียมก่อนออกล่าที่ร้านค้า/โต๊ะผสมยา</span></div><div class="bag-grid">', k;
  for (k in INV_ITEMS) { var it = INV_ITEMS[k], n = invN(k), cap = invCap(k); h += '<div class="bag-c' + (n ? '' : ' z') + '">' + uiImg('i_' + k, 40, 'float:right;margin:0 0 2px 4px') + '<div class="bag-nm">' + it.name + '</div><div class="bag-n">' + n + '<span style="font-size:13px;color:#9aa39a"> / ' + cap + '</span></div><div class="bag-cap"><i style="width:' + Math.min(100, Math.round(n / Math.max(1, cap) * 100)) + '%"></i></div><div class="bag-s">' + it.d + '</div></div>'; }
  return h + '</div>';
}
function bagGearHtml() {
  var h = '<div class="bag-h"><span>อาวุธ</span></div><div class="bag-grid">', i, k;
  for (i = 0; i < WEAPON_KEYS.length; i++) { k = WEAPON_KEYS[i]; var own = ownsWeapon(k), w = WEAPONS[k]; h += '<div class="bag-c' + (own ? '' : ' z') + '" style="' + (S.weapon === k ? 'border-color:#d8b24a' : '') + '">' + uiImg(wIconKey(k), 44, 'float:right') + '<div class="bag-nm">' + w.name + '</div><div class="bag-s">' + (own ? (S.weapon === k ? '★ ถือใช้อยู่' : 'ครอบครองแล้ว') : 'ยังไม่ได้สร้าง') + '</div></div>'; }
  h += '</div><div class="bag-h"><span>ชุดเกราะ</span><span class="ct">สวมใส่ที่ช่างเครื่องมือ → ชุดเกราะ</span></div><div class="bag-grid">';
  for (k in SETS) { var have = 0, worn = 0, j; for (j = 0; j < SLOTS.length; j++) { if (S.res['arm_' + k + '_' + SLOTS[j]]) have++; if (S.eq[SLOTS[j]] === k) worn++; } var ic = ''; for (j = 0; j < SLOTS.length; j++) ic += uiImg('arm_' + k + '_' + SLOTS[j], 30, 'margin-right:2px' + (S.res['arm_' + k + '_' + SLOTS[j]] ? '' : ';opacity:.22;filter:grayscale(1)')); h += '<div class="bag-c' + (have ? '' : ' z') + '"><div class="bag-nm">' + SETS[k].name + '</div><div>' + ic + '</div><div class="bag-n">' + have + '<span style="font-size:13px;color:#9aa39a"> / 4</span></div><div class="bag-s">สวมอยู่ ' + worn + ' ชิ้น' + (worn >= 4 ? ' — ครบเซ็ต' : '') + '</div></div>'; }
  return h + '</div><div class="row"><button data-act="ldview">จัดชุดอุปกรณ์ (Loadout)</button></div>';
}
function bagHtml() {
  var h = '<h2>กระเป๋า</h2><p style="font-size:13px;color:#9aa39a">แยกตามหมวด · จางๆ = ยังไม่มี · เหรียญ ' + S.mats.coin + ' · วัสดุรวม ' + bagTotal() + ' ชิ้น</p><div class="bag-tabs">', i;
  var counts = { all: bagTotal(), animal: 0, sample: 0, herb: 0, use: 0, gear: 0 }, g, k;
  for (i = 0; i < BAG_GROUPS.length; i++) counts[BAG_GROUPS[i].id] += bagCount(BAG_GROUPS[i].mats);
  for (k in INV_ITEMS) counts.use += invN(k);
  for (i = 0; i < WEAPON_KEYS.length; i++) if (ownsWeapon(WEAPON_KEYS[i])) counts.gear++;
  for (k in SETS) for (i = 0; i < SLOTS.length; i++) if (S.res['arm_' + k + '_' + SLOTS[i]]) counts.gear++;
  for (i = 0; i < BAG_CATS.length; i++) h += '<button class="tab' + (BAG_CATS[i][0] === BAGCAT ? ' on' : '') + '" data-act="pack" data-arg="' + BAG_CATS[i][0] + '">' + BAG_CATS[i][1] + ' ' + counts[BAG_CATS[i][0]] + '</button>';
  h += '</div>';
  for (i = 0; i < BAG_GROUPS.length; i++) { g = BAG_GROUPS[i]; if (BAGCAT === 'all' || BAGCAT === g.id) h += bagGroup(g); }
  if (BAGCAT === 'all' || BAGCAT === 'use') h += bagUseHtml();
  if (BAGCAT === 'all' || BAGCAT === 'gear') h += bagGearHtml();
  return h;
}
function costHave(cost) { var a = [], k; for (k in cost) { var have = S.mats[k] || 0; a.push(uiImg('m_' + k, 16, 'vertical-align:-3px;margin-right:2px') + MATS[k] + ' <span class="' + (have >= cost[k] ? 'good' : 'warn') + '">' + have + '</span>/' + cost[k]); } return a.join(' · '); }
/* ===== LOADOUT (v14.8): 3 saved weapon + armor presets ===== */
function ldList() { if (!S.ld || !Array.isArray(S.ld)) S.ld = ldAll(); while (S.ld.length < LD_N) S.ld.push(ldBlank()); return S.ld; }
function ldBlank() { return { set: false, w: 'lance', eq: { head: '', chest: '', arms: '', legs: '' } }; }
function ldAll() { var a = [], i; for (i = 0; i < LD_N; i++) a.push(ldBlank()); return a; }
function ldStats(eq) {
  var dr = 0, st = 0, blk = 0, inf = 0, hp = 0, i, a, cnt = {}, full = '', k;
  for (i = 0; i < SLOTS.length; i++) { a = eq[SLOTS[i]] && SETS[eq[SLOTS[i]]]; if (a) { dr += a.dr; st += a.st; blk += a.blk; inf += a.inf; hp += a.hp || 0; cnt[eq[SLOTS[i]]] = (cnt[eq[SLOTS[i]]] || 0) + 1; } }
  for (k in cnt) if (cnt[k] === 4) full = k;
  return { dr: dr, st: st, blk: blk, inf: inf, hp: hp, full: full };
}
function ldStatText(eq) {
  var t = ldStats(eq), a = [];
  if (t.dr) a.push('ลดดาเมจ ' + Math.round(t.dr * 100) + '%'); if (t.hp) a.push('HP +' + t.hp); if (t.st) a.push('สตามินา +' + t.st); if (t.blk) a.push('บล็อก +' + Math.round(t.blk * 100) + '%'); if (t.inf) a.push('ต้านเชื้อ +' + Math.round(t.inf * 100) + '%');
  return (a.length ? a.join(' · ') : 'ไม่มีโบนัสเกราะ') + (t.full ? ' · <b class="good">ครบเซ็ต ' + SETS[t.full].name + '</b>' : '');
}
function ldSame(ld) { var i; if (!ld.set || ld.w !== S.weapon) return false; for (i = 0; i < SLOTS.length; i++) if ((ld.eq[SLOTS[i]] || '') !== (S.eq[SLOTS[i]] || '')) return false; return true; }
function ldActive() { var i; for (i = 0; i < LD_N; i++) if (ldSame(ldList()[i])) return i; return -1; }
function ldMissing(ld) { var m = [], i, id; if (!ownsWeapon(ld.w)) m.push(WEAPONS[ld.w] ? WEAPONS[ld.w].name : ld.w); for (i = 0; i < SLOTS.length; i++) { id = ld.eq[SLOTS[i]]; if (id && !S.res['arm_' + id + '_' + SLOTS[i]]) m.push(SLOT_NAME[SLOTS[i]] + (SETS[id] ? SETS[id].name : '')); } return m; }
function ldUse(i) {
  var ld = ldList()[i], j, id, miss = [];
  if (!ld || !ld.set) return false;
  if (ownsWeapon(ld.w) && WEAPONS[ld.w]) S.weapon = ld.w; else miss.push(WEAPONS[ld.w] ? WEAPONS[ld.w].name : ld.w);
  for (j = 0; j < SLOTS.length; j++) { id = ld.eq[SLOTS[j]]; if (id && SETS[id] && S.res['arm_' + id + '_' + SLOTS[j]]) S.eq[SLOTS[j]] = id; else { S.eq[SLOTS[j]] = ''; if (id) miss.push(SLOT_NAME[SLOTS[j]] + (SETS[id] ? SETS[id].name : '')); } }
  persist(); return miss;
}
function ldSave(i) { var ld = ldList()[i], j; if (!ld) return false; ld.set = true; ld.w = S.weapon; for (j = 0; j < SLOTS.length; j++) ld.eq[SLOTS[j]] = S.eq[SLOTS[j]] || ''; persist(); return true; }
function ldCard(i, view) {
  var ld = ldList()[i], act = ldActive() === i, j, h, miss, id;
  h = '<div class="bag-c" style="margin-bottom:8px;' + (act ? 'border-color:#d8b24a' : '') + '"><div style="display:flex;align-items:center;gap:8px"><span class="bag-nm" style="font-size:15px">ชุดที่ ' + (i + 1) + '</span>' + (act ? '<span class="chip" style="border-color:#d8b24a;color:#f0d98a">★ ใช้อยู่</span>' : '') + '</div>';
  if (!ld.set) {
    h += '<div class="bag-s" style="margin:6px 0">ว่าง — จัดอาวุธและเกราะที่ต้องการ แล้วกด "บันทึกชุดปัจจุบันลงช่องนี้"</div>';
  } else {
    miss = ldMissing(ld);
    h += '<div style="display:flex;align-items:center;gap:10px;margin:6px 0">' + uiImg(wIconKey(ld.w), 40, 'flex:none;max-width:48px;object-fit:contain') + '<div><div class="bag-nm">' + (WEAPONS[ld.w] ? WEAPONS[ld.w].name : ld.w) + '</div><div class="bag-s">';
    for (j = 0; j < SLOTS.length; j++) { id = ld.eq[SLOTS[j]]; h += SLOT_NAME[SLOTS[j]] + ': ' + (id && SETS[id] ? SETS[id].name : '—') + (j < 3 ? ' · ' : ''); }
    h += '</div></div></div><div class="bag-s" style="color:#cfe5d4">' + ldStatText(ld.eq) + '</div>';
    if (miss.length) h += '<div class="bag-s warn">ยังขาด: ' + miss.join(', ') + ' (จะข้ามชิ้นนี้ตอนสวม)</div>';
  }
  h += '<div class="row" style="margin-top:8px">' + (ld.set ? '<button class="' + (act ? 'tab' : 'big') + '" data-act="ld" data-arg="use:' + i + ':' + view + '">' + (act ? 'สวมอยู่' : 'ใช้ชุดนี้') + '</button>' : '') +
    '<button data-act="ld" data-arg="save:' + i + ':' + view + '">บันทึกชุดปัจจุบันลงช่องนี้</button>' + (ld.set ? '<button data-act="ld" data-arg="clr:' + i + ':' + view + '" style="font-size:12px;color:#9aa39a">ล้าง</button>' : '') + '</div></div>';
  return h;
}
function ldHtml() {
  var h = '<h2>ชุดอุปกรณ์ (Loadout)</h2><p style="font-size:13px;color:#9aa39a">บันทึกอาวุธ + เกราะทั้ง 4 ชิ้นไว้ ' + LD_N + ' ชุด สลับได้ทันทีก่อนออกล่า เช่น ชุดจับ / ชุดรักษา / ชุดสู้ตรง · อาวุธที่อัปเกรดไว้ยังคงสายที่เลือกเดิม</p>';
  h += '<div class="bag-c" style="margin-bottom:10px"><div class="bag-s">สวมอยู่ตอนนี้</div><div class="bag-nm">' + curW().name + ' · ' + armorName() + '</div><div class="bag-s" style="color:#cfe5d4">' + ldStatText(S.eq) + '</div></div>';
  for (var i = 0; i < LD_N; i++) h += ldCard(i, 'loadout');
  return h;
}
function ldQuick(view) {
  var h = '<div class="note" style="cursor:default"><b>ชุดอุปกรณ์:</b> ' + curW().name + ' · ' + armorName() + ' <span class="bag-s">(' + ldStatText(S.eq).replace(/<[^>]+>/g, '') + ')</span><div class="row" style="margin-top:6px">', i, a = ldActive();
  for (i = 0; i < LD_N; i++) if (ldList()[i].set) h += '<button class="tab' + (a === i ? ' on' : '') + '" data-act="ld" data-arg="use:' + i + ':' + view + '">ชุด ' + (i + 1) + ' · ' + (WEAPONS[ldList()[i].w] ? WEAPONS[ldList()[i].w].name.split(' ')[0] : '') + '</button>';
  return h + '<button class="tab" data-act="ldview">จัดชุดอุปกรณ์</button></div></div>';
}
function matChips() {
  var h = '';
  h += '<span class="chip" style="border-color:#b9962f;color:#ffd45a">เหรียญ ' + S.mats.coin + '</span>';
  for (var i = 0; i < MAT_KEYS.length; i++) if (MAT_KEYS[i] !== 'coin') h += '<span class="chip">' + MATS[MAT_KEYS[i]] + ' ×' + S.mats[MAT_KEYS[i]] + '</span>';
  return h;
}
function itemRow(id) {
  var c = CAT[id], owned = hasRes(id), locked = !!(c.req && !hasRes(c.req)), ok = canAfford(c.cost), right;
  if (owned) right = '<span class="good">มีแล้ว</span>';
  else if (locked) right = '<span class="warn">ต้องมี ' + CAT[c.req].name + ' ก่อน</span>';
  else if (c.clr && !(S.cleared && S.cleared[c.clr] >= 1)) right = '<span class="warn">ต้องเคยจบงานกับ' + (c.clr === 'rabbit' ? 'กระต่าย' : (c.clr === 'hive' ? 'ราชินีรัง' : c.clr)) + 'ก่อน</span>';
  else if (c.gate && forestMax() < c.gate) right = '<span class="warn">ป่าต้อง ≥' + c.gate + '%</span>';
  else right = '<button data-act="buy" data-arg="' + id + '" class="' + (ok ? '' : 'dim') + '">' + (ok ? 'ปลดล็อก' : 'วัสดุไม่พอ') + '</button>';
  return '<div class="item"><div>' + (id.indexOf('arm_') === 0 ? uiImg(id, 48, 'float:left;margin:0 8px 2px 0' + (owned ? '' : ';opacity:.55')) : '') + '<b>' + c.name + '</b><div class="d">' + c.desc + '</div>' +
    (owned ? '' : '<div class="c">ต้องใช้: ' + costHave(c.cost) + '</div>') + '</div><div>' + right + '</div></div>';
}
function skillRow(id) {
  var k = SKILLS[id], owned = hasSkill(id), ok = skillPts() >= k.cost, right;
  if (owned) right = '<span class="good">เรียนแล้ว</span>';
  else right = '<button data-act="skill" data-arg="' + id + '" class="' + (ok ? '' : 'dim') + '">' + (ok ? 'เรียนรู้' : 'แต้มไม่พอ') + '</button>';
  return '<div class="item"><div><b>' + k.name + '</b><div class="d">' + k.desc + '</div>' +
    (owned ? '' : '<div class="c">ใช้ ' + k.cost + ' แต้มทักษะ</div>') + '</div><div>' + right + '</div></div>';
}
var PREP_ACTS = {
  track: { name: 'สำรวจร่องรอย (ฟรี)', cost: 0, desc: 'ดูรอยเท้า รอยกัดกินพืช และมูลสัตว์ → ตัดอาการที่เป็นไปไม่ได้ออกหนึ่งอย่าง (เหลือ 2 ตัวเลือก)' },
  sample: { name: 'ตรวจวินิจฉัยตัวอย่างมูล/ขน — แนะนำ!', cost: 1, desc: 'วิเคราะห์ที่แล็บภาคสนาม → รู้อาการแน่ชัดและยาที่ตรง ตั้งแต่ก่อนสู้ (ไม่ต้องเสียเวลาสแกนกลางไฟต์) · จุดอ่อน +15% ตั้งแต่ต้น · ได้บันทึกชีพจรสำหรับคำนวณโดสยาสลบ · เฟสถัด ๆ ไป รักษาในสนามได้ผล 80% แม้ยังไม่สแกนซ้ำ (เดิม 60%)' },
  herbs: { name: 'เก็บสมุนไพรริมป่า', cost: 1, desc: 'ยาสมานแผลเพิ่ม 1 หลอด (เพิ่มเข้ากระเป๋า)' },
  route: { name: 'สอบถามชาวบ้านเรื่องเส้นทางหากิน', cost: 1, desc: 'ชาวบ้านเล่าว่ามันกิน-ดื่ม-นอนที่ไหน → มินิแมปแสดงจุดหากินและตำแหน่งของมันตลอดการลาดตระเวน' },
  warm: { name: 'วอร์มอัพและซ้อมจังหวะ', cost: 1, desc: 'เริ่มสู้ด้วย FLOW ×1 (อยู่ได้ประมาณ 12 วินาที)' }
};
var MED_DESC = { solvent: 'ละลายผลึกที่โคนเขา', antiinf: 'ลดการอักเสบของข้อและกล้ามเนื้อ', antibio: 'ฆ่าเชื้อบาดแผลที่ติดเชื้อ' };
function newPrep() {
  huntFires = 0;
  var ail = AIL_KEYS[Math.floor(Math.random() * 3)], others = AIL_KEYS.filter(function (k) { return k !== ail; });
  return { ail: ail, cand: others[Math.floor(Math.random() * 2)], candFirst: Math.random() < .5, pp: 3 + (hasRes('scanner2') ? 1 : 0), done: {}, res: {} };
}
function prepDo(id) {
  if (!PREP || !PREP_ACTS.hasOwnProperty(id) || PREP.done[id]) return;
  var a = PREP_ACTS[id];
  if (PREP.pp < a.cost) { openHub('prep', 'เวลาเตรียมตัวไม่พอสำหรับ "' + a.name + '"'); return; }
  PREP.pp -= a.cost; PREP.done[id] = true; sfx('scan');
  var c = PREP.candFirst ? [PREP.ail, PREP.cand] : [PREP.cand, PREP.ail];
  if (id === 'track') PREP.res.track = 'ร่องรอยบอกว่าน่าจะเป็น <b>' + AIL[c[0]].name + '</b> หรือ <b>' + AIL[c[1]].name + '</b> (ไม่ใช่อีกอย่างแน่นอน)';
  if (id === 'sample') PREP.res.sample = 'ผลตรวจตัวอย่าง: <b>' + AIL[PREP.ail].name + '</b> — ยาที่ตรงคือ <b>' + MEDS[AIL[PREP.ail].med] + '</b>';
  if (id === 'herbs') PREP.res.herbs = 'ได้สมุนไพรเพิ่ม — ยาสมานแผล +1 หลอด';
  if (id === 'route') PREP.res.route = 'ได้แผนที่เส้นทางหากินของมัน — ดูที่มินิแมประหว่างลาดตระเวน';
  if (id === 'warm') PREP.res.warm = 'ซ้อมจังหวะจนเข้าที่ — เริ่มสู้ด้วย FLOW ×1';
  openHub('prep', '');
}
function prepHtml() {
  if (!PREP) PREP = newPrep();
  var h = uiImg(pickKind(), 70, 'float:right;margin:0 0 6px 10px') + '<h2>เตรียมการก่อนออกล่า</h2><p style="font-size:13px;color:#9aa39a">' + monNameOf(pickKind(), pickVariant()) + ' กำลังป่วยด้วยอาการหนึ่งในสามอย่าง คุณมีเวลาเตรียมตัวจำกัด ข้อมูลที่หาได้จะบอกว่าควรใช้ยาอะไร — ของในกระเป๋าพกไปทั้งหมด ใช้แล้วหมดไป</p><div class="note">อาวุธที่ถือ: <b>' + curW().name + '</b> · เกราะ: ' + armorName() + ' · (เปลี่ยนอาวุธที่ช่างเครื่องมือ เปลี่ยนเกราะที่ช่างเกราะ)</div>' + gearCheckHtml();
  h += ldQuick('prep');
  var dots = ''; for (var i = 0; i < 3 + (hasRes('scanner2') ? 1 : 0); i++) dots += (i < PREP.pp ? '●' : '○') + ' ';
  h += '<div class="note">เวลาเตรียมตัวที่เหลือ: <b>' + dots + '</b></div>';
  h += '<h2 style="font-size:15px">สืบหาข้อมูลและวางแผน</h2>';
  if (!PREP.done.sample) h += '<div class="note">ยังไม่ได้ตรวจวินิจฉัย — ถ้าเข้าสู้โดยไม่รู้อาการ ต้องสแกนกลางไฟต์ซึ่งมอนสเตอร์ไม่รอ · <b>แนะนำตรวจตัวอย่างก่อน (ใช้เพียง 1)</b> หรือแอบสแกนด้วย Q ระหว่างลาดตระเวน</div>';
  for (var k in PREP_ACTS) {
    var a = PREP_ACTS[k], done = PREP.done[k], ok = PREP.pp >= a.cost;
    h += '<div class="item"><div><b>' + a.name + '</b> <span style="color:#9aa39a">(ใช้ ' + a.cost + ')</span><div class="d">' + a.desc + '</div>' +
      (done ? '<div class="good" style="font-size:13px;margin-top:3px">✓ ' + (PREP.res[k] || '') + '</div>' : '') + '</div><div>' +
      (done ? '<span class="good">เสร็จแล้ว</span>' : '<button data-act="prepdo" data-arg="' + k + '" class="' + (ok ? '' : 'dim') + '">' + (ok ? 'ทำ' : 'เวลาไม่พอ') + '</button>') + '</div></div>';
  }
  h += '<h2 style="font-size:15px;margin-top:14px">กระเป๋าไอเท็ม <span style="color:#9aa39a;font-weight:400">พกทุกอย่างที่มีในกระเป๋าไปทั้งหมด</span></h2>';
  var lowN = [];
  for (var ik in INV_ITEMS) { var iv = invN(ik), ic = invCap(ik), low = iv <= (ik === 'bait' || ik === 'snare' ? 0 : 1); if (low) lowN.push(INV_ITEMS[ik].name);
    h += '<div class="item"><div><b>' + INV_ITEMS[ik].name + '</b><div class="d">' + INV_ITEMS[ik].d + (ik === 'salve' && PREP.done.herbs ? ' · <span class="good">+1 จากสมุนไพร</span>' : '') + '</div></div><div><b class="' + (iv <= 0 ? 'warn' : '') + '" style="padding:0 8px">' + iv + ' / ' + ic + '</b></div></div>'; }
  h += '<div class="note">' + (lowN.length ? '<span class="warn">ของเหลือน้อย: ' + lowN.join(', ') + '</span> — ' : '') + 'ถ้าของไม่พอ ต้องกลับไปซื้อที่พ่อค้าพิมในหมู่บ้านก่อน (จ่ายด้วยเหรียญ) · ยาที่ยิงรักษาในสนามเป็นสต็อกเดียวกับยาตอน Treat ใช้ไปก็ลดลง</div>';
  h += '<div class="row" style="margin-top:12px"><button class="big" data-act="explore">ออกเดินทางลาดตระเวน</button><button data-act="village">กลับหมู่บ้าน</button></div>';
  return h;
}
