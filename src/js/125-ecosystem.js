/* ================= ECOSYSTEM (v18.4): 1 เขตป่า = 1 แมพ = 1 ระบบนิเวศ =================
   สถานะต่อเขต (stag / boar / rabbit):
   - สุขภาพป่า  S.forest[เขต]            (0–100 — มีมาก่อนหน้านี้ ใช้ต่อ)
   - ของที่เก็บแล้ว S.eco[เขต].picked[id] = จำนวนรอบล่า (S.hunts) ตอนที่เก็บ — พืช/หนังจะงอกใหม่หลังผ่านไป N รอบล่า
   ผลต่อภาคสนาม: ป่าดี = พืชงอกไว (1 รอบ) · ป่าเสื่อม = งอกช้า (3 รอบ) และมีหย่อมสปอร์เพิ่ม/วงสปอร์กว้างขึ้น
   มอนสเตอร์ผู้บุกรุก (หมาป่า/ราชินีรัง) ไปปรากฏในเขตที่ป่าอ่อนแอที่สุด และผลการล่าตกที่เขตนั้นเป็นหลัก */
var huntRegion = '';
function regionKeys() { var ks = ['stag']; if (S && S.wins >= 1) ks.push('boar'); if (S && S.wins >= 2) ks.push('rabbit'); return ks; }
function regionFor(kind) {
  if (kind === 'stag' || kind === 'fawn' || kind === 'boar' || kind === 'rabbit') return spOf(kind);
  var ks = regionKeys(), best = ks[0], i;
  for (i = 1; i < ks.length; i++) if (forestOf(ks[i]) < forestOf(best)) best = ks[i];
  return best;
}
function huntRegionKey() { return huntRegion || spOf(huntKind); }
function ecoOf(r) {
  if (!S.eco || typeof S.eco !== 'object') S.eco = {};
  if (!S.eco[r] || typeof S.eco[r] !== 'object') S.eco[r] = {};
  if (!S.eco[r].picked || typeof S.eco[r].picked !== 'object') S.eco[r].picked = {};
  return S.eco[r];
}
function ecoRegrow(r) { var v = forestOf(r); return v >= 70 ? 1 : (v >= 30 ? 2 : 3); } /* จำนวนรอบล่าที่พืช/หนังต้องรอก่อนงอกใหม่ */
function ecoHazard(r) { return clamp(1 + (40 - forestOf(r)) / 100, .7, 1.4); }       /* ตัวคูณขนาดวงสปอร์หลักของแมพ */
function ecoPickable(id) { return id.indexOf('plant_') === 0 || id.indexOf('shed') === 0; }
function ecoPlantKind(id) { return id.indexOf('plant_') === 0 ? id.split('_')[1].replace(/\d+$/, '') : (id.indexOf('shed') === 0 ? 'shed' : ''); }
/* จุดเก็บของที่ใช้ได้ในรอบนี้ (กรองจุดที่เก็บไปแล้วและยังไม่งอก · กันของขาดมือ: ทุกชนิดต้องเหลืออย่างน้อย 1 จุด) */
function ecoSigns(d, r) {
  var eco = ecoOf(r), need = ecoRegrow(r), hunts = S.hunts || 0, keep = {}, held = [], kinds = {}, i, q, id, kd, k;
  for (i = 0; i < d.signs.length; i++) {
    q = d.signs[i]; id = q.id;
    if (ecoPickable(id) && typeof eco.picked[id] === 'number' && hunts - eco.picked[id] < need) held.push(q); else keep[id] = true;
  }
  for (i = 0; i < d.signs.length; i++) { kd = ecoPlantKind(d.signs[i].id); if (kd) { kinds[kd] = kinds[kd] || { any: false, best: null }; if (keep[d.signs[i].id]) kinds[kd].any = true; } }
  for (i = 0; i < held.length; i++) {
    kd = ecoPlantKind(held[i].id);
    if (kinds[kd] && !kinds[kd].any && (!kinds[kd].best || eco.picked[held[i].id] < eco.picked[kinds[kd].best.id])) kinds[kd].best = held[i];
  }
  for (k in kinds) if (!kinds[k].any && kinds[k].best) keep[kinds[k].best.id] = true;
  var list = [];
  for (i = 0; i < d.signs.length; i++) if (keep[d.signs[i].id]) list.push(copyPt(d.signs[i]));
  return { list: list, held: d.signs.length - list.length };
}
/* หย่อมสปอร์ลอยอยู่ตามแมพเมื่อป่าเสื่อม (ตำแหน่งสุ่มแต่คงที่ต่อเขต+รอบล่า) */
function ecoPatches(r, d) {
  var v = forestOf(r), n = v < 20 ? 5 : (v < 30 ? 3 : (v < 40 ? 1 : 0)), out = [], seed = 7919 + (S.hunts || 0) * 131, tries = 0, i, j;
  for (i = 0; i < r.length; i++) seed += r.charCodeAt(i) * (i + 3);
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  var sit = d.sites;
  while (out.length < n && tries++ < 160) {
    var x = 220 + rnd() * (d.w - 440), y = 220 + rnd() * (d.h - 440), pr = 52 + rnd() * 26, ok = true, q;
    for (j = 0; ok && j < d.camps.length; j++) if (dist(x, y, d.camps[j].x, d.camps[j].y) < 300) ok = false;
    for (j = 0; ok && j < d.signs.length; j++) if (dist(x, y, d.signs[j].x, d.signs[j].y) < 120 + pr) ok = false;
    if (ok && (dist(x, y, d.drink.x, d.drink.y) < 220 || dist(x, y, d.rest.x, d.rest.y) < 220)) ok = false;
    if (ok && Math.pow((x - sit.water.x) / (sit.water.rx + pr), 2) + Math.pow((y - sit.water.y) / (sit.water.ry + pr), 2) < 1) ok = false;
    if (ok && dist(x, y, sit.bloom.x, sit.bloom.y) < sit.bloom.r + pr + 60) ok = false;
    if (ok && dist(x, y, sit.den.x, sit.den.y) < sit.den.r + pr) ok = false;
    for (j = 0; ok && j < out.length; j++) { q = out[j]; if (dist(x, y, q.x, q.y) < pr + q.r + 60) ok = false; }
    if (ok) out.push({ x: Math.round(x), y: Math.round(y), r: Math.round(pr) });
  }
  return out;
}
/* ผลต่อเขตหลักมากกว่าเขตอื่น (ใช้กับมอนสเตอร์ผู้บุกรุกและไฟป่า) */
function ecoSpread(hr, mainDelta, otherDelta) {
  for (var i = 0; i < SPECIES.length; i++) { var k = SPECIES[i]; S.forest[k] = clamp(forestOf(k) + (k === hr ? mainDelta : otherDelta), 0, 100); }
}
/* คำเตือนด่านตรวจอุปกรณ์ของเควสปัจจุบัน (แสดงในหน้าแผนที่ป่า/เตรียมออกล่า) */
function gearCheckHtml() {
  if (!S) return '';
  var q = curQuest(), tier = q ? (q.tier === 'E' ? 3 : q.tier) : (pickVariant() === 1 ? 2 : 1), tb = BAL.tier[tier] || BAL.tier[1], rom = ['I', 'II', 'III'], h = '';
  if (tier <= 1 && !(q && q.tier === 1 && pickVariant() === 1)) return '';
  if ((S.wk || 1) < tb.mk) h += '<span class="warn">⚠ ผิวมอนสเตอร์แกร่ง: ต้องมีชุดอาวุธ Mk.' + rom[tb.mk - 1] + ' (ตอนนี้ Mk.' + rom[(S.wk || 1) - 1] + ' → ดาเมจที่ทำได้ −' + Math.round((1 - Math.pow(BAL.dull, tb.mk - (S.wk || 1))) * 100) + '%)</span> ';
  if (tb.grace) h += '<span style="color:#ffb066">ยิ่งสู้เกิน ~' + Math.round(tb.grace * BAL.graceDiff[S.set ? clamp(Math.round(+S.set.diff), 0, 2) : 1]) + ' วิ มันยิ่งคลั่ง (ดาเมจ +' + Math.round(BAL.rageDmg * 100) + '% และท่าเร็วขึ้นทุก ' + BAL.rageStep + ' วิ)</span> ';
  var dr = Math.round((1 - armorTaken()) * 100), hp = armSum('hp');
  h += '<span style="color:#9fe8ff">เกราะตอนนี้ลดดาเมจ ' + dr + '%' + (hp ? ' · HP +' + hp : '') + '</span>';
  return '<p style="font-size:12px;margin:4px 0">' + h + '</p>';
}/* บรรทัดสรุปเขตของภารกิจปัจจุบัน (หน้าแผนที่ป่า) */
function regionLineHtml() {
  if (!S) return '';
  var k = pickKind(), r = regionFor(k), v = Math.round(forestOf(r)), mp = MAPS[r], inv = (k === 'wolf' || k === 'hive');
  return '<p style="font-size:12px;color:#9fe8ff">เขตที่จะออกไป: <b>' + mp.name + '</b> (' + mp.kind + ') · ป่า ' + v + '% · พืช/หนังงอกใหม่ใน ' + ecoRegrow(r) + ' รอบล่า' + (inv ? ' · ผู้บุกรุกไปปรากฏในเขตที่ป่าอ่อนแอที่สุด' : '') + '</p>' + gearCheckHtml();
}
