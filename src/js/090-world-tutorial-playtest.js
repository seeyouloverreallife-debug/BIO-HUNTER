/* ================= WORLD UPDATES ================= */
function updateDarts(dt) {
  for (var i = darts.length - 1; i >= 0; i--) {
    var d = darts[i]; d.t += dt; d.x += d.vx * dt; d.y += d.vy * dt;
    var dead = false;
    if (M.state !== 'downed' && dist(d.x, d.y, M.x, M.y) < M.r + 4) {
      dead = true;
      if (d.med) { hx0 = d.x - d.vx * dt; hy0 = d.y - d.vy * dt; applyMed(d.med); darts.splice(i, 1); continue; }
      M.sed += 34; M.stress = clamp(M.stress - 14, 0, 100);
      ftext(M.x, M.y - 54, 'ยาสลบ ' + Math.min(100, M.sed) + '%', '#9fe8ff', 15, 1.1); burst(d.x, d.y, '#9fe8ff', 8, 140);
      if (M.sed >= 100) { M.drowsyT = 12; M.sed = 0; ftext(M.x, M.y - 74, 'ง่วงซึม!', '#9fe8ff', 20, 1.4); hintOnce('drowsy', 'มันง่วงซึม 12 วินาที — ช้าลงและส่งสัญญาณท่าโจมตีช้าลง', 4); }
    }
    for (var r = 0; r < ROCKS.length; r++) if (dist(d.x, d.y, ROCKS[r].x, ROCKS[r].y) < ROCKS[r].r) dead = true;
    if (dist(d.x, d.y, CX, CY) > ARENA_R || d.t > 1.5) dead = true;
    if (dead) darts.splice(i, 1);
  }
}
function updateClouds(dt) {
  for (var i = clouds.length - 1; i >= 0; i--) {
    var c = clouds[i]; c.t += dt;
    if (dist(P.x, P.y, c.x, c.y) < c.r && !P.dead) {
      if (P.infT <= 0) { ftext(P.x, P.y - 28, 'ติดเชื้อ!', '#c79cff', 15, 1); hintOnce('infect', 'ติดเชื้อ Bloomrot — เสีย HP ต่อเนื่อง ใช้ยาสมานแผล (R) เพื่อล้างเชื้อ', 4.5); }
      P.infT = infDur();
    }
    if (c.t >= c.life) clouds.splice(i, 1);
  }
}
function updateFX(dt) {
  var i;
  for (i = parts.length - 1; i >= 0; i--) {
    var q = parts[i]; q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= (1 - 4 * dt); q.vy *= (1 - 4 * dt);
    if (q.t >= q.life) parts.splice(i, 1);
  }
  for (i = texts.length - 1; i >= 0; i--) { var t = texts[i]; t.t += dt; t.y -= 28 * dt; if (t.t >= t.life) texts.splice(i, 1); }
  for (i = rings.length - 1; i >= 0; i--) { rings[i].t += dt; if (rings[i].t >= rings[i].life) rings.splice(i, 1); }
  for (i = slashes.length - 1; i >= 0; i--) { slashes[i].t += dt; if (slashes[i].t >= slashes[i].life) slashes.splice(i, 1); }
}

