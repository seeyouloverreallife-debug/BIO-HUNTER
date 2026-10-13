/* ================= HUD (v17.1) =================
   แบ่งเป็น 3 ก้อน ซ้าย (สถานะผู้เล่น) / กลาง (มอนสเตอร์) / ขวา (Trauma) + ข้อความแนะนำด้านล่าง
   จอเล็ก (มือถือ): ทุกก้อนถูกขยาย HK เท่าโดยตรึงมุม และเลย์เอาต์ถูกคำนวณให้ไม่ทับกัน · จอใหญ่: หน้าตาเหมือนเดิม */
var HUDG = null, HUDLB = 0;
function hudGeom() {
  var k = HK, LW = 240, CW = 400, RW = 130, hl, hr;
  hl = Math.max(isTouch ? 56 / UIK - OFFX : 20, 8 - OFFX);           /* เว้นปุ่มพัก (❚❚) มุมซ้ายบนบนจอสัมผัส */
  hr = Math.min(isTouch ? VW - OFFX - 56 / UIK : W - 20, VW - OFFX - 8); /* เว้นปุ่มเต็มจอมุมขวาบน */
  if (k > 1) {
    LW = 200; CW = 250;
    k = Math.min(k, (474 - hl) / (LW + CW / 2), (hr - 486) / (RW + CW / 2), (hr - hl - 24) / (LW + CW + RW));
    if (k < 1.04) k = 1;
  }
  if (k === 1) { LW = Math.min(240, 268 - hl); CW = 400; }
  return { k: k, LW: LW, CW: CW, RW: RW, hl: hl, hr: hr };
}
function fitText(s, size, bold, maxW) {
  s = String(s); if (tw(s, size, bold) <= maxW) return s;
  while (s.length > 1 && tw(s + '…', size, bold) > maxW) s = s.slice(0, -1);
  return s + '…';
}
function wrapText(s, size, bold, maxW, maxLines) {
  var words = String(s).split(' '), lines = [], cur = '', i, t;
  for (i = 0; i < words.length; i++) {
    t = cur ? cur + ' ' + words[i] : words[i];
    if (cur && tw(t, size, bold) > maxW) { lines.push(cur); cur = words[i]; } else cur = t;
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = fitText(lines[maxLines - 1] + ' …', size, bold, maxW); }
  for (i = 0; i < lines.length; i++) lines[i] = fitText(lines[i], size, bold, maxW);
  return lines;
}
/* ก้อนซ้าย: HP / สตามินา / ของที่พก / อาวุธ / สถานะ / FLOW / สตรีค — คืนค่า y ล่างสุด */
function hudLeft(x0, LW) {
  var p = P, ly = 72, i, items = [], cx, w, fxk, ldMed = (p.load === 'sed' || !huntMeds[p.load]);
  bar(x0, 22, LW, 14, p.hp / p.maxHp, p.infT > 0 ? '#a05ad0' : '#e0524a'); txt('HP', x0 + 4, 29, 11, '#fff', 'left', true);
  bar(x0, 44, LW, 9, p.st / p.maxSt, p.st < 18 ? '#c8a04a' : '#4aa3e0');
  txt('ยาสมานแผล ×' + p.salves + '   ยาสลบ ×' + p.darts, x0, ly, 12, '#d5d9d0'); ly += 17;
  var wim = vimg(wIconKey((S && S.weapon) || 'lance')), wx = x0 + (wim ? 24 : 0); /* ไอคอนอาวุธ/สายพัฒนา หน้าชื่ออาวุธ */
  if (wim) ctx.drawImage(wim.el, x0, ly - 11, 21, 21);
  txt(curW().name, wx, ly, 11, curW().color, 'left', true);
  if (p.frenzy) txt('FRENZY', wx + tw(curW().name, 11, true) + 10, ly, 12, '#ff5a4a', 'left', true);
  else if (p.favor) txt('พรป่า', wx + tw(curW().name, 11, true) + 10, ly, 12, '#7fe0b5', 'left', true);
  ly += 17;
  if (p.darts > 0 || (p.doses && p.load !== 'sed')) { txt('ลูกดอก [T]: ' + (ldMed ? 'ยาสลบ' : MEDS[p.load] + ' ×' + (ensureDoses()[p.load] || 0)), x0, ly, 11, ldMed ? '#9fe8ff' : '#ffb0e0', 'left', true); ly += 17; }
  if (p.infT > 0) items.push(['ติดเชื้อ', '#c79cff', 'infect']);
  if (p.hp <= p.maxHp * .35 && !p.dead) items.push(['ADRENALINE', '#ff6a5a']);
  if (p.hasteT > 0) items.push(['ว่องไว ' + Math.ceil(p.hasteT), '#bfe8a0']);
  for (fxk in p.fx) if (p.fx[fxk] > 0 && STATUS[fxk]) items.push([STATUS[fxk].th + ' ' + Math.ceil(p.fx[fxk]), STATUS[fxk].col, fxk]);
  cx = x0;
  for (i = 0; i < items.length; i++) { /* ไอคอนสถานะ (ถ้ามีภาพ) นำหน้าข้อความ */
    var sti = items[i][2] && STIMG[items[i][2]] ? STIMG[items[i][2]] : null;
    w = tw(items[i][0], 12, true) + 12 + (sti ? 22 : 0);
    if (cx > x0 && cx + w > x0 + LW + 16) { cx = x0; ly += 20; }
    if (sti) ctx.drawImage(sti, cx, ly - 10, 20, 20);
    txt(items[i][0], cx + (sti ? 22 : 0), ly, 12, items[i][1], 'left', true); cx += w;
  }
  if (items.length) ly += 22;
  if (p.flow > 0 || p.counter > 0) {
    txt('FLOW', x0, ly, 12, '#ffd45a', 'left', true);
    for (i = 0; i < 3; i++) { ctx.fillStyle = i < p.flow ? '#ffd45a' : 'rgba(255,255,255,.15)'; ctx.fillRect(x0 + 42 + i * 22, ly - 7, 18, 10); }
    if (p.flow >= 3) txt(LW < 240 ? 'FINISHER!' : 'คอมโบกดต่อ = FINISHER', x0 + 112, ly, 12, '#ff9a4a', 'left', true);
    else if (p.counter > 0) txt(LW < 240 ? 'COUNTER!' : 'COUNTER พร้อม', x0 + 112, ly, 12, '#9fe8ff', 'left', true);
    bar(x0, ly + 10, 100, 4, p.flowT / 5, '#ffd45a'); ly += 26;
  }
  if (p.streak >= 2) {
    var sz = 15 + Math.min(8, p.streak * .6);
    txt('HIT ×' + p.streak, x0, ly + sz * .3, sz, p.streak >= 10 ? '#ff9a4a' : '#ffd45a', 'left', true);
    bar(x0, ly + sz * .8 + 4, 100, 4, p.streakT / 3.2, '#ffd45a'); ly += sz + 12;
  }
  return ly;
}
/* ก้อนกลาง: ชื่อ/HP มอนสเตอร์ + สถานะ (chips ตัดบรรทัดเองเมื่อยาวเกิน) + อาการ + ระยะโรค */
function hudCenter(CW, limL, limR) {
  var m = M, bw = CW, bx = CX - bw / 2, i, chips = [], chx, cyy, w, s, at, ay, by, hlp;
  txt(PRAC ? 'ลานซ้อม · เป้านิ่ง' : monName().toUpperCase(), CX, 18, 13, '#e9e7df', 'center', true);
  bar(bx, 30, bw, 12, m.hp / m.maxHp, m.phase === 3 ? '#d02a2a' : (m.phase >= 2 ? '#e05a3a' : '#d98a30'));
  if (m.kind !== 'fawn') { ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(bx + bw * .66 - 1, 28, 2, 16); ctx.fillRect(bx + bw * .33 - 1, 28, 2, 16); }
  bar(bx, 48, bw * .6, 5, m.stam / 100, '#6ab0d8'); bar(bx + bw * .6 + 8, 48, bw * .4 - 8, 5, m.stag / m.stagNeed, '#c79cff');
  if ((m.dizzy || 0) > 15) { bar(bx, 56, bw * .6, 4, m.dizzy / 100, '#ffd45a'); txt('มึนหัว', bx + bw * .6 + 8, 61, 10, '#ffd45a', 'left', true); }
  if (m.cured) chips.push(['รักษาแล้ว', '#9be86a']);
  if (rageN(m) > 0) chips.push(['คลั่ง ×' + rageN(m) + ' (ดาเมจ +' + Math.round(BAL.rageDmg * rageN(m) * 100) + '%)', '#ff4a4a']);
  if (dullMul(m) < 1) chips.push(['ผิวแกร่ง: ดาเมจ −' + Math.round((1 - dullMul(m)) * 100) + '% (ต้อง Mk.' + ['I', 'II', 'III'][BAL.tier[m.tier || 1].mk - 1] + ')', '#aab4c0']);
  if (m.mut) chips.push(['กลายพันธุ์', '#ff5ad0']);
  if (m.enrageT > 0) chips.push(['โมโห', '#ff7a5a']);
  if (lvl(m.tr.flank) >= 1) chips.push(['เลือดออก', '#e0524a']);
  if (m.drowsyT > 0) chips.push(['ง่วงซึม', '#9fe8ff']);
  if (m.phase === 2) chips.push(['เฟส 2', '#ff7a5a']);
  if (m.phase === 3) chips.push(['เฟส 3 วิกฤต', '#ff3a3a']);
  if (m.kind !== 'fawn' && m.phase >= 2) chips.push(phScan(m) ? ['ล็อกเป้าแล้ว', '#7fe0b5'] : [Math.sin(tNow * 8) > 0 ? 'สแกนเฟสนี้! (Q)' : 'สแกนเฟสนี้! (Q) ', '#ffd45a']);
  if (m.aggro && m.adapt) chips.push(['ปรับตัว: ' + ADAPT_TH[m.adapt], '#ff9a4a']);
  if (m.kind === 'hive' && BUGS.length > 0 && m.state !== 'downed') { hlp = m.state === 'stagger' || m.state === 'stun' || m.state === 'exhaust'; chips.push(hlp ? ['ราชินีเปิดช่อง — ฝูงคุ้มกันไม่ได้', '#9fe8ff'] : ['ฝูงคุ้มกัน −' + Math.round(Math.min(m.sov ? .5 : .4, BUGS.length * .08) * 100) + '% (' + BUGS.length + ' ตัว)', '#d8b030']); }
  if (m.state === 'retreat') chips.push(['ถอยหนี — โอกาสรักษา ' + Math.max(0, Math.ceil(m.rtDur - m.stT)) + 's', '#9fe8ff']);
  if (m.state === 'exhaust') chips.push(['หมดแรง', '#6ab0d8']);
  if (m.state === 'stagger') chips.push(['เสียหลัก', '#c79cff']);
  if (m.state === 'stun') chips.push(['มึนงง', '#ffd45a']);
  if (m.wound) chips.push(['แผลเปิด ' + Math.ceil(m.wound.life - m.wound.t) + 's', '#fff2a8']);
  chx = bx; cyy = 66;
  for (i = 0; i < chips.length; i++) {
    s = '● ' + chips[i][0]; w = tw(s, 12, true) + 14;
    if (chx > bx && chx + w > limR) { chx = bx; cyy += 16; }
    txt(s, chx, cyy, 12, chips[i][1], 'left', true); chx += w;
  }
  at = 'อาการ: ' + (m.diagKnown ? AIL[m.ail].name : (m.narrow ? 'สงสัย ' + suspectNames() + (bw < 400 ? '' : ' — สแกนซ้ำตอนมันอ่อนแรง') : 'ไม่ทราบ — กด Q สแกน'));
  ay = cyy + 18;
  txt(fitText(at, 12, true, 2 * Math.min(CX - limL, limR - CX)), CX, ay, 12, m.diagKnown ? '#9fe8ff' : (m.narrow ? '#ffd45a' : '#8a9488'), 'center', true);
  by = ay + 12;
  if (m.kind !== 'fawn') {
    if (!m.cured && m.sick > 5) { var sg0 = Math.max(1, sickStage(m)); bar(bx, by, bw * .6, 4, m.sick / 100, SICK_COL[sg0]); ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(bx + bw * .6 * .35 - 1, by - 1, 2, 6); ctx.fillRect(bx + bw * .6 * .7 - 1, by - 1, 2, 6); txt('ระยะ ' + ['', 'I', 'II', 'III'][sg0] + ' ' + SICK_NAME[sg0], bx + bw * .6 + 8, by + 5, 10, SICK_COL[sg0], 'left', true); by += 14; }
    if (!m.cured && m.cureP > 0) { bar(bx, by, bw * .6, 4, m.cureP / 100, '#9be86a'); txt('รักษาแล้ว ' + Math.round(m.cureP) + '%', bx + bw * .6 + 8, by + 5, 10, '#9be86a', 'left', true); by += 14; }
  }
  if (SHRINE && m.aggro) {
    by = Math.max(by, 112);
    bar(CX - 100, by, 200, 8, SHRINE.hp / 100, SHRINE.burning ? '#ff7a3a' : '#6fe0a0');
    txt(SHRINE.lost ? 'พุ่มไม้ศักดิ์สิทธิ์ถูกเผาหมด' : (SHRINE.burning ? 'พุ่มไม้กำลังไหม้! ไปดับ' : (m.torch ? 'มันกำลังไปเผาพุ่มไม้!' : 'พุ่มไม้ศักดิ์สิทธิ์ ' + Math.round(SHRINE.hp) + '%')), CX, by + 22, 11, SHRINE.burning || m.torch ? '#ffb070' : '#bff0d0', 'center', true);
  }
}
/* ก้อนขวา: Trauma 3 จุด */
function hudRight(xr, RW) {
  var tx = xr - RW, ty = 22, keys3 = ['horn', 'flank', 'hind'], i, j, l;
  txt('TRAUMA', tx, ty, 11, '#9aa39a', 'left', true);
  for (i = 0; i < 3; i++) {
    l = lvl(M.tr[keys3[i]]);
    txt(PART_TH[keys3[i]], tx, ty + 20 + i * 20, 12, '#d5d9d0');
    for (j = 0; j < 3; j++) { ctx.fillStyle = j < l ? (l >= 3 ? '#ff6a5a' : '#ffd45a') : 'rgba(255,255,255,.15)'; ctx.fillRect(tx + 62 + j * 18, ty + 14 + i * 20, 14, 10); }
  }
}
function hudPrac(xr) {
  var ps = pracStats(), px = xr - 188, py = 150, rr = PRAC, hh, hi;
  ctx.fillStyle = 'rgba(14,20,16,.78)'; ctx.fillRect(px - 8, py - 18, 196, 200); ctx.strokeStyle = "rgba(127,224,181,.45)"; ctx.lineWidth = 1; ctx.strokeRect(px - 8, py - 18, 196, 200);
  txt('สถิติลานซ้อม', px, py - 2, 12, '#7fe0b5', 'left', true);
  txt('DPS รวม  ' + ps.dps.toFixed(1), px, py + 18, 15, '#ffe08a', 'left', true);
  txt('DPS 5 วิล่าสุด  ' + ps.dps5.toFixed(1), px, py + 36, 12, '#d5d9d0', 'left', true);
  txt('ดาเมจรวด ' + ps.total + ' · ' + ps.n + ' ครั้ง · ' + ps.span.toFixed(1) + ' วิ', px, py + 52, 11, '#9aa39a', 'left', true);
  txt('คอมโบตอนนี้ ' + ps.cn + ' ครั้ง (' + ps.cd + ')', px, py + 70, 12, ps.cn >= 3 ? '#ffb070' : '#d5d9d0', 'left', true);
  txt('คอมโบดีสุด ' + ps.bn + ' ครั้ง (' + ps.bd + ') · สูงสุด/ครั้ง ' + ps.peak, px, py + 86, 11, '#9aa39a', 'left', true);
  txt('คริ ' + ps.crits + '/' + ps.nh + ' (' + Math.round(ps.critRate * 100) + '%) · ตอนนี้ ' + Math.round(ps.critNow * 100) + '% ×' + ps.critMul, px, py + 102, 11, '#66e0ff', 'left', true);
  hh = rr.hits.slice(-5).reverse();
  for (hi = 0; hi < hh.length; hi++) txt((hi === 0 ? '▶ ' : '  ') + Math.round(hh[hi].d) + (hh[hi].c ? ' CRIT' : '') + (hi + 1 < hh.length ? '  (+' + (hh[hi].t - hh[hi + 1].t).toFixed(2) + ' วิ)' : ''), px, py + 118 + hi * 13, 11, hi === 0 ? '#fff' : '#9aa39a', 'left', true);
}
/* ข้อความแนะนำล่างจอ: ตัดบรรทัดอัตโนมัติ (เดิมประโยคยาว ๆ ล้นขอบจอ) */
function hudHint(g) {
  if (hint.t <= 0) return;
  var kh = Math.min(g.k, 1.25), maxW = Math.max(360, (isTouch ? VW - 300 / UIK : W - 80) / kh - 36), lines, i, bw = 0, bh;
  hudBlock(CX, H - 22, kh, function () {
    lines = wrapText(hint.text, 14, true, maxW, 3);
    for (i = 0; i < lines.length; i++) bw = Math.max(bw, tw(lines[i], 14, true));
    bw += 36; bh = lines.length * 19 + 11;
    ctx.globalAlpha = clamp(hint.t, 0, 1);
    ctx.fillStyle = 'rgba(8,14,10,.82)'; ctx.fillRect(CX - bw / 2, H - 22 - bh, bw, bh);
    for (i = 0; i < lines.length; i++) txt(lines[i], CX, H - 22 - bh + 15 + i * 19, 14, '#e9e7df', 'center', true);
    ctx.globalAlpha = 1;
  });
}
function drawHUD() {
  var p = P, m = M, g = hudGeom(), k = g.k, limL, limR;
  HUDG = g; TXK = 1;
  if (p.hp <= p.maxHp * .35 && !p.dead) {
    var vg = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .8); var vp = .22 + .1 * Math.sin(tNow * 6);
    vg.addColorStop(0, 'rgba(200,30,30,0)'); vg.addColorStop(1, 'rgba(200,30,30,' + vp + ')'); ctx.fillStyle = vg; ctx.fillRect(-OFFX, 0, VW, H);
  }
  hudBlock(g.hl, 20, k, function () { HUDLB = 20 + (hudLeft(g.hl, g.LW) - 20) * k; });
  limL = CX - (CX - (g.hl + g.LW * k + 8)) / k; limR = CX + ((g.hr - g.RW * k - 8) - CX) / k;
  hudBlock(CX, 18, k, function () { hudCenter(g.CW, limL, limR); });
  hudBlock(g.hr, 22, k, function () { hudRight(g.hr, g.RW); });
  if (PRAC) hudBlock(g.hr, 132, Math.min(k, 1.2), function () { hudPrac(g.hr); });
  hudBlock(CX, H - 62, Math.min(k, 1.3), tutDraw);
  hudHint(g);
  if (paused) { ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 0, W, H); txt('พักเกม — กด P เพื่อเล่นต่อ', CX, CY, 24, '#fff', 'center', true); }
  if (mute()) txt('🔇', W - 24, H - 20, 14, '#9aa39a', 'right');
}
function mute() { return muted; }
function draw() {
  if (mode === 'village' && V) { drawVillage(); return; }
  if (mode === 'field' && FIELD) { drawField(); return; }
  ctx.setTransform(RS, 0, 0, RS, 0, 0); ctx.fillStyle = '#0a0f0b'; ctx.fillRect(0, 0, VW, H); ctx.translate(OFFX, 0);
  TXK = WK; /* ข้อความลอยในสนามขยายตามจอเล็ก · ก้อน HUD ตั้งค่า TXK เองใน hudBlock */
  ctx.drawImage(bg, 0, 0);
  ctx.save();
  if (shake > .3) ctx.translate(rand(-shake, shake), rand(-shake, shake));
  if (punch > .02) { var pz = 1 + punch * .018; ctx.translate(CX, CY); ctx.scale(pz, pz); ctx.translate(-CX, -CY); }
  var i;
  for (i = 0; i < decals.length; i++) { var d = decals[i]; ctx.fillStyle = d.c; ctx.beginPath(); ctx.ellipse(d.x, d.y, d.r, d.r * .7, 0, 0, TAU); ctx.fill(); }
  for (i = 0; i < clouds.length; i++) {
    var c = clouds[i], fade = clamp((c.life - c.t) / 1.2, 0, 1), pr = c.r + Math.sin(tNow * 3 + i) * 3;
    var cp = c.t < .7 ? Math.min(.5,c.t/.7*.5) : (fade < 1 ? .5+(1-fade)*.5 : .5);
    if (visualFx(ctx,'fx_spore',c.x,c.y,pr*2.9,cp,fade)) continue;
    var cg = ctx.createRadialGradient(c.x, c.y, 4, c.x, c.y, pr);
    cg.addColorStop(0, 'rgba(176,106,216,' + (.5 * fade) + ')'); cg.addColorStop(1, 'rgba(176,106,216,0)');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(c.x, c.y, pr, 0, TAU); ctx.fill();
  }
  if (SHRINE) {
    var sh = SHRINE, sg = sh.lost ? .25 : clamp(sh.hp / 100, .3, 1);
    ctx.fillStyle = 'rgba(110,230,160,' + (.12 + .08 * Math.sin(tNow * 2)) * sg + ')'; ctx.beginPath(); ctx.arc(sh.x, sh.y, 70, 0, TAU); ctx.fill();
    for (i = 0; i < 9; i++) { var sa2 = i * TAU / 9 + 1, sr = 20 + (i % 3) * 6; ctx.fillStyle = sh.lost ? '#3a3228' : 'rgb(' + Math.round(60 + 20 * (1 - sg)) + ',' + Math.round(150 * sg + 40) + ',' + Math.round(95 * sg + 30) + ')'; ctx.beginPath(); ctx.arc(sh.x + Math.cos(sa2) * 16, sh.y + Math.sin(sa2) * 14, sr, 0, TAU); ctx.fill(); }
    if (!sh.lost) { ctx.fillStyle = 'rgba(230,255,200,' + (.5 + .3 * Math.sin(tNow * 3)) + ')'; for (i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(sh.x + Math.cos(tNow + i * 1.6) * 24, sh.y + Math.sin(tNow * 1.3 + i * 1.6) * 20 - 6, 3, 0, TAU); ctx.fill(); } }
    if (sh.burning) for (i = 0; i < 5; i++) { var fx5 = sh.x + Math.sin(tNow * 3 + i * 2) * 26, fy5 = sh.y - 8 - Math.abs(Math.sin(tNow * 7 + i)) * 26; var fg5 = ctx.createRadialGradient(fx5, fy5, 1, fx5, fy5, 20); fg5.addColorStop(0, 'rgba(255,230,120,.9)'); fg5.addColorStop(1, 'rgba(230,70,20,0)'); ctx.fillStyle = fg5; ctx.beginPath(); ctx.arc(fx5, fy5, 20, 0, TAU); ctx.fill(); }
    if (sh.burning && sh.ext > 0) { ctx.strokeStyle = '#9be8ff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(sh.x, sh.y, 44, -Math.PI / 2, -Math.PI / 2 + TAU * sh.ext / 1.8); ctx.stroke(); }
    if (M && M.torch) { ctx.strokeStyle = 'rgba(255,140,50,' + (.35 + .25 * Math.sin(tNow * 10)) + ')'; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(M.x, M.y); ctx.lineTo(sh.x, sh.y); ctx.stroke(); ctx.setLineDash([]); }
  }
  for (i = 0; i < FIRES.length; i++) {
    var fr = FIRES[i], ff = clamp((fr.life - fr.t) / 1.5, 0, 1) * clamp(fr.t / .25, 0, 1), fp = fr.r * (.9 + .12 * Math.sin(tNow * 9 + i * 1.7));
    if (visualFx(ctx,'fx_fire',fr.x,fr.y,fr.r*2.75,tNow+i*.2,ff)) continue;
    var fg = ctx.createRadialGradient(fr.x, fr.y, 2, fr.x, fr.y, fp); fg.addColorStop(0, 'rgba(255,220,110,' + (.85 * ff) + ')'); fg.addColorStop(.5, 'rgba(255,120,40,' + (.55 * ff) + ')'); fg.addColorStop(1, 'rgba(200,40,10,0)');
    ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(fr.x, fr.y, fp, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,230,140,' + (.7 * ff) + ')'; ctx.beginPath(); ctx.arc(fr.x + Math.sin(tNow * 12 + i) * 4, fr.y - 4 - 3 * Math.abs(Math.sin(tNow * 8 + i)), fr.r * .22, 0, TAU); ctx.fill();
  }
  for (i = 0; i < THICKETS.length; i++) {
    var th = THICKETS[i], tf = Math.min(1, th.t / 1.2), grow = Math.min(1, (th.max - th.t) / .35);
    ctx.fillStyle = 'rgba(70,120,60,' + (.28 * tf) + ')'; ctx.beginPath(); ctx.arc(th.x, th.y, th.r * grow, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(143,209,138,' + (.6 * tf) + ')'; ctx.lineWidth = 2; ctx.stroke();
    for (var tk = 0; tk < 9; tk++) { var ta = tk * 2.4 + 1, tr2 = th.r * .75 * grow * (.3 + (tk % 3) * .3); ctx.fillStyle = 'rgba(60,110,50,' + (.9 * tf) + ')'; ctx.beginPath(); ctx.arc(th.x + Math.cos(ta) * tr2, th.y + Math.sin(ta) * tr2, 6 + (tk % 4), 0, TAU); ctx.fill(); }
  }
  if (M && M.tether > 0 && M.state !== 'downed') { ctx.strokeStyle = 'rgba(159,225,203,' + (.55 + .25 * Math.sin(tNow * 14)) + ')'; ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(M.x, M.y); ctx.stroke(); ctx.setLineDash([]); }
  for (i = 0; i < PODS.length; i++) {
    var pd = PODS[i];
    if (pd.cd > 0) { ctx.fillStyle = 'rgba(80,110,60,.6)'; ctx.beginPath(); ctx.arc(pd.x, pd.y, 5, 0, TAU); ctx.fill(); continue; }
    var pl = .5 + .5 * Math.sin(tNow * 3 + i * 2);
    var pg = ctx.createRadialGradient(pd.x, pd.y, 2, pd.x, pd.y, 30);
    pg.addColorStop(0, 'rgba(155,232,106,' + (.35 + .2 * pl) + ')'); pg.addColorStop(1, 'rgba(155,232,106,0)');
    ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(pd.x, pd.y, 30, 0, TAU); ctx.fill();
    ctx.fillStyle = '#6fbf4a'; ctx.beginPath(); ctx.arc(pd.x, pd.y, pd.r, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#d8ffb0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(pd.x, pd.y, pd.r - 4 + pl * 2, 0, TAU); ctx.stroke();
  }
  drawTelegraph();
  drawMonster(); drawBugs(); drawTendrils(); drawWound(); drawTele2(); drawPlayer(); drawAlly();
  for (i = 0; i < darts.length; i++) {
    var dd = darts[i]; ctx.strokeStyle = dd.med ? '#ffb0e0' : '#9fe8ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(dd.x, dd.y); ctx.lineTo(dd.x - Math.cos(dd.a) * 16, dd.y - Math.sin(dd.a) * 16); ctx.stroke();
  }
  for (i = 0; i < rings.length; i++) {
    var rg = rings[i], k = rg.t / rg.life;
    if (['#ffd45a','#fff2a8','#fff','#ffffff','#ffb066'].indexOf(rg.c) >= 0 && visualFx(ctx,'fx_impact',rg.x,rg.y,rg.r1*3.05,k,1)) continue; ctx.strokeStyle = rg.c; ctx.globalAlpha = 1 - k; ctx.lineWidth = rg.lw;
    ctx.beginPath(); ctx.arc(rg.x, rg.y, lerp(rg.r0, rg.r1, k), 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
  }
  for (i = 0; i < slashes.length; i++) {
    var sl = slashes[i], sk = sl.t / sl.life, sx1 = sl.x + Math.cos(sl.a) * sl.len * (.35 + .65 * sk), sy1 = sl.y + Math.sin(sl.a) * sl.len * (.35 + .65 * sk), sx0 = sl.x + Math.cos(sl.a) * sl.len * .1 * sk, sy0 = sl.y + Math.sin(sl.a) * sl.len * .1 * sk;
    ctx.globalAlpha = 1 - sk; ctx.strokeStyle = sl.c; ctx.lineWidth = Math.max(1, sl.w * (1 - sk * .75)); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx0, sy0); ctx.lineTo(sx1, sy1); ctx.stroke(); ctx.lineCap = 'butt'; ctx.globalAlpha = 1;
  }
  for (i = 0; i < parts.length; i++) { var q = parts[i]; ctx.globalAlpha = clamp(1 - q.t / q.life, 0, 1); ctx.fillStyle = q.c; ctx.fillRect(q.x, q.y, q.s, q.s); }
  ctx.globalAlpha = 1;
  drawScanOverlay();
  for (i = 0; i < texts.length; i++) { var t = texts[i]; ctx.globalAlpha = clamp(1 - (t.t / t.life) * .8, 0, 1); txt(t.s, t.x, t.y, t.z, t.c, 'center', true); }
  ctx.globalAlpha = 1;
  ctx.restore();
  // vignette
  var vg = ctx.createRadialGradient(CX, CY, 260, CX, CY, 560);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (P.hp < 30 && !P.dead && mode === 'playing') { ctx.fillStyle = 'rgba(200,30,30,' + (.08 + .06 * Math.sin(tNow * 8)) + ')'; ctx.fillRect(0, 0, W, H); }
  if (fxOn('blind') && mode === 'playing') { /* ตาพร่า: หมอกเหลืองมัวนอกวงรอบตัว */
    var bhz = ctx.createRadialGradient(P.x, P.y, BLIND_R * .55, P.x, P.y, BLIND_R * 1.35), bfa = clamp(P.fx.blind / .8, 0, 1);
    bhz.addColorStop(0, 'rgba(232,232,160,0)'); bhz.addColorStop(1, 'rgba(48,46,16,' + (.62 * bfa) + ')');
    ctx.fillStyle = bhz; ctx.fillRect(-OFFX, 0, VW, H);
  }
  if (flashA > .01) { ctx.globalAlpha = flashA; ctx.fillStyle = flashC; ctx.fillRect(-OFFX, 0, VW, H); ctx.globalAlpha = 1; }
  TXK = 1;
  drawHUD(); drawChain();
}


