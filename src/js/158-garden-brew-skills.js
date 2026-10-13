function plotCap() { return 3 + (hasRes('plot4') ? 1 : 0); }
function plotReady(pl) { return !!pl && S.hunts - pl.t >= GARDEN_GROW; }
function gardenYield() { return 3 + (forestMax() >= 70 ? 1 : 0); }
function gardenAct(arg) {
  var a = String(arg || '').split(':'), op = a[0], i = Math.round(+a[1]), cap = plotCap();
  if (!(i >= 0 && i < cap)) return;
  while (S.plots.length < cap) S.plots.push('');
  var pl = S.plots[i];
  if (op === 'plant') {
    var h = a[2]; if (HERBS.indexOf(h) < 0 || pl) return;
    if ((S.mats.coin || 0) < 4) { openHub('garden', 'เหรียญไม่พอซื้อเมล็ดพันธุ์ (4 เหรียญ)'); return; }
    S.mats.coin -= 4; S.plots[i] = { h: h, t: S.hunts }; persist(); sfx('scan'); openHub('garden', 'ปลูก' + MATS[h] + 'ในแปลง ' + (i + 1) + ' แล้ว — อีก ' + GARDEN_GROW + ' การล่าก็เก็บได้');
  } else if (op === 'harvest') {
    if (!pl || !plotReady(pl)) return;
    var y = gardenYield(); S.mats[pl.h] = Math.min(9999, (S.mats[pl.h] || 0) + y); var nm = MATS[pl.h]; S.plots[i] = ''; persist(); sfx('heal'); openHub('garden', 'เก็บเกี่ยว' + nm + ' ×' + y);
  } else if (op === 'clear') {
    if (!pl) return; S.plots[i] = ''; persist(); sfx('scan'); openHub('garden', 'รื้อแปลง ' + (i + 1) + ' แล้ว');
  }
}
function gardenHtml() {
  var cap = plotCap(), h = '<h2>ลานเพาะปลูก</h2><p style="font-size:13px;color:#9aa39a">ซื้อเมล็ดพันธุ์ 4 เหรียญต่อแปลง · ปลูกแล้วต้องผ่านการล่าอีก ' + GARDEN_GROW + ' ครั้งถึงจะเก็บเกี่ยวได้ · ผลผลิต ' + gardenYield() + ' ต้นต่อแปลง' + (forestMax() >= 70 ? ' (ป่าฟื้นตัวดี +1)' : ' (ป่าฟื้นตัว ≥70% ได้ +1)') + '</p>';
  while (S.plots.length < cap) S.plots.push('');
  for (var i = 0; i < cap; i++) {
    var pl = S.plots[i];
    h += '<div class="item" style="display:block"><div><b>แปลงที่ ' + (i + 1) + '</b> ';
    if (!pl) { h += '<span style="color:#9aa39a">ว่าง</span></div><div class="row" style="margin-top:6px">'; for (var k = 0; k < HERBS.length; k++) h += '<button data-act="garden" data-arg="plant:' + i + ':' + HERBS[k] + '" class="' + ((S.mats.coin || 0) >= 4 ? '' : 'dim') + '">ปลูก' + MATS[HERBS[k]] + '</button>'; h += '</div>'; }
    else if (plotReady(pl)) h += '<span class="good">' + MATS[pl.h] + ' พร้อมเก็บเกี่ยว!</span></div><div style="margin-top:6px"><button data-act="garden" data-arg="harvest:' + i + '">เก็บเกี่ยว ×' + gardenYield() + '</button></div>';
    else h += '<span class="warn">' + MATS[pl.h] + ' กำลังโต — อีก ' + (GARDEN_GROW - (S.hunts - pl.t)) + ' การล่า</span></div><div style="margin-top:6px"><button class="tab" data-act="garden" data-arg="clear:' + i + '">รื้อแปลง</button></div>';
    h += '</div>';
  }
  for (var ck in CAT) if (CAT[ck].tab === 'garden') h += itemRow(ck);
  return h;
}
function brewMed(arg) {
  var a = String(arg || '').split(':'), k = a[0], n = a[1] === 'max' ? 99 : (+a[1] === 1 ? 1 : 0);
  if (!BREW.hasOwnProperty(k) || !INV_ITEMS.hasOwnProperty(k) || !n) return;
  var cap = invCap(k), made = 0, rc = BREW[k];
  while (made < n && invN(k) < cap && canAfford(rc)) { for (var ck in rc) S.mats[ck] -= rc[ck]; S.inv[k] = invN(k) + 1; made++; }
  if (!made) { openHub('lab', invN(k) >= cap ? INV_ITEMS[k].name + ' เต็มกระเป๋าแล้ว' : 'วัตถุดิบไม่พอสำหรับ ' + INV_ITEMS[k].name); return; }
  persist(); sfx('heal'); openHub('lab', 'ผสม ' + INV_ITEMS[k].name + ' +' + made + ' (มี ' + invN(k) + '/' + cap + ')');
}
function brewHtml() {
  var h = '<h2 style="font-size:15px;margin-top:14px">โต๊ะผสมยา</h2><p style="font-size:13px;color:#9aa39a">ผสมยาเองจากสมุนไพร (เก็บในป่าระหว่างลาดตระเวน หรือปลูกที่ลานเพาะปลูก) แทนการซื้อ — ผลิตเข้ากระเป๋าโดยตรง</p>';
  for (var k in BREW) { var it = INV_ITEMS[k], n = invN(k), cap = invCap(k), full = n >= cap, ok = canAfford(BREW[k]);
    h += '<div class="item"><div><b>' + it.name + '</b> <span style="color:#9aa39a">มี ' + n + ' / ' + cap + '</span><div class="d">สูตร: ' + costHave(BREW[k]) + ' → +1</div></div><div>' +
      (full ? '<span class="good">เต็ม</span>' : '<button data-act="brew" data-arg="' + k + ':1" class="' + (ok ? '' : 'dim') + '">ผสม +1</button> <button data-act="brew" data-arg="' + k + ':max" class="' + (ok ? '' : 'dim') + '">ผสมให้เต็ม</button>') + '</div></div>'; }
  return h;
}
function sellMat(arg) {
  var a = String(arg || '').split(':'), k = a[0], n = a[1] === 'all' ? 99999 : (+a[1] === 1 ? 1 : 0);
  if (!SELL_PRICE.hasOwnProperty(k) || !n) return;
  var have = S.mats[k] || 0, q = Math.min(have, n); if (q <= 0) { openHub('shop', 'ไม่มี' + MATS[k] + 'ให้ขาย'); return; }
  S.mats[k] = have - q; S.mats.coin = Math.min(9999, (S.mats.coin || 0) + q * SELL_PRICE[k]); persist(); sfx('heal');
  openHub('shop', 'ขาย ' + MATS[k] + ' ×' + q + ' ได้ ' + (q * SELL_PRICE[k]) + ' เหรียญ');
}
function sellHtml() {
  var h = '<h2 style="font-size:15px;margin-top:14px">รับซื้อวัสดุ</h2><p style="font-size:13px;color:#9aa39a">วัสดุที่ไม่ได้ใช้ขายเป็นเหรียญได้ — ระวังอย่าขายของที่ต้องใช้ตีอาวุธ/เกราะ</p>', any = false;
  for (var k in SELL_PRICE) { var n = S.mats[k] || 0; if (n <= 0) continue; any = true;
    h += '<div class="item"><div><b>' + MATS[k] + '</b> <span style="color:#9aa39a">มี ' + n + ' · ชิ้นละ ' + SELL_PRICE[k] + ' เหรียญ</span></div><div><button data-act="sell" data-arg="' + k + ':1">ขาย 1</button> <button data-act="sell" data-arg="' + k + ':all">ขายทั้งหมด</button></div></div>'; }
  if (!any) h += '<p class="d">ยังไม่มีวัสดุให้ขาย</p>';
  return h;
}
function skillReq(k) { return k.tier >= 2 ? SK_TIER2 : 0; }
function skillCan(id) {
  var k = SKILLS[id], lv = skillLv(id);
  if (!k) return 'bad'; if (lv >= k.max) return 'max';
  if (brSpent(k.br) < skillReq(k)) return 'lock';
  if (skillPts() < k.cost) return 'pts';
  return '';
}
function buySkill(id) {
  var k = SKILLS[id], why = skillCan(id);
  if (!k || why === 'bad' || why === 'max') return;
  if (why === 'lock') { openHub('skills', 'ต้องลงแต้มในสายนี้ให้ครบ ' + SK_TIER2 + ' แต้มก่อน'); return; }
  if (why === 'pts') { openHub('skills', 'แต้มทักษะไม่พอ — เลื่อนขั้น ปิดสมุดบันทึก หรือทำภารกิจประจำวันเพื่อรับเพิ่ม'); return; }
  S.skills[id] = skillLv(id) + 1; persist(); sfx('heal');
  openHub('skills', (skillLv(id) > 1 ? 'อัปเป็น ' : 'เรียนรู้ ') + k.name + (k.max > 1 ? ' Lv' + skillLv(id) : '') + ' แล้ว');
}
var SKILL_RESET_COST = 60, skillArm = false;
function skillReset() {
  if (!skillSpent()) { openHub('skills', 'ยังไม่ได้ลงแต้มทักษะ'); return; }
  if (S.mats.coin < SKILL_RESET_COST) { skillArm = false; openHub('skills', 'เหรียญไม่พอสำหรับล้างทักษะ (ต้อง ' + SKILL_RESET_COST + ')'); return; }
  if (!skillArm) { skillArm = true; openHub('skills', 'กดอีกครั้งเพื่อยืนยัน — ล้างทักษะทั้งหมดและคืนแต้มครบ (เสีย ' + SKILL_RESET_COST + ' เหรียญ)'); return; }
  skillArm = false; S.mats.coin -= SKILL_RESET_COST; S.skills = {}; persist(); sfx('scan');
  openHub('skills', 'ล้างทักษะแล้ว คืน ' + skillTotal() + ' แต้มให้จัดสายใหม่');
}
function skillRow(id) {
  var k = SKILLS[id], lv = skillLv(id), why = skillCan(id), pips = '', i, right;
  for (i = 0; i < k.max; i++) pips += (i < lv ? '●' : '○');
  if (why === 'max') right = '<span class="good">เต็มแล้ว</span>';
  else if (why === 'lock') right = '<button class="dim" data-act="skill" data-arg="' + id + '">ล็อก</button>';
  else right = '<button data-act="skill" data-arg="' + id + '" class="' + (why ? 'dim' : '') + '">' + (why ? 'แต้มไม่พอ' : (lv ? 'อัปเลเวล' : 'เรียนรู้')) + ' · ' + k.cost + ' แต้ม</button>';
  return '<div class="item"><div><b>' + k.name + '</b> <span style="color:#d8b24a;letter-spacing:2px">' + pips + '</span><div class="d">' + k.desc + (why === 'lock' ? ' · <span class="warn">ต้องมี ' + SK_TIER2 + ' แต้มในสายนี้ก่อน</span>' : '') + '</div></div><div>' + right + '</div></div>';
}
function skillsHtml() {
  var h = '<h2>ทักษะ Warden</h2><p style="font-size:13px;color:#9aa39a">แต้มคงเหลือ <b style="color:#ffd45a">' + skillPts() + '</b> / ทั้งหมด ' + skillTotal() + ' · ได้จาก: เลื่อนยศ (' + rankSkillPts(rankIdx()) + ') · ดาวสมุดบันทึกสนาม (' + jrStamps() + ') · ภารกิจประจำวันครบทุก 5 วัน (' + Math.floor((S.dclears || 0) / 5) + ')</p>', b, k, i;
  for (i = 0; i < SK_BRANCH_KEYS.length; i++) {
    b = SK_BRANCH_KEYS[i]; h += '<div class="bag-h"><span>' + SK_BRANCH[b].name + '</span><span class="ct">' + SK_BRANCH[b].d + ' · ลงแล้ว ' + brSpent(b) + ' แต้ม' + (brSpent(b) >= SK_TIER2 ? ' · ปลดล็อกขั้น 2' : '') + '</span></div>';
    for (k in SKILLS) if (SKILLS[k].br === b) h += skillRow(k);
  }
  h += '<div class="row" style="margin-top:10px"><button data-act="skillreset">' + (skillArm ? 'ยืนยันล้างทักษะ' : 'ล้างทักษะ (' + SKILL_RESET_COST + ' เหรียญ)') + '</button></div>';
  return h;
}

