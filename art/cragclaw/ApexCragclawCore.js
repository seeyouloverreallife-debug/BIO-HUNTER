(function(root,factory){'use strict';root.ApexCragclawCore=factory(root.ApexCragclawConfig);})(typeof globalThis!=='undefined'?globalThis:this,function(Config){
'use strict';
function clamp(v,a,b){return v<a?a:(v>b?b:v);} function dist(ax,ay,bx,by){var dx=bx-ax,dy=by-ay;return Math.sqrt(dx*dx+dy*dy);} function len(x,y){return Math.sqrt(x*x+y*y);} function angleTo(ax,ay,bx,by){return Math.atan2(by-ay,bx-ax);} function normAng(a){while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a;} function lerp(a,b,t){return a+(b-a)*t;} function smoothstep(t){t=clamp(t,0,1);return t*t*(3-2*t);} function deepCopy(o){return JSON.parse(JSON.stringify(o));}
function makeRng(seed){var s=(seed|0)||1; return {next:function(){s=(s*1664525+1013904223)|0; return ((s>>>0)/4294967296);}, int:function(n){return (this.next()*n)|0;}, state:function(){return s;}};}
function sweptContact(ax,ay,bx,by,hr,hx,hy,rr){var vx=bx-ax, vy=by-ay; var rx=ax-hx, ry=ay-hy; var R=hr+rr; var a=vx*vx+vy*vy; var b=2*(rx*vx+ry*vy); var c=rx*rx+ry*ry-R*R; if(c<=0) return {hit:true,t:0}; if(a<1e-9) return {hit:false,t:1}; var disc=b*b-4*a*c; if(disc<0) return {hit:false,t:1}; var t=(-b-Math.sqrt(disc))/(2*a); return {hit:t>=0&&t<=1,t:t}; }
function rot(x,y,a){var ca=Math.cos(a), sa=Math.sin(a); return {x:x*ca-y*sa,y:x*sa+y*ca};}
function cloneAttackMeta(a){return {id:a.id,name:a.name,tele:a.tele,act:a.act,recover:a.recover,damage:a.damage,hits:a.hits,minHitGap:a.minHitGap,parry:a.parry,phase:a.phase,opening:a.opening||0};}
function pointOutsideArena(x,y,arena,margin){return dist(x,y,arena.cx,arena.cy)>(arena.r-margin);}
function clampArena(x,y,arena,margin){var dx=x-arena.cx, dy=y-arena.cy, d=Math.sqrt(dx*dx+dy*dy); var max=arena.r-margin; if(d>max && d>0.0001){x=arena.cx+dx/d*max; y=arena.cy+dy/d*max;} return {x:x,y:y};}
function blockedByObstacle(ax,ay,bx,by,obstacles,pad){for(var i=0;i<obstacles.length;i++){var o=obstacles[i]; var hit=sweptContact(ax,ay,bx,by,pad,o.x,o.y,o.r); if(hit.hit) return true;} return false;}

function resolveMotion(state, dt, world){var cfg=state.config, arena=world.arena||cfg.defaults.arena, obstacles=world.obstacles||[]; var tx=state.x+state.vx*dt, ty=state.y+state.vy*dt; var clear=cfg.defaults.obstacleClearance+state.r; var best={x:tx,y:ty};
  for(var i=0;i<obstacles.length;i++){
    var o=obstacles[i], dx=best.x-o.x, dy=best.y-o.y, d=Math.sqrt(dx*dx+dy*dy), min=o.r+clear; if(d<min && d>0.0001){ best.x=o.x+dx/d*min; best.y=o.y+dy/d*min; }
  }
  best=clampArena(best.x,best.y,arena,state.r+6); state.x=best.x; state.y=best.y;
}

function partHurtboxes(state){
  var r=state.r, out=[];
  var definitions=[['crusher',0.45,-1.08,0.47],['pincer',0.45,1.08,0.40]];
  for(var i=0;i<definitions.length;i++){
    var d=definitions[i], part=state.parts[d[0]], point=rot(r*d[1],r*d[2],state.dir);
    out.push({id:d[0],zone:'flank',x:state.x+point.x,y:state.y+point.y,r:r*d[3],hp:part.hp,maxHp:part.maxHp,broken:part.broken, targetable:!part.broken});
  }
  return out;
}
function shellSnapshot(state){
 var p=state.shell, fraction=p.hp/p.maxHp, damage=1-fraction;
 return {hp:p.hp,maxHp:p.maxHp,broken:p.broken,fractureStage:p.broken?3:(fraction<=0.33?2:(fraction<=0.66?1:0)),damageFraction:damage,
   hurtbox:{id:'shell',zone:'flank',x:state.x,y:state.y,r:state.r*0.86,targetable:!p.broken},opening:state.staggerSource==='shell'?state.stagger:0};
}
function validCrystalPoint(x,y,r,world){
 var a=world.arena||{cx:480,cy:312,r:268};if(dist(x,y,a.cx,a.cy)>a.r-r-3)return false;
 var os=world.obstacles||[];for(var k=0;k<os.length;k++)if(dist(x,y,os[k].x,os[k].y)<r+os[k].r+7)return false;
 return true;
}
function fixedBurstPoints(state,world){
 var out=[],r=90;
 // These locations are fixed at attack start, never re-rolled during telegraph/act.
 for(var i=0;i<4;i++){var a=state.dir+(i+.5)*Math.PI/2;var x=state.x+Math.cos(a)*r,y=state.y+Math.sin(a)*r;
   if(validCrystalPoint(x,y,state.config.defaults.crystalFieldRadius,world))out.push({x:x,y:y});}
 return out;
}

// Apex-only committed crystal geometry. The player can leave a fixed, predeclared
// corridor to either side. No safety region is generated or moved during an attack.
function apexLockedPattern(state,world,original,id){
  if(state.difficulty!=='apex')return original;
  var d=state.config.defaults, p=world.player, arena=world.arena||d.arena;
  var forward=angleTo(state.x,state.y,p.x,p.y), count=state.phase>=3?d.apexCrystalExtraPhase3:d.apexCrystalExtraPhase2;
  var sideOptions=[-1,1], best=null;
  for(var k=0;k<sideOptions.length;k++){
    var sign=sideOptions[k], ox=-Math.sin(forward)*sign,oy=Math.cos(forward)*sign;
    // Retreat diagonally as well as sidestep: must leave C08 main burst reach.
    var ex=Math.cos(forward)*0.62+ox*0.78,ey=Math.sin(forward)*0.62+oy*0.78;
    var endpoint={x:p.x+ex*d.apexSafeLaneDistance,y:p.y+ey*d.apexSafeLaneDistance};
    if(!validCrystalPoint(endpoint.x,endpoint.y,14,world))continue;
    if(dist(endpoint.x,endpoint.y,state.x,state.y)<state.config.attacks.C08.reach+(p.r||14)+6)continue;
    if(blockedByObstacle(p.x,p.y,endpoint.x,endpoint.y,world.obstacles||[],16))continue;
    var congestion=0;for(var h=0;h<original.length;h++)if(sweptContact(p.x,p.y,endpoint.x,endpoint.y,d.apexSafeLaneClearance,original[h].x,original[h].y,18).hit)congestion++;
    var b={sign:sign,to:endpoint,congestion:congestion}; if(!best||b.congestion<best.congestion)best=b;
  }
  // No safe corridor? Keep the pre-existing v0.7 layout rather than trapping the player.
  if(!best){state.safeLane=null;return original;}
  var lane={from:{x:p.x,y:p.y},to:best.to,width:d.apexSafeLaneClearance};
  function outsideLane(x,y){return !sweptContact(lane.from.x,lane.from.y,lane.to.x,lane.to.y,lane.width,x,y,d.crystalFieldRadius).hit;}
  var output=[];
  for(var i=0;i<original.length;i++)if(outsideLane(original[i].x,original[i].y))output.push(original[i]);
  // Fixed flanking positions around the player's last telegraphed position.
  var offsets=id==='C06'?[[-0.48,92],[0.46,122],[0,132],[-0.80,130]]:[[-0.55,95],[0.58,111],[0,135],[0.93,142]];
  var used=0;
  for(var j=0;j<offsets.length&&used<count;j++){
    var offset=offsets[j],a=forward+offset[0],xx=p.x+Math.cos(a)*offset[1], yy=p.y+Math.sin(a)*offset[1];
    if(!validCrystalPoint(xx,yy,d.crystalFieldRadius,world)||!outsideLane(xx,yy))continue;
    if(output.some(function(q){return dist(q.x,q.y,xx,yy)<d.crystalFieldRadius*2.2;}))continue;
    output.push({x:xx,y:yy});used++;
  }
  state.safeLane=lane;
  return output;
}

function spawnField(state,attack,world){
 if(!state.config.defaults.crystalField||state.phase<2)return;
 var id=attack.id;if(id!=='C06'&&id!=='C08'&&id!=='C09')return;
 var points=id==='C08'?attack.fieldPoints:attack.crystals;
 var d=state.config.defaults;
 for(var i=0;i<points.length;i++){
  var spot=points[i];if(!validCrystalPoint(spot.x,spot.y,d.crystalFieldRadius,world))continue;
  // Do not stack a new hazard directly on an older one.
  if(state.hazards.some(function(h){return dist(h.x,h.y,spot.x,spot.y)<h.r*1.9;}))continue;
  state.hazardSerial++;
  state.hazards.push({id:'crystal_'+state.hazardSerial,sourceId:id,x:spot.x,y:spot.y,r:d.crystalFieldRadius,
   age:0,duration:d.crystalFieldDuration,windup:d.crystalFieldWindup,tickGap:d.crystalFieldTickGap,damage:Math.min(45,Math.round(d.crystalFieldDamage*(state.difficulty==='apex'?d.apexDamageMultiplier:1))),parry:false});
  state.pendingEvents.push({type:'crystal_field_spawn',id:'crystal_'+state.hazardSerial,sourceId:id,x:spot.x,y:spot.y});
 }
 if(state.hazards.length>d.crystalFieldCap)state.hazards.splice(0,state.hazards.length-d.crystalFieldCap);
}
function ageHazards(state,dt){
 for(var i=state.hazards.length-1;i>=0;i--){state.hazards[i].age+=dt;
  if(state.hazards[i].age>=state.hazards[i].duration){state.hazards.splice(i,1);}}
}
function canUse(state,id){return !((id==='C02'||id==='C07')&&state.parts.crusher.broken) && !((id==='C01'||id==='C03')&&state.parts.pincer.broken);}
function copyParts(state){var res={}; for(var id in state.parts){var p=state.parts[id];res[id]={id:id,hp:p.hp,maxHp:p.maxHp,broken:p.broken,zone:'flank',damageFraction:1-p.hp/p.maxHp,fractureStage:p.broken?3:(p.hp/p.maxHp<=0.34?2:(p.hp/p.maxHp<=0.67?1:0)),hitPulse:state.visualPulses[id]||0};}return res;}
// Shared, deterministic claw articulation. The renderer reads exactly these joint angles and tip centers.
function computeClawPose(state){
 var at=state.attack, kind=at?state.config.attacks[at.id].kind:null;
 var a=at?state.config.attacks[at.id]:null;
 var tele=a&&at.t<a.tele, act=a&&at.t>=a.tele&&at.t<a.tele+a.act;
 var recover=a&&at.t>=a.tele+a.act;
 var t=0;
 if(a){t=tele?clamp(at.t/a.tele,0,1):(act?clamp((at.t-a.tele)/a.act,0,1):clamp((at.t-a.tele-a.act)/a.recover,0,1));}
 var crusherAngle=-0.30,pincerAngle=0.30;
 function mix(start,end){return lerp(start,end,smoothstep(t));}
 if(kind==='snap')pincerAngle=tele?mix(0.30,0.94):(act?mix(0.94,-0.08):mix(-0.08,0.30));
 if(kind==='slam')crusherAngle=tele?mix(-0.30,-1.06):(act?mix(-1.06,-0.05):mix(-0.05,-0.30));
 if(kind==='sweep')pincerAngle=tele?mix(0.30,-1.08):(act?mix(-1.08,0.45):mix(0.45,0.30));
 if(kind==='embed')crusherAngle=tele?mix(-0.30,-1.22):(act?mix(-1.22,0.04):mix(0.04,-0.30));
 function claw(id,side,angle){
   var lx=16+43*Math.cos(angle),ly=side*22+43*Math.sin(angle);
   var worldPoint=rot(lx*state.r/33,ly*state.r/33,state.dir);
   return {id:id,side:side,angle:angle,localTip:{x:lx,y:ly},tip:{x:state.x+worldPoint.x,y:state.y+worldPoint.y},broken:state.parts[id].broken};
 }
 return {crusher:claw('crusher',-1,crusherAngle),pincer:claw('pincer',1,pincerAngle)};
}
function computeStaggerVisual(state){
 if(state.stagger<=0)return {active:false,source:null,progress:0,shake:0,slide:0,brace:0,dust:0};
 var duration=state.staggerDuration||state.stagger,progress=clamp(state.staggerElapsed/duration,0,1);
 var intensity=Math.pow(1-progress,2);
 return {active:true,source:state.staggerSource||'impact',progress:progress,shake:Math.sin(progress*40)*2.1*intensity,slide:-Math.sin(Math.PI*progress)*5.8,brace:Math.sin(Math.PI*progress)*0.95,dust:Math.max(0,1-progress*1.65)};
}
function buildLocalHurtboxes(state){var z=state.config.zones, r=state.r, out=[]; for(var k in z){ var zh=z[k].hurtbox; var p=rot(zh.x*r, zh.y*r, state.dir); out.push({id:k,zone:k,x:state.x+p.x,y:state.y+p.y,r:zh.r*r*0.92}); } return out; }

function computeTelegraphs(state,world){var tgs=[]; if(!state.attack) return tgs; var a=state.config.attacks[state.attack.id]; var teleEnd=a.tele; if(state.attack.t > teleEnd) return tgs; var prog=clamp(state.attack.t/teleEnd,0,1);
  if(a.kind==='slam' || a.kind==='embed'){ var p=rot((state.r+34),0,state.dir); tgs.push({type:'circle',x:state.x+p.x,y:state.y+p.y,r:a.reach*0.55,progress:prog,color:'rgba(255,180,90,0.65)'}); }
  else if(a.kind==='snap' || a.kind==='sweep'){ tgs.push({type:'arc',x:state.x,y:state.y,r:a.reach,start:state.dir-0.6,end:state.dir+0.6,progress:prog,color:'rgba(255,210,110,0.55)'}); }
  else if(a.kind==='rush'){ tgs.push({type:'line',x1:state.x,y1:state.y,x2:state.attack.targetX,y2:state.attack.targetY,width:24,progress:prog,color:'rgba(255,120,80,0.55)'}); }
  else if(a.kind==='spin' || a.kind==='burst'){ tgs.push({type:'circle',x:state.x,y:state.y,r:a.reach,progress:prog,color:'rgba(255,150,120,0.45)'}); }
  else if(a.kind==='crystal' || a.kind==='crown'){ for(var i=0;i<state.attack.crystals.length;i++){ var c=state.attack.crystals[i]; tgs.push({type:'spike',x:c.x,y:c.y,r:18,progress:prog,color:a.kind==='crown'?'rgba(252,89,140,0.7)':'rgba(110,240,255,0.55)'}); } }
  if(a.kind==='burst' && state.attack.fieldPoints){for(var j=0;j<state.attack.fieldPoints.length;j++){
    var spot=state.attack.fieldPoints[j];tgs.push({type:'spike',x:spot.x,y:spot.y,r:state.config.defaults.crystalFieldRadius,progress:prog,color:'rgba(98,240,255,0.55)'});
  }}
  return tgs;
}

function addHitbox(out,id,x,y,r,damage,parry,tag){ out.push({id:id,x:x,y:y,r:r,damage:damage,parry:parry,tag:tag||id}); }

function computeAttackHitboxes(state,world,dt){ var out=[]; if(!state.attack) return out; var a=state.config.attacks[state.attack.id]; var total=a.tele+a.act+a.recover; var local=state.attack.t; if(local<a.tele || local>a.tele+a.act) return out; var ap=(local-a.tele)/a.act; var pulses=a.pulseWindows||[[0,1]]; var active=false; for(var i=0;i<pulses.length;i++){ if(ap>=pulses[i][0] && ap<=pulses[i][1]){ active=true; break; } } if(!active) return out;
  var reach=a.reach; if(a.kind==='snap'){ var tip=computeClawPose(state).pincer.tip; addHitbox(out,a.id,tip.x,tip.y,22,a.damage,true,'snap'); }
  else if(a.kind==='slam'){ var tip=computeClawPose(state).crusher.tip; addHitbox(out,a.id,tip.x,tip.y,34,a.damage,true,'slam'); }
  else if(a.kind==='sweep'){ var tip=computeClawPose(state).pincer.tip; addHitbox(out,a.id,tip.x,tip.y,28,a.damage,true,'sweep'); }
  else if(a.kind==='rush'){ addHitbox(out,a.id,state.x,state.y,state.r+6,a.damage,true,'body'); }
  else if(a.kind==='spin'){ addHitbox(out,a.id,state.x,state.y,reach,a.damage,true,'spin'); }
  else if(a.kind==='crystal' || a.kind==='crown'){ for(var j=0;j<state.attack.crystals.length;j++){ var c=state.attack.crystals[j]; addHitbox(out,a.id,c.x,c.y,22,a.damage,false,a.kind); } }
  else if(a.kind==='embed'){ var tip=computeClawPose(state).crusher.tip; addHitbox(out,a.id,tip.x,tip.y,38,a.damage,true,'embed'); }
  else if(a.kind==='burst'){ addHitbox(out,a.id,state.x,state.y,reach,a.damage,false,'burst'); }
  if(state.difficulty==='apex')for(var n=0;n<out.length;n++)out[n].damage=Math.min(45,Math.round(out[n].damage*state.config.defaults.apexDamageMultiplier));
  return out;
}

// Apex adds one move the stone crab never has: C09 crowns the player in crystals.
function tacticalStyle(state){
  var c=state.parts.crusher.broken, p=state.parts.pincer.broken;
  return c?(p?'shell-only':'pincer-only'):(p?'crusher-only':'dual-claw');
}
function chooseAttack(state,world){
  var cfg=state.config, player=world.player||{x:480,y:312};
  var distance=dist(state.x,state.y,player.x,player.y), style=tacticalStyle(state);
  var all=['C01','C02','C03','C04'];
  if(state.phase>=2)all.push('C05','C06','C09');
  if(state.phase>=3)all.push('C07','C08');
  var weighted=[], id,a,w;
  for(var i=0;i<all.length;i++){
    id=all[i]; a=cfg.attacks[id];
    if((state.cooldowns[id]||0)>0 || !canUse(state,id))continue;
    w=1;
    if(distance<85 && ['C01','C02','C03'].indexOf(id)>=0)w+=3;
    else if(distance<145 && ['C02','C03','C04','C05','C06'].indexOf(id)>=0)w+=3;
    else if(distance>=145 && ['C04','C06'].indexOf(id)>=0)w+=4;
    if(style==='crusher-only' && (id==='C02'||id==='C07'))w+=5;
    if(style==='pincer-only' && (id==='C01'||id==='C03'))w+=5;
    if(style==='shell-only' && (id==='C04'||id==='C05'||id==='C06'||id==='C08'))w+=5;
    if(state.shell.hp/state.shell.maxHp<=0.66 && id==='C05')w+=3;
    if(state.shell.hp/state.shell.maxHp<=0.33 && id==='C06')w+=4;
    if(state.phase===2 && id==='C06')w+=3;
    if(state.phase===3 && id==='C08')w+=4;
    if(state.shell.broken && id==='C05')w+=4;
    if(state.shell.broken && id==='C04')w=Math.max(1,w-2);
    for(var k=0;k<w;k++)weighted.push(id);
  }
  if(state.difficulty==='apex'){
    // Positional counterplay: attack *choice* changes, never attack timing or hit rules.
    var toward=angleTo(state.x,state.y,player.x,player.y), off=Math.abs(normAng(toward-state.dir));
    var picked=[],recent=state.attackHistory||[];
    for(var q=0;q<all.length;q++){
      var aid=all[q],aa=cfg.attacks[aid];if(!canUse(state,aid)||(state.cooldowns[aid]||0)>0)continue;
      var weight=2;
      if(aid==='C05'&&off>0.8)weight+=9;
      if(aid==='C03'&&distance<102)weight+=5;
      if(aid==='C04'&&distance>138)weight+=7;
      if(aid==='C06'&&state.phase>=2 && distance>=87)weight+=8;
      if(aid==='C09'&&state.phase>=2)weight+=7;
      if(aid==='C08'&&state.phase>=3 && state.shell.broken)weight+=8;
      if(aid==='C07'&&state.phase>=3&&distance<125)weight+=6;
      if(state.shell.broken&&(aid==='C05'||aid==='C06'))weight+=5;
      if(recent.indexOf(aid)>=0)weight=Math.max(1,Math.floor(weight/3));
      if(aid==='C01'&&distance>130)weight=1;
      for(var t=0;t<weight;t++)picked.push(aid);
    }
    if(picked.length)return picked[state.rng.int(picked.length)];
  }
  return weighted.length?weighted[state.rng.int(weighted.length)]:null;
}

function setupAttack(state,id,world){ var a=state.config.attacks[id]; if(!a||!canUse(state,id)) return false; state.attack={id:id,t:0,total:a.tele+a.act+a.recover,meta:cloneAttackMeta(a),targetX:world.player.x,targetY:world.player.y,crystals:[],collision:false};state.safeLane=null;
  if(state.difficulty==='apex'){state.attackHistory.push(id);if(state.attackHistory.length>state.config.defaults.apexAttackMemory)state.attackHistory.shift();} state.mode='tele'; state.vx=0; state.vy=0;
  if(a.kind==='rush'){
    var ang=angleTo(state.x,state.y,world.player.x,world.player.y); var side=(state.rng.next()<0.5?-1:1)*0.5; ang+=side; var tx=state.x+Math.cos(ang)*a.reach, ty=state.y+Math.sin(ang)*a.reach; var c=clampArena(tx,ty,world.arena||state.config.defaults.arena,state.r+6); state.attack.targetX=c.x; state.attack.targetY=c.y; state.attack.dir=ang;
  }
  if(a.kind==='crystal'){
    var baseAng=angleTo(state.x,state.y,world.player.x,world.player.y); var n=state.config.defaults.crystalSpawnCount; for(var i=0;i<n;i++){ var off=(i-(n-1)/2)*0.36; var rr=82+20*i; var cpos=rot(rr,0,baseAng+off); var px=state.x+cpos.x, py=state.y+cpos.y; var cl=clampArena(px,py,world.arena||state.config.defaults.arena,18); if(!blockedByObstacle(state.x,state.y,cl.x,cl.y,world.obstacles||[],20)) state.attack.crystals.push({x:cl.x,y:cl.y}); }
  }
  if(a.kind==='crown'){
    var px0=world.player.x, py0=world.player.y, n0=6, gap=state.rng.int(n0);
    for(var ci=0;ci<n0;ci++){ if(ci===gap) continue; var ang0=ci/n0*Math.PI*2, ring=clampArena(px0+Math.cos(ang0)*86, py0+Math.sin(ang0)*86, world.arena||state.config.defaults.arena, 18); state.attack.crystals.push({x:ring.x,y:ring.y}); }
    state.attack.crownGap=gap/n0*Math.PI*2; state.attack.crownAt={x:px0,y:py0};
  }
  if(a.kind==='crystal')state.attack.crystals=apexLockedPattern(state,world,state.attack.crystals,id);
  if(a.kind==='burst')state.attack.fieldPoints=apexLockedPattern(state,world,fixedBurstPoints(state,world),id);
  return true;
}

// Apex Cragclaw has a real sequence controller: full tele/act/recover on EVERY attack.
// Sequences are chosen only between attacks; no moving safe-zone lottery mid-attack.
var HUNT_PLANS={
  1:[{id:'breakwater',name:'รุกคืบก้ามทลาย',moves:['C04','C01','C03','C02']},
     {id:'crosscut',name:'ไล่ต้อนเข้าก้าม',moves:['C03','C04','C01','C02']}],
  2:[{id:'shard-trap',name:'ไล่ล่าผลึกกัดกร่อน',moves:['C04','C06','C05','C02']},
     {id:'cutoff',name:'เฉือนทางหนี',moves:['C03','C04','C06','C05']},
     {id:'crown-ring',name:'มงกุฎปิดทาง',moves:['C04','C09','C06','C05']}],
  3:[{id:'abyss-spiral',name:'วังวนสังหาร',moves:['C04','C06','C05','C03','C08']},
     {id:'apex-pursuit',name:'ล่าจนก้ามฝัง',moves:['C03','C04','C07','C06','C08']},
     {id:'crown-hunt',name:'มงกุฎแล้วฝัง',moves:['C09','C04','C07','C08']}]
};
function huntView(state){var h=state.hunt;return {active:h.active,sequenceId:h.id,sequenceName:h.name,step:h.active?h.index+1:0,total:h.moves.length,next:h.active?h.moves[h.index]||null:null,state:h.mode,wait:Math.max(0,h.wait),opening:Math.max(0,h.opening),started:h.count,completed:h.completed};}
function clearHunt(state,cause,opening){var h=state.hunt;if(h.active&&cause!=='completed')state.pendingEvents.push({type:'hunt_cancelled',sequenceId:h.id,reason:cause});
 h.active=false;h.mode=opening?'opening':'idle';h.moves=[];h.index=0;h.id=null;h.name=null;h.wait=0;h.opening=opening||0;
 if(opening)state.attackCooldown=Math.max(state.attackCooldown,opening);
}
function beginHunt(state,world){var options=HUNT_PLANS[state.phase],viable=[];
 for(var i=0;i<options.length;i++){
  var list=options[i].moves.filter(function(id){return canUse(state,id);});
  if(list.length>=2)viable.push({id:options[i].id,name:options[i].name,moves:list});
 }
 if(!viable.length){var fallback=(state.phase>=2?['C04','C06']:['C04']);viable=[{id:'last-claw',name:'จังหวะสุดท้าย',moves:fallback}];}
 var plan=viable[state.rng.int(viable.length)];var h=state.hunt;
 h.active=true;h.id=plan.id;h.name=plan.name;h.moves=plan.moves.slice();h.index=0;h.wait=0;h.opening=0;h.mode='pursue';h.pursuitElapsed=0;h.count++;
 state.pendingEvents.push({type:'hunt_started',sequenceId:h.id,name:h.name,moves:h.moves.slice(),phase:state.phase});
}
function huntStep(state,dt,world){var h=state.hunt,d=state.config.defaults;
 if(h.opening>0){h.opening=Math.max(0,h.opening-dt);state.vx=state.vy=0;state.mode='opening';h.mode='opening';
   if(h.opening===0){h.mode='idle';state.attackCooldown=Math.max(state.attackCooldown,d.huntRestCooldown);}return true;}
 if(!h.active){if(state.attackCooldown>0)return false;beginHunt(state,world);}
 if(!h.active)return false;
 if(h.wait>0){h.wait=Math.max(0,h.wait-dt);h.mode='pursue';stepMove(state,dt,world);return true;}
 // Pursuit is bounded and can be stopped by interrupt, part breaks or stone impacts.
 var next=h.moves[h.index];if(!next||!canUse(state,next)){
  if(next&&!canUse(state,next)){h.index++;return true;}clearHunt(state,'invalid_sequence',d.huntFinalOpening);return true;
 }
 var dst=dist(state.x,state.y,world.player.x,world.player.y);
 if(dst>d.huntChaseRange&&h.pursuitElapsed<d.huntMaxChaseSeconds){
   h.pursuitElapsed+=dt;h.mode='pursue';stepMove(state,dt,world);return true;
 }
 if(setupAttack(state,next,world)){
  state.pendingEvents.push({type:'hunt_move',sequenceId:h.id,index:h.index+1,total:h.moves.length,attackId:next,telegraph:state.config.attacks[next].tele});
  h.mode='strike';h.pursuitElapsed=0;h.index++;
 }else{clearHunt(state,'setup_failure',d.huntFinalOpening);}
 return true;
}
function huntAttackFinished(state){var h=state.hunt;if(!h.active)return;
 if(h.index>=h.moves.length){h.completed++;var id=h.id;clearHunt(state,'completed',state.config.defaults.huntFinalOpening+(state.phase===3?state.config.defaults.huntPhase3RecoveryBonus:0));
  state.pendingEvents.push({type:'hunt_opening',sequenceId:id,duration:state.hunt.opening});
 }else{h.wait=state.config.defaults.huntBetweenMoves;h.mode='pursue';h.pursuitElapsed=0;
  state.pendingEvents.push({type:'hunt_reposition',sequenceId:h.id,next:h.moves[h.index],wait:h.wait});
 }
}
function updatePhase(state){ var hpf=state.hp/state.maxHp; state.phase = hpf<=state.config.defaults.phaseHpFractions[1] ? 3 : (hpf<=state.config.defaults.phaseHpFractions[0] ? 2 : 1); }

function impactRush(state,world,dt){
  var atk=state.attack, obs=world.obstacles||[], arena=world.arena||state.config.defaults.arena;
  var vx=Math.cos(atk.dir)*state.config.defaults.sideRushSpeed;
  var vy=Math.sin(atk.dir)*state.config.defaults.sideRushSpeed;
  var nx=state.x+vx*dt, ny=state.y+vy*dt, earliest=1.01, hit=null;
  for(var i=0;i<obs.length;i++){
    var o=obs[i], t=sweptContact(state.x,state.y,nx,ny,state.r,o.x,o.y,o.r+state.config.defaults.obstacleClearance);
    if(t.hit && t.t<earliest){earliest=Math.max(0,t.t);hit={type:'stone',obstacle:i,x:o.x,y:o.y};}
  }
  // Exact ray vs circular arena interior boundary; clamp before actor crosses edge.
  var ax=state.x-arena.cx, ay=state.y-arena.cy, dx=nx-state.x,dy=ny-state.y;
  var max=arena.r-state.r-6;
  var A=dx*dx+dy*dy, B=2*(ax*dx+ay*dy), C=ax*ax+ay*ay-max*max;
  if(A>1e-12){var disc=B*B-4*A*C;if(disc>=0){var tEdge=(-B+Math.sqrt(disc))/(2*A);if(tEdge>=0&&tEdge<=1&&tEdge<earliest){earliest=tEdge;hit={type:'arena'};}}}
  if(hit){
    var allowed=Math.max(0,earliest-0.001);
    var pt=clampArena(state.x+dx*allowed,state.y+dy*allowed,arena,state.r+6);
    state.x=pt.x;state.y=pt.y;state.vx=state.vy=0;
    state.attack=null;clearHunt(state,'stone_impact',0);state.stagger=state.config.defaults.stoneImpactStagger;state.staggerDuration=state.stagger;state.staggerElapsed=0;state.staggerSource=hit.type;state.mode='stagger';
    state.pendingEvents.push({type:'rush_impact',source:'C04',surface:hit.type,obstacleIndex:hit.obstacle===undefined?null:hit.obstacle,opening:state.stagger,x:state.x,y:state.y});
    return true;
  }
  state.vx=vx;state.vy=vy;state.x=nx;state.y=ny;return false;
}
function stepAttack(state,dt,world){ var a=state.config.attacks[state.attack.id], atk=state.attack; atk.t += dt; if(atk.t<a.tele){ state.mode='tele'; if(a.kind==='rush'){ state.dir = atk.dir; } else { state.dir += normAng(angleTo(state.x,state.y,world.player.x,world.player.y)-state.dir)*Math.min(1,dt*state.turn*1.3); } return; }
  if(atk.t<a.tele+a.act){ state.mode='act'; if(a.kind==='rush'){
      var dir=atk.dir, speed=state.config.defaults.sideRushSpeed; state.vx=Math.cos(dir)*speed; state.vy=Math.sin(dir)*speed; if(impactRush(state,world,dt)) return;
    } else { state.vx=state.vy=0; }
    return; }
  state.mode='recover'; state.vx=state.vy=0; if(!atk.fieldSpawned){spawnField(state,atk,world);atk.fieldSpawned=true;} if(atk.t>=atk.total){ state.cooldowns[a.id]=a.recover + 0.28 + state.rng.next()*0.25; state.attack=null; state.mode='idle'; huntAttackFinished(state); }
}

function stepMove(state,dt,world){
  var p=world.player||{x:480,y:312};
  var facing=angleTo(state.x,state.y,p.x,p.y);
  var distance=dist(state.x,state.y,p.x,p.y);
  var locomotion=state.locomotion, settings=state.config.defaults;
  state.dir+=normAng(facing-state.dir)*Math.min(1,dt*state.turn);
  locomotion.switchIn-=dt;
  if(locomotion.switchIn<=0){
    // Stable seed-controlled patrol: changes only outside committed attacks.
    locomotion.strafeSign = -locomotion.strafeSign;
    locomotion.switchIn+=settings.strafeCycleSeconds;
  }
  // Crab translation is predominantly lateral while keeping its face toward the target.
  var radial = distance-(state.difficulty==='apex'?settings.apexPreferredDistance:settings.strafePreferredDistance);
  var toward=radial>settings.strafeDeadZone?1:(radial< -settings.strafeDeadZone?-1:0);
  var lateralX=-Math.sin(facing)*locomotion.strafeSign;
  var lateralY=Math.cos(facing)*locomotion.strafeSign;
  var vx=lateralX*settings.strafeLateralFactor + Math.cos(facing)*toward*settings.strafeApproachFactor;
  var vy=lateralY*settings.strafeLateralFactor + Math.sin(facing)*toward*settings.strafeApproachFactor;
  var length=len(vx,vy)||1;
  var actualSpeed=state.speed*(state.difficulty==='apex'?settings.apexMoveMultiplier*(state.shell.broken?settings.apexShellBrokenMoveMultiplier:1):1);
  state.vx=vx/length*actualSpeed;state.vy=vy/length*actualSpeed;
  var oldx=state.x,oldy=state.y;
  resolveMotion(state,dt,world);
  var travelled=dist(oldx,oldy,state.x,state.y);
  locomotion.distanceTravelled+=travelled;
  locomotion.gaitPhase+=travelled/16.0;
  locomotion.sideMotion=clamp((-state.vx*Math.sin(state.dir)+state.vy*Math.cos(state.dir))/state.speed,-1,1);
  locomotion.speedFraction=clamp(travelled/(Math.max(0.00001,dt)*state.speed),0,1);
  state.mode='chase';
}

function decideWhiffCounter(state,world){
  // A confirmed host event, NEVER a prediction of the player's next movement.
  // actionSerial is mandatory to guarantee exactly-once consumption per whiff.
  var p=world.player, options=state.config.defaults;
  if(!options.reactiveCounter||!p||p.action!=='heavy_whiff'||!Number.isFinite(p.actionSerial))return false;
  if(p.actionSerial===state.lastWhiffSerial)return false;
  state.lastWhiffSerial=p.actionSerial;
  if(state.counterCooldown>0||state.attackCooldown>0||state.stagger>0||state.hunt.active||state.hunt.opening>0)return false;
  if(dist(state.x,state.y,p.x,p.y)>options.counterMaxRange)return false;
  var id=!state.parts.pincer.broken?'C03':(!state.parts.crusher.broken?'C02':'C04');
  if(!canUse(state,id))return false;
  if(!setupAttack(state,id,world))return false;
  state.counterCooldown=options.counterCooldown;
  state.attackCooldown=options.startAttackCooldown;
  state.pendingEvents.push({type:'reactive_counter',source:'confirmed_heavy_whiff',actionSerial:p.actionSerial,attackId:id,telegraph:state.config.attacks[id].tele});
  return true;
}
function decayCooldowns(state,dt){ for(var k in state.cooldowns){ state.cooldowns[k]=Math.max(0,state.cooldowns[k]-dt); } state.attackCooldown=Math.max(0,state.attackCooldown-dt);state.counterCooldown=Math.max(0,state.counterCooldown-dt); }

function snapshot(state,extra){ var attackState=null; if(state.attack){ var a=state.config.attacks[state.attack.id], total=a.tele+a.act+a.recover; attackState={id:a.id,name:a.name,t:state.attack.t,phase:state.attack.t<a.tele?'tele':(state.attack.t<a.tele+a.act?'act':'recover'),progress:clamp(state.attack.t/total,0,1),tele:a.tele,act:a.act,recover:a.recover,damage:state.difficulty==='apex'?Math.min(45,Math.round(a.damage*state.config.defaults.apexDamageMultiplier)):a.damage,hits:a.hits,minHitGap:a.minHitGap,parry:a.parry,crownGap:state.attack.crownGap,crownX:state.attack.crownAt?state.attack.crownAt.x:null,crownY:state.attack.crownAt?state.attack.crownAt.y:null}; }
  return {version:state.config.version,name:state.config.name,variant:state.variant,difficulty:state.difficulty,hunt:huntView(state),attackHistory:state.attackHistory.slice(),safeLane:state.safeLane?deepCopy(state.safeLane):null,x:state.x,y:state.y,dir:state.dir,mode:state.mode,phase:state.phase,hp:state.hp,maxHp:state.maxHp,r:state.r,attack:attackState,hurtboxes:buildLocalHurtboxes(state),partHurtboxes:partHurtboxes(state),parts:copyParts(state),shell:shellSnapshot(state),hazards:state.hazards.map(function(h){return {id:h.id,sourceId:h.sourceId,x:h.x,y:h.y,r:h.r,age:h.age,duration:h.duration,windup:h.windup,tickGap:h.tickGap,damage:h.damage,active:h.age>=h.windup,parry:false};}),staggerRemaining:state.stagger,staggerVisual:computeStaggerVisual(state),tactic:tacticalStyle(state),locomotion:{sideMotion:state.locomotion.sideMotion,speedFraction:state.locomotion.speedFraction,gaitPhase:state.locomotion.gaitPhase,distanceTravelled:state.locomotion.distanceTravelled,strafeSign:state.locomotion.strafeSign},events:(extra&&extra.events)||[],attackHitboxes:(extra&&extra.attackHitboxes)||[],telegraphs:(extra&&extra.telegraphs)||[],pose:Object.assign({bodyBob:Math.sin(state.animT*4)*0.03,clawOpen:state.attack?0.8:0.22},(extra&&extra.pose)||{}, {claws:computeClawPose(state)}),tNow:(extra&&extra.tNow)||0};
}

function createInstance(opts){ opts=opts||{}; var cfg=opts.config||Config; var variant='apex'; var v=cfg.variants[variant]; var rng=makeRng(opts.seed||1); var arena=cfg.defaults.arena;var apexHp=Math.round(v.baseHp*cfg.defaults.apexHpMultiplier);
  var state={config:cfg,variant:variant,difficulty:'apex',hunt:{active:false,id:null,name:null,moves:[],index:0,wait:0,opening:0,mode:'idle',pursuitElapsed:0,count:0,completed:0},attackHistory:[],safeLane:null,rng:rng,x:arena.cx+100,y:arena.cy,dir:Math.PI,speed:v.speed,turn:v.turn,r:v.r,hp:apexHp,maxHp:apexHp,phase:1,mode:'idle',attack:null,stagger:0,staggerDuration:0,staggerElapsed:0,staggerSource:null,parts:{crusher:{hp:cfg.defaults.crusherClawHp,maxHp:cfg.defaults.crusherClawHp,broken:false},pincer:{hp:cfg.defaults.pincerClawHp,maxHp:cfg.defaults.pincerClawHp,broken:false}},shell:{hp:cfg.defaults.shellHp,maxHp:cfg.defaults.shellHp,broken:false},hazards:[],hazardSerial:0,pendingEvents:[],visualPulses:{crusher:0,pincer:0},locomotion:{strafeSign:rng.next()<0.5?-1:1,switchIn:cfg.defaults.strafeCycleSeconds,gaitPhase:0,distanceTravelled:0,sideMotion:0,speedFraction:0},cooldowns:{},attackCooldown:0.6,counterCooldown:0,lastWhiffSerial:null,vx:0,vy:0,animT:0,lastFrame:null,interruptCount:0};
  function step(dt,world){ world=world||{}; world.player=world.player||{x:arena.cx,y:arena.cy,r:14,vx:0,vy:0}; world.arena=world.arena||cfg.defaults.arena; world.obstacles=world.obstacles||[]; var remain=clamp(dt,0.0001,0.12); while(remain>0){ var sub=Math.min(remain,cfg.defaults.maxSubstep); remain-=sub; state.animT+=sub; for(var partKey in state.visualPulses)state.visualPulses[partKey]=Math.max(0,state.visualPulses[partKey]-sub);decayCooldowns(state,sub); ageHazards(state,sub); updatePhase(state); if(state.stagger>0){state.stagger=Math.max(0,state.stagger-sub);state.staggerElapsed+=sub;state.mode=state.stagger>0?'stagger':'idle';state.vx=state.vy=0;} else if(state.attack) stepAttack(state,sub,world); else {
        if(cfg.defaults.aiEnabled){ if(state.hunt.active||state.hunt.opening>0){huntStep(state,sub,world);} else if(!decideWhiffCounter(state,world)){huntStep(state,sub,world);if(!state.hunt.active&&state.hunt.opening===0)stepMove(state,sub,world);} }
      }
    }
    var attackHitboxes=computeAttackHitboxes(state,world,dt); var telegraphs=computeTelegraphs(state,world); var pose={bodyBob:(state.attack||state.stagger>0)?0:Math.sin(state.locomotion.gaitPhase*2)*0.022*state.locomotion.speedFraction,clawOpen:state.attack?(state.mode==='tele'?0.45:0.85):0.18,legCycle:state.locomotion.gaitPhase,shellTilt:state.mode==='recover'?0.08:(state.mode==='stagger'?0.14:0),lateral:state.mode==='chase'?state.locomotion.sideMotion:0,gaitWeight:state.mode==='chase'?state.locomotion.speedFraction:0,limp:state.parts.crusher.broken?0.30:(state.parts.pincer.broken?0.16:0)};
    state.lastFrame=snapshot(state,{attackHitboxes:attackHitboxes,telegraphs:telegraphs,pose:pose,events:state.pendingEvents.slice(),tNow:world.tNow||0});state.pendingEvents=[]; return state.lastFrame;
  }
  function beginAttack(id,world){ clearHunt(state,'manual_attack',0); world=world||{player:{x:state.x+100,y:state.y,r:14},arena:cfg.defaults.arena,obstacles:[]}; return setupAttack(state,id,world); }
  function interrupt(){ clearHunt(state,'interrupt',0);state.attackCooldown=Math.max(state.attackCooldown,0.85); state.safeLane=null;state.attack=null; state.stagger=0;state.staggerDuration=0;state.staggerElapsed=0;state.staggerSource=null;state.pendingEvents=[];state.vx=state.vy=0; state.mode='idle'; state.attackCooldown=Math.max(state.attackCooldown,0.35); state.interruptCount++; state.lastFrame=snapshot(state,{attackHitboxes:[],telegraphs:[],pose:{bodyBob:0,clawOpen:0.2,legCycle:0,shellTilt:0}}); return state.lastFrame; }
  function getLastFrame(){ return state.lastFrame || snapshot(state,{attackHitboxes:[],telegraphs:[],pose:{bodyBob:0,clawOpen:0.2,legCycle:0,shellTilt:0}}); }
  function damagePart(id,amount){
    var part=state.parts[id];if(!part) return null;
    if(part.broken) return {id:id,hp:0,maxHp:part.maxHp,broken:true};
    var damage=Math.max(0,Number(amount)||0);
    part.hp=Math.max(0,part.hp-damage);if(damage>0)state.visualPulses[id]=state.config.defaults.damagedClawVisualPulse;
    if(part.hp===0){part.broken=true;clearHunt(state,'part_broken',0);state.attack=null;state.mode='stagger';state.stagger=state.config.defaults.clawBreakStagger;state.staggerDuration=state.stagger;state.staggerElapsed=0;state.staggerSource='claw';
      state.pendingEvents.push({type:'part_broken',part:id,opening:state.stagger});}
    state.lastFrame=snapshot(state,{events:state.pendingEvents.slice()});
    return {id:id,hp:part.hp,maxHp:part.maxHp,broken:part.broken};
  }
  function damageShell(amount){
    var p=state.shell, damage=Math.max(0,Number(amount)||0);
    if(p.broken)return shellSnapshot(state);
    p.hp=Math.max(0,p.hp-damage);
    if(p.hp===0){p.broken=true;clearHunt(state,'shell_broken',0);state.attack=null;state.mode='stagger';state.vx=state.vy=0;
      state.stagger=state.config.defaults.shellBreakStagger;state.staggerDuration=state.stagger;
      state.staggerElapsed=0;state.staggerSource='shell';
      state.pendingEvents.push({type:'shell_broken',zone:'flank',opening:state.stagger});
    }else if(damage>0){state.pendingEvents.push({type:'shell_damaged',remaining:p.hp,stage:shellSnapshot(state).fractureStage});}
    state.lastFrame=snapshot(state,{events:state.pendingEvents.slice()});return shellSnapshot(state);
  }
  function applyDamage(amount){ var raw=Math.max(0,amount||0); if(!state.shell.broken) raw*=0.8; state.hp=Math.max(0,state.hp-raw); updatePhase(state); return state.hp; }
  function setHp(v){ state.hp=clamp(v,0,state.maxHp); updatePhase(state); return state.hp; }
  return {step:step,beginAttack:beginAttack,interrupt:interrupt,damagePart:damagePart,damageShell:damageShell,snapshot:getLastFrame,getLastFrame:getLastFrame,applyDamage:applyDamage,setHp:setHp,getState:function(){return state;}};
}

return {version:(Config&&Config.version)||'1.0',createInstance:createInstance,hurtboxes:buildLocalHurtboxes,sweptContact:sweptContact,partHurtboxes:partHurtboxes};
});
