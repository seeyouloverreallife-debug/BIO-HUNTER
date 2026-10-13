/* ================= MAIN LOOP ================= */
var last = 0;
var lastModeAttr = '';
var errTimes = [], fatal = false;
function recoverFromError(err) {
  try { if (window.console && console.error) console.error('[bio-hunter]', err); } catch (e) {}
  var now = Date.now(); errTimes.push(now); while (errTimes.length && now - errTimes[0] > 5000) errTimes.shift();
  if (errTimes.length > 4) {
    fatal = true;
    try { showPanel('<h2>เกิดข้อผิดพลาดซ้ำ ๆ</h2><p>เกมหยุดทำงานเพื่อป้องกันข้อมูลเสียหาย — ความคืบหน้าถูกเซฟไว้แล้ว กรุณารีโหลดหน้านี้</p><div class="row"><button class="opt" onclick="location.reload()">รีโหลด</button></div>'); } catch (e) {}
    return;
  }
  try { clearInput(false); FIELD = null; PREP = null; paused = false; persist(); enterVillage('เกิดข้อผิดพลาดภายในเกม — พากลับหมู่บ้านแล้ว (ความคืบหน้าถูกเซฟไว้)'); } catch (e2) { fatal = true; }
}
window.addEventListener('error', function (e) { try { if (window.console && console.error) console.error('[bio-hunter:global]', e && e.message); } catch (x) {} });
function frame(now) {
  if (fatal) return;
  requestAnimationFrame(frame);
  try { frameBody(now); } catch (err) { recoverFromError(err); }
}
function frameBody(now) {
  if (mode !== lastModeAttr) { lastModeAttr = mode; if (mode === 'hub' || mode === 'decision' || mode === 'result' || mode === 'title' || mode === 'village') clearInput(false); try { if (document.body && document.body.setAttribute) document.body.setAttribute('data-mode', mode); } catch (e) {} if (titleEl) titleEl.style.display = mode === 'title' ? 'flex' : 'none'; fitCanvas(); }
  var rawMs = now - last; var real = Math.min(.05, Math.max(0, (now - last) / 1000)); last = now;
  if ((mode === 'playing' || mode === 'field') && !paused) ptFrame(rawMs);
  if (mode === 'playing' && !paused) {
    var dt = real;
    var hsm = setMul('stop');
    if (hitstop > 0 && hsm > 0) hitstop -= real / hsm;
    else { hitstop = 0; if (slowT > 0) { slowT -= real; dt *= .4; } step(dt); }
  }
  else if (mode === 'field' && !paused && FIELD) updateField(real);
  else if (mode === 'village' && V) updateVillage(real);
  shake = Math.max(0, shake - real * 40); flashA = Math.max(0, flashA - real * 2.4); punch = Math.max(0, punch - real * 3);
  if (hitChainT > 0) { hitChainT -= real; if (hitChainT <= 0) hitChain = 0; } chainPop = Math.max(0, chainPop - real * 5);
  visualTick(real);
  draw();
}
initWorld();
ptInit();
enterTitle();
artInit();
requestAnimationFrame(frame);