/* ================= TUTORIAL COACH (ด่านฝึก) ================= */
function KT(kb, tc) { return isTouch ? tc : kb; }
function tutSteps() {
  return [
    { id: 'move', t: 'เดิน', a: KT('กด W A S D เพื่อเดิน', 'เลื่อนจอยสติ๊กซ้ายล่างเพื่อเดิน'), d: 'ทิศที่เดินคือทิศที่หันหน้า' + KT(' (เมาส์ใช้เล็งทิศได้) · C = ย่อเดินเงียบ', ' · ปุ่ม ย่อ = เดินเงียบ') },
    { id: 'atk', t: 'ตีคอมโบ', a: KT('เข้าใกล้ลูกกวางแล้วกด J หรือคลิกซ้ายรัว ๆ — ให้โดน 3 ครั้ง', 'เข้าใกล้ลูกกวางแล้วกดปุ่ม ตี รัว ๆ — ให้โดน 3 ครั้ง'), d: 'ตีต่อเนื่องจะเปลี่ยนท่า · ทุกท่าเปลืองสตามินา (แถบเขียว) · ตีคนละด้านของตัวมัน ให้ผลต่างกัน' },
    { id: 'dodge', t: 'หลบ', a: KT('กด Space เพื่อกลิ้งหลบ — ตอนเห็นพื้นที่สีแดงยิ่งดี', 'กดปุ่ม หลบ เพื่อกลิ้ง — ตอนเห็นพื้นที่สีแดงยิ่งดี'), d: 'พื้นที่แดง = มันกำลังจะโจมตี · หลบตรงจังหวะ = Perfect Dodge (เวลาช้าลง + ได้ FLOW)' },
    { id: 'block', t: 'กัน / Parry', a: KT('กดค้าง L หรือ Shift เพื่อกัน', 'กดค้างปุ่ม กัน'), d: 'ขอบฟ้า = Parry ได้ (กดกัน "ก่อนโดนเสี้ยววินาที" แล้วสวนกลับ) · ขอบแดง = ต้องหลบอย่างเดียว' },
    { id: 'heavy', t: 'ตีหนัก', a: KT('กดค้าง K หรือคลิกขวา แล้วปล่อยเพื่อโจมตี', 'กดค้างปุ่ม ตีหนัก แล้วปล่อย'), d: 'ชาร์จนาน = แรงขึ้น · ใช้ทุบจุดอ่อนและเกราะ · อาวุธแต่ละแบบตอบสนองไม่เหมือนกัน' },
    { id: 'scan', t: 'สแกน', a: KT('กดค้าง Q ใกล้ลูกกวางจนสแกนเสร็จ', 'กดค้างปุ่ม สแกน ใกล้ลูกกวางจนเสร็จ'), d: 'สแกนบอกอาการและจุดอ่อน — กับสัตว์ที่ป่วยจริง ต้องรู้อาการก่อนเลือกยา' },
    { id: 'finish', t: 'ปิดงาน', a: 'ตีต่อจนลูกกวางล้ม แล้วเลือก จับ / รักษา / กำจัด', d: 'ล้มแล้วค่อยตัดสินใจ — แต่ละทางได้ตัวอย่างและส่งผลต่อป่าไม่เหมือนกัน · ด่านฝึกลองได้เต็มที่' }
  ];
}
function tutMark() { TUT.b = { hits: stats.hits, dodges: stats.dodges, blocks: stats.blocks, heavies: stats.heavies, scans: stats.scans }; }
function tutBtn(on) { var e = document.getElementById('tskip'); if (e && e.style) e.style.display = on ? 'block' : 'none'; }
function tutStart() { ptNote('tut', function (t) { t.start++; }); TUT = { i: 0, mv: 0, px: P.x, py: P.y, done: false }; tutMark(); tutBtn(true); showHint('บทสอนสั้น ๆ 7 ขั้น — ทำตามที่เห็นในกรอบด้านล่าง (ข้ามได้ปุ่มด้านบน)', 5); }
function tutSkip() { if (!TUT) return; var at = TUT.i; ptNote('tut', function (t) { t.skip++; if (t.skipAt.length < 12) t.skipAt.push(at); }); TUT = null; tutBtn(false); showHint('ข้ามบทสอนแล้ว — เปิดดูใหม่ได้ที่ "คู่มือเริ่มเล่น" ในหน้าแผนที่ป่า', 5); }
function tutDone(st) {
  ftext(P.x, P.y - 60, '✓ ' + st.t, '#7fe0b5', 17, 1.3); ring(P.x, P.y, 10, 50, '#7fe0b5', .5, 3); sfx('heal');
  TUT.i++; tutMark();
  if (TUT.i >= tutSteps().length) { TUT.done = true; ptNote('tut', function (t) { t.done++; }); }
}
function tutUpdate(dt) {
  if (!TUT) return;
  if (mode !== 'playing' || huntKind !== 'fawn' || !M || M.kind !== 'fawn') { TUT = null; tutBtn(false); return; }
  if (TUT.done || M.state === 'downed') { TUT = null; tutBtn(false); return; }
  var st = tutSteps()[TUT.i], b = TUT.b, ok = false;
  TUT.mv += Math.hypot(P.x - TUT.px, P.y - TUT.py); TUT.px = P.x; TUT.py = P.y;
  switch (st.id) {
    case 'move': ok = TUT.mv >= 140; break;
    case 'atk': ok = stats.hits - b.hits >= 3; break;
    case 'dodge': ok = stats.dodges > b.dodges; break;
    case 'block': ok = stats.blocks > b.blocks; break;
    case 'heavy': ok = stats.heavies > b.heavies; break;
    case 'scan': ok = stats.scans > b.scans; break;
    default: ok = false;
  }
  if (ok) tutDone(st);
}
function tutDraw() {
  if (!TUT || mode !== 'playing') return;
  var steps = tutSteps(), st = steps[TUT.i]; if (!st) return;
  var w = 600, x = CX - w / 2, y = H - 128;
  ctx.fillStyle = 'rgba(8,14,10,.86)'; ctx.fillRect(x, y, w, 66);
  ctx.strokeStyle = 'rgba(127,224,181,.55)'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, 64);
  for (var i = 0; i < steps.length; i++) { ctx.fillStyle = i < TUT.i ? '#7fe0b5' : (i === TUT.i ? '#ffd45a' : 'rgba(255,255,255,.2)'); ctx.fillRect(x + 12 + i * 22, y + 8, 18, 4); }
  txt('บทสอน ' + (TUT.i + 1) + '/' + steps.length + ' · ' + st.t, x + w - 12, y + 18, 12, '#ffd45a', 'right', true);
  txt(st.a, CX, y + 38, 15, '#ffffff', 'center', true);
  txt(st.d, CX, y + 57, 11, '#a9b8ad', 'center', true);
}

