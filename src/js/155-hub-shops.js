function openHub(view, note) {
  view = view || 'main';
  mode = 'hub'; paused = false; initWorld();
  if (note !== undefined) hubNote = note; else hubNote = '';
  if (view !== 'main') resetArmed = false;
  var ri = rankIdx(), nx = RANK_XP[ri + 1];
  var rnx = rankNext();
  var names = { chronicle: 'พงศาวดาร', loadout: 'ชุดอุปกรณ์', bag: 'กระเป๋า', daily: 'บันทึกประจำวัน', main: 'แผนที่ป่า', board: 'กระดานภารกิจ', garden: 'ลานเพาะปลูก', dojo: 'ลานซ้อม', pen: 'คอกฟื้นฟู', guide: 'คู่มือเริ่มเล่น', forge: 'ช่างเครื่องมือ', armor: 'ช่างเกราะ', lab: 'ห้องวิจัย', shop: 'พ่อค้า', skills: 'ทักษะ', help: 'วิธีเล่น', set: 'ตั้งค่า', prep: 'เตรียมออกล่า' }, k;
  /* v17.1: แถบหัวกะทัดรัด — [← กลับ · ชื่อหน้า · เหรียญ · กระเป๋า] ติดขอบบนตอนเลื่อน (sticky) + บรรทัดยศ + แท็บหมวด (เฉพาะกลุ่มข้อมูลผู้เล่น) */
  var grp = view === 'skills' || view === 'help' || view === 'set' || view === 'guide' || view === 'daily' || view === 'chronicle', gtabs = '';
  if (grp) for (k in { daily: 1, chronicle: 1, guide: 1, skills: 1, set: 1, help: 1 }) gtabs += '<button class="tab' + (k === view ? ' on' : '') + '" data-act="hub" data-arg="' + k + '">' + names[k] + '</button>';
  var avh = window.BH_UI && window.BH_UI.warden && window.BH_UI.warden.src ? '<img class="hdr-av" alt="" src="' + window.BH_UI.warden.src + '">' : '';
  var html = '<div class="hdr-row"><button class="tab" data-act="village">← กลับหมู่บ้าน</button>' + (grp ? '' : '<b class="hdr-t">' + (names[view] || '') + '</b>') + '<span class="hdr-sp"></span>' + ((view === 'guide' || view === 'bag') ? '' : bagBar()) + avh + '</div>' +
    '<div class="hdr-s">Fern Hollow · ' + RANK_NAME[ri] + ' · XP ' + S.xp + (nx ? ' / ' + nx + (rnx && !rnx.examDone ? ' · 🎖 รอสอบ' : '') : ' (สูงสุด)') + ' · แต้มทักษะ ' + skillPts() + '</div>' +
    (grp ? '<div class="tabs">' + gtabs + '</div>' : '') + npcSayHtml() + (hubNote ? '<div class="note">' + hubNote + '</div>' : '');
  var i;
  if (view === 'main') {
    html += uiImg(pickKind(), 84, 'float:right;margin:0 0 6px 10px') + '<h2>กัปตันเรน — รายงานตัวก่อนออกพิทักษ์</h2><p style="font-size:13px;color:#9aa39a">เควสเลือกที่กระดานภารกิจกลางหมู่บ้าน · เปลี่ยนอาวุธที่ช่างเครื่องมือ · ซื้อเสบียงที่พ่อค้า — ที่นี่ดูแผนที่ป่าแล้วออกเดินทาง</p>' + forestHtml() + '<h2>ภารกิจ: ' + (curQuest() ? QTIER_NAME[curQuest().tier] + ' · ' + curQuest().name : (pickKind() === 'boar' ? 'Thornback' : (pickKind() === 'rabbit' ? 'Bramble Hare' : 'First Bloom'))) + '</h2>' + regionLineHtml() +
      (pickKind() === 'boar' ? '<p>Thornback Boar หมูป่าเกราะหลังที่ถูกเชื้อกัดกิน ดุร้าย พุ่งชนต่อเนื่องและไวกว่ากวาง — <b>เกราะหลังหนาทนมาก</b> ต้องทุบจนแตกก่อน (ท่าหนักทำลายเกราะได้เร็ว) ส่วน <b>หัวคือจุดอ่อน</b> · ไม่มีสปอร์/กระโดดทับบ่อยเหมือนกวาง</p>' : '') +
      (pickKind() === 'wolf' ? '<p>Ashfang Wolf ผู้ล่าสูงสุดของป่า ติดเชื้อจนคลั่ง — <b>ตัวใหญ่ เร็ว แกร่งกว่าทุกตัว</b> เขี้ยวและกรงเล็บทำให้ <b>เลือดไหล</b> หอนเรียกฝูงให้เร็วขึ้น ปรากฏเฉพาะภารกิจระดับ 2 ขึ้นไป</p>' : '') +
      (pickKind() === 'hive' ? '<p>Hivemother Queen ราชินีรังแมลงที่ติดเชื้อ — <b>เรียกฝูงแมลงลูกน้อง</b> ออกมาช่วยสู้ ตัวเล็กตีตายง่าย กวาดได้หลายตัวในสวิงเดียว แต่ตราบที่ฝูงยังอยู่ <b>ราชินีจะได้รับการปกป้อง</b> ดาเมจลดลง · เลือกว่าจะกวาดฝูงหรือกดดันราชินี · ปรากฏเฉพาะภารกิจระดับ 2 ขึ้นไป</p>' : '') +
      (pickKind() === 'hive' && curQuest() && curQuest().sov ? '<p style="color:#ffd45a">★ <b>ราชินีผู้ครองรัง</b> — ฝูงกัดแล้ว <b>ชา</b> (ท่าตี/ชาร์จช้าลง 25%) · ละอองเกสรรอบตัวทำให้ <b>ตาพร่า</b> เห็นเส้นเตือนได้เฉพาะรอบตัว · ฝูงคุ้มกันหนักขึ้น (ลดดาเมจสูงสุด 50%) · เข้าเฟสใหม่ทุกครั้งจะเรียกฝูงเพิ่ม — กวาดฝูงก่อนรัวคอมโบ และพกยาสมานแผล (R) ไว้ล้างอาการ</p>' : '') +
      (pickKind() === 'rabbit' ? '<p>Bramble Hare กระต่ายพุ่มหนามที่ถูกเชื้อกัดกิน ตัวเล็ก วิ่งไวมาก และ <b>ขุดโพรงหนีลงใต้ดิน</b> แล้วโผล่ใต้เท้าคุณ — ตอนอยู่ใต้ดินโจมตีไม่ได้ แต่ <b>หลังโผล่พ้นดินมันเสียท่านาน</b> · <b>โคนหูคือจุดอ่อน</b> · HP น้อยแต่โดนยากกว่ากวาง</p>' : '') +
      (pickKind() !== 'stag' ? '' : '<p>Rothorn Stag กวางที่ถูก Bloomrot กัดกินกำลังบุกทำลายพืชผลของหมู่บ้านริม Sunken Grove คุณคือ Warden — ผู้พิทักษ์ระบบนิเวศภาคสนาม ' +
      'ไม่ใช่แค่ล่า แต่ต้อง <b>วินิจฉัยก่อนตัดสินใจ</b> ว่าจะ จับ รักษา หรือกำจัด · ตัวอย่างที่ได้กลับมาใช้อัปเกรดในห้องวิจัยและเวิร์กช็อป</p>') +
      '<p style="font-size:13px;color:#9aa39a">ออกล่าแล้ว ' + S.hunts + ' ครั้ง · สำเร็จ ' + S.wins + (S.bestRank ? ' · เกรดดีที่สุด ' + S.bestRank : '') +
      ' · ยาสมานแผล ' + invN('salve') + ' · ยาสลบ ' + invN('dart') + ' · อาวุธ ' + curW().name + ' Mk.' + ['I', 'II', 'III'][S.wk - 1] + '</p>';
    if (S.hunts === 0) html += helpHtml();
    if (!S.tut) html += '<div class="note">ครั้งแรก? กด <b>คู่มือเริ่มเล่น</b> (อ่าน ~2 นาที) แล้วลอง<b>ด่านฝึก</b>กับ <b>Fernback Fawn</b> ลูกกวางตัวเล็ก — มีโค้ชสอนทีละขั้น ~1 นาที ไม่มีสปอร์/Phase 2 · รางวัลรับได้ครั้งเดียว</div>';
    html += '<div class="note" style="cursor:default"><b>วันนี้: ' + mutNow().name + '</b> — ' + mutNow().desc + ' · ภารกิจประจำวัน ' + dailyDone() + '/3 <button data-act="daily" style="margin-left:6px">ดูบันทึกประจำวัน</button></div>';
    html += '<div class="note" style="cursor:default"><b>พงศาวดารผู้พิทักษ์</b> — เรื่องราวของ Warden Corps ยุคป่าเก่า · เปิดแล้ว ' + loreOpen() + '/' + LORE_CH.length + ' บท <button data-act="chron" style="margin-left:6px">อ่านพงศาวดาร</button></div>';
    html += '<div class="row"><button class="big" data-act="prep">เตรียมออกล่า ' + monNameOf(pickKind(), pickVariant()) + '</button>' +
      '<button data-act="tut">' + (S.tut ? 'ฝึกกับลูกกวาง' : 'ด่านฝึก: Fernback Fawn') + '</button><button data-act="hub" data-arg="guide">คู่มือเริ่มเล่น</button>' +
      '<button data-act="reset" style="margin-left:auto;font-size:12px;color:#9aa39a">' + (resetArmed ? 'ยืนยันรีเซ็ต' : 'รีเซ็ตความคืบหน้า') + '</button></div>' + logHtml();
  } else if (view === 'guide') {
    html += guideHtml();
  } else if (view === 'loadout') {
    html += ldHtml();
  } else if (view === 'bag') {
    html += bagHtml();
  } else if (view === 'daily') {
    html += dailyHtml();
  } else if (view === 'chronicle') {
    html += chronicleHtml();
  } else if (view === 'board') {
    html += '<p style="font-size:13px;color:#9aa39a">เลือกภารกิจที่จะรับ แล้วไปรายงานตัวกับกัปตันเรน (เตรียมออกล่า) · ภารกิจปัจจุบัน: <b>' + (curQuest() ? QTIER_NAME[curQuest().tier] + ' · ' + curQuest().name : 'ยังไม่ได้เลือก (First Bloom)') + '</b></p>' + questBoardHtml() + logHtml();
  } else if (view === 'dojo') {
    html += '<h2>ลานซ้อม</h2><p style="font-size:13px;color:#9aa39a">เลือกเป้าที่ไม่ตอบโต้ ตีได้ไม่อั้น — HP/ stamina ไม่ลด ไม่ใช้ของในกระเป๋า ไม่ได้รางวัลหรือ XP · วัด DPS, คอมโบ และดาเมจแต่ละครั้งแบบเรียลไทม์ · อาวุธที่ใช้ตอนนี้: <b>' + curW().name + '</b> (เปลี่ยนที่ช่างบราน)</p>' +
      '<div class="row"><button class="big" data-act="practice" data-arg="fawn">เป้าเล็ก (ลูกกวาง)</button><button data-act="practice" data-arg="stag">เป้ากวางใหญ่</button><button data-act="practice" data-arg="boar">เป้าหมูป่า (มีเกราะหลัง)</button><button data-act="practice" data-arg="wolf">เป้าหมาป่า (ตัวใหญ่ไว)</button><button data-act="practice" data-arg="rabbit">เป้ากระต่าย (เล็กและไว)</button></div>' +
      '<p style="font-size:12px;color:#9aa39a">เป้าจะยืนนิ่งและหันหน้าคงที่ — เดินวนไปตีหัว/ข้าง/หลังเพื่อลองดาเมจแต่ละส่วนได้ · เกราะหมูป่าจะฟื้นเองหลังแตก 3 วิ · สถิติรีเซ็ตเองถ้าหยุดตี 8 วิ (กด B รีเซ็ตเอง, กด X หรือปุ่มถอยเพื่อออก)</p>';
  } else if (view === 'garden') {
    html += gardenHtml();
  } else if (view === 'lab') {
    html += '<h2>ห้องวิจัย</h2><p style="font-size:13px;color:#9aa39a">นำตัวอย่างชีวภาพมาวิเคราะห์ ปลดล็อกอุปกรณ์ตรวจวินิจฉัยและยา</p>';
    html += brewHtml();
    for (k in CAT) if (CAT[k].tab === 'lab') html += itemRow(k);
  } else if (view === 'forge') {
    html += '<h2>ช่างเครื่องมือ — โรงอาวุธ</h2><p style="font-size:13px;color:#9aa39a">เลือกอาวุธประจำตัวและอัปเกรดชุดอาวุธ (ทุกอาวุธ) · อาวุธปัจจุบัน ' + curW().name + ' Mk.' + ['I', 'II', 'III'][S.wk - 1] + '</p>' + weaponHtml('forge');
    for (k in CAT) if (CAT[k].tab === 'forge') html += itemRow(k);
    html += wtreeHtml();
  } else if (view === 'pen') {
    html += '<h2>ผู้ดูแลคอก — คอกฟื้นฟู</h2>' + penHtml();
  } else if (view === 'armor') {
    html += '<h2>ช่างเกราะ — ร้านเย็บชุดเกราะ</h2><p style="font-size:13px;color:#9aa39a">สร้างชุดเกราะทีละชิ้นจากวัสดุที่ล่าได้ สวมผสมได้ ใส่ครบ 4 ชิ้นของเซ็ตเดียวกันได้โบนัสพิเศษ · สวมอยู่: <b>' + armorName() + '</b></p>' + ldQuick('armor') + armorHtml();
  } else if (view === 'shop') {
    html += '<h2>เวิร์กช็อป</h2><p style="font-size:13px;color:#9aa39a">แปรรูปวัสดุเป็นอาวุธและอุปกรณ์ภาคสนาม · ผลึก Bloomrot ได้จากการ Capture/Treat เท่านั้น · <b>หนังกวาง</b> เก็บได้จากหนังที่ลอกร่วงระหว่างลาดตระเวน (ไม่ต้องฆ่า) หรือจากการ Eliminate</p>';
    html += supplyHtml() + sellHtml();
    for (k in CAT) if (CAT[k].tab === 'shop') html += itemRow(k);
  } else if (view === 'skills') {
    html += skillsHtml();
  } else if (view === 'prep') {
    html += prepHtml();
  } else if (view === 'set') {
    html += '<h2>ตั้งค่า</h2><p style="font-size:13px;color:#9aa39a">ปรับความแรงของเอฟเฟกต์ — บันทึกอัตโนมัติ</p><div class="row"><button data-act="totitle">กลับหน้าแรก</button></div>';
    var defs = [['shake', 'สั่นจอ', 'ความแรงของจอสั่นตอนโดน/ตี'], ['stop', 'Hit-stop', 'หยุดเฟรมสั้นๆ ตอนตีโดน (ปิดได้ถ้ารู้สึกกระตุก)'], ['vol', 'เสียง', 'ระดับเสียงเอฟเฟกต์']];
    html += '<div class="item"><div><b>ความยาก (Rothorn Stag)</b><div class="d">ปกติ · ยาก (HP +20%, โดนแรงขึ้น 25%, ท่าไวขึ้น) · โหด (HP +40%, โดนแรง +50%, ท่าไวและต่อเนื่องมาก) — ยากกว่า = XP มากกว่า</div></div><div class="tabs" style="margin:0">';
    for (var dl = 0; dl < 3; dl++) html += '<button class="tab' + (diffLv() === dl ? ' on' : '') + '" data-act="set" data-arg="diff:' + dl + '">' + DIFF_NAME[dl] + '</button>';
    html += '</div></div>';
    html += '<div class="item"><div><b>ปุ่มควบคุมบนมือถือ</b><div class="d">ย้ายตำแหน่ง ปรับขนาด ความโปร่ง หรือสลับซ้าย/ขวา (ถนัดมือไหน) — ทดลองกดบนหน้านี้ได้แม้ไม่ใช่มือถือ</div></div><div class="tabs" style="margin:0"><button class="tab" data-act="tedit">แก้ไขปุ่ม</button></div></div>';
    html += '<div class="item" style="display:block"><div><b>สำรอง / ย้ายเซฟ</b><div class="d">เซฟอยู่ในเบราว์เซอร์ของเครื่องนี้เท่านั้น — ลบแอป ล้างข้อมูลเบราว์เซอร์ หรือย้ายเครื่องแล้วจะหาย · คัดลอกรหัสเก็บไว้ หรือวางรหัสจากเครื่องอื่นเพื่อนำเข้า (นำเข้าจะแทนที่ความคืบหน้าปัจจุบัน)</div></div>' +
      '<textarea id="savebox" rows="3" spellcheck="false" placeholder="วางรหัสเซฟ (ขึ้นต้น BH3:) ตรงนี้เพื่อนำเข้า" style="width:100%;box-sizing:border-box;margin:8px 0;background:#0e1510;color:#e9f7ee;border:1px solid #4d7a5f;border-radius:8px;padding:8px;font:12px monospace"></textarea>' +
      '<div class="tabs" style="margin:0"><button class="tab" data-act="savecopy">คัดลอกรหัสเซฟ</button><button class="tab" data-act="savedl">บันทึกเป็นไฟล์</button><button class="tab" data-act="saveimp">นำเข้ารหัสที่วาง</button></div></div>';
    html += '<div class="item" style="display:block"><div><b>รายงานการเล่น (ช่วยปรับเกม)</b><div class="d">เก็บในเครื่องนี้เท่านั้น: เฟรมเรต ผลการล่า จำนวนครั้งที่โดนตี การใช้บทสอน และรุ่นอุปกรณ์ — ไม่มีชื่อหรือข้อมูลส่วนตัว และไม่ถูกส่งไปไหนเอง · กดคัดลอกแล้วส่งให้ผู้พัฒนาเมื่อเล่นไปสักพัก</div></div>' +
      '<textarea id="ptbox" rows="3" readonly spellcheck="false" placeholder="กด \"คัดลอกรายงาน\" เพื่อดูตัวอย่างรายงานที่นี่" style="width:100%;box-sizing:border-box;margin:8px 0;background:#0e1510;color:#e9f7ee;border:1px solid #4d7a5f;border-radius:8px;padding:8px;font:12px monospace"></textarea>' +
      '<div class="tabs" style="margin:0"><button class="tab" data-act="ptcopy">คัดลอกรายงาน</button><button class="tab" data-act="ptclear">ล้างรายงาน</button></div></div>';
    for (i = 0; i < defs.length; i++) {
      var btns = '';
      for (var lv = 0; lv < 4; lv++) btns += '<button class="tab' + (S.set[defs[i][0]] === lv ? ' on' : '') + '" data-act="set" data-arg="' + defs[i][0] + ':' + lv + '">' + SET_LBL[lv] + '</button>';
      html += '<div class="item"><div><b>' + defs[i][1] + '</b><div class="d">' + defs[i][2] + '</div></div><div class="tabs" style="margin:0">' + btns + '</div></div>';
    }
  } else {
    html += '<h2>วิธีเล่น</h2>' + helpHtml();
  }
  showPanel(html);
}
function armorHtml() {
  var h = '<div class="item"><div><b>สรุปชุดที่สวม: ' + armorName() + '</b><div class="d">รับดาเมจ −' + Math.round(armSum('dr') * 100) + '% · สตามินา +' + armorSt() + (armSum('inf') ? ' · ติดเชื้อสั้นลง ' + Math.round(armSum('inf') * 100) + '%' : '') + (armSum('blk') ? ' · บล็อกประหยัด ' + Math.round(armSum('blk') * 100) + '%' : '') + '</div></div></div>', i, j, sl, id, on;
  for (i = 0; i < SET_KEYS.length; i++) h += '<div class="d" style="margin:2px 0 0;color:' + (eqCount(SET_KEYS[i]) === 4 ? '#9fe8ff' : '#7f887f') + '">' + SETS[SET_KEYS[i]].name + ' ' + eqCount(SET_KEYS[i]) + '/4 · ' + SETS[SET_KEYS[i]].bonus + '</div>';
  for (j = 0; j < 4; j++) {
    sl = SLOTS[j]; h += '<h2 style="font-size:15px;margin-top:12px">' + SLOT_NAME[sl] + '</h2>';
    if (S.eq[sl]) h += '<div class="d"><button class="tab" data-act="armor" data-arg="' + sl + ':">ถอด</button></div>';
    for (i = 0; i < SET_KEYS.length; i++) {
      id = SET_KEYS[i];
      if (!S.res['arm_' + id + '_' + sl]) { h += itemRow('arm_' + id + '_' + sl); continue; }
      on = S.eq[sl] === id;
      h += '<div class="item"><div>' + uiImg('arm_' + id + '_' + sl, 48, 'float:left;margin:0 8px 2px 0') + '<b>' + CAT['arm_' + id + '_' + sl].name + '</b><div class="d">' + CAT['arm_' + id + '_' + sl].desc + '</div></div><div><button class="tab' + (on ? ' on' : '') + '" data-act="armor" data-arg="' + sl + ':' + id + '">' + (on ? 'สวมอยู่' : 'สวมใส่') + '</button></div></div>';
    }
  }
  return h;
}

