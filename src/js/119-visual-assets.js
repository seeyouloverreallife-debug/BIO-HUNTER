/* Painted art is optional: the original render paths remain the loading/error fallback. */
var VIS = { images: {}, failed: [], dirty: false, draws: {}, moving: false, walk: 0, player: null, x: 0, y: 0 };
function visualInit() {
  var defs = window.BH_VISUAL || {};
  Object.keys(defs).forEach(function (key) {
    var im = new Image();
    im.onload = function () { VIS.images[key] = im; VIS.dirty = true; };
    im.onerror = function () { VIS.failed.push(key); };
    im.src = defs[key].src;
  });
}
function visualDraw(c, key, x, y, w, h, frame, cell, columns) {
  var im = VIS.images[key]; if (!im) return false;
  if (cell) { columns = columns || Math.floor(im.naturalWidth / cell); frame = Math.max(0, frame | 0); c.drawImage(im, (frame % columns) * cell, Math.floor(frame / columns) * cell, cell, cell, x, y, w, h); }
  else c.drawImage(im, x, y, w, h);
  VIS.draws[key] = (VIS.draws[key] || 0) + 1;
  return true;
}
function visualTick(dt) {
  if (VIS.dirty) { VIS.dirty = false; buildBg(); buildFieldBg(); }
  if (!P) return;
  if (VIS.player !== P) { VIS.player = P; VIS.x = P.x; VIS.y = P.y; VIS.walk = 0; VIS.moving = false; }
  if (!paused && (mode === 'field' || mode === 'playing')) {
    VIS.moving = Math.hypot(P.x - VIS.x, P.y - VIS.y) > .08;
    if (VIS.moving) VIS.walk += dt * (mode === 'field' && FIELD && FIELD.sneak ? 5 : 8);
    else VIS.walk = 0;
  }
  VIS.x = P.x; VIS.y = P.y;
}
function wardenFrame(p) {
  if (p.state === 'dodge') return 8 + Math.min(3, Math.floor((p.dodgeT || 0) / .3 * 4));
  if (p.state === 'atk' && p.atk) return p.atkT < p.atk.wind ? 13 : (p.atkT < p.atk.wind + p.atk.act ? 14 : 0);
  if (p.state === 'charge') return 15;
  if (p.blocking || p.state === 'heal') return 12;
  if (p.hurtT > 0) return 7;
  return VIS.moving ? 1 + Math.floor(VIS.walk) % 6 : 0;
}
function paintedArena(c) {
  var key = 'arena_' + (AV.decor || 'meadow'); if (!VIS.images[key]) return false;
  c.fillStyle = '#0a0f0b'; c.fillRect(0, 0, W, H);
  for (var j = 0; j < 64; j++) { var a = j * 2.4, r = ARENA_R + 35 + (j % 7) * 15; c.fillStyle = '#102318'; c.beginPath(); c.arc(CX + Math.cos(a) * r, CY + Math.sin(a) * r, 14 + j % 27, 0, TAU); c.fill(); }
  visualDraw(c, key, CX - 288, CY - 288, 576, 576);
  for (var i = 0; i < ROCKS.length; i++) {
    var R = ROCKS[i], rk = 'rock_' + (AV.decor === 'bloom' && i % 2 === 0 ? 'd' : ['a','b','c'][i % 3]);
    c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(R.x + 5, R.y + 8, R.r * 1.05, R.r * .85, 0, 0, TAU); c.fill();
    if (!visualDraw(c, rk, R.x - R.r * 1.15, R.y - R.r * 1.15, R.r * 2.3, R.r * 2.3)) { c.fillStyle = '#777b70'; c.beginPath(); c.arc(R.x,R.y,R.r,0,TAU); c.fill(); }
  }
  return true;
}
function paintedGround(c) {
  var key = 'fld_ground_' + MAPKEY, im = VIS.images[key]; if (!im) return false;
  c.save(); c.scale(.5,.5); c.fillStyle = c.createPattern(im,'repeat'); c.fillRect(0,0,WW*2,WH*2); c.restore(); return true;
}
function paintedWater(c, water) {
  return visualDraw(c, 'fld_water_' + MAPKEY, water.x - water.rx - 26, water.y - water.ry - 22, (water.rx + 26) * 2, (water.ry + 22) * 2);
}
function visualFx(c, key, x, y, diameter, progress, alpha) {
  if (!VIS.images[key]) return false;
  var count = key === 'fx_fire' ? 8 : (key === 'fx_spore' ? 6 : 5), frame = key === 'fx_fire' ? Math.floor(progress * 8) % 8 : Math.min(count - 1, Math.floor(clamp(progress,0,.9999) * count));
  c.save(); c.globalAlpha *= alpha == null ? 1 : alpha;
  var ok = visualDraw(c,key,x-diameter/2,y-diameter/2,diameter,diameter,frame,128,count);
  c.restore(); return ok;
}
visualInit();