try { if (typeof navigator !== 'undefined' && navigator.serviceWorker && /^https?:/.test(location.protocol)) window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); }); } catch (e) {}
window.__bh = { visual: function () { return { loaded: Object.keys(VIS.images), failed: VIS.failed.slice(), draws: Object.assign({},VIS.draws), wardenFrame: P ? wardenFrame(P) : -1 }; }, wardenFrame: wardenFrame, visualFx: visualFx, ring: ring, setArena: setArena, loadMap: loadMap, buildBg: buildBg, draw: draw, AV: function () { return AV; }, bg: function () { return bg; }, BUGS: function () { return BUGS; }, spawnBug: spawnBug, updateBugs: updateBugs, clearBugs: clearBugs, isBoss: isBoss, bugsStrike: bugsStrike, fxState: function () { return { chain: hitChain, best: bestChain, flash: flashA, punch: punch, slashes: slashes.length }; }, chainHit: chainHit, screenFx: screenFx, skillLv: skillLv, skillPts: skillPts, skillTotal: skillTotal, skillCan: skillCan, SKILLS: SKILLS, jrStamps: jrStamps, ldUse: ldUse, ldSave: ldSave, ldActive: ldActive, ldHtml: ldHtml, bagHtml: bagHtml, bagTotal: bagTotal, giftCollect: giftCollect, setDay: function (k) { dayOverride = k || ''; }, dailyEnsure: dailyEnsure, dailyUpdate: dailyUpdate, dailyDone: dailyDone, jrUpdate: jrUpdate, jrStatus: jrStatus, mutNow: mutNow, mutId: mutId, dailyGoals: dailyGoals, GOAL_DEFS: GOAL_DEFS, MUT_KEYS: MUT_KEYS, dayShift: dayShift, enterTitle: enterTitle, renderTitle: renderTitle, GAME_VER: GAME_VER, PT: function () { return PT; }, ptReport: ptReport, ptFrame: ptFrame, PTF: function () { return PTF; }, TUT: function () { return TUT; }, tutSkip: tutSkip, tutSteps: tutSteps, guidePages: guidePages, guideHtml: guideHtml, saveCode: saveCode, importSave: importSave, ART: function () { return ART; }, artSetup: artSetup, setCritOff: function (v) { CRIT_OFF = !!v; }, critInfo: critInfo, PRAC: function () { return PRAC; }, pracStats: pracStats, SHRINE: function () { return SHRINE; }, FIRES: function () { return FIRES; }, huntFires: function () { return huntFires; }, setHF: function (v) { huntFires = v; }, FIELD: function () { return FIELD; }, scanRec: function () { return scanRec; }, hint: function () { return hint; }, hurtPlayer: hurtPlayer, WTREE_NODES: WTREE_NODES, curW: curW, wnodeCost: wnodeCost, CAT: function () { return CAT; }, ftext: ftext, texts: function () { return texts; }, rw: rw,
  DARTS: function () { return darts; }, MEDS: function () { return huntMeds; },
  PODS: function () { return PODS; },
  state: function () { return { P: P, M: M, mode: mode, stats: stats }; },
  fieldStep: function (dt) { if (FIELD && mode === 'field') updateField(dt); }, step: step, hurt: hurtPlayer, ACTIONS: ACTIONS, finish: finish, openDecision: openDecision, monsterDowned: monsterDowned, hitMonster: hitMonster,
  setMode: function (m) { mode = m; }, keys: keys,
  VILL: function () { return { V: V, NPCS: VIL_NPCS, interact: villageInteract, update: updateVillage }; }, INV_ITEMS: INV_ITEMS, SELL_PRICE: SELL_PRICE,
  AIL: AIL, FIELD: function () { return FIELD; }, PREPstate: function () { return PREP; }, ROCKS: ROCKS, sickStage: sickStage, qUnlocked: qUnlocked, qDef: qDef, curQuest: curQuest, QUESTS: QUESTS, phScan: phScan, checkPhase: checkPhase, startPhase: startPhase, CLOUDS: function () { return clouds; }, save: function () { return S; }, makeSave: function () { return S; }, forestOf: forestOf, pickVariant: pickVariant, variantForced: variantForced, monNameOf: monNameOf, applyVariant: applyVariant, ALLY: function () { return ALLY; }, allyPot: allyPot, ALLY_INFO: ALLY_INFO, podTarget: podTarget, verdantN: verdantN, forestStart: forestStart, penAdd: penAdd, penCap: penCap, REGIONS: REGIONS, SETS: SETS, THICKETS: function () { return THICKETS; }, enterVillage: enterVillage, villageInteract: villageInteract, VIL: function () { return V; }, NPCS: VIL_NPCS, armorTaken: armorTaken, openHub: openHub, buyItem: buyItem, buySkill: buySkill, resetSave: function () { S = freshSave(); },
  fieldBg: function () { return fbg; }, startHeal: startHeal, frame: frameBody, /* หนึ่งรอบของลูปหลัก (อัปเดต+วาด) — ให้ชุดทดสอบเรียกเองโดยไม่ต้องพึ่ง rAF */
  VIEW: function () { return { VW: VW, H: H, RS: RS, OFFX: OFFX, UIK: UIK, HK: HK, isTouch: isTouch }; },
  BAL: BAL, armorTaken: armorTaken, dullMul: dullMul, rageN: rageN, gearCheckHtml: gearCheckHtml, MAPS: MAPS, regionFor: regionFor, ecoOf: ecoOf, ecoRegrow: ecoRegrow, ecoHazard: ecoHazard, huntRegionKey: huntRegionKey
};
/* ค่าที่เปลี่ยนตามแมพภาคสนาม — ต้องอ่านผ่าน getter เสมอ (ไม่เก็บค่าตอนโหลด) */
Object.defineProperty(window.__bh, 'SIGNS', { get: function () { return SIGNS; } });
Object.defineProperty(window.__bh, 'CAMPS', { get: function () { return CAMPS; } });
Object.defineProperty(window.__bh, 'SITES', { get: function () { return SITES; } });
Object.defineProperty(window.__bh, 'HAB', { get: function () { return HAB; } });
Object.defineProperty(window.__bh, 'WW', { get: function () { return WW; } });
Object.defineProperty(window.__bh, 'WH', { get: function () { return WH; } });
Object.defineProperty(window.__bh, 'MAP', { get: function () { return MAP; } });
Object.defineProperty(window.__bh, 'MAPKEY', { get: function () { return MAPKEY; } });
