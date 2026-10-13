/* ================= SPRITE RIG (optional art pack: art/art.js + art/<creature>/*.png) ================= */
var ART = {};
var UISPR = null, UICROWN = null, STIMG = {}; /* STIMG: ไอคอนสถานะ HUD (bind/sap/brittle/bleed/burn/numb/blind/infect) */
var VIMG = {}; /* VIMG: ภาพหมู่บ้าน/ผู้ช่วย (vil_* npc_* ally_* warden) พร้อมขนาดจริง */
function uiImg(key, h, st) { var u = window.BH_UI && window.BH_UI[key]; if (!u || !u.src) return ''; return '<img class="uimg" alt="" src="' + u.src + '" style="height:' + h + 'px;width:auto;' + (st || '') + '">'; }
function uiAvatar(px) { var u = window.BH_UI && window.BH_UI.warden; if (!u) return ''; return '<img class="uimg" alt="" src="' + u.src + '" style="float:right;margin:-4px 0 4px 10px;width:' + px + 'px;height:' + px + 'px;border-radius:50%;object-fit:cover;object-position:50% 8%;border:2px solid #4d7a5f;background:#16261b">'; }
function uiSetup() {
  try {
    if (!window.BH_UI || !window.BH_UI.wtop || typeof Image === 'undefined') return;
    var im = new Image(); im.onload = function () { UISPR = im; }; im.src = window.BH_UI.wtop.src;
    if (window.BH_UI.hive_crown) { var imc = new Image(); imc.onload = function () { UICROWN = imc; }; imc.src = window.BH_UI.hive_crown.src; } /* มงกุฎ Hivemother Sovereign */
    ['bind', 'sap', 'brittle', 'bleed', 'burn', 'numb', 'blind', 'infect'].forEach(function (k) { var u = window.BH_UI['st_' + k]; if (!u) return; var ims = new Image(); ims.onload = function () { STIMG[k] = ims; }; ims.src = u.src; });
    ['m_moss', 'm_bark', 'm_sage', 'm_poppy', 'm_hide', 'i_salve'].forEach(function (k) { var u = window.BH_UI[k]; if (!u) return; var imm = new Image(); imm.onload = function () { SGIMG[k] = imm; }; imm.src = u.src; }); /* ไอคอนร่องรอยบนแผนที่ภาคสนาม */
    ['bug_a', 'bug_b'].forEach(function (k, ix) { var u = window.BH_UI[k]; if (!u) return; var imb = new Image(); imb.onload = function () { BUGSPR[ix] = imb; }; imb.src = u.src; }); /* ลูกน้องแมลง 2 เฟรม */
    Object.keys(window.BH_UI).forEach(function (k) { if (!/^(vil_|npc_|ally_|wup_|w_)/.test(k) && k !== 'warden') return; var u = window.BH_UI[k]; if (!u || !u.src) return; var imv = new Image(); imv.onload = function () { VIMG[k] = { el: imv, w: imv.naturalWidth || u.w, h: imv.naturalHeight || u.h }; }; imv.src = u.src; }); /* อาคาร/NPC/ผู้ช่วย */
  } catch (e) {}
}
function uiInit() {
  try {
    if (window.BH_UI) { uiSetup(); return; }
    if (typeof document === 'undefined' || !document.createElement || !document.head) return;
    var sc = document.createElement('script'); sc.src = 'art/ui.js'; sc.onload = uiSetup; sc.onerror = function () {}; document.head.appendChild(sc);
  } catch (e) {}
}
function artInit() {
  uiInit();
  try {
    if (typeof document === 'undefined' || typeof Image === 'undefined' || !document.createElement || !document.head) return;
    if (window.BH_ART) { artSetup(); return; }
    var sc = document.createElement('script'); sc.src = 'art/art.js'; sc.onload = artSetup; sc.onerror = function () {}; document.head.appendChild(sc);
  } catch (e) {}
}
function artSetup() {
  try {
    var defs = window.BH_ART; if (!defs) return;
    Object.keys(defs).forEach(function (key) {
      var d = defs[key]; if (!d || !d.parts || !d.parts.length) return;
      var rig = { def: d, imgs: [], sil: {}, loaded: 0, bad: false, ready: false, parts: d.parts.slice().sort(function (a, b) { return (a.z || 0) - (b.z || 0); }) };
      rig.parts.forEach(function (pt, i) {
        var im = new Image();
        im.onload = function () { rig.loaded++; if (rig.loaded === rig.parts.length && !rig.bad) rig.ready = true; };
        im.onerror = function () { rig.bad = true; rig.ready = false; };
        im.src = /^data:/.test(pt.img) ? pt.img : 'art/' + pt.img; rig.imgs[i] = im;
      });
      ART[key] = rig;
    });
  } catch (e) {}
}
function rigFor(m) {
  var k = m.kind, r = m.aggro && ART[k + '_aggro'] ? ART[k + '_aggro'] : (m.variant === 1 && ART[k + '_v1'] ? ART[k + '_v1'] : ART[k]);
  return r && r.ready ? r : null;
}
function rigSil(rig, i, col) {
  var key = i + col, c = rig.sil[key]; if (c) return c;
  var im = rig.imgs[i]; c = document.createElement('canvas'); c.width = im.naturalWidth || im.width; c.height = im.naturalHeight || im.height;
  var cx = c.getContext('2d'); cx.drawImage(im, 0, 0); cx.globalCompositeOperation = 'source-in'; cx.fillStyle = col; cx.fillRect(0, 0, c.width, c.height);
  rig.sil[key] = c; return c;
}
function rigDraw(m, A, flash, dip) {
  var rig = rigFor(m); if (!rig) return false;
  var d = rig.def, cv = d.canvas || 512, s = m.r * (d.fit || 3.2) / (d.bodyLen || cv * .8), st = m.state, i, pt, an, rot, sx, sy, dx, dy, ph, amp, tl = null, ta = 0;
  if (flash) { tl = '#ffffff'; ta = .9; }
  else if (st === 'downed') { tl = '#1a1612'; ta = .5; } else if (st === 'retreat') { tl = '#6a8896'; ta = .35; } else if (st === 'exhaust') { tl = '#566878'; ta = .35; }
  else if (st === 'stun') { tl = '#8a6aa8'; ta = .35; } else if (m.phase === 3) { tl = '#a03a30'; ta = .22; } else if (m.phase >= 2) { tl = '#8a5545'; ta = .14; }
  var tele = st === 'tele' || st === 'act';
  ctx.save(); ctx.scale(s, s); ctx.translate(-(d.cx || cv / 2), -(d.cy || cv / 2));
  for (i = 0; i < rig.parts.length; i++) {
    pt = rig.parts[i]; an = pt.anim || {}; amp = an.amp || 0; ph = an.ph || 0; rot = pt.rot || 0; sx = 1; sy = 1; dx = 0; dy = 0;
    if (pt.cond) { var hlv = lvl(m.tr.horn); if ((pt.cond === 'hornT' && hlv >= 3) || (pt.cond === 'hornB' && hlv >= 2)) continue; }
    if (pt.ovl === 'armor' && !(m.armorMax > 0 && m.armor <= 0)) continue;
    if (an.t === 'walk') rot += amp * Math.sin(m.walk + ph) * (m.ail === 'limp' && an.hind ? .3 : 1);
    else if (an.t === 'sway') rot += amp * Math.sin(tNow * (an.f || 2) + ph);
    else if (an.t === 'head') { rot += amp * Math.sin(tNow * (an.f || 1.6) + ph); if (st === 'stagger' || st === 'stun') rot += .35 * Math.sin(tNow * 14); if (tele) { sx = .95; dx = (dip || 0) / s; } }
    else if (an.t === 'body') { var br = 1 + (amp || .015) * Math.sin(tNow * (an.f || 2.2)); sx = br; sy = br; if (tele) sx *= 1.04; }
    var pv = pt.pivot || [0, 0], at = pt.at || [0, 0];
    ctx.save(); ctx.translate(pv[0] + dx, pv[1] + dy); ctx.rotate(rot); ctx.scale(sx, sy); ctx.translate(-pv[0], -pv[1]);
    if (pt.ovl === 'armor') { ctx.globalAlpha = .5; ctx.drawImage(rigSil(rig, i, '#c23a3a'), at[0], at[1]); ctx.globalAlpha = 1; ctx.restore(); continue; }
    ctx.drawImage(rig.imgs[i], at[0], at[1]);
    if (tl) { ctx.globalAlpha = ta; ctx.drawImage(rigSil(rig, i, tl), at[0], at[1]); ctx.globalAlpha = 1; }
    ctx.restore();
  }
  ctx.restore();
  return true;
}
function drawMonster() {
  var m = M, A = m.atk;
  ctx.save(); ctx.translate(m.x + (m.kx || 0), m.y + (m.ky || 0));
  if (m.burrowed) {
    ctx.fillStyle = 'rgba(70,48,30,.55)'; ctx.beginPath(); ctx.ellipse(0, 4, 26, 17, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#7a5a3a'; ctx.beginPath(); ctx.ellipse(0, 0, 19 + Math.sin(tNow * 30) * 2, 12, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#9a7a52'; ctx.beginPath(); ctx.ellipse(-3, -3, 9, 5, 0, 0, TAU); ctx.fill();
    ctx.restore(); return;
  }
  if (m.kind === 'rabbit' && A && m.state === 'tele' && A.name === 'burrow') ctx.translate(Math.sin(tNow * 55) * 2.5, Math.cos(tNow * 47) * 2);
  var rgS = rigFor(m); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0, 8, m.r * (rgS ? 1.55 : 1.3), m.r * (rgS ? .75 : .95), 0, 0, TAU); ctx.fill();
  if (m.mut) { var mc = { crystal: '190,120,240', limp: '255,190,60', sepsis: '150,200,60' }[m.mut]; ctx.strokeStyle = 'rgba(' + mc + ',' + (.5 + .25 * Math.sin(tNow * 8)) + ')'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, m.r + 12 + 3 * Math.sin(tNow * 6), 0, TAU); ctx.stroke(); }
  if (m.cured) { ctx.strokeStyle = 'rgba(155,232,106,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, m.r + 10, 0, TAU); ctx.stroke(); }
  if (m.sov && m.state !== 'downed') { /* ราชินีผู้ครองรัง: วงทองหมุนรอบตัว */
    ctx.strokeStyle = 'rgba(255,214,90,' + (.38 + .2 * Math.sin(tNow * 4)) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, m.r + 16 + 2 * Math.sin(tNow * 3), 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(255,224,120,.85)'; if (!UICROWN) for (var svi = 0; svi < 5; svi++) { var sva = tNow * .6 + svi * TAU / 5, svx = Math.cos(sva) * (m.r + 16), svy = Math.sin(sva) * (m.r + 16); ctx.beginPath(); ctx.moveTo(svx, svy - 6); ctx.lineTo(svx + 4, svy); ctx.lineTo(svx, svy + 6); ctx.lineTo(svx - 4, svy); ctx.closePath(); ctx.fill(); }
  }
  if (A && m.state === 'act' && A.name === 'howl') { ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,170,110,.8)'; ctx.beginPath(); ctx.arc(0, 0, A.waveR, 0, TAU); ctx.stroke(); if (A.waveR2 > 0) { ctx.strokeStyle = 'rgba(255,120,90,.7)'; ctx.beginPath(); ctx.arc(0, 0, A.waveR2, 0, TAU); ctx.stroke(); } }
  if (m.kind === 'boar' && A && A.name === 'roll' && (m.state === 'act' || m.state === 'tele')) {
    ctx.rotate(tNow * (m.state === 'act' ? 16 : 6));
    ctx.fillStyle = m.hitFlash > 0 ? '#fff' : '#6a5a4c'; ctx.beginPath(); ctx.arc(0, 0, m.r * .95, 0, TAU); ctx.fill();
    ctx.fillStyle = m.armor > 0 ? '#c4cad4' : '#a85a50';
    for (var rsp = 0; rsp < 8; rsp++) { var ra = rsp * TAU / 8; ctx.beginPath(); ctx.moveTo(Math.cos(ra - .2) * m.r * .8, Math.sin(ra - .2) * m.r * .8); ctx.lineTo(Math.cos(ra) * (m.r + 12), Math.sin(ra) * (m.r + 12)); ctx.lineTo(Math.cos(ra + .2) * m.r * .8, Math.sin(ra + .2) * m.r * .8); ctx.fill(); }
    ctx.restore(); return;
  }
  ctx.rotate(m.state === 'downed' ? m.face + .2 : m.face);
  var flash = m.hitFlash > 0;
  var body = flash ? '#ffffff' : (m.state === 'downed' ? '#4a4338' : (m.state === 'retreat' ? '#6a8896' : m.state === 'exhaust' ? '#566878' : (m.state === 'stun' ? '#8a6aa8' : (m.phase === 3 ? '#a03a30' : (m.phase >= 2 ? '#8a5545' : (m.kind === 'rabbit' ? '#a09078' : (m.kind === 'wolf' ? '#6f747c' : (m.kind === 'hive' ? '#7a6a2a' : '#7a6548'))))))));
  var w = Math.sin(m.walk) * 6, dip = (m.state === 'tele' && A && A.name === 'charge') ? -5 : 0;
  var usedRig = rigDraw(m, A, flash, dip);
  if (usedRig && m.sov && UICROWN && m.state !== 'downed') { /* Sovereign: มงกุฎเกราะทองหมุนช้า ๆ รอบอก (ภาพจริง) */
    var crs = m.r * 1.4, crh = crs * UICROWN.height / UICROWN.width;
    ctx.save(); ctx.translate(m.r * .24, 0); ctx.rotate(tNow * .3); ctx.globalAlpha = flash ? .6 : .82; ctx.drawImage(UICROWN, -crs / 2, -crh / 2, crs, crh); ctx.restore();
  }
  if (!usedRig) {
  ctx.fillStyle = '#3d3226';
  ctx.beginPath(); ctx.ellipse(22 + w, -22, 10, 6, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(22 - w, 22, 10, 6, 0, 0, TAU); ctx.fill();
  var hw = m.ail === 'limp' ? w * .25 : w;
  ctx.beginPath(); ctx.ellipse(-24 - hw, -22, 10, 6, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-24 + hw, 22, 10, 6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(0, 0, m.r * 1.15, m.r * .78, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = flash ? '#fff' : 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(-4, 0, m.r * .7, m.r * .35, 0, 0, TAU); ctx.fill();
  }
  var inf = infection() / 100;
  ctx.fillStyle = 'rgba(176,106,216,' + (usedRig ? .26 * inf : .15 + .35 * inf) + ')';
  ctx.beginPath(); ctx.arc(-14, -10, 9, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(6, 12, 7, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(-26, 8, 6, 0, TAU); ctx.fill();
  if (lvl(m.tr.flank) >= 1) { ctx.fillStyle = '#c23a3a'; ctx.beginPath(); ctx.arc(-6, -26, 4, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(8, 26, 4, 0, TAU); ctx.fill(); }
  if (lvl(m.tr.hind) >= 1) { ctx.fillStyle = 'rgba(255,150,70,.7)'; ctx.beginPath(); ctx.arc(-m.r * 1.0, 0, 5, 0, TAU); ctx.fill(); }
  if (m.ail === 'sepsis') { ctx.fillStyle = 'rgba(150,175,50,.65)'; ctx.beginPath(); ctx.arc(10, -24 * m.r / 40, 6, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(-14, 24 * m.r / 40, 5, 0, TAU); ctx.fill(); }
  if (m.ail === 'limp') { ctx.fillStyle = 'rgba(220,190,90,.7)'; ctx.beginPath(); ctx.arc(-24, -22, 5, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(-24, 22, 5, 0, TAU); ctx.fill(); }
  var hx = m.r * 1.15 + 6 + dip;
  if (!usedRig) {
  ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(hx - 4, 0, 17, 12, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = (m.state === 'tele' || m.state === 'act') ? '#ff3a2a' : '#ffe9a8';
  ctx.beginPath(); ctx.arc(hx + 6, -6, 2.6, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(hx + 6, 6, 2.6, 0, TAU); ctx.fill();
  }
  var pulse = (m.state === 'tele' && A && A.name === 'spore') ? (.5 + .5 * Math.sin(tNow * 20)) : (.5 + .5 * Math.sin(tNow * 3));
  var hl = lvl(m.tr.horn);
  if (m.ail === 'crystal' && hl < 3 && !m.cured) { ctx.fillStyle = 'rgba(190,120,240,' + (.2 + .22 * pulse) + ')'; ctx.beginPath(); ctx.arc(hx, 0, 24, 0, TAU); ctx.fill(); }
  if (usedRig) { /* sprite rig draws the species parts */ } else if (m.kind === 'boar') {
    ctx.fillStyle = flash ? '#fff' : '#5a4a42'; ctx.beginPath(); ctx.ellipse(hx + 4, 0, 14, 11, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#e8e0c8'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (var sd = -1; sd <= 1; sd += 2) { ctx.beginPath(); ctx.moveTo(hx + 12, sd * 6); ctx.quadraticCurveTo(hx + 26, sd * 10, hx + 24, sd * 20); ctx.stroke(); }
    if (m.armor > 0) { ctx.fillStyle = 'rgba(150,160,175,.9)'; ctx.strokeStyle = '#d0d6de'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(-12, 0, m.r * .7, m.r * .66, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c4cad4'; for (var sp = 0; sp < 4; sp++) { ctx.beginPath(); ctx.moveTo(-26 + sp * 9, -10); ctx.lineTo(-22 + sp * 9, -22); ctx.lineTo(-18 + sp * 9, -10); ctx.fill(); ctx.beginPath(); ctx.moveTo(-26 + sp * 9, 10); ctx.lineTo(-22 + sp * 9, 22); ctx.lineTo(-18 + sp * 9, 10); ctx.fill(); } }
    else { ctx.fillStyle = 'rgba(200,70,60,.55)'; ctx.beginPath(); ctx.ellipse(-12, 0, m.r * .55, m.r * .5, 0, 0, TAU); ctx.fill(); }
  } else if (m.kind === 'hive') {
    var hvJ = flash ? '#fff' : (m.ail === 'crystal' && hl < 3 && !m.cured ? 'rgba(200,150,245,1)' : '#3a2e10'), hpl = 1 + .06 * Math.sin(tNow * 6);
    ctx.fillStyle = flash ? '#fff' : (m.phase >= 3 ? '#e0a030' : '#c49a2a'); ctx.beginPath(); ctx.ellipse(-m.r * 1.55, 0, m.r * .85 * hpl, m.r * .6 * hpl, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(60,40,10,.55)'; ctx.lineWidth = 2; for (var hs = -1; hs <= 1; hs++) { ctx.beginPath(); ctx.arc(-m.r * 1.55 + hs * 11, 0, m.r * .5, -1.1, 1.1); ctx.stroke(); }
    ctx.fillStyle = 'rgba(210,235,220,' + (.2 + .1 * Math.sin(tNow * 40)) + ')'; for (var hw2 = -1; hw2 <= 1; hw2 += 2) { ctx.beginPath(); ctx.ellipse(-6, hw2 * m.r * .75, m.r * .9, 9, hw2 * .5, 0, TAU); ctx.fill(); }
    ctx.fillStyle = flash ? '#fff' : '#5a4a18'; ctx.beginPath(); ctx.ellipse(hx + 8, 0, 14, 11, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = flash ? '#fff' : '#e0452a'; for (var hey = -1; hey <= 1; hey += 2) { ctx.beginPath(); ctx.arc(hx + 11, hey * 6.5, 4.4, 0, TAU); ctx.fill(); }
    ctx.strokeStyle = hvJ; ctx.lineWidth = 4.5; for (var hm = -1; hm <= 1; hm += 2) { ctx.beginPath(); ctx.moveTo(hx + 16, hm * 4); ctx.quadraticCurveTo(hx + 30, hm * 12, hx + 34, hm * 2); ctx.stroke(); }
    ctx.strokeStyle = flash ? '#fff' : '#3a2e10'; ctx.lineWidth = 2; for (var han = -1; han <= 1; han += 2) { ctx.beginPath(); ctx.moveTo(hx + 12, han * 5); ctx.quadraticCurveTo(hx + 28, han * (10 + 4 * Math.sin(tNow * 5 + han)), hx + 36, han * 16); ctx.stroke(); }
    if (hl >= 1) { ctx.fillStyle = 'rgba(255,150,70,.8)'; ctx.beginPath(); ctx.arc(hx + 18, 0, 3, 0, TAU); ctx.fill(); }
  } else if (m.kind === 'wolf') {
    var jawC = flash ? '#fff' : (m.ail === 'crystal' && hl < 3 && !m.cured ? 'rgba(200,150,245,1)' : '#5c6168');
    ctx.fillStyle = jawC; ctx.beginPath(); ctx.ellipse(hx + 12, 0, 14, 7, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = flash ? '#fff' : '#4a4e55'; ctx.beginPath(); ctx.ellipse(hx + 21, 0, 6, 4.5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#f0ead8'; for (var wf = -1; wf <= 1; wf += 2) { ctx.beginPath(); ctx.moveTo(hx + 14, wf * 4); ctx.lineTo(hx + 18, wf * 7.5); ctx.lineTo(hx + 20, wf * 3.5); ctx.fill(); }
    for (var we = -1; we <= 1; we += 2) { ctx.fillStyle = flash ? '#fff' : '#555a61'; ctx.beginPath(); ctx.moveTo(hx - 8, we * 6); ctx.lineTo(hx - 15, we * 17); ctx.lineTo(hx - 1, we * 11); ctx.closePath(); ctx.fill(); if (hl >= 1) { ctx.fillStyle = 'rgba(255,200,80,.8)'; ctx.beginPath(); ctx.arc(hx - 12, we * 14, 2.5, 0, TAU); ctx.fill(); } }
    ctx.fillStyle = flash ? '#fff' : (m.packT > 0 ? '#9aa4d8' : '#5c6168'); ctx.beginPath(); ctx.ellipse(-m.r * 1.25 - 6, 0, 15, 6, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = flash ? '#fff' : '#d8dce4'; ctx.beginPath(); ctx.ellipse(-m.r * 1.25 - 16, 0, 7, 4, 0, 0, TAU); ctx.fill();
  } else if (m.kind === 'rabbit') {
    var earC = flash ? '#fff' : (m.ail === 'crystal' && hl < 3 && !m.cured ? 'rgba(200,150,245,1)' : '#b8a68a');
    for (var es = -1; es <= 1; es += 2) {
      ctx.save(); ctx.translate(hx - 10, es * 7); ctx.rotate(es * (.28 + .08 * Math.sin(tNow * 4 + es)));
      ctx.fillStyle = earC; ctx.beginPath(); ctx.ellipse(-12, 0, 17, 5.2, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(220,150,150,.55)'; ctx.beginPath(); ctx.ellipse(-12, 0, 11, 2.4, 0, 0, TAU); ctx.fill();
      if (hl >= 1) { ctx.fillStyle = 'rgba(255,200,80,.8)'; ctx.beginPath(); ctx.arc(-26, 0, 3, 0, TAU); ctx.fill(); }
      ctx.restore();
    }
    ctx.fillStyle = flash ? '#fff' : '#f0ead8'; ctx.beginPath(); ctx.arc(-m.r * 1.15 - 3, 0, 9, 0, TAU); ctx.fill();
  } else { drawAntler(-1, hl, hx - 2, pulse); drawAntler(1, hl, hx - 2, pulse); }
  ctx.restore();
  if (m.state === 'stagger' || m.state === 'stun') {
    for (var i = 0; i < 3; i++) { var a = tNow * 5 + i * TAU / 3; ctx.fillStyle = '#ffd45a'; ctx.beginPath(); ctx.arc(m.x + Math.cos(a) * 30, m.y - m.r - 20 + Math.sin(a) * 8, 4, 0, TAU); ctx.fill(); }
  }
}
function drawPlayer() {
  var p = P, i;
  for (i = 0; i < p.trail.length; i++) {
    var tr = p.trail[i]; ctx.fillStyle = (tr.fz ? 'rgba(255,90,74,' : 'rgba(120,190,255,') + (tr.life * 1.4) + ')'; ctx.beginPath(); ctx.arc(tr.x, tr.y, p.r, 0, TAU); ctx.fill();
  }
  if (p.frenzy) { ctx.strokeStyle = 'rgba(255,70,60,' + (.5 + .2 * Math.sin(tNow * 18)) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 9 + 2 * Math.sin(tNow * 14), 0, TAU); ctx.stroke(); }
  if (p.flow > 0) { ctx.strokeStyle = 'rgba(255,212,90,' + (.35 + .1 * p.flow + .15 * Math.sin(tNow * 10)) + ')'; ctx.lineWidth = 1 + p.flow; ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 5 + p.flow * 2, 0, TAU); ctx.stroke(); }
  ctx.save(); ctx.translate(p.x, p.y);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0, 5, p.r * 1.1, p.r * .8, 0, 0, TAU); ctx.fill();
  ctx.rotate(p.face);
  var ext = 20, WP = curW(), tip = WP.color;
  if (p.state === 'atk' && p.atk) {
    var s = p.atk, tt = p.atkT;
    if (tt < s.wind) ext = lerp(20, 4, tt / s.wind);
    else if (tt < s.wind + s.act) ext = lerp(4, s.reach - 10, (tt - s.wind) / s.act);
    else ext = lerp(s.reach - 10, 20, clamp((tt - s.wind - s.act) / s.rec, 0, 1));
    if (s.heavy) tip = '#ffd45a';
    if (tt >= s.wind && tt < s.wind + s.act) {
      ctx.fillStyle = s.heavy ? 'rgba(255,212,90,.25)' : WP.fill;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, s.reach, -s.arc, s.arc); ctx.closePath(); ctx.fill();
    }
  } else if (p.state === 'charge') { ext = 4 - p.charge * 4; tip = chargeFrac() >= 1 ? '#ffd45a' : '#cfe8d8'; }
  ctx.strokeStyle = '#d8d2bd'; ctx.lineWidth = WP.lw; ctx.lineCap = 'round';
  if (p.state === 'free' && (WP.id === 'blades' || WP.id === 'fangs')) { ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(ext, -8); ctx.moveTo(-6, 6); ctx.lineTo(ext, 8); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(ext, 0); ctx.stroke(); }
  ctx.fillStyle = tip; ctx.beginPath(); ctx.moveTo(ext + 12, 0); ctx.lineTo(ext, -4); ctx.lineTo(ext, 4); ctx.closePath(); ctx.fill();
  var blink = p.hurtT > 0 && Math.floor(tNow * 24) % 2 === 0;
  if (VIS.images.warden_sheet) {
    var ws = p.r * 5.3; ctx.save(); ctx.globalAlpha *= blink ? .5 : (p.iframes ? .6 : 1);
    visualDraw(ctx,'warden_sheet',-ws/2,-ws/2,ws,ws,wardenFrame(p),192,4); ctx.restore();
    if (p.iframes) { ctx.strokeStyle = 'rgba(130,190,255,.75)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0,0,p.r+2,0,TAU); ctx.stroke(); }
  } else if (UISPR && UISPR.width > 0) {
    var sh = p.r * 3.7, sw = sh * UISPR.width / UISPR.height;
    ctx.save(); ctx.rotate(.61); ctx.globalAlpha = blink ? .5 : (p.iframes ? .6 : 1); ctx.drawImage(UISPR, -sw / 2, -sh / 2, sw, sh); ctx.restore();
    if (blink) { ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(0, 0, p.r, 0, TAU); ctx.fill(); }
    else if (p.iframes) { ctx.strokeStyle = 'rgba(130,190,255,.75)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, p.r + 2, 0, TAU); ctx.stroke(); }
  } else {
    ctx.fillStyle = blink ? '#ffffff' : (p.iframes ? 'rgba(130,190,255,.55)' : '#4f9fe0');
    ctx.beginPath(); ctx.arc(0, 0, p.r, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2b5f8c'; ctx.beginPath(); ctx.arc(-3, 0, p.r * .55, 0, TAU); ctx.fill();
    ctx.fillStyle = '#f2d6b0'; ctx.beginPath(); ctx.arc(4, 0, 4.5, 0, TAU); ctx.fill();
  }
  ctx.restore();
  if (p.blocking) { ctx.strokeStyle = '#9fe1cb'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 8, p.face - 1.2, p.face + 1.2); ctx.stroke(); }
  if (p.state === 'charge') {
    ctx.strokeStyle = chargeFrac() >= 1 ? '#ffd45a' : 'rgba(255,255,255,.6)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 8, -Math.PI / 2, -Math.PI / 2 + TAU * chargeFrac()); ctx.stroke();
  }
  if (p.state === 'heal') { ctx.strokeStyle = '#7fe0b5'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 8, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(p.healT / healTime(), 0, 1)); ctx.stroke(); }
  var fxi = 0, fxq; for (fxq in p.fx) if (p.fx[fxq] > 0 && STATUS[fxq]) { ctx.strokeStyle = STATUS[fxq].col; ctx.globalAlpha = .55 + .3 * Math.sin(tNow * 9 + fxi); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 4 + fxi * 3, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; fxi++; }
  if (p.infT > 0) { ctx.fillStyle = 'rgba(176,106,216,.5)'; ctx.beginPath(); ctx.arc(p.x + Math.sin(tNow * 8) * 6, p.y - 18, 3, 0, TAU); ctx.fill(); }
  if (p.scanning && p.scanT < scanTime()) { ctx.strokeStyle = '#7fe0b5'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 12, -Math.PI / 2, -Math.PI / 2 + TAU * (p.scanT / scanTime())); ctx.stroke(); }
}
function drawScanOverlay() {
  var p = P;
  if (!p.scanning || p.scanT < scanTime()) return;
  var out = dist(p.x, p.y, M.x, M.y) >= 380;
  ctx.save();
  ctx.strokeStyle = 'rgba(127,224,181,.7)'; ctx.lineWidth = 2;
  ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.arc(M.x, M.y, M.r + 22 + Math.sin(tNow * 6) * 3, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  var parts3 = [['horn', 0, M.kind === 'rabbit' ? 'EARS' : ((M.kind === 'wolf' || M.kind === 'hive') ? 'JAW' : 'HORN')], ['flank', Math.PI / 2, 'FLANK'], ['hind', Math.PI, 'HIND']];
  for (var i = 0; i < parts3.length; i++) {
    var pr = parts3[i], a = M.face + pr[1], lv = lvl(M.tr[pr[0]]);
    ctx.fillStyle = lv >= 3 ? '#ff6a5a' : (lv >= 1 ? '#ffd45a' : '#9fe1cb');
    var ptsTxt = '';
    if (hasRes('notes')) ptsTxt = lv >= 3 ? ' MAX' : ' ' + Math.round(M.tr[pr[0]]) + '/' + TR_TH[lv];
    txt(pr[2] + ' T' + lv + ptsTxt, M.x + Math.cos(a) * (M.r + 52), M.y + Math.sin(a) * (M.r + 52), 12, ctx.fillStyle, 'center', true);
  }
  ctx.restore();
  hudBlock(CX, H - 40, Math.min(HK, 1.3), scanPanel);
}
function scanPanel() {
  var out = dist(P.x, P.y, M.x, M.y) >= 380;
  var mk2 = hasRes('scanner2'), ph = mk2 ? 146 : 128, x = CX - 150, y = H - 40 - ph;
  ctx.fillStyle = 'rgba(8,14,10,.9)'; ctx.fillRect(x, y, 300, ph); ctx.strokeStyle = '#4d7a5f'; ctx.lineWidth = 1; ctx.strokeRect(x, y, 300, ph);
  if (out) { txt('นอกระยะสแกน — เข้าใกล้อีกนิด', CX, y + 64, 14, '#e8a04a', 'center', true); return; }
  var v = vitals();
  txt('SCAN · ' + monName(), x + 12, y + 14, 12, '#7fe0b5', 'left', true);
  txt('ชีพจร ' + v.hr + ' bpm', x + 12, y + 36, 13, '#fff'); bar(x + 130, y + 31, 150, 9, (v.hr - 55) / 90, '#e0524a');
  txt('อุณหภูมิ ' + v.temp + '°C', x + 12, y + 58, 13, '#fff'); bar(x + 130, y + 53, 150, 9, v.inf / 100, '#e8a04a');
  txt('หายใจ ' + v.br + '/นาที', x + 12, y + 80, 13, '#fff'); bar(x + 130, y + 75, 150, 9, (v.br - 14) / 30, '#4aa3e0');
  txt('ความเครียด ' + v.stress + '%', x + 12, y + 102, 13, '#fff'); bar(x + 130, y + 97, 150, 9, v.stress / 100, '#b06ad8');
  txt('ข้อมูลนี้ใช้ตอนเลือกโดสยาสลบ', x + 12, y + 120, 11, '#9aa39a');
  if (mk2) txt('ท่าถัดไป: ' + nextAtkLabel(), x + 12, y + 137, 12, '#ffd45a', 'left', true);
}
function nextAtkLabel() {
  var N = { burrow: 'ขุดโพรง', charge: 'พุ่งชน', sweep: 'ส่ายเขา', stomp: 'กระทืบพื้น', spore: 'พ่นสปอร์', kick: 'เตะหลัง', leap: 'กระโดดทับ', shards: SIG_NAME.shards, bash: SIG_NAME.bash, spit: SIG_NAME.spit, roll: 'กลิ้งเป็นลูกบอล', howl: 'คำรามคลื่นกระแทก', lash: 'หนวดฟาดกวาด', ensnare: 'หนวดรัดดึง', sprout: 'หนวดงอกจากพื้น', tusk: 'แทงงา', rake: 'ตะกุยเขา 2 จังหวะ' };
  if (M.state === 'tele' && M.atk) return N[M.atk.name] || '—';
  return (M.state === 'act' || M.state === 'rec') ? '—' : 'ยังไม่แสดงท่า';
}
