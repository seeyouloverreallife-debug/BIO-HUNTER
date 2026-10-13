/* ================= GUIDE (คู่มือเริ่มเล่น) ================= */
function guidePages() {
  var T = isTouch;
  return [
    { t: 'ภาพรวม: เกมนี้ทำอะไร', h: '<p>คุณคือ <b>Warden</b> ผู้พิทักษ์ป่า — สัตว์ป่าถูกเชื้อ Bloomrot กัดกิน ไม่ได้มีหน้าที่แค่ล่า แต่ต้อง <b>วินิจฉัย แล้วเลือกว่าจะ จับ รักษา หรือกำจัด</b></p>' +
      '<div class="grid"><span class="k">1</span><span>รับภารกิจที่ <b>กระดานภารกิจ</b> กลางหมู่บ้าน</span><span class="k">2</span><span>คุยกับ <b>กัปตันเรน</b> → เตรียมออกล่า → <b>ลาดตระเวน</b> หามัน</span><span class="k">3</span><span><b>สแกน</b> หาอาการ แล้วสู้</span><span class="k">4</span><span>มันล้ม → เลือก <b>จับ / รักษา / กำจัด</b></span><span class="k">5</span><span>ได้ตัวอย่าง+เหรียญ → อัปเกรดอาวุธ เกราะ ยา → ป่าฟื้นตัว → รับงานที่ยากขึ้น</span></div>' },
    { t: 'ปุ่มควบคุม', h: T ?
      '<div class="grid"><span class="k">จอยสติ๊ก</span><span>เดิน (ซ้ายล่าง)</span><span class="k">ตี</span><span>แตะรัวเป็นคอมโบ</span><span class="k">ตีหนัก</span><span>กดค้างเพื่อชาร์จ แล้วปล่อย</span><span class="k">หลบ</span><span>กลิ้งหลบ ใช้สตามินา</span><span class="k">กัน</span><span>กดค้างเพื่อกัน · กดก่อนโดนเสี้ยววินาที = Parry</span><span class="k">สแกน</span><span>กดค้างเพื่อสแกนอาการ</span><span class="k">ยิงยา / สลับยา / ยาสมาน</span><span>ใช้ยาสลบ-ยารักษา และฟื้น HP</span></div><p style="font-size:13px;color:#9aa39a">ย้ายหรือปรับขนาดปุ่มได้ที่ ตั้งค่า → แก้ไขปุ่ม (สลับมือถนัดได้)</p>' :
      '<div class="grid"><span class="k">WASD</span><span>เดิน · เมาส์เล็งทิศ</span><span class="k">คลิกซ้าย / J</span><span>ตี (กดรัวเป็นคอมโบ)</span><span class="k">คลิกขวา / K ค้าง</span><span>ชาร์จตีหนัก แล้วปล่อย</span><span class="k">Space</span><span>กลิ้งหลบ</span><span class="k">L / Shift ค้าง</span><span>กัน · กดก่อนโดนเสี้ยววินาที = Parry</span><span class="k">Q ค้าง</span><span>สแกนอาการ</span><span class="k">T / E / R</span><span>สลับยา / ยิงยา / ยาสมานแผล</span><span class="k">C / F</span><span>ย่อเดินเงียบ / ตรวจร่องรอย-เก็บของ</span><span class="k">P</span><span>พักเกม</span></div>' },
    { t: 'ลาดตระเวน (ก่อนสู้)', h: '<p>ก่อนเจอตัว คุณมีเวลาเตรียมตัว: ' + (T ? 'ปุ่ม ย่อ = เดินเงียบ · ปุ่ม ตรวจ/เก็บ = ดูร่องรอย · สแกน = ดูไกล' : '<b>C</b> ย่อเดินเงียบ · <b>F</b> ค้างตรวจร่องรอย/เก็บของ · <b>Q</b> สแกนระยะไกล') + '</p><div class="grid"><span class="k">ลม+พุ่มไม้</span><span>อย่าเดินเข้าทางใต้ลม · พุ่มไม้ช่วยซ่อนตัว</span><span class="k">SNEAK ATTACK</span><span>ตีตอนมันยังไม่รู้ตัว = ดาเมจสูง</span><span class="k">เหยื่อ / กับดัก</span><span>วางเหยื่อล่อให้มันเหยียบกับดัก → ติดกับ ~6 วิ โจมตีฟรี</span><span class="k">ถอย</span><span>ไม่ไหวก็ถอนตัวได้ (' + (T ? 'ปุ่ม ถอย' : 'X') + ')</span></div>' },
    { t: 'การต่อสู้', h: '<div class="grid"><span class="k">ตีคอมโบ</span><span>กดต่อเนื่อง ท่า 3 แรง · ท่า 4 หมุนฟันรอบตัว · ท่า 5 Finisher ต้องมี FLOW ×3</span><span class="k">สตามินา</span><span>แถบเขียว: ตี หลบ กัน ใช้หมด = ช้าและเสี่ยง</span><span class="k">พื้นที่แดง</span><span>มันกำลังจะโจมตี — หนีออกหรือหลบ · <b>ขอบฟ้า</b> = Parry ได้</span><span class="k">Perfect Dodge / Parry</span><span>จังหวะแม่น = เวลาช้าลง + FLOW (ตีแรง-ไวขึ้น, COUNTER ×1.6)</span><span class="k">SLIP STRIKE</span><span>หลังหลบ/Parry รีบตี = พุ่งสวนทันที ×1.25</span><span class="k">จุดอ่อน</span><span>หน้า = เขา · ข้าง = เลือดออก · หลัง = ขาช้า · ทำ Trauma ถึงระดับ 2-3 → <b>แผลเปิด</b> ชาร์จตีหนักใส่ = ×2 + มันเสียหลัก</span></div>' },
    { t: 'วินิจฉัยและรักษา', h: '<div class="grid"><span class="k">สแกน</span><span>' + (T ? 'กดค้าง สแกน' : 'กดค้าง Q') + ' → เบื้องต้นจะ "สงสัย" 2 อย่าง · สแกนซ้ำตอนมันเซ/สตัน/ง่วง = <b>ยืนยัน</b></span><span class="k">ก่อนสู้</span><span>ที่หน้าเตรียมออกล่า มีตัวเลือกตรวจตัวอย่าง/สอบถามชาวบ้าน ช่วยรู้อาการล่วงหน้า</span><span class="k">ยารักษา</span><span>' + (T ? 'สลับยา → ยิงยา' : '<b>T</b> สลับยา → <b>E</b> ยิง') + ' · ยาตรงอาการ 2 นัด (หรือ 1 นัดตอนมันเซ) = รักษาสำเร็จ</span><span class="k">ระวัง</span><span>ยาผิด = มันโมโห · ปล่อยอาการลุกลาม = อาจกลายพันธุ์ในเฟส 2</span></div>' },
    { t: 'เมื่อมันล้ม: จับ / รักษา / กำจัด', h: '<div class="grid"><span class="k">จับ</span><span>ต้องคำนวณโดสยาสลบให้พอดี (ดูชีพจรที่สแกนไว้) → ได้สัตว์ไปพักฟื้นที่คอก ได้ตัวอย่างมากสุด</span><span class="k">รักษา</span><span>ต้องวินิจฉัยและเลือกยาตรง + เปิดโคนเขา (Trauma ≥ 2) → ผลดีต่อป่ามากสุด</span><span class="k">กำจัด</span><span>ปลอดภัยที่สุด แต่ตัวอย่างน้อยและป่าเสียหาย</span></div><p style="font-size:13px;color:#9aa39a">คะแนนเกรดดูจากเวลา ความเสียหายที่โดน และวิธีปิดงาน · XP สะสมเลื่อนขั้นและได้แต้มทักษะ</p>' },
    { t: 'หมู่บ้าน Fern Hollow', h: '<div class="grid"><span class="k">กระดานภารกิจ</span><span>เลือกงาน (ยิ่งดาวสูง ยิ่งยากและได้มาก)</span><span class="k">กัปตันเรน</span><span>แผนที่ป่า เตรียมออกล่า</span><span class="k">ช่างเครื่องมือ</span><span>เลือกและอัปเกรดอาวุธ</span><span class="k">ช่างเกราะ</span><span>เย็บชุดเกราะจากวัสดุที่ล่าได้</span><span class="k">ห้องวิจัย</span><span>วิเคราะห์ตัวอย่าง ปลดล็อกอุปกรณ์/ยา</span><span class="k">เวิร์กช็อป</span><span>ซื้อเสบียง ขายของ</span><span class="k">ลานเพาะปลูก</span><span>ปลูกสมุนไพร</span><span class="k">คอกฟื้นฟู</span><span>ดูแลสัตว์ที่จับมา → ปล่อยคืนป่า หรือเป็นผู้ช่วย</span><span class="k">ลานซ้อม</span><span>ลองคอมโบ วัด DPS ไม่เสียอะไร</span></div>' },
    { t: 'เริ่มอย่างไรดี', h: '<ol style="margin:6px 0 10px 20px;line-height:1.7"><li>เล่น <b>ด่านฝึก</b> ลูกกวาง ~1 นาที (มีโค้ชสอนทีละขั้น)</li><li>รับภารกิจแรก <b>First Bloom</b> จากกระดาน</li><li>ก่อนออกล่า เตรียมยา/เสบียงให้พอ</li><li>สู้ไม่ไหว → ถอนตัวได้ ไม่เสียอะไรมาก — ลองใหม่เมื่อรู้ท่ามัน</li></ol><p style="font-size:13px;color:#9aa39a">รายละเอียดเชิงลึก (อาวุธ ท่าประจำอาการ ฯลฯ) อยู่ที่แท็บ "วิธีเล่น"</p><div class="row"><button class="big" data-act="tut">เริ่มด่านฝึก</button></div>' }
  ];
}
function guideHtml() {
  var P2 = guidePages(), n = P2.length;
  guidePg = clamp(Math.round(guidePg) || 0, 0, n - 1);
  var pg = P2[guidePg];
  var dots = ''; for (var i = 0; i < n; i++) dots += '<button class="tab' + (i === guidePg ? ' on' : '') + '" data-act="gpg" data-arg="' + i + '" style="padding:6px 10px">' + (i + 1) + '</button>';
  return '<h2>คู่มือเริ่มเล่น · ' + (guidePg + 1) + '/' + n + ' — ' + pg.t + '</h2>' + pg.h +
    '<div class="row" style="margin-top:10px"><button data-act="gpg" data-arg="' + (guidePg - 1) + '" class="' + (guidePg === 0 ? 'dim' : '') + '">← ก่อนหน้า</button>' + dots +
    '<button data-act="gpg" data-arg="' + (guidePg + 1) + '" class="' + (guidePg === n - 1 ? 'dim' : '') + '">ถัดไป →</button></div>';
}
function statusHelpHtml() { var o = [], k; for (k in STATUS) o.push(uiImg('st_' + k, 18, 'vertical-align:-4px;margin-right:3px') + '<b style="color:' + STATUS[k].col + '">' + STATUS[k].th + '</b> ' + STATUS[k].desc); return uiImg('st_infect', 18, 'vertical-align:-4px;margin-right:3px') + '<b style="color:#c79cff">ติดเชื้อ</b> เสีย HP ต่อเนื่อง 3/วิ (สปอร์/ท่าโรคระยะวิกฤต) · ' + o.join(' · '); }
function helpHtml() {
  return (
    '<div class="grid">' +
    '<span class="k">ลาดตระเวน</span><span>ก่อนสู้จะได้สำรวจอาณาเขต: <b>C</b> ย่อ/ย่องเงียบ · <b>F</b> ค้างตรวจร่องรอย/เก็บของ · <b>Q</b> สแกนระยะไกล · ดูทิศลม พุ่มไม้ช่วยซ่อน · ตีมันตอนไม่รู้ตัว = SNEAK ATTACK</span>' +
    '<span class="k">วัสดุเฉพาะตัว</span><span>กวาง/หมูป่า/กระต่าย ดรอปของคนละอย่าง: ทุกงานได้ของธรรมดา 1 · <b>ทำโคนเขา(หู)ร้าวถึงระดับ 2</b> = ของหายาก · สีข้าง/ขาหลังร้าว +1 ต่อจุด · เกรด A/S +1 · ตัวแปรรุนแรง/วิกฤตได้ของหายากเพิ่ม · ทุก 3 งานการันตีโบนัส (กันดวงซวย) · ชุดเกราะครบเซ็ตใช้ราว 4-5 งานของสายพันธุ์นั้น</span>' +
    '<span class="k">อาวุธ</span><span>เลือกก่อนออกล่าที่หน้าภารกิจ/เตรียมการ: <b>Tether Lance</b> สมดุล ค้าง K = แทงทะลุ 2 จุดและผูกสาย (มันเดินช้า) · กด K อีกครั้ง = กระชากดึงมันเข้ามา ขัดท่าที่กำลังง้าง · <b>Seed Cannon</b> ยิงจากไกล กด K = ยิงพุ่มหนามลงพื้น (มันเดินช้า/เสียสมดุล คุณฟื้นสตามินาไว) · <b>Pruning Blades</b> เร็ว คอมโบ 6 ท่า กด K = Slip-Cut พุ่งตัดผ่านตัวมัน ตัดโดนจุดติดเชื้อที่สแกนแล้ว = PRUNE · ชุดอาวุธ Mk.II/III ใช้ได้กับทุกอาวุธ</span>' +
    '<span class="k">SLIP STRIKE</span><span>หลัง <b>Perfect Dodge หรือ Parry</b> กดตีภายใน ~0.7 วินาที = พุ่งเข้าหามันทันที ตีแรง ×1.25 (ตัดจากท่าหลบได้) แล้วต่อคอมโบท่าที่ 3 ได้</span>' +
    '<span class="k">แผลเปิด</span><span>เมื่อ Trauma ของจุดใดขึ้นระดับ จะเกิด <b>แผลเปิด</b> (วงเรืองแสงบนตัวมัน ~11 วินาที) — <b>ชาร์จตีหนัก</b>ใส่ด้านนั้น = PRECISION STRIKE ดาเมจ ×2 + ทำให้เสียหลัก แล้วต้องรอแผลใหม่ ~14 วินาที</span>' +
    '<span class="k">สีเลนโจมตี</span><span>ขอบ <b>ฟ้า</b> = Parry ได้ · ขอบแดง = หลบเท่านั้น (มีป้ายบอกเหนือหัวมัน)</span>' +
    '<span class="k">สถานะผิดปกติ</span><span>' + statusHelpHtml() + ' — แสดงใต้แถบ HP · ยาสมานแผล (R) ล้างได้ทุกสถานะ</span>' +
    '<span class="k">ท่าประจำอาการ</span><span>อาการของมอนสเตอร์มีท่าเฉพาะ: ผลึก → เศษพุ่ง 3 เลน · ข้ออักเสบ → พุ่งไหล่ (ถ้าหลบพ้นมันเสียหลักนาน) · แผลติดเชื้อ → พ่นหนองทิ้งแอ่งเชื้อ — สแกนเพื่อรู้ล่วงหน้า และรักษาแล้วท่านั้นจะหายไป</span>' +
    '<span class="k">สตรีค</span><span>ตีต่อเนื่องโดยไม่โดนโจมตี: ตีแรงขึ้นสูงสุด +30% และได้สตามินาคืนทุก 5 ฮิต</span>' +
    '<span class="k">รักษากลางไฟต์</span><span>สแกน (Q) วินิจฉัยแล้ว กด <b>T</b> สลับลูกดอกเป็นยารักษา แล้วยิง (E) — ยาตรงอาการ 2 นัด (หรือ 1 นัดตอนมันเซ/ง่วง) = รักษาสำเร็จ ท่าประจำอาการหาย · ยาผิด = มันโมโห · <b>ถ้าปล่อยอาการลุกลาม มันอาจกลายพันธุ์ตอนเฟส 2</b> (ยังรักษาย้อนกลับได้) · ลูกดอกใช้ร่วมกับยาสลบ</span>' +
    '<span class="k">B / V</span><span>(ลาดตระเวน) วางเหยื่อล่อ / ซ่อนกับดัก — ล่อให้มันกินเหยื่อใต้กับดัก = ติดกับ ~6 วินาที โจมตีฟรี</span>' +
    '<span class="k">WASD</span><span>เดิน · <b>เมาส์</b> เล็งทิศ (หรือใช้ทิศที่เดิน)</span>' +
    '<span class="k">คลิกซ้าย / J</span><span>แทงเบา กดต่อเนื่อง: ท่า 1-2 แทงไว · ท่า 3 แทงหนัก · <b>ท่า 4 WHIRL SLASH</b> หมุนฟันรอบตัวทุกทิศ (ต้องตีโดนอย่างน้อย 2 ครั้งในคอมโบ) · ท่า 5 Finisher ต้องมี FLOW ×3</span>' +
    '<span class="k">คลิกขวา / K ค้าง</span><span>ชาร์จแทงหนัก ปล่อยเพื่อโจมตี</span>' +
    '<span class="k">Space</span><span>กลิ้งหลบ — หลบตรงจังหวะ = Perfect Dodge (เวลาช้าลง)</span>' +
    '<span class="k">L / Shift ค้าง</span><span>ป้องกัน · กดก่อนโดนเสี้ยววินาที = Parry</span>' +
    '<span class="k">FLOW</span><span>Parry / Perfect Dodge = สแตก FLOW (สูงสุด ×3) ตีแรง-ไวขึ้น + COUNTER ×1.6 · ครบ ×3 ต่อคอมโบถึงท่าที่ 5 Finisher</span>' +
    '<span class="k">Q ค้าง</span><span>สแกนสัญญาณชีพ + <b>วินิจฉัยอาการ</b> (รู้จุดอ่อน +15% และเลือกยา Treat ได้ถูก)</span>' +
    '<span class="k">E / R</span><span>ยิงยาสลบ (ทำให้สงบ/ง่วง) / ยาสมานแผล (ฟื้น HP + ล้างเชื้อ)</span>' +
    '</div>' +
    '<p style="color:#9aa39a;font-size:13px">เคล็ดลับ: ตีคนละด้านให้ผลต่างกัน — ด้านหน้าทำลายเขา ด้านข้างทำให้เลือดออก ด้านหลังทำให้ขาช้า · ล่อมันพุ่งชนหินเพื่อโอกาสทอง</p>');
}
function openDecision() {
  mode = 'decision';
  var hl = lvl(M.tr.horn);
  showPanel(
    uiImg(M.kind, 64, 'float:right;margin:0 0 6px 10px') + '<h2>' + monName() + ' ล้มลงแล้ว</h2><div class="sub">ถึงเวลาตัดสินใจ — ผลลัพธ์ต่างกันทั้งข้อมูลวิจัยและระบบนิเวศ</div>' +
    (M.kind === 'fawn' ? '<div class="note"><b>บทสอน:</b> <b>จับ</b> = ได้สัตว์ไปพักฟื้นที่คอก (ต้องคำนวณโดสยาสลบให้พอดี) · <b>รักษา</b> = ใช้ยาตรงอาการ ได้ผลดีต่อป่ามากสุด · <b>กำจัด</b> = ปลอดภัยแต่ได้ตัวอย่างน้อยและป่าเสียหาย — ที่ด่านฝึก ลองเลือกอะไรก็ได้</div>' : '') +
    '<p>สภาพ' + PART_TH.horn + ': <b class="' + (hl >= 2 ? 'good' : 'warn') + '">ร้าวระดับ ' + hl + '/3</b> ' + (hl >= 2 ? '(เปิดจุดฉีดยาแล้ว)' : '(ยังแน่นเกินไปสำหรับฉีดยาเต็มที่)') + '</p>' +
    '<div class="row">' +
    '<button class="opt" data-act="capture">จับ (Capture)<small>ต้องคำนวณโดสยาสลบให้ถูก · ได้ตัวอย่างมากสุด</small></button>' +
    '<button class="opt" data-act="treat">' + (M.cured ? 'ปิดงานรักษา (Treat)<small>รักษาในสนามสำเร็จแล้ว — ได้ผลเต็มที่ทันที</small>' : 'รักษา (Treat)<small>ต้องวินิจฉัยอาการและเลือกยาให้ตรง + เปิด' + PART_TH.horn + ' (Trauma ≥ 2)</small>') + '</button>' +
    '<button class="opt" data-act="eliminate">กำจัด (Eliminate)<small>ปลอดภัยที่สุด · ตัวอย่างน้อยและกระทบระบบนิเวศ</small></button>' +
    '</div>');
}
function openTreat() {
  mode = 'decision';
  var hl = lvl(M.tr.horn), info, k;
  if (M.diagKnown) info = '<span class="good">ผลวินิจฉัย: ' + AIL[M.ail].name + '</span> — เลือกยาที่ตรงกับอาการ';
  else {
    var cl = M.narrow ? (M.candFirst ? [M.ail, M.cand] : [M.cand, M.ail]) : AIL_KEYS.slice(), lines = '';
    for (var i = 0; i < cl.length; i++) lines += '<br>• ' + AIL[cl[i]].clue + ' (' + AIL[cl[i]].name + '?)';
    info = '<span class="warn">ยังไม่ได้วินิจฉัยแน่ชัด</span> — จากอาการภายนอกสงสัยได้' + (cl.length === 2 ? 'สองอย่าง' : 'สามอย่าง') + ':' + lines +
      '<br><span style="color:#9aa39a;font-size:13px">ถ้าเดาผิด ยาจะไม่ได้ผล — ครั้งหน้าสำรวจ/ตรวจตัวอย่างก่อนออกล่า หรือสแกน (Q) ระหว่างสู้</span>';
  }
  var h = '<h2>เลือกยารักษา</h2><div class="sub">ยาต้องตรงกับอาการ · ' + PART_TH.horn + ' ' + (hl >= 2 ? 'เปิดแล้ว (ฉีดได้เต็มที่)' : 'ยังไม่เปิด (ได้ผลเพียงบางส่วน)') + '</div><p>' + info + '</p><div class="row">', n = 0;
  for (k in MEDS) if (huntMeds[k]) { var left = (ensureDoses()[k] || 0); if (left > 0) n++; h += '<button class="opt' + (left > 0 ? '' : ' dim') + '" data-act="med" data-arg="' + k + '">' + MEDS[k] + ' ×' + left + '<small>' + MED_DESC[k] + (left > 0 ? '' : ' — หมดแล้ว') + '</small></button>'; }
  if (!n) h += '<p class="warn">ยารักษาในกระเป๋าหมดแล้ว — Treat ไม่ได้ ต้องเลือกอย่างอื่น (ซื้อยาเพิ่มที่ร้านพ่อค้าในหมู่บ้านก่อนออกล่าครั้งหน้า)</p>';
  showPanel(h + '</div><div class="row"><button data-act="back">← กลับไปเลือกใหม่</button></div>');
}
function chooseMed(id) {
  if (mode !== 'decision' || !MEDS[id] || !huntMeds[id] || (ensureDoses()[id] || 0) <= 0) return;
  ensureDoses()[id]--;
  if (AIL[M.ail].med !== id) finish('treat_wrong');
  else finish(lvl(M.tr.horn) >= 2 ? 'treat_full' : 'treat_part');
}
function reqDose() {
  var hr = Math.round(55 + M.downStress * .9);
  return hr < 90 ? 'low' : (hr < 120 ? 'mid' : 'high');
}
function openDosage() {
  mode = 'decision';
  var info;
  if (scanRec) {
    var age = Math.round(tNow - scanRec.t);
    info = 'สแกนล่าสุด: <b>' + scanRec.hr + ' bpm</b> · อุณหภูมิ ' + scanRec.temp + '°C · หายใจ ' + scanRec.br + '/นาที <span style="color:#9aa39a">(เมื่อ ' + age + ' วินาทีก่อน — ค่าอาจเปลี่ยนไปแล้ว)</span>';
  } else info = '<span class="warn">ไม่มีข้อมูลสแกนเลย — ต้องเดาจากสัญชาตญาณ</span>';
  showPanel(
    '<h2>คำนวณโดสยาสลบ</h2><div class="sub">Weight Class B · สัตว์ตื่นเต้นยิ่งต้องใช้ยามาก</div>' +
    '<p>' + info + '</p>' +
    '<table class="tbl"><tr><td>ชีพจร &lt; 90 bpm</td><td>→ <b>โดสต่ำ</b> (สงบ)</td></tr>' +
    '<tr><td>ชีพจร 90–119 bpm</td><td>→ <b>โดสกลาง</b> (ตื่นตัว)</td></tr>' +
    '<tr><td>ชีพจร ≥ 120 bpm</td><td>→ <b>โดสสูง</b> (คลุ้มคลั่ง)</td></tr></table>' +
    '<p style="font-size:13px;color:#9aa39a">โดสน้อยไป = มันตื่นแล้ววิ่งหนี · มากไป = ได้รับยาเกินขนาด</p>' +
    (hasSkill('aim') ? '<p class="good" style="font-size:13px">Steady Aim: ให้โดสสูงกว่าที่ต้องการหนึ่งระดับได้อย่างปลอดภัย</p>' : '') +
    '<div class="row">' +
    '<button class="opt" data-act="dose" data-arg="low">โดสต่ำ</button>' +
    '<button class="opt" data-act="dose" data-arg="mid">โดสกลาง</button>' +
    '<button class="opt" data-act="dose" data-arg="high">โดสสูง</button></div>');
}
function chooseDose(d) {
  var rk = { low: 0, mid: 1, high: 2 }, req = reqDose();
  if (d === req) finish('capture_ok');
  else if (rk[d] < rk[req]) finish('capture_under');
  else if (hasSkill('aim') && rk[d] - rk[req] === 1) finish('capture_ok');
  else finish('capture_over');
}
var OUT = {
  capture_ok:    { title: 'จับสำเร็จ', cls: 'good', base: 100, xp: 320, loot: ['เลือดสด ×2', 'น้ำลาย ×1', 'ผลึก Bloomrot (สภาพดี) ×1'],
    text: 'คุณคำนวณโดสได้พอดี {M} หลับสนิทและถูกส่งกลับแล็บ ทีมวิจัยจะได้ศึกษา Bloomrot จากตัวอย่างมีชีวิต — ผลลัพธ์ที่ให้ข้อมูลมากที่สุด', eco: 'ระบบนิเวศคงที่ · ข้อมูลวิจัยสูง' },
  capture_under: { title: 'จับไม่สำเร็จ', cls: 'bad', base: 55, xp: 90, loot: ['เลือดสด ×1'],
    text: 'โดสน้อยเกินไป... มันสะดุ้งตื่นกลางการขนย้ายแล้ววิ่งหนีเข้าป่าลึก คุณได้เพียงตัวอย่างเลือดเล็กน้อย', eco: 'มอนสเตอร์ยังเป็นภัยอยู่' },
  capture_over:  { title: 'ยาเกินขนาด', cls: 'bad', base: 40, xp: 60, loot: ['หนังกวาง ×1'],
    text: 'ยาแรงเกินไป หัวใจมันหยุดเต้นก่อนทีมช่วยเหลือจะมาถึง... บทเรียนราคาแพงเรื่องการคำนวณโดส', eco: 'สูญเสียตัวอย่างมีชีวิต' },
  treat_full:    { title: 'รักษาสำเร็จ', cls: 'good', base: 95, xp: 300, loot: ['เลือดสด ×1', 'น้ำลาย ×1', 'ผลึก Bloomrot (ปลอดเชื้อ) ×1'],
    text: 'คุณฉีดยาต้านเชื้อเข้าที่{H}ที่แตกร้าวได้พอดี คริสตัลหลุดร่วงและอาการสงบลง {N}เดินกลับเข้าป่าอย่างช้าๆ ป่าแห่งนี้ยังมีมันอยู่ต่อไป', eco: 'ระบบนิเวศฟื้นตัว · ได้ข้อมูลวิจัยดีมาก' },
  treat_part:    { title: 'รักษาได้เพียงบางส่วน', cls: 'warn', base: 60, xp: 130, loot: ['เลือดสด ×1'],
    text: '{H}ยังแน่นเกินกว่าจะฉีดยาเข้าได้ลึก ยาออกฤทธิ์เพียงบางส่วน มันฟื้นแล้วหนีไป แต่อาการดีขึ้นเล็กน้อย — ครั้งหน้าลองทำให้{H}ร้าวก่อน', eco: 'อาการดีขึ้นเล็กน้อย' },
  treat_wrong:   { title: 'รักษาผิดวิธี', cls: 'bad', base: 45, xp: 100, loot: ['เลือดสด ×1'],
    text: 'ยาที่ฉีดไม่ตรงกับอาการจริง อาการไม่ดีขึ้นและมันหนีเข้าป่าไป — การวินิจฉัยที่ผิดอาจแย่กว่าไม่รักษา ครั้งหน้าสแกนยืนยันก่อนเลือกยา', eco: 'อาการยังอยู่ · ได้ข้อมูลน้อย' },
  eliminate:     { title: 'กำจัดสำเร็จ', cls: 'warn', base: 55, xp: 80, loot: ['หนังกวาง ×1'],
    text: 'หมู่บ้านปลอดภัยแล้ว แต่คุณแทบไม่ได้เรียนรู้อะไรเพิ่มเกี่ยวกับ Bloomrot และมันยังคงแพร่ต่อไปที่อื่น', eco: 'กระทบระบบนิเวศ · ข้อมูลวิจัยต่ำ' },
  defeat:        { title: 'ภารกิจล้มเหลว', cls: 'bad', base: 0, xp: 0, loot: [],
    text: 'Warden ล้มลงกลางป่า... กลับไปเตรียมยาและอุปกรณ์ แล้วลองอีกครั้ง', eco: '-' }
};
/* ข้อความผลลัพธ์ผูกกับสัตว์ตัวจริง: {M} ชื่อ · {N} คำเรียก · {H} ชื่อจุดอ่อนส่วนหัว (เดิมฝังชื่อ "Rothorn Stag"/กวาง/โคนเขา ตอนโหลดเกม) */
function resultText(t) {
  var k = M ? M.kind : huntKind, n = k === 'boar' ? 'หมูป่า' : (k === 'rabbit' ? 'กระต่าย' : (k === 'wolf' ? 'หมาป่า' : (k === 'hive' ? 'ราชินีรัง' : 'กวาง')));
  return String(t).replace(/\{M\}/g, monName()).replace(/\{N\}/g, n).replace(/\{H\}/g, PART_TH.horn);
}
function syncInv() {
  if (!huntInv || !P || !S.inv) return;
  S.inv.salve = clamp(Math.round(P.salves), 0, invCap('salve')); S.inv.dart = clamp(Math.round(P.darts), 0, invCap('dart'));
  for (var k in MEDS) S.inv[k] = clamp(Math.round((P.doses && P.doses[k]) || 0), 0, invCap(k));
  var relief = false; if (S.inv.salve < 1) { S.inv.salve = 1; relief = true; } if (S.inv.dart < 1) { S.inv.dart = 1; relief = true; }
  huntInv = false; return relief;
}
function finish(kind) {
  var trMul = 1, trustMsg = '';
  if (mode === 'result') return;
  mode = 'result';
  if (M && M.kind !== 'fawn') syncInv(); else huntInv = false;
  var o = OUT[kind];
  var gain = {}, gk, base = LOOT[kind] || {};
  for (gk in base) gain[gk] = base[gk];
  if (huntHide > 0 && kind !== 'defeat' && M.kind !== 'fawn') { gain.hide = (gain.hide || 0) + huntHide; }
  huntHide = 0;
  var spDrop = null;
  if (M.kind !== 'fawn' && SP_MATS[M.kind] && kind !== 'defeat') {
    var spm = SP_MATS[M.kind], spk = isBoss(M.kind) ? M.kind : spOf(M.kind), spc = SP_COMMON[kind] || 0, spr = 0;
    if (!S.pity) S.pity = {};
    if (lvl(M.tr.flank) >= 2) spc++;
    if (lvl(M.tr.hind) >= 2) spc++;
    S.pity[spk + '_c'] = (S.pity[spk + '_c'] || 0) + 1; if (S.pity[spk + '_c'] >= 3) { S.pity[spk + '_c'] = 0; spc++; }
    if (lvl(M.tr.horn) >= 2) spr++;
    if (M.variant === 1) spr++;
    if (M.crisis) spr++;
    if (spr > 0) S.pity[spk + '_r'] = 0; else { S.pity[spk + '_r'] = (S.pity[spk + '_r'] || 0) + 1; if (S.pity[spk + '_r'] >= (hasSkill('keen') ? 2 : 3)) { S.pity[spk + '_r'] = 0; spr = 1; } }
    if (spc) gain[spm.common] = (gain[spm.common] || 0) + spc;
    if (spr) gain[spm.rare] = (gain[spm.rare] || 0) + spr;
    spDrop = spm;
  }
  if (hasSkill('medic') && (kind === 'treat_full' || kind === 'treat_part')) {
    gain.blood = (gain.blood || 0) + 1;
    if (kind === 'treat_full') gain.crystal = (gain.crystal || 0) + 1;
  }
  if (M.kind !== 'fawn' && mutNow().id === 'bloom' && (kind === 'capture_ok' || kind === 'treat_full' || kind === 'treat_part' || kind === 'eliminate')) gain.crystal = (gain.crystal || 0) + 1;
  if (M.mut && (kind === 'capture_ok' || kind === 'treat_full')) { gain.blood = (gain.blood || 0) + 1; gain.crystal = (gain.crystal || 0) + 1; }
  var oldRank = rankIdx();
  var varNote = '', okK = kind === 'capture_ok' || kind === 'treat_full' || kind === 'eliminate', qd = M.kind !== 'fawn' ? qDef(M.quest) : null, qExtraXp = 0;
  if (M.variant === 1 && okK) {
    var vm = M.crisis ? 2 : 1.5; for (gk in gain) gain[gk] = Math.ceil(gain[gk] * vm); gain.crystal = (gain.crystal || 0) + (M.crisis ? 2 : 1);
    varNote = '<p class="good">' + (M.crisis ? 'ภารกิจวิกฤต' : 'ตัวแปรรุนแรง') + ' (' + monNameOf(M.kind, 1) + '): รางวัล ×' + vm + ' + ผลึกพิเศษ</p>';
  }
  if (qd && okK) {
    var preU = {}; for (var pq = 0; pq < QUESTS.length; pq++) preU[QUESTS[pq].id] = qUnlocked(QUESTS[pq]);
    S.qclear[qd.id] = (S.qclear[qd.id] || 0) + 1;
    var nextQ = []; for (var nq = 0; nq < QUESTS.length; nq++) if (!qCleared(QUESTS[nq].id) && qUnlocked(QUESTS[nq]) && !preU[QUESTS[nq].id]) nextQ.push(QUESTS[nq].name);
    if (qd.key && S.qclear[qd.id] === 1) { S.mats.coin = clamp(S.mats.coin + 200, 0, 9999); varNote += '<p class="good"><b>⚔ ผ่านเควสเลื่อนขั้น ' + qd.name + '!</b> เหรียญ +200</p>'; }
    if (S.qclear[qd.id] === 1 && nextQ.length) varNote += '<p class="good">ปลดล็อกภารกิจใหม่: <b>' + nextQ.join(', ') + '</b></p>';
  }
  if (qd && qd.goal) {
    var gOk = okK && (qd.goal === 'heal' ? kind === 'treat_full' : (qd.goal === 'taken' ? stats.taken <= 8 : (qd.goal === 'fast' ? stats.time <= 100 : !!(M.scanLog && M.scanLog[2] && M.scanLog[3]))));
    if (gOk && !S.qextra[qd.id]) { S.qextra[qd.id] = true; gain.crystal = (gain.crystal || 0) + 3; gain.blood = (gain.blood || 0) + 2; gain.hide = (gain.hide || 0) + 2; qExtraXp = 150; varNote += '<p class="good"><b>EXTRA ★ สำเร็จ!</b> เงื่อนไขพิเศษผ่าน — ได้ผลึก +3 เลือดสด +2 หนังกวาง +2 และ XP +150</p>'; }
    else if (gOk) varNote += '<p class="good">EXTRA: เงื่อนไขพิเศษผ่านอีกครั้ง (รางวัลพิเศษรับได้ครั้งแรกเท่านั้น)</p>';
    else varNote += '<p class="warn">EXTRA: เงื่อนไขพิเศษไม่ผ่าน — ' + qd.info.split('—')[1].split('·')[0].trim() + '</p>';
  }
  if (M.kind !== 'fawn' && okK) S.cleared[isBoss(M.kind) ? M.kind : spOf(M.kind)]++;
  var forestNote = '', fireNote = '';
  if (M.aggro && SHRINE) {
    var shp = SHRINE.hp, spen = Math.round((100 - shp) / 100 * 14) + Math.min(5, Math.floor(huntFires / 10));
    if (shp >= 50 && (kind === 'capture_ok' || kind === 'treat_full' || kind === 'eliminate')) { ecoSpread(huntRegionKey(), 6, 2); fireNote = '<p class="good">พุ่มไม้ศักดิ์สิทธิ์รอด (' + Math.round(shp) + '%): ป่า ' + REGIONS[huntRegionKey()].name + ' +6 · เขตอื่น +2</p>'; }
    else if (spen > 0) { ecoSpread(huntRegionKey(), -spen, -Math.ceil(spen / 3)); fireNote = '<p class="warn">พุ่มไม้ศักดิ์สิทธิ์เหลือ ' + Math.round(shp) + '% · ไฟลุก ' + huntFires + ' แห่ง — ป่า ' + REGIONS[huntRegionKey()].name + ' −' + spen + ' · เขตอื่น −' + Math.ceil(spen / 3) + '</p>'; }
  } else if (M.aggro && huntFires >= 4) { var fpen = Math.min(15, Math.floor(huntFires / 4)); ecoSpread(huntRegionKey(), -fpen, -Math.ceil(fpen / 3)); fireNote = '<p class="warn">ไฟป่า: จุดไฟ ' + huntFires + ' แห่ง — ป่า ' + REGIONS[huntRegionKey()].name + ' −' + fpen + ' · เขตอื่น −' + Math.ceil(fpen / 3) + '</p>'; }
  if (M.kind === 'wolf') {
    if (kind === 'capture_ok' || kind === 'treat_full') { ecoSpread(huntRegionKey(), 6, 1); forestNote = '<p class="good">ผู้ล่าสูงสุดสงบลง ระบบนิเวศสมดุลขึ้น: ป่า ' + REGIONS[huntRegionKey()].name + ' +6 · เขตอื่น +1</p>'; }
  } else if (M.kind === 'hive') {
    if (kind === 'capture_ok' || kind === 'treat_full' || kind === 'eliminate') { ecoSpread(huntRegionKey(), 4, 1); forestNote = '<p class="good">รังแมลงสงบลง ฝูงสลายตัว: ป่า ' + REGIONS[huntRegionKey()].name + ' +4 · เขตอื่น +1</p>'; }
  } else if (M.kind !== 'fawn') {
    var fk = spOf(M.kind), f0 = forestOf(fk);
    if (SPECIES.indexOf(M.kind) >= 0) { trMul = trustMul(fk); var t0 = Math.round(trustOf(fk)), td = trustAdd(fk, mutTrust(TRUST_DELTA[kind] || 0)), t1 = Math.round(trustOf(fk)); if (td !== 0) trustMsg = '<p class="' + (td > 0 ? 'good' : 'warn') + '" style="font-size:13px">ความไว้ใจ' + REGIONS[fk].kind + ': ' + t0 + ' → ' + t1 + ' (' + (td > 0 ? '+' : '') + td + ')' + (trustTier(t0) !== trustTier(t1) ? ' · ระดับ: ' + trustTier(t1) : '') + '</p>'; }
    if (f0 >= 70 && (kind === 'capture_ok' || kind === 'treat_full')) { gain.crystal = (gain.crystal || 0) + 1; gain.hide = (gain.hide || 0) + 1; }
    S.forest[fk] = clamp(f0 + Math.round((FOREST_DELTA[kind] || 0) * (M.variant === 1 && (FOREST_DELTA[kind] || 0) > 0 ? 1.5 : 1) * ((FOREST_DELTA[kind] || 0) > 0 ? 1 + .15 * skillLv('pathf') : 1)), 0, 100);
    var fd = Math.round(S.forest[fk] - f0), vmsg = '', nmsg = '', ok2 = fk === 'stag' ? 'boar' : 'stag', nmsg2 = '';
    if (S.forest[fk] >= 90 && !S.verdant[fk]) { S.verdant[fk] = true; vmsg = '<p class="good"><b>ป่า ' + REGIONS[fk].name + ' สมบูรณ์แล้ว!</b> ได้ Verdant Mark ถาวร: HP สูงสุด +6</p>'; }
    if (S.wins >= 1 && ok2 !== fk && S.forest[ok2] > 0) { S.forest[ok2] = Math.max(0, S.forest[ok2] - 2); nmsg = '<p class="warn" style="font-size:12px">เขต ' + REGIONS[ok2].name + ' ไม่มีใครดูแล: ป่า −2</p>'; }
    if (S.wins >= 2 && fk !== 'rabbit' && S.forest.rabbit > 0) { S.forest.rabbit = Math.max(0, S.forest.rabbit - 2); nmsg += '<p class="warn" style="font-size:12px">เขต ' + REGIONS.rabbit.name + ' ไม่มีใครดูแล: ป่า −2</p>'; }
    if (S.wins >= 2 && fk === 'rabbit' && S.forest.boar > 0) { S.forest.boar = Math.max(0, S.forest.boar - 2); }
    forestNote = trustMsg + '<p class="' + (fd >= 0 ? 'good' : 'warn') + '">ป่า ' + REGIONS[fk].name + ': ' + Math.round(f0) + '% → ' + Math.round(S.forest[fk]) + '% (' + (fd >= 0 ? '+' : '') + fd + ')' + (f0 >= 70 && (kind === 'capture_ok' || kind === 'treat_full') ? ' · ป่าฟื้นตัว ได้วัสดุเพิ่ม' : '') + '</p>' + vmsg + nmsg;
  }
  var score = o.base + (M.cured && kind === 'treat_full' ? 8 : 0) + stats.parry * 4 + stats.perfect * 4 + stats.rock * 3 - stats.taken * 3 - Math.max(0, stats.time - 150) * .15;
  var rank = kind === 'defeat' ? '–' : (score >= 115 ? 'S' : score >= 95 ? 'A' : score >= 70 ? 'B' : 'C');
  ptHunt(kind, rank);
  var diag = [];
  if (kind !== 'defeat') {
    diag.push('อาการหลัก: ' + AIL[M.ail].name);
    diag.push('ติดเชื้อ Bloomrot (อุณหภูมิ ' + vitals().temp + '°C)');
    if (lvl(M.tr.flank) >= 1) diag.push('บาดแผลเปิดที่สีข้าง');
    if (lvl(M.tr.horn) >= 1) diag.push('คริสตัลที่เขาร้าว ระดับ ' + lvl(M.tr.horn));
    if (lvl(M.tr.hind) >= 1) diag.push('บาดเจ็บที่ขาหลัง ระดับ ' + lvl(M.tr.hind));
    if (M.phase >= 2) diag.push('ภาวะคลุ้มคลั่ง (Phase ' + M.phase + ')');
    if (M.cured) diag.push('รักษาในสนามสำเร็จ');
    if (M.mut) diag.push('กลายพันธุ์: ' + M.mut);
    if (M.exhaustedOnce) diag.push('หมดแรง (Exhausted)');
  }
  var fawn = M.kind === 'fawn', xpGain = Math.round(o.xp * dfv('xp') * mutFx('xp') * (qd && okK ? (qd.tier === 2 ? 1.3 : (qd.tier === 1 ? 1 : (qd.tier === 4 ? 2.2 : 1.7))) : 1)) + qExtraXp;
  if (fawn) { var first = !S.tut && kind !== 'defeat'; xpGain = first ? 40 : 0; gain = first ? { blood: 2, saliva: 1 } : {}; }
  if (fawn) { if (gain.blood) gain.coin = 20; }
  else {
    var CB = { capture_ok: 60, capture_under: 20, capture_over: 15, treat_full: 70, treat_part: 40, treat_wrong: 10, eliminate: 35, defeat: 0 };
    var cg = (CB[kind] || 0) * ({ S: 1.4, A: 1.2, B: 1, C: .85 }[rank] || 0) * (M.crisis ? 2 : (M.variant === 1 ? 1.5 : 1)) * (qd && okK ? (qd.tier === 2 ? 1.3 : (qd.tier === 1 ? 1 : (qd.tier === 4 ? 2.2 : 1.7))) : 1) * (M.kind === 'wolf' ? 1.5 : 1) * trMul * mutFx('coin') * (1 + .08 * skillLv('haggle'));
    cg = Math.round(cg) + (qExtraXp > 0 ? 80 : 0); if (cg > 0) gain.coin = (gain.coin || 0) + cg;
  }
  if (spDrop && okK && (rank === 'S' || rank === 'A')) gain[spDrop.common] = (gain[spDrop.common] || 0) + 1;
  var chips = '', i;
  for (gk in gain) { S.mats[gk] += gain[gk]; chips += '<span class="chip">' + MATS[gk] + ' ×' + gain[gk] + '</span>'; }
  S.xp += xpGain;
  if (!fawn) { S.hunts++; if (kind !== 'defeat' && kind !== 'capture_under' && kind !== 'capture_over' && kind !== 'treat_wrong') S.wins++; }
  else if (kind !== 'defeat') S.tut = 1;
  var ld = {}; for (i = 0; i < DMG_KEYS.length; i++) ld[DMG_KEYS[i]] = Math.round(stats.dmgBy[DMG_KEYS[i]]);
  S.log.unshift({ out: kind, fawn: fawn, rank: rank, t: Math.round(stats.time), taken: stats.taken, dmg: ld });
  if (S.log.length > 5) S.log.length = 5;
  if (!fawn && rank !== '–' && (!S.bestRank || 'CBAS'.indexOf(rank) > 'CBAS'.indexOf(S.bestRank))) S.bestRank = rank;
  var liveNote = '';
  if (!fawn) { liveNote = jrUpdate(isBoss(M.kind) ? M.kind : spOf(M.kind), kind, M.ail) + dailyUpdate(kind, rank, isBoss(M.kind) ? M.kind : spOf(M.kind), stats); }
  persist();
  var rankUp = '', nowRank = rankIdx();
  if (nowRank > oldRank) rankUp = '<p class="good"><b>🎖 เลื่อนยศเป็น ' + RANK_NAME[nowRank] + '!</b> — แต้มทักษะ +' + (rankSkillPts(nowRank) - rankSkillPts(oldRank)) + ' (ดูที่แท็บทักษะ)</p><p style="font-size:12px;color:#c8a0ff">📜 เปิดบทใหม่ในพงศาวดาร: ' + LORE_CH[nowRank].t + '</p>';
  else if (!fawn) { var rn = rankNext(); if (rn && rn.examDone && !rn.xpOk) rankUp = '<p class="warn" style="font-size:12px">ผ่านสอบเลื่อนยศ ' + rn.name + ' แล้ว — รอ XP อีก ' + (rn.xp - S.xp) + '</p>'; else if (rn && rn.xpOk && !rn.examDone) rankUp = '<p style="font-size:12px;color:#c8a0ff">XP ถึงเกณฑ์ยศ ' + rn.name + ' แล้ว — ผ่านเควส ' + rn.exam + ' เพื่อเลื่อนยศ</p>'; }
  var bondNote = '';
  if (ALLY && kind !== 'defeat' && S.allies[ALLY.idx]) { S.allies[ALLY.idx].bond++; var al2 = S.allies[ALLY.idx]; bondNote = '<p class="good">ผู้ช่วย ' + al2.name + ' ผูกพันมากขึ้น (Lv' + allyLv(al2) + ')</p>'; }
  rankUp += liveNote + varNote + forestNote + fireNote + penAdd(M, kind) + bondNote;
  var dchips = '';
  for (i = 0; i < diag.length; i++) dchips += '<span class="chip" style="border-color:#6b5a45;color:#e6d9c0">' + diag[i] + '</span>';
  showPanel(
    '<div class="rank ' + o.cls + '">' + rank + '</div>' +
    '<h2 class="' + o.cls + '">' + o.title + '</h2><div class="sub">' + (fawn ? 'ด่านฝึก · รางวัลรับได้ครั้งแรกเท่านั้น' : (qd ? QTIER_NAME[qd.tier] + ' · ' + qd.name : 'First Bloom') + ' · ' + o.eco) + '</div>' +
    '<p>' + resultText(o.text) + '</p>' + rankUp +
    (chips ? '<div><b style="font-size:13px">ได้รับ</b><br>' + chips + (xpGain ? '<span class="chip">Rank XP +' + xpGain + '</span>' : '') + '</div>' : '') +
    (dchips ? '<div style="margin-top:8px"><b style="font-size:13px">บันทึกการวินิจฉัย</b><br>' + dchips + '</div>' : '') +
    '<table class="tbl" style="margin-top:12px"><tr><td>เวลา</td><td>' + fmtTime(stats.time) + '</td><td>โดนโจมตี</td><td>' + stats.taken + ' ครั้ง</td></tr>' +
    '<tr><td>Parry</td><td>' + stats.parry + '</td><td>Perfect Dodge</td><td>' + stats.perfect + '</td></tr>' +
    '<tr><td>สแกน</td><td>' + stats.scans + '</td><td>ล่อชนหิน</td><td>' + stats.rock + '</td></tr>' +
    '<tr><td>ความยาก</td><td>' + (fawn ? '–' : DIFF_NAME[diffLv()]) + '</td><td>Counter / Finisher</td><td>' + stats.counters + ' / ' + stats.finishers + '</td></tr>' +
    '<tr><td>ท่าต่อเนื่องที่เจอ</td><td>' + stats.chains + '</td><td>เสียเลือดรวม</td><td>' + Math.round(100 - Math.max(0, P.hp)) + '</td></tr></table>' +
    (fawn ? '<div class="note"><b>วงจรของเกม:</b> รับภารกิจที่กระดาน → ลาดตระเวนหามัน → สแกนวินิจฉัย → สู้ → จับ/รักษา/กำจัด → เอาตัวอย่างไปอัปเกรด ฟื้นป่า แล้วรับงานที่ยากขึ้น · ทบทวนได้ที่ปุ่ม "คู่มือเริ่มเล่น"</div>' : '') +
    '<div class="row"><button class="big" data-act="village">กลับ Fern Hollow</button></div>');
}

