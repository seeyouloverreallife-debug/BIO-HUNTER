function drawField() {
  var F = FIELD, p = P, m = M, i;
  var cmg = isTouch ? 270 : 0; /* จอสัมผัส: ยอมให้กล้องล้นขอบโลกเล็กน้อย เพื่อไม่ให้ตัวละครที่ขอบซ้าย/ขวาถูกมินิแมปและปุ่มทับ */
  F.camX = clamp(p.x - VW / 2, -cmg, WW - VW + cmg); F.camY = clamp(p.y - H / 2, 0, WH - H);
  ctx.setTransform(RS, 0, 0, RS, 0, 0); ctx.fillStyle = '#0a0f0b'; ctx.fillRect(0, 0, VW, H);
  TXK = WK;
  ctx.save(); ctx.translate(-F.camX, -F.camY);
  ctx.drawImage(fbg, 0, 0);
  if (F.fires) for (i = 0; i < F.fires.length; i++) { var fq = F.fires[i], fa = clamp((fq.life - fq.t) / 2, 0, 1), fr2 = 30 * (.9 + .12 * Math.sin(tNow * 9 + i));
    if (visualFx(ctx,'fx_fire',fq.x,fq.y,82,tNow+i*.2,fa)) continue;
    var fg2 = ctx.createRadialGradient(fq.x, fq.y, 2, fq.x, fq.y, fr2); fg2.addColorStop(0, 'rgba(255,220,110,' + (.8 * fa) + ')'); fg2.addColorStop(.5, 'rgba(255,120,40,' + (.5 * fa) + ')'); fg2.addColorStop(1, 'rgba(200,40,10,0)');
    ctx.fillStyle = fg2; ctx.beginPath(); ctx.arc(fq.x, fq.y, fr2, 0, TAU); ctx.fill(); }
  // ชื่อโซน (จางๆ บนพื้น) — แสดงเฉพาะที่เคยสำรวจ
  for (i = 0; i < ZONE_LB.length; i++) { var zl = ZONE_LB[i]; if (fogKnown(F, zl.x, zl.y)) { ctx.globalAlpha = .38; txt(zl.n, zl.x, zl.y + (i === 3 ? -SITES.bloom.r - 12 : -SITES.meadow.r * (i === 0 ? .55 : 0) - 8), 20, zl.c, 'center', true); ctx.globalAlpha = 1; } }
  // ระบบนิเวศ: ขอบวงสปอร์หลักตามสุขภาพป่า + หย่อมสปอร์ที่ลอยอยู่ตามแมพ
  if (Math.abs((F.hz || 1) - 1) > .04) { ctx.save(); ctx.strokeStyle = 'rgba(210,150,255,.42)'; ctx.setLineDash([10, 10]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(SITES.bloom.x, SITES.bloom.y, SITES.bloom.r * F.hz, 0, TAU); ctx.stroke(); ctx.restore(); }
  if (F.patches) for (i = 0; i < F.patches.length; i++) {
    var pt = F.patches[i], pls = .5 + .5 * Math.sin(tNow * 2 + i * 1.7), pg2 = ctx.createRadialGradient(pt.x, pt.y, 4, pt.x, pt.y, pt.r);
    pg2.addColorStop(0, 'rgba(190,120,240,' + (.42 + .14 * pls) + ')'); pg2.addColorStop(.7, 'rgba(176,106,216,' + (.24 + .08 * pls) + ')'); pg2.addColorStop(1, 'rgba(176,106,216,0)');
    ctx.fillStyle = pg2; ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(226,170,255,.5)'; ctx.setLineDash([6, 8]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r * .92, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  }
  // วงเสียงของผู้เล่น (ยิ่งเดินเสียงยิ่งดัง · แดงเมื่อมันได้ยินแล้ว)
  ctx.save(); ctx.setLineDash([7, 9]); ctx.lineWidth = 2;
  ctx.strokeStyle = F.heard ? 'rgba(255,110,90,.55)' : (F.sneak ? 'rgba(127,224,181,.3)' : (F.moving ? 'rgba(255,208,100,.34)' : 'rgba(190,205,195,.18)'));
  ctx.beginPath(); ctx.arc(p.x, p.y, F.noise, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  // signs: สีและไอคอนตามชนิด (ร่องรอย/สมุนไพร/พืช/หนัง)
  for (i = 0; i < SIGNS.length; i++) {
    var s = SIGNS[i]; if (F.done[s.id]) continue;
    var kd0 = signKind(s.id), bob = Math.sin(tNow * 3 + i) * 2.5;
    ctx.save(); ctx.globalAlpha = .22 + .12 * Math.sin(tNow * 3 + i); ctx.fillStyle = kd0.c; ctx.beginPath(); ctx.arc(s.x, s.y, 26, 0, TAU); ctx.fill(); ctx.restore();
    ctx.strokeStyle = kd0.c; ctx.globalAlpha = .85; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s.x, s.y, 11, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
    if (kd0.ic && SGIMG[kd0.ic]) ctx.drawImage(SGIMG[kd0.ic], s.x - 12, s.y - 15 + bob, 24, 24);
    else { ctx.fillStyle = 'rgba(8,14,10,.7)'; ctx.beginPath(); ctx.arc(s.x, s.y + bob * .5, 9, 0, TAU); ctx.fill(); txt('?', s.x, s.y + 1 + bob * .5, 13, kd0.c, 'center', true); }
  }
  drawCampsWorld(F); drawTrailWorld(F);
  if (F.bait && !F.bait.done) { ctx.fillStyle = 'rgba(190,140,70,.9)'; ctx.beginPath(); ctx.arc(F.bait.x, F.bait.y, 11, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,220,140,' + (.3 + .2 * Math.sin(tNow * 4)) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(F.bait.x, F.bait.y, 22 + 4 * Math.sin(tNow * 4), 0, TAU); ctx.stroke(); }
  for (i = 0; i < F.snares.length; i++) if (!F.snares[i].used) { var sn0 = F.snares[i]; ctx.strokeStyle = sn0.arm > 0 ? 'rgba(255,214,102,.8)' : 'rgba(120,200,150,.35)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.arc(sn0.x, sn0.y, 24, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
  // vision cone of monster (readable stealth)
  var st = ROUTINE[F.rt.i].k, asleep = st === 'rest' && F.rt.phase === 'do' && !F.restWoken;
  var vr = asleep ? 55 : (st === 'drink' && F.rt.phase === 'do' ? 170 : (st === 'graze' && F.rt.phase === 'do' && !F.headUp ? 150 : 290)), fov = asleep ? .3 : .95;
  var dm = dist(p.x, p.y, m.x, m.y);
  if (dm < 520) {
    ctx.fillStyle = 'rgba(' + (F.aw > .45 ? '255,90,70' : '255,220,120') + ',' + (.07 + .1 * F.aw) + ')';
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.arc(m.x, m.y, vr, m.face - fov, m.face + fov); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,.0)';
  drawMonster();
  if (asleep) txt('z Z', m.x, m.y - m.r - 14 + Math.sin(tNow * 2) * 3, 16, '#cfe8ff', 'center', true);
  if (F.aw > .45 && F.aw < 1) txt('?', m.x, m.y - m.r - 22, 26, '#ffd45a', 'center', true);
  var hid = F.hidden;
  if (!hid) drawPlayer();
  // bushes
  for (i = 0; i < HAB.bushes.length; i++) {
    var b = HAB.bushes[i];
    ctx.save(); ctx.globalAlpha *= hid && dist(p.x,p.y,b.x,b.y) < b.r ? .78 : .93;
    var bushArt = visualDraw(ctx,'fld_bush_' + ['a','b','c'][i % 3],b.x-b.r*1.12,b.y-b.r*1.12,b.r*2.24,b.r*2.24); ctx.restore();
    if (bushArt) continue;
    ctx.fillStyle = 'rgba(24,52,30,' + (hid && dist(p.x, p.y, b.x, b.y) < b.r ? .78 : .93) + ')'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(46,92,50,.8)'; ctx.beginPath(); ctx.arc(b.x - b.r * .25, b.y - b.r * .25, b.r * .62, 0, TAU); ctx.fill();
  }
  if (hid) { ctx.globalAlpha = .55; drawPlayer(); ctx.globalAlpha = 1; }
  // trees
  for (i = 0; i < HAB.trees.length; i++) {
    var t = HAB.trees[i];
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(t.x + 6, t.y + 8, t.r * 1.2, t.r * .9, 0, 0, TAU); ctx.fill();
    if (visualDraw(ctx,'fld_tree_' + ['a','b','c'][i % 3],t.x-t.r*1.65,t.y-t.r*1.65,t.r*3.3,t.r*3.3)) continue;
    ctx.fillStyle = '#12301b'; ctx.beginPath(); ctx.arc(t.x, t.y, t.r * 1.5, 0, TAU); ctx.fill();
    ctx.fillStyle = '#1d4a28'; ctx.beginPath(); ctx.arc(t.x - 4, t.y - 4, t.r * 1.05, 0, TAU); ctx.fill();
  }
  for (i = 0; i < texts.length; i++) { var tx = texts[i]; ctx.globalAlpha = clamp(1 - tx.t / tx.life, 0, 1); txt(tx.s, tx.x, tx.y, tx.z, tx.c, 'center', true); }
  ctx.globalAlpha = 1;
  // progress ring for sign/scan
  if (F.signId) { var ns = F.nearSign; ctx.strokeStyle = '#ffe28a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(p.x, p.y, 26, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(F.signT / ns.t, 0, 1)); ctx.stroke(); }
  if (F.scanT > 0 && !F.scan) { ctx.strokeStyle = '#9fe8ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, 20, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(F.scanT / scanTime(), 0, 1)); ctx.stroke(); }
  ctx.restore();
  // night-ish vignette
  var vg = ctx.createRadialGradient(VW / 2, H / 2, 260, VW / 2, H / 2, 600); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.4)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, H);
  ctx.translate(OFFX, 0);
  drawFieldHUD();
}
function drawFieldHUD() {
  var F = FIELD, p = P, m = M, i, g = hudGeom(), k = g.k, vx = isTouch ? g.hl : 24, needDx = !F.scan && !PREP.done.sample;
  TXK = 1;
  if (F.mapOpen) { drawFullMap(g); return; }
  /* ก้อนซ้ายบน: ท่าทาง/เสียง/ลม/ของที่พก */
  hudBlock(vx, 12, k, function () {
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(vx - 10, 12, needDx ? 360 : 270, needDx ? 126 : 106);
    txt('ภาคสนาม · ตามรอย ' + monName() + '', vx, 26, 13, '#e9e7df', 'left', true);
    txt('ท่าทางคุณ: ' + F.status, vx, 46, 12, F.hidden ? '#9fe8ff' : '#d5d9d0', 'left', true);
    txt('รัศมีเสียง ≈ ' + Math.round(F.noise) + ' px' + (F.heard ? ' — มันได้ยินแล้ว!' : ''), vx, 64, 12, F.heard ? '#ff9a8a' : '#9aa39a', 'left');
    var wa = F.wind; ctx.save(); ctx.translate(vx + 226, 74); ctx.strokeStyle = '#cfe8d8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-14 * Math.cos(wa), -14 * Math.sin(wa)); ctx.lineTo(14 * Math.cos(wa), 14 * Math.sin(wa)); ctx.stroke();
    ctx.fillStyle = '#cfe8d8'; ctx.beginPath(); ctx.arc(14 * Math.cos(wa), 14 * Math.sin(wa), 4, 0, TAU); ctx.fill(); ctx.restore();
    txt('ลม', vx + 226, 54, 11, '#9aa39a', 'center');
    txt('ยาสมานแผล ×' + invN('salve') + (PREP.done.herbs ? '+1' : '') + '   ยาสลบ ×' + invN('dart') + '   HP ' + Math.round(p.hp), vx, 90, 12, '#d5d9d0', 'left');
    txt('เหยื่อ ×' + F.baitLeft + (F.bait && !F.bait.done ? ' (วางอยู่)' : '') + '   กับดัก ×' + F.snareLeft + (F.snares.length ? ' (วางแล้ว ' + F.snares.length + ')' : ''), vx, 108, 12, '#ffd666', 'left');
    if (needDx) txt('ยังไม่ได้วินิจฉัย: ค้าง Q ใกล้เป้าหมาย (<360) ก่อนเข้าปะทะ', vx, 126, 11, '#ffd45a', 'left', true);
  });
  /* กลางบน: ความระแวงของเป้าหมาย */
  var seen = dist(p.x, p.y, m.x, m.y) < 420 && F.seenT < 5;
  hudBlock(CX, 14, k, function () {
    var bw = 300, bx = CX - bw / 2;
    txt('ความระแวงของมัน', CX, 20, 12, '#e9e7df', 'center', true);
    bar(bx, 30, bw, 10, F.aw, F.aw > .75 ? '#e0524a' : (F.aw > .45 ? '#e0a04a' : '#7fb86a'));
    txt(seen || F.scan || F.onScreen ? 'มัน: ' + STAGE_NAME[ROUTINE[F.rt.i].k] + (F.aw > .45 ? ' (ระแวง!)' : '') : (F.lk ? 'มัน: ไม่เห็นตัว (เห็นล่าสุด ' + Math.round(F.t - F.lk.t) + ' วิก่อน)' : 'มัน: ยังไม่เห็นตัว'), CX, 54, 12, '#d5d9d0', 'center', true);
    if (F.trailT > 0) txt('รอยเท้าเรืองแสง ' + Math.ceil(F.trailT) + ' วิ', CX, 72, 12, '#9fe8ff', 'center', true);
  });
  /* ล่างกลาง: ข้อความเหตุการณ์ / ปุ่มตรวจร่องรอย / วิธีควบคุม */
  hudBlock(CX, H - 18, Math.min(k, 1.3), function () {
    var fy = H - 70, fmw = Math.max(360, (isTouch ? VW - 300 / UIK : W - 80) / Math.min(k, 1.3)), fl, fj;
    var feedHeight = 0;
    for (var fi = 0; fi < F.feed.length; fi++) feedHeight += wrapText(F.feed[fi].t, 13, true, fmw, 3).length * 18 + 2;
    var feedTop = Math.max(170, Math.min(H - 66, fy - feedHeight - 12));
    ctx.fillStyle = 'rgba(6,12,8,.68)'; ctx.fillRect(CX - fmw / 2 - 12, feedTop, fmw + 24, H - feedTop - 6);
    for (i = 0; i < F.feed.length; i++) {
      ctx.globalAlpha = clamp(F.feed[i].life, 0, 1); fl = wrapText(F.feed[i].t, 13, true, fmw, 3);
      for (fj = fl.length - 1; fj >= 0; fj--) { txt(fl[fj], CX, fy, 13, '#ffe9a8', 'center', true); fy -= 18; }
      fy -= 2;
    }
    ctx.globalAlpha = 1;
    if (F.nearSign && !F.signId) txt((isTouch ? 'กด ตรวจ/เก็บ ค้างเพื่อ: ' : 'กด F ค้างเพื่อ: ') + F.nearSign.name, CX, H - 42, 14, '#ffe28a', 'center', true);
    else if (F.nearCamp >= 0 && F.campMenu < 0) txt((isTouch ? 'กด ตรวจ/เก็บ (แตะ) เพื่อ: ' : 'กด F (แตะ) เพื่อ: ') + 'พักฟื้น/ย้ายค่าย · ' + CAMPS[F.nearCamp].n, CX, H - 42, 14, '#ffe28a', 'center', true);
    var hp0 = !isTouch ? 'WASD เดิน · C ย่อ/ย่องเงียบ · F ตรวจ/เก็บ · Q สแกน · N แผนที่ · J โจมตีลับหลัง · X ถอนตัว' : 'จอยซ้ายเดิน · ย่อ = เงียบ · ตรวจ/เก็บ ค้างใกล้จุดเรืองแสง · สแกนได้ไกล · แผนที่ = แตะมินิแมป · ตี = โจมตีลับหลังเมื่อชิดตัว';
    txt(fitText(hp0, 11, false, Math.max(360, (isTouch ? VW - 300 / UIK : W - 40) / Math.min(k, 1.3))), CX, H - 18, 11, '#9aa39a', 'center');
  });
  /* มินิแมป: มีหมอกสำรวจ · จอสัมผัสย้ายไปใต้กล่องซ้ายบน (ปุ่มด้านขวาสูงถึงกลางจอ) */
  var mmw = 212, mmh = Math.round(212 * WH / WW);
  var mmCap = isTouch ? 108 : 140; if (mmh > mmCap) { mmw = Math.round(mmCap * WW / WH); mmh = mmCap; } /* จำกัดความสูงมินิแมป (แมพสูง/จอสัมผัส) ไม่ให้ชนจอยสติ๊ก */
  var mapY = isTouch ? Math.round(12 + (needDx ? 126 : 106) * k + 10) : 122, kk = Math.min(k, 1.2), ax = isTouch ? vx : g.hr, mmx = isTouch ? vx - 6 : g.hr - mmw;
  /* ตัวชี้ขอบจอ: เป้าหมาย/ร่องรอยที่อยู่นอกจอ + ระยะ (หลบกล่องซ้ายบนและมินิแมป) */
  var mmx0 = ax + (mmx - 4 - ax) * kk;
  drawEdgeMarks(k, [{ x0: CX - 165 * k, x1: CX + 165 * k, y1: (F.trailT > 0 ? 82 : 64) * k }, { x0: vx - 10, x1: vx - 10 + (needDx ? 360 : 270) * k, y1: 12 + (needDx ? 126 : 106) * k }, { x0: mmx0, x1: mmx0 + (mmw + 8) * kk, y1: mapY + (mmh + 44) * kk }]);
  F.mmRect = { x: ax + (mmx - 4 - ax) * kk + OFFX, y: mapY - 4 * kk, w: (mmw + 8) * kk, h: (mmh + 8 + 30) * kk };
  hudBlock(ax, mapY, kk, function () {
    drawMapCore(mmx, mapY, mmw, mmh, false);
    txt('สำรวจ ' + fogPct(F) + '% · ร่องรอย ' + fieldSignsDone(F) + '/' + SIGNS.length + ' · [N] แผนที่', mmx, mapY + mmh + 14, 10, '#cfe8d8', 'left', true);
    var hv0 = Math.round(forestOf(F.region)); txt(MAP.name + ' · ป่า ' + hv0 + '%' + (F.patches && F.patches.length ? ' · สปอร์ ' + F.patches.length : ''), mmx, mapY + mmh + 28, 10, hv0 >= 70 ? '#7fe0b5' : (hv0 >= 40 ? '#e8d86a' : '#e86a5a'), 'left', true);
  });
  if (F.campMenu >= 0) drawCampMenu(); else { F.cmRects = null; F.cmPanel = null; }
}