/* ================= PLAYTEST REPORT (เก็บในเครื่อง คัดลอกส่งเอง) ================= */
var PT_KEY = 'bio-hunter-pt-v1', PT = null, PTF = { n: 0, sum: 0, slow: 0, worst: 0 };
function ptFresh() { return { v: 1, first: Date.now(), sessions: 0, dev: {}, tut: { start: 0, skip: 0, done: 0, skipAt: [] }, guide: { open: 0, maxPg: 0 }, hunts: [], play: { n: 0, sum: 0, slow: 0, worst: 0 } }; }
function ptSave() { try { if (PT && window.localStorage) window.localStorage.setItem(PT_KEY, JSON.stringify(PT)); } catch (e) {} }
function ptInit() {
  try { var o = window.localStorage ? JSON.parse(window.localStorage.getItem(PT_KEY) || 'null') : null; PT = (o && o.v === 1 && o.tut && o.guide && o.play && Array.isArray(o.hunts)) ? o : ptFresh(); } catch (e) { PT = ptFresh(); }
  try {
    PT.sessions++;
    var ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? String(navigator.userAgent) : '';
    PT.dev = { touch: !!isTouch, w: window.innerWidth || 0, h: window.innerHeight || 0, dpr: window.devicePixelRatio || 1, ua: ua.replace(/[^\x20-\x7e]/g, '').slice(0, 110) };
  } catch (e) {}
  ptSave();
}
function ptFrame(ms) { if (ms > 0 && ms < 500) { PTF.n++; PTF.sum += ms; if (ms > 33.4) PTF.slow++; if (ms > PTF.worst) PTF.worst = ms; } }
function ptHunt(kind, rank) {
  try {
    if (!PT) return; var avg = PTF.n ? PTF.sum / PTF.n : 0;
    PT.hunts.push({ k: M.kind, v: M.variant ? 1 : 0, a: M.aggro ? 1 : 0, q: M.quest || '', o: kind, r: rank, t: Math.round(stats.time), tk: stats.taken, pr: stats.parry, pd: stats.perfect, dg: stats.dodges, hp: Math.round(Math.max(0, P.hp)), w: S.weapon, d: diffLv(), fps: avg ? Math.round(1000 / avg) : 0, sl: PTF.n ? Math.round(PTF.slow * 1000 / PTF.n) / 10 : 0, wm: Math.round(PTF.worst) });
    if (PT.hunts.length > 60) PT.hunts.shift();
    PT.play.n += PTF.n; PT.play.sum += PTF.sum; PT.play.slow += PTF.slow; PT.play.worst = Math.max(PT.play.worst, PTF.worst);
    ptSave();
  } catch (e) {}
}
function ptNote(group, fn) { try { if (PT) { fn(PT[group]); ptSave(); } } catch (e) {} }
function ptReport() {
  if (!PT) return 'ยังไม่มีข้อมูล';
  var L = [], d = PT.dev || {}, pl = PT.play, i;
  var fps = function (n, sum) { return n ? Math.round(1000 / (sum / n)) : 0; };
  L.push('Bio-Hunter playtest report · v' + GAME_VER + '');
  L.push('เริ่มเล่น ' + new Date(PT.first).toISOString().slice(0, 10) + ' · เปิดเกม ' + PT.sessions + ' ครั้ง');
  L.push('อุปกรณ์: ' + (d.touch ? 'จอสัมผัส' : 'เมาส์/คีย์บอร์ด') + ' ' + d.w + 'x' + d.h + ' @' + d.dpr + ' · ' + (d.ua || '?'));
  L.push('เฟรมเรตตอนสู้ (รวม): เฉลี่ย ' + fps(pl.n, pl.sum) + ' fps · เฟรมช้า(<30fps) ' + (pl.n ? Math.round(pl.slow * 1000 / pl.n) / 10 : 0) + '% · แย่สุด ' + Math.round(pl.worst) + ' ms');
  try { if (S && S.trust) L.push('ป่า/ไว้ใจตอนนี้: กวาง ' + Math.round(forestOf('stag')) + '/' + Math.round(trustOf('stag')) + ' · หมูป่า ' + Math.round(forestOf('boar')) + '/' + Math.round(trustOf('boar')) + ' · กระต่าย ' + Math.round(forestOf('rabbit')) + '/' + Math.round(trustOf('rabbit'))); } catch (e) {}
  L.push('บทสอน: เริ่ม ' + PT.tut.start + ' · ข้าม ' + PT.tut.skip + (PT.tut.skipAt.length ? ' (ที่ขั้น ' + PT.tut.skipAt.map(function (x) { return x + 1; }).join(',') + ')' : '') + ' · จบ ' + PT.tut.done + ' · เปิดคู่มือ ' + PT.guide.open + ' ครั้ง (หน้าไกลสุด ' + (PT.guide.maxPg + 1) + ')');
  var real = PT.hunts.filter(function (h) { return h.k !== 'fawn'; }), win = real.filter(function (h) { return h.o === 'eliminate' || h.o === 'treat_full' || h.o === 'treat_part' || h.o === 'capture_ok'; }).length;
  L.push('ล่าจริง ' + real.length + ' ครั้ง · ผ่าน ' + win + ' · พลาด/แพ้ ' + (real.length - win) + ' · ฝึกลูกกวาง ' + (PT.hunts.length - real.length) + ' ครั้ง');
  var bk = {}; real.forEach(function (h) { var key = h.k + (h.a ? '/aggro' : (h.v ? '/v1' : '')); var e = bk[key] || (bk[key] = [0, 0]); e[0]++; if (h.o === 'defeat') e[1]++; });
  var bs = Object.keys(bk).map(function (key) { return key + ' ' + bk[key][0] + ' (แพ้ ' + bk[key][1] + ')'; }).join(' · '); if (bs) L.push('แยกตามสัตว์: ' + bs);
  L.push('รายการล่าล่าสุด (สัตว์/ตัวแปร/เควส · ผลลัพธ์ · เกรด · เวลา · โดน · parry/perfect/หลบ · HP เหลือ · อาวุธ · fps · ช้า%):');
  var rec = PT.hunts.slice(-20);
  for (i = 0; i < rec.length; i++) { var h = rec[i]; L.push((i + 1) + '. ' + h.k + (h.a ? '/aggro' : (h.v ? '/v1' : '')) + (h.q ? '/' + h.q : '') + ' · ' + h.o + ' · ' + h.r + ' · ' + h.t + 's · ' + h.tk + ' · ' + h.pr + '/' + h.pd + '/' + h.dg + ' · ' + h.hp + ' · ' + h.w + ' · ' + h.fps + ' · ' + h.sl + '%'); }
  return L.join('\n');
}
function step(dt) {
  tNow += dt; stats.time += dt;
  if (hint.t > 0) hint.t -= dt;
  if (TUT) tutUpdate(dt);
  if (!P.dead) updatePlayer(dt); else { P.kvx *= .9; P.kvy *= .9; }
  if (PRAC) pracUpdate(dt); else updateMonster(dt);
  updatePods(dt); updateBugs(dt);
  updateDarts(dt); updateClouds(dt); updateFires(dt); updateFX(dt);
  if (M.state === 'downed' && pendingDecision > 0) {
    pendingDecision -= dt;
    if (pendingDecision <= 0 && !P.dead) openDecision();
  }
  if (stats.time > 22 && !stats.scans && !hintsDone['scanhint'] && M.state !== 'idle' && M.state !== 'downed') hintOnce('scanhint', 'กด Q ค้างเพื่อสแกนสัญญาณชีพ — ข้อมูลนี้ต้องใช้ตอนเลือกโดสยาสลบ (Capture)', 5);
}

