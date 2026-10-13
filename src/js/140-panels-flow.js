/* ================= PANELS / FLOW ================= */
function showPanel(html) { panelEl.innerHTML = rw(html); ov.style.display = 'flex'; }
function hidePanel() { ov.style.display = 'none'; }
var ACTIONS = {
  start: function () { beginBattle(null); },
  explore: function () { startField(); },
  daily: function () { openHub('daily'); },
  chron: function () { openHub('chronicle'); },
  ldview: function () { openHub('loadout'); },
  ld: function (arg) {
    var a = String(arg || '').split(':'), op = a[0], i = parseInt(a[1], 10), v = (a[2] === 'prep' || a[2] === 'armor' || a[2] === 'forge' || a[2] === 'pack') ? a[2] : 'loadout', note = '', m;
    if (!(i >= 0 && i < LD_N) || !ldList()[i]) return;
    if (op === 'save') { ldSave(i); sfx('heal'); note = 'บันทึกชุดที่ ' + (i + 1) + ' แล้ว'; }
    else if (op === 'use') { if (!ldList()[i].set) return; m = ldUse(i); sfx('scan'); note = 'สวมชุดที่ ' + (i + 1) + ' แล้ว' + (m.length ? ' — ยังขาด: ' + m.join(', ') : ''); }
    else if (op === 'clr') { ldList()[i] = ldBlank(); persist(); note = 'ล้างชุดที่ ' + (i + 1) + ' แล้ว'; }
    else return;
    if (v === 'pack') { BAGCAT = 'gear'; v = 'bag'; }
    openHub(v, note);
  },
  pack: function (c) { if (c && BAG_CATS.some(function (x) { return x[0] === c; })) BAGCAT = c; openHub('bag'); },
  totitle: function () { hidePanel(); enterTitle(); },
  practice: function (arg) {
    var k = String(arg || ''); if (['fawn', 'stag', 'boar', 'wolf', 'rabbit', 'hive'].indexOf(k) < 0) return;
    huntInv = false; huntKind = k; huntVariant = 0; huntQuest = ''; PREP = null; setArena('meadow'); huntMeds = { solvent: true, antiinf: true, antibio: true }; initWorld();
    PRAC = { kind: k, t: 0, total: 0, first: -1, last: -1, hits: [], n: 0, peak: 0, cn: 0, cd: 0, cl: -9, bn: 0, bd: 0, armT: 0 };
    M.hp = M.maxHp = 1e9; M.provoked = true; M.state = 'stalk'; M.thinkT = 99; M.invuln = false; M.ambush = false; M.face = Math.PI;
    mode = 'playing'; paused = false; hidePanel(); try { document.body.setAttribute('data-prac', '1'); } catch (e0) {}
    showHint('ลานซ้อม: ตีเป้าได้เลย — แผงด้านขวาแสดง DPS และคอมโบ · B รีเซ็ตสถิติ · X ออก', 7);
  },
  tut: function () { huntInv = false; huntKind = 'fawn'; huntVariant = 0; huntQuest = ''; PREP = null; setArena('meadow'); huntMeds = { solvent: true, antiinf: true, antibio: true }; initWorld(); mode = 'playing'; paused = false; hidePanel(); tutStart(); },
  set: function (arg) {
    var a = String(arg || '').split(':'), k = a[0], v = Math.round(+a[1]);
    if (!S.set.hasOwnProperty(k) || !(v >= 0 && v <= 3)) return;
    S.set[k] = v; persist(); sfx('hit'); addShake(6);
    openHub('set', '');
  },
  wtree: function (arg) {
    var a = String(arg || '').split(':'), op = a[0], id = a[1] || '';
    if (op === 'reset') {
      if (!Object.prototype.hasOwnProperty.call(WEAPONS, id) || !ownsWeapon(id)) return;
      var cn = wnodeOf(id); if (!cn) return;
      var rf = wnodeCost(cn); for (var rk in rf) S.mats[rk] = Math.min(9999, (S.mats[rk] || 0) + rf[rk]);
      S.wt[id] = ''; persist(); sfx('scan'); openHub('forge', 'ล้างสาย ' + cn.name + ' แล้ว คืนวัสดุ: ' + costStr(rf)); return;
    }
    if (op !== 'up') return;
    var n = wnodeDef(id); if (!n || !ownsWeapon(n.w)) return;
    var cur = wnodeOf(n.w);
    if (cur && cur.id === n.id) return;
    if (S.wk < n.tier) { openHub('forge', 'ต้องมีชุดอาวุธ Mk.' + ['I', 'II', 'III'][n.tier - 1] + ' ก่อน'); return; }
    if (n.tier === 2 && cur) { openHub('forge', 'ต้องล้างสายเดิมก่อนถึงจะเปลี่ยนสายได้'); return; }
    if (n.tier === 3 && !(cur && cur.id === n.prev)) { openHub('forge', 'ต้องมีสายขั้น II ของสายนี้ก่อน'); return; }
    if (!canAfford(n.cost)) { openHub('forge', 'วัสดุไม่พอสำหรับ ' + n.name); return; }
    for (var ck in n.cost) S.mats[ck] -= n.cost[ck];
    S.wt[n.w] = n.id; persist(); sfx('heal');
    openHub('forge', 'พัฒนาเป็น ' + n.name + ' แล้ว');
  },
  weapon: function (arg) {
    var a = String(arg || '').split(':'), k = a[0], v = a[1] === 'prep' ? 'prep' : (a[1] === 'forge' ? 'forge' : 'main');
    if (!Object.prototype.hasOwnProperty.call(WEAPONS, k) || !ownsWeapon(k)) return;
    S.weapon = k; persist(); sfx('scan'); openHub(v, '');
  },
  armor: function (arg) {
    var a = String(arg || '').split(':'), sl = a[0], id = a[1] || '';
    if (SLOTS.indexOf(sl) < 0) return;
    if (id && (!SETS.hasOwnProperty(id) || !S.res['arm_' + id + '_' + sl])) return;
    S.eq[sl] = id; persist(); sfx('scan'); openHub('armor', id ? 'สวม ' + SLOT_NAME[sl] + SETS[id].name + ' แล้ว' + (fullSet() ? ' — ครบเซ็ต!' : '') : 'ถอด' + SLOT_NAME[sl]);
  },
  village: function () { enterVillage(); },
  variant: function (k) {
    if (SPECIES.indexOf(k) < 0) return;
    if (variantForced(k) || S.cleared[k] < 1) return;
    S.sev[k] = !S.sev[k]; persist(); sfx('scan'); openHub('main', S.sev[k] ? 'ระดับรุนแรง: ' + monNameOf(k, 1) + ' (HP ×1.6 · ท่าใหม่ · รางวัล ×1.5)' : 'ระดับปกติ');
  },
  ally: function (arg) {
    var a = String(arg || '').split(':'), op = a[0], i = Math.round(+a[1]), msg = '';
    if (op === 'none') { S.ally = -1; msg = 'ไม่พาผู้ช่วยออกล่า'; }
    else if (op === 'use') { if (!S.allies[i]) return; S.ally = i; msg = 'พา ' + S.allies[i].name + ' ออกล่าด้วย'; }
    else if (op === 'free') { var al = S.allies[i]; if (!al) return; S.allies.splice(i, 1); S.forest[al.kind] = clamp(forestOf(al.kind) + 5, 0, 100); trustAdd(al.kind, 4); if (S.ally === i) S.ally = S.allies.length ? 0 : -1; else if (S.ally > i) S.ally--; msg = 'ส่ง ' + al.name + ' กลับป่าแล้ว (ป่า +5)'; }
    else return;
    persist(); sfx('scan'); openHub('pen', msg);
  },
  pen: function (arg) {
    var a = String(arg || '').split(':'), op = a[0], i = Math.round(+a[1]), pt = S.pen[i], msg = '';
    if (!pt) return;
    if (op === 'free') { msg = penRelease(i, !pt.healed); }
    else if (op === 'rel') { if (!pt.healed) return; msg = penRelease(i, false); }
    else if (op === 'appoint') { if (!pt.healed) return; if (S.allies.length >= 3) { openHub('pen', 'มีผู้ช่วยครบ 3 ตัวแล้ว — ปล่อยตัวเก่ากลับป่าก่อน'); return; } msg = penAppoint(i); }
    else if (op === 'dx') { if (pt.dx) return; if (S.mats.saliva < 1) { openHub('pen', 'น้ำลายไม่พอสำหรับตรวจวินิจฉัย'); return; } S.mats.saliva--; pt.dx = true; msg = 'ตรวจพบ: ' + AIL[pt.ail].name; }
    else if (op === 'med' || op === 'food') {
      if (pt.last >= S.hunts) { openHub('pen', 'สัตว์ตัวนี้ยังพักอยู่ — ออกพิทักษ์อีกรอบก่อน'); return; }
      if (op === 'med') {
        var mk = a[2]; if (!MEDS.hasOwnProperty(mk) || !pt.dx) return;
        if (!canAfford({ saliva: 1, crystal: 1 })) { openHub('pen', 'วัสดุไม่พอสำหรับยา'); return; }
        S.mats.saliva--; S.mats.crystal--; pt.last = S.hunts;
        if (AIL[pt.ail].med === mk) { pt.cond = Math.min(100, pt.cond + 40); msg = 'ยาตรงอาการ! สภาพ ' + Math.round(pt.cond) + '%'; } else { pt.cond = Math.max(0, pt.cond - 10); msg = 'ยาไม่ตรงอาการ สภาพแย่ลง ' + Math.round(pt.cond) + '%'; }
      } else {
        if (S.mats.blood < 1) { openHub('pen', 'เลือดไม่พอสำหรับอาหาร'); return; }
        S.mats.blood--; pt.last = S.hunts; pt.cond = Math.min(100, pt.cond + 10); msg = 'ให้อาหารแล้ว สภาพ ' + Math.round(pt.cond) + '%';
      }
      if (pt.cond >= 100) { pt.healed = true; msg = penName(pt.kind) + ' หายดีแล้ว! เลือก "ปล่อยกลับป่า" หรือ "แต่งตั้งเป็นผู้ช่วย"'; }
    } else return;
    persist(); sfx('heal'); openHub('pen', msg);
  },
  tedit: function () { if (window.__enterTEdit) window.__enterTEdit(); },
  savecopy: function () {
    var code = saveCode(), box = document.getElementById('savebox');
    if (box) { box.value = code; try { box.focus(); box.select(); } catch (e) {} }
    var done = function (ok) { openHub('set', ok ? 'คัดลอกรหัสเซฟแล้ว — วางเก็บไว้ในโน้ต/แชตของตัวเอง' : 'คัดลอกอัตโนมัติไม่ได้ — กดค้างที่ช่องรหัสแล้วเลือก "คัดลอก" เอง'); var b2 = document.getElementById('savebox'); if (b2) b2.value = code; };
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(code).then(function () { done(true); }, function () { done(false); }); return; } } catch (e) {}
    done(false);
  },
  savedl: function () {
    try {
      var a = document.createElement('a'), u = URL.createObjectURL(new Blob([saveCode()], { type: 'text/plain' }));
      a.href = u; a.download = 'bio-hunter-save.txt'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
      openHub('set', 'บันทึกไฟล์เซฟแล้ว (bio-hunter-save.txt) — เปิดไฟล์แล้วคัดลอกข้อความไปวางตอนนำเข้า');
    } catch (e) { openHub('set', 'บันทึกเป็นไฟล์ไม่ได้บนเครื่องนี้ — ใช้ปุ่มคัดลอกรหัสแทน'); }
  },
  ptcopy: function () {
    var rep = ptReport();
    var done = function (ok) { openHub('set', ok ? 'คัดลอกรายงานแล้ว — วางส่งให้ผู้พัฒนาได้เลย (ไม่มีชื่อหรือข้อมูลส่วนตัว)' : 'คัดลอกอัตโนมัติไม่ได้ — กดค้างที่ช่องรายงานแล้วเลือก "คัดลอก" เอง'); var b2 = document.getElementById('ptbox'); if (b2) b2.value = rep; };
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(rep).then(function () { done(true); }, function () { done(false); }); return; } } catch (e) {}
    done(false);
  },
  ptclear: function () { PT = ptFresh(); ptSave(); ptInit(); openHub('set', 'ล้างรายงานการเล่นแล้ว'); },
  saveimp: function () {
    var box = document.getElementById('savebox'), msg = importSave(box ? box.value : '');
    openHub('set', msg);
  },
  capture: function () { openDosage(); },
  treat: function () { if (M && M.cured) { finish('treat_full'); return; } openTreat(); },
  med: function (id) { chooseMed(id); },
  back: function () { if (mode === 'decision') openDecision(); },
  target: function (arg) { targetKind = (arg === 'rabbit' && S.wins >= 2) ? 'rabbit' : ((arg === 'boar' && S.wins >= 1) ? 'boar' : 'stag'); S.quest = ''; persist(); sfx('scan'); openHub('board', ''); },
  quest: function (id) {
    var q = qDef(id); if (!q) return;
    if (!qUnlocked(q)) { openHub('board', 'ยังไม่ปลดล็อก: ' + qReqText(q)); return; }
    S.quest = q.id; targetKind = q.kind; persist(); sfx('scan'); openHub('board', 'รับภารกิจ: ' + QTIER_NAME[q.tier] + ' · ' + q.name);
  },
  prep: function () { PREP = newPrep(); openHub('prep'); },
  prepdo: function (id) { prepDo(id); },
  supply: function (arg) { supplyBuy(arg); },
  sell: function (arg) { sellMat(arg); },
  brew: function (arg) { brewMed(arg); },
  garden: function (arg) { gardenAct(arg); },
  eliminate: function () { finish('eliminate'); },
  dose: function (d) { chooseDose(d); },
  hub: function (v) { if (v === 'guide') { guidePg = 0; ptNote('guide', function (g) { g.open++; }); } openHub(v || 'main'); },
  gpg: function (n) { guidePg = Math.round(+n) || 0; ptNote('guide', function (g) { g.maxPg = Math.max(g.maxPg, clamp(guidePg, 0, 7)); }); openHub('guide'); },
  buy: function (id) { buyItem(id); },
  skill: function (id) { skillArm = false; buySkill(id); },
  skillreset: function () { skillReset(); },
  reset: function () {
    if (!resetArmed) { resetArmed = true; openHub('main', 'กดปุ่มรีเซ็ตอีกครั้งเพื่อยืนยัน — ความคืบหน้าทั้งหมดจะหายไป'); return; }
    S = freshSave(); persist(); openHub('main', 'ล้างความคืบหน้าแล้ว');
  },
  tgo: function () { enterVillage(); },
  ttut: function () { ACTIONS.tut(); },
  tguide: function () { ACTIONS.hub('guide'); },
  tset: function () { openHub('set'); },
  tnew: function () {
    if (!titleArm) { titleArm = 1; renderTitle(); return; }
    titleArm = 0; S = freshSave(); persist(); enterVillage('เริ่มเกมใหม่แล้ว — คุยกับกัปตันเรนเพื่อออกพิทักษ์');
  },
  retry: function () { enterVillage(); }
};
var resetArmed = false, hubNote = '', hubSay = null; /* hubSay: NPC ที่กำลังพูด {n, line} — แสดงเป็นการ์ดบทสนทนาพร้อมภาพ ครั้งเดียวตอนเปิดหน้า */
function npcSayHtml() {
  var s = hubSay; hubSay = null; if (!s) return '';
  var n = s.n, u = window.BH_UI && n.pic ? window.BH_UI[n.pic] : (window.BH_UI && n.art ? window.BH_UI[n.art] : null);
  return '<div class="npc-say" style="--c:' + n.col + '">' + (u && u.src ? '<img class="pic' + (n.obj ? ' obj' : '') + '" alt="" src="' + u.src + '">' : '') +
    '<div class="tx"><b>' + n.name + '</b><span class="role">' + n.role + '</span><p>“' + s.line + '”</p></div></div>';
}
var ACT_MODES = { skillreset: ['hub'], ld: ['hub'], ldview: ['hub'], pack: ['hub'], totitle: ['hub'], daily: ['hub'], chron: ['hub'], tgo: ['title'], ttut: ['title'], tguide: ['title'], tset: ['title'], tnew: ['title'], wtree: ['hub'], start: ['hub'], explore: ['hub'], tut: ['hub'], gpg: ['hub'], practice: ['hub'], set: ['hub'], prep: ['hub'], prepdo: ['hub'], supply: ['hub'], sell: ['hub'], brew: ['hub'], garden: ['hub'], buy: ['hub'], skill: ['hub'], reset: ['hub'], tedit: ['hub'], savecopy: ['hub'], savedl: ['hub'], saveimp: ['hub'], ptcopy: ['hub'], ptclear: ['hub'], weapon: ['hub'], target: ['hub'], pen: ['hub'], ally: ['hub'], variant: ['hub'], armor: ['hub'], village: ['hub', 'result'],
  capture: ['decision'], treat: ['decision'], med: ['decision'], back: ['decision'], eliminate: ['decision'], dose: ['decision'], hub: ['hub', 'result', 'decision'], retry: ['result', 'hub'] };
function actClick(e, root) {
  var t = e.target; if (!t) return;
  while (t && t !== root && !(t.getAttribute && t.getAttribute('data-act'))) t = t.parentNode;
  if (!t || t === root) return;
  initAudio(); var a = t.getAttribute('data-act');
  if (!Object.prototype.hasOwnProperty.call(ACTIONS, a)) return;
  var okModes = ACT_MODES[a]; if (okModes && okModes.indexOf(mode) < 0) return;
  try { ACTIONS[a](t.getAttribute('data-arg')); } catch (err) { recoverFromError(err); }
}
ov.addEventListener('click', function (e) { actClick(e, ov); });
if (titleEl) titleEl.addEventListener('click', function (e) { actClick(e, titleEl); });
