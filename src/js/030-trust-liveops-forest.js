/* ===== ความไว้ใจรายสายพันธุ์ (วาเดน ↔ สัตว์ป่า) ===== */
var TRUST_DELTA = { capture_ok: 8, capture_under: 1, capture_over: -2, treat_full: 10, treat_part: 5, treat_wrong: -3, eliminate: -8, defeat: 0 };
function trustOf(k) { var v = S && S.trust ? S.trust[spOf(k)] : 20; return typeof v === 'number' && isFinite(v) ? v : 20; }
function trustAdd(k, d) { if (!S) return 0; if (!S.trust) S.trust = { stag: 20, boar: 20, rabbit: 20 }; var f = spOf(k), a = trustOf(f); S.trust[f] = clamp(a + d, 0, 100); return Math.round(S.trust[f] - a); }
function trustTier(v) { return v >= 90 ? 'ผูกพัน' : (v >= 70 ? 'ไว้ใจ' : (v >= 45 ? 'คุ้นเคย' : (v >= 20 ? 'ระแวง' : 'หวาดกลัว'))); }
function trustMul(k) { var v = trustOf(k); return v >= 90 ? 1.2 : (v >= 70 ? 1.1 : 1); }
function trustPerk(v) { return v >= 90 ? 'ผูกพัน: รางวัลเหรียญ +20% · สัตว์ป่ามาเดินเล่นใกล้หมู่บ้านที่สุด' : (v >= 70 ? 'ไว้ใจ: รางวัลเหรียญ +10% · สัตว์ป่าโผล่ที่รั้วหมู่บ้าน' : (v >= 45 ? 'คุ้นเคย: เริ่มมีร่างสัตว์ป่าเฝ้ามองจากขอบหมู่บ้าน' : (v >= 20 ? 'ระแวง: ยังไม่มีผลพิเศษ' : 'หวาดกลัว: สัตว์ป่าหลบหน้าวาเดน — ปล่อยสัตว์ฟื้นตัวหรือรักษาให้สำเร็จเพื่อกู้ความไว้ใจ'))); }
function trustHtml() {
  var h = '<div class="item"><div style="width:100%"><b>ความไว้ใจของสัตว์ป่า</b><div class="d">จับ/รักษาสำเร็จและปล่อยสัตว์กลับป่า = ไว้ใจเพิ่ม · ฆ่าหรือรักษาผิด = ไว้ใจลด · ผลที่เห็นได้ในหมู่บ้านและรางวัลเหรียญ</div>', ks = ['stag'], i, k, v, col;
  if (S.wins >= 1) ks.push('boar'); if (S.wins >= 2) ks.push('rabbit');
  for (i = 0; i < ks.length; i++) { k = ks[i]; v = Math.round(trustOf(k)); col = v >= 70 ? '#7fe0b5' : (v >= 45 ? '#e8d86a' : (v >= 20 ? '#e8a05a' : '#e86a5a'));
    h += '<div class="d">' + REGIONS[k].kind + ' · <b>' + trustTier(v) + '</b> ' + v + '/100</div><div style="height:6px;background:#1a2a20;border-radius:3px;margin:3px 0 4px"><div style="height:6px;width:' + v + '%;background:' + col + ';border-radius:3px"></div></div><div class="d" style="font-size:12px;color:#8a948a">' + trustPerk(v) + '</div>'; }
  return h + '</div></div>';
}
/* ===== LIVE-OPS v14.5: daily goals, forest mutators, field journal ===== */
var dayOverride = '';
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function todayKey() { if (dayOverride) return dayOverride; var d = new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function dayShift(key, n) { var a = String(key).split('-'), d = new Date(+a[0], (+a[1] || 1) - 1, (+a[2] || 1) + n); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function dayRng(key, salt) { var h = 2166136261, str = key + '|' + salt, i; for (i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return function () { h = (h + 0x6D2B79F5) >>> 0; var t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
var MUT_KEYS = ['bounty', 'tough', 'frail', 'bloom', 'calm'];
var MUTATORS = {
  bounty: { name: 'ป่าอุดมสมบูรณ์', desc: 'ชาวบ้านเพิ่มค่าตอบแทน — เหรียญจากการล่า ×1.35', coin: 1.35 },
  tough: { name: 'สัตว์ฮึดสู้', desc: 'เชื้อทำให้สัตว์ทนขึ้น HP +20% แต่ Rank XP ×1.25', hp: 1.2, xp: 1.25 },
  frail: { name: 'ป่าแห้งแล้ง', desc: 'สัตว์อ่อนแรง HP −15% แต่เหรียญ ×0.9 — วันเหมาะซ้อมมือ/ทำเกรดสูง', hp: .85, coin: .9 },
  bloom: { name: 'Bloomrot ระบาด', desc: 'เชื้อเข้มข้น — ได้ผลึกเพิ่ม +1 เมื่อปิดงานสำเร็จ', crystal: 1 },
  calm: { name: 'ป่าสงบ', desc: 'สัตว์เปิดใจง่าย — ความไว้ใจที่ได้เพิ่ม ×1.5', trust: 1.5 }
};
function mutId(key) { var r = dayRng(key || todayKey(), 'mut'); return MUT_KEYS[Math.floor(r() * MUT_KEYS.length)]; }
function mutNow() { var id = mutId(); var m = MUTATORS[id]; m.id = id; return m; }
function mutFx(k) { var v = mutNow()[k]; return v === undefined ? 1 : v; }
function mutTrust(d) { return d > 0 ? Math.round(d * mutFx('trust') * (1 + .25 * skillLv('gentle'))) : d; }
function applyMut(m) { if (m && m.kind !== 'fawn') { var h = mutFx('hp'); if (h !== 1) { m.hp = m.maxHp = Math.round(m.maxHp * h); } } return m; }
var GOAL_DEFS = {
  clear2: { name: 'ปิดงานสำเร็จ 2 ครั้ง', need: 2, hit: function (c) { return c.win ? 1 : 0; } },
  heal: { name: 'รักษาสัตว์จนหายสนิท (Full Cure)', need: 1, hit: function (c) { return c.kind === 'treat_full' ? 1 : 0; } },
  capture: { name: 'จับด้วยยาสลบพอดีโดส', need: 1, hit: function (c) { return c.kind === 'capture_ok' ? 1 : 0; } },
  nohit: { name: 'ชนะโดยโดนโจมตีไม่เกิน 6 ครั้ง', need: 1, hit: function (c) { return c.win && c.stats.taken <= 6 ? 1 : 0; } },
  fast: { name: 'ปิดงานภายใน 2 นาที', need: 1, hit: function (c) { return c.win && c.stats.time <= 120 ? 1 : 0; } },
  rank: { name: 'ได้เกรด A ขึ้นไป', need: 1, hit: function (c) { return c.win && (c.rank === 'A' || c.rank === 'S') ? 1 : 0; } },
  sp_stag: { name: 'ปิดงานกับ Rothorn Stag', need: 1, hit: function (c) { return c.win && c.sp === 'stag' ? 1 : 0; } },
  sp_boar: { name: 'ปิดงานกับ Thornback Boar', need: 1, hit: function (c) { return c.win && c.sp === 'boar' ? 1 : 0; } },
  sp_rabbit: { name: 'ปิดงานกับ Bramble Hare', need: 1, hit: function (c) { return c.win && c.sp === 'rabbit' ? 1 : 0; } }
};
function goalPool() { var p = ['clear2', 'heal', 'capture', 'nohit', 'fast', 'rank', 'sp_stag']; if (S.wins >= 1) p.push('sp_boar'); if (S.wins >= 2) p.push('sp_rabbit'); return p; }
function dailyGoals() { var r = dayRng(todayKey(), 'goal'), pool = goalPool(), out = [], i; for (i = 0; i < 3 && pool.length; i++) { var j = Math.floor(r() * pool.length); out.push(pool.splice(j, 1)[0]); } return out; }
function dailyEnsure() {
  var k = todayKey();
  if (!S.daily || S.daily.day !== k) { S.daily = { day: k, goals: dailyGoals(), prog: {}, done: false }; }
  if (!S.daily.goals || S.daily.goals.length !== 3) S.daily.goals = dailyGoals();
  return S.daily;
}
function dailyDone() { var d = dailyEnsure(), i, n = 0; for (i = 0; i < d.goals.length; i++) if ((d.prog[d.goals[i]] || 0) >= GOAL_DEFS[d.goals[i]].need) n++; return n; }
function dailyUpdate(kind, rank, sp, stats) {
  var d = dailyEnsure(), win = kind === 'eliminate' || kind === 'treat_full' || kind === 'treat_part' || kind === 'capture_ok', c = { kind: kind, rank: rank, sp: sp, win: win, stats: stats }, i, note = '';
  for (i = 0; i < d.goals.length; i++) { var g = d.goals[i], def = GOAL_DEFS[g]; if (def && (d.prog[g] || 0) < def.need) d.prog[g] = Math.min(def.need, (d.prog[g] || 0) + def.hit(c)); }
  if (!d.done && dailyDone() >= 3) {
    d.done = true; S.dclears = (S.dclears || 0) + 1;
    var ds = S.dstreak || (S.dstreak = { n: 0, last: '' });
    ds.n = ds.last === dayShift(d.day, -1) ? ds.n + 1 : (ds.last === d.day ? ds.n : 1); ds.last = d.day;
    var coin = 100 + 15 * Math.min(ds.n, 7);
    S.mats.coin = clamp(S.mats.coin + coin, 0, 9999); S.mats.crystal = clamp(S.mats.crystal + 2, 0, 9999); S.mats.blood = clamp(S.mats.blood + 2, 0, 9999);
    note = '<p class="good"><b>ภารกิจประจำวันครบ 3/3!</b> เหรียญ +' + coin + ' · ผลึก +2 · เลือดสด +2 · ต่อเนื่อง ' + ds.n + ' วัน</p>';
  } else if (win) {
    note = '<p style="font-size:12.5px;color:#9aa39a">ภารกิจประจำวัน ' + dailyDone() + '/3</p>';
  }
  return note;
}
var JR_KEYS = ['stag', 'boar', 'rabbit', 'wolf', 'hive'];
var JR_OUT = ['capture_ok', 'treat_full', 'eliminate'];
function jrBlank() { return { n: 0, o: {}, ail: {}, st: { a: false, b: false, c: false } }; }
function jrAll() { var o = {}, i; for (i = 0; i < JR_KEYS.length; i++) o[JR_KEYS[i]] = jrBlank(); return o; }
function jrWins(e) { return (e.o.capture_ok || 0) + (e.o.treat_full || 0) + (e.o.treat_part || 0) + (e.o.eliminate || 0); }
function jrStatus(e) {
  var na = 0, nb = 0, i; for (i = 0; i < AIL_KEYS.length; i++) if (e.ail[AIL_KEYS[i]]) na++;
  for (i = 0; i < JR_OUT.length; i++) if (e.o[JR_OUT[i]]) nb++;
  return { a: na, b: nb, c: jrWins(e) };
}
function jrUpdate(k, kind, ail) {
  if (!S.jr) S.jr = jrAll(); var e = S.jr[k]; if (!e) return ''; e.n++; e.o[kind] = (e.o[kind] || 0) + 1; if (kind !== 'defeat' && ail && AIL[ail]) e.ail[ail] = 1;
  var st = jrStatus(e), note = '', nm = monNameOf(k, 0);
  if (!e.st.a && st.a >= 3) { e.st.a = true; S.mats.crystal = clamp(S.mats.crystal + 3, 0, 9999); S.mats.blood = clamp(S.mats.blood + 2, 0, 9999); note += '<p class="good"><b>สมุดบันทึก ' + nm + ':</b> พบครบทั้ง 3 อาการ — ผลึก +3 · เลือดสด +2</p>'; }
  if (!e.st.b && st.b >= 3) { e.st.b = true; S.mats.coin = clamp(S.mats.coin + 150, 0, 9999); note += '<p class="good"><b>สมุดบันทึก ' + nm + ':</b> ครบทั้ง จับ/รักษา/กำจัด — เหรียญ +150</p>'; }
  if (!e.st.c && st.c >= 5) { e.st.c = true; S.mats.coin = clamp(S.mats.coin + 100, 0, 9999); S.mats.hide = clamp(S.mats.hide + 3, 0, 9999); note += '<p class="good"><b>สมุดบันทึก ' + nm + ':</b> ปิดงานสำเร็จครบ 5 ครั้ง — เหรียญ +100 · หนัง +3</p>'; }
  return note;
}
function sanitizeLive(o, s) {
  var i, k, g;
  if (o.daily && typeof o.daily === 'object' && typeof o.daily.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.daily.day)) {
    var d = { day: o.daily.day, goals: [], prog: {}, done: !!o.daily.done };
    if (Array.isArray(o.daily.goals)) for (i = 0; i < o.daily.goals.length && d.goals.length < 3; i++) if (GOAL_DEFS.hasOwnProperty(o.daily.goals[i]) && d.goals.indexOf(o.daily.goals[i]) < 0) d.goals.push(o.daily.goals[i]);
    for (g in GOAL_DEFS) if (o.daily.prog && o.daily.prog[g] > 0) d.prog[g] = clamp(Math.round(+o.daily.prog[g]), 0, GOAL_DEFS[g].need);
    if (d.goals.length === 3) s.daily = d;
  }
  if (Array.isArray(o.ld)) for (i = 0; i < LD_N && i < o.ld.length; i++) { var lo = o.ld[i]; if (lo && typeof lo === 'object' && lo.set === true && typeof lo.w === 'string' && WEAPONS.hasOwnProperty(lo.w)) { var le = s.ld[i]; le.set = true; le.w = lo.w; for (g = 0; g < SLOTS.length; g++) { var lv = lo.eq && lo.eq[SLOTS[g]]; le.eq[SLOTS[g]] = (typeof lv === 'string' && SETS.hasOwnProperty(lv)) ? lv : ''; } } }
  s.dclears = clamp(Math.round(+o.dclears || 0), 0, 99999);
  if (o.gift && typeof o.gift === 'object') for (i = 0; i < SPECIES.length; i++) if (typeof o.gift[SPECIES[i]] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.gift[SPECIES[i]])) s.gift[SPECIES[i]] = o.gift[SPECIES[i]];
  if (o.dstreak && typeof o.dstreak === 'object') s.dstreak = { n: clamp(Math.round(+o.dstreak.n || 0), 0, 9999), last: (typeof o.dstreak.last === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.dstreak.last)) ? o.dstreak.last : '' };
  if (o.jr && typeof o.jr === 'object') for (i = 0; i < JR_KEYS.length; i++) {
    k = JR_KEYS[i]; var jo = o.jr[k]; if (!jo || typeof jo !== 'object') continue; var e = s.jr[k], oc;
    e.n = clamp(Math.round(+jo.n || 0), 0, 99999);
    for (oc in OUT) if (jo.o && jo.o[oc] > 0) e.o[oc] = clamp(Math.round(+jo.o[oc]), 0, 99999);
    for (g = 0; g < AIL_KEYS.length; g++) if (jo.ail && jo.ail[AIL_KEYS[g]]) e.ail[AIL_KEYS[g]] = 1;
    if (jo.st && typeof jo.st === 'object') { e.st.a = !!jo.st.a; e.st.b = !!jo.st.b; e.st.c = !!jo.st.c; }
  }
}
function dailyHtml() {
  var d = dailyEnsure(), m = mutNow(), h = '', i, ds = S.dstreak || { n: 0, last: '' };
  h += '<h2>บันทึกประจำวัน</h2><p style="font-size:13px;color:#9aa39a">เปลี่ยนใหม่ทุกวัน (ตามเวลาเครื่อง) · ' + d.day + ' · ต่อเนื่อง ' + (ds.last === d.day || ds.last === dayShift(d.day, -1) ? ds.n : 0) + ' วัน</p>';
  h += '<div class="note"><b>สภาพป่าวันนี้: ' + m.name + '</b><br>' + m.desc + '</div>';
  h += '<h2 style="font-size:15px">ภารกิจวันนี้ ' + dailyDone() + '/3' + (d.done ? ' ✓ รับรางวัลแล้ว' : '') + '</h2>';
  for (i = 0; i < d.goals.length; i++) {
    var g = d.goals[i], def = GOAL_DEFS[g], n = d.prog[g] || 0, ok = n >= def.need;
    h += '<div class="item"><div style="width:100%"><b' + (ok ? ' class="good"' : '') + '>' + (ok ? '✓ ' : '') + def.name + '</b> <span style="font-size:12px;color:#9aa39a">(' + n + '/' + def.need + ')</span></div></div>';
  }
  h += '<p style="font-size:12.5px;color:#9aa39a">ครบ 3 ข้อ: เหรียญ 100 + 15×วันต่อเนื่อง (สูงสุด 7) · ผลึก +2 · เลือดสด +2 · ไม่มีบทลงโทษหากพลาดวัน</p>';
  h += '<h2 style="font-size:15px">สมุดบันทึกสนาม</h2>';
  for (i = 0; i < JR_KEYS.length; i++) {
    var k = JR_KEYS[i], e = S.jr[k], st = jrStatus(e), nm = monNameOf(k, 0);
    var tag = function (on, t) { return '<span class="chip" style="' + (on ? 'border-color:#d8b24a;color:#f0d98a' : 'opacity:.6') + '">' + (on ? '★ ' : '☆ ') + t + '</span>'; };
    h += '<div class="item"><div style="width:100%">' + uiImg(k, 40, 'float:right;margin-left:8px') + '<b>' + nm + '</b> <span style="font-size:12px;color:#9aa39a">เจอ ' + e.n + ' ครั้ง · สำเร็จ ' + st.c + '</span><br>' +
      tag(e.st.a, 'อาการ ' + st.a + '/3') + tag(e.st.b, 'จับ/รักษา/กำจัด ' + st.b + '/3') + tag(e.st.c, 'ปิดงาน ' + Math.min(st.c, 5) + '/5') + '</div></div>';
  }
  return h;
}
function forestMax() { return Math.max(forestOf('stag'), forestOf('boar'), forestOf('rabbit')); }
function forestTier(v) { return v >= 70 ? 'ฟื้นตัว' : (v >= 40 ? 'ทรงตัว' : 'เสื่อมโทรม'); }
function questTierSeen(t) { for (var i = 0; i < QUESTS.length; i++) if (QUESTS[i].tier === t && qUnlocked(QUESTS[i])) return true; return false; }
function questBoardHtml() {
  var cq = curQuest(), h = '<div class="item"><div style="width:100%">' + rankHtml(), tiers = [1, 2, 3, 4, 'E'], i, j, q, any, sel;
  var legacyId = cq ? cq.id : ('q' + (pickVariant() ? 2 : 1) + '_' + pickKind());
  for (i = 0; i < tiers.length; i++) {
    any = false; var row = ''; if (!questTierSeen(tiers[i])) continue;
    for (j = 0; j < QUESTS.length; j++) { q = QUESTS[j]; if (q.tier !== tiers[i]) continue; any = true; sel = q.id === legacyId;
      var un = qUnlocked(q), done = qCleared(q.id) || (q.goal && S.qextra[q.id]);
      row += '<button class="tab' + (sel ? ' on' : '') + (un ? '' : ' dim') + '" data-act="quest" data-arg="' + q.id + '"' + (un ? '' : ' disabled') + '>' + (un ? '' : '🔒 ') + (q.key ? '⚔ ' : '') + (isExam(q.id) ? '🎖 ' : '') + q.name + (q.goal && S.qextra[q.id] ? ' ★' : (done ? ' ✓' : '')) + '</button>';
    }
    if (any) h += '<div class="d" style="margin-top:6px;font-size:12px;color:#9aa39a">' + QTIER_NAME[tiers[i]] + '</div><div class="row">' + row + '</div>';
  }
  var sq = qDef(legacyId), forced = variantForced(pickKind());
  if (sq) {
    h += '<p style="font-size:12px;color:' + (sq.tier === 1 ? '#9aa39a' : '#c8a0ff') + '">' + (isExam(sq.id) ? '<b>🎖 เควสสอบเลื่อนยศ → ' + RANK_NAME[isExam(sq.id)] + '</b> (ต้องมี XP ' + RANK_XP[isExam(sq.id)] + ') · ' : '') + (sq.key ? '<b>⚔ เควสเลื่อนขั้น</b> — ผ่านแล้วปลดล็อกภารกิจอื่นในระดับนี้ และระดับถัดไป · ' : '') + sq.info + '</p>';
    if (sq.tier === 1 && forced) h += '<p style="font-size:12px;color:#e86a5a">ป่าเสื่อมโทรมมาก — เคสนี้กลายเป็นระดับรุนแรงโดยอัตโนมัติ</p>';
    var lk = []; for (j = 0; j < QUESTS.length; j++) if (!qUnlocked(QUESTS[j]) && questTierSeen(QUESTS[j].tier) && QUESTS[j].tier === sq.tier) lk.push(QUESTS[j].name + ': ' + qReqText(QUESTS[j]));
    if (lk.length) h += '<p style="font-size:11px;color:#7f887f">ล็อก — ' + lk.slice(0, 2).join(' · ') + '</p>';
  }
  return h + '</div></div>';
}
function variantHtml() {
  var k = pickKind(), forced = variantForced(k), un = S.cleared[k] >= 1, on = pickVariant() === 1;
  if (!un && !forced) return '<p style="font-size:12px;color:#7f887f">ระดับรุนแรงของเป้าหมายนี้ปลดล็อกเมื่อจบเคส (จับ/รักษา/กำจัด) สำเร็จ 1 ครั้ง</p>';
  return '<div class="row"><button class="tab' + (on ? ' on' : '') + '" data-act="variant" data-arg="' + k + '"' + (forced ? ' disabled' : '') + '>' + (on ? '★ ระดับรุนแรง: ' + monNameOf(k, 1) : 'ระดับปกติ — กดเพื่อเปลี่ยนเป็นรุนแรง') + '</button>' + (forced ? '<span class="warn" style="font-size:12px">ป่าเขตนี้เกิดโรคระบาด (&lt;20%) — ตัวรุนแรงปรากฏเอง</span>' : '') + '</div>' +
    (on ? '<p style="font-size:12px;color:#c8a0ff">ติดเชื้อรุนแรงจนมีปรสิตหนวดงอกออกจากตัว · HP ×1.6 · ดาเมจ +12% · ท่าใหม่: หนวดฟาดกวาด / หนวดรัดดึง / หนวดงอกจากพื้น (โดนหนวดทุกท่า = ติดเชื้อ) · รางวัล ×1.5 + ผลึกพิเศษ · ป่าฟื้นมากขึ้น ×1.5</p>' : '');
}
function forestHtml() {
  var h = '<div class="item"><div style="width:100%"><b>แผนที่ป่า — สุขภาพระบบนิเวศ</b>', ks = ['stag'], i, k, v, col;
  if (S.wins >= 1) ks.push('boar');
  if (S.wins >= 2) ks.push('rabbit');
  for (i = 0; i < ks.length; i++) { k = ks[i]; v = Math.round(forestOf(k)); col = v >= 70 ? '#7fe0b5' : (v >= 40 ? '#e8d86a' : '#e86a5a');
    h += '<div class="d">' + REGIONS[k].name + ' (' + REGIONS[k].kind + ') · ' + forestTier(v) + ' ' + v + '%' + (S.verdant[k] ? ' · ★ Verdant Mark' : '') + '</div><div class="d" style="font-size:12px;color:#8a948a">' + forestEffect(v) + '</div><div style="height:6px;background:#1a2a20;border-radius:3px;margin:3px 0 6px"><div style="height:6px;width:' + v + '%;background:' + col + ';border-radius:3px"></div></div>'; }
  if (S.favor > 0) h += '<div class="d" style="color:#7fe0b5">พรป่า ×' + S.favor + ' — ใช้ในภารกิจถัดไป: ตีแรงขึ้น 10% สตามินาฟื้นไว +20%</div>';
  return h + '<div class="d">ป่าไม่มีคนดูแลจะทรุด (เขตที่ไม่ได้ไปออกพิทักษ์ −2 ต่อรอบ) · ป่า ≥90% ได้ Verdant Mark ถาวร (HP +6) · ปล่อยสัตว์ที่หายดีกลับป่าได้พรป่า · รักษา/จับย้ายถิ่นสำเร็จ = ป่าฟื้น · กำจัดมอนสเตอร์ = ป่าทรุด · ป่า ≥70% จบเคสสำเร็จได้วัสดุเพิ่ม · ป่า ≥60% ปลดล็อกชุด Symbiont</div></div></div>';
}
var AIL = {
  crystal: { name: 'โคนเขาคริสตัลอักเสบ', med: 'solvent', part: 'horn', clue: 'เขาเรืองแสงม่วงเข้มผิดปกติ' },
  limp: { name: 'ข้อขาหลังอักเสบ', med: 'antiinf', part: 'hind', clue: 'เดินกะเผลกที่ขาหลัง' },
  sepsis: { name: 'แผลติดเชื้อที่สีข้าง', med: 'antibio', part: 'flank', clue: 'คราบหนองสีเขียวที่สีข้าง' }
};
var AIL_KEYS = ['crystal', 'limp', 'sepsis'];
(function () {
  var i, j, id, sl, st;
  for (i = 0; i < SET_KEYS.length; i++) for (j = 0; j < 4; j++) {
    id = SET_KEYS[i]; sl = SLOTS[j]; st = SETS[id];
    CAT['arm_' + id + '_' + sl] = { tab: 'armor', name: SLOT_NAME[sl] + st.name, desc: 'รับดาเมจ −' + Math.round(st.dr * 100) + '%' + (st.hp ? ' · HP +' + st.hp : '') + (st.st ? ' · สตามินา +' + st.st : '') + (st.inf ? ' · ต้านติดเชื้อ' : '') + (st.blk ? ' · บล็อกประหยัดสตามินา' : ''), cost: st.cost[sl], req: st.req ? 'arm_' + st.req + '_' + sl : undefined, gate: st.gate, clr: st.clr };
  }
  CAT.pen2 = { tab: 'pen', name: 'ขยายคอกฟื้นฟู', desc: 'รับสัตว์พักฟื้นได้ 4 ตัว (เดิม 2)', cost: { hide: 3, blood: 2 } };
  CAT.wp_maul = { tab: 'forge', name: 'คราฟต์ Seed Cannon', desc: 'ปลดล็อกปืนใหญ่เมล็ด (อาวุธระยะกลาง ระดับกลาง)', cost: { tusk: 8, bristle: 2, hide: 1, blood: 1 } };
  CAT.wp_fangs = { tab: 'forge', name: 'คราฟต์ Warren Fangs', desc: 'ปลดล็อกกรงเล็บคู่ของนักล่าโพรง (อาวุธระดับกลาง เน้นหลบแล้วสวน) · ต้องเคยล่า/ฟื้นฟูกระต่ายสำเร็จ 1 ครั้ง', cost: { fur: 8, ear: 2, hide: 1 }, clr: 'rabbit' };
  CAT.wp_blades = { tab: 'forge', name: 'คราฟต์ Pruning Blades', desc: 'ปลดล็อกมีดตัดแต่ง (อาวุธระดับยาก)', cost: { crystal: 2, saliva: 2, hide: 1 } };
})();
var MEDS = { solvent: 'ยาละลายผลึก', antiinf: 'ยาลดการอักเสบ', antibio: 'ยาปฏิชีวนะ' };
var DMG_KEYS = ['swarm', 'charge', 'sweep', 'stomp', 'spore', 'kick', 'leap', 'infect', 'shards', 'bash', 'spit', 'roll', 'howl', 'tusk', 'rake', 'lash', 'ensnare', 'sprout', 'burrow', 'breath', 'nova', 'fire', 'pollen'], DMG_NAME = { swarm: 'ฝูงแมลง', pollen: 'ละอองเกสร',breath: 'พ่นไฟ', nova: 'ระเบิดไฟรอบตัว', fire: 'ไฟลุกบนพื้น/ไฟลวก', burrow: 'ขุดโพรงโผล่', lash: 'หนวดฟาด', ensnare: 'หนวดรัด', sprout: 'หนวดงอกพื้น', roll: 'กลิ้งชน', howl: 'คลื่นคำราม', tusk: 'แทงงา', rake: 'ตะกุยเขา', shards: 'เศษผลึกพุ่ง', bash: 'พุ่งชนไหล่', spit: 'พ่นหนองกรด', leap: 'กระโดดทับ', charge: 'พุ่งชน', sweep: 'ฟาดวงกว้าง', stomp: 'กระทืบ', spore: 'สปอร์', kick: 'เตะหลัง', infect: 'การติดเชื้อ' };
(function () {
  var k, c, u, kk;
  for (k in CAT) { c = CAT[k]; if (c.cost && !c.cost.coin) { u = 0; for (kk in c.cost) u += c.cost[kk]; c.cost.coin = Math.max(10, 6 * u); } }
  for (var wi = 0; wi < WTREE_NODES.length; wi++) { c = WTREE_NODES[wi]; if (!c.cost.coin) { u = 0; for (kk in c.cost) u += c.cost[kk]; c.cost.coin = 8 * u; } }
})();
var HERBS = ['moss', 'bark', 'sage', 'poppy'];
var BREW = {
  salve:   { moss: 1, bark: 1 },
  dart:    { poppy: 1, sage: 1 },
  solvent: { moss: 2, crystal: 1 },
  antiinf: { bark: 2, blood: 1 },
  antibio: { sage: 2, saliva: 1 }
};
var GARDEN_GROW = 2;
var SELL_PRICE = { moss: 3, bark: 3, sage: 3, poppy: 3, blood: 4, saliva: 5, crystal: 8, hide: 6, antler: 6, velvet: 14, tusk: 6, bristle: 14, fur: 6, ear: 14, fang: 8, mane: 16, chitin: 9, jelly: 18 };
