/* arena variants chosen by where the encounter happens */
var DEFAULT_ROCKS = ROCKS.map(function (r) { return { x: r.x, y: r.y, r: r.r }; });
var AV = { g0: '#2f4533', g1: '#253828', g2: '#1b2a1e', decor: 'meadow' };
var ARENA_INFO = {
  meadow: { rocks: null, av: { g0: '#3d5a38', g1: '#2f4a2f', g2: '#1f3322', decor: 'meadow' }, hint: 'ลานหญ้ากว้าง — พื้นที่โล่ง ไม่มีที่กำบัง' },
  water: { rocks: [[-150, -70, 26], [160, -60, 22], [-110, 130, 24], [140, 120, 21]], av: { g0: '#2f4b46', g1: '#26403f', g2: '#1b2f32', decor: 'water' }, hint: 'ริมน้ำ — พื้นลื่นและหินเรียงเป็นวง ใช้หินล่อมันพุ่งชนได้ง่าย' },
  den: { rocks: [[-150, -60, 24], [-60, -150, 28], [110, -110, 22], [170, 30, 26], [40, 130, 24], [-130, 100, 21]], av: { g0: '#4a4a43', g1: '#3a3b35', g2: '#262722', decor: 'den' }, hint: 'บริเวณรังหิน — หินเยอะ พื้นที่เคลื่อนที่แคบแต่ล่อชนหินได้บ่อย' },
  thicket: { rocks: [[-120, -90, 25], [150, 60, 24]], av: { g0: '#2a4430', g1: '#20382a', g2: '#162a1d', decor: 'thicket' }, hint: 'ชายพุ่มไม้ทึบ — หินน้อย พื้นที่กลางลานค่อนข้างโล่ง' },
  bloom: { rocks: [[-140, -80, 24], [90, 120, 22], [160, -40, 26]], av: { g0: '#46365a', g1: '#392b4a', g2: '#291f38', decor: 'bloom' }, hint: 'ใกล้แหล่ง Bloomrot — มีกลุ่มสปอร์ลอยค้างอยู่ในลาน อย่าเดินเข้าไป' }
};
function setArena(zone) {
  var inf = ARENA_INFO[zone] || ARENA_INFO.meadow, i;
  ROCKS.length = 0;
  if (!inf.rocks) for (i = 0; i < DEFAULT_ROCKS.length; i++) ROCKS.push({ x: DEFAULT_ROCKS[i].x, y: DEFAULT_ROCKS[i].y, r: DEFAULT_ROCKS[i].r });
  else for (i = 0; i < inf.rocks.length; i++) ROCKS.push({ x: CX + inf.rocks[i][0], y: CY + inf.rocks[i][1], r: inf.rocks[i][2] });
  AV = inf.av; buildBg();
}
function beginBattle(ctx0) {
  huntKind = pickKind(); huntVariant = pickVariant(); huntQuest = curQuestId(); FIELD = null; huntHide = 0;
  if (!ctx0) huntRegion = regionFor(huntKind); /* ออกล่าตรง ๆ ไม่ผ่านภาคสนาม */
  var zone = ctx0 ? ctx0.zone : 'meadow';
  setArena(zone);
  initWorld();
  huntMeds = { solvent: true, antiinf: true, antibio: true };
  huntInv = true; P.salves = invN('salve'); P.darts = invN('dart'); P.doses = {}; for (var imk in MEDS) P.doses[imk] = invN(imk);
  var hs = 'WASD เดิน · เมาส์เล็ง · คลิกซ้ายแทง — เข้าไปใกล้ ' + monName() + ' อย่างระมัดระวัง';
  if (PREP) {
    var pr = PREP;
    huntHide = pr.hide || 0; if (pr.done.herbs) P.salves += 1;
    if (pr.done.track) M.narrow = true;
    if (pr.done.sample) { M.diagKnown = true; M.preDx = true; M.autoLoad = true; var pv = vitals(); scanRec = { t: 0, hr: pv.hr, temp: pv.temp, br: pv.br, stress: pv.stress, inf: pv.inf }; }
    if (pr.done.warm) { P.flow = 1; P.flowT = 12; }
    PREP = null;
  }
  if (ctx0) {
    var arenaHint = ARENA_INFO[zone].hint;
    if (ctx0.hpLoss > 0) P.hp = Math.max(30, P.maxHp - Math.round(ctx0.hpLoss));
    if (ctx0.scan) { scanRec = { t: 0, hr: ctx0.scan.hr, temp: ctx0.scan.temp, br: ctx0.scan.br, stress: ctx0.scan.stress, inf: ctx0.scan.inf }; M.diagKnown = true; M.preDx = true; M.autoLoad = true; }
    if (ctx0.why === 'snared') {
      M.x = CX - 60; M.y = CY; M.face = Math.PI; P.x = CX + 105; P.y = CY; P.face = Math.PI;
      M.state = 'stun'; M.stT = 0; M.stDur = 6; M.atk = null; M.provoked = true; M.stam = 70; P.flow = 1; P.flowT = 10;
      hs = 'กับดักทำงาน! มันติดอยู่ ~6 วินาที — โจมตีฟรี (เริ่มด้วย FLOW ×1) · ' + arenaHint;
    } else if (ctx0.why === 'sneak') {
      M.ambush = true; M.x = CX - 60; M.y = CY; M.face = Math.PI; P.x = CX + 85; P.y = CY; P.face = Math.PI;
      hs = 'คุณแอบเข้าประชิดได้สำเร็จ! SNEAK ATTACK (×1.8) ที่ตีแรก · ' + arenaHint;
    } else if (ctx0.woken) { M.stam = 55; M.thinkT = 1.6; M.stress = 40; M.provoked = true; hs = 'มันเพิ่งสะดุ้งตื่น — ยังงัวเงีย สตามินาไม่เต็ม โจมตีก่อนมันตั้งตัวได้! · ' + arenaHint; }
    else if (ctx0.stage === 'drink') { M.stam = 80; M.provoked = true; hs = 'มันเห็นคุณขณะกำลังดื่มน้ำ — สตามินาไม่เต็ม · ' + arenaHint; }
    else { M.provoked = true; hs = (ctx0.why === 'bumped' ? 'คุณเข้าใกล้เกินไป! ' : 'มันจับได้แล้ว! ') + arenaHint; }
    if (zone === 'bloom') { clouds.push({ x: CX - 40, y: CY + 70, r: 52, t: 0, life: 45 }); clouds.push({ x: CX + 60, y: CY - 120, r: 48, t: 0, life: 45 }); }
  }
  if (M.preDx && M.kind !== 'fawn') { var ld = M.autoLoad && autoLoadMed(true); var dxT = 'ผลตรวจก่อนเข้าสู้: ' + AIL[M.ail].name + ' — ยาที่ตรง ' + MEDS[AIL[M.ail].med] + ' ฉีดที่' + PART_TH[AIL[M.ail].part] + (ld ? ' (โหลดยาให้แล้ว · T สลับ)' : ''); hs = hs.indexOf('WASD') === 0 ? dxT + ' · เข้าไปใกล้อย่างระมัดระวัง' : dxT + ' · ' + hs; }
  hs += forestStart() + makeAlly();
  mode = 'playing'; paused = false; hidePanel(); showHint(hs, 9);
}