/* แถวของ node ในสายพัฒนา: ไอคอน (ยังไม่รู้สูตร = เงาดำ · ใช้อยู่ = กรอบเขียว) + กล่องข้อความ */
function wtNodeOpen(n, own, past, known) {
  var st = 'flex:none;max-width:52px;object-fit:contain;border-radius:8px;' + (own ? 'outline:2px solid #7fe0b5;background:rgba(127,224,181,.1);' : '') + (!known ? 'filter:brightness(.1) contrast(.9);opacity:.6;' : (past ? 'opacity:.8;' : ''));
  return '<div style="display:flex;gap:10px;align-items:flex-start;margin-top:8px">' + uiImg('wup_' + n.id, 48, st) + '<div class="d" style="margin-top:0;flex:1;min-width:0">';
}
function wtreeHtml() {  var h = '<h2 style="font-size:15px;margin-top:14px">สายพัฒนาอาวุธ</h2><p style="font-size:12px;color:#9aa39a">แต่ละอาวุธแตกได้ 2 สาย ขั้น II ต้องมีชุดอาวุธ Mk.II · ขั้น III ต้องมี Mk.III และต่อจากสายเดิม · วัสดุมาจากมอนสเตอร์คนละตัวกัน · ล้างสายคืนวัสดุเต็มจำนวน เปลี่ยนสายได้ไม่เสียของ</p>';
  var spTh = { stag: 'กวาง', boar: 'หมูป่า', rabbit: 'กระต่าย', wolf: 'หมาป่า', hive: 'ราชินีรัง' };
  for (var i = 0; i < WEAPON_KEYS.length; i++) {
    var wk = WEAPON_KEYS[i], base = WEAPONS[wk];
    if (!ownsWeapon(wk)) continue;
    var cur = wnodeOf(wk);
    h += '<div class="item" style="display:block"><div><b>' + base.name + ' · ' + base.th + '</b> <span class="' + (cur ? 'good' : 'warn') + '">' + (cur ? 'สาย ' + cur.br + ' · ' + cur.name + ' (ขั้น ' + ['I', 'II', 'III'][cur.tier - 1] + ')' : 'ขั้น I (ยังไม่แตกสาย)') + '</span></div>';
    if (cur) h += '<div class="d">' + cur.desc + '</div><div><button class="tab" data-act="wtree" data-arg="reset:' + wk + '">ล้างสาย (คืนวัสดุเต็ม)</button></div>';
    var nodes = WTREE[wk];
    for (var j = 0; j < nodes.length; j++) {
      var n = nodes[j], own = cur && cur.id === n.id, past = cur && !own && cur.prev === n.id;
      var known = S.cleared[n.sp] >= 1 || own || past || (S.mats[SP_MATS[n.sp].common] || 0) > 0;
      var line = wtNodeOpen(n, own, past, known) + '<b>' + (known ? 'สาย ' + n.br + ' ขั้น ' + ['I', 'II', 'III'][n.tier - 1] + ' · ' + n.name + ' (' + n.th + ')' : 'สาย ' + n.br + ' ขั้น ' + ['I', 'II', 'III'][n.tier - 1] + ' · ???') + '</b>';
      if (!known) { h += line + ' — ต้องเคยจบงานกับ' + spTh[n.sp] + 'ก่อนถึงจะรู้สูตร</div></div>'; continue; }
      line += '<br>' + n.desc + '<br>';
      var right;
      if (own) right = '<span class="good">ใช้อยู่</span>';
      else if (past) right = '<span class="good">ผ่านแล้ว</span>';
      else if (n.tier === 2 && cur) right = '<span class="warn">ล้างสายก่อนจึงเปลี่ยนสายได้</span>';
      else if (n.tier === 3 && !(cur && cur.id === n.prev)) right = '<span class="warn">ต้องมีสาย ' + n.br + ' ขั้น II ก่อน</span>';
      else if (S.wk < n.tier) right = '<span class="warn">ต้องมีชุดอาวุธ Mk.' + ['I', 'II', 'III'][n.tier - 1] + ' ก่อน</span>';
      else { var okc = canAfford(n.cost); right = '<button data-act="wtree" data-arg="up:' + n.id + '" class="' + (okc ? '' : 'dim') + '">' + (okc ? 'พัฒนา' : 'วัสดุไม่พอ') + '</button>'; }
      var miss = []; for (var ck in n.cost) if ((S.mats[ck] || 0) < n.cost[ck]) miss.push(MATS[ck] + ' ขาด ' + (n.cost[ck] - (S.mats[ck] || 0)));
      h += line + '<span style="color:#9aa39a">ต้องใช้: ' + costHave(n.cost) + (miss.length && !own && !past ? ' · <span class="warn">' + miss.join(', ') + '</span>' : '') + '</span><div style="margin-top:4px">' + right + '</div></div></div>';
    }
    h += '</div>';
  }
  return h;
}
function weaponHtml(view) {
  var h = '<h2 style="font-size:15px;margin-top:12px">เลือกอาวุธ</h2>';
  for (var i = 0; i < WEAPON_KEYS.length; i++) {
    var k = WEAPON_KEYS[i], w = WEAPONS[k], on = ((S.weapon || 'lance') === k);
    if (!ownsWeapon(k)) { h += itemRow('wp_' + k).replace('<b>', '<b>[' + w.th + '] '); continue; }
    var wn = wnodeOf(k); h += '<div class="item"><div style="display:flex;gap:10px;align-items:flex-start">' + uiImg(wIconKey(k), 54, 'flex:none;max-width:60px;object-fit:contain') + '<div><b>' + w.name + ' · ' + w.th + (wn ? ' → ' + wn.name + ' (สาย ' + wn.br + ')' : '') + '</b><div class="d">' + w.desc + '</div></div></div><div><button class="tab' + (on ? ' on' : '') + '" data-act="weapon" data-arg="' + k + ':' + view + '">' + (on ? 'ใช้อยู่' : 'เลือก') + '</button></div></div>';
  }
  return h;
}
function logHtml() {
  if (!S.log || !S.log.length) return '';
  var h = '<h2 style="margin-top:16px">สถิติไฟต์ล่าสุด</h2><table class="tbl"><tr><td><b>ผล</b></td><td><b>เกรด</b></td><td><b>เวลา</b></td><td><b>โดน</b></td><td><b>เสียเลือดมากสุดจาก</b></td></tr>';
  for (var i = 0; i < S.log.length; i++) {
    var e = S.log[i], top = '', best = 0;
    for (var j = 0; j < DMG_KEYS.length; j++) if (e.dmg[DMG_KEYS[j]] > best) { best = e.dmg[DMG_KEYS[j]]; top = DMG_NAME[DMG_KEYS[j]] + ' ' + best; }
    h += '<tr><td>' + (e.fawn ? '[ฝึก] ' : '') + OUT[e.out].title + '</td><td>' + e.rank + '</td><td>' + fmtTime(e.t) + '</td><td>' + e.taken + '</td><td>' + (top || '–') + '</td></tr>';
  }
  return h + '</table>';
}
function buyItem(id) {
  var c = CAT[id];
  if (!c || hasRes(id)) return;
  if (c.req && !hasRes(c.req)) { openHub(c.tab, 'ต้องมี ' + CAT[c.req].name + ' ก่อน'); return; }
  if (c.clr && !(S.cleared && S.cleared[c.clr] >= 1)) { openHub(c.tab, 'ต้องเคยจบงานกับกระต่ายสำเร็จก่อน'); return; }
  if (c.gate && forestMax() < c.gate) { openHub(c.tab, 'ต้องให้ป่าฟื้นตัวถึง ' + c.gate + '% ก่อน (ตอนนี้ ' + Math.round(forestMax()) + '%)'); return; }
  if (!canAfford(c.cost)) { openHub(c.tab, 'วัสดุไม่พอสำหรับ ' + c.name); return; }
  for (var k in c.cost) S.mats[k] -= c.cost[k];
  if (c.wk) S.wk = c.wk; else S.res[id] = true;
  persist(); sfx('heal');
  openHub(c.tab, 'ปลดล็อก ' + c.name + ' แล้ว');
}
function supplyBuy(arg) {
  var a = String(arg || '').split(':'), k = a[0], n = a[1] === 'max' ? 99 : (+a[1] === 1 ? 1 : 0);
  if (!INV_ITEMS.hasOwnProperty(k) || !n) return;
  var it = INV_ITEMS[k], cap = invCap(k), bought = 0;
  while (bought < n && invN(k) < cap && canAfford(it.cost)) { for (var ck in it.cost) S.mats[ck] -= it.cost[ck]; S.inv[k] = invN(k) + 1; bought++; }
  if (!bought) { openHub('shop', invN(k) >= cap ? it.name + ' เต็มแล้ว' : 'วัสดุไม่พอสำหรับ ' + it.name); return; }
  persist(); sfx('heal'); openHub('shop', 'ซื้อ ' + it.name + ' +' + bought + ' (มี ' + invN(k) + '/' + cap + ')');
}
function supplyHtml() {
  var h = '<h2 style="font-size:15px;margin-top:14px">เสบียงในกระเป๋า</h2><p style="font-size:13px;color:#9aa39a">ของเหล่านี้พกติดตัวทุกครั้งที่ออกล่าและใช้แล้วหมดไป จ่ายด้วยเหรียญ (ได้จากจบเคส/ขายวัสดุ) — เตรียมให้พอก่อนออกจากหมู่บ้าน · ถ้ายาสมานแผลหรือยาสลบหมด ระบบเสบียงฉุกเฉินจะเติมให้อย่างละ 1</p>';
  for (var k in INV_ITEMS) {
    var it = INV_ITEMS[k], n = invN(k), cap = invCap(k), full = n >= cap, ok = canAfford(it.cost);
    h += '<div class="item"><div><b>' + it.name + '</b> <span style="color:#9aa39a">มี ' + n + ' / ' + cap + '</span><div class="d">' + it.d + ' · ราคา/ชิ้น: ' + costHave(it.cost) + '</div></div><div>' +
      (full ? '<span class="good">เต็ม</span>' : '<button data-act="supply" data-arg="' + k + ':1" class="' + (ok ? '' : 'dim') + '">ซื้อ +1</button> <button data-act="supply" data-arg="' + k + ':max" class="' + (ok ? '' : 'dim') + '">เติมเต็ม</button>') + '</div></div>';
  }
  return h;
}
