/* ===== หน้าจอก่อนเข้าเกม ===== */
function hasProgress() { return !!(S && (S.hunts > 0 || S.wins > 0 || S.xp > 0 || S.tut)); }
function titleSlot() {
  var ks = ['stag'], i, sum = 0;
  if (S.wins >= 1) ks.push('boar'); if (S.wins >= 2) ks.push('rabbit');
  for (i = 0; i < ks.length; i++) sum += forestOf(ks[i]);
  return RANK_NAME[rankIdx()] + ' · ล่าแล้ว ' + S.hunts + ' ครั้ง · ป่าเฉลี่ย ' + Math.round(sum / ks.length) + '%';
}
function renderTitle() {
  if (!titleEl) return;
  var go = hasProgress(), h = '', i, ffs = '';
  for (i = 0; i < 14; i++) ffs += '<i class="ff' + (i % 4 === 0 ? ' c' : '') + '" style="left:' + (4 + (i * 37) % 92) + '%;top:' + (12 + (i * 53) % 70) + '%;animation-delay:-' + ((i * 7) % 6) + 's;animation-duration:' + (5 + i % 4) + 's"></i>';
  h += ffs + '<div class="tt-col"><div class="tt-eye">FERN HOLLOW STATION</div><h1 class="tt-h1">BIO-HUNTER</h1><div class="tt-sub">WARDEN PROTOCOL</div><div class="tt-tag">ดูแลป่า ไม่ใช่แค่ล่า — วินิจฉัยก่อนตัดสินใจ</div>';
  if (go) {
    h += '<div class="tt-box"><b>เซฟล่าสุด</b><span>' + titleSlot() + '</span></div><button class="tbtn p" data-act="tgo">เล่นต่อ</button>' +
      '<div class="tt-row"><button class="tbtn" data-act="ttut">บทสอน</button><button class="tbtn" data-act="tguide">คู่มือ</button><button class="tbtn" data-act="tset">ตั้งค่า</button></div>' +
      '<button class="tbtn g' + (titleArm ? ' arm' : '') + '" data-act="tnew">' + (titleArm ? 'แตะอีกครั้งเพื่อยืนยัน — เซฟจะถูกลบ' : 'เริ่มเกมใหม่') + '</button>';
  } else {
    h += '<div class="tt-box"><b>เริ่มครั้งแรก?</b><span>มีบทสอนสั้น ๆ สอนครบก่อนออกล่าจริง</span></div><button class="tbtn p" data-act="tgo">เริ่มเกม</button>' +
      '<button class="tbtn" data-act="ttut">เรียนรู้วิธีเล่น (แนะนำ)</button>' +
      '<div class="tt-row"><button class="tbtn" data-act="tguide">คู่มือ</button><button class="tbtn" data-act="tset">ตั้งค่า</button></div>';
  }
  h += '</div><div class="tt-foot">v' + GAME_VER + ' · เซฟอยู่ในเครื่องนี้เท่านั้น</div>';
  titleEl.innerHTML = h;
}
function enterTitle() { mode = 'title'; paused = false; titleArm = 0; initWorld(); hidePanel(); renderTitle(); }
function giftCollect() {
  var out = [], k, i, day = todayKey(), tr, n, sm;
  if (!S.gift) S.gift = {};
  for (i = 0; i < SPECIES.length; i++) {
    k = SPECIES[i]; tr = trustOf(k); sm = SP_MATS[k];
    if (tr < 70 || S.gift[k] === day || !sm) continue;
    S.gift[k] = day; n = tr >= 90 ? 2 : 1;
    S.mats[sm.common] = clamp(S.mats[sm.common] + n, 0, 9999); S.mats.coin = clamp(S.mats.coin + (tr >= 90 ? 25 : 12), 0, 9999);
    out.push(monNameOf(k, 0).split(' ').pop() + ' นำ ' + MATS[sm.common] + ' ×' + n + ' มาฝากที่รั้ว');
  }
  if (out.length) persist();
  return out;
}
function enterVillage(note) {
  mode = 'village'; paused = false; initWorld(); hidePanel();
  hubNote = '';
  if (!note && S.hunts + S.wins > 0) { var gf = giftCollect(); if (gf.length) note = 'ของขวัญจากสัตว์ป่า: ' + gf.join(' · '); }
  V = { x: V ? V.x : 700, y: V ? V.y : 330, face: 0, walk: 0, near: null, t: 0, note: note || '', noteT: note ? 6 : 0, bubble: null, bubT: 0 };
  if (!V.note) { V.note = 'เดินด้วย WASD / จอยสติ๊ก · เข้าใกล้ NPC แล้วกด F (หรือปุ่ม ตรวจ/เก็บ) เพื่อคุย'; V.noteT = 7; }
}
function pushRect(o, rx, ry, rw, rh, pad) {
  var cx = clamp(o.x, rx, rx + rw), cy = clamp(o.y, ry, ry + rh), dx = o.x - cx, dy = o.y - cy, d = Math.hypot(dx, dy), r = 14 + (pad || 0);
  if (d < r) { if (d < .01) { o.y = ry + rh + r; return; } o.x = cx + dx / d * r; o.y = cy + dy / d * r; }
}
function updateVillage(dt) {
  V.t += dt; if (V.noteT > 0) V.noteT -= dt; if (V.bubT > 0) V.bubT -= dt;
  var mvx = 0, mvy = 0;
  if (keys['w'] || keys['arrowup']) mvy -= 1; if (keys['s'] || keys['arrowdown']) mvy += 1;
  if (keys['a'] || keys['arrowleft']) mvx -= 1; if (keys['d'] || keys['arrowright']) mvx += 1;
  var ml = Math.hypot(mvx, mvy);
  if (ml) { V.x += mvx / ml * 190 * dt; V.y += mvy / ml * 190 * dt; V.face = Math.atan2(mvy, mvx); V.walk += 190 * dt * .08; }
  V.x = clamp(V.x, 24, 936); V.y = clamp(V.y, 70, 575);
  for (var i = 0; i < VIL_RECTS.length; i++) pushRect(V, VIL_RECTS[i].x, VIL_RECTS[i].y, VIL_RECTS[i].w, VIL_RECTS[i].h);
  pushRect(V, 760, 334, 170, 14); /* ฐานประตูป่า */
  pushOut(V, 470, 440, 26);
  var best = null, bd = 70;
  for (i = 0; i < VIL_NPCS.length; i++) { var n = VIL_NPCS[i], d = Math.hypot(n.x - V.x, n.y - V.y); if (d < 22) pushOut(V, n.x, n.y, 18); if (d < bd) { bd = d; best = n; } }
  V.near = best;
}
function villageInteract() {
  if (!V || !V.near) return;
  var n = V.near;
  sfx('scan');
  if (!n.view) { V.bubble = n.name + ': ' + npcLine(n.id); V.bubNpc = n; V.bubT = 5; return; }
  hubSay = { n: n, line: npcLine(n.id) };
  openHub(n.view, '');
}
/* ---- v17.9 ภาพหมู่บ้าน: อาคาร · NPC · ผู้ช่วย ---- */
function vimg(k) { return VIMG[k] || null; }
function vilPlaque(s, x, y) { var w = tw(s, 11, true) + 14; ctx.fillStyle = 'rgba(10,16,12,.74)'; ctx.fillRect(x - w / 2, y - 9, w, 18); ctx.strokeStyle = 'rgba(214,190,130,.55)'; ctx.lineWidth = 1; ctx.strokeRect(x - w / 2 + .5, y - 8.5, w - 1, 17); txt(s, x, y + 1, 11, '#f4ead0', 'center', true); }
function vilAnimal(kind, x, y, ang, w, al) { /* สัตว์ผู้ช่วย/ในคอก: ภาพมองจากบน หันขวา · ไม่มีภาพ = ก้อนสีเดิม */
  var im = vimg('ally_' + kind);
  ctx.save(); ctx.globalAlpha = al == null ? 1 : al; ctx.translate(x, y); ctx.rotate(ang);
  if (im) { var h = w * im.h / im.w; ctx.drawImage(im.el, -w / 2, -h / 2, w, h); }
  else { ctx.fillStyle = kind === 'boar' ? '#6a4c3e' : (kind === 'rabbit' ? '#b8a890' : '#a07a4a'); ctx.beginPath(); ctx.ellipse(0, 0, w * .32, w * .2, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(w * .3, 0, w * .13, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function vilTent(x, y, w, h, col) { /* เต็นท์แคมป์ (x,y = กึ่งกลางฐาน) */
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(x + 4, y + 2, w * .55, 9, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = col; ctx.strokeStyle = '#2a2016'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x, y - h); ctx.lineTo(x + w / 2, y); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x + w / 2, y); ctx.lineTo(x + w * .12, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3a2c1e'; ctx.beginPath(); ctx.moveTo(x - w * .13, y); ctx.lineTo(x, y - h * .42); ctx.lineTo(x + w * .13, y); ctx.closePath(); ctx.fill();
}
function vilBuilding(b) {
  var im = vimg(b.art), i;
  if (!im) { /* ภาพยังไม่โหลด: กล่องเดิม */
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(b.x + 6, b.y + 8, b.w, b.h); ctx.fillStyle = '#6a5a44'; ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = b.roof; ctx.fillRect(b.x - 6, b.y - 6, b.w + 12, b.h * .62); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(b.x - 6, b.y - 6 + b.h * .3, b.w + 12, 4);
    txt(b.sign, b.x + b.w / 2, b.y + b.h * .8, 12, '#f0e8d0', 'center', true); return;
  }
  var w = b.aw, h = w * im.h / im.w, top = b.ay - h;
  ctx.fillStyle = 'rgba(0,0,0,.26)'; ctx.beginPath(); ctx.ellipse(b.ax + 6, b.ay - 3, w * .46, 11, 0, 0, TAU); ctx.fill();
  ctx.drawImage(im.el, b.ax - w / 2, top, w, h);
  if (b.art === 'vil_workshop') { var gx = b.ax - w / 2 + .42 * w, gy = top + .62 * h, gl = ctx.createRadialGradient(gx, gy, 1, gx, gy, 22); gl.addColorStop(0, 'rgba(255,170,70,' + (.45 + .15 * Math.sin(V.t * 9)) + ')'); gl.addColorStop(1, 'rgba(255,140,60,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(gx, gy, 22, 0, TAU); ctx.fill(); }
  if (b.art === 'vil_rehab_pen') { /* สัตว์ในคอก: อยู่บนพื้นฟางในภาพ + แถบสภาพ */
    for (i = 0; i < S.pen.length; i++) {
      var pa = S.pen[i], px0 = b.ax - 50 + (i % 4) * 34, py0 = top + h * .6 + Math.floor(i / 4) * 24 + Math.sin(V.t * 2 + i) * 1.5;
      vilAnimal(pa.kind, px0, py0, i % 2 ? Math.PI : 0, pa.kind === 'rabbit' ? 26 : 38, 1);
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(px0 - 11, py0 + 11, 22, 4); ctx.fillStyle = pa.cond >= 70 ? '#7fe0b5' : (pa.cond >= 40 ? '#e8d86a' : '#e86a5a'); ctx.fillRect(px0 - 10, py0 + 12, 20 * pa.cond / 100, 2);
    }
  }
  vilPlaque(b.sign, b.ax, b.ay - 24);
}
function vilGate() {
  var g = VIL_GATE, im = vimg(g.art);
  if (!im) { ctx.fillStyle = '#5a4630'; ctx.fillRect(920, 235, 14, 130); ctx.fillStyle = '#7a6040'; ctx.fillRect(900, 228, 56, 12); txt('ประตูสู่ป่า →', 880, 220, 11, '#e8d8a0', 'center', true); return; }
  var w = g.aw, h = w * im.h / im.w;
  ctx.fillStyle = 'rgba(0,0,0,.24)'; ctx.beginPath(); ctx.ellipse(g.ax + 4, g.ay - 4, w * .42, 9, 0, 0, TAU); ctx.fill();
  ctx.drawImage(im.el, g.ax - w / 2, g.ay - h, w, h);
  vilPlaque('ประตูสู่ป่า →', g.ax, g.ay - h + 6);
}
function vilNpc(n, i) {
  var near = V.near === n, bob = Math.sin(V.t * 2 + i) * 1.2, im, hh, ww;
  if (n.obj && n.id === 'garden') {
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(n.x, n.y + 10, 12, 6, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#4a3320'; ctx.fillRect(n.x - 34, n.y - 14, 68, 32); ctx.strokeStyle = '#2e1f12'; ctx.lineWidth = 2; ctx.strokeRect(n.x - 34, n.y - 14, 68, 32);
    for (var gi = 0; gi < 3; gi++) { var pl = S.plots[gi]; var gx = n.x - 22 + gi * 22; ctx.fillStyle = pl ? (S.hunts - pl.t >= GARDEN_GROW ? '#9be86a' : '#5aa04a') : '#3a2818'; ctx.beginPath(); ctx.arc(gx, n.y + 2, pl ? (S.hunts - pl.t >= GARDEN_GROW ? 8 : 5) : 3, 0, TAU); ctx.fill(); }
  } else if (n.obj) {
    im = n.art ? vimg(n.art) : null;
    if (im) {
      ww = n.aw; hh = ww * im.h / im.w;
      ctx.fillStyle = 'rgba(0,0,0,.26)'; ctx.beginPath(); ctx.ellipse(n.x + 4, n.y + 22, ww * .38, 8, 0, 0, TAU); ctx.fill();
      if (near) { ctx.strokeStyle = 'rgba(255,233,160,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(n.x, n.y + 22, ww * .45, 11, 0, 0, TAU); ctx.stroke(); }
      ctx.drawImage(im.el, n.x - ww / 2, n.y + 24 - hh, ww, hh);
    } else { ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(n.x, n.y + 10, 12, 6, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#5a3f26'; ctx.fillRect(n.x - 3, n.y - 2, 6, 24); ctx.fillStyle = n.col; ctx.fillRect(n.x - 26, n.y - 30, 52, 34); ctx.strokeStyle = '#3a2814'; ctx.lineWidth = 2; ctx.strokeRect(n.x - 26, n.y - 30, 52, 34); ctx.fillStyle = '#f4ecd0'; ctx.fillRect(n.x - 20, n.y - 25, 16, 11); ctx.fillRect(n.x + 3, n.y - 22, 15, 14); ctx.fillStyle = '#c0392b'; ctx.fillRect(n.x - 13, n.y - 28, 3, 3); }
  } else {
    im = n.pic ? vimg(n.pic) : null; hh = n.id === 'kid' ? 48 : 60;
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(n.x, n.y + 11, 15, 6, 0, 0, TAU); ctx.fill();
    if (im) {
      ww = hh * im.w / im.h;
      ctx.strokeStyle = near ? '#ffe9a0' : n.col; ctx.globalAlpha = near ? .95 : .6; ctx.lineWidth = near ? 2.5 : 2; ctx.beginPath(); ctx.ellipse(n.x, n.y + 11, 19, 7.5, 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.drawImage(im.el, n.x - ww / 2, n.y + 13 + bob * .5 - hh, ww, hh);
    } else {
      ctx.fillStyle = n.col; ctx.beginPath(); ctx.arc(n.x, n.y + bob, 12, 0, TAU); ctx.fill();
      ctx.fillStyle = '#f4dcc0'; ctx.beginPath(); ctx.arc(n.x, n.y - 9 + bob, 7, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(n.x - 3, n.y - 11 + bob, 2, 2); ctx.fillRect(n.x + 2, n.y - 11 + bob, 2, 2);
    }
    if (n.view && !S.log.length && n.id === 'captain') txt('!', n.x, n.y - hh - 6 + Math.sin(V.t * 5) * 2, 20, '#ffd45a', 'center', true);
  }
  txt(n.name, n.x, n.y + 28, 11, near ? '#ffe9a0' : '#d8d2bd', 'center', true);
}
function vilPlayer() {
  var im = vimg('warden'), mv = V.walk, hop = Math.abs(Math.sin(mv)) * 2.2, lean = Math.sin(mv) * .04, vA, ax, ay, hh = 62, ww;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(V.x, V.y + 11, 15, 6, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#4aa3e0'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(V.x, V.y + 11, 19, 7.5, 0, 0, TAU); ctx.stroke();
  ctx.fillStyle = '#d8e8f0'; ctx.beginPath(); ctx.arc(V.x + Math.cos(V.face) * 19, V.y + 11 + Math.sin(V.face) * 7.5, 3, 0, TAU); ctx.fill();
  if (im) { ww = hh * im.w / im.h; ctx.save(); ctx.translate(V.x, V.y + 13 - hop); ctx.rotate(lean); ctx.drawImage(im.el, -ww / 2, -hh, ww, hh); ctx.restore(); }
  else { ctx.save(); ctx.translate(V.x, V.y); ctx.fillStyle = '#4aa3e0'; ctx.beginPath(); ctx.arc(0, 0, 13, 0, TAU); ctx.fill(); ctx.fillStyle = '#d8e8f0'; ctx.beginPath(); ctx.arc(Math.cos(V.face) * 7, Math.sin(V.face) * 7, 5, 0, TAU); ctx.fill(); ctx.restore(); }
  vA = curAlly();
  if (vA) {
    ax = V.x - 34; ay = V.y + 12;
    ctx.fillStyle = 'rgba(0,0,0,.26)'; ctx.beginPath(); ctx.ellipse(ax, ay + 5, 17, 5, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = vA.mut ? '#b06ad8' : '#7fe0b5'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.ellipse(ax, ay, 21, 10, 0, 0, TAU); ctx.stroke();
    vilAnimal(vA.kind, ax, ay, V.face, vA.kind === 'rabbit' ? 30 : 42, 1);
    txt(vA.name, ax, ay - 17, 10, '#bfe8d0', 'center', true);
  }
}
function drawVillage() {
  ctx.setTransform(RS, 0, 0, RS, 0, 0); ctx.fillStyle = '#243a26'; ctx.fillRect(0, 0, VW, H); ctx.translate(OFFX, 0);
  TXK = WK; /* ป้ายชื่อตึก/NPC ขยายตามจอเล็ก */
  var i, g = ctx.createLinearGradient(-OFFX, 0, VW, H); g.addColorStop(0, '#34523a'); g.addColorStop(1, '#2a4430'); ctx.fillStyle = g; ctx.fillRect(-OFFX, 0, VW, H);
  // paths
  ctx.strokeStyle = '#8a7a58'; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.globalAlpha = .55;
  ctx.beginPath(); ctx.moveTo(955, 352); ctx.lineTo(800, 378); ctx.lineTo(700, 330); ctx.lineTo(480, 320); ctx.lineTo(300, 300); ctx.lineTo(170, 318);
  ctx.moveTo(300, 300); ctx.lineTo(278, 400); ctx.lineTo(256, 520); ctx.lineTo(190, 542); ctx.moveTo(480, 320); ctx.lineTo(460, 314); ctx.moveTo(480, 320); ctx.lineTo(500, 440);
  ctx.moveTo(700, 330); ctx.lineTo(690, 430); ctx.lineTo(690, 530); ctx.moveTo(800, 378); ctx.lineTo(836, 520); ctx.moveTo(700, 330); ctx.lineTo(738, 228); ctx.stroke(); ctx.globalAlpha = 1;
  for (i = 0; i < VIL_TREES.length; i++) { var tr = VIL_TREES[i]; ctx.fillStyle = 'rgba(20,40,22,.9)'; ctx.beginPath(); ctx.arc(tr.x, tr.y, tr.r, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(48,86,48,.9)'; ctx.beginPath(); ctx.arc(tr.x - 3, tr.y - 3, tr.r * .75, 0, TAU); ctx.fill(); }
  /* v17.9: ภาพอาคาร/NPC/ผู้ช่วยจริง (BH_UI vil_* npc_* ally_*) — วาดเรียงตามความลึก (y) ตัวละครเดินอ้อมหลังอาคารได้ · ภาพยังไม่โหลด = ใช้ภาพวาดเดิมแทน */
  var dl = [], di;
  // wild animals watching from the forest edge (trust)
  for (i = 0; i < SPECIES.length; i++) { var tk2 = SPECIES[i], tv = trustOf(tk2); if (tv < 45) continue;
    var ax = tv >= 90 ? 890 - i * 8 + Math.sin(V.t * .4 + i) * 10 : (tv >= 70 ? 922 : 946), ay = 384 + i * 18, aa = tv >= 90 ? .95 : (tv >= 70 ? .8 : .4);
    vilAnimal(tk2, ax, ay, Math.PI, tk2 === 'rabbit' ? 36 : 52, aa); }
  // camp
  vilTent(420, 455, 80, 62, '#8a7a62'); vilTent(580, 470, 80, 64, '#6e8a6a');
  ctx.fillStyle = '#3a2a20'; ctx.beginPath(); ctx.arc(470, 440, 14, 0, TAU); ctx.fill();
  var fl = .6 + .4 * Math.sin(V.t * 11), fg = ctx.createRadialGradient(470, 440, 2, 470, 440, 60); fg.addColorStop(0, 'rgba(255,170,70,' + (.55 * fl) + ')'); fg.addColorStop(1, 'rgba(255,170,70,0)'); ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(470, 440, 60, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffb040'; ctx.beginPath(); ctx.arc(470, 436, 6 + 2 * fl, 0, TAU); ctx.fill();
  txt('แคมป์', 470, 478, 11, '#d8c8a0', 'center', true);
  for (di = 0; di < VIL_RECTS.length; di++) (function (b) { dl.push({ y: b.ay, f: function () { vilBuilding(b); } }); })(VIL_RECTS[di]);
  dl.push({ y: VIL_GATE.ay, f: vilGate });
  for (di = 0; di < VIL_NPCS.length; di++) (function (n, ix) { dl.push({ y: n.art ? n.y + 24 : n.y, f: function () { vilNpc(n, ix); } }); })(VIL_NPCS[di], di);
  dl.push({ y: V.y + 12, f: vilPlayer });
  dl.sort(function (a, b) { return a.y - b.y; });
  for (di = 0; di < dl.length; di++) dl[di].f();
  // HUD (v17.1: ก้อนซ้ายขยายตามจอเล็ก + พื้นหลังโปร่งกันตัวหนังสือทับตึก · เหรียญอยู่ในเฟรมที่มองเห็น · แถวไม่ทับกัน)
  TXK = 1;
  { var vg0 = hudGeom(), vk = vg0.k, vx = isTouch ? vg0.hl : 24, vr = vg0.hr, vy;
    var vextra = []; for (i = 4; i < MAT_KEYS.length; i++) if (S.mats[MAT_KEYS[i]] && MAT_KEYS[i] !== 'coin') vextra.push(MATS[MAT_KEYS[i]] + ' ×' + S.mats[MAT_KEYS[i]]);
    hudBlock(vx, 14, vk, function () {
      vy = (vextra.length ? 122 : 104) + 10;
      ctx.fillStyle = 'rgba(8,14,10,.55)'; ctx.fillRect(vx - 10, 10, 470, vy - 10);
      txt('Fern Hollow Station', vx, 28, 15, '#e9e7df', 'left', true);
      txt(RANK_NAME[rankIdx()] + ' · XP ' + S.xp + ' · ' + curW().name + ' · ' + armorName(), vx, 48, 11, '#9fe8ff', 'left', true);
      var mx = vx, my = 68, ly = 86; for (i = 0; i < 4; i++) { txt(MATS[MAT_KEYS[i]] + ' ×' + S.mats[MAT_KEYS[i]], mx, my, 11, '#d5d9d0', 'left', true); mx += 112; }
      if (vextra.length) { txt(vextra.join('   '), vx, ly, 11, '#c8d8b8', 'left', true); ly += 18; }
      txt('ป่า ' + REGIONS.stag.name + ' ' + Math.round(forestOf('stag')) + '%' + (S.wins >= 1 ? '  ·  ' + REGIONS.boar.name + ' ' + Math.round(forestOf('boar')) + '%' : '') + (S.wins >= 2 ? '  ·  ' + REGIONS.rabbit.name + ' ' + Math.round(forestOf('rabbit')) + '%' : ''), vx, ly, 11, forestMax() >= 70 ? '#7fe0b5' : '#e8d86a', 'left', true); ly += 18;
      txt('คอกฟื้นฟู ' + S.pen.length + '/' + penCap() + (S.favor ? ' · พรป่า ×' + S.favor : ''), vx, ly, 11, S.pen.length ? '#f0a8c8' : '#9fa89f', 'left', true);
    });
    hudBlock(vr, 14, vk, function () { txt('เหรียญ ' + S.mats.coin, vr, 28, 15, '#ffd45a', 'right', true); });
    if (V.near) hudBlock(CX, H - 36, Math.min(vk, 1.3), function () { var nn = V.near; ctx.fillStyle = 'rgba(14,20,16,.82)'; ctx.fillRect(CX - 190, H - 76, 380, 40); txt((nn.obj ? (isTouch ? 'แตะ ตรวจ/เก็บ — เข้าไปที่' : 'F — เข้าไปที่') : (nn.view ? (isTouch ? 'แตะ ตรวจ/เก็บ — คุยกับ ' : 'F — คุยกับ ') : (isTouch ? 'แตะ ตรวจ/เก็บ — ทักทาย ' : 'F — ทักทาย '))) + nn.name + ' (' + nn.role + ')', CX, H - 51, 14, '#ffe9a0', 'center', true); });
    if (V.bubT > 0 && V.bubble) hudBlock(CX, 90, vk, function () {
      var bim = V.bubNpc && V.bubNpc.pic ? vimg(V.bubNpc.pic) : null, bhh = 62, bww;
      ctx.fillStyle = 'rgba(14,20,16,.88)'; ctx.fillRect(CX - 300, 90, 600, 34);
      if (bim) { bww = bhh * bim.w / bim.h; ctx.fillStyle = 'rgba(14,20,16,.88)'; ctx.fillRect(CX - 300 - bww - 10, 62, bww + 10, 62); ctx.drawImage(bim.el, CX - 300 - bww - 5, 62, bww, bhh); }
      txt(V.bubble, CX, 112, 13, '#f0e8d0', 'center', true);
    });
    else if (V.noteT > 0) hudBlock(CX, 588, vk, function () { ctx.fillStyle = 'rgba(14,20,16,.78)'; ctx.fillRect(CX - 340, 562, 680, 26); txt(V.note, CX, 580, 12, '#9fe8ff', 'center', true); });
  }
}
