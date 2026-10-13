function freshSave() { return { v: 3, xp: 0, mats: { blood: 0, saliva: 0, crystal: 0, hide: 0, antler: 0, velvet: 0, tusk: 0, bristle: 0, fur: 0, ear: 0, fang: 0, mane: 0, chitin: 0, jelly: 0, moss: 0, bark: 0, sage: 0, poppy: 0, coin: 60 }, res: {}, wk: 1, skills: {}, hunts: 0, wins: 0, bestRank: '', tut: 0, weapon: 'lance', forest: { stag: 40, boar: 40, rabbit: 40 }, trust: { stag: 20, boar: 20, rabbit: 20 }, daily: null, dclears: 0, gift: {}, ld: ldAll(), dstreak: { n: 0, last: '' }, jr: jrAll(), pen: [], released: 0, favor: 0, allies: [], ally: -1, quest: '', qclear: {}, qextra: {}, pity: {}, wt: {}, eco: {}, plots: [], inv: { salve: 3, dart: 3, solvent: 3, antiinf: 3, antibio: 3, bait: 1, snare: 1 }, cleared: { stag: 0, boar: 0, rabbit: 0, wolf: 0, hive: 0 }, sev: { stag: false, boar: false, rabbit: false }, verdant: { stag: false, boar: false, rabbit: false }, eq: { head: '', chest: '', arms: '', legs: '' }, set: { shake: 2, stop: 2, vol: 2, diff: 1 }, log: [] }; }
var DIFF_NAME = ['ปกติ', 'ยาก', 'โหด'];
var DF = { hp: [1, 1.2, 1.4], dmg: [1, 1.25, 1.5], tele: [1, .88, .78], rec: [1, .9, .8], think: [1, .8, .65], extra: [0, .1, .2], stag: [1, 1.2, 1.4], xp: [1, 1.25, 1.5] };
function diffLv() { var v = S && S.set ? Math.round(+S.set.diff) : 1; return v >= 0 && v <= 2 ? v : 1; }
function dfv(k) { return (M && M.kind === 'fawn') ? (k === 'extra' ? 0 : 1) : DF[k][diffLv()]; }
var SET_MUL = [0, .5, 1, 1.4], SET_LBL = ['ปิด', 'เบา', 'ปกติ', 'แรง'];
function setMul(k) { var v = S && S.set ? S.set[k] : 2; return SET_MUL[v >= 0 && v <= 3 ? v : 2]; }
function cleanLog(arr) {
  var out = [];
  for (var i = 0; i < arr.length && out.length < 5; i++) {
    var e = arr[i]; if (!e || typeof e !== 'object') continue;
    if (OUT_KEYS.indexOf(e.out) < 0) continue;
    var d = {}, dm = 0;
    for (var j = 0; j < DMG_KEYS.length; j++) { var v = Math.round(+(e.dmg && e.dmg[DMG_KEYS[j]]) || 0); d[DMG_KEYS[j]] = clamp(v, 0, 999); dm += d[DMG_KEYS[j]]; }
    out.push({ out: e.out, fawn: !!e.fawn, rank: ('SABC–'.indexOf(e.rank) >= 0 && String(e.rank).length === 1) ? e.rank : '–',
      t: clamp(Math.round(+e.t || 0), 0, 5999), taken: clamp(Math.round(+e.taken) || 0, 0, 999), dmg: d });
  }
  return out;
}
function loadSave() {
  var s = freshSave();
  try {
    var raw = window.localStorage ? window.localStorage.getItem(SAVE_KEY) : null;
    if (raw) {
      var o = JSON.parse(raw);
      if (!(o && o.v === 3)) { try { window.localStorage.setItem(SAVE_KEY + '-backup', raw); } catch (e0) {} }
      if (o && o.v === 3) {
        s.xp = clamp(+o.xp || 0, 0, 999999); s.wk = clamp(Math.round(+o.wk || 1), 1, 3); s.hunts = clamp(+o.hunts || 0, 0, 99999); s.wins = clamp(+o.wins || 0, 0, 99999); s.bestRank = ('SABC'.indexOf(String(o.bestRank || '#')) >= 0 && String(o.bestRank).length === 1) ? String(o.bestRank) : '';
        if (Array.isArray(o.plots)) for (var plI = 0; plI < o.plots.length && s.plots.length < 4; plI++) { var po = o.plots[plI]; s.plots.push(po && typeof po === 'object' && HERBS.indexOf(po.h) >= 0 ? { h: po.h, t: clamp(Math.round(+po.t) || 0, 0, 999999) } : ''); }
        if (o.inv && typeof o.inv === 'object') for (var ivk in INV_ITEMS) s.inv[ivk] = clamp(Math.round(+o.inv[ivk]), 0, INV_ITEMS[ivk].cap + 4) || 0;
        var legacyCoin = !(o.mats && typeof o.mats === 'object' && 'coin' in o.mats);
        for (var i = 0; i < MAT_KEYS.length; i++) s.mats[MAT_KEYS[i]] = clamp(Math.round(+(o.mats && o.mats[MAT_KEYS[i]]) || 0), 0, 9999);
        if (legacyCoin) s.mats.coin = 100;
        for (var k in CAT) if (o.res && o.res[k]) s.res[k] = true;
        for (var q in SKILLS) if (o.skills && o.skills[q]) { var qn0 = +o.skills[q], ql = (o.skills[q] === true || isNaN(qn0)) ? 1 : Math.round(qn0); if (ql > 0) s.skills[q] = clamp(ql, 1, SKILLS[q].max); }
        s.tut = o.tut ? 1 : 0;
        if (o.forest && typeof o.forest === 'object') { var fv1 = +o.forest.stag, fv2 = +o.forest.boar, fv3 = +o.forest.rabbit; s.forest.rabbit = clamp(isFinite(fv3) && o.forest.rabbit !== null && o.forest.rabbit !== '' && o.forest.rabbit !== undefined ? fv3 : 40, 0, 100); s.forest.stag = clamp(isFinite(fv1) && o.forest.stag !== null && o.forest.stag !== '' ? fv1 : 40, 0, 100); s.forest.boar = clamp(isFinite(fv2) && o.forest.boar !== null && o.forest.boar !== '' ? fv2 : 40, 0, 100); }
        if (Array.isArray(o.pen)) for (var pi = 0; pi < o.pen.length && s.pen.length < 4; pi++) { var po = o.pen[pi]; if (po && typeof po === 'object' && (po.kind === 'stag' || po.kind === 'boar' || po.kind === 'rabbit') && AIL.hasOwnProperty(po.ail)) s.pen.push({ kind: po.kind, ail: po.ail, cond: clamp(+po.cond || 0, 0, 100), dx: !!po.dx, last: clamp(Math.round(+po.last || -1), -1, 99999), mut: !!po.mut, vr: po.vr === 1 ? 1 : 0, id: String(po.id || pi).slice(0, 12) }); }
        s.released = clamp(Math.round(+o.released || 0), 0, 99999);
        s.favor = clamp(Math.round(+o.favor || 0), 0, 3);
        if (o.trust && typeof o.trust === 'object') for (var tri = 0; tri < SPECIES.length; tri++) { var trv = +o.trust[SPECIES[tri]]; if (isFinite(trv)) s.trust[SPECIES[tri]] = clamp(Math.round(trv), 0, 100); }
        if (o.cleared && typeof o.cleared === 'object') { s.cleared.stag = clamp(Math.round(+o.cleared.stag || 0), 0, 9999); s.cleared.boar = clamp(Math.round(+o.cleared.boar || 0), 0, 9999); s.cleared.rabbit = clamp(Math.round(+o.cleared.rabbit || 0), 0, 9999); s.cleared.wolf = clamp(Math.round(+o.cleared.wolf || 0), 0, 9999); s.cleared.hive = clamp(Math.round(+o.cleared.hive || 0), 0, 9999); }
        if (typeof o.quest === 'string' && qDef(o.quest)) s.quest = o.quest;
        if (o.qclear && typeof o.qclear === 'object') for (var qi = 0; qi < QUESTS.length; qi++) { var qn = Math.round(+o.qclear[QUESTS[qi].id] || 0); if (qn > 0) s.qclear[QUESTS[qi].id] = clamp(qn, 0, 9999); }
        if (o.wt && typeof o.wt === 'object') for (var wi2 = 0; wi2 < WEAPON_KEYS.length; wi2++) { var wk2 = WEAPON_KEYS[wi2], wid2 = o.wt[wk2]; var wn2 = typeof wid2 === 'string' ? wnodeDef(wid2) : null; if (wn2 && wn2.w === wk2 && ownsWeapon(wk2, s)) s.wt[wk2] = wid2; }
        if (o.eco && typeof o.eco === 'object') for (var eci = 0; eci < SPECIES.length; eci++) { var ecr = SPECIES[eci], ecp = o.eco[ecr] && o.eco[ecr].picked; if (ecp && typeof ecp === 'object') { var ecn = {}; for (var ecid in ecp) if (/^[a-z0-9_]{1,24}$/.test(ecid) && typeof ecp[ecid] === 'number' && isFinite(ecp[ecid])) ecn[ecid] = clamp(Math.round(ecp[ecid]), 0, 99999); s.eco[ecr] = { picked: ecn }; } }
        if (o.pity && typeof o.pity === 'object') for (var pk = 0; pk < PITY_SP.length; pk++) for (var pt2 = 0; pt2 < 2; pt2++) { var pkk = PITY_SP[pk] + (pt2 ? '_r' : '_c'); s.pity[pkk] = clamp(Math.round(+o.pity[pkk]) || 0, 0, 9); }
        if (o.qextra && typeof o.qextra === 'object') for (var qj = 0; qj < QUESTS.length; qj++) if (o.qextra[QUESTS[qj].id] === true) s.qextra[QUESTS[qj].id] = true;
        if (o.sev && typeof o.sev === 'object') { s.sev.stag = !!o.sev.stag; s.sev.boar = !!o.sev.boar; s.sev.rabbit = !!o.sev.rabbit; }
        if (Array.isArray(o.allies)) for (var ai = 0; ai < o.allies.length && s.allies.length < 3; ai++) { var ao = o.allies[ai]; if (ao && typeof ao === 'object' && (ao.kind === 'stag' || ao.kind === 'boar' || ao.kind === 'rabbit')) s.allies.push({ id: String(ao.id || ai).slice(0, 12), kind: ao.kind, mut: !!ao.mut, sev: !!ao.sev, bond: clamp(Math.round(+ao.bond || 0), 0, 999), name: String(ao.name || ALLY_NAMES[ai % ALLY_NAMES.length]).replace(/[<>&"']/g, '').slice(0, 12) || 'ผู้ช่วย' }); }
        s.ally = Math.round(+o.ally); if (!(s.ally >= 0 && s.ally < s.allies.length)) s.ally = s.allies.length ? 0 : -1;
        if (o.verdant && typeof o.verdant === 'object') { s.verdant.stag = !!o.verdant.stag; s.verdant.boar = !!o.verdant.boar; s.verdant.rabbit = !!o.verdant.rabbit; }
        if (o.hunts > 0) { s.res.wp_maul = true; s.res.wp_blades = true; }
        if (o.eq && typeof o.eq === 'object') for (var si = 0; si < SLOTS.length; si++) { var ev = o.eq[SLOTS[si]]; if (typeof ev === 'string' && SETS.hasOwnProperty(ev) && s.res['arm_' + ev + '_' + SLOTS[si]]) s.eq[SLOTS[si]] = ev; }
        if (typeof o.weapon === 'string' && Object.prototype.hasOwnProperty.call(WEAPONS, o.weapon) && ownsWeapon(o.weapon, s)) s.weapon = o.weapon;
        if (o.set && typeof o.set === 'object') for (var sk in s.set) { var sv = Math.round(+o.set[sk]); if (sv >= 0 && sv <= 3) s.set[sk] = sv; }
        sanitizeLive(o, s);
        if (o.log && typeof o.log.length === 'number') s.log = cleanLog(o.log);
      }
    }
  } catch (e) { try { window.localStorage.setItem(SAVE_KEY + '-backup', window.localStorage.getItem(SAVE_KEY) || ''); } catch (e3) {} }
  return s;
}
function persist() { try { if (window.localStorage) window.localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
/* ---- save export/import: "BH3:" + base64(utf8 JSON) ---- */
function saveCode() {
  var j = JSON.stringify(S);
  try { return 'BH3:' + btoa(unescape(encodeURIComponent(j))); } catch (e) { return 'BH3:' + j; }
}
function importSave(text) {
  var t = String(text || '').replace(/\s+/g, '');
  if (t.indexOf('BH3:') !== 0) return 'ไม่พบรหัสเซฟ — ต้องขึ้นต้นด้วย BH3:';
  var body = t.slice(4), j, o;
  try { j = body.charAt(0) === '{' ? body : decodeURIComponent(escape(atob(body))); o = JSON.parse(j); } catch (e) { return 'รหัสเซฟเสียหายหรือคัดลอกมาไม่ครบ — ไม่ได้เปลี่ยนความคืบหน้าปัจจุบัน'; }
  if (!(o && typeof o === 'object' && o.v === 3)) return 'รหัสเซฟเป็นเวอร์ชันที่ไม่รองรับ — ไม่ได้เปลี่ยนความคืบหน้าปัจจุบัน';
  try {
    var prev = window.localStorage.getItem(SAVE_KEY);
    if (prev) window.localStorage.setItem(SAVE_KEY + '-before-import', prev);
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(o));
  } catch (e2) { return 'เขียนข้อมูลลงเครื่องนี้ไม่ได้ — ไม่ได้เปลี่ยนความคืบหน้า'; }
  S = loadSave(); persist();
  return 'นำเข้าเซฟสำเร็จ — ล่า ' + S.hunts + ' ครั้ง · XP ' + S.xp + ' (ของเดิมสำรองไว้ในเครื่องแล้ว)';
}
function hasRes(id) { var c = CAT[id]; return c.wk ? S.wk >= c.wk : !!S.res[id]; }
function skillLv(id) { return (S && S.skills && SKILLS[id] && +S.skills[id]) || 0; }
function hasSkill(id) { return skillLv(id) > 0; }
function skillSpent() { var t = 0, k; for (k in SKILLS) t += SKILLS[k].cost * skillLv(k); return t; }
function brSpent(b) { var t = 0, k; for (k in SKILLS) if (SKILLS[k].br === b) t += SKILLS[k].cost * skillLv(k); return t; }
function jrStamps() { var n = 0, k, e; if (!S || !S.jr) return 0; for (k in S.jr) { e = S.jr[k]; if (e && e.st) n += (e.st.a ? 1 : 0) + (e.st.b ? 1 : 0) + (e.st.c ? 1 : 0); } return n; }
function skillTotal() { return rankSkillPts(rankIdx()) + jrStamps() + Math.floor(((S && S.dclears) || 0) / 5); }
function rankIdx() { var r = 0; for (var i = 1; i < RANK_XP.length; i++) { if (S.xp >= RANK_XP[i] && qCleared(RANK_EXAM[i])) r = i; else break; } return r; }
function isExam(id) { for (var i = 1; i < RANK_EXAM.length; i++) if (RANK_EXAM[i] === id) return i; return 0; }
function rankNext() {
  var ri = rankIdx(), n = ri + 1; if (n >= RANK_XP.length) return null;
  var ex = qDef(RANK_EXAM[n]); return { idx: n, name: RANK_NAME[n], xp: RANK_XP[n], exam: ex ? ex.name : '', examId: RANK_EXAM[n], examDone: qCleared(RANK_EXAM[n]), xpOk: S.xp >= RANK_XP[n] };
}
function rankHtml() {
  var ri = rankIdx(), nx = rankNext(), h = '<p style="font-size:12px;color:#9aa39a;margin:4px 0">ยศ <b style="color:#ffd45a">' + RANK_NAME[ri] + '</b> (' + (ri + 1) + '/' + RANK_NAME.length + ')';
  if (!nx) return h + ' · สูงสุดแล้ว</p>';
  return h + ' → <b>' + nx.name + '</b> : ' + (nx.examDone ? '✓' : '⚔') + ' สอบเลื่อนยศ ' + nx.exam + ' · ' + (nx.xpOk ? '✓' : '') + ' XP ' + Math.min(S.xp, nx.xp) + ' / ' + nx.xp + '</p>';
}

